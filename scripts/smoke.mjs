// Interaction smoke test in headless chromium (SwiftShader).
// Usage: node scripts/smoke.mjs [url]   (default: the deployed app http://10.77.0.2:8050/; pass "dev" to start vite)
// Checks: no console errors, reload survives, phone emulation picks Low (adaptive DPR start 2, no post RTs), memory soak stays flat (SOAK_S env, default 120; 0 skips), preset chips, drift, journey keyframes + interpolation, hand-set values winning over journey/drift (mouse + touch), H/C keys, cinema camera motion.
import { spawn } from 'node:child_process';
import { chromium } from 'playwright-core';

let url = process.argv[2] ?? 'http://10.77.0.2:8050/';
let vite;
if (url === 'dev') {
  const PORT = Number(process.env.PORT ?? 5198);
  vite = spawn('npx', ['vite', '--port', String(PORT), '--strictPort'], { stdio: ['ignore', 'pipe', 'inherit'] });
  await new Promise((res) => vite.stdout.on('data', (d) => String(d).includes('Local') && res()));
  url = `http://localhost:${PORT}/`;
}

const results = [];
const check = (name, ok, detail = '') => { results.push({ name, ok }); console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? '  ' + detail : ''}`); };
const errors = [];

const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM ?? '/usr/sbin/chromium',
  // SMOKE_GPU=vulkan runs on the real GPU (as profile.mjs does): on a loaded host SwiftShader frames take seconds and
  // Playwright's click-stability check times out.
  args: process.env.SMOKE_GPU
    ? ['--headless=new', '--use-gl=angle', `--use-angle=${process.env.SMOKE_GPU}`, '--enable-gpu', '--ignore-gpu-blocklist', '--enable-precise-memory-info']
    : ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--enable-precise-memory-info'],
});
try {
  const page = await browser.newPage({ viewport: { width: 1024, height: 640 } });
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  page.on('pageerror', (e) => errors.push(e.message));
  // Low quality keeps SwiftShader frame times sane; the app path under test is the same.
  await page.goto(`${url}?quality=Low`);
  await page.waitForFunction(() => window.__arbor !== undefined, null, { timeout: 30000 });
  await page.waitForTimeout(1500);
  check('loads without console errors', errors.length === 0, errors.slice(0, 3).join(' | '));

  // Presets via the panel chips (Grow tab).
  const tab = (id) => page.locator(`[data-tab="${id}"]`).click();
  const chip = (n) => page.locator(`.ap-chip[data-preset="${n}"]`);
  const pick = async (n) => { await tab('grow'); await chip(n).click(); };
  await tab('grow');
  const names = await page.locator('.ap-chip').evaluateAll((els) => els.map((e) => e.dataset.preset));
  check('preset chips list presets', names.length >= 8, `${names.length} chips`);
  for (const n of names) {
    const before = errors.length;
    await chip(n).click();
    const info = await page.evaluate(() => window.__arbor.fastForward(12));
    const ov = await page.evaluate(() => ({ g: window.__arbor.params.growth.gravity, sim: window.__arbor.sim.time }));
    check(`preset "${n}" grows`, info.nodes > 5 && errors.length === before && ov.sim < 20, `nodes=${info.nodes} t=${ov.sim.toFixed(1)} gravity=${ov.g.toFixed(2)}`);
  }

  // A value set by hand wins: drag the Gravity slider with the mouse while a journey keys gravity, then while it drifts.
  const gravity = () => page.evaluate(() => window.__arbor.params.growth.gravity);
  const dragGravity = async (frac) => {
    await tab('shape');
    const sl = page.locator('input[data-param="growth.gravity"]');
    await sl.scrollIntoViewIfNeeded();
    const b = await sl.boundingBox();
    await page.mouse.move(b.x + b.width * 0.5, b.y + b.height / 2);
    await page.mouse.down();
    await page.mouse.move(b.x + b.width * frac, b.y + b.height / 2, { steps: 6 });
    await page.mouse.up();
  };
  const driftBtn = page.locator('[data-drift="growth.gravity"]');
  {
    await pick('Journey: Earth → alien');
    await page.evaluate(() => window.__arbor.fastForward(30)); // inside the 25 s → 75 s gravity ramp
    await dragGravity(0.85);
    const g1 = await gravity();
    await page.waitForTimeout(3000);
    const g2 = await gravity();
    const keyed = await page.evaluate(() => window.__arbor.automation.journey.some((k) => 'growth.gravity' in k.values));
    check('hand-set gravity sticks for 3 s with a journey active', g1 > 2 && Math.abs(g2 - g1) < 1e-9 && !keyed, `set=${g1.toFixed(3)} after3s=${g2.toFixed(3)} stillKeyed=${keyed}`);
    await pick('Oak meadow');
    await tab('shape');
    await driftBtn.click();
    await page.evaluate(() => { window.__arbor.automation.drift['growth.gravity'].rate = 0.2; window.__arbor.fastForward(3); });
    await dragGravity(0.2);
    const d1 = await gravity();
    await page.waitForTimeout(3000);
    const d2 = await gravity();
    const pressed = await driftBtn.getAttribute('aria-pressed');
    check('hand-set gravity sticks for 3 s with drift on', d1 < 0.9 && Math.abs(d2 - d1) < 1e-9 && pressed === 'false', `set=${d1.toFixed(3)} after3s=${d2.toFixed(3)} driftPressed=${pressed}`);
  }
  await pick('Oak meadow');
  await tab('shape');

  // Drift on gravity (default selected drift param) via the GUI checkbox.
  await page.evaluate(() => { window.__arbor.params.growth.gravity = 1; });
  await driftBtn.click();
  // Fast rate so a few sim seconds show movement.
  await page.evaluate(() => { window.__arbor.automation.drift['growth.gravity'].rate = 0.2; });
  const gs = [];
  for (let i = 0; i < 6; i++) gs.push(await page.evaluate(() => { window.__arbor.fastForward(1.5); return window.__arbor.params.growth.gravity; }));
  const spread = Math.max(...gs) - Math.min(...gs);
  check('drift moves gravity over time', spread > 0.02, gs.map((g) => g.toFixed(3)).join(','));
  await driftBtn.click();
  const gOff = await page.evaluate(() => window.__arbor.params.growth.gravity);
  check('drift off restores base', Math.abs(gOff - 1) < 1e-6, `gravity=${gOff}`);

  // Journey: two keyframes via the GUI button, then interpolation.
  await tab('more');
  await page.locator('#arbor-panel summary', { hasText: 'Changes over time' }).click();
  const addKf = page.locator('#arbor-add-keyframe');
  await page.locator('#arbor-clear-journey').click();
  await page.evaluate(() => { window.__arbor.params.growth.gravity = 1; window.__arbor.params.leaves.hue = 0.3; });
  await addKf.click();
  await page.evaluate(() => { window.__arbor.fastForward(10); window.__arbor.params.growth.gravity = 0.2; window.__arbor.params.leaves.hue = 0.9; });
  await addKf.click();
  const kfInfo = await page.locator('#arbor-journey-info').textContent();
  const jr = await page.evaluate(() => {
    const A = window.__arbor.automation, P = window.__arbor.params;
    const [a, b] = A.journey.map((k) => k.t); // keyframe times as recorded (the sim keeps growing in real time)
    const at = (t) => { A.apply(t); return P.growth.gravity; };
    return { n: A.journey.length, start: at(a), mid: at((a + b) / 2), end: at(b), after: at(b + 50) };
  });
  check('two keyframes recorded', jr.n === 2, `gui="${kfInfo}"`);
  check('journey interpolates', Math.abs(jr.start - 1) < 1e-6 && Math.abs(jr.mid - 0.6) < 1e-3 && Math.abs(jr.end - 0.2) < 1e-6 && Math.abs(jr.after - 0.2) < 1e-6,
    `start=${jr.start.toFixed(3)} mid=${jr.mid.toFixed(3)} end=${jr.end.toFixed(3)} after=${jr.after.toFixed(3)}`);
  await page.locator('#arbor-clear-journey').click();

  // Keys: H hides UI, C toggles cinema (focus is still on a GUI button: keys must work there too).
  await page.keyboard.press('h');
  const hidden = await page.evaluate(() => document.body.classList.contains('watch') && getComputedStyle(document.querySelector('#arbor-panel')).display === 'none');
  await page.keyboard.press('h');
  const shown = await page.evaluate(() => !document.body.classList.contains('watch'));
  check('H hides and restores UI', hidden && shown);
  const c0 = await page.evaluate(() => window.__arbor.params.camera.cinema);
  await page.keyboard.press('c');
  const c1 = await page.evaluate(() => window.__arbor.params.camera.cinema);
  await page.keyboard.press('c');
  const c2 = await page.evaluate(() => window.__arbor.params.camera.cinema);
  check('C toggles cinema', c0 === true && c1 === false && c2 === true);

  // Cinema camera moves while idle (real frames, ~3 s).
  const p0 = await page.evaluate(() => window.__arbor.stage.camera.position.toArray());
  await page.waitForTimeout(3000);
  const p1 = await page.evaluate(() => window.__arbor.stage.camera.position.toArray());
  const moved = Math.hypot(p1[0] - p0[0], p1[1] - p0[1], p1[2] - p0[2]);
  check('cinema camera moves while idle', moved > 0.02, `moved ${moved.toFixed(3)} m`);

  // Tree stays in view: crown bounding sphere inside the frustum.
  const inView = await page.evaluate(() => {
    const { sim, stage } = window.__arbor;
    window.__arbor.fastForward(60);
    const cam = stage.camera; cam.updateMatrixWorld();
    const mn = sim.bboxMin, mx = sim.bboxMax;
    let ok = 0;
    const V = cam.position.constructor;
    for (const x of [mn[0], mx[0]]) for (const y of [mn[1], mx[1]]) for (const z of [mn[2], mx[2]]) {
      const v = new V(x, y, z).project(cam);
      if (Math.abs(v.x) <= 1.05 && Math.abs(v.y) <= 1.05) ok++;
    }
    return ok;
  });
  check('auto-frame keeps crown bbox in view', inView === 8, `${inView}/8 corners`);

  // A view set by hand stays put: real mouse orbit + wheel zoom, then 15 s of growth, day cycle and panel use.
  const camPose = (pg) => pg.evaluate(() => { const s = window.__arbor.stage; return { p: s.camera.position.toArray(), t: s.controls.target.toArray(), manual: s.manual, btn: !document.querySelector('#arbor-auto-camera').hidden }; });
  const camDelta = (a, b) => Math.max(Math.hypot(...a.p.map((v, i) => v - b.p[i])), Math.hypot(...a.t.map((v, i) => v - b.t[i])));
  // OrbitControls damping lets the gesture glide out for a moment (longer at low frame rates): wait until it is at rest.
  const camSettled = async (pg) => {
    let a = await camPose(pg);
    for (let i = 0; i < 40; i++) { await pg.waitForTimeout(500); const b = await camPose(pg); if (camDelta(a, b) < 1e-6) return b; a = b; }
    return a;
  };
  {
    const pre = await camPose(page);
    await page.mouse.move(300, 250); await page.mouse.down(); await page.mouse.move(460, 300, { steps: 10 }); await page.mouse.up();
    await page.mouse.wheel(0, -300);
    const h0 = await camSettled(page);
    await tab('sky'); await tab('grow');
    await page.waitForTimeout(15000);
    const h1 = await camPose(page);
    check('hand-set view (mouse orbit + wheel) unchanged after 15 s, Auto camera button shown', !pre.manual && !pre.btn && h0.manual && h0.btn && camDelta(pre, h0) > 0.5 && camDelta(h0, h1) < 1e-3 && h1.manual,
      `input moved ${camDelta(pre, h0).toFixed(2)} m, drift over 15 s ${camDelta(h0, h1).toExponential(1)} m`);
    // Per-frame camera steps over the 4 s after the click: a jump would put most of the path into one frame.
    const ease = await page.evaluate(() => new Promise((res) => {
      const cam = window.__arbor.stage.camera, last = cam.position.clone(), t0 = performance.now();
      let path = 0, maxStep = 0, first = -1, frames = 0;
      document.querySelector('#arbor-auto-camera').click();
      const tick = () => {
        const d = cam.position.distanceTo(last); last.copy(cam.position);
        if (first < 0) first = d;
        path += d; maxStep = Math.max(maxStep, d); frames++;
        if (performance.now() - t0 < 4000) requestAnimationFrame(tick); else res({ path, maxStep, first, frames });
      };
      requestAnimationFrame(tick);
    }));
    const e1 = await camPose(page);
    check('Auto camera button resumes the automatic camera with an ease (no jump), then hides', !e1.manual && !e1.btn && ease.path > 0.05 && ease.frames > 30 && ease.maxStep < 0.1 * ease.path && ease.first < 0.02 * ease.path,
      `path ${ease.path.toFixed(2)} m over ${ease.frames} frames, largest frame step ${ease.maxStep.toFixed(3)} m, first ${ease.first.toFixed(4)} m`);
    await page.mouse.move(300, 250); // back over the canvas (the pointer was left on a panel tab)
    await page.mouse.wheel(0, -200);
    await page.waitForTimeout(300);
    const m1 = await camPose(page);
    await page.keyboard.press('c');
    const m2 = await camPose(page);
    await page.mouse.wheel(0, -200);
    await page.waitForTimeout(300);
    const m3 = await camPose(page);
    await page.locator('#arbor-regrow').click();
    const m4 = await camPose(page);
    check('C key and a new tree (regrow) both return to the automatic camera', m1.manual && !m2.manual && m3.manual && !m4.manual && (await page.evaluate(() => window.__arbor.params.camera.cinema)), JSON.stringify([m1.manual, m2.manual, m3.manual, m4.manual]));
  }

  check('no console errors overall', errors.length === 0, errors.slice(0, 3).join(' | '));

  // Reload twice (hot cache: 304s) after changing preset/params: the app must come back with a running loop.
  await pick(names[names.length - 1]);
  for (let i = 0; i < 2; i++) {
    const before = errors.length;
    await page.reload();
    await page.waitForFunction(() => window.__arbor !== undefined, null, { timeout: 30000 });
    const t0 = await page.evaluate(() => window.__arbor.sim.time);
    await page.waitForTimeout(1500);
    const t1 = await page.evaluate(() => ({ t: window.__arbor.sim.time, fe: window.__arbor.frameErrors() }));
    check(`reload ${i + 1} runs`, errors.length === before && t1.t > t0 && t1.fe === 0, `sim ${t0.toFixed(2)}→${t1.t.toFixed(2)} frameErrors=${t1.fe}`);
  }
  // Junk query values must not poison params with NaN.
  await page.goto(`${url}?quality=Low&t=abc&speed=xyz`);
  await page.waitForFunction(() => window.__arbor !== undefined, null, { timeout: 30000 });
  const junk = await page.evaluate(() => ({ s: window.__arbor.params.time.speed, t: window.__arbor.sim.time }));
  check('junk query values ignored', Number.isFinite(junk.s) && Number.isFinite(junk.t), JSON.stringify(junk));

  // The desktop page keeps rendering a grown tree; on SwiftShader every page shares one GPU process, so a live
  // background page starves the next one (navigations then take 60 s+). Close it; each phone step gets a fresh context.
  await page.close();

  // Android phone emulation (412x915 @ DPR 3, mobile UA): auto-Low, adaptive DPR (starts at 2, may step down to 1 on SwiftShader), no post render targets, 1024 shadow map.
  const phone = async (q, opts = {}) => {
    const ctx = await browser.newContext({ viewport: { width: 412, height: 915 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true,
      userAgent: 'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Mobile Safari/537.36' });
    const mp = await ctx.newPage();
    const merr = [];
    mp.on('pageerror', (e) => merr.push(e.message));
    const t0 = Date.now();
    await mp.goto(url + q, { waitUntil: 'domcontentloaded', timeout: opts.timeout ?? 30000 });
    await mp.waitForFunction(() => window.__arbor !== undefined, null, { timeout: 30000 });
    return { ctx, mp, merr, loadMs: Date.now() - t0 };
  };
  const leafState = (mp) => mp.evaluate(() => { const A = window.__arbor; A.fastForward(15); const m = A.leaves.mesh; return { type: m.material.type, cast: m.castShadow, n: m.count, fe: A.frameErrors() }; });
  {
    const { ctx, mp, merr, loadMs } = await phone('');
    await mp.waitForTimeout(6000);
    const mob = await mp.evaluate(() => { const A = window.__arbor, r = A.stage.renderer; return { q: A.params.sky.quality, dpr: r.getPixelRatio(), post: !!A.stage._post, shadow: A.stage.sun.shadow.mapSize.x, maxNodes: A.params.growth.maxNodes, fe: A.frameErrors() }; });
    check('phone: auto Low, DPR in [1,2], no post RTs, small shadow map', mob.q === 'Low' && mob.dpr >= 1 && mob.dpr <= 2 && !mob.post && mob.shadow === 1024 && mob.fe === 0 && merr.length === 0, `${JSON.stringify(mob)} load ${loadMs} ms`);
    // Leaf modes: phone defaults to the safe leaf path; ?leafsafe=1/0 and ?leafshader=basic force it; leaves render, no errors.
    const lm = await leafState(mp);
    check('phone: safe leaves by default (Lambert, no shadow), leaves drawn', lm.type === 'MeshLambertMaterial' && !lm.cast && lm.n > 0 && lm.fe === 0, JSON.stringify(lm));
    await ctx.close();
  }
  // Phone, real touch: open the bottom sheet, drag Gravity while the journey keys it. The value must stick, the page
  // must not scroll and the camera must not take the gesture.
  {
    const { ctx, mp, merr } = await phone('?preset=' + encodeURIComponent('Journey: Earth → alien'));
    await mp.waitForTimeout(1500);
    const closed = await mp.evaluate(() => !document.querySelector('#arbor-panel').classList.contains('open'));
    await mp.tap('#arbor-panel-open');
    await mp.tap('[data-tab="shape"]');
    const sl = mp.locator('input[data-param="growth.gravity"]');
    await sl.scrollIntoViewIfNeeded();
    const b = await sl.boundingBox();
    const cdp = await ctx.newCDPSession(mp);
    const y = b.y + b.height / 2, x0 = b.x + b.width / 3, x1 = b.x + b.width * 0.85;
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: x0, y }] });
    for (let i = 1; i <= 8; i++) { await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: x0 + ((x1 - x0) * i) / 8, y }] }); await mp.waitForTimeout(30); }
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    const st = () => mp.evaluate(() => ({ g: window.__arbor.params.growth.gravity, sy: document.scrollingElement.scrollTop, af: window.__arbor.params.camera.autoFrame }));
    const t1 = await st();
    await mp.waitForTimeout(3000);
    const t2 = await st();
    const box = await mp.locator('#arbor-panel').boundingBox();
    check('phone: sheet closed at start, touch-dragged gravity sticks 3 s under a journey, no page scroll, camera untouched',
      closed && t1.g > 2 && Math.abs(t2.g - t1.g) < 1e-9 && t2.sy === 0 && t2.af === true && merr.length === 0 && box.y > 915 * 0.4,
      `set=${t1.g.toFixed(3)} after3s=${t2.g.toFixed(3)} scrollTop=${t2.sy} autoFrame=${t2.af} sheetTop=${box.y.toFixed(0)}`);
    await ctx.close();
  }
  // Phone camera: one-finger orbit + pinch zoom set the view; it holds for 15 s while the sheet is opened and used;
  // the Auto camera button is reachable with the sheet open (not covered by it) and resumes the automatic camera.
  {
    const { ctx, mp, merr } = await phone('');
    await mp.waitForTimeout(1500);
    const cdp = await ctx.newCDPSession(mp);
    const T = (type, pts) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: pts.map(([x, y], id) => ({ x, y, id })) });
    const pre = await camPose(mp);
    await T('touchStart', [[120, 300]]);
    for (let i = 1; i <= 8; i++) { await T('touchMove', [[120 + i * 15, 300 + i * 4]]); await mp.waitForTimeout(30); }
    await T('touchEnd', []);
    await mp.waitForTimeout(300);
    await T('touchStart', [[180, 350], [230, 350]]);
    for (let i = 1; i <= 8; i++) { await T('touchMove', [[180 - i * 6, 350], [230 + i * 6, 350]]); await mp.waitForTimeout(30); }
    await T('touchEnd', []);
    const h0 = await camSettled(mp);
    await mp.tap('#arbor-panel-open');
    await mp.tap('[data-tab="sky"]');
    await mp.tap('[data-tab="shape"]');
    await mp.waitForTimeout(15000);
    const h1 = await camPose(mp);
    const zoomed = Math.hypot(...h0.p.map((v, i) => v - h0.t[i])) / Math.hypot(...pre.p.map((v, i) => v - pre.t[i]));
    check('phone: hand-set view (touch orbit + pinch) unchanged after 15 s with the sheet in use', !pre.manual && h0.manual && h0.btn && zoomed < 0.8 && camDelta(h0, h1) < 1e-3 && h1.manual && merr.length === 0,
      `pinch zoom x${zoomed.toFixed(2)}, drift over 15 s ${camDelta(h0, h1).toExponential(1)} m`);
    const bb = await mp.locator('#arbor-auto-camera').boundingBox();
    const sheet = await mp.locator('#arbor-panel').boundingBox();
    await mp.tap('#arbor-auto-camera');
    await mp.waitForTimeout(4000);
    const e1 = await camPose(mp);
    check('phone: Auto camera button (48 px, clear of the open sheet) resumes the automatic camera', bb.height >= 44 && bb.y + bb.height < sheet.y && !e1.manual && !e1.btn && camDelta(h1, e1) > 0.05,
      `button ${bb.width.toFixed(0)}x${bb.height.toFixed(0)} at y=${bb.y.toFixed(0)}, sheet top ${sheet.y.toFixed(0)}, moved ${camDelta(h1, e1).toFixed(3)} m in 4 s`);
    await ctx.close();
  }

  // PowerVR program gate (audit 3.1): the meadow reuses the safe leaf program, so the phone compiles exactly as many
  // programs with it as without it (?meadow=0), at noon and at night.
  {
    const progs = async (q, flash = false) => {
      const { ctx, mp, merr } = await phone(q);
      const out = {};
      for (const [name, hour] of [['noon', 13], ['night', 23.5]]) {
        out[name] = await mp.evaluate(([h, fl]) => { const A = window.__arbor; if (fl) A.weather.holdFlash = true; A.params.sky.timeOfDay = h; A.fastForward(window.__ffDone ? 0 : 15); window.__ffDone = true; return 0; }, [hour, flash]).catch(() => 0);
        await mp.waitForTimeout(1500);
        out[name] = await mp.evaluate(() => { const A = window.__arbor; return { programs: A.stage.renderer.info.programs.length, grass: A.meadow?.counts.grass ?? 0, flowers: A.meadow?.counts.flowers ?? 0, meshes: A.meadow?.counts.meshes ?? 0, leaves: A.leaves.mesh.count, fe: A.frameErrors(), decal: A.canopy.mesh.visible, rain: A.rain && A.rain.group.visible ? A.rain.sheets.filter((m) => m.visible).length : 0, bolt: !!(A.rain?.group.visible && A.rain.bolt.visible), cloud: A.weather.cloud }; });
      }
      await ctx.close();
      return { ...out, errs: merr.length };
    };
    const on = await progs('?speed=0'), off = await progs('?speed=0&meadow=0');
    check('phone: meadow adds no shader program (noon and night), tufts and flowers drawn',
      on.noon.programs === off.noon.programs && on.night.programs === off.night.programs && on.noon.grass > 1000 && on.noon.flowers > 100 && off.noon.grass === 0 && on.noon.leaves > 0
        && on.noon.fe === 0 && on.night.fe === 0 && on.errs === 0 && off.errs === 0,
      `with ${JSON.stringify(on)} without ${JSON.stringify(off)}`);
    // Backdrop gate (PowerVR rule): terrain, far meadow and tree cards are geometry, texture pixels and clones of live
    // materials, so the phone compiles no more programs than with the old background (?backdrop=0); it is one fewer,
    // because the hill ring's program is gone.
    const old = await progs('?speed=0&backdrop=0');
    check('phone: backdrop adds no shader program (noon and night) and draws far tufts',
      on.noon.programs <= old.noon.programs && on.night.programs <= old.night.programs && on.noon.grass > old.noon.grass && on.noon.meshes > old.noon.meshes && old.noon.fe === 0 && old.night.fe === 0 && old.errs === 0,
      `backdrop ${on.noon.programs}/${on.night.programs} old ${old.noon.programs}/${old.night.programs} grass ${on.noon.grass} vs ${old.noon.grass} meshes ${on.noon.meshes} vs ${old.noon.meshes}`);
    // Same gate for the storm (WP9): rain sheets and the bolt are clones of the canopy-shadow decal material, everything
    // else is uniforms and intensities. Forced storm with a held flash (bolt drawn) against the calm run above.
    const storm = await progs('?speed=0&weather=storm', true), dry = await progs('?speed=0&weather=storm&rain=0', true);
    check('phone: storm adds no shader program (noon and night; fewer is fine: stars hide under cloud), rain sheets and bolt drawn once the decal is',
      storm.noon.programs <= on.noon.programs && storm.night.programs <= on.night.programs && (!storm.noon.decal || (storm.noon.rain >= 2 && storm.noon.bolt)) && (!storm.night.decal || (storm.night.rain >= 2 && storm.night.bolt))
        && storm.noon.cloud === 1 && on.noon.cloud === 0 && on.noon.rain === 0 && dry.noon.rain === 0 && !dry.noon.bolt && dry.noon.programs === on.noon.programs && dry.night.programs <= on.night.programs
        && storm.noon.fe === 0 && storm.night.fe === 0 && storm.errs === 0 && dry.errs === 0,
      `storm ${JSON.stringify(storm)} calm ${JSON.stringify(on)} rain=0 ${JSON.stringify(dry)}`);
    // Lightning off means no flash and no bolt at all, even when one is forced.
    {
      const { ctx, mp } = await phone('?speed=0&weather=storm&lightning=0');
      const r = await mp.evaluate(async () => { const A = window.__arbor; A.weather.holdFlash = true; A.weather.strike(); await new Promise((res) => setTimeout(res, 600)); return { flash: A.weather.flash, bolt: A.weather.bolt.on, vis: !!A.rain?.bolt.visible, lightning: A.params.weather.lightning }; });
      await ctx.close();
      check('phone: lightning off gives no flash and no bolt', r.lightning === false && r.flash === 0 && !r.bolt && !r.vis, JSON.stringify(r));
    }
  }
  // Wind sway gate (PowerVR rule): moving limbs and leaves is data only (branch positions, leaf instance matrices), so
  // the phone program count is the same with and without it (?sway=0), in calm and in a storm; read after the page has
  // settled 6.5 s. Also: the pose moves while the wind blows and returns exactly to rest when the amount goes to 0.
  {
    const run = async (q) => {
      const { ctx, mp, merr } = await phone(q);
      await mp.evaluate(() => { window.__arbor.params.sky.timeOfDay = 13; window.__arbor.fastForward(15); });
      await mp.waitForTimeout(3500);
      // Peak offset over 3 s: one instant can sit in a gust lull (the t = 15 tree is a 3 m sapling since the seedling phase).
      let peak = 0;
      for (let i = 0; i < 30; i++) { await mp.waitForTimeout(100); peak = Math.max(peak, await mp.evaluate(() => window.__arbor.sway.maxOffset)); }
      const r = await mp.evaluate((peak) => new Promise((res) => {
        const A = window.__arbor, out = { programs: A.stage.renderer.info.programs.length, live: A.sway.live, max: +peak.toFixed(3), fe: A.frameErrors(), leaves: A.leaves.mesh.count };
        A.params.sway.amount = 0;
        setTimeout(() => {
          const L = A.leaves, M = L.mesh.instanceMatrix.array, R = L.restT, ND = L.frontNode; let bad = 0;
          for (let i = 0; i < L.mesh.count; i++) if (ND[i] >= 0 && (M[i * 16 + 12] !== R[i * 3] || M[i * 16 + 13] !== R[i * 3 + 1] || M[i * 16 + 14] !== R[i * 3 + 2])) bad++;
          res({ ...out, restLive: A.sway.live, offRest: bad, nonZero: A.sway.D.some((v) => v !== 0) });
        }, 500);
      }), peak);
      await ctx.close();
      return { ...r, errs: merr.length };
    };
    const calm = await run('?speed=0&weather=calm'), calm0 = await run('?speed=0&weather=calm&sway=0');
    const storm = await run('?speed=0&weather=storm&lightning=0'), storm0 = await run('?speed=0&weather=storm&lightning=0&sway=0');
    check('phone: wind sway adds no shader program (calm and storm), moves, and returns exactly to rest',
      calm.programs === calm0.programs && storm.programs === storm0.programs && calm.live && storm.live && !calm0.live && !storm0.live
        && calm.max > 0.005 && storm.max > calm.max && [calm, storm].every((r) => !r.restLive && r.offRest === 0 && !r.nonZero && r.fe === 0 && r.errs === 0 && r.leaves > 0),
      `calm ${JSON.stringify(calm)} sway=0 ${JSON.stringify(calm0)} storm ${JSON.stringify(storm)} sway=0 ${JSON.stringify(storm0)}`);
  }
  // Breakage program gate (WP10, PowerVR rule): a falling limb reuses the live bark and leaf programs. The count is read
  // once the page has settled (three re-keys the bark program by itself a few seconds after the first frames), then in
  // flight and at rest; a twig break (leaf fall) on top must not add one either.
  {
    const { ctx, mp, merr } = await phone('?speed=0');
    const st = () => mp.evaluate(() => { const A = window.__arbor; return { programs: A.stage.renderer.info.programs.length, phases: A.debris.state.map((l) => l.phase), lowest: A.debris.state.map((l) => l.lowest), stats: A.debris.stats, fe: A.frameErrors() }; });
    await mp.evaluate(() => { const A = window.__arbor; A.params.sky.timeOfDay = 13; A.fastForward(60); });
    await mp.waitForTimeout(7000);
    const before = await st();
    const ev = await mp.evaluate(() => { const e = window.__arbor.breakLimb('big'); return e && { nodes: e.nodeIds.length, leaves: e.leaves }; });
    await mp.waitForTimeout(500);
    const flight = await st();
    await mp.evaluate(() => { window.__arbor.breakTwig(); });
    await mp.waitForTimeout(8000);
    const rest = await st();
    check('phone: limb break adds no shader program (before / in flight / at rest), limb comes to rest on the ground',
      !!ev && before.programs === flight.programs && flight.programs === rest.programs && flight.phases.length === 1 && flight.phases[0] < 2 && rest.phases[0] === 2
        && rest.lowest[0] > -0.01 && rest.stats.limbs === 1 && rest.stats.twigs === 1 && rest.fe === 0 && merr.length === 0,
      `programs ${before.programs}/${flight.programs}/${rest.programs} event ${JSON.stringify(ev)} flight phases ${flight.phases} rest phases ${rest.phases} lowest ${rest.lowest} drawn leaves ${rest.stats.lastLeaves} build ${rest.stats.maxBuildMs.toFixed(1)} ms errs ${merr.length}`);
    await ctx.close();
  }
  // Falling-leaf program gate (PowerVR rule): leaves in the air and litter on the ground reuse the live leaf program.
  // Same page age for every reading (settled 9 s after the tree is grown), with and without ?leaffall=0, calm and storm.
  {
    const out = {};
    for (const name of ['calmOn', 'calmOff', 'stormOn', 'stormOff']) {
      const { ctx, mp, merr } = await phone(`?speed=0&weather=${name.startsWith('storm') ? 'storm' : 'calm'}${name.endsWith('Off') ? '&leaffall=0' : ''}`);
      await mp.evaluate(() => { const A = window.__arbor; A.params.sky.timeOfDay = 13; A.fastForward(60); A.leafFall?.force(6); });
      await mp.waitForTimeout(9000);
      out[name] = await mp.evaluate(() => { const A = window.__arbor, L = A.leafFall; return { programs: A.stage.renderer.info.programs.length, fe: A.frameErrors(), on: !!L, spawned: L?.stats.spawned ?? 0, air: L?.stats.air ?? 0, ground: L?.stats.ground ?? 0, maxMs: L?.stats.maxMs ?? 0 }; });
      out[name].errs = merr.length;
      await ctx.close();
    }
    const o = out;
    check('phone: falling leaves and litter add no shader program (calm and storm, vs ?leaffall=0), leaves fly and land',
      o.calmOn.programs === o.calmOff.programs && o.stormOn.programs === o.stormOff.programs && !o.calmOff.on && o.calmOn.spawned >= 6 && o.calmOn.ground >= 1
        && o.stormOn.spawned > 20 && o.stormOn.ground > 5 && Object.values(o).every((r) => r.fe === 0 && r.errs === 0),
      JSON.stringify(o));
  }
  // Leaf form gate (PowerVR rule): switching the leaf form on a living tree is data only. Same program count, same
  // leaf material and map objects (new pixels, version bump), falling-leaf meshes still on the live material, meadow
  // maps untouched; on the phone path (safe leaves) and on desktop High (full leaves, GTAO g-buffer material).
  {
    const FORMS = ['willow', 'birch', 'maple', 'ginkgo', 'round', 'spray', 'frond', 'ring', 'spiral', 'oak'];
    const probe = () => {
      const A = window.__arbor, m = A.leaves.mesh.material, others = [];
      let shared = 0;
      A.stage.scene.traverse((o) => { if (!o.isInstancedMesh || o === A.leaves.mesh) return; if (o.material === m) shared++; else if (o.material.map) others.push(o.material.map.uuid + ':' + o.material.map.version); });
      return { programs: A.stage.renderer.info.programs.length, mat: m.uuid, map: m.map.uuid, ver: m.map.version, form: A.leaves.formId, shared, others: others.join(','), gb: !!A.leaves.mesh.userData.gbufferMaterial, fe: A.frameErrors(), leaves: A.leaves.mesh.count, textures: A.stage.renderer.info.memory.textures };
    };
    const run = async (pg, errs) => {
      await pg.evaluate(() => { const A = window.__arbor; A.params.sky.timeOfDay = 13; A.fastForward(60); A.leafFall?.force(6); });
      await pg.waitForTimeout(8000);
      const before = await pg.evaluate(probe), steps = [];
      for (const f of FORMS) {
        await pg.evaluate((id) => window.__arbor.automation.userSet('leaves.form', id), f);
        await pg.waitForTimeout(700);
        steps.push(await pg.evaluate(probe));
      }
      const ok = steps.every((r, i) => r.programs === before.programs && r.mat === before.mat && r.map === before.map && r.form === FORMS[i] && r.others === before.others
        && r.shared === before.shared && r.fe === 0 && r.leaves > 0 && r.textures === before.textures && r.ver > (i ? steps[i - 1].ver : before.ver)) && errs.length === 0;
      return { ok, before, detail: `programs ${before.programs} -> ${steps.map((r) => r.programs).join('/')} forms ${steps.map((r) => r.form).join(',')} shared meshes ${before.shared} gbuffer ${before.gb} textures ${before.textures} -> ${steps[steps.length - 1].textures} errs ${errs.length}` };
    };
    const { ctx, mp, merr } = await phone('?speed=0&weather=calm');
    const ph = await run(mp, merr);
    await ctx.close();
    check('phone: switching through every leaf form adds no shader program, keeps the leaf material and map objects, no errors', ph.ok && ph.before.shared >= 2, ph.detail);
    const dctx = await browser.newContext({ viewport: { width: 1024, height: 640 } });
    const dp = await dctx.newPage(), derr = [];
    dp.on('pageerror', (e) => derr.push(e.message));
    dp.on('console', (m) => m.type() === 'error' && derr.push(m.text()));
    await dp.goto(`${url}?speed=0&weather=calm&quality=High&autoRotate=false`);
    await dp.waitForFunction(() => window.__arbor !== undefined);
    const dk = await run(dp, derr);
    await dctx.close();
    check('desktop High: switching through every leaf form adds no shader program (full leaves + GTAO cut-out), no errors', dk.ok && dk.before.gb, dk.detail + (derr.length ? ' ' + derr.join(' | ') : ''));
  }
  // Leaf emergence: no leaf may be first seen at a noticeable size. Per frame, the card length of every drawn instance
  // is tracked from a fresh seedling; the first length above 0 is compared with the largest the instance reaches.
  for (const sp of [1, 5]) {
    const { ctx, mp, merr } = await phone('?speed=0&weather=calm&autoRotate=false');
    await mp.waitForTimeout(1500);
    const r = await mp.evaluate((speed) => new Promise((done) => {
      const A = window.__arbor, m = new Map(), END = 13;
      const tick = () => {
        const L = A.leaves, mesh = L.mesh, n = mesh.count, D = L.frontD, ND = L.frontNode, arr = mesh.instanceMatrix.array, now = A.sim.time;
        for (let i = 0; i < n; i++) {
          const key = ND[i] * 4096 + Math.round(D[i * 9] * 4000), o = i * 16, s = Math.hypot(arr[o + 4], arr[o + 5], arr[o + 6]);
          let e = m.get(key);
          if (!e) m.set(key, (e = { at: now, sv: 0, max: 0 }));
          if (e.sv === 0 && s > 0) e.sv = s;
          if (s > e.max) e.max = s;
        }
        if (now < END) return requestAnimationFrame(tick);
        const fr = [...m.values()].filter((e) => e.at < END - 7.5 && e.max > 0).map((e) => e.sv / e.max);
        done({ leaves: fr.length, max: +Math.max(0, ...fr).toFixed(3), over: fr.filter((x) => x > 0.15).length, fe: A.frameErrors() });
      };
      A.params.time.speed = speed; requestAnimationFrame(tick);
    }), sp);
    await ctx.close();
    check(`phone: leaves emerge from nothing at ${sp}x (first visible size <= 15 % of final)`, r.leaves >= 10 && r.over === 0 && r.fe === 0 && merr.length === 0, JSON.stringify(r));
  }
  for (const [q, want] of [['?leafsafe=1', 'MeshLambertMaterial'], ['?leafsafe=0', 'MeshStandardMaterial'], ['?leafshader=basic&leafshadow=0', 'MeshBasicMaterial']]) {
    const { ctx, mp, merr, loadMs } = await phone(q);
    await mp.waitForTimeout(4000);
    const st = await leafState(mp);
    check(`phone ${q}: ${want}`, st.type === want && st.n > 0 && st.fe === 0 && merr.length === 0, `${JSON.stringify(st)} load ${loadMs} ms`);
    await ctx.close();
  }
  // Context-loss guard (own context: sessionStorage counter + Chrome's post-loss WebGL state stay out of other steps):
  // first loss reloads into safe mode (no shadows), second loss stops reloading and shows links.
  {
    const { ctx, mp } = await phone('?leafshader=basic');
    await mp.evaluate(() => { const c = window.__arbor.stage.renderer.getContext(); const x = c.getExtension('WEBGL_lose_context'); x.loseContext(); setTimeout(() => x.restoreContext(), 300); });
    await mp.waitForTimeout(3000);
    await mp.waitForFunction(() => window.__arbor !== undefined && performance.getEntriesByType('navigation')[0]?.type === 'reload', null, { timeout: 60000, polling: 500 })
      .catch(async () => console.log('ctx reload wait failed', await mp.evaluate(() => [performance.getEntriesByType('navigation')[0]?.type, !!window.__arbor, sessionStorage.getItem('arbor.ctxLost'), document.getElementById('notice')?.textContent]).catch((e) => String(e))));
    await mp.waitForTimeout(1000);
    const after1 = await mp.evaluate(() => ({ shadows: window.__arbor.stage.renderer.shadowMap.enabled, n: sessionStorage.getItem('arbor.ctxLost') }));
    check('context loss 1: reloads with shadows off', !after1.shadows && after1.n === '1', JSON.stringify(after1));
    await mp.evaluate(() => { const c = window.__arbor.stage.renderer.getContext(); const x = c.getExtension('WEBGL_lose_context'); x.loseContext(); setTimeout(() => x.restoreContext(), 300); });
    await mp.waitForTimeout(2500);
    const after2 = await mp.evaluate(() => ({ page: !!document.getElementById('ctxlost'), nav: performance.getEntriesByType('navigation')[0]?.type, n: sessionStorage.getItem('arbor.ctxLost') }));
    check('context loss 2: no reload, safe-mode links shown', after2.page && after2.n === '2', JSON.stringify(after2));
    await ctx.close();
  }

  // Memory soak: fast growth + fast day cycle; GPU resource counters must stay flat, heap bounded.
  const SOAK = Number(process.env.SOAK_S ?? 120);
  if (SOAK > 0) {
    const page = await browser.newPage({ viewport: { width: 1024, height: 640 } });
    page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
    page.on('pageerror', (e) => errors.push(e.message));
    await page.goto(`${url}?quality=High`);
    await page.waitForFunction(() => window.__arbor !== undefined, null, { timeout: 30000 });
    await page.evaluate(() => { const P = window.__arbor.params; P.time.speed = 8; P.sky.cycle = true; P.sky.dayLength = 20; });
    const sample = () => page.evaluate(() => { const r = window.__arbor.stage.renderer; return { geo: r.info.memory.geometries, tex: r.info.memory.textures, prog: r.info.programs.length, heapMB: Math.round((performance.memory?.usedJSHeapSize ?? 0) / 1e6), nodes: window.__arbor.sim.nodes.length }; });
    const samples = [];
    // Warm-up: grow most of the tree so lazily created resources exist before the baseline.
    await page.evaluate(() => window.__arbor.fastForward(40));
    for (let t = 0; t <= SOAK; t += 10) {
      samples.push(await sample());
      if (t < SOAK) { await page.evaluate(() => window.__arbor.fastForward(10)); await page.waitForTimeout(10000); }
    }
    const a = samples[1] ?? samples[0], z = samples[samples.length - 1];
    const heaps = samples.map((s) => s.heapMB);
    check(`soak ${SOAK}s: GPU counters flat`, z.geo <= a.geo + 1 && z.tex <= a.tex + 1 && z.prog <= a.prog + 1, `geo ${a.geo}→${z.geo} tex ${a.tex}→${z.tex} prog ${a.prog}→${z.prog}`);
    check(`soak ${SOAK}s: heap bounded`, Math.max(...heaps) < Math.max(80, heaps[1] * 3), `heap MB ${heaps.join(',')} nodes ${samples.map((s) => s.nodes).join(',')}`);
    check('soak: no frame errors', errors.length === 0 && (await page.evaluate(() => window.__arbor.frameErrors())) === 0, errors.slice(0, 3).join(' | '));
  }
} finally {
  await browser.close();
  vite?.kill();
}
const failed = results.filter((r) => !r.ok).length;
console.log(`\n${results.length - failed}/${results.length} passed`);
process.exit(failed ? 1 : 0);

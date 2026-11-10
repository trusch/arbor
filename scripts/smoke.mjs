// Interaction smoke test in headless chromium (SwiftShader).
// Usage: node scripts/smoke.mjs [url]   (default: the deployed app http://10.77.0.2:8050/; pass "dev" to start vite)
// Checks: no console errors, reload survives, phone emulation picks Low (DPR 1, no post RTs), memory soak stays flat (SOAK_S env, default 120; 0 skips), preset dropdown, drift, journey keyframes + interpolation, H/C keys, cinema camera motion.
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
  args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--enable-precise-memory-info'],
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

  // Presets via the GUI dropdown (first <select> in the panel).
  const sel = page.locator('.lil-gui select').first();
  const names = await sel.locator('option').allTextContents();
  check('preset dropdown lists presets', names.length >= 8, `${names.length} options`);
  for (const n of names) {
    const before = errors.length;
    await sel.selectOption({ label: n });
    const info = await page.evaluate(() => window.__arbor.fastForward(12));
    const ov = await page.evaluate(() => ({ g: window.__arbor.params.growth.gravity, sim: window.__arbor.sim.time }));
    check(`preset "${n}" grows`, info.nodes > 5 && errors.length === before && ov.sim < 20, `nodes=${info.nodes} t=${ov.sim.toFixed(1)} gravity=${ov.g.toFixed(2)}`);
  }
  await sel.selectOption({ label: 'Oak meadow' });

  // Drift on gravity (default selected drift param) via the GUI checkbox.
  const driftBox = page.locator('.lil-gui .lil-controller', { hasText: 'drift this param' }).locator('input[type=checkbox]');
  await page.evaluate(() => { window.__arbor.params.growth.gravity = 1; });
  await driftBox.check();
  // Fast rate so a few sim seconds show movement.
  await page.evaluate(() => { window.__arbor.automation.drift['growth.gravity'].rate = 0.2; });
  const gs = [];
  for (let i = 0; i < 6; i++) gs.push(await page.evaluate(() => { window.__arbor.fastForward(1.5); return window.__arbor.params.growth.gravity; }));
  const spread = Math.max(...gs) - Math.min(...gs);
  check('drift moves gravity over time', spread > 0.02, gs.map((g) => g.toFixed(3)).join(','));
  await driftBox.uncheck();
  const gOff = await page.evaluate(() => window.__arbor.params.growth.gravity);
  check('drift off restores base', Math.abs(gOff - 1) < 1e-6, `gravity=${gOff}`);

  // Journey: two keyframes via the GUI button, then interpolation.
  const addKf = page.locator('.lil-gui button', { hasText: 'Add keyframe (now)' });
  await page.locator('.lil-gui button', { hasText: 'Clear journey' }).click();
  await page.evaluate(() => { window.__arbor.params.growth.gravity = 1; window.__arbor.params.leaves.hue = 0.3; });
  await addKf.click();
  await page.evaluate(() => { window.__arbor.fastForward(10); window.__arbor.params.growth.gravity = 0.2; window.__arbor.params.leaves.hue = 0.9; });
  await addKf.click();
  const kfInfo = await page.locator('.lil-gui .lil-controller', { hasText: 'keyframes' }).locator('input').inputValue();
  const jr = await page.evaluate(() => {
    const A = window.__arbor.automation, P = window.__arbor.params;
    const [a, b] = A.journey.map((k) => k.t); // keyframe times as recorded (the sim keeps growing in real time)
    const at = (t) => { A.apply(t); return P.growth.gravity; };
    return { n: A.journey.length, start: at(a), mid: at((a + b) / 2), end: at(b), after: at(b + 50) };
  });
  check('two keyframes recorded', jr.n === 2, `gui="${kfInfo}"`);
  check('journey interpolates', Math.abs(jr.start - 1) < 1e-6 && Math.abs(jr.mid - 0.6) < 1e-3 && Math.abs(jr.end - 0.2) < 1e-6 && Math.abs(jr.after - 0.2) < 1e-6,
    `start=${jr.start.toFixed(3)} mid=${jr.mid.toFixed(3)} end=${jr.end.toFixed(3)} after=${jr.after.toFixed(3)}`);
  await page.locator('.lil-gui button', { hasText: 'Clear journey' }).click();

  // Keys: H hides UI, C toggles cinema (focus is still on a GUI button: keys must work there too).
  await page.keyboard.press('h');
  const hidden = await page.evaluate(() => document.body.classList.contains('watch') && getComputedStyle(document.querySelector('.lil-gui')).display === 'none');
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

  check('no console errors overall', errors.length === 0, errors.slice(0, 3).join(' | '));

  // Reload twice (hot cache: 304s) after changing preset/params: the app must come back with a running loop.
  await sel.selectOption({ label: names[names.length - 1] });
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

  // Android phone emulation (412x915 @ DPR 3, mobile UA): auto-Low, DPR 1, no post render targets, 1024 shadow map.
  const mctx = await browser.newContext({ viewport: { width: 412, height: 915 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true,
    userAgent: 'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Mobile Safari/537.36' });
  const mp = await mctx.newPage();
  const merr = [];
  mp.on('pageerror', (e) => merr.push(e.message));
  await mp.goto(url);
  await mp.waitForFunction(() => window.__arbor !== undefined, null, { timeout: 30000 });
  await mp.waitForTimeout(6000);
  const mob = await mp.evaluate(() => { const A = window.__arbor, r = A.stage.renderer; return { q: A.params.sky.quality, dpr: r.getPixelRatio(), post: !!A.stage._post, shadow: A.stage.sun.shadow.mapSize.x, maxNodes: A.params.growth.maxNodes, fe: A.frameErrors() }; });
  check('phone: auto Low, DPR 1, no post RTs, small shadow map', mob.q === 'Low' && mob.dpr === 1 && !mob.post && mob.shadow === 1024 && mob.fe === 0 && merr.length === 0, JSON.stringify(mob));
  // Leaf modes: phone defaults to the safe leaf path; ?leafsafe=1/0 and ?leafshader=basic force it; leaves render, no errors.
  const leafState = () => mp.evaluate(() => { const A = window.__arbor; A.fastForward(15); const m = A.leaves.mesh; return { type: m.material.type, cast: m.castShadow, n: m.count, fe: A.frameErrors() }; });
  const lm = await leafState();
  check('phone: safe leaves by default (Lambert, no shadow), leaves drawn', lm.type === 'MeshLambertMaterial' && !lm.cast && lm.n > 0 && lm.fe === 0, JSON.stringify(lm));
  for (const [q, want] of [['?leafsafe=1', 'MeshLambertMaterial'], ['?leafsafe=0', 'MeshStandardMaterial'], ['?leafshader=basic&leafshadow=0', 'MeshBasicMaterial']]) {
    const before = merr.length;
    await mp.goto(url + q, { waitUntil: 'domcontentloaded' });
    await mp.waitForFunction(() => window.__arbor !== undefined, null, { timeout: 30000 });
    await mp.waitForTimeout(4000);
    const st = await leafState();
    check(`phone ${q}: ${want}`, st.type === want && st.n > 0 && st.fe === 0 && merr.length === before, JSON.stringify(st));
  }
  // Context-loss guard: first loss reloads into safe mode (no shadows), second loss stops reloading and shows links.
  await mp.goto(url + '?leafshader=basic', { waitUntil: 'domcontentloaded' });
  await mp.waitForFunction(() => window.__arbor !== undefined, null, { timeout: 30000 });
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
  await mctx.close();

  // Memory soak: fast growth + fast day cycle; GPU resource counters must stay flat, heap bounded.
  const SOAK = Number(process.env.SOAK_S ?? 120);
  if (SOAK > 0) {
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

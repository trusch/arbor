// Proof run for cloud arrival and departure: the app on a virtual clock (rAF and performance.now are stepped by
// hand, STEP_MS of app time per frame, default 100 = 10 frames per second of app time), so every frame of a change
// of weather is rendered, measured and can be shot.
//   node scripts/cloudproof.mjs URL phone|desk prefix [view=app|wind|down|side] [kinds=clear,fair,overcast,storm,clear]
// STAGE_S app seconds per kind (30), SHOT_EVERY frames between sheet tiles (25), BURST_AT=kindIndex:second (2:4) +
// BURST_N (24) = consecutive frames as a second sheet, HOUR (12), Q extra query.
// Per frame: mean |luminance step| (0..255) of the sky in the horizon band (from the horizon line up a quarter of
// the frame; a pop is a spike), and per visible cloud its apparent width in px (a zoom is a change that the cloud's
// distance does not explain: `k` = px width x distance / world width must stay constant).
import { mkdirSync, writeFileSync } from 'node:fs';
import { chromium } from 'playwright-core';
const [url = 'http://127.0.0.1:5900/', mode = 'phone', prefix = 'clouds3', view = 'wind', kinds = 'clear,fair,overcast,storm,clear'] = process.argv.slice(2);
const STAGE = Number(process.env.STAGE_S ?? 30), STEP = Number(process.env.STEP_MS ?? 100), EVERY = Number(process.env.SHOT_EVERY ?? 25);
const [BK, BS] = (process.env.BURST_AT ?? '2:4').split(':').map(Number), BN = Number(process.env.BURST_N ?? 24);
mkdirSync('shots', { recursive: true });
const browser = await chromium.launch({ executablePath: '/usr/sbin/chromium', args: ['--headless=new', '--use-gl=angle', `--use-angle=${process.env.GPU ?? 'vulkan'}`, '--enable-gpu', '--ignore-gpu-blocklist'] });
const ctx = await browser.newContext(mode === 'phone'
  ? { viewport: { width: 411, height: 777 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, userAgent: 'Mozilla/5.0 (Linux; Android 15; Pixel) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0 Mobile Safari/537.36' }
  : { viewport: { width: 1280, height: 800 } });
const page = await ctx.newPage();
page.setDefaultTimeout(180000);
page.on('pageerror', (e) => console.error('[pageerror]', e.message));
await page.addInitScript(() => {
  const raf = window.requestAnimationFrame.bind(window), now = performance.now.bind(performance);
  let virt = false, vt = 0, q = [];
  window.requestAnimationFrame = (cb) => (virt ? q.push(cb) : raf(cb));
  performance.now = () => (virt ? vt : now());
  window.__vc = { on() { vt = now(); virt = true; }, step(ms) { vt += ms; const r = q; q = []; for (const cb of r) cb(vt); } };
});
const list = kinds.split(','), tag = `${prefix}-${mode}-${view}`;
const sheet = async (shots, cols, name) => {
  const p = await ctx.newPage(), rows = Math.ceil(shots.length / cols), W = 1800, cw = W / cols, ch = mode === 'phone' ? cw * 777 / 411 : cw * 800 / 1280;
  await p.setViewportSize({ width: W, height: Math.ceil(rows * ch) + 4 });
  await p.setContent(`<body style="margin:0;background:#111;display:grid;grid-template-columns:repeat(${cols},1fr);gap:2px">${shots.map((s) => `<img style="width:100%" src="data:image/jpeg;base64,${s}">`).join('')}</body>`);
  await p.screenshot({ path: `shots/${name}.jpg`, type: 'jpeg', quality: 82 });
  await p.close();
  console.log('sheet', `shots/${name}.jpg`);
};
try {
  await page.goto(`${url}?cycle=false&speed=0&panel=closed&cinema=false&autoRotate=false&weather.kind=${list[0]}&timeOfDay=${process.env.HOUR ?? '12'}&season.date=0.375&season.hold=true&critters=0${mode === 'desk' ? '&quality=High' : ''}${process.env.Q ? '&' + process.env.Q : ''}`, { timeout: 180000 });
  await page.waitForFunction(() => window.__arbor !== undefined && window.__arbor.clouds?.ready, null, { timeout: 180000 });
  await page.evaluate(() => { const a = window.__arbor; a.params.camera.autoFrame = true; a.fastForward(90); a.params.weather.event = 'auto'; });
  await page.waitForTimeout(9000);
  await page.evaluate((view) => {
    const a = window.__arbor, cam = a.stage.camera;
    a.clouds.amount = -1; a.clouds.probe = new Float32Array(7 * 200);
    if (view !== 'app') {
      // Level camera, the tree behind it, the horizon a third up the frame. wind = looking upwind, down = downwind, side = across.
      const w = Math.atan2(-a.wind.dirZ, -a.wind.dirX), az = w + (view === 'side' ? Math.PI / 2 : view === 'down' ? Math.PI : 0);
      const n0 = a.sim.nodes[0], el = (cam.fov * Math.PI / 180) / 4.4;
      a.params.camera.autoFrame = false;
      const px = n0.wx + Math.cos(az) * 8, pz = n0.wz + Math.sin(az) * 8, py = 1.7;
      cam.position.set(px, py, pz);
      a.stage.controls.target.set(px + Math.cos(az) * Math.cos(el) * 10, py + Math.sin(el) * 10, pz + Math.sin(az) * Math.cos(el) * 10);
      cam.lookAt(a.stage.controls.target); a.stage.takeControl?.(); a.stage.grabPolar = Math.PI; a.stage.controls.maxPolarAngle = Math.PI;
    }
    const c2 = document.createElement('canvas'); c2.width = 96; c2.height = 96;
    window.__probe = { g: c2.getContext('2d', { willReadFrequently: true }), prev: null };
    // One virtual frame, then: band change + clouds on screen.
    window.__frame = (ms) => {
      window.__vc.step(ms);
      const P = window.__probe, gl = a.stage.renderer.domElement, cw = gl.clientWidth, chh = gl.clientHeight;
      cam.updateMatrixWorld();
      const v = cam.position.clone().add(cam.getWorldDirection(cam.position.clone()).setY(0).normalize().multiplyScalar(1e5)).project(cam);
      const hy = Math.round((1 - (v.y * 0.5 + 0.5)) * 96), y0 = Math.max(0, hy - 24), y1 = Math.max(y0 + 1, Math.min(96, hy));
      P.g.drawImage(gl, 0, 0, 96, 96);
      const d = P.g.getImageData(0, y0, 96, y1 - y0).data, lum = new Float32Array(d.length / 4);
      let diff = 0, mx = 0;
      for (let i = 0; i < lum.length; i++) { lum[i] = 0.3 * d[i * 4] + 0.59 * d[i * 4 + 1] + 0.11 * d[i * 4 + 2]; if (P.prev && P.prev.length === lum.length) { const e = Math.abs(lum[i] - P.prev[i]); diff += e; if (e > mx) mx = e; } }
      P.prev = lum;
      const C = a.clouds, out = [], p = cam.position.clone(), q = p.clone(), right = p.clone().setFromMatrixColumn(cam.matrixWorld, 0);
      for (let k = 0; k < C.probeN; k++) {
        const o = k * 7, F = C.probe;
        p.set(F[o + 2], F[o + 3], F[o + 4]); const dist = p.distanceTo(cam.position);
        q.copy(p).addScaledVector(right, F[o + 5]); p.project(cam); q.project(cam);
        if (p.z > 1 || Math.abs(p.x) > 1.3 || p.y < -1.1 || p.y > 1.3) continue;
        out.push([F[o] * 65536 + F[o + 1], +((q.x - p.x) * cw / 2).toFixed(1), +((1 - p.y) * chh / 2).toFixed(0), +((p.x + 1) * cw / 2).toFixed(0), +dist.toFixed(0), +F[o + 5].toFixed(1)]);
      }
      const W = a.weather;
      return { band: diff / lum.length, bandMax: mx, hy: hy / 96, clouds: out, cloud: +W.cloud.toFixed(3), deck: +(C.stats.deck ?? 0).toFixed(3), tower: +(C.stats.tower ?? 0).toFixed(3), quads: C.stats.quads, flash: W.flash > 0.01 || W.bolt.on ? 1 : 0, programs: a.stage.renderer.info.programs.length };
    };
    window.__vc.on();
  }, view);
  for (let i = 0; i < 30; i++) await page.evaluate((s) => window.__frame(s), STEP);
  const shots = [], burst = [], rows = [], perKind = Math.round(STAGE * 1000 / STEP);
  let f = 0;
  for (let ki = 0; ki < list.length; ki++) {
    await page.evaluate((kind) => { window.__arbor.params.weather.kind = kind; }, list[ki]);
    for (let i = 0; i < perKind; i++, f++) {
      const r = await page.evaluate((s) => window.__frame(s), STEP);
      rows.push({ f, t: +(f * STEP / 1000).toFixed(2), kind: list[ki], ...r });
      const inBurst = ki === BK && i >= BS * 1000 / STEP && burst.length < BN;
      if (i % EVERY === EVERY - 1) shots.push((await page.screenshot({ type: 'jpeg', quality: 70 })).toString('base64'));
      if (inBurst) burst.push((await page.screenshot({ type: 'jpeg', quality: 70 })).toString('base64'));
    }
    const mine = rows.filter((r) => r.kind === list[ki] && r.f >= f - perKind), b = mine.filter((r) => !r.flash).map((r) => r.band).sort((x, y) => x - y);
    console.log(tag, list[ki], 'band step median', b[b.length >> 1].toFixed(2), 'p95', b[Math.floor(b.length * 0.95)].toFixed(2), 'max (frames without lightning)', b[b.length - 1].toFixed(2), 'at t', mine.find((r) => r.band === b[b.length - 1]).t, 'programs', mine[mine.length - 1].programs, 'quads', mine[mine.length - 1].quads, 'deck', mine[mine.length - 1].deck);
  }
  // Per cloud: apparent width over its visible life. k = px x distance / world width is the projection constant.
  const tracks = new Map();
  for (const r of rows) for (const c of r.clouds) { if (!tracks.has(c[0])) tracks.set(c[0], []); tracks.get(c[0]).push({ f: r.f, px: c[1], y: c[2], x: c[3], d: c[4], w: c[5] }); }
  let worstK = 0, worstStep = 0, born = 0, bornHigh = 0, n = 0, maxPx = 0, spd = [];
  const hyPx = rows[0].hy * (mode === 'phone' ? 777 : 800);
  for (const [id, T] of tracks) {
    if (T.length < 5) continue; n++;
    const ks = T.map((s) => s.px * s.d / s.w), k0 = ks[0];
    for (const k of ks) worstK = Math.max(worstK, Math.abs(k / k0 - 1));
    for (let i = 1; i < T.length; i++) { if (T[i].f === T[i - 1].f + 1) { worstStep = Math.max(worstStep, Math.abs(T[i].px / T[i - 1].px - 1)); spd.push(Math.hypot(T[i].x - T[i - 1].x, T[i].y - T[i - 1].y) * 1000 / STEP); } }
    maxPx = Math.max(maxPx, ...T.map((s) => s.px));
    // First seen after the run started: where? (above the horizon line by more than 12 % of the frame and inside the frame sides = appeared mid-sky)
    if (T[0].f > 0) { born++; const W = mode === 'phone' ? 411 : 1280; if (T[0].y < hyPx - 0.12 * (mode === 'phone' ? 777 : 800) && T[0].x > 0.08 * W && T[0].x < 0.92 * W) bornHigh++; }
  }
  spd.sort((a, b) => a - b);
  console.log(tag, 'clouds tracked', n, 'entered during run', born, 'first seen mid-sky', bornHigh, 'largest size change not explained by distance', (worstK * 100).toFixed(1) + '%', 'largest frame-to-frame width change', (worstStep * 100).toFixed(1) + '%', 'widest px', maxPx.toFixed(0), 'screen speed px/s median', (spd[spd.length >> 1] ?? 0).toFixed(0), 'p95', (spd[Math.floor(spd.length * 0.95)] ?? 0).toFixed(0), 'max', (spd[spd.length - 1] ?? 0).toFixed(0));
  writeFileSync(`shots/${tag}-trace.json`, JSON.stringify(rows.map((r) => ({ ...r, clouds: r.clouds.length }))));
  await sheet(shots, mode === 'phone' ? 12 : 6, `${tag}-seq`);
  if (burst.length) await sheet(burst, mode === 'phone' ? 12 : 6, `${tag}-burst`);
} finally { await browser.close(); }

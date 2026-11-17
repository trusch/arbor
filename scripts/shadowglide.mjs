// Shadow glide probe: day cycle running, fixed top-down camera, tree colour/depth writes off (shadows stay). Every frame
// it reads the ground pixels back and takes the centroid of the darkening (the shadow as drawn, decal or shadow map, plus
// the shaded grass), next to the sun direction, the decal bake counter and transform. A gliding shadow moves a little
// every frame, in proportion to the sun; a stepping one stands still and then catches up.
// Usage: node scripts/shadowglide.mjs URL [prefix]
//   env: MODE=phone|desktop  DAY=20 (dayLength s)  HOUR=9  DUR=5 (real s)  T=60 (tree age)  SPEED=1 (growth; 0 = paused)
//        CYCLE=0 (still sun: growth only)  THROTTLE=n  GPU=vulkan  JSON=1 (one JSON line, for smoke)  QUERY=extra
// Prints: frames, centroid path (m), per-frame step mean / p95 / max (m and phone px at the automatic camera), the
// ratio max / mean of (step / sun step) = `jump` (1 = perfectly proportional), still frames, bake intervals, and
// `decalStill` of `sunFrames` = frames in which the sun moved and the decal plane did not (Low path; 0 = it follows).
import { mkdirSync, writeFileSync } from 'node:fs';
import { chromium } from 'playwright-core';
const url = process.argv[2] ?? 'http://127.0.0.1:5620/', PRE = process.argv[3] ?? 'sg';
const E = process.env, phone = (E.MODE ?? 'phone') === 'phone', DAY = Number(E.DAY ?? 20), HOUR = Number(E.HOUR ?? 9), DUR = Number(E.DUR ?? 5), CYCLE = E.CYCLE !== '0';
const browser = await chromium.launch({ executablePath: '/usr/sbin/chromium', args: ['--headless=new', '--use-gl=angle', `--use-angle=${E.GPU ?? 'vulkan'}`, '--enable-gpu', '--ignore-gpu-blocklist'] });
let res;
try {
  const ctx = await browser.newContext(phone
    ? { viewport: { width: 411, height: 777 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, userAgent: 'Mozilla/5.0 (Linux; Android 15; Pixel) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0 Mobile Safari/537.36' }
    : { viewport: { width: 1280, height: 800 } });
  const page = await ctx.newPage();
  page.on('pageerror', (e) => console.error('[pageerror]', e.message));
  if (E.THROTTLE) await (await ctx.newCDPSession(page)).send('Emulation.setCPUThrottlingRate', { rate: Number(E.THROTTLE) });
  await page.goto(`${url}?t=${E.T ?? 60}&timeOfDay=${HOUR}&cycle=false&dayLength=${DAY}&nogui=1&hideui=1&speed=0&weather=calm&season.on=false&critters=0${phone ? '' : '&quality=High'}${E.QUERY ? '&' + E.QUERY : ''}`);
  await page.waitForFunction(() => window.__arbor !== undefined);
  await page.waitForTimeout(2500);
  await page.evaluate(([cycle, speed]) => {
    const a = window.__arbor, st = a.stage, cam = st.camera;
    // Phone px per metre at the automatic camera's framing (before the probe camera takes over).
    const dist = cam.position.distanceTo(st.controls.target);
    const pxm = st.renderer.domElement.clientHeight / (2 * Math.tan((cam.fov * Math.PI) / 360) * dist);
    a.params.camera.autoFrame = false; a.params.camera.cinema = false; a.params.camera.autoRotate = false; a.params.sky.wind = 0;
    st.takeControl?.();
    st.controls.autoRotate = false;
    st.controls.target.set(0, 0, 0); cam.position.set(0.01, 34, 0.01); st.controls.update?.();
    for (const m of [a.leaves.mesh.material, a.branches.mesh.material]) { m.colorWrite = false; m.depthWrite = false; }
    if (st.post?.gtao) st.post.gtao.enabled = false;
    const N = 96, c = document.createElement('canvas'); c.width = c.height = N;
    const g = c.getContext('2d', { willReadFrequently: true }), gl = st.renderer.domElement;
    const S = (window.__sg = { on: false, rows: [], pxm, N, shots: [] });
    const L = new Float32Array(N * N), srt = new Float32Array(N * N);
    const tick = () => {
      requestAnimationFrame(tick);
      if (!S.on) return;
      const W = gl.width, H = gl.height, s = Math.min(W, H);
      g.drawImage(gl, (W - s) / 2, (H - s) / 2, s, s, 0, 0, N, N);
      const d = g.getImageData(0, 0, N, N).data;
      for (let i = 0; i < N * N; i++) L[i] = (d[i * 4] * 54 + d[i * 4 + 1] * 183 + d[i * 4 + 2] * 19) / 256;
      srt.set(L); srt.sort();
      const bg = srt[(N * N * 0.7) | 0];
      let m = 0, mx = 0, my = 0;
      for (let y = 0, i = 0; y < N; y++) for (let x = 0; x < N; x++, i++) { const w = bg - 6 - L[i]; if (w > 0) { m += w; mx += w * x; my += w * y; } }
      const k = (2 * Math.tan((cam.fov * Math.PI) / 360) * cam.position.y) / N * (s / H); // metres per probe pixel
      const sp = st.sun.position, tp = st.sun.target.position, dx = sp.x - tp.x, dy = sp.y - tp.y, dz = sp.z - tp.z, dl = Math.hypot(dx, dy, dz);
      const me = a.canopy.mesh;
      S.rows.push({ now: performance.now(), hr: a.params.sky.timeOfDay, cx: m ? (mx / m) * k : 0, cy: m ? (my / m) * k : 0, m, sx: dx / dl, sy: dy / dl, sz: dz / dl, I: st.sun.intensity,
        bakes: a.canopy.bakes, vis: me.visible, px: me.position.x, pz: me.position.z, rot: me.rotation.y, sc: me.scale.x, fills: a.meadow?.stats.bakes ?? 0 });
    };
    requestAnimationFrame(tick);
    a.params.sky.cycle = cycle; a.params.time.speed = speed; a.params.time.paused = speed <= 0;
  }, [CYCLE, Number(E.SPEED ?? 1)]);
  await page.waitForTimeout(1500);
  await page.evaluate(() => { window.__sg.on = true; });
  // Frame burst for a contact sheet: every 100 ms.
  const shots = [];
  if (E.SHOTS === '1') { mkdirSync('shots', { recursive: true }); for (let i = 0; i < DUR * 10; i++) { const p = `shots/${PRE}-f${String(i).padStart(2, '0')}.png`; await page.screenshot({ path: p }); shots.push(p); await page.waitForTimeout(60); } }
  else await page.waitForTimeout(DUR * 1000);
  const out = await page.evaluate(() => { const S = window.__sg; S.on = false; return { rows: S.rows, pxm: S.pxm, programs: window.__arbor.stage.renderer.info.programs.length, q: window.__arbor.params.sky.quality, ms: window.__arbor.canopy.maxMs }; });
  const R = out.rows, steps = [], ratios = [], bakeAt = [];
  let path = 0, still = 0, decalStill = 0, sunFrames = 0;
  for (let i = 1; i < R.length; i++) {
    const a = R[i - 1], b = R[i];
    if (b.bakes !== a.bakes) bakeAt.push(b.now);
    if (!(a.m > 0 && b.m > 0)) continue;
    const d = Math.hypot(b.cx - a.cx, b.cy - a.cy), sun = Math.hypot(b.sx - a.sx, b.sy - a.sy, b.sz - a.sz);
    steps.push(d); path += d;
    if (sun > 1e-6) ratios.push(d / sun);
    if (d < 1e-4) still++;
    if (sun > 1e-6 && a.vis && b.vis) { sunFrames++; if (Math.hypot(b.px - a.px, b.pz - a.pz) + Math.abs(b.rot - a.rot) + Math.abs(b.sc - a.sc) < 1e-9) decalStill++; }
  }
  const srt = [...steps].sort((p, q) => p - q), mean = path / Math.max(1, steps.length), max = srt[srt.length - 1] ?? 0;
  const rm = ratios.reduce((p, q) => p + q, 0) / Math.max(1, ratios.length), rmax = Math.max(0, ...ratios);
  const gaps = bakeAt.slice(1).map((t, i) => t - bakeAt[i]);
  const r3 = (v) => +v.toFixed(4);
  res = { prefix: PRE, mode: phone ? 'phone' : 'desktop', quality: out.q, day: DAY, cycle: CYCLE, frames: R.length, hours: [r3(R[0]?.hr ?? 0), r3(R[R.length - 1]?.hr ?? 0)], pathM: r3(path), stepMeanM: r3(mean), stepP95M: r3(srt[Math.floor(srt.length * 0.95)] ?? 0), stepMaxM: r3(max),
    pxPerM: +out.pxm.toFixed(1), stepMaxPx: +(max * out.pxm).toFixed(2), stepMeanPx: +(mean * out.pxm).toFixed(2), maxOverMean: +(max / Math.max(1e-9, mean)).toFixed(2), jump: +(rmax / Math.max(1e-9, rm)).toFixed(2), stillFrames: still, decalStill, sunFrames,
    bakes: bakeAt.length, bakeGapMs: gaps.length ? Math.round(gaps.reduce((p, q) => p + q, 0) / gaps.length) : 0, bakeMaxMs: +out.ms.toFixed(1), programs: out.programs };
  writeFileSync(`/tmp/${PRE}.json`, JSON.stringify(R));
  console.log(E.JSON === '1' ? JSON.stringify(res) : `${PRE} ${JSON.stringify(res)}`);
} finally {
  await browser.close();
}

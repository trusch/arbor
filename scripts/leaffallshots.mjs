// Falling-leaf proof shots on the real GPU against a running built server.
// Usage: node scripts/leaffallshots.mjs http://127.0.0.1:5441/ [phone|desk] [hour=13]   env: GPU, SHOT_PREFIX, STORM_S=60
// Shots: calm forced leaf (3 frames in the air + where it landed), storm at a gust peak (2 frames 0.5 s apart, wide,
// seen across the wind), ground downwind after STORM_S of storm. Prints counts and program counts.
import { mkdirSync } from 'node:fs';
import { chromium } from 'playwright-core';
const url = process.argv[2] ?? 'http://127.0.0.1:5441/', mode = process.argv[3] ?? 'phone', hour = Number(process.argv[4] ?? 13);
const STORM_S = Number(process.env.STORM_S ?? 60);
mkdirSync('shots', { recursive: true });
const browser = await chromium.launch({ executablePath: '/usr/sbin/chromium', args: ['--headless=new', '--use-gl=angle', `--use-angle=${process.env.GPU ?? 'vulkan'}`, '--enable-gpu', '--ignore-gpu-blocklist'] });
const tag = `${process.env.SHOT_PREFIX ?? 'lf'}-${mode}-h${hour}`;
const shot = (page, n) => page.screenshot({ path: `shots/${tag}-${n}.png` });
try {
  const ctx = await browser.newContext(mode === 'phone'
    ? { viewport: { width: 411, height: 777 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, userAgent: 'Mozilla/5.0 (Linux; Android 15; Pixel) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0 Mobile Safari/537.36' }
    : { viewport: { width: 1280, height: 800 } });
  const page = await ctx.newPage();
  page.on('pageerror', (e) => console.error('[pageerror]', e.message));
  await page.goto(`${url}?cycle=false&nogui=1&hideui=1&speed=0&autoRotate=false&cinema=false&weather=calm${mode === 'desk' ? '&quality=High' : ''}`);
  await page.waitForFunction(() => window.__arbor !== undefined);
  const st = () => page.evaluate(() => { const A = window.__arbor; return { programs: A.stage.renderer.info.programs.length, calls: A.stage.renderer.info.render.calls, quality: A.params.sky.quality, fe: A.frameErrors(), ...A.leafFall.stats, gust: +(A.wind.gust(0, 0) / A.wind.base).toFixed(2) }; });
  await page.evaluate((h) => { const A = window.__arbor; A.params.sky.timeOfDay = h; A.params.camera.autoFrame = false; A.fastForward(90); }, hour);
  await page.waitForTimeout(7000);
  console.log('settled', JSON.stringify(await st()));
  // Calm: one forced leaf, camera 2.2 m from it, across the wind.
  const cam = (p, d, lookDown = 0) => page.evaluate(([p, d, ld]) => {
    const A = window.__arbor, w = A.wind;
    A.stage.controls.target.set(p[0] + w.dirX * 0.8, Math.max(0.2, p[1] - 0.9 - ld), p[2] + w.dirZ * 0.8);
    A.stage.camera.position.set(p[0] - w.dirZ * d + w.dirX * 0.8, Math.max(0.5, p[1] - 0.4 + ld), p[2] + w.dirX * d + w.dirZ * 0.8);
    A.stage.controls.update?.();
  }, [p, d, lookDown]);
  // A leaf on the crown's rim on the camera side (across the wind), low enough to follow to the ground.
  const leaf = await page.evaluate(() => { const A = window.__arbor, L = A.leafFall, w = A.wind; let best = null, bs = -1e9; for (let i = 0; i < 400; i++) { if (!A.leaves.sampleInstance(Math.random(), window.__m ??= new Float32Array(16), window.__c ??= new Float32Array(3))) continue; const m = window.__m; const sc = -m[12] * w.dirZ + m[14] * w.dirX - Math.abs(m[13] - 3); if (sc > bs) { bs = sc; best = [m.slice(), window.__c.slice()]; } } L.launch(best[0], 0, best[1], 0, 0); const s = L.state.air; return { p: s[s.length - 1] }; });
  console.log('forced leaf', JSON.stringify(leaf));
  // Fixed camera upwind of the leaf, looking downwind along the crown's rim: the leaf drifts away over the meadow.
  await page.evaluate((p) => {
    const A = window.__arbor, w = A.wind;
    A.stage.controls.target.set(p[0] + w.dirX * 2 - w.dirZ * 0.3, p[1] - 1.3, p[2] + w.dirZ * 2 + w.dirX * 0.3);
    A.stage.camera.position.set(p[0] - w.dirX * 2.2 - w.dirZ * 0.9, p[1] - 0.2, p[2] - w.dirZ * 2.2 + w.dirX * 0.9);
    A.stage.controls.update?.();
  }, leaf.p);
  let lp = leaf.p;
  for (const [n, ms] of [['calm-a', 500], ['calm-b', 700], ['calm-c', 800]]) {
    await page.waitForTimeout(ms);
    lp = await page.evaluate((q) => { let b = q, bd = 1e9; for (const p of window.__arbor.leafFall.state.air) { const d = Math.hypot(p[0] - q[0], p[1] - q[1], p[2] - q[2]); if (d < bd) { bd = d; b = p; } } return b; }, lp);
    await shot(page, n);
    console.log(n, JSON.stringify(lp));
  }
  await page.waitForTimeout(6000);
  const ground = await page.evaluate(() => { const g = window.__arbor.leafFall.state.ground; return g[g.length - 1] ?? null; });
  console.log('landed at', JSON.stringify(ground), JSON.stringify(await st()));
  if (ground) { await cam([ground[0], 1.0, ground[2]], 0.9, 0.3); await page.waitForTimeout(400); await shot(page, 'calm-landed'); }
  // Storm: wide, across the wind, tree in the upwind third.
  await page.evaluate(() => {
    const A = window.__arbor, w = A.wind, H = A.sim.bboxMax[1];
    A.params.weather.event = 'storm'; A.weather.snapStorm(); A.weather.nextStrike = 1e9;
    A.stage.controls.target.set(w.dirX * H * 0.8, H * 0.42, w.dirZ * H * 0.8);
    A.stage.camera.position.set(w.dirX * H * 0.8 - w.dirZ * H * 2.5, H * 0.45, w.dirZ * H * 0.8 + w.dirX * H * 2.5);
    A.stage.controls.update?.();
  });
  const t0 = Date.now();
  await page.waitForTimeout(3000);
  await page.waitForFunction(() => { const A = window.__arbor; return A.wind.gust(0, 0) / A.wind.base > 0.8; }, null, { timeout: 40000, polling: 100 }).catch(() => console.log('no gust peak seen'));
  await page.waitForTimeout(250);
  await shot(page, 'storm-a'); await page.waitForTimeout(500); await shot(page, 'storm-b');
  console.log('storm gust peak', JSON.stringify(await st()));
  await page.waitForFunction(() => { const A = window.__arbor; return A.wind.gust(0, 0) / A.wind.base < 0.3; }, null, { timeout: 40000, polling: 100 }).catch(() => {});
  await shot(page, 'storm-lull');
  console.log('storm lull', JSON.stringify(await st()));
  await page.waitForTimeout(Math.max(0, STORM_S * 1000 - (Date.now() - t0)));
  console.log(`storm ${STORM_S}s`, JSON.stringify(await st()));
  const dist = await page.evaluate(() => { const A = window.__arbor, w = A.wind, g = A.leafFall.state.ground; const d = g.map((p) => p[0] * w.dirX + p[2] * w.dirZ).sort((a, b) => a - b); const q = (f) => +(d[Math.floor(f * (d.length - 1))] ?? 0).toFixed(1); return { n: d.length, p10: q(0.1), p50: q(0.5), p90: q(0.9), yMin: Math.min(...g.map((p) => p[1])), yMax: Math.max(...g.map((p) => p[1])) }; });
  console.log('litter downwind distance (m)', JSON.stringify(dist));
  await page.evaluate((d) => {
    const A = window.__arbor, w = A.wind;
    A.params.weather.event = 'calm';
    A.stage.controls.target.set(w.dirX * d, 0, w.dirZ * d);
    A.stage.camera.position.set(w.dirX * (d - 5) - w.dirZ * 3, 2.4, w.dirZ * (d - 5) + w.dirX * 3);
    A.stage.controls.update?.();
  }, dist.p50);
  await page.waitForTimeout(1500);
  await shot(page, 'ground');
  await page.evaluate(() => { const A = window.__arbor; A.params.camera.autoFrame = true; });
  await page.waitForTimeout(2500);
  await shot(page, 'ground-wide');
  console.log('end', JSON.stringify(await st()));
} finally { await browser.close(); }

// Season cost and leaf drop, live (the year running at 1x): JS ms per frame (rAF callback time) in summer vs autumn,
// drawn leaves, falling-leaf stats and program count. Phone emulation by default, CPU throttle via THROTTLE (4).
// Usage: PORT=5484 THROTTLE=4 MODE=phone|desk SAMPLE_S=15 node scripts/seasoncost.mjs [prefix=seasoncost] [stations=summer:0.38,autumn:0.6]
import { spawn } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { chromium } from 'playwright-core';

const E = process.env, PORT = Number(E.PORT ?? 5484), THROTTLE = Number(E.THROTTLE ?? 4), MODE = E.MODE ?? 'phone', SAMPLE = Number(E.SAMPLE_S ?? 15);
const prefix = process.argv[2] ?? 'seasoncost';
const ST = (process.argv[3] ?? 'summer:0.38,autumn:0.6').split(',').map((s) => s.split(':')).map(([name, d]) => ({ name, d: Number(d) }));
mkdirSync('shots', { recursive: true });
const vite = spawn('npx', ['vite', '--port', String(PORT), '--strictPort'], { stdio: ['ignore', 'pipe', 'inherit'] });
await new Promise((res) => vite.stdout.on('data', (d) => String(d).includes('Local') && res()));
const browser = await chromium.launch({
  executablePath: E.CHROMIUM ?? '/usr/sbin/chromium',
  args: ['--headless=new', '--use-gl=angle', `--use-angle=${E.GPU ?? 'vulkan'}`, '--enable-gpu', '--ignore-gpu-blocklist'],
});
const PHONE = { viewport: { width: 411, height: 777 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, userAgent: 'Mozilla/5.0 (Linux; Android 15; Pixel) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0 Mobile Safari/537.36' };
try {
  const ctx = await browser.newContext(MODE === 'phone' ? PHONE : { viewport: { width: 1024, height: 640 } });
  const page = await ctx.newPage();
  page.on('pageerror', (e) => console.error('[pageerror]', e.message));
  await page.addInitScript(() => {
    const raf = window.requestAnimationFrame.bind(window);
    window.__js = [];
    window.requestAnimationFrame = (cb) => raf((t) => { const t0 = performance.now(); cb(t); window.__js.push(performance.now() - t0); });
  });
  await page.goto(`http://localhost:${PORT}/?cycle=false&speed=0&autoRotate=false&cinema=false&weather=calm&timeOfDay=14&nogui=1&hideui=1&${E.QUERY ?? ''}`);
  await page.waitForFunction(() => window.__arbor !== undefined);
  await page.evaluate(() => window.__arbor.fastForward(90));
  await page.waitForTimeout(6000);
  if (THROTTLE > 1) { const cdp = await ctx.newCDPSession(page); await cdp.send('Emulation.setCPUThrottlingRate', { rate: THROTTLE }); }
  for (const s of ST) {
    await page.evaluate((d) => { const A = window.__arbor; A.leafFall?.clear(); A.params.season.hold = false; A.params.season.date = d; A.params.time.speed = 1; }, s.d);
    await page.waitForTimeout(4000);
    const n0 = await page.evaluate(() => { const A = window.__arbor; window.__js.length = 0; if (A.leafFall) { A.leafFall.stats.sumMs = 0; A.leafFall.stats.frames = 0; A.leafFall.stats.airPeak = 0; A.leafFall.stats.spawned = 0; A.leafFall.stats.adopted = 0; } return A.leaves.mesh.count; });
    await page.waitForTimeout(SAMPLE * 500);
    await page.screenshot({ path: `shots/${prefix}-${MODE}-${s.name}-mid.png` });
    await page.waitForTimeout(SAMPLE * 500);
    const r = await page.evaluate(() => {
      const A = window.__arbor, js = window.__js.slice().sort((a, b) => a - b), L = A.leafFall?.stats;
      return { season: A.season.name, phase: +A.season.phase.toFixed(3), frames: js.length, jsMean: +(js.reduce((a, b) => a + b, 0) / js.length).toFixed(2), jsMedian: +js[js.length >> 1].toFixed(2), jsP95: +js[Math.floor(js.length * 0.95)].toFixed(2), jsMax: +js[js.length - 1].toFixed(2),
        leaves: A.leaves.mesh.count, passMs: +A.leaves.passMs.toFixed(1), followMaxMs: +A.leaves.followMaxMs.toFixed(1), programs: A.stage.renderer.info.programs.length, fe: A.frameErrors(),
        fall: L && { spawned: L.spawned, adopted: L.adopted, air: L.air, airPeak: L.airPeak, airCap: L.airCap, ground: L.ground, litterCap: L.litterCap, meanMs: +(L.sumMs / L.frames).toFixed(3) } };
    });
    console.log(MODE, `x${THROTTLE}`, s.name, `leaves ${n0} ->`, JSON.stringify(r));
    await page.screenshot({ path: `shots/${prefix}-${MODE}-${s.name}-end.png` });
  }
  await ctx.close();
} finally { await browser.close(); vite.kill(); }

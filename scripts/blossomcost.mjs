// Blossom cost at peak bloom: JS ms per frame (rAF callback time) with the blossom on and off, the blossom system's own
// mean (`stats.sumMs / frames`) and the program count. Phone emulation by default, CPU throttle via THROTTLE (4).
// Usage: PORT=5545 THROTTLE=4 MODE=phone|desk SAMPLE_S=10 node scripts/blossomcost.mjs
import { spawn } from 'node:child_process';
import { chromium } from 'playwright-core';

const E = process.env, PORT = Number(E.PORT ?? 5545), THROTTLE = Number(E.THROTTLE ?? 4), MODE = E.MODE ?? 'phone', SAMPLE = Number(E.SAMPLE_S ?? 10);
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
  await page.goto(`http://localhost:${PORT}/?cycle=false&speed=0&autoRotate=false&cinema=false&weather=calm&timeOfDay=14&nogui=1&hideui=1&season.date=0.056&season.hold=true&${E.QUERY ?? ''}`);
  await page.waitForFunction(() => window.__arbor !== undefined);
  await page.evaluate(() => window.__arbor.fastForward(90));
  await page.waitForTimeout(7000);
  if (THROTTLE > 1) { const cdp = await ctx.newCDPSession(page); await cdp.send('Emulation.setCPUThrottlingRate', { rate: THROTTLE }); }
  for (const [name, amount] of [['off', 0], ['peak', 1], ['off', 0], ['peak', 1]]) {
    await page.evaluate((a) => { window.__arbor.params.season.blossom = a; }, amount);
    await page.waitForTimeout(2500);
    await page.evaluate(() => { const b = window.__arbor.blossom.stats; window.__js.length = 0; b.sumMs = 0; b.frames = 0; b.maxMs = 0; });
    await page.waitForTimeout(SAMPLE * 1000);
    const r = await page.evaluate(() => {
      const A = window.__arbor, js = window.__js.slice().sort((a, b) => a - b), b = A.blossom.stats;
      return { phase: +A.season.phase.toFixed(3), frames: js.length, jsMean: +(js.reduce((a, c) => a + c, 0) / js.length).toFixed(2), jsMedian: +js[js.length >> 1].toFixed(2), jsP95: +js[Math.floor(js.length * 0.95)].toFixed(2),
        drawn: b.drawn, blossomMs: b.frames ? +(b.sumMs / b.frames).toFixed(3) : 0, blossomMaxMs: +b.maxMs.toFixed(2), air: A.leafFall?.counts.air, programs: A.stage.renderer.info.programs.length, calls: A.stage.renderer.info.render.calls, fe: A.frameErrors() };
    });
    console.log(MODE, `x${THROTTLE}`, name, JSON.stringify(r));
  }
  await ctx.close();
} finally { await browser.close(); vite.kill(); }

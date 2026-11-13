// Cost of the season-driven meadow / scenery rebake with the year running at 1x: phone emulation, CPU throttle (THROTTLE, 4).
// Reads Meadow.stats (ms inside bake, patches baked, season steps, longest per-frame slice) per station over SAMPLE_S seconds.
// Usage: PROF_DIST=dist PORT=5566 THROTTLE=4 SAMPLE_S=20 node scripts/bgseasoncost.mjs [stations=summer:0.36,autumn:0.56,winter:0.8]
import { spawn } from 'node:child_process';
import { chromium } from 'playwright-core';
const E = process.env, PORT = Number(E.PORT ?? 5566), THROTTLE = Number(E.THROTTLE ?? 4), SAMPLE = Number(E.SAMPLE_S ?? 20);
const ST = (process.argv[2] ?? 'summer:0.36,autumn:0.56,winter:0.8').split(',').map((s) => s.split(':')).map(([name, d]) => ({ name, d: Number(d) }));
const vite = spawn('npx', ['vite', 'preview', '--outDir', E.PROF_DIST ?? 'dist', '--port', String(PORT), '--strictPort'], { stdio: ['ignore', 'pipe', 'inherit'] });
await new Promise((res) => vite.stdout.on('data', (d) => String(d).includes('Local') && res()));
const browser = await chromium.launch({ executablePath: '/usr/sbin/chromium', args: ['--headless=new', '--use-gl=angle', `--use-angle=${E.GPU ?? 'vulkan'}`, '--enable-gpu', '--ignore-gpu-blocklist'] });
try {
  const ctx = await browser.newContext({ viewport: { width: 411, height: 777 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, userAgent: 'Mozilla/5.0 (Linux; Android 15; Pixel) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0 Mobile Safari/537.36' });
  const page = await ctx.newPage();
  await page.addInitScript(() => { const raf = window.requestAnimationFrame.bind(window); window.__js = []; window.requestAnimationFrame = (cb) => raf((t) => { const t0 = performance.now(); cb(t); window.__js.push(performance.now() - t0); }); });
  await page.goto(`http://localhost:${PORT}/?cycle=false&speed=0&autoRotate=false&cinema=false&weather=calm&timeOfDay=14&nogui=1&hideui=1`);
  await page.waitForFunction(() => window.__arbor !== undefined);
  await page.evaluate(() => window.__arbor.fastForward(90));
  await page.waitForTimeout(6000);
  if (THROTTLE > 1) { const cdp = await ctx.newCDPSession(page); await cdp.send('Emulation.setCPUThrottlingRate', { rate: THROTTLE }); }
  for (const s of ST) {
    await page.evaluate((d) => { const A = window.__arbor; A.params.season.hold = false; A.params.season.date = d; A.params.time.speed = 1; }, s.d);
    await page.waitForTimeout(4000);
    await page.evaluate(() => { const S = window.__arbor.meadow.stats; window.__js.length = 0; window.__m0 = { ...S }; S.sliceMaxMs = 0; S.maxMs = 0; });
    await page.waitForTimeout(SAMPLE * 1000);
    console.log(`x${THROTTLE}`, s.name, JSON.stringify(await page.evaluate(() => {
      const A = window.__arbor, S = A.meadow.stats, m0 = window.__m0, js = window.__js.slice().sort((a, b) => a - b), n = js.length;
      return { phase: +A.season.phase.toFixed(3), frames: n, jsMean: +(js.reduce((a, b) => a + b, 0) / n).toFixed(2), jsP95: +js[Math.floor(n * 0.95)].toFixed(2), seasonSteps: S.seasonRebakes - m0.seasonRebakes, patchBakes: S.bakes - m0.bakes, bakeMs: +(S.sumMs - m0.sumMs).toFixed(1), msPerStep: +((S.sumMs - m0.sumMs) / Math.max(1, S.seasonRebakes - m0.seasonRebakes)).toFixed(1), meadowMsPerFrame: +((S.sumMs - m0.sumMs) / n).toFixed(3), maxPatchMs: +S.maxMs.toFixed(2), sliceMaxMs: +S.sliceMaxMs.toFixed(2), programs: A.stage.renderer.info.programs.length };
    })));
  }
} finally { await browser.close(); vite.kill(); }

// Program-cache census in phone emulation: prints every compiled program (type + cache key hash) for a query, so a storm
// run can be diffed against a calm one. Usage: PROF_DIST=/tmp/dist PORT=5384 node scripts/wxprograms.mjs 'weather=storm' [hour]
import { spawn } from 'node:child_process';
import { chromium } from 'playwright-core';
const PORT = Number(process.env.PORT ?? 5384), DIST = process.env.PROF_DIST ?? '/tmp/arbor-prof-dist';
const vite = spawn('npx', ['vite', 'preview', '--outDir', DIST, '--port', String(PORT), '--strictPort'], { stdio: ['ignore', 'pipe', 'inherit'] });
await new Promise((res) => vite.stdout.on('data', (d) => String(d).includes('Local') && res()));
const browser = await chromium.launch({ executablePath: '/usr/sbin/chromium', args: ['--headless=new', '--use-gl=angle', `--use-angle=${process.env.GPU ?? 'vulkan'}`, '--enable-gpu', '--ignore-gpu-blocklist'] });
try {
  const ctx = await browser.newContext({ viewport: { width: 411, height: 777 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, userAgent: 'Mozilla/5.0 (Linux; Android 15; Pixel) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0 Mobile Safari/537.36' });
  const page = await ctx.newPage();
  await page.goto(`http://localhost:${PORT}/?nogui=1&hideui=1&speed=0&autoRotate=false&cinema=false&${process.argv[2] ?? ''}`);
  await page.waitForFunction(() => window.__arbor !== undefined);
  await page.evaluate((h) => { const a = window.__arbor; a.params.sky.timeOfDay = h; a.fastForward(60); window.__t0 = performance.now(); if (a.weather.phase === 'rain') a.weather.holdFlash = true; }, Number(process.argv[3] ?? 13));
  await page.waitForTimeout(2500);
  await page.waitForTimeout(Number(process.env.WAIT ?? 0));
  if (process.env.SEQ) { // calm first, then the storm at run time
    const before = await page.evaluate(() => window.__arbor.stage.renderer.info.programs.map((p) => p.cacheKey));
    await page.evaluate(() => { const a = window.__arbor; a.params.weather.event = 'storm'; a.weather.snapStorm(); a.weather.holdFlash = true; });
    await page.waitForTimeout(2500);
    const added = await page.evaluate((b) => window.__arbor.stage.renderer.info.programs.filter((p) => !b.includes(p.cacheKey)).map((p) => `${p.name} users=${p.usedTimes} key=${p.cacheKey}`), before);
    console.log('before', before.length, 'added by the storm:', added.length); for (const l of added) console.log(l.slice(0, 3000));
  }
  const out = await page.evaluate(() => window.__arbor.stage.renderer.info.programs.map((p) => `${p.name} users=${p.usedTimes} key=${p.cacheKey}`));
  console.log(out.length); for (const l of out) console.log(process.env.FULL ? l : l.slice(0, 60) + ' #' + [...l].reduce((h, c) => (h * 31 + c.charCodeAt(0)) | 0, 0));
} finally { await browser.close(); vite.kill(); }

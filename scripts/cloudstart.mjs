// Startup cost of the clouds on the real GPU against a running built app.
//   node scripts/cloudstart.mjs URL [runs=5] [query=start=0] [phone|desk]     THROTTLE=4 = CPU throttle from before navigation
// Per run (fresh browser): ms until `__arbor` is set, until the weather readout has text, the 'clouds*' performance
// measures, long tasks (count / total / longest, first 10 s) and the JS time of rAF callbacks 1..8 and their end times.
import { chromium } from 'playwright-core';
const [url = 'http://127.0.0.1:5600/', runs = '5', q = 'start=0', mode = 'phone'] = process.argv.slice(2);
const rate = Number(process.env.THROTTLE ?? 1);
const med = (a) => [...a].sort((x, y) => x - y)[Math.floor(a.length / 2)];
const all = [];
for (let r = 0; r < Number(runs); r++) {
  const browser = await chromium.launch({ executablePath: '/usr/sbin/chromium', args: ['--headless=new', '--use-gl=angle', `--use-angle=${process.env.GPU ?? 'vulkan'}`, '--enable-gpu', '--ignore-gpu-blocklist'] });
  try {
    const ctx = await browser.newContext(mode === 'phone'
      ? { viewport: { width: 411, height: 777 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, userAgent: 'Mozilla/5.0 (Linux; Android 15; Pixel) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0 Mobile Safari/537.36' }
      : { viewport: { width: 1280, height: 800 } });
    const page = await ctx.newPage();
    page.on('pageerror', (e) => console.error('[pageerror]', e.message));
    if (rate > 1) { const cdp = await ctx.newCDPSession(page); await cdp.send('Emulation.setCPUThrottlingRate', { rate }); }
    await page.addInitScript(() => {
      const S = (window.__cs = { arbor: 0, wx: 0, long: [], raf: [] });
      let v; Object.defineProperty(window, '__arbor', { configurable: true, get: () => v, set: (x) => { v = x; if (!S.arbor) S.arbor = performance.now(); } });
      try { new PerformanceObserver((l) => { for (const e of l.getEntries()) S.long.push([Math.round(e.startTime), Math.round(e.duration)]); }).observe({ type: 'longtask', buffered: true }); } catch { /* none */ }
      const raf = window.requestAnimationFrame.bind(window);
      window.requestAnimationFrame = (cb) => raf((t) => { const t0 = performance.now(); try { cb(t); } finally { const t1 = performance.now(); if (S.raf.length < 400) S.raf.push([Math.round(t1), +(t1 - t0).toFixed(1)]); if (!S.wx) { const e = document.querySelector('#wx .wx-sky'); if (e && e.textContent) S.wx = t1; } } });
    });
    await page.goto(`${url}?${q}`);
    await page.waitForFunction(() => window.__cs && window.__cs.wx > 0, null, { timeout: 120000 });
    await page.waitForTimeout(3000 * Math.max(1, rate / 2));
    const o = await page.evaluate(() => {
      const S = window.__cs, C = window.__arbor.clouds, lt = S.long.filter((l) => l[0] < 10000);
      return { arbor: Math.round(S.arbor), wx: Math.round(S.wx), measures: performance.getEntriesByType('measure').filter((m) => m.name.startsWith('clouds')).map((m) => `${m.name}@${Math.round(m.startTime)}=${m.duration.toFixed(1)}`),
        longN: lt.length, longSum: lt.reduce((a, l) => a + l[1], 0), longMax: Math.max(0, ...lt.map((l) => l[1])), long: lt.filter((l) => l[1] > 150), raf8: S.raf.slice(0, 8),
        rafLate: +(S.raf.slice(20).reduce((a, f) => a + f[1], 0) / Math.max(1, S.raf.length - 20)).toFixed(2), rafMaxLate: Math.max(0, ...S.raf.slice(8).map((f) => f[1])),
        cloudMs: C ? +(C.stats.sumMs / Math.max(1, C.stats.frames)).toFixed(3) : null, cloudMax: C ? +C.stats.maxMs.toFixed(2) : null, programs: window.__arbor.stage.renderer.info.programs.length };
    });
    all.push(o);
    console.log(`run ${r}`, JSON.stringify(o));
  } finally { await browser.close(); }
}
console.log(`SUMMARY ${q} x${rate} ${mode}: arbor median ${med(all.map((o) => o.arbor))} [${all.map((o) => o.arbor).join(' ')}]  wx median ${med(all.map((o) => o.wx))} [${all.map((o) => o.wx).join(' ')}]  longSum median ${med(all.map((o) => o.longSum))}`);

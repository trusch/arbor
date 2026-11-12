// Diagnostic for the "hold this season" smoke check: samples leaf colour stats and their candidate inputs every 200 ms.
// Usage: node scripts/holdprobe.mjs [url] [extra query]
import { chromium } from 'playwright-core';
const url = process.argv[2] ?? 'http://10.77.0.2:8050/', extra = process.argv[3] ?? '';
const browser = await chromium.launch({ executablePath: '/usr/sbin/chromium', args: ['--headless=new', '--use-gl=angle', '--use-angle=vulkan', '--enable-gpu', '--ignore-gpu-blocklist'] });
const ctx = await browser.newContext({ viewport: { width: 412, height: 915 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true, userAgent: 'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Mobile Safari/537.36' });
const mp = await ctx.newPage();
await mp.goto(url + '?speed=0&weather=calm' + extra);
await mp.waitForFunction(() => window.__arbor !== undefined);
await mp.evaluate(() => { const A = window.__arbor; A.params.sky.timeOfDay = 13; A.fastForward(60); });
await mp.waitForTimeout(8000);
await mp.evaluate(() => { const A = window.__arbor; A.automation.userSet('season.hold', true); A.automation.userSet('season.date', 0.62); A.params.time.speed = 1; });
await mp.waitForTimeout(4000);
const rows = await mp.evaluate(() => new Promise((res) => {
  const A = window.__arbor, out = []; let last = -1; const t0 = performance.now();
  const stat = () => { const n = A.leaves.mesh.count, c = A.leaves.mesh.instanceColor.array, m = A.leaves.mesh.instanceMatrix.array;
    let r = 0, g = 0, b = 0, k = 0, red = 0;
    for (let i = 0; i < n; i++) { const o = i * 16; if (m[o + 4] * m[o + 4] + m[o + 5] * m[o + 5] + m[o + 6] * m[o + 6] < 1e-8) continue; r += c[i * 3]; g += c[i * 3 + 1]; b += c[i * 3 + 2]; k++; if (c[i * 3] > 1.5 * c[i * 3 + 1]) red++; }
    const cam = A.stage.camera.position, tg = A.stage.controls.target;
    return { ms: Math.round(performance.now() - t0), t: +A.sim.time.toFixed(2), count: n, n: k, rg: +(r / g).toFixed(3), lum: +((r + g + b) / k).toFixed(2), red: +(red / k).toFixed(3), passes: A.leaves.passes, open: A.leaves.passOpen, lv: A.sim.lightVersion, camAz: +Math.atan2(cam.z - tg.z, cam.x - tg.x).toFixed(3), tod: A.params.sky.timeOfDay, keyI: A.stage.atmo.keyIntensity }; };
  const f = () => { if (A.leaves.passes !== last) { last = A.leaves.passes; out.push(stat()); } if (performance.now() - t0 < 25000) requestAnimationFrame(f); else res(out); };
  f();
}));
for (const r of rows) console.log(JSON.stringify(r));
const rg = rows.map((r) => r.rg), lum = rows.map((r) => r.lum);
console.log('SUMMARY passes', rows.length, 'rg', Math.min(...rg), Math.max(...rg), 'lum', Math.min(...lum), Math.max(...lum));
await browser.close();

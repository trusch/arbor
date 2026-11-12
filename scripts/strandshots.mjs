// Before/after shots for the hanging-strand fix: fixed cameras (independent of the tree's bbox), same seed.
// Usage: node scripts/strandshots.mjs URL prefix [extraQuery]   env: MODES=desktop,phone  TIMES=30,60,90
// Output: shots/<prefix>-<mode>-t<T>-wide.png for every T, and at the last T also -under.png and -side.png.
import { mkdirSync } from 'node:fs';
import { chromium } from 'playwright-core';
const url = process.argv[2] ?? 'http://127.0.0.1:5420/', PRE = process.argv[3] ?? 'strands', extra = process.argv[4] ?? '';
const times = (process.env.TIMES ?? '30,60,90').split(',').map(Number);
mkdirSync('shots', { recursive: true });
const browser = await chromium.launch({ executablePath: '/usr/sbin/chromium', args: ['--headless=new', '--use-gl=angle', `--use-angle=${process.env.GPU ?? 'vulkan'}`, '--enable-gpu', '--ignore-gpu-blocklist'] });
const cam = (page, pos, tgt) => page.evaluate(([p, t]) => {
  const a = window.__arbor; a.params.camera.autoFrame = false;
  a.stage.controls.target.set(...t); a.stage.camera.position.set(...p); a.stage.controls.update?.(); a.fastForward(0);
}, [pos, tgt]);
try {
  for (const mode of (process.env.MODES ?? 'desktop,phone').split(',')) {
    const phone = mode === 'phone';
    const ctx = await browser.newContext(phone
      ? { viewport: { width: 411, height: 777 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, userAgent: 'Mozilla/5.0 (Linux; Android 15; Pixel) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0 Mobile Safari/537.36' }
      : { viewport: { width: 1280, height: 800 } });
    const page = await ctx.newPage();
    page.on('pageerror', (e) => console.error('[pageerror]', e.message));
    await page.goto(`${url}?nogui=1&hideui=1&speed=0&autoRotate=false&cinema=false&weather=calm&timeOfDay=13${phone ? '' : '&quality=High'}${extra ? '&' + extra : ''}`);
    await page.waitForFunction(() => window.__arbor !== undefined);
    await page.evaluate(() => { window.__arbor.params.sky.timeOfDay = 13; });
    const k = phone ? 1.9 : 1;
    let done = 0;
    for (const t of times) {
      await page.evaluate((s) => window.__arbor.fastForward(s), t - done); done = t;
      await cam(page, [15 * k, 4.5, 11 * k], [0, 4.2, 0]);
      await page.waitForTimeout(2500);
      await page.screenshot({ path: `shots/${PRE}-${mode}-t${t}-wide.png` });
    }
    await cam(page, [6.5, 1.9, 4.5], [0, 2.6, 0]);
    await page.waitForTimeout(2500);
    await page.screenshot({ path: `shots/${PRE}-${mode}-t${done}-under.png` });
    await cam(page, [-13 * k, 3.5, 14 * k], [0, 4.2, 0]);
    await page.waitForTimeout(2500);
    await page.screenshot({ path: `shots/${PRE}-${mode}-t${done}-side.png` });
    console.log(mode, await page.evaluate(() => { const a = window.__arbor; return [a.params.sky.quality, a.sim.nodes.length, +a.sim.time.toFixed(1), a.frameErrors()]; }));
    await ctx.close();
  }
} finally { await browser.close(); }

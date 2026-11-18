// Year-3 form shots: grows `?years=3` to T in the app (fastForward), then wide (size against the meadow), framed (the
// app's automatic camera) and under (low under the crown looking up), summer and winter, desktop and phone emulation.
// Usage: PORT=5801 node scripts/majestic.mjs URL prefix   T=750 MODES=desktop,phone DATES=summer:0.3,winter:0.85 GPU=vulkan
import { mkdirSync } from 'node:fs';
import { chromium } from 'playwright-core';
const url = process.argv[2] ?? 'http://127.0.0.1:5801/', prefix = process.argv[3] ?? 'maj', E = process.env, T = Number(E.T ?? 750);
mkdirSync('shots', { recursive: true });
const browser = await chromium.launch({ executablePath: '/usr/sbin/chromium', args: ['--headless=new', '--use-gl=angle', `--use-angle=${E.GPU ?? 'vulkan'}`, '--enable-gpu', '--ignore-gpu-blocklist'] });
const phone = { viewport: { width: 411, height: 777 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, userAgent: 'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Mobile Safari/537.36' };
try {
  for (const mode of (E.MODES ?? 'desktop,phone').split(',')) for (const d of (E.DATES ?? 'summer:0.3,winter:0.85').split(',')) {
    const [name, date] = d.split(':');
    const ctx = await browser.newContext(mode === 'phone' ? phone : { viewport: { width: 1280, height: 800 } });
    const page = await ctx.newPage();
    await page.goto(`${url}?start=0&nogui=1&years=3&cycle=false&timeOfDay=13&weather=calm&cinema=false&speed=0&season.date=${date}&season.hold=true`);
    await page.waitForFunction(() => window.__arbor !== undefined);
    while (await page.evaluate(() => window.__arbor.sim.time) < T - 0.01) await page.evaluate((T) => window.__arbor.fastForward(Math.min(15, T - window.__arbor.sim.time)), T);
    await page.evaluate(() => { const a = window.__arbor; a.params.camera.autoFrame = true; a.stage.autoCamera?.(); a.fastForward(0); });
    await page.waitForTimeout(4000);
    const info = await page.evaluate(() => { const a = window.__arbor, s = a.sim; let h = 0; for (const n of s.nodes) if (!s.chains[n.chain].pruned && n.wy > h) h = n.wy; return { h: +h.toFixed(2), nodes: s.nodes.length, leaves: s.leaves.length, check: s.structureCheck().differing, programs: a.stage.renderer.info.programs?.length }; });
    console.log(mode, name, JSON.stringify(info));
    await page.screenshot({ path: `shots/${prefix}-${mode}-${name}-framed.png` });
    const H = info.h;
    const cam = async (t, p, tag) => {
      await page.evaluate(([t, p]) => { const a = window.__arbor; a.params.camera.autoFrame = false; a.stage.takeControl?.(); a.stage.controls.target.set(...t); a.stage.camera.position.set(...p); a.stage.controls.update?.(); a.fastForward(0); }, [t, p]);
      await page.waitForTimeout(2500);
      await page.screenshot({ path: `shots/${prefix}-${mode}-${name}-${tag}.png` });
    };
    await cam([0, H * 0.45, 0], [H * 2.6, H * 0.2 + 1.5, H * 2.2], 'wide');
    await cam([0, H * 0.6, 0], [H * 0.42, 1.6, H * 0.28], 'under');
    await ctx.close();
  }
} finally { await browser.close(); }

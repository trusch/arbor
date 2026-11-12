// Start-screen screenshots on the real GPU: phone (411x777) and desktop (1280x800), noon and night, five rolls,
// the picker in use, the moment after "start", and three randomised trees at t = 60.
// Usage: PORT=5600 node scripts/startshots.mjs [prefix] [parts: screen,rolls,use,trees]   -> shots/<prefix>-*.png
import { mkdirSync } from 'node:fs';
import { chromium } from 'playwright-core';

const url = `http://127.0.0.1:${process.env.PORT ?? 5600}/`;
const prefix = process.argv[2] ?? 'start';
const parts = (process.argv[3] ?? 'screen,rolls,use,trees').split(',');
const ROLLS = (process.env.ROLLS ?? '1,2,3,4,5').split(',');
mkdirSync('shots', { recursive: true });
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM ?? '/usr/sbin/chromium',
  args: process.env.SHOT_GPU === 'swiftshader' ? ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist']
    : ['--use-angle=vulkan', '--enable-features=Vulkan', '--ignore-gpu-blocklist', '--enable-gpu'],
});
const MODES = {
  phone: { viewport: { width: 411, height: 777 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true,
    userAgent: 'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Mobile Safari/537.36' },
  desk: { viewport: { width: 1280, height: 800 } },
};
async function open(mode, q) {
  const ctx = await browser.newContext(MODES[mode]);
  const page = await ctx.newPage();
  page.on('pageerror', (e) => console.log('pageerror', e.message));
  await page.goto(`${url}?${q}`, { waitUntil: 'domcontentloaded', timeout: 120000 });
  await page.waitForFunction(() => window.__arbor !== undefined, null, { timeout: 120000 });
  await page.waitForTimeout(2500);
  return { ctx, page };
}
const shot = (page, name) => page.screenshot({ path: `shots/${prefix}-${name}.png` }).then(() => console.log(`shots/${prefix}-${name}.png`));
try {
  for (const mode of (process.env.MODES ?? 'phone,desk').split(',')) {
    if (parts.includes('screen')) for (const [name, q] of [['noon', 'timeOfDay=12.5'], ['night', 'timeOfDay=0.5']]) {
      const { ctx, page } = await open(mode, `start=1&roll=1&weather=calm&${q}`);
      await shot(page, `${mode}-${name}`);
      await ctx.close();
    }
    if (parts.includes('rolls')) for (const r of ROLLS) {
      const { ctx, page } = await open(mode, `start=1&roll=${r}&weather=calm`);
      console.log(mode, 'roll', r, await page.evaluate(() => { const s = window.__arbor.start().proposal; return `${s.name} | ${document.getElementById('arbor-start-facts').textContent}`; }));
      await shot(page, `${mode}-roll${r}`);
      await ctx.close();
    }
    if (parts.includes('use')) {
      const { ctx, page } = await open(mode, 'start=1&roll=2&weather=calm');
      await page.click('.as-form[data-form="maple"]');
      await page.evaluate(() => { const i = document.querySelector('[data-start-param="leaves.hue"]'); i.value = '0.08'; i.dispatchEvent(new Event('input', { bubbles: true })); });
      await page.waitForTimeout(500);
      await shot(page, `${mode}-picker`);
      await page.click('#arbor-start-go');
      await page.waitForTimeout(250);
      await shot(page, `${mode}-leaving`);
      await page.waitForTimeout(3500);
      await shot(page, `${mode}-started`);
      await ctx.close();
    }
    if (parts.includes('trees')) for (const r of ROLLS) {
      const { ctx, page } = await open(mode, `start=1&roll=${r}&weather=calm&cinema=false&season.on=false`);
      await page.click('#arbor-start-go');
      const info = await page.evaluate(() => { const A = window.__arbor; A.params.time.speed = 0; return { name: A.start().proposal.name, ...A.fastForward(60) }; });
      console.log(mode, 'tree', r, JSON.stringify(info));
      await page.waitForTimeout(4000);
      await shot(page, `${mode}-tree${r}-t60`);
      await ctx.close();
    }
  }
} finally {
  await browser.close();
}

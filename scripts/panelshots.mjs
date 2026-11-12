// Controls-panel screenshots: phone (411x777) closed / open / colours in use, plus desktop.
// Usage: PORT=5300 node scripts/panelshots.mjs [prefix]   (needs a dev or preview server on PORT) -> shots/<prefix>-*.png
import { mkdirSync } from 'node:fs';
import { chromium } from 'playwright-core';

const url = `http://localhost:${process.env.PORT ?? 5300}/`;
const prefix = process.argv[2] ?? 'panel';
mkdirSync('shots', { recursive: true });
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM ?? '/usr/sbin/chromium',
  args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'],
});
const phone = { viewport: { width: 411, height: 777 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true,
  userAgent: 'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Mobile Safari/537.36' };
async function open(ctxOpts, q) {
  const ctx = await browser.newContext(ctxOpts);
  const page = await ctx.newPage();
  await page.goto(`${url}?cinema=false&t=${process.env.SHOT_T ?? 35}&${q}`, { waitUntil: 'domcontentloaded', timeout: 120000 });
  await page.waitForFunction(() => window.__arbor !== undefined, null, { timeout: 120000 });
  await page.waitForTimeout(1500);
  return { ctx, page };
}
const shot = (page, name) => page.screenshot({ path: `shots/${prefix}-${name}.png` }).then(() => console.log(`shots/${prefix}-${name}.png`));
try {
  const { ctx, page } = await open(phone, 'speed=0.25');
  await shot(page, 'phone-closed');
  await page.tap('#arbor-panel-open');
  await page.waitForTimeout(400);
  await shot(page, 'phone-open-grow');
  await page.tap('[data-tab="shape"]');
  await page.waitForTimeout(300);
  await shot(page, 'phone-shape');
  await page.tap('[data-tab="colours"]');
  await page.tap('#arbor-surprise');
  await page.waitForTimeout(2500);
  await shot(page, 'phone-colours');
  await page.locator('[data-colour="sky"]').scrollIntoViewIfNeeded();
  await page.waitForTimeout(400);
  await shot(page, 'phone-colours-2');
  await page.tap('[data-tab="sky"]');
  await page.waitForTimeout(300);
  await shot(page, 'phone-sky');
  await page.tap('[data-tab="more"]');
  await page.locator('summary', { hasText: 'Thickness' }).tap();
  await page.waitForTimeout(300);
  await shot(page, 'phone-more');
  await ctx.close();
  const d = await open({ viewport: { width: 1280, height: 800 } }, 'quality=Low&tab=shape');
  await shot(d.page, 'desktop');
  await d.ctx.close();
} finally {
  await browser.close();
}

// Blossom picker on the phone layout: opens the Leaves tab on a tree in bloom, scrolls to the picker, takes a screenshot,
// then taps a type and a colour swatch and reports what the tree draws. Usage: PORT=5546 node scripts/blossompicker.mjs [prefix]
import { spawn } from 'node:child_process';
import { chromium } from 'playwright-core';
const prefix = process.argv[2] ?? 'picker', PORT = Number(process.env.PORT ?? 5546);
const vite = spawn('npx', ['vite', '--port', String(PORT), '--strictPort'], { stdio: ['ignore', 'pipe', 'inherit'] });
await new Promise((res) => vite.stdout.on('data', (d) => String(d).includes('Local') && res()));
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM ?? '/usr/sbin/chromium', args: ['--headless=new', '--use-gl=angle', `--use-angle=${process.env.GPU ?? 'vulkan'}`, '--enable-gpu', '--ignore-gpu-blocklist'] });
try {
  const ctx = await browser.newContext({ viewport: { width: 411, height: 777 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, userAgent: 'Mozilla/5.0 (Linux; Android 15; Pixel) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0 Mobile Safari/537.36' });
  const page = await ctx.newPage();
  page.on('pageerror', (e) => console.error('[pageerror]', e.message));
  await page.goto(`http://localhost:${PORT}/?cycle=false&speed=0&weather=calm&timeOfDay=14&season.date=0.056&season.hold=true&panel=open&tab=colours`);
  await page.waitForFunction(() => window.__arbor !== undefined);
  await page.evaluate(() => window.__arbor.fastForward(90));
  await page.waitForTimeout(6000);
  const state = () => page.evaluate(() => { const A = window.__arbor; return { type: A.params.season.blossomType, colour: A.params.season.blossomColour, sig: A.blossom.signature(), programs: A.stage.renderer.info.programs.length }; });
  await page.locator('[data-blossom="auto"]').scrollIntoViewIfNeeded();
  await page.evaluate(() => document.querySelector('[data-blossom="auto"]').scrollIntoView({ block: 'start' }));
  await page.waitForTimeout(1500);
  await page.screenshot({ path: `shots/${prefix}-phone-1.png` });
  console.log('before', JSON.stringify(await state()));
  await page.locator('[data-blossom="cherry"]').tap();
  await page.waitForTimeout(1500);
  console.log('cherry', JSON.stringify(await state()));
  await page.locator('[data-colour="blossom"]').evaluate((el) => el.closest('.ap-colour').querySelectorAll('.ap-swatch')[2].click());
  await page.waitForTimeout(1500);
  await page.evaluate(() => document.querySelector('[data-colour="blossom"]').scrollIntoView({ block: 'center' }));
  await page.waitForTimeout(800);
  await page.screenshot({ path: `shots/${prefix}-phone-2.png` });
  console.log('swatch', JSON.stringify(await state()));
  await ctx.close();
} finally { await browser.close(); vite.kill(); }

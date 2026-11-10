// Headless phone-emulated load against the deployed server; prints this session's telemetry records.
import { chromium } from 'playwright-core';
import fs from 'node:fs';
const url = process.argv[2] ?? 'http://10.77.0.2:8050/';
const secs = Number(process.argv[3] ?? 12);
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM ?? '/usr/sbin/chromium',
  args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--enable-precise-memory-info'] });
const ctx = await browser.newContext({ viewport: { width: 412, height: 915 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true,
  userAgent: 'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Mobile Safari/537.36 telcheck' });
const page = await ctx.newPage();
page.on('pageerror', (e) => console.log('pageerror', e.message));
await page.goto(url);
await page.waitForTimeout(secs * 1000);
const sid = await page.evaluate(() => window.__tel?.sid);
await page.close(); // fires pagehide
await new Promise((r) => setTimeout(r, 800));
await browser.close();
const recs = fs.readFileSync(new URL('../logs/client.jsonl', import.meta.url), 'utf8').trim().split('\n').map((l) => JSON.parse(l)).filter((r) => r.sid === sid);
const by = {};
for (const r of recs) by[r.type] = (by[r.type] ?? 0) + 1;
console.log('sid', sid, by);
for (const t of ['start', 'info', 'prev_unclean', 'prev_clean', 'error', 'console_error', 'pagehide']) { const r = recs.find((x) => x.type === t); if (r) console.log(t, JSON.stringify(r).slice(0, 900)); }
const hb = recs.filter((r) => r.type === 'hb');
if (hb.length) console.log('last hb', JSON.stringify(hb.at(-1)));

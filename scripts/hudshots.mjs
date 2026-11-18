// Info-overlay (almanac strip) screenshots across conditions, phone portrait (411x777) and desktop (1280x800).
// Usage: PORT=5391 node scripts/hudshots.mjs [prefix] [phone|desk|both] [quick]   -> shots/<prefix>-<layout>-<state>.png
// Prints, per shot, the strip's text next to the `__arbor` values it must agree with.
import { mkdirSync } from 'node:fs';
import { chromium } from 'playwright-core';

const url = `http://localhost:${process.env.PORT ?? 5391}/`;
const prefix = process.argv[2] ?? 'hud', which = process.argv[3] ?? 'both', quick = process.argv[4] === 'quick';
mkdirSync('shots', { recursive: true });
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM ?? '/usr/sbin/chromium',
  args: ['--use-gl=angle', `--use-angle=${process.env.SHOT_GPU ?? 'vulkan'}`, '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--enable-features=Vulkan'],
});
const LAYOUTS = {
  phone: { viewport: { width: 411, height: 777 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true,
    userAgent: 'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Mobile Safari/537.36' },
  desk: { viewport: { width: 1280, height: 800 } },
};
const read = (page) => page.evaluate(() => {
  const A = window.__arbor, at = A.stage.atmo, txt = (s) => document.querySelector(s)?.textContent ?? null;
  const vis = (s) => { const e = document.querySelector(s); if (!e) return null; const r = e.getBoundingClientRect(); return getComputedStyle(e).display !== 'none' && r.width > 0 ? [Math.round(r.left), Math.round(r.top), Math.round(r.right), Math.round(r.bottom)] : 'hidden'; };
  return { hour: +A.params.sky.timeOfDay.toFixed(2), sunH: +at.sunH.toFixed(2), moonY: +at.moonDir.y.toFixed(2), moonPhase: +at.moonPhase.toFixed(2), season: A.season.name, year: A.season.year, phase: +A.season.phase.toFixed(3), kind: A.weather.kind,
    strip: txt('#arbor-hud'), old: txt('#overlay'), wx: txt('#wx'), body: document.querySelector('#arbor-hud-body')?.dataset ?? null,
    rects: { hud: vis('#arbor-hud'), wx: vis('#wx'), open: vis('#arbor-panel-open'), sound: vis('#arbor-sound'), autocam: vis('#arbor-auto-camera'), next: vis('#arbor-next-shot'), panel: vis('#arbor-panel') } };
});
const STATES = [
  ['noon', { hour: 12, date: 0.375, kind: 'clear' }], ['sunset', { hour: 20.3, date: 0.4, kind: 'fair' }], ['storm', { hour: 15, date: 0.3, kind: 'storm' }],
  ['night', { hour: 23.5, date: 0.45, kind: 'clear' }], ['winter', { hour: 11, date: 0.9, kind: 'overcast' }], ['bloom', { hour: 10, date: 0.056, kind: 'fair' }],
];
try {
  for (const lay of which === 'both' ? ['phone', 'desk'] : [which]) {
    const ctx = await browser.newContext(LAYOUTS[lay]);
    const page = await ctx.newPage();
    page.on('pageerror', (e) => console.log('PAGEERROR', e.message));
    const shot = async (name) => { await page.screenshot({ path: `shots/${prefix}-${lay}-${name}.png` }); console.log(`shots/${prefix}-${lay}-${name}.png`, JSON.stringify(await read(page))); };
    const go = async (q) => { await page.goto(`${url}?${q}`, { waitUntil: 'domcontentloaded', timeout: 120000 }); await page.waitForFunction(() => window.__arbor !== undefined, null, { timeout: 120000 }); };
    const expand = async (on) => page.evaluate((on) => { const b = document.querySelector('#arbor-hud-strip'); if (b && (b.getAttribute('aria-expanded') === 'true') !== on) b.click(); }, on);
    await go('cycle=false&cinema=false&speed=0&panel=closed&start=0&t=70&season.on=true&preset=Cherry%20blossom');
    await page.waitForTimeout(2500);
    for (const [name, s] of quick ? STATES.slice(0, 1) : STATES) {
      await page.evaluate((s) => {
        const a = window.__arbor; a.params.sky.timeOfDay = s.hour; a.params.sky.moonPhase = 0.36; a.params.season.date = s.date; a.params.season.hold = true;
        a.params.weather.event = 'auto'; a.params.weather.kind = s.kind;
        if (s.kind === 'storm') { a.weather.snapStorm(); a.weather.nextStrike = 1e9; } else a.weather.snap(s.kind);
      }, s);
      await expand(false);
      await page.waitForTimeout(name === 'noon' ? 3500 : 5000);
      await shot(name);
      if (!quick) { await expand(true); await page.waitForTimeout(700); await shot(`${name}-expanded`); }
    }
    await expand(false);
    // Panel open (compact and expanded).
    await page.evaluate(() => { const a = window.__arbor; a.params.sky.timeOfDay = 12; a.weather.snap('fair'); a.params.weather.kind = 'fair'; a.params.season.date = 0.3; });
    await page.click('#arbor-panel-open'); await page.waitForTimeout(1200); await shot('panel-open');
    if (!quick) { await expand(true); await page.waitForTimeout(500); await shot('panel-open-expanded'); await expand(false); }
    await page.click('#arbor-panel-close');
    // Hand-set camera: the auto-camera pill shows.
    await page.evaluate(() => { const s = window.__arbor.stage; s.takeControl(); });
    await page.waitForTimeout(1200); await shot('manual');
    if (!quick) { await expand(true); await page.waitForTimeout(500); await shot('manual-expanded'); await expand(false); }
    // Director running (next-shot button), seedling at t = 5.
    await go('cycle=false&cinema=true&speed=0&panel=closed&start=0&t=5&timeOfDay=9');
    await page.waitForTimeout(3000); await shot('seedling-director');
    // Start screen.
    await go('start=1'); await page.waitForTimeout(4000); await shot('start');
    // Watch mode (H).
    await go('cycle=false&speed=0&panel=closed&start=0&t=35'); await page.waitForTimeout(1500); await page.keyboard.press('h'); await page.waitForTimeout(400); await shot('watch');
    await ctx.close();
  }
} finally { await browser.close(); }

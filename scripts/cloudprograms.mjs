// Program counts in phone emulation, two builds side by side at the same moments: every cloud kind at each hour.
//   node scripts/cloudprograms.mjs URL_A URL_B [hours=12,19.4,23.5] [kinds]
import { chromium } from 'playwright-core';
const [A = 'http://127.0.0.1:5902/', B = 'http://127.0.0.1:5901/', hours = '12,19.4,23.5', kinds = 'clear,fair,cloudy,overcast,rain,storm,mist'] = process.argv.slice(2);
const browser = await chromium.launch({ executablePath: '/usr/sbin/chromium', args: ['--headless=new', '--use-gl=angle', '--use-angle=vulkan', '--enable-gpu', '--ignore-gpu-blocklist'] });
try {
  for (const hour of hours.split(',')) {
    const pages = [];
    for (const url of [A, B]) {
      const ctx = await browser.newContext({ viewport: { width: 411, height: 777 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, userAgent: 'Mozilla/5.0 (Linux; Android 15; Pixel) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0 Mobile Safari/537.36' });
      const page = await ctx.newPage();
      page.on('pageerror', (e) => console.error('[pageerror]', e.message));
      await page.goto(`${url}?cycle=false&speed=0&panel=closed&cinema=false&weather.kind=clear&timeOfDay=${hour}&season.date=0.375&season.hold=true&sky.moonPhase=0.5`, { timeout: 180000 });
      await page.waitForFunction(() => window.__arbor !== undefined, null, { timeout: 180000 });
      await page.evaluate(() => { const a = window.__arbor; a.fastForward(90); a.params.weather.event = 'auto'; });
      pages.push(page);
    }
    await pages[0].waitForTimeout(12000);
    for (const kind of kinds.split(',')) {
      for (const p of pages) await p.evaluate((kind) => { const a = window.__arbor; a.params.weather.kind = kind; a.weather.snap(kind); if (a.clouds) a.clouds.amount = -1; }, kind);
      await pages[0].waitForTimeout(6000);
      const r = [];
      for (const p of pages) r.push(await p.evaluate(() => { const a = window.__arbor; return { programs: a.stage.renderer.info.programs.length, calls: a.stage.renderer.info.render.calls, quads: a.clouds?.stats.quads, deck: a.clouds?.deck.visible, fe: a.frameErrors() }; }));
      console.log('hour', hour, kind, 'A', JSON.stringify(r[0]), 'B', JSON.stringify(r[1]), r[0].programs === r[1].programs ? 'EQUAL' : 'DIFFERENT');
    }
    for (const p of pages) await p.context().close();
  }
} finally { await browser.close(); }

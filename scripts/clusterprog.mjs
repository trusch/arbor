// P7 gate: phone program count with `?clusters=1` vs `?clusters=0` on the year-3 tree at noon, night and in a storm,
// plus a framed shot per leaf form with clusters (live form switch). Usage: node scripts/clusterprog.mjs URL [prefix]
import { chromium } from 'playwright-core';
const [url, prefix = 'cprog'] = process.argv.slice(2);
const FORMS = (process.env.FORMS ?? 'oak,willow,birch,maple,ginkgo,round,spray,frond,ring,spiral').split(',');
const browser = await chromium.launch({ executablePath: '/usr/sbin/chromium', args: ['--headless=new', '--use-gl=angle', '--use-angle=vulkan', '--enable-gpu', '--ignore-gpu-blocklist'] });
const out = {};
try {
  for (const [name, q] of [['noon', 'timeOfDay=13&weather=calm'], ['night', 'timeOfDay=0.5&weather=calm'], ['storm', 'timeOfDay=13&weather=storm']]) {
    for (const cl of ['0', '1']) {
      const ctx = await browser.newContext({ viewport: { width: 411, height: 777 }, deviceScaleFactor: 2.625, isMobile: true, hasTouch: true, userAgent: 'Mozilla/5.0 (Linux; Android 15; Pixel) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0 Mobile Safari/537.36' });
      const page = await ctx.newPage();
      page.on('pageerror', (e) => console.error('[pageerror]', e.message));
      await page.goto(`${url}?start=0&nogui=1&hideui=1&cinema=false&cycle=false&season.date=0.3&season.hold=true&years=3&clusters=${cl}&${q}`);
      await page.waitForFunction(() => window.__arbor !== undefined);
      await page.evaluate(() => { const a = window.__arbor; a.fastForward(750); a.params.time.paused = true; });
      await page.waitForTimeout(7000);
      out[`${name}-${cl}`] = await page.evaluate(() => { const a = window.__arbor; return { programs: a.stage.renderer.info.programs.length, singles: a.leaves.nS, clusters: a.leaves.nAll - a.leaves.nS }; });
      if (name === 'noon' && cl === '1') {
        for (const f of FORMS) {
          await page.evaluate((f) => { window.__arbor.params.leaves.form = f; }, f);
          await page.waitForTimeout(2500);
          await page.screenshot({ path: `shots/${prefix}-form-${f}.png` });
          out[`form-${f}`] = await page.evaluate(() => window.__arbor.stage.renderer.info.programs.length);
        }
      }
      await ctx.close();
    }
  }
  console.log(JSON.stringify(out));
} finally { await browser.close(); }

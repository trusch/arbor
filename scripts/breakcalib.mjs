// Breakage calibration (audit 3.5): distribution of the load ratio u on the t = 90 oak at gust 1.0 with strength 1 (sigma = SIGMA_REF),
// then 120 s synthetic runs of the rule at several wind strengths with the given sigma values.
// Usage: node scripts/breakcalib.mjs http://127.0.0.1:5401/ [sigma ...]   (no sigma: p99 and the app default)
import { chromium } from 'playwright-core';
const url = process.argv[2] ?? 'http://127.0.0.1:5401/';
const browser = await chromium.launch({ executablePath: '/usr/sbin/chromium', args: ['--headless=new', '--use-gl=angle', `--use-angle=${process.env.GPU ?? 'vulkan'}`, '--enable-gpu', '--ignore-gpu-blocklist'] });
const open = async (q = '') => {
  const page = await browser.newPage({ viewport: { width: 800, height: 600 } });
  await page.goto(`${url}?nogui=1&cinema=false&speed=0&breakage=0${q}`);
  await page.waitForFunction(() => window.__arbor !== undefined);
  await page.evaluate(() => window.__arbor.fastForward(90));
  return page;
};
try {
  let page = await open();
  const dist = await page.evaluate(() => ({ d: window.__arbor.loadRatios(1, 1), def: window.__arbor.params.breakage.strength, windDir: [window.__arbor.wind.dirX, window.__arbor.wind.dirZ] }));
  console.log('u at gust 1.0, sigma 1:', JSON.stringify(dist.d));
  console.log('app default sigma:', dist.def);
  await page.close();
  const sigmas = process.argv.slice(3).map(Number);
  if (!sigmas.length) sigmas.push(dist.def);
  for (const sigma of [...new Set(sigmas)]) for (const base of (process.env.BASES ?? "1,0.8,0.6,0.35").split(",").map(Number)) {
    page = await open();
    const r = await page.evaluate(([b, s]) => window.__arbor.stormTest(120, b, s), [base, sigma]);
    console.log(`sigma ${sigma} base ${base} 120 s: twigs ${r.twigs} limbs ${r.limbs} maxU ${r.maxU}`, JSON.stringify(r.events));
    await page.close();
  }
} finally { await browser.close(); }

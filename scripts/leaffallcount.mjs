// Falling-leaf counts over a run: node scripts/leaffallcount.mjs http://127.0.0.1:5441/ phone|desk calm|storm [seconds=120]
import { chromium } from 'playwright-core';
const [url = 'http://127.0.0.1:5441/', mode = 'phone', wx = 'storm', secs = '120'] = process.argv.slice(2);
const browser = await chromium.launch({ executablePath: '/usr/sbin/chromium', args: ['--headless=new', '--use-gl=angle', `--use-angle=${process.env.GPU ?? 'vulkan'}`, '--enable-gpu', '--ignore-gpu-blocklist'] });
try {
  const ctx = await browser.newContext(mode === 'phone'
    ? { viewport: { width: 411, height: 777 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, userAgent: 'Mozilla/5.0 (Linux; Android 15; Pixel) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0 Mobile Safari/537.36' }
    : { viewport: { width: 1280, height: 800 } });
  const page = await ctx.newPage();
  await page.goto(`${url}?nogui=1&hideui=1&speed=0&autoRotate=false&cinema=false&weather=calm${mode === 'desk' ? '&quality=High' : ''}`);
  await page.waitForFunction(() => window.__arbor !== undefined);
  await page.evaluate(() => { const A = window.__arbor; A.params.sky.timeOfDay = 13; A.fastForward(90); });
  await page.waitForTimeout(7000);
  if (Number(process.env.THROTTLE ?? 1) > 1) { const cdp = await ctx.newCDPSession(page); await cdp.send('Emulation.setCPUThrottlingRate', { rate: Number(process.env.THROTTLE) }); }
  const p0 = await page.evaluate((wx) => { const A = window.__arbor; if (wx === 'storm') { A.params.weather.event = 'storm'; A.weather.snapStorm(); } A.leafFall.clear(); const s = A.leafFall.stats; s.spawned = s.landed = s.gone = s.relaunched = s.adopted = s.airPeak = s.recycled = s.maxMs = s.sumMs = s.frames = 0; return { programs: A.stage.renderer.info.programs.length, breaks: { ...A.sim.loadStats } }; }, wx);
  await page.waitForTimeout(Number(secs) * 1000);
  const r = await page.evaluate(() => { const A = window.__arbor; return { quality: A.params.sky.quality, pixelRatio: A.stage.renderer.getPixelRatio(), programs: A.stage.renderer.info.programs.length, fe: A.frameErrors(), breaks: { ...A.sim.loadStats }, debris: { limbs: A.debris.stats.limbs, twigs: A.debris.stats.twigs }, ...A.leafFall.stats }; });
  console.log(mode, wx, `${secs}s`, `throttle ${process.env.THROTTLE ?? 1}`, 'mean ms/frame', (r.sumMs / Math.max(1, r.frames)).toFixed(3), 'frames', r.frames, 'programs before', p0.programs, 'breaks before', JSON.stringify(p0.breaks), JSON.stringify(r));
} finally { await browser.close(); }

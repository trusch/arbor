// Kinds-of-weather proof on the real GPU against a running built app.
//   node scripts/wxkinds.mjs URL kinds [phone|desk] [prefix=wxk]    one shot per kind at noon (app camera, grown tree, readout visible), one at night, program counts
//   node scripts/wxkinds.mjs URL session [phone|desk] [prefix] [seconds=600]   the default experience: bare URL, "Plant this tree", a shot every 20 s for 5 min, a census of the whole run
import { mkdirSync } from 'node:fs';
import { chromium } from 'playwright-core';
const [url = 'http://127.0.0.1:5640/', what = 'kinds', mode = 'phone', prefix = 'wxk', secs = '600'] = process.argv.slice(2);
mkdirSync('shots', { recursive: true });
const browser = await chromium.launch({ executablePath: '/usr/sbin/chromium', args: ['--headless=new', '--use-gl=angle', `--use-angle=${process.env.GPU ?? 'vulkan'}`, '--enable-gpu', '--ignore-gpu-blocklist'] });
const ctx = await browser.newContext(mode === 'phone'
  ? { viewport: { width: 411, height: 777 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, userAgent: 'Mozilla/5.0 (Linux; Android 15; Pixel) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0 Mobile Safari/537.36' }
  : { viewport: { width: 1280, height: 800 } });
const page = await ctx.newPage();
page.on('pageerror', (e) => console.error('[pageerror]', e.message));
const read = () => page.evaluate(() => {
  const a = window.__arbor, W = a.weather, s = a.stage;
  return { kind: W.kind, phase: W.phase, cloud: +W.cloud.toFixed(2), rain: +W.rain.toFixed(2), wind: +a.wind.base.toFixed(2), temp: +W.temp.toFixed(1), hour: +a.params.sky.timeOfDay.toFixed(2), date: +a.season.phase.toFixed(3), year: a.season.year,
    strikes: W.strikes, programs: s.renderer.info.programs.length, wx: document.getElementById('wx')?.textContent ?? '', sunI: +s.sun.intensity.toFixed(2), fog: +s.fog.density.toFixed(4) };
});
try {
  if (what === 'kinds') {
    await page.goto(`${url}?cycle=false&speed=0&panel=closed&weather.kind=fair&timeOfDay=12&season.date=0.375&season.hold=true${mode === 'desk' ? '&quality=High' : ''}`);
    await page.waitForFunction(() => window.__arbor !== undefined);
    await page.evaluate(() => { const a = window.__arbor; a.params.camera.autoFrame = true; a.fastForward(90); });
    await page.waitForTimeout(9000);
    for (const k of ['clear', 'fair', 'cloudy', 'overcast', 'mist', 'windy', 'drizzle', 'shower', 'rain', 'storm', 'night-rain', 'night-clear']) {
      await page.evaluate((k) => {
        const a = window.__arbor, kind = k.replace('night-', '');
        a.params.sky.timeOfDay = k.startsWith('night') ? 23.5 : 12;
        a.params.weather.event = 'auto'; a.params.weather.kind = kind;
        if (kind === 'storm') { a.weather.snapStorm(); a.weather.nextStrike = 1e9; } else a.weather.snap(kind);
      }, k);
      await page.waitForTimeout(k === 'night-rain' || k === 'overcast' ? 9000 : 6000);
      await page.screenshot({ path: `shots/${prefix}-${mode}-${k}.png` });
      console.log(k, JSON.stringify(await read()));
    }
  } else {
    await page.goto(url);
    await page.waitForFunction(() => window.__arbor !== undefined);
    await page.waitForTimeout(3000);
    console.log('before start', JSON.stringify(await read()), 'cycle', await page.evaluate(() => window.__arbor.params.sky.cycle));
    await page.click('#arbor-start-go');
    const T = Number(secs), log = [];
    for (let t = 0; t <= T; t++) {
      const r = await read(); log.push(r);
      if (t % 20 === 0 && t <= 300) { await page.screenshot({ path: `shots/${prefix}-${mode}-s${String(t).padStart(3, '0')}.png` }); console.log(t, JSON.stringify(r)); }
      await page.waitForTimeout(1000);
    }
    // Census per year of the run (300 s each).
    for (let y = 0; y * 300 < T; y++) {
      const L = log.slice(y * 300, (y + 1) * 300 + 1), s = {}; let rains = 0, storms = 0, flips = 0, days = 0, longest = 0, run = 0, windy = 0, still = 0, dark = 0;
      for (let i = 0; i < L.length; i++) {
        s[L[i].kind] = (s[L[i].kind] ?? 0) + 1;
        if (i) {
          if (L[i].rain > 0.05 && L[i - 1].rain <= 0.05) rains++;
          if (L[i].phase === 'rain' && L[i - 1].phase !== 'rain') storms++;
          if ((L[i].cloud < 0.25) !== (L[i - 1].cloud < 0.25)) flips++;
          if (L[i].hour < L[i - 1].hour) days++;
          run = L[i].kind === L[i - 1].kind ? run + 1 : 0; longest = Math.max(longest, run);
        }
        if (L[i].wind >= 0.56) windy++; if (L[i].wind < 0.2 && L[i].hour > 5 && L[i].hour < 20.5) still++; if (L[i].hour < 5 || L[i].hour > 20.5) dark++;
      }
      console.log(`session year ${y + 1}:`, JSON.stringify({ seconds: s, rains, storms, strikes: L[L.length - 1].strikes - L[0].strikes, sunFlips: flips, days, longestSameKind: longest, windy, still, dark, temp: [Math.min(...L.map((r) => r.temp)), Math.max(...L.map((r) => r.temp))], dates: [L[0].date, L[L.length - 1].date], programs: [Math.min(...L.map((r) => r.programs)), Math.max(...L.map((r) => r.programs))] }));
    }
  }
} finally { await browser.close(); }

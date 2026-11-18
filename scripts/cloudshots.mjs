// Cloud shots on the real GPU against a running built app.
//   node scripts/cloudshots.mjs URL phone|desk prefix [case,...]   case = kind@hour[@view][@moonPhase]; front@NN = "Storm now" at noon, shot when weather.cloud reaches NN/100;, view = app (default) | sky (looks up toward the sun side) | wind (looks upwind)
//   BURST=20 node scripts/cloudshots.mjs URL phone pre cloudy@12@sky   -> 10 frames over BURST seconds with weather running, contact sheet <prefix>-<mode>-burst.png
// Prints program count, draw calls, cloud stats (quads, deck, tower, ms) per case. THROTTLE=4 sets CPU throttling.
import { mkdirSync } from 'node:fs';
import { chromium } from 'playwright-core';
const [url = 'http://127.0.0.1:5700/', mode = 'phone', prefix = 'cl', list = 'clear@12,fair@12,cloudy@12,overcast@12,mist@7,windy@12,drizzle@12,shower@12,rain@12,storm@12', q = ''] = process.argv.slice(2);
mkdirSync('shots', { recursive: true });
const browser = await chromium.launch({ executablePath: '/usr/sbin/chromium', args: ['--headless=new', '--use-gl=angle', `--use-angle=${process.env.GPU ?? 'vulkan'}`, '--enable-gpu', '--ignore-gpu-blocklist'] });
const ctx = await browser.newContext(mode === 'phone'
  ? { viewport: { width: 411, height: 777 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, userAgent: 'Mozilla/5.0 (Linux; Android 15; Pixel) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0 Mobile Safari/537.36' }
  : { viewport: { width: 1280, height: 800 } });
const page = await ctx.newPage();
page.on('pageerror', (e) => console.error('[pageerror]', e.message));
const sheetShots = [];
const read = () => page.evaluate(() => {
  const a = window.__arbor, W = a.weather, s = a.stage, C = a.clouds;
  return { kind: W.kind, type: W.cloudType, cloud: +W.cloud.toFixed(2), programs: s.renderer.info.programs.length, calls: s.renderer.info.render.calls, sunI: +s.sun.intensity.toFixed(2),
    cl: C ? { quads: C.stats.quads, amount: +C.stats.amount.toFixed(2), deck: +C.stats.deck.toFixed(2), tower: +C.stats.tower.toFixed(2), blocker: +C.stats.blocker.toFixed(2), ms: +(C.stats.sumMs / Math.max(1, C.stats.frames)).toFixed(3), maxMs: +C.stats.maxMs.toFixed(2) } : null, fe: a.frameErrors() };
});
try {
  await page.goto(`${url}?cycle=false&speed=0&panel=closed&cinema=false&autoRotate=false&weather.kind=fair&timeOfDay=12&season.date=0.375&season.hold=true${mode === 'desk' ? '&quality=High' : ''}${q ? '&' + q : ''}`);
  await page.waitForFunction(() => window.__arbor !== undefined);
  await page.evaluate(() => { const a = window.__arbor; a.params.camera.autoFrame = true; a.fastForward(90); });
  if (process.env.THROTTLE) { const cdp = await ctx.newCDPSession(page); await cdp.send('Emulation.setCPUThrottlingRate', { rate: Number(process.env.THROTTLE) }); }
  await page.waitForTimeout(7000);
  for (const cs of list.split(',')) {
    const [kind, hour = '12', view = 'app', moon = '0.5'] = cs.split('@');
    await page.evaluate(({ kind, hour, view, moon }) => {
      const a = window.__arbor, k = a.params.sky;
      k.timeOfDay = Number(hour); k.moonPhase = Number(moon);
      a.params.weather.event = 'auto'; a.params.weather.kind = kind;
      if (kind === 'front') { a.params.weather.kind = 'auto'; k.timeOfDay = 12; a.weather.snap('fair'); a.weather.trigger(); }
      else if (kind === 'storm') { a.weather.snapStorm(); a.weather.nextStrike = 1e9; } else a.weather.snap(kind);
      a.fastForward(0);
      if (a.clouds) { const C = a.clouds; C.amount = -1; C.stats.frames = 0; C.stats.sumMs = 0; C.stats.maxMs = 0; }
      if (view === 'app') { a.params.camera.autoFrame = true; a.stage.autoCamera?.(); }
      else {
        const A = a.stage.atmo, d = view === 'wind' ? { x: -a.wind.dirX, y: 0.3, z: -a.wind.dirZ } : view === 'moon' ? A.moonDir : view === 'anti' ? { x: -A.sunDir.x, y: 0.3, z: -A.sunDir.z } : A.sunDir;
        const H = a.sim.bboxMax[1], n0 = a.sim.nodes[0], az = Math.atan2(d.z, d.x) + 0.2, D = H * (innerWidth < innerHeight ? 3.0 : 2.1);
        a.params.camera.autoFrame = false; a.stage.takeControl?.(); a.stage.controls.maxPolarAngle = Math.PI;
        const px = n0.wx - Math.cos(az) * D, pz = n0.wz - Math.sin(az) * D, py = 1.7, el = 0.3, baz = Math.atan2(d.z, d.x) + 0.09;
        a.stage.camera.position.set(px, py, pz);
        a.stage.controls.target.set(px + Math.cos(baz) * Math.cos(el) * 10, py + Math.sin(el) * 10, pz + Math.sin(baz) * Math.cos(el) * 10);
      }
    }, { kind, hour, view, moon });
    if (kind === 'front') await page.waitForFunction((c) => window.__arbor.weather.cloud >= c, Number(hour) / 100, { timeout: 90000 }); else await page.waitForTimeout(Number(process.env.WAIT ?? 6000));
    const name = `${prefix}-${mode}-${kind}-${hour.replace('.', '')}${view === 'app' ? '' : '-' + view}${moon === '0.5' ? '' : '-m' + moon.replace('.', '')}`;
    if (process.env.BURST) {
      const N = 10, T = Number(process.env.BURST), shots = [];
      for (let i = 0; i < N; i++) { shots.push((await page.screenshot({ type: 'jpeg', quality: 80 })).toString('base64')); console.log('burst', i, JSON.stringify(await read())); await page.waitForTimeout((T * 1000) / (N - 1)); }
      const sheet = await ctx.newPage();
      await sheet.setViewportSize({ width: 1100, height: mode === 'phone' ? 830 : 560 });
      await sheet.setContent(`<body style="margin:0;background:#111;display:grid;grid-template-columns:repeat(5,1fr);gap:2px">${shots.map((s) => `<img style="width:100%" src="data:image/jpeg;base64,${s}">`).join('')}</body>`);
      await sheet.screenshot({ path: `shots/${name}-burst.png` });
      await sheet.close();
    } else { await page.screenshot({ path: `shots/${name}.png` }); if (process.env.SHEET) sheetShots.push((await page.screenshot({ type: 'jpeg', quality: 85 })).toString('base64')); }
    console.log(name, JSON.stringify(await read()));
  }
  // SHEET=name: contact sheet shots/<name>.jpg of every case of this run, 5 per row.
  if (process.env.SHEET && sheetShots.length) {
    const sheet = await ctx.newPage(), cols = Math.min(5, sheetShots.length), rows = Math.ceil(sheetShots.length / cols);
    await sheet.setViewportSize({ width: mode === 'phone' ? 760 : 1600, height: Math.ceil(rows * (mode === 'phone' ? 760 / cols * 777 / 411 : 1600 / cols * 800 / 1280)) + 2 });
    await sheet.setContent(`<body style="margin:0;background:#111;display:grid;grid-template-columns:repeat(${cols},1fr);gap:2px">${sheetShots.map((s) => `<img style="width:100%" src="data:image/jpeg;base64,${s}">`).join('')}</body>`);
    await sheet.screenshot({ path: `shots/${process.env.SHEET}.jpg`, type: 'jpeg', quality: 88 });
    await sheet.close();
  }
} finally { await browser.close(); }

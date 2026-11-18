// Frame sequence of a weather change on the real GPU against a running built app, as a contact sheet.
//   node scripts/cloudseq.mjs URL phone|desk prefix [kinds=clear,fair,overcast,storm,clear] [view=side|wind|down|app]
// FLASH=1 = lightning flash sequence in a held storm instead. SKY=1 = sky-only camera.
// STAGE_S seconds per kind (default 14), PER frames per kind (default 4), CYCLE=0 stops the day, HOUR start hour.
// The kind is set by hand (params.weather.kind), i.e. the path a user takes in the Sky tab; nothing is snapped after the start.
import { mkdirSync } from 'node:fs';
import { chromium } from 'playwright-core';
const [url = 'http://127.0.0.1:5900/', mode = 'phone', prefix = 'seq', kinds = 'clear,fair,overcast,storm,clear', view = 'side'] = process.argv.slice(2);
const STAGE = Number(process.env.STAGE_S ?? 14), PER = Number(process.env.PER ?? 4), HOUR = process.env.HOUR ?? '9';
mkdirSync('shots', { recursive: true });
const browser = await chromium.launch({ executablePath: '/usr/sbin/chromium', args: ['--headless=new', '--use-gl=angle', `--use-angle=${process.env.GPU ?? 'vulkan'}`, '--enable-gpu', '--ignore-gpu-blocklist'] });
const ctx = await browser.newContext(mode === 'phone'
  ? { viewport: { width: 411, height: 777 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, userAgent: 'Mozilla/5.0 (Linux; Android 15; Pixel) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0 Mobile Safari/537.36' }
  : { viewport: { width: 1280, height: 800 } });
const page = await ctx.newPage();
page.setDefaultTimeout(120000);
page.on('pageerror', (e) => console.error('[pageerror]', e.message));
const list = kinds.split(',');
try {
  await page.goto(`${url}?cycle=${process.env.CYCLE === '0' ? 'false' : 'true'}&speed=0&panel=closed&cinema=false&autoRotate=false&weather.kind=${list[0]}&timeOfDay=${HOUR}&season.date=0.375&season.hold=true${mode === 'desk' ? '&quality=High' : ''}${process.env.Q ? '&' + process.env.Q : ''}`, { timeout: 120000 });
  await page.waitForFunction(() => window.__arbor !== undefined, null, { timeout: 120000 });
  await page.evaluate(() => { const a = window.__arbor; a.params.camera.autoFrame = true; a.fastForward(90); });
  if (process.env.THROTTLE) { const cdp = await ctx.newCDPSession(page); await cdp.send('Emulation.setCPUThrottlingRate', { rate: Number(process.env.THROTTLE) }); }
  await page.waitForTimeout(8000);
  await page.evaluate(({ view, sky }) => {
    const a = window.__arbor;
    if (view === 'app') return;
    // side = looking across the wind (clouds travel left to right or right to left), wind = upwind, down = downwind.
    const w = Math.atan2(-a.wind.dirZ, -a.wind.dirX), az = w + (view === 'side' ? 1.25 : view === 'down' ? Math.PI : 0);
    const H = a.sim.bboxMax[1], n0 = a.sim.nodes[0], D = H * (innerWidth < innerHeight ? 3.0 : 2.1);
    a.params.camera.autoFrame = false; a.stage.takeControl?.(); a.stage.controls.maxPolarAngle = Math.PI;
    // SKY=1: the tree behind the camera, looking higher (sky and landscape only).
    const px = n0.wx - Math.cos(az) * (sky ? -8 : D), pz = n0.wz - Math.sin(az) * (sky ? -8 : D), py = 1.7, el = sky ? 0.85 : 0.3;
    a.stage.camera.position.set(px, py, pz);
    a.stage.controls.target.set(px + Math.cos(az) * Math.cos(el) * 10, py + Math.sin(el) * 10, pz + Math.sin(az) * Math.cos(el) * 10);
  }, { view, sky: process.env.SKY === '1' });
  const shots = [], t0 = Date.now();
  // FLASH=1: a held storm, then one lightning flash stepped through its levels (weather.flash pinned per frame), 12 frames.
  if (process.env.FLASH) {
    await page.evaluate(() => { const a = window.__arbor; a.params.weather.event = 'auto'; a.weather.snapStorm(); a.weather.nextStrike = 1e9; if (a.clouds) a.clouds.amount = -1; window.__F = 0; Object.defineProperty(a.weather, 'flash', { get: () => window.__F, set() {} }); });
    await page.waitForTimeout(6000);
    for (const f of [0, 0, 1, 0.8, 0.3, 0.9, 0.6, 0.4, 0.25, 0.12, 0.05, 0]) {
      await page.evaluate((f) => { window.__F = f; }, f);
      await page.waitForTimeout(400);
      shots.push((await page.screenshot({ type: 'jpeg', quality: 78 })).toString('base64'));
      console.log('flash', f, await page.evaluate(() => window.__arbor.stage.renderer.info.programs.length));
    }
    list.length = 0;
  }
  for (const kind of list) {
    await page.evaluate((kind) => { const a = window.__arbor; a.params.weather.event = 'auto'; a.params.weather.kind = kind; }, kind);
    for (let i = 0; i < PER; i++) {
      await page.waitForTimeout((STAGE * 1000) / PER);
      shots.push((await page.screenshot({ type: 'jpeg', quality: 78 })).toString('base64'));
      const r = await page.evaluate(() => { const a = window.__arbor, W = a.weather, C = a.clouds, s = a.stage;
        return { kind: W.kind, cloud: +W.cloud.toFixed(2), hour: +a.params.sky.timeOfDay.toFixed(2), programs: s.renderer.info.programs.length, calls: s.renderer.info.render.calls, quads: C?.stats.quads, deck: +(C?.stats.deck ?? 0).toFixed(2), tower: +(C?.stats.tower ?? 0).toFixed(2), ms: C ? +(C.stats.sumMs / Math.max(1, C.stats.frames)).toFixed(3) : 0, fe: a.frameErrors() }; });
      console.log(((Date.now() - t0) / 1000).toFixed(1) + 's', kind, JSON.stringify(r));
    }
  }
  const sheet = await ctx.newPage(), cols = PER * (mode === 'phone' ? 2 : 1), rows = Math.ceil(shots.length / cols);
  const W = mode === 'phone' ? 1480 : 1600, cw = W / cols, ch = mode === 'phone' ? cw * 777 / 411 : cw * 800 / 1280;
  await sheet.setViewportSize({ width: W, height: Math.ceil(rows * ch) + 4 });
  await sheet.setContent(`<body style="margin:0;background:#111;display:grid;grid-template-columns:repeat(${cols},1fr);gap:2px">${shots.map((s) => `<img style="width:100%" src="data:image/jpeg;base64,${s}">`).join('')}</body>`);
  await sheet.screenshot({ path: `shots/${prefix}-${mode}-${view}${process.env.SKY === '1' ? 'sky' : ''}${process.env.FLASH ? '-flash' : ''}-seq.jpg`, type: 'jpeg', quality: 85 });
  console.log('sheet', `shots/${prefix}-${mode}-${view}${process.env.SKY === '1' ? 'sky' : ''}${process.env.FLASH ? '-flash' : ''}-seq.jpg`);
} finally { await browser.close(); }

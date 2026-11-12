// Landscape-through-the-year shots on the real GPU: the app's framed camera plus the fixed wide / far backdrop cameras
// at a list of dates (scrubbed live with "hold"), per hour. Prints programs, meadow counts and mean far-tree / tuft colour.
// Usage: PROF_DIST=/tmp/dist PORT=5560 node scripts/bgseasonshots.mjs desk|phone [prefix=bgs] [stations=name:date,...] [hours=noon:13,...] [views=framed,wide,far] [query]
import { spawn } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { chromium } from 'playwright-core';

const PORT = Number(process.env.PORT ?? 5560), DIST = process.env.PROF_DIST ?? 'dist';
const mode = process.argv[2] ?? 'phone', prefix = process.argv[3] ?? 'bgs';
const pairs = (s) => s.split(',').map((p) => p.split(':')).map(([name, v]) => ({ name, v: Number(v) }));
const ST = pairs(process.argv[4] && process.argv[4] !== 'all' ? process.argv[4] : '1-earlyspring:0.03,2-latespring:0.17,3-summer:0.375,4-earlyautumn:0.54,5-peak:0.62,6-lateautumn:0.71,7-winter:0.88');
const HOURS = pairs(process.argv[5] ?? 'noon:13');
const views = (process.argv[6] ?? 'framed,wide,far').split(','), query = process.argv[7] ?? '';
mkdirSync('shots', { recursive: true });
const vite = spawn('npx', ['vite', 'preview', '--outDir', DIST, '--port', String(PORT), '--strictPort'], { stdio: ['ignore', 'pipe', 'inherit'] });
await new Promise((res) => vite.stdout.on('data', (d) => String(d).includes('Local') && res()));
const browser = await chromium.launch({ executablePath: '/usr/sbin/chromium', args: ['--headless=new', '--use-gl=angle', `--use-angle=${process.env.GPU ?? 'vulkan'}`, '--enable-gpu', '--ignore-gpu-blocklist'] });
const cam = (view) => {
  const a = window.__arbor, H = a.sim.bboxMax[1], n0 = a.sim.nodes[0];
  if (view === 'framed') { a.params.camera.autoFrame = true; a.fastForward(0); return; }
  a.params.camera.autoFrame = false;
  const portrait = innerWidth < innerHeight;
  const V = { wide: { d: H * (portrait ? 3.4 : 2.3), y: 1.7, ty: H * 0.42, yaw: 0.6 }, far: { d: H * 6, y: 4, ty: H * 0.5, yaw: 4.1 } }[view];
  a.stage.controls.target.set(n0.wx, V.ty, n0.wz);
  a.stage.camera.position.set(n0.wx + Math.cos(V.yaw) * V.d, V.y, n0.wz + Math.sin(V.yaw) * V.d);
  a.fastForward(0);
};
try {
  const ctx = await browser.newContext(mode === 'phone'
    ? { viewport: { width: 411, height: 777 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, userAgent: 'Mozilla/5.0 (Linux; Android 15; Pixel) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0 Mobile Safari/537.36' }
    : { viewport: { width: 1280, height: 800 } });
  const page = await ctx.newPage();
  page.on('pageerror', (e) => console.error('[pageerror]', e.message));
  await page.goto(`http://localhost:${PORT}/?nogui=1&hideui=1&speed=0&autoRotate=false&cinema=false&weather=calm&sway=0&leaffall=0&${query}`);
  await page.waitForFunction(() => window.__arbor !== undefined);
  await page.evaluate(() => { const A = window.__arbor; A.params.season.on = false; A.fastForward(90); });
  await page.waitForTimeout(6500);
  for (const h of HOURS) for (const s of ST) {
    await page.evaluate(([d, hr]) => { const A = window.__arbor; A.params.sky.timeOfDay = hr; A.params.season.on = true; A.params.season.hold = true; A.params.season.date = d; }, [s.v, h.v]);
    await page.waitForTimeout(500);
    await page.evaluate(() => window.__arbor.fastForward(0));
    await page.waitForTimeout(1500);
    for (const v of views) {
      await page.evaluate(cam, v);
      await page.waitForTimeout(v === 'framed' ? 3600 : 1000);
      await page.evaluate(() => window.__arbor.fastForward(0));
      await page.waitForTimeout(500);
      await page.screenshot({ path: `shots/${prefix}-${mode}-${h.name}-${s.name}-${v}.png` });
    }
    console.log(mode, h.name, s.name, JSON.stringify(await page.evaluate(() => { const A = window.__arbor; return { phase: +A.season.phase.toFixed(3), programs: A.stage.renderer.info.programs.length, counts: A.meadow.counts, probe: A.meadow.probe?.(), fe: A.frameErrors() }; })));
  }
} finally { await browser.close(); vite.kill(); }

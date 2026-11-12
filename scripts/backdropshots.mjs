// Background shots on the real GPU: wide (horizon in frame), low (camera in the grass) and far (pulled back) views at
// noon, golden hour, night and in a noon storm, same cameras every run, plus program count and draw calls.
// Usage: PROF_DIST=/tmp/dist PORT=5450 node scripts/backdropshots.mjs desk|phone [prefix=bd] [query] [views=wide,low,far] [hours=noon,golden,night,storm]
import { spawn } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { chromium } from 'playwright-core';

const PORT = Number(process.env.PORT ?? 5450), DIST = process.env.PROF_DIST ?? '/tmp/arbor-prof-dist';
const mode = process.argv[2] ?? 'desk', prefix = process.argv[3] ?? 'bd', query = process.argv[4] ?? '';
const views = (process.argv[5] ?? 'wide,low,far').split(','), hours = (process.argv[6] ?? 'noon,golden,night,storm').split(',');
const HOURS = { noon: 13, golden: 18.6, night: 23.5, storm: 13, morning: 8 };
mkdirSync('shots', { recursive: true });
const vite = spawn('npx', ['vite', 'preview', '--outDir', DIST, '--port', String(PORT), '--strictPort'], { stdio: ['ignore', 'pipe', 'inherit'] });
await new Promise((res) => vite.stdout.on('data', (d) => String(d).includes('Local') && res()));
const browser = await chromium.launch({ executablePath: '/usr/sbin/chromium', args: ['--headless=new', '--use-gl=angle', `--use-angle=${process.env.GPU ?? 'vulkan'}`, '--enable-gpu', '--ignore-gpu-blocklist'] });
const cam = (view) => {
  const a = window.__arbor, H = a.sim.bboxMax[1], n0 = a.sim.nodes[0];
  a.params.camera.autoFrame = false;
  const portrait = innerWidth < innerHeight;
  const V = {
    wide: { d: H * (portrait ? 3.4 : 2.3), y: 1.7, ty: H * 0.42, yaw: 0.6 },
    low: { d: H * (portrait ? 2.6 : 1.7), y: 0.55, ty: H * 0.4, yaw: 2.4 },
    far: { d: H * 6, y: 4, ty: H * 0.5, yaw: 4.1 },
  }[view];
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
  await page.goto(`http://localhost:${PORT}/?nogui=1&hideui=1&speed=0&autoRotate=false&cinema=false&weather=calm&${query}`);
  await page.waitForFunction(() => window.__arbor !== undefined);
  await page.evaluate(() => window.__arbor.fastForward(90));
  for (const hn of hours) {
    await page.evaluate(([h, storm]) => {
      const a = window.__arbor; a.params.sky.timeOfDay = h;
      if (storm) { a.params.weather.event = 'storm'; a.weather.snapStorm(); a.weather.nextStrike = 1e9; }
      a.fastForward(0);
    }, [HOURS[hn], hn === 'storm']);
    await page.waitForTimeout(Number(process.env.SETTLE_MS ?? 6500));
    for (const v of views) {
      await page.evaluate(cam, v);
      await page.waitForTimeout(1200);
      await page.screenshot({ path: `shots/${prefix}-${mode}-${hn}-${v}.png` });
    }
    console.log(mode, hn, JSON.stringify(await page.evaluate(() => { const a = window.__arbor, r = a.stage.renderer; return { programs: r.info.programs.length, calls: r.info.render.calls, tris: r.info.render.triangles, quality: a.params.sky.quality, fe: a.frameErrors() }; })));
  }
} finally {
  await browser.close();
  vite.kill();
}

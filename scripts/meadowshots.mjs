// Meadow proof shots in phone emulation on the real GPU: trunk base close-up, and two frames 0.5 s apart with a pixel diff
// of the grass region (wind motion). Serves the production build in PROF_DIST like auditshots.mjs.
// Usage: PROF_DIST=/tmp/dist PORT=5322 node scripts/meadowshots.mjs [hour=13] [query]
import { spawn } from 'node:child_process';
import { mkdirSync, readFileSync } from 'node:fs';
import { chromium } from 'playwright-core';

const PORT = Number(process.env.PORT ?? 5322), DIST = process.env.PROF_DIST ?? '/tmp/arbor-prof-dist';
const hour = Number(process.argv[2] ?? 13), query = process.argv[3] ?? '';
mkdirSync('shots', { recursive: true });
const vite = spawn('npx', ['vite', 'preview', '--outDir', DIST, '--port', String(PORT), '--strictPort'], { stdio: ['ignore', 'pipe', 'inherit'] });
await new Promise((res) => vite.stdout.on('data', (d) => String(d).includes('Local') && res()));
const browser = await chromium.launch({ executablePath: '/usr/sbin/chromium', args: ['--headless=new', '--use-gl=angle', `--use-angle=${process.env.GPU ?? 'vulkan'}`, '--enable-gpu', '--ignore-gpu-blocklist'] });
try {
  const ctx = await browser.newContext({ viewport: { width: 411, height: 777 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true,
    userAgent: 'Mozilla/5.0 (Linux; Android 15; Pixel) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0 Mobile Safari/537.36' });
  const page = await ctx.newPage();
  page.on('pageerror', (e) => console.error('[pageerror]', e.message));
  await page.goto(`http://localhost:${PORT}/?cycle=false&nogui=1&hideui=1&speed=0&autoRotate=false&cinema=false&${query}`);
  await page.waitForFunction(() => window.__arbor !== undefined);
  await page.evaluate((h) => {
    const a = window.__arbor;
    a.params.sky.timeOfDay = h;
    a.fastForward(90);
    a.params.camera.autoFrame = false;
    const n0 = a.sim.nodes[0];
    a.stage.controls.target.set(n0.wx, 0.35, n0.wz);
    a.stage.camera.position.set(n0.wx + 2.6, 0.9, n0.wz + 2.0);
    a.fastForward(0);
  }, hour);
  await page.waitForTimeout(1200);
  const tag = `h${hour}`;
  await page.screenshot({ path: `shots/meadow-base-${tag}-a.png` });
  await page.waitForTimeout(500);
  await page.screenshot({ path: `shots/meadow-base-${tag}-b.png` });
  const diff = await page.evaluate(async ([a, b]) => {
    const load = async (u) => { const i = new Image(); i.src = u; await i.decode(); const c = new OffscreenCanvas(i.width, i.height); const g = c.getContext('2d'); g.drawImage(i, 0, 0); return g.getImageData(0, 0, i.width, i.height); };
    const A = await load(a), B = await load(b);
    let changed = 0, total = 0;
    const y0 = Math.floor(A.height * 0.6); // lower 40 %: grass
    for (let y = y0; y < A.height; y++) for (let x = 0; x < A.width; x++) {
      const i = (y * A.width + x) * 4; total++;
      if (Math.abs(A.data[i] - B.data[i]) + Math.abs(A.data[i + 1] - B.data[i + 1]) + Math.abs(A.data[i + 2] - B.data[i + 2]) > 24) changed++;
    }
    return { changedPct: +((100 * changed) / total).toFixed(2) };
  }, [`data:image/png;base64,${readFileSync(`shots/meadow-base-${tag}-a.png`).toString('base64')}`, `data:image/png;base64,${readFileSync(`shots/meadow-base-${tag}-b.png`).toString('base64')}`]);
  console.log('grass-region pixels changed over 0.5 s:', JSON.stringify(diff), JSON.stringify(await page.evaluate(() => ({ programs: window.__arbor.stage.renderer.info.programs.length, counts: window.__arbor.meadow?.counts, bake: window.__arbor.meadow?.stats, calls: window.__arbor.stage.renderer.info.render.calls, tris: window.__arbor.stage.renderer.info.render.triangles }))));
} finally {
  await browser.close();
  vite.kill();
}

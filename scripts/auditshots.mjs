// Audit shots on the real GPU (ANGLE Vulkan): desktop High at several hours + phone Low, mid-growth and mature, framed + close-up.
// Usage: node scripts/auditshots.mjs  (serves the production build in PROF_DIST, see profile.mjs). Output: shots/audit-*.png
import { spawn } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { chromium } from 'playwright-core';

const PORT = Number(process.env.PORT ?? 5189), DIST = process.env.PROF_DIST ?? '/tmp/arbor-prof-dist';
mkdirSync('shots', { recursive: true });
const vite = spawn('npx', ['vite', 'preview', '--outDir', DIST, '--port', String(PORT), '--strictPort'], { stdio: ['ignore', 'pipe', 'inherit'] });
await new Promise((res) => vite.stdout.on('data', (d) => String(d).includes('Local') && res()));
const browser = await chromium.launch({
  executablePath: '/usr/sbin/chromium',
  args: ['--headless=new', '--use-gl=angle', `--use-angle=${process.env.GPU ?? 'vulkan'}`, '--enable-gpu', '--ignore-gpu-blocklist'],
});
const closeup = () => {
  const a = window.__arbor;
  a.params.camera.autoFrame = false;
  const n0 = a.sim.nodes[0];
  const h = Math.max(1.2, a.sim.bboxMax[1] * 0.25);
  a.stage.controls.target.set(n0.wx, h * 1.3, n0.wz);
  a.stage.camera.position.set(n0.wx + 2.2, h * 0.7, n0.wz + 2.2);
  a.fastForward(0);
};
async function run(name, ctxOpts, hours) {
  const ctx = await browser.newContext(ctxOpts);
  const page = await ctx.newPage();
  page.on('pageerror', (e) => console.error('[pageerror]', e.message));
  await page.goto(`http://localhost:${PORT}/?nogui=1&hideui=1&speed=0&autoRotate=false&cinema=false`);
  await page.waitForFunction(() => window.__arbor !== undefined);
  let done = 0;
  for (const t of [35, 90]) {
    await page.evaluate((s) => { window.__arbor.params.camera.autoFrame = true; return window.__arbor.fastForward(s); }, t - done);
    done = t;
    for (const [h, hn] of hours) {
      if (t === 35 && hn !== hours[0][1]) continue;
      await page.evaluate((hh) => { const a = window.__arbor; a.params.camera.autoFrame = true; a.params.sky.timeOfDay = hh; a.fastForward(0); }, h);
      await page.waitForTimeout(900);
      await page.screenshot({ path: `shots/${process.env.SHOT_PREFIX ?? "audit"}-${name}-t${t}-${hn}-framed.png` });
      await page.evaluate(closeup);
      await page.waitForTimeout(700);
      await page.screenshot({ path: `shots/${process.env.SHOT_PREFIX ?? "audit"}-${name}-t${t}-${hn}-close.png` });
    }
  }
  console.log(name, await page.evaluate(() => { const r = window.__arbor.stage.renderer, gl = r.getContext(), e = gl.getExtension('WEBGL_debug_renderer_info'); return [gl.getParameter(e.UNMASKED_RENDERER_WEBGL), window.__arbor.params.sky.quality, window.__arbor.leaves.mode]; }));
  await ctx.close();
}
try {
  await run('desk', { viewport: { width: 1280, height: 800 } }, [[18.6, 'golden'], [13, 'noon'], [23.5, 'night']]);
  await run('phone', { viewport: { width: 411, height: 777 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true,
    userAgent: 'Mozilla/5.0 (Linux; Android 15; Pixel) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0 Mobile Safari/537.36' }, [[18.6, 'golden'], [13, 'noon'], [23.5, 'night']]);
} finally {
  await browser.close();
  vite.kill();
}

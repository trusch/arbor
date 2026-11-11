// Phone-emulated proof shots (Android Chrome UA, touch, 411x777 CSS px, DPR 1): framed view + a trunk close-up per stage.
// Usage: node scripts/phoneshots.mjs [stages=35,90] [extraQuery=leafsafe=1] [prefix=phone]
// PORT env as in screenshot.mjs; SHOT_DPR env sets deviceScaleFactor (real phone: 2.625). The page picks quality=Low + safe leaves itself (lowEndDevice), like the real phone.
import { spawn } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { chromium } from 'playwright-core';

const stages = (process.argv[2] ?? '35,90').split(',').map(Number);
const extra = process.argv[3] ?? 'leafsafe=1';
const prefix = process.argv[4] ?? 'phone';
const PORT = Number(process.env.PORT ?? 5198);
const W = Number(process.env.SHOT_W ?? 411), H = Number(process.env.SHOT_H ?? 777);

mkdirSync('shots', { recursive: true });
const vite = spawn('npx', ['vite', '--port', String(PORT), '--strictPort'], { stdio: ['ignore', 'pipe', 'inherit'] });
await new Promise((res) => vite.stdout.on('data', (d) => String(d).includes('Local') && res()));
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM ?? '/usr/sbin/chromium',
  args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'],
});
try {
  const ctx = await browser.newContext({
    viewport: { width: W, height: H }, deviceScaleFactor: Number(process.env.SHOT_DPR ?? 1), isMobile: true, hasTouch: true,
    userAgent: 'Mozilla/5.0 (Linux; Android 15; Pixel) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0 Mobile Safari/537.36',
  });
  const page = await ctx.newPage();
  page.on('pageerror', (e) => console.error('[pageerror]', e.message));
  page.on('console', (m) => m.type() === 'error' && !m.text().includes('404') && console.error('[console]', m.text()));
  await page.goto(`http://localhost:${PORT}/?nogui=1&hideui=1&speed=0&autoRotate=false&cinema=false&${extra}`);
  await page.waitForFunction(() => window.__arbor !== undefined);
  let done = 0;
  for (const t of stages) {
    await page.evaluate(() => { window.__arbor.params.camera.autoFrame = true; });
    const info = await page.evaluate((s) => window.__arbor.fastForward(s), t - done);
    done = t;
    await page.waitForTimeout(800);
    await page.screenshot({ path: `shots/${prefix}-t${t}-framed.png` });
    // Close-up on the trunk/lower crown, looking slightly up (where the phone screenshot showed bands).
    await page.evaluate(() => {
      const a = window.__arbor;
      a.params.camera.autoFrame = false;
      const n0 = a.sim.nodes[0];
      const h = Math.max(1.2, a.sim.bboxMax[1] * 0.25);
      a.stage.controls.target.set(n0.wx, h * 1.3, n0.wz);
      a.stage.camera.position.set(n0.wx + 2.2, h * 0.7, n0.wz + 2.2);
      a.fastForward(0);
    });
    await page.waitForTimeout(800);
    await page.screenshot({ path: `shots/${prefix}-t${t}-closeup.png` });
    const q = await page.evaluate(() => ({ q: window.__arbor.params.sky.quality, leaf: window.__arbor.leaves.mode, dpr: window.__arbor.stage.renderer.getPixelRatio(), buf: [window.__arbor.stage.renderer.domElement.width, window.__arbor.stage.renderer.domElement.height] }));
    console.log(prefix, t, JSON.stringify(info), JSON.stringify(q));
  }
} finally {
  await browser.close();
  vite.kill();
}

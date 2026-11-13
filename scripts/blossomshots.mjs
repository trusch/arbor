// Blossom shots on the real GPU (ANGLE Vulkan): a t = 90 tree, spring scrubbed through bud, opening, peak, petal fall
// and early summer with the app's framed camera, plus a twig close-up at peak and the ground after petal fall.
// Prints blossom stats, falling counts and the program count per station.
// Usage: PORT=5540 node scripts/blossomshots.mjs [prefix=blossom] [modes=desk,phone] [form=oak] [stations=name:date,...] [extraQuery]
import { spawn } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { chromium } from 'playwright-core';

const prefix = process.argv[2] ?? 'blossom';
const modes = (process.argv[3] ?? 'desk,phone').split(',');
const form = process.argv[4] ?? 'oak';
const ST = (process.argv[5] && process.argv[5] !== 'all' ? process.argv[5] : '1-bud:0.012,2-opening:0.03,3-peak:0.056,4-fall:0.105,5-summer:0.2')
  .split(',').map((s) => s.split(':')).map(([name, d]) => ({ name, d: Number(d) }));
const extra = process.argv[6] ?? '';
const PORT = Number(process.env.PORT ?? 5540);
const T = Number(process.env.SHOT_T ?? 90);
mkdirSync('shots', { recursive: true });
const vite = spawn('npx', ['vite', '--port', String(PORT), '--strictPort'], { stdio: ['ignore', 'pipe', 'inherit'] });
await new Promise((res) => vite.stdout.on('data', (d) => String(d).includes('Local') && res()));
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM ?? '/usr/sbin/chromium',
  args: ['--headless=new', '--use-gl=angle', `--use-angle=${process.env.GPU ?? 'vulkan'}`, '--enable-gpu', '--ignore-gpu-blocklist'],
});
const PHONE = { viewport: { width: 411, height: 777 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, userAgent: 'Mozilla/5.0 (Linux; Android 15; Pixel) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0 Mobile Safari/537.36' };
const base = `http://localhost:${PORT}/?cycle=false&speed=0&autoRotate=false&cinema=false&weather=calm&timeOfDay=${process.env.HOUR ?? 14}&form=${form}&nogui=1&hideui=1&${extra}`;
const info = (page) => page.evaluate(() => {
  const A = window.__arbor, b = A.blossom?.stats;
  return { phase: +A.season.phase.toFixed(3), programs: A.stage.renderer.info.programs.length, leaves: A.leaves.mesh.count, clusters: b?.clusters, drawn: b?.drawn, open: b?.open, shedding: b?.falling, petals: b?.petals, ms: b && b.frames ? +(b.sumMs / b.frames).toFixed(3) : 0, fall: A.leafFall?.counts, fe: A.frameErrors() };
});
try {
  for (const mode of modes) {
    const ctx = await browser.newContext(mode === 'phone' ? PHONE : { viewport: { width: 1024, height: 640 } });
    const page = await ctx.newPage();
    page.on('pageerror', (e) => console.error('[pageerror]', e.message));
    await page.goto(base);
    await page.waitForFunction(() => window.__arbor !== undefined);
    await page.evaluate((t) => { const A = window.__arbor; A.params.season.on = false; A.fastForward(t); }, T);
    await page.waitForTimeout(7000);
    console.log(mode, 'seasons-off', JSON.stringify(await info(page)));
    for (const s of ST) {
      await page.evaluate((d) => { const A = window.__arbor; A.params.season.on = true; A.params.season.hold = true; A.params.season.date = d; A.params.camera.autoFrame = true; }, s.d);
      await page.waitForTimeout(400);
      await page.evaluate(() => window.__arbor.fastForward(0));
      await page.waitForTimeout(s.name.includes('fall') ? 9000 : 1500);
      await page.screenshot({ path: `shots/${prefix}-${mode}-${form}-${s.name}-framed.png` });
      console.log(mode, s.name, JSON.stringify(await info(page)));
      const cam = (kind) => page.evaluate((kind) => {
        const A = window.__arbor, sm = A.sim, st = A.stage;
        A.params.camera.autoFrame = false;
        const mn = sm.bboxMin, mx = sm.bboxMax, cx = (mn[0] + mx[0]) / 2, cz = (mn[2] + mx[2]) / 2, rx = (mx[0] - mn[0]) / 2;
        if (kind === 'close') {
          const d = 2.2, y = mn[1] + (mx[1] - mn[1]) * 0.72;
          st.controls.target.set(cx + rx * 0.7, y, cz);
          st.camera.position.set(cx + rx * 0.7 + d, y + 0.25 * d, cz + 0.5 * d);
        } else {
          st.controls.target.set(cx + rx * 0.4, 0.2, cz);
          st.camera.position.set(cx + rx * 0.4 + 3.2, 1.7, cz + 2.2);
        }
        st.controls.update();
        A.fastForward(0);
      }, kind);
      if (s.name.includes('peak')) { await cam('close'); await page.waitForTimeout(1500); await page.screenshot({ path: `shots/${prefix}-${mode}-${form}-${s.name}-close.png` }); }
      if (s.name.includes('fall')) { await cam('ground'); await page.waitForTimeout(1500); await page.screenshot({ path: `shots/${prefix}-${mode}-${form}-${s.name}-ground.png` }); }
    }
    await ctx.close();
  }
} finally { await browser.close(); vite.kill(); }

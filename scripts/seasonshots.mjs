// Season shots on the real GPU (ANGLE Vulkan): one grown tree per mode, the year scrubbed live through fixed stations
// (so this also exercises "scrub = same picture"), framed + crown close-up, desktop High and phone emulation.
// Prints drawn leaves, mean leaf colour and the program count per station, and with seasons off.
// Usage: PORT=5480 node scripts/seasonshots.mjs [prefix=season] [modes=desk,phone] [form=oak] [stations=name:date,...] [extraQuery]
import { spawn } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { chromium } from 'playwright-core';

const prefix = process.argv[2] ?? 'season';
const modes = (process.argv[3] ?? 'desk,phone').split(',');
const form = process.argv[4] ?? 'oak';
const ST = (process.argv[5] && process.argv[5] !== 'all' ? process.argv[5] : '1-flush:0.045,2-latespring:0.17,3-summer:0.38,4-earlyautumn:0.545,5-peak:0.62,6-halfbare:0.70,7-winter:0.88,8-nextspring:0.075')
  .split(',').map((s) => s.split(':')).map(([name, d]) => ({ name, d: Number(d) }));
const extra = process.argv[6] ?? '';
const PORT = Number(process.env.PORT ?? 5480);
const T = Number(process.env.SHOT_T ?? 90);
mkdirSync('shots', { recursive: true });
const vite = spawn('npx', ['vite', '--port', String(PORT), '--strictPort'], { stdio: ['ignore', 'pipe', 'inherit'] });
await new Promise((res) => vite.stdout.on('data', (d) => String(d).includes('Local') && res()));
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM ?? '/usr/sbin/chromium',
  args: ['--headless=new', '--use-gl=angle', `--use-angle=${process.env.GPU ?? 'vulkan'}`, '--enable-gpu', '--ignore-gpu-blocklist'],
});
const PHONE = { viewport: { width: 411, height: 777 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, userAgent: 'Mozilla/5.0 (Linux; Android 15; Pixel) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0 Mobile Safari/537.36' };
const base = `http://localhost:${PORT}/?cycle=false&speed=0&autoRotate=false&cinema=false&weather=calm&sway=0&leaffall=0&timeOfDay=${process.env.HOUR ?? 14}&form=${form}&nogui=1&hideui=1&${extra}`;
const info = (page) => page.evaluate(() => {
  const A = window.__arbor, n = A.leaves.mesh.count, c = A.leaves.mesh.instanceColor.array, m = A.leaves.mesh.instanceMatrix.array;
  let r = 0, g = 0, b = 0, k = 0;
  for (let i = 0; i < n; i++) { const o = i * 16; if (m[o + 4] * m[o + 4] + m[o + 5] * m[o + 5] + m[o + 6] * m[o + 6] < 1e-8) continue; r += c[i * 3]; g += c[i * 3 + 1]; b += c[i * 3 + 2]; k++; }
  return { season: A.season.name, phase: +A.season.phase.toFixed(3), programs: A.stage.renderer.info.programs.length, inst: n, visible: k, rgb: k ? [r / k, g / k, b / k].map((x) => +x.toFixed(3)) : null, fe: A.frameErrors() };
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
      await page.waitForTimeout(1200);
      await page.screenshot({ path: `shots/${prefix}-${mode}-${form}-${s.name}-framed.png` });
      await page.evaluate(() => {
        const A = window.__arbor, sm = A.sim, st = A.stage, d = 2.6;
        A.params.camera.autoFrame = false;
        const mn = sm.bboxMin, mx = sm.bboxMax, cx = (mn[0] + mx[0]) / 2, cz = (mn[2] + mx[2]) / 2, rx = (mx[0] - mn[0]) / 2, y = mn[1] + (mx[1] - mn[1]) * 0.72;
        st.controls.target.set(cx + rx * 0.7, y, cz);
        st.camera.position.set(cx + rx * 0.7 + d, y + 0.25 * d, cz + 0.5 * d);
        st.controls.update();
        A.fastForward(0);
      });
      await page.waitForTimeout(1200);
      await page.screenshot({ path: `shots/${prefix}-${mode}-${form}-${s.name}-close.png` });
      console.log(mode, s.name, JSON.stringify(await info(page)));
    }
    await ctx.close();
  }
} finally { await browser.close(); vite.kill(); }

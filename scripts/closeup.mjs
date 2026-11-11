// Close-up leaf shots on the desktop full path (camera pinned next to the outer crown).
// Usage: node scripts/closeup.mjs [prefix] [times=13:noon,18.6:golden] [extraQuery] [dist=1.2]
import { spawn } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { chromium } from 'playwright-core';

const prefix = process.argv[2] ?? 'closeup';
const times = (process.argv[3] ?? '13:noon,18.6:golden').split(',').map((t) => { const [h, n] = t.split(':'); return { h: Number(h), n }; });
const extra = process.argv[4] ?? '';
const dist = Number(process.argv[5] ?? 1.2);
const PORT = Number(process.env.PORT ?? 5198);
const W = Number(process.env.SHOT_W ?? 1024), H = Number(process.env.SHOT_H ?? 640);
mkdirSync('shots', { recursive: true });
const vite = spawn('npx', ['vite', '--port', String(PORT), '--strictPort'], { stdio: ['ignore', 'pipe', 'inherit'] });
await new Promise((res) => vite.stdout.on('data', (d) => String(d).includes('Local') && res()));
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM ?? '/usr/sbin/chromium',
  args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'],
});
try {
  const page = await browser.newPage({ viewport: { width: W, height: H } });
  page.on('pageerror', (e) => console.error('[pageerror]', e.message));
  await page.goto(`http://localhost:${PORT}/?nogui=1&hideui=1&speed=0&autoRotate=false&cinema=false&${extra}`);
  await page.waitForFunction(() => window.__arbor !== undefined);
  await page.evaluate(() => window.__arbor.fastForward(90));
  if (process.env.NOAO) await page.evaluate(() => { window.__arbor.stage.post.gtao.enabled = false; });
  for (const t of times) {
    await page.evaluate(([h, dist]) => {
      const A = window.__arbor, s = A.sim, st = A.stage;
      A.params.sky.timeOfDay = h;
      A.params.camera.autoFrame = false;
      const mn = s.bboxMin, mx = s.bboxMax;
      const cx = (mn[0] + mx[0]) / 2, cz = (mn[2] + mx[2]) / 2;
      const rx = (mx[0] - mn[0]) / 2, y = mn[1] + (mx[1] - mn[1]) * 0.72;
      st.controls.target.set(cx + rx * 0.75, y, cz);
      st.camera.position.set(cx + rx * 0.75 + dist, y + 0.25 * dist, cz + 0.5 * dist);
      st.controls.update();
      return A.fastForward(0);
    }, [t.h, dist]);
    await page.waitForTimeout(800);
    await page.evaluate(() => window.__arbor.fastForward(0));
    await page.waitForTimeout(400);
    const file = `shots/${prefix}-${t.h.toFixed(1)}-${t.n}.png`;
    await page.screenshot({ path: file });
    console.log(file);
  }
} finally { await browser.close(); vite.kill(); }

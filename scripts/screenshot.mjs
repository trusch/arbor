// Headless proof shots: starts vite, fast-forwards growth, saves PNGs to shots/.
// Usage: node scripts/screenshot.mjs [stages=8,30,90] [extraQuery] [prefix] [times=7.5:morning,13:noon,...|none]
// After the growth stages, the final tree is re-shot at each hour of the day cycle (sky.timeOfDay).
import { spawn } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { chromium } from 'playwright-core';

const stages = (process.argv[2] ?? '8,30,90').split(',').map(Number);
const extra = process.argv[3] ?? '';
const prefix = process.argv[4] ?? 'earth';
// Stage label from the tree age, not the index (a single t=90 stage is 'mature', not 'sapling').
const stageName = (t) => (t < 15 ? 'sapling' : t < 45 ? 'young' : t < 120 ? 'mature' : t < 240 ? 'old' : 'ancient');
const PORT = Number(process.env.PORT ?? 5199);
const timesArg = process.argv[5] ?? '7.5:morning,13:noon,18.6:golden,20.0:bluehour,23.5:night';
const times = timesArg === 'none' ? [] : timesArg.split(',').map((t) => { const [h, n] = t.split(':'); return { h: Number(h), n: n ?? `h${h}` }; });
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
  page.on('console', (m) => m.type() === 'error' && console.error('[page]', m.text()));
  page.on('pageerror', (e) => console.error('[pageerror]', e.message));
  await page.goto(`http://localhost:${PORT}/?nogui=1&hideui=1&speed=0&autoRotate=false&cinema=false&${extra}`);
  await page.waitForFunction(() => window.__arbor !== undefined);
  let done = 0;
  for (let i = 0; i < stages.length; i++) {
    const info = await page.evaluate((s) => window.__arbor.fastForward(s), stages[i] - done);
    done = stages[i];
    await page.waitForTimeout(600);
    const file = `shots/${prefix}-${i + 1}-${stageName(stages[i])}-t${stages[i]}.png`;
    await page.screenshot({ path: file });
    console.log(file, JSON.stringify(info));
  }
  for (const t of times) {
    await page.evaluate((h) => { window.__arbor.params.sky.timeOfDay = h; return window.__arbor.fastForward(0); }, t.h);
    await page.waitForTimeout(600);
    const file = `shots/${prefix}-day-${t.h.toFixed(1).padStart(4, '0')}-${t.n}.png`;
    await page.screenshot({ path: file });
    console.log(file);
  }
} finally {
  await browser.close();
  vite.kill();
}

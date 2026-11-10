// Headless proof shots: starts vite, fast-forwards growth, saves PNGs to shots/.
// Usage: node scripts/screenshot.mjs [stages=8,30,90] [extraQuery] [prefix]
import { spawn } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { chromium } from 'playwright-core';

const stages = (process.argv[2] ?? '8,30,90').split(',').map(Number);
const extra = process.argv[3] ?? '';
const prefix = process.argv[4] ?? 'earth';
const names = ['sapling', 'young', 'mature', 'old', 'ancient'];
const PORT = 5199;

mkdirSync('shots', { recursive: true });
const vite = spawn('npx', ['vite', '--port', String(PORT), '--strictPort'], { stdio: ['ignore', 'pipe', 'inherit'] });
await new Promise((res) => vite.stdout.on('data', (d) => String(d).includes('Local') && res()));

const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM ?? '/usr/sbin/chromium',
  args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'],
});
try {
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  page.on('console', (m) => m.type() === 'error' && console.error('[page]', m.text()));
  page.on('pageerror', (e) => console.error('[pageerror]', e.message));
  await page.goto(`http://localhost:${PORT}/?nogui=1&speed=0&autoRotate=false&${extra}`);
  await page.waitForFunction(() => window.__arbor !== undefined);
  let done = 0;
  for (let i = 0; i < stages.length; i++) {
    const info = await page.evaluate((s) => window.__arbor.fastForward(s), stages[i] - done);
    done = stages[i];
    await page.waitForTimeout(600);
    const file = `shots/${prefix}-${i + 1}-${names[i] ?? 'stage'}-t${stages[i]}.png`;
    await page.screenshot({ path: file });
    console.log(file, JSON.stringify(info));
  }
} finally {
  await browser.close();
  vite.kill();
}

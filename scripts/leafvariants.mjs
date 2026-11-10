import { spawn } from 'node:child_process';
import { chromium } from 'playwright-core';
const PORT = 5311;
const vite = spawn('npx', ['vite', '--port', String(PORT), '--strictPort'], { stdio: ['ignore', 'pipe', 'inherit'] });
await new Promise((res) => vite.stdout.on('data', (d) => String(d).includes('Local') && res()));
const browser = await chromium.launch({ executablePath: '/usr/sbin/chromium', args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const cases = process.argv.slice(2);
try {
  for (const q of cases) {
    const ctx = await browser.newContext({ viewport: { width: 411, height: 777 }, deviceScaleFactor: 1, isMobile: true, hasTouch: true,
      userAgent: 'Mozilla/5.0 (Linux; Android 15; Pixel) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0 Mobile Safari/537.36' });
    const page = await ctx.newPage();
    const errs = [];
    page.on('pageerror', (e) => errs.push('pageerror ' + e.message));
    page.on('console', (m) => { if (m.type() === 'error' || /THREE\.WebGLProgram|shader/i.test(m.text())) errs.push(m.type() + ' ' + m.text()); });
    await page.goto(`http://localhost:${PORT}/?nogui=1&cinema=false&autoRotate=false&${q}`);
    await page.waitForFunction(() => window.__arbor !== undefined);
    await page.evaluate(() => window.__arbor.fastForward(30));
    await page.waitForTimeout(1500);
    const info = await page.evaluate(() => ({ mode: window.__arbor.leaves.mode, v: window.__arbor.leaves.variant?.name, n: window.__arbor.leaves.mesh.count, fe: window.__arbor.frameErrors?.() }));
    const tag = q.replace(/[^a-z0-9]+/gi, '_') || 'default';
    await page.screenshot({ path: `shots/variant-${tag}.png` });
    console.log(JSON.stringify({ q, ...info, errs }));
    await ctx.close();
  }
} finally { await browser.close(); vite.kill(); }

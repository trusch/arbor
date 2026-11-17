// Close frame bursts of the top of the tree in a held storm (camera across the wind, on the leader's upper third).
// Usage: node scripts/swaytop.mjs http://localhost:5477/   env: GPU=vulkan, MODES=desktop,phone, AGES=20,90, PRE=swaytop,
//        FRAMES=6, WX=storm. Writes shots/PRE-MODE-tAGE-N.png and a contact sheet shots/PRE-MODE-tAGE-sheet.jpg (montage).
import { mkdirSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { chromium } from 'playwright-core';
const url = process.argv[2] ?? 'http://localhost:5477/';
const E = process.env, PRE = E.PRE ?? 'swaytop', FRAMES = Number(E.FRAMES ?? 6);
mkdirSync('shots', { recursive: true });
const browser = await chromium.launch({ executablePath: '/usr/sbin/chromium', args: ['--headless=new', '--use-gl=angle', `--use-angle=${E.GPU ?? 'vulkan'}`, '--enable-gpu', '--ignore-gpu-blocklist'] });
try {
  for (const mode of (E.MODES ?? 'desktop,phone').split(',')) for (const age of (E.AGES ?? '20,90').split(',').map(Number)) {
    const ctx = await browser.newContext(mode === 'phone'
      ? { viewport: { width: 411, height: 777 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, userAgent: 'Mozilla/5.0 (Linux; Android 15; Pixel) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0 Mobile Safari/537.36' }
      : { viewport: { width: 1000, height: 800 } });
    const page = await ctx.newPage();
    await page.goto(`${url}?cycle=false&nogui=1&hideui=1&speed=0&autoRotate=false&cinema=false&lightning=0&weather=${E.WX ?? 'storm'}${mode === 'desktop' ? '&quality=High' : ''}`);
    await page.waitForFunction(() => window.__arbor !== undefined);
    await page.evaluate((age) => {
      const A = window.__arbor, S = A.sim, W = A.wind;
      A.params.sky.timeOfDay = 13; A.fastForward(age);
      const lead = S.chains[0].nodes, tip = S.nodes[lead[lead.length - 1]], H = tip.wy, span = Math.max(1.6, H * 0.45);
      A.params.camera.autoFrame = false;
      A.stage.controls.target.set(tip.wx + W.dirX * span * 0.2, H - span * 0.4, tip.wz + W.dirZ * span * 0.2);
      A.stage.camera.position.set(tip.wx - W.dirZ * span * 1.9, H - span * 0.3, tip.wz + W.dirX * span * 1.9);
      A.stage.controls.update?.();
      A.fastForward(0);
    }, age);
    await page.waitForTimeout(6000);
    const files = [];
    for (let i = 0; i < FRAMES; i++) { const f = `shots/${PRE}-${mode}-t${age}-${i}.png`; await page.screenshot({ path: f }); files.push(f); await page.waitForTimeout(350); }
    const peak = await page.evaluate(() => +window.__arbor.sway.maxOffset.toFixed(3));
    execFileSync('montage', [...files, '-tile', '3x', '-geometry', mode === 'phone' ? '411x777+4+4' : '660x528+4+4', '-quality', '88', `shots/${PRE}-${mode}-t${age}-sheet.jpg`]);
    console.log(`${PRE} ${mode} t=${age}: ${FRAMES} frames, offset at the last frame ${peak} m -> shots/${PRE}-${mode}-t${age}-sheet.jpg`);
    await ctx.close();
  }
} finally { await browser.close(); }

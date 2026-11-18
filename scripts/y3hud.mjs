// Info overlay text of the tree that grows over years: tree line and card at a list of sim times.
// Usage: node scripts/y3hud.mjs URL [times]   (Q='&years=3' default; Q='' = the default tree)
import { chromium } from 'playwright-core';
const url = process.argv[2], times = (process.argv[3] ?? '60,140,200,262,290,400,470,560,640,700,750').split(',').map(Number);
const browser = await chromium.launch({ executablePath: '/usr/sbin/chromium', args: ['--headless=new', '--use-gl=angle', `--use-angle=${process.env.GPU ?? 'vulkan'}`, '--enable-gpu', '--ignore-gpu-blocklist'] });
try {
  const page = await (await browser.newContext({ viewport: { width: 1280, height: 800 } })).newPage(); page.setDefaultTimeout(900000);
  await page.goto(`${url}?start=0&cycle=false&timeOfDay=13&weather=calm&cinema=false&speed=1${process.env.Q ?? '&years=3'}`);
  await page.waitForFunction(() => window.__arbor !== undefined);
  await page.click('#arbor-hud-strip').catch(() => {});
  for (const T of times) {
    while (await page.evaluate(() => window.__arbor.sim.time) < T - 0.01) await page.evaluate((T) => window.__arbor.fastForward(Math.min(15, T - window.__arbor.sim.time)), T);
    await page.waitForTimeout(1200);
    const r = await page.evaluate(() => { const A = window.__arbor, s = A.sim; let h = 0, x0 = 0, x1 = 0, z0 = 0, z1 = 0, dbh = 0, best = 9; for (const n of s.nodes) { if (s.chains[n.chain].pruned) continue; if (n.wy > h) h = n.wy; x0 = Math.min(x0, n.wx); x1 = Math.max(x1, n.wx); z0 = Math.min(z0, n.wz); z1 = Math.max(z1, n.wz); if (n.chain === 0 && Math.abs(n.wy - 1.3) < best) { best = Math.abs(n.wy - 1.3); dbh = n.radius; } }
      return { t: +s.time.toFixed(0), text: document.querySelector('#arbor-hud')?.innerText.replace(/\s*\n\s*/g, ' | '), live: { h: +h.toFixed(2), w: +Math.max(x1 - x0, z1 - z0).toFixed(2), girthBase: +(2 * Math.PI * s.nodes[0].radius).toFixed(2), girth13: +(2 * Math.PI * dbh).toFixed(2) } }; });
    console.log(JSON.stringify(r));
  }
} finally { await browser.close(); }

// Early-growth census + fixed-camera strip (seedling / sapling phase).
// Usage: node scripts/seedling.mjs URL prefix [extraQuery]   env: MODES=desktop,phone TIMES=2,5,10,15,20,30,40,90 SHOTS=1 AUTO=0
// Prints one JSON census line per time; writes shots/<prefix>-<mode>-t<T>.png (fixed camera per time, same for every run)
// and with AUTO=1 also shots/<prefix>-<mode>-t<T>-auto.png (the app's own automatic camera).
import { mkdirSync } from 'node:fs';
import { chromium } from 'playwright-core';
const url = process.argv[2] ?? 'http://127.0.0.1:5460/', PRE = process.argv[3] ?? 'seedling', extra = process.argv[4] ?? '';
const times = (process.env.TIMES ?? '2,5,10,15,20,30,40,90').split(',').map(Number);
const SHOTS = process.env.SHOTS !== '0', AUTO = process.env.AUTO === '1';
mkdirSync('shots', { recursive: true });
// [time up to, target y, distance]
const CAMS = [[2, 0.12, 0.7], [5, 0.3, 1.5], [10, 0.6, 3], [15, 0.95, 4.5], [20, 1.3, 6], [30, 2, 9], [40, 2.8, 12], [1e9, 4.2, 18.6]];
const browser = await chromium.launch({ executablePath: '/usr/sbin/chromium', args: ['--headless=new', '--use-gl=angle', `--use-angle=${process.env.GPU ?? 'vulkan'}`, '--enable-gpu', '--ignore-gpu-blocklist'] });
const census = (page) => page.evaluate(() => {
  const s = window.__arbor.sim, N = s.nodes, f = (x) => +x.toFixed(3);
  let live = 0, liveNodes = 0, lo = Infinity, hi = -Infinity, lv = 0, o1 = 0, lowBranch = Infinity, shedCh = 0;
  for (let c = 0; c < s.chains.length; c++) {
    const ch = s.chains[c];
    if (ch.pruned) { shedCh++; continue; }
    if (ch.nodes.length < 2) continue;
    live++; liveNodes += ch.nodes.length - 1;
    if (ch.order === 1) { o1++; lowBranch = Math.min(lowBranch, N[ch.nodes[0]].wy); }
  }
  for (const l of s.leaves) { const n = N[l.node]; if (s.chains[n.chain].pruned || l.dead) continue; lv++; const p = N[n.parent], y = p.wy + (n.wy - p.wy) * l.t; if (y < lo) lo = y; if (y > hi) hi = y; }
  // Bare pole: trunk length from the ground to the lowest leaf or live branch.
  return { t: f(s.time), height: f(s.bboxMax[1]), rBase: f(N[1]?.radius ?? 0), nodes: N.length, liveNodes, chains: live, prunedChains: shedCh, order1: o1, lowestBranch: f(lowBranch), leaves: lv, simLeaves: s.leaves.length, leafLow: f(lo), leafHigh: f(hi), shed: s.shedStats ?? null };
});
try {
  for (const mode of (process.env.MODES ?? 'desktop').split(',')) {
    const phone = mode === 'phone';
    const ctx = await browser.newContext(phone
      ? { viewport: { width: 411, height: 777 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, userAgent: 'Mozilla/5.0 (Linux; Android 15; Pixel) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0 Mobile Safari/537.36' }
      : { viewport: { width: 1280, height: 800 } });
    const page = await ctx.newPage();
    page.on('pageerror', (e) => console.error('[pageerror]', e.message));
    await page.goto(`${url}?cycle=false&nogui=1&hideui=1&speed=0&autoRotate=false&cinema=false&weather=calm&breakage=0&timeOfDay=13${phone ? '' : '&quality=High'}${extra ? '&' + extra : ''}`);
    await page.waitForFunction(() => window.__arbor !== undefined);
    await page.evaluate(() => { window.__arbor.params.sky.timeOfDay = 13; });
    const k = phone ? 1.7 : 1;
    let done = 0;
    for (const t of times) {
      await page.evaluate((s) => window.__arbor.fastForward(s), t - done); done = t;
      console.log(mode, JSON.stringify(await census(page)));
      if (!SHOTS) continue;
      if (AUTO) {
        await page.evaluate(() => { const a = window.__arbor; a.params.camera.autoFrame = true; a.fastForward(0); });
        await page.waitForTimeout(1500);
        await page.screenshot({ path: `shots/${PRE}-${mode}-t${t}-auto.png` });
      }
      const [, ty, d] = CAMS.find((c) => t <= c[0]);
      await page.evaluate(([ty, d]) => {
        const a = window.__arbor; a.params.camera.autoFrame = false;
        a.stage.controls.target.set(0, ty, 0); a.stage.camera.position.set(0.75 * d, ty + (d < 4 ? 0.5 : 0.12) * d, 0.55 * d); a.stage.controls.update?.(); a.fastForward(0);
      }, [ty, d * k]);
      await page.waitForTimeout(2000);
      await page.screenshot({ path: `shots/${PRE}-${mode}-t${t}.png` });
    }
    await ctx.close();
  }
} finally { await browser.close(); }

// Does the sway pop when the scheme changes (direct cascade <-> key poses, docs/bigtree.md 6.14)?
// In one page (phone emulation) every `Sway.update` is wrapped: the largest change of any node's offset from the
// update before is recorded, with the scheme of both updates. Reported: the step in updates where the scheme changed
// against the steps of ordinary updates in the same wind.
//   forced : paused tree at AGE, `sway.keyMin` flipped between Infinity and 0 every 1.2 s
//   growth : tree growing at 1x from GROW_AGE, `keyMin` set to live nodes + 40, so growth crosses the threshold itself
// Usage: node scripts/swayswitch.mjs URL   env: AGE=90 GROW_AGE=30 WX=storm,windy Q='' THROTTLE=4 GPU=vulkan
import { chromium } from 'playwright-core';
const url = process.argv[2], E = process.env, THROTTLE = Number(E.THROTTLE ?? 4);
const browser = await chromium.launch({ executablePath: '/usr/sbin/chromium', args: ['--headless=new', '--use-gl=angle', `--use-angle=${E.GPU ?? 'vulkan'}`, '--enable-gpu', '--ignore-gpu-blocklist'] });
const hook = () => {
  const sw = window.__arbor.sway, up = sw.update.bind(sw); let prev = new Float32Array(0), was = null;
  const R = (window.__sw = { same: [], change: [], n: 0 });
  sw.update = (...a) => {
    const r = up(...a), D = sw.D, n = window.__arbor.sim.nodes.length * 3; let m = 0;
    if (prev.length >= n && sw.live && was !== null) {
      for (let i = 0; i < n; i += 3) { const d = Math.hypot(D[i] - prev[i], D[i + 1] - prev[i + 1], D[i + 2] - prev[i + 2]); if (d > m) m = d; }
      (sw.stats.keyed === was ? R.same : R.change).push(m); R.n++;
    }
    if (prev.length < D.length) prev = new Float32Array(D.length);
    prev.set(D.subarray(0, n)); was = sw.live ? sw.stats.keyed : null;
    return r;
  };
};
const q = (a, p) => { const s = [...a].sort((x, y) => x - y); return s.length ? s[Math.min(s.length - 1, Math.floor(p * s.length))] : NaN; };
const line = (tag, r) => console.log(`${tag}: updates ${r.n}, ordinary step p50 ${q(r.same, 0.5).toFixed(3)} p95 ${q(r.same, 0.95).toFixed(3)} max ${q(r.same, 1).toFixed(3)} m | scheme changes ${r.change.length}: step p50 ${q(r.change, 0.5).toFixed(3)} max ${q(r.change, 1).toFixed(3)} m ${q(r.change, 1) <= q(r.same, 1) * 1.05 ? 'ok (within ordinary steps)' : 'ABOVE ordinary steps'}`);
let bad = 0;
try {
  for (const wx of (E.WX ?? 'storm,windy').split(',')) for (const mode of ['forced', 'growth']) {
    const ctx = await browser.newContext({ viewport: { width: 411, height: 777 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
    const page = await ctx.newPage(); page.setDefaultTimeout(600000);
    await page.goto(`${url}?cycle=false&nogui=1&hideui=1&speed=0&cinema=false&lightning=0&weather=${wx}${E.Q ?? ''}`, { timeout: 600000 });
    await page.waitForFunction(() => window.__arbor !== undefined);
    const cdp = await ctx.newCDPSession(page);
    await page.evaluate(([age, grow]) => { const A = window.__arbor; A.fastForward(age); A.params.time.speed = 1; A.params.time.paused = !grow; }, [mode === 'growth' ? Number(E.GROW_AGE ?? 30) : Number(E.AGE ?? 90), mode === 'growth']);
    await page.waitForTimeout(2500);
    if (THROTTLE > 1) await cdp.send('Emulation.setCPUThrottlingRate', { rate: THROTTLE });
    await page.evaluate(hook);
    if (mode === 'forced') for (let i = 0; i < 10; i++) { await page.evaluate((k) => { window.__arbor.sway.keyMin = k ? 0 : Infinity; }, i % 2 === 0); await page.waitForTimeout(1200); }
    else {
      await page.evaluate(() => { const s = window.__arbor.sway; s.keyMin = Infinity; });
      await page.waitForTimeout(600);
      await page.evaluate(() => { const s = window.__arbor.sway; s.keyMin = s.stats.live + 40; });
      await page.waitForTimeout(9000);
    }
    const r = await page.evaluate(() => ({ ...window.__sw, keyed: window.__arbor.sway.stats.keyed, live: window.__arbor.sway.stats.live }));
    line(`${wx} ${mode}${mode === 'growth' ? ` (ends keyed ${r.keyed}, live ${r.live})` : ''}`, r);
    if (!(r.change.length > 0) || q(r.change, 1) > q(r.same, 1) * 1.05) bad++;
    await ctx.close();
  }
} finally { await browser.close(); }
process.exit(bad ? 1 : 0);

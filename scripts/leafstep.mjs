// Leaf-follow check: do the drawn leaves move with their branches every frame, or stand still and jump?
// Grows the default tree to FF_S sim seconds, lets it run unpaused and samples every frame for SAMPLE_S seconds:
//  - whether the instance matrices changed (checksum over every 7th instance translation) while branch nodes moved,
//  - the per-frame step of 48 tracked leaves (matched by nearest instance in an index window, so re-ordering of the
//    instance set does not read as motion) against the per-frame step of the branch nodes.
// Serves a production build from PROF_DIST (built to a temp dir when missing), real GPU like profile.mjs.
// Usage: MODE=desktop|phone THROTTLE=4 FF_S=100 SAMPLE_S=10 QUERY='quality=High' PROF_DIST=/tmp/x PORT=5363 node scripts/leafstep.mjs
import { spawn, execSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { chromium } from 'playwright-core';

const E = process.env;
const MODE = E.MODE ?? 'desktop', GPU = E.GPU ?? 'gl', THROTTLE = Number(E.THROTTLE ?? 1);
const FF_S = Number(E.FF_S ?? 100), SAMPLE_S = Number(E.SAMPLE_S ?? 10), PORT = Number(E.PORT ?? 5363), QUERY = E.QUERY ?? '';
const DIST = E.PROF_DIST ?? '/tmp/arbor-prof-dist';
if (!existsSync(`${DIST}/index.html`)) execSync(`npx vite build --outDir ${DIST} --emptyOutDir`, { stdio: 'inherit' });
const vite = spawn('npx', ['vite', 'preview', '--outDir', DIST, '--port', String(PORT), '--strictPort'], { stdio: ['ignore', 'pipe', 'inherit'] });
await new Promise((res) => vite.stdout.on('data', (d) => String(d).includes('Local') && res()));
const gpuArgs = GPU === 'swiftshader' ? ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] : ['--use-gl=angle', `--use-angle=${GPU}`, '--enable-gpu'];
const browser = await chromium.launch({ executablePath: E.CHROMIUM ?? '/usr/sbin/chromium', args: ['--headless=new', ...gpuArgs, '--ignore-gpu-blocklist'] });

function sampler() {
  const S = (window.__ls = { on: false, rows: [], prevL: null, prevN: null, track: null });
  const raf = window.requestAnimationFrame.bind(window);
  window.requestAnimationFrame = (cb) => raf((ts) => {
    cb(ts);
    if (!S.on) return;
    const a = window.__arbor, m = a.leaves.mesh, M = m.instanceMatrix.array, n = m.count, nodes = a.sim.nodes;
    // Checksum of instance translations.
    let cs = 0;
    for (let i = 0; i < n; i += 7) cs += M[i * 16 + 12] * 1.3 + M[i * 16 + 13] * 0.7 + M[i * 16 + 14];
    // Branch node step: median and max over the younger half of the nodes (where the leaves sit).
    const N = nodes.length, h = N >> 1, cur = new Float64Array((N - h) * 3);
    for (let i = h; i < N; i++) { const nd = nodes[i]; cur[(i - h) * 3] = nd.wx; cur[(i - h) * 3 + 1] = nd.wy; cur[(i - h) * 3 + 2] = nd.wz; }
    let nMed = 0, nMax = 0;
    if (S.prevN) {
      const d = [];
      const L = Math.min(cur.length, S.prevN.length);
      for (let i = 0; i < L; i += 3) d.push(Math.hypot(cur[i] - S.prevN[i], cur[i + 1] - S.prevN[i + 1], cur[i + 2] - S.prevN[i + 2]));
      d.sort((x, y) => x - y); nMed = d[d.length >> 1] || 0; nMax = d[d.length - 1] || 0;
    }
    S.prevN = cur;
    // Tracked leaves: nearest instance to the previous position within ±600 indices.
    if (!S.track) { S.track = []; for (let k = 0; k < 48; k++) { const i = Math.floor(((k + 0.5) / 48) * n); S.track.push({ i, x: M[i * 16 + 12], y: M[i * 16 + 13], z: M[i * 16 + 14] }); } }
    const ld = [];
    for (const t of S.track) {
      let best = Infinity, bi = t.i;
      for (let i = Math.max(0, t.i - 600), e = Math.min(n, t.i + 600); i < e; i++) {
        const dx = M[i * 16 + 12] - t.x, dy = M[i * 16 + 13] - t.y, dz = M[i * 16 + 14] - t.z, d2 = dx * dx + dy * dy + dz * dz;
        if (d2 < best) { best = d2; bi = i; }
      }
      if (best < Infinity) { ld.push(Math.sqrt(best)); t.i = bi; t.x = M[bi * 16 + 12]; t.y = M[bi * 16 + 13]; t.z = M[bi * 16 + 14]; }
    }
    ld.sort((x, y) => x - y);
    S.rows.push({ ts, cs, n, simT: a.sim.time, nodes: N, nMed, nMax, lMed: ld[ld.length >> 1] || 0, lMax: ld[ld.length - 1] || 0, passes: a.leaves.passes });
  });
}

try {
  const ctx = await browser.newContext(MODE === 'phone'
    ? { viewport: { width: 411, height: 777 }, deviceScaleFactor: 2.625, isMobile: true, hasTouch: true,
        userAgent: 'Mozilla/5.0 (Linux; Android 15; Pixel) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0 Mobile Safari/537.36' }
    : { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  page.on('pageerror', (e) => console.error('[pageerror]', e.message));
  await page.addInitScript(sampler);
  const cdp = await ctx.newCDPSession(page);
  await page.goto(`http://localhost:${PORT}/?nogui=1&${QUERY}`);
  await page.waitForFunction(() => window.__arbor !== undefined);
  const ff = await page.evaluate((s) => { const a = window.__arbor; a.params.time.paused = true; let r; for (let t = 0; t < s; t += 10) r = a.fastForward(Math.min(10, s - t)); a.params.time.paused = false; return { ...r, quality: a.params.sky.quality, mode: a.leaves.mode.shader, inst: a.leaves.mesh.count }; }, FF_S);
  if (THROTTLE > 1) await cdp.send('Emulation.setCPUThrottlingRate', { rate: THROTTLE });
  await page.waitForTimeout(3000);
  await page.evaluate(() => { window.__ls.on = true; });
  await page.waitForTimeout(SAMPLE_S * 1000);
  const { rows, programs, end } = await page.evaluate(() => { const a = window.__arbor; window.__ls.on = false; return { rows: window.__ls.rows, programs: a.stage.renderer.info.programs.length, end: { simT: a.sim.time, nodes: a.sim.nodes.length, inst: a.leaves.mesh.count, passes: a.leaves.passes, followMs: a.leaves.followMs, followMaxMs: a.leaves.followMaxMs } }; });
  // Frames between leaf matrix changes, counted over frames in which the branch nodes moved.
  const gaps = []; let gap = 0, moved = 0;
  const ratios = []; let worst = { r: 0 };
  let lSum = 0, nSum = 0;
  for (let i = 1; i < rows.length; i++) {
    const r = rows[i], p = rows[i - 1];
    if (r.nMax <= 0) continue;
    moved++; gap++;
    if (r.cs !== p.cs || r.n !== p.n) { gaps.push(gap); gap = 0; }
    lSum += r.lMed; nSum += r.nMed;
    if (r.nMed > 0) { const q = r.lMed / r.nMed; ratios.push(q); if (q > worst.r) worst = { r: q, lMed: r.lMed, nMed: r.nMed, frame: i }; }
  }
  if (gap > 0) gaps.push(gap);
  gaps.sort((a, b) => a - b); ratios.sort((a, b) => a - b);
  const q = (a, p) => (a.length ? a[Math.min(a.length - 1, Math.floor(p * a.length))] : 0);
  const dts = rows.slice(1).map((r, i) => r.ts - rows[i].ts).sort((a, b) => a - b);
  console.log(JSON.stringify({
    mode: MODE, throttle: THROTTLE, start: ff, end, programs, frames: rows.length, framesBranchMoved: moved,
    frameMs: { median: +q(dts, 0.5).toFixed(1), p95: +q(dts, 0.95).toFixed(1) },
    framesBetweenLeafUpdates: { median: q(gaps, 0.5), p95: q(gaps, 0.95), max: gaps[gaps.length - 1] ?? 0, updates: gaps.length },
    leafStepOverBranchStep: { median: +q(ratios, 0.5).toFixed(2), p95: +q(ratios, 0.95).toFixed(2), max: +worst.r.toFixed(2), worst },
    pathRatio: +(lSum / (nSum || 1)).toFixed(2),
  }, null, 1));
} finally {
  await browser.close();
  vite.kill();
}

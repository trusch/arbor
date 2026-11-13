// Leaf-follow sweep check: how far do drawn leaves lag behind their branch nodes, and how long does a sweep take?
// Wraps `Leaves.follow` (instances placed and wall time per call) and compares, every frame, a quarter of the drawn
// instance matrices (64 of every 256) with what `Leaves.place` gives for the live node transforms: lag in world units
// and relative to the leaf's own size. Also counts instances whose node is gone (never re-placed) and frames between
// follow calls. FF_S=0 grows from the seed (instance order / thinning / fill changes are covered by the same check).
// Usage: MODE=desktop|phone THROTTLE=4 FF_S=60 SAMPLE_S=10 SPEED=1.5 QUERY='quality=High' SHOT_AT=5,20 SHOT_PREFIX=x
//        GPU=gl-egl PROF_DIST=/tmp/x PORT=5373 node scripts/leafsweep.mjs
import { spawn, execSync } from 'node:child_process';
import { existsSync, mkdirSync } from 'node:fs';
import { chromium } from 'playwright-core';

const E = process.env;
const MODE = E.MODE ?? 'desktop', GPU = E.GPU ?? 'gl-egl', THROTTLE = Number(E.THROTTLE ?? 1);
const FF_S = Number(E.FF_S ?? 60), SAMPLE_S = Number(E.SAMPLE_S ?? 10), PORT = Number(E.PORT ?? 5373), QUERY = E.QUERY ?? '', SPEED = Number(E.SPEED ?? 1.5);
const SHOT_AT = (E.SHOT_AT ?? '').split(',').filter(Boolean).map(Number), SHOT_PREFIX = E.SHOT_PREFIX ?? `sweep-${MODE}`;
const DIST = E.PROF_DIST ?? '/tmp/arbor-prof-dist';
if (!existsSync(`${DIST}/index.html`)) execSync(`npx vite build --outDir ${DIST} --emptyOutDir`, { stdio: 'inherit' });
const vite = spawn('npx', ['vite', 'preview', '--outDir', DIST, '--port', String(PORT), '--strictPort'], { stdio: ['ignore', 'pipe', 'inherit'] });
await new Promise((res) => vite.stdout.on('data', (d) => String(d).includes('Local') && res()));
const gpuArgs = GPU === 'swiftshader' ? ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] : ['--use-gl=angle', `--use-angle=${GPU}`, '--enable-gpu'];
const browser = await chromium.launch({ executablePath: E.CHROMIUM ?? '/usr/sbin/chromium', args: ['--headless=new', ...gpuArgs, '--ignore-gpu-blocklist'] });

function sampler() {
  const S = (window.__sw = { on: false, rows: [], calls: [], frame: 0, wrapped: false, ideal: new Float32Array(0), lastT: -1 });
  const raf = window.requestAnimationFrame.bind(window);
  window.requestAnimationFrame = (cb) => raf((ts) => {
    const a = window.__arbor;
    if (a && !S.wrapped && a.leaves.follow) {
      S.wrapped = true;
      const L = a.leaves, f = L.follow.bind(L);
      L.follow = (sim, p, cam, budget) => {
        const n = L.mesh.count, at0 = L.followAt >= n ? 0 : L.followAt, t0 = performance.now(), r = f(sim, p, cam, budget), ms = performance.now() - t0;
        const full = budget === undefined || budget === Infinity;
        if (S.on && r) S.calls.push({ frame: S.frame, n, ms, full, placed: full ? n : ((L.followAt - at0 + n) % n) || n });
        return r;
      };
    }
    cb(ts);
    S.frame++;
    if (!S.on || !a || !a.leaves.place) return;
    const L = a.leaves, n = L.mesh.count, M = L.mesh.instanceMatrix.array, cam = a.stage.camera.position, nodes = a.sim.nodes;
    if (S.ideal.length < n * 16) S.ideal = new Float32Array(L.mesh.instanceMatrix.count * 16);
    const I = S.ideal, ND = L.frontNode;
    let maxLag = 0, maxRel = 0, over10 = 0, over50 = 0, checked = 0, gone = 0, sumRel = 0;
    for (let c = 0; c < n; c += 256) {
      const to = Math.min(n, c + 64);
      for (let i = c; i < to; i++) I[i * 16 + 12] = NaN;
      L.place(L.frontD, ND, c, to, a.sim, a.params, cam.x, cam.y, cam.z, I, c * 16);
      for (let i = c; i < to; i++) {
        const o = i * 16;
        if (Number.isNaN(I[o + 12])) { gone++; continue; }
        const s = Math.hypot(I[o + 8], I[o + 9], I[o + 10]);
        if (s < 1e-3) continue;
        const d = Math.hypot(M[o + 12] - I[o + 12], M[o + 13] - I[o + 13], M[o + 14] - I[o + 14]), rel = d / s;
        checked++; sumRel += rel;
        if (d > maxLag) { maxLag = d; S.wi = i; }
        if (rel > maxRel) maxRel = rel;
        if (rel > 0.1) over10++;
        if (rel > 0.5) over50++;
      }
    }
    // Largest single-frame node step (a branch that itself jumps reads as leaf lag for one frame).
    let nodeStep = 0;
    const P = S.prevN, N = nodes.length, cur = S.curN && S.curN.length >= N * 3 ? S.curN : new Float32Array(N * 3 + 3000);
    for (let i = 0; i < N; i++) { const nd = nodes[i]; cur[i * 3] = nd.wx; cur[i * 3 + 1] = nd.wy; cur[i * 3 + 2] = nd.wz; if (P && i < S.prevCount) { const d = Math.hypot(nd.wx - P[i * 3], nd.wy - P[i * 3 + 1], nd.wz - P[i * 3 + 2]); if (d > nodeStep) nodeStep = d; } }
    S.curN = P && P.length >= N * 3 ? P : null; S.prevN = cur; S.prevCount = N;
    const wn = nodes[ND[S.wi ?? 0]], wp = wn && nodes[wn.parent];
    S.rows.push({ wi: S.wi, wNode: ND[S.wi ?? 0], wPruned: wn ? !!a.sim.chains[wn.chain].pruned : null, wNodes: nodes.length, wSeg: wn && wp ? Math.hypot(wn.wx - wp.wx, wn.wy - wp.wy, wn.wz - wp.wz) : 0, nodeStep, ts, simT: a.sim.time, moved: a.sim.time !== S.lastT, n, nodes: nodes.length, maxLag, maxRel, meanRel: checked ? sumRel / checked : 0, over10, over50, checked, gone, passes: L.passes, passOpen: L.passOpen });
    S.lastT = a.sim.time;
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
  await page.goto(`http://localhost:${PORT}/?cycle=false&nogui=1&speed=${SPEED}&${QUERY}`);
  await page.waitForFunction(() => window.__arbor !== undefined);
  const ff = await page.evaluate((s) => { const a = window.__arbor; a.params.time.paused = true; let r; for (let t = 0; t < s; t += 10) r = a.fastForward(Math.min(10, s - t)); a.params.time.paused = false; return { ...r, quality: a.params.sky.quality, mode: a.leaves.mode.shader, inst: a.leaves.mesh.count }; }, FF_S);
  if (THROTTLE > 1) await cdp.send('Emulation.setCPUThrottlingRate', { rate: THROTTLE });
  await page.waitForTimeout(FF_S > 0 ? 3000 : 500);
  await page.evaluate(() => { window.__sw.on = true; });
  mkdirSync('shots', { recursive: true });
  let at = 0;
  for (const s of [...SHOT_AT, SAMPLE_S]) {
    await page.waitForTimeout(Math.max(0, s - at) * 1000); at = s;
    if (s < SAMPLE_S || SHOT_AT.includes(s)) { const st = await page.evaluate(() => window.__arbor.sim.time); await page.screenshot({ path: `shots/${SHOT_PREFIX}-t${Math.round(st)}.png` }); }
  }
  const { rows, calls, end } = await page.evaluate(() => { const a = window.__arbor, S = window.__sw; S.on = false; return { rows: S.rows, calls: S.calls, end: { simT: a.sim.time, nodes: a.sim.nodes.length, inst: a.leaves.mesh.count, passes: a.leaves.passes, programs: a.stage.renderer.info.programs.length, followMaxMs: a.leaves.followMaxMs, frameErrors: a.frameErrors() } }; });
  const q = (a, p) => { const s = [...a].sort((x, y) => x - y); return s.length ? s[Math.min(s.length - 1, Math.floor(p * s.length))] : 0; };
  const r3 = (x) => Math.round(x * 1000) / 1000;
  const mv = rows.filter((r) => r.moved);
  const dts = rows.slice(1).map((r, i) => r.ts - rows[i].ts);
  const bud = calls.filter((c) => !c.full), full = calls.filter((c) => c.full);
  const gaps = bud.slice(1).map((c, i) => c.frame - bud[i].frame);
  const frac = bud.filter((c) => c.placed >= 0).map((c) => c.placed / c.n);
  const worst = mv.reduce((w, r) => (r.maxRel > w.maxRel ? r : w), { maxRel: 0 });
  const bySim = {};
  for (const r of mv) { const k = Math.floor(r.simT / 10) * 10; const b = (bySim[k] ??= { frames: 0, maxRel: 0, maxLag: 0, over10: 0, checked: 0, gone: 0, inst: 0 }); b.frames++; b.maxRel = Math.max(b.maxRel, r3(r.maxRel)); b.maxLag = Math.max(b.maxLag, r3(r.maxLag)); b.over10 += r.over10; b.checked += r.checked; b.gone = Math.max(b.gone, r.gone); b.inst = r.n; }
  console.log(JSON.stringify({
    mode: MODE, throttle: THROTTLE, start: ff, end, frames: rows.length, framesTreeMoved: mv.length,
    frameMs: { median: r3(q(dts, 0.5)), p95: r3(q(dts, 0.95)), max: r3(q(dts, 1)) },
    followBudgeted: { calls: bud.length, ms: { median: r3(q(bud.map((c) => c.ms), 0.5)), p95: r3(q(bud.map((c) => c.ms), 0.95)), max: r3(q(bud.map((c) => c.ms), 1)) }, framesBetweenCalls: { median: q(gaps, 0.5), max: q(gaps, 1) }, fractionOfCrownPerCall: { median: r3(q(frac, 0.5)), min: r3(q(frac, 0)) } },
    followFull: { calls: full.length, ms: { median: r3(q(full.map((c) => c.ms), 0.5)), max: r3(q(full.map((c) => c.ms), 1)) } },
    lagWorldUnits: { median: r3(q(mv.map((r) => r.maxLag), 0.5)), p95: r3(q(mv.map((r) => r.maxLag), 0.95)), max: r3(q(mv.map((r) => r.maxLag), 1)) },
    lagOverLeafSize: { medianOfFrameMax: r3(q(mv.map((r) => r.maxRel), 0.5)), p95: r3(q(mv.map((r) => r.maxRel), 0.95)), max: r3(q(mv.map((r) => r.maxRel), 1)), meanLeaf: r3(mv.reduce((s, r) => s + r.meanRel, 0) / (mv.length || 1)) },
    leavesOver10pct: { shareOfSamples: r3(mv.reduce((s, r) => s + r.over10, 0) / (mv.reduce((s, r) => s + r.checked, 0) || 1)), over50pctTotal: mv.reduce((s, r) => s + r.over50, 0) },
    goneNodeInstancesMax: q(rows.map((r) => r.gone), 1),
    worstFrame: { simT: r3(worst.simT ?? 0), n: worst.n, maxRel: r3(worst.maxRel), maxLag: r3(worst.maxLag ?? 0), nodeStepThatFrame: r3(worst.nodeStep ?? 0), passOpen: worst.passOpen },
    lagBeyondOneFrameNodeStep: { frames: mv.filter((r) => r.maxLag > r.nodeStep + 0.004).length, worstExcess: r3(Math.max(0, ...mv.map((r) => r.maxLag - r.nodeStep))) },
    worstFrames: [...mv].sort((x, y) => y.maxLag - x.maxLag).slice(0, 10).map((r) => ({ f: rows.indexOf(r), simT: r3(r.simT), lag: r3(r.maxLag), i: r.wi, node: r.wNode, ofNodes: r.wNodes, pruned: r.wPruned, segLen: r3(r.wSeg), nodeStep: r3(r.nodeStep), passes: r.passes })),
    instCounts: [...new Set(rows.map((r) => r.n))].slice(0, 40).join(','),
    bySimTime: bySim,
  }, null, 1));
} finally {
  await browser.close();
  vite.kill();
}

// Big-tree probe: grows the app's tree at a linear scale K of the default oak and records census, per-operation cost,
// live frame pacing and screenshots. Serves a production build from PROF_DIST (default /tmp/arbor-bg-dist) on PORT.
// Usage: MODE=phone|desktop K=2 ATTR=32000 MAXNODES=400000 FF_WALL_S=100 LIVE_S=10 THROTTLE=4 NAME=x node scripts/bigtree.mjs
//   ATTR / MAXNODES unset = app defaults (phone: 7000 node cap). EXTRA = more query. SERVE=0 reuses a running server on PORT.
// Output: one JSON line on stdout + prof/bigtree-<NAME>.json + shots/bigtree-<NAME>-{framed,close,wide}.png
import { spawn } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { chromium } from 'playwright-core';
const E = process.env, MODE = E.MODE ?? 'desktop', K = Number(E.K ?? 1), PORT = Number(E.PORT ?? 5680);
const THROTTLE = Number(E.THROTTLE ?? (MODE === 'phone' ? 4 : 1)), FF_WALL = Number(E.FF_WALL_S ?? 100) * 1000, LIVE_S = Number(E.LIVE_S ?? 10);
const NAME = E.NAME ?? `${MODE}-k${K}`, DIST = E.PROF_DIST ?? '/tmp/arbor-bg-dist', T_MAX = Number(E.T_MAX ?? 900), CHUNK = Number(E.CHUNK ?? 15);
mkdirSync('prof', { recursive: true }); mkdirSync('shots', { recursive: true });
let vite = null;
if (E.SERVE !== '0') {
  vite = spawn('npx', ['vite', 'preview', '--outDir', DIST, '--port', String(PORT), '--strictPort'], { stdio: ['ignore', 'pipe', 'inherit'] });
  await new Promise((res) => vite.stdout.on('data', (d) => String(d).includes('Local') && res()));
}
const browser = await chromium.launch({ executablePath: '/usr/sbin/chromium', args: ['--headless=new', '--use-gl=angle', `--use-angle=${E.GPU ?? 'vulkan'}`, '--enable-gpu', '--ignore-gpu-blocklist', '--enable-precise-memory-info'] });
function instrument() {
  const P = (window.__prof = { frames: [], cur: null, phase: 'boot', t: performance.now(), on: false });
  const enter = (n) => { const now = performance.now(); if (P.cur) P.cur.p[P.phase] = (P.cur.p[P.phase] || 0) + (now - P.t); P.phase = n; P.t = now; };
  let tel;
  Object.defineProperty(window, '__tel', { configurable: true, get: () => tel, set: (v) => { const ph = v.phase.bind(v); v.phase = (n, f) => { enter(n); return ph(n, f); }; tel = v; } });
  const raf = window.requestAnimationFrame.bind(window);
  window.requestAnimationFrame = (cb) => raf((ts) => {
    const s = performance.now(); P.cur = { ts, p: {} }; P.t = s;
    try { cb(ts); } finally { const e = performance.now(); P.cur.p[P.phase] = (P.cur.p[P.phase] || 0) + (e - P.t); P.cur.js = e - s; if (P.on) P.frames.push(P.cur); P.cur = null; }
  });
}
const q = (a, p) => (a.length ? a[Math.min(a.length - 1, Math.floor(p * a.length))] : 0), r2 = (x) => Math.round(x * 100) / 100;
function analyse(frames) {
  const dts = []; for (let i = 1; i < frames.length; i++) dts.push(frames[i].ts - frames[i - 1].ts);
  const s = [...dts].sort((a, b) => a - b), js = frames.map((f) => f.js).sort((a, b) => a - b), wall = dts.reduce((a, b) => a + b, 0), ph = {};
  const by = {}; for (const f of frames) for (const [k, v] of Object.entries(f.p)) (by[k] ??= []).push(v);
  for (const [k, a] of Object.entries(by)) { a.sort((x, y) => x - y); const tot = a.reduce((x, y) => x + y, 0); ph[k] = { perFrame: r2(tot / frames.length), max: r2(a[a.length - 1]) }; }
  return { frames: frames.length, fps: r2((1000 * dts.length) / wall), intMed: r2(q(s, 0.5)), intP95: r2(q(s, 0.95)), intMax: r2(s[s.length - 1] ?? 0), jsMean: r2(js.reduce((a, b) => a + b, 0) / (js.length || 1)), jsMed: r2(q(js, 0.5)), jsP95: r2(q(js, 0.95)), jsMax: r2(js[js.length - 1] ?? 0), phases: ph };
}
const out = { name: NAME, mode: MODE, k: K, throttle: THROTTLE };
try {
  const phone = MODE === 'phone';
  const ctx = await browser.newContext(phone
    ? { viewport: { width: 411, height: 777 }, deviceScaleFactor: 2.625, isMobile: true, hasTouch: true, userAgent: 'Mozilla/5.0 (Linux; Android 15; Pixel) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0 Mobile Safari/537.36' }
    : { viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  page.on('pageerror', (e) => console.error('[pageerror]', NAME, e.message));
  await page.addInitScript(instrument);
  const cdp = await ctx.newCDPSession(page);
  const f1 = (x) => (x * K).toFixed(2);
  const query = [`crown.height=${f1(6.5)}`, `crown.radius=${f1(3.6)}`, `crown.base=${f1(2.4)}`, `crown.bole=${f1(1.7)}`,
    E.ATTR ? `crown.attractors=${E.ATTR}` : '', E.MAXNODES ? `maxNodes=${E.MAXNODES}` : '', phone ? '' : 'quality=High', E.EXTRA ?? ''].filter(Boolean).join('&');
  out.query = query;
  await page.goto(`http://localhost:${PORT}/?nogui=1&hideui=1&speed=0&autoRotate=false&cinema=false&weather=calm&timeOfDay=13&season.date=0.3&season.hold=true&${query}`);
  await page.waitForFunction(() => window.__arbor !== undefined);
  const census = () => page.evaluate(() => {
    const a = window.__arbor, s = a.sim, r = a.stage.renderer; let live = 0, pruned = 0, alive = 0;
    for (const c of s.chains) { if (c.pruned) pruned++; else if (c.nodes.length > 1) live++; if (c.alive && !c.pruned) alive++; }
    let attrAlive = 0; for (let i = 0; i < s.attrAlive.length; i++) attrAlive += s.attrAlive[i];
    const lg = s.lightGrid;
    return { t: +s.time.toFixed(1), height: +s.bboxMax[1].toFixed(2), width: +Math.max(s.bboxMax[0] - s.bboxMin[0], s.bboxMax[2] - s.bboxMin[2]).toFixed(2), rBase: +(s.nodes[1]?.radius ?? 0).toFixed(3),
      nodes: s.nodes.length, maxNodes: a.params.growth.maxNodes, chains: live, pruned, growingTips: alive, attr: s.attrAlive.length, attrAlive, simLeaves: s.leaves.length, drawn: a.leaves.mesh.count,
      leafCap: a.leaves.maxInstances, rankScale: +(a.leaves.rankScale ?? 1).toFixed(3), lightCells: lg ? lg.dens.length : 0, lightDims: lg ? [lg.nx, lg.ny, lg.nz] : null,
      heapMb: Math.round(performance.memory.usedJSHeapSize / 1e6), gl: { ...r.info.memory }, programs: r.info.programs?.length, pixelRatio: r.getPixelRatio(),
      camDist: +a.stage.camera.position.distanceTo(a.stage.controls.target).toFixed(1), fog: a.stage.scene?.fog?.density ?? null };
  });
  // Growth by fast-forward (unthrottled), in CHUNK sim seconds, until grown / stalled / wall budget.
  out.traj = []; const w0 = Date.now(); let stall = 0, last = null; out.stop = 'T_MAX';
  for (let t = 0; t < T_MAX; t += CHUNK) {
    const c0 = Date.now();
    const r = await page.evaluate((s) => { const a = window.__arbor; const x = a.fastForward(s); return { ...x, grown: a.growth ? a.growth().grown : null, tips: a.sim.chains.filter((c) => c.alive && !c.pruned).length, leaves: a.sim.leaves.length }; }, CHUNK);
    out.traj.push({ t: Math.round(r.time), nodes: r.nodes, height: r.height, width: r.width, tips: r.tips, leaves: r.leaves, wallMsPerSimS: Math.round((Date.now() - c0) / CHUNK) });
    if (last && r.nodes - last.nodes < 0.002 * r.nodes && r.height - last.height < 0.01) stall++; else stall = 0;
    last = r;
    if (r.nodes >= (await page.evaluate(() => window.__arbor.params.growth.maxNodes))) { out.stop = 'maxNodes cap'; break; }
    if (stall >= 2) { out.stop = 'growth stalled'; break; }
    if (Date.now() - w0 > FF_WALL) { out.stop = 'wall budget'; break; }
  }
  const hEnd = last.height; out.tHeight95 = out.traj.find((x) => x.height >= 0.95 * hEnd)?.t; const nEnd = last.nodes; out.tNodes90 = out.traj.find((x) => x.nodes >= 0.9 * nEnd)?.t;
  out.grown = await census();
  // Per-operation cost at the CPU throttle of the mode.
  if (THROTTLE > 1) await cdp.send('Emulation.setCPUThrottlingRate', { rate: THROTTLE });
  out.ops = await page.evaluate(() => {
    const a = window.__arbor, s = a.sim, tm = (f, n = 1) => { const t = performance.now(); for (let i = 0; i < n; i++) f(); return +((performance.now() - t) / n).toFixed(2); };
    const o = {};
    o.simStep = tm(() => s.step(1 / 60), 20);
    o.updateStructure = tm(() => s.updateStructure(0), 3);
    o.updateLight = tm(() => s.updateLight(), 2);
    o.fullRedraw = tm(() => a.fastForward(0));
    o.canopyLastMs = a.canopy ? +(+a.canopy.lastMs).toFixed(2) : null; o.canopyMaxMs = a.canopy ? +(+a.canopy.maxMs).toFixed(2) : null;
    o.meadowStats = a.meadow ? { ...a.meadow.stats } : null;
    return o;
  });
  // Live: growing at 1x, then paused (sway, follow and render only).
  const run = async (sec, paused) => {
    await page.evaluate((p) => { const a = window.__arbor; a.params.time.speed = 1; a.params.time.paused = p; }, paused);
    await page.waitForTimeout(2500);
    await page.evaluate(() => { window.__prof.frames = []; window.__prof.on = true; });
    await page.waitForTimeout(sec * 1000);
    const fr = await page.evaluate(() => { const P = window.__prof; P.on = false; return P.frames; });
    return analyse(fr);
  };
  out.live = await run(LIVE_S, false);
  out.liveEnd = await census();
  out.idle = await run(Math.max(4, LIVE_S / 2), true);
  out.idleEnd = await census();
  if (THROTTLE > 1) await cdp.send('Emulation.setCPUThrottlingRate', { rate: 1 });
  // Shots: the app's own automatic camera, a close view into the crown, a far wide view with the scenery.
  if (E.SHOTS !== '0') {
    await page.evaluate(() => { const a = window.__arbor; a.params.camera.autoFrame = true; a.stage.autoCamera?.(); a.fastForward(0); });
    await page.waitForTimeout(5000);
    out.autoCam = await page.evaluate(() => { const a = window.__arbor, c = a.stage.camera; return { pos: c.position.toArray().map((v) => +v.toFixed(1)), target: a.stage.controls.target.toArray().map((v) => +v.toFixed(1)), far: c.far }; });
    await page.screenshot({ path: `shots/bigtree-${NAME}-framed.png` });
    const H = out.grown.height;
    const cam = async (tx, ty, px, py, pz, tag) => {
      await page.evaluate(([tx, ty, px, py, pz]) => { const a = window.__arbor; a.params.camera.autoFrame = false; a.stage.takeControl?.(); a.stage.controls.target.set(tx, ty, 0); a.stage.camera.position.set(px, py, pz); a.stage.controls.update?.(); a.fastForward(0); }, [tx, ty, px, py, pz]);
      await page.waitForTimeout(2500);
      await page.screenshot({ path: `shots/bigtree-${NAME}-${tag}.png` });
    };
    await cam(0, H * 0.55, 3.2, 1.7, 2.6, 'close');          // standing under the tree looking up into the crown
    await cam(0, H * 0.4, H * 3.2, H * 0.35 + 3, H * 2.4, 'wide'); // 4 tree heights away: horizon, hills, scenery trees
  }
  out.end = await census();
  writeFileSync(`prof/bigtree-${NAME}.json`, JSON.stringify(out, null, 1));
  const { traj, ...brief } = out; console.log(JSON.stringify({ ...brief, trajN: traj.length, trajLast: traj[traj.length - 1] }));
} finally { await browser.close(); vite?.kill(); }

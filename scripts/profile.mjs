// Frame-pacing profiler: per-frame intervals + per-phase CPU time (tel.phase transitions) for a growth run and an idle run.
// Serves a production build from PROF_DIST (built to a temp dir, never dist/).
// Usage: MODE=desktop|phone GPU=gl|vulkan|swiftshader THROTTLE=4 GROW_S=60 IDLE_S=20 SPEED=1.5 QUERY='quality=High' NAME=x node scripts/profile.mjs
// UNCAPPED=1 disables vsync (GPU-bound comparison). Output: prof/<NAME>.json + a summary on stdout.
import { spawn, execSync } from 'node:child_process';
import { mkdirSync, writeFileSync, existsSync } from 'node:fs';
import { chromium } from 'playwright-core';

const E = process.env;
const MODE = E.MODE ?? 'desktop', GPU = E.GPU ?? 'gl', THROTTLE = Number(E.THROTTLE ?? 1);
const GROW_S = Number(E.GROW_S ?? 60), IDLE_S = Number(E.IDLE_S ?? 20), SPEED = Number(E.SPEED ?? 1.5);
const NAME = E.NAME ?? `${MODE}-${GPU}-x${THROTTLE}`, PORT = Number(E.PORT ?? 5190), QUERY = E.QUERY ?? '';
const DIST = E.PROF_DIST ?? '/tmp/arbor-prof-dist';
if (!existsSync(`${DIST}/index.html`)) execSync(`npx vite build --outDir ${DIST} --emptyOutDir`, { stdio: 'inherit' });
mkdirSync('prof', { recursive: true });
const vite = spawn('npx', ['vite', 'preview', '--outDir', DIST, '--port', String(PORT), '--strictPort'], { stdio: ['ignore', 'pipe', 'inherit'] });
await new Promise((res) => vite.stdout.on('data', (d) => String(d).includes('Local') && res()));

const gpuArgs = GPU === 'swiftshader'
  ? ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader']
  : ['--use-gl=angle', `--use-angle=${GPU}`, '--enable-gpu'];
const browser = await chromium.launch({
  executablePath: E.CHROMIUM ?? '/usr/sbin/chromium',
  args: ['--headless=new', ...gpuArgs, '--ignore-gpu-blocklist', '--enable-precise-memory-info',
    ...(E.UNCAPPED === '1' ? ['--disable-gpu-vsync', '--disable-frame-rate-limit'] : [])],
});

function instrument() {
  const P = (window.__prof = { frames: [], cur: null, phase: 'boot', t: performance.now(), long: [], events: [], on: true });
  const enter = (n) => {
    const now = performance.now();
    if (P.cur) P.cur.p[P.phase] = (P.cur.p[P.phase] || 0) + (now - P.t);
    P.phase = n; P.t = now;
  };
  let tel;
  Object.defineProperty(window, '__tel', {
    configurable: true,
    get: () => tel,
    set: (v) => {
      const ph = v.phase.bind(v), lg = v.log.bind(v);
      v.phase = (n, f) => { enter(n); return ph(n, f); };
      v.log = (t, d) => { if (/realloc|dpr_change|context/.test(t)) P.events.push([Math.round(performance.now()), t, d]); return lg(t, d); };
      tel = v;
    },
  });
  const raf = window.requestAnimationFrame.bind(window);
  window.requestAnimationFrame = (cb) => raf((ts) => {
    const s = performance.now();
    P.cur = { ts, p: {} }; P.t = s;
    try { cb(ts); } finally {
      const e = performance.now();
      P.cur.p[P.phase] = (P.cur.p[P.phase] || 0) + (e - P.t);
      P.cur.js = e - s;
      P.cur.heap = performance.memory ? performance.memory.usedJSHeapSize : 0;
      if (P.on) P.frames.push(P.cur);
      P.cur = null;
    }
  });
  try { new PerformanceObserver((l) => { for (const e of l.getEntries()) P.long.push([Math.round(e.startTime), Math.round(e.duration)]); }).observe({ entryTypes: ['longtask'] }); } catch { /* unsupported */ }
}

const q = (a, p) => (a.length ? a[Math.min(a.length - 1, Math.floor(p * a.length))] : 0);
const r2 = (x) => Math.round(x * 100) / 100;
function analyse(frames, long) {
  const dts = [];
  for (let i = 1; i < frames.length; i++) dts.push(frames[i].ts - frames[i - 1].ts);
  const s = [...dts].sort((a, b) => a - b), js = frames.map((f) => f.js).sort((a, b) => a - b);
  const wall = dts.reduce((a, b) => a + b, 0);
  const phases = {};
  for (const f of frames) for (const [k, v] of Object.entries(f.p)) (phases[k] ??= []).push(v);
  const ph = {};
  for (const [k, a] of Object.entries(phases)) {
    a.sort((x, y) => x - y);
    const tot = a.reduce((x, y) => x + y, 0), big = a.filter((v) => v > 0.3);
    ph[k] = { totalMs: r2(tot), sharePct: r2((100 * tot) / wall), runs: big.length, medianRun: r2(q(big, 0.5)), p95Run: r2(q(big, 0.95)), maxRun: r2(a[a.length - 1]) };
  }
  // Which phase dominates the slow frames (interval ending at frame i is caused by the JS of frame i-1 or i).
  const blame = {};
  for (let i = 1; i < frames.length; i++) if (dts[i - 1] > 33) {
    const f = frames[i - 1].js > frames[i].js ? frames[i - 1] : frames[i];
    const top = Object.entries(f.p).sort((x, y) => y[1] - x[1])[0];
    const key = f.js < 8 ? 'not-JS (GPU/compositor)' : top[0];
    blame[key] = (blame[key] || 0) + 1;
  }
  let gc = 0, gcMb = 0;
  for (let i = 1; i < frames.length; i++) { const d = frames[i - 1].heap - frames[i].heap; if (d > 2e6) { gc++; gcMb += d / 1e6; } }
  const heaps = frames.map((f) => f.heap / 1e6);
  return {
    frames: frames.length, wallS: r2(wall / 1000), fps: r2((1000 * dts.length) / wall),
    interval: { median: r2(q(s, 0.5)), p95: r2(q(s, 0.95)), p99: r2(q(s, 0.99)), max: r2(s[s.length - 1] ?? 0), over20: s.filter((v) => v > 20).length, over33: s.filter((v) => v > 33).length, over50: s.filter((v) => v > 50).length, over100: s.filter((v) => v > 100).length },
    js: { median: r2(q(js, 0.5)), p95: r2(q(js, 0.95)), p99: r2(q(js, 0.99)), max: r2(js[js.length - 1] ?? 0), over16: js.filter((v) => v > 16.7).length, over33: js.filter((v) => v > 33.3).length, over100: js.filter((v) => v > 100).length },
    phases: ph, slowFrameBlame: blame,
    heapMb: { min: r2(Math.min(...heaps)), max: r2(Math.max(...heaps)), heapDrops: gc, droppedMb: r2(gcMb), allocMbPerS: r2((gcMb + heaps[heaps.length - 1] - heaps[0]) / (wall / 1000)) },
    longTasks: { n: long.length, max: Math.max(0, ...long.map((l) => l[1])), over100: long.filter((l) => l[1] > 100).length },
  };
}

const out = { name: NAME, mode: MODE, gpuFlag: GPU, throttle: THROTTLE, speed: SPEED, query: QUERY, uncapped: E.UNCAPPED === '1' };
try {
  const ctx = await browser.newContext(MODE === 'phone'
    ? { viewport: { width: 411, height: 777 }, deviceScaleFactor: 2.625, isMobile: true, hasTouch: true,
        userAgent: 'Mozilla/5.0 (Linux; Android 15; Pixel) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0 Mobile Safari/537.36' }
    : { viewport: { width: Number(E.SHOT_W ?? 1440), height: Number(E.SHOT_H ?? 900) }, deviceScaleFactor: Number(E.SHOT_DPR ?? 1) });
  const page = await ctx.newPage();
  page.on('pageerror', (e) => console.error('[pageerror]', e.message));
  await page.addInitScript(instrument);
  const cdp = await ctx.newCDPSession(page);
  if (THROTTLE > 1) await cdp.send('Emulation.setCPUThrottlingRate', { rate: THROTTLE });
  await page.goto(`http://localhost:${PORT}/?cycle=false&nogui=1&speed=${SPEED}&${QUERY}`);
  await page.waitForFunction(() => window.__arbor !== undefined);
  const state = () => page.evaluate(() => {
    const a = window.__arbor, r = a.stage.renderer, gl = r.getContext(), ext = gl.getExtension('WEBGL_debug_renderer_info');
    return {
      gl: ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER), quality: a.params.sky.quality, leafMode: a.leaves.mode,
      simT: +a.sim.time.toFixed(1), nodes: a.sim.nodes.length, simLeaves: a.sim.leaves.length, leafInst: a.leaves.mesh.count,
      pixelRatio: r.getPixelRatio(), drawBuf: [r.domElement.width, r.domElement.height], mem: { ...r.info.memory }, programs: r.info.programs?.length,
      lightCells: a.sim.lightGrid ? a.sim.lightGrid.dens.length : 0,
    };
  });
  // Draw calls / triangles summed over every pass of one frame (info.autoReset is per render() call otherwise).
  const drawStats = () => page.evaluate(() => new Promise((res) => {
    const r = window.__arbor.stage.renderer; const was = r.info.autoReset;
    r.info.autoReset = false; r.info.reset();
    requestAnimationFrame(() => requestAnimationFrame(() => { const o = { calls: r.info.render.calls, tris: r.info.render.triangles }; r.info.autoReset = was; res(o); }));
    r.info.reset();
  }));
  const take = () => page.evaluate(() => { const P = window.__prof; const o = { frames: P.frames, long: P.long, events: P.events }; P.frames = []; P.long = []; P.events = []; return o; });
  out.start = await state();
  console.error(NAME, 'GL:', out.start.gl, out.start.quality, JSON.stringify(out.start.leafMode));
  await take();
  // Growth run, sampled in thirds so early/mid/late costs are visible.
  out.growth = [];
  const all = { frames: [], long: [], events: [] };
  for (let i = 0; i < 3 && GROW_S > 0; i++) {
    await page.waitForTimeout((GROW_S * 1000) / 3);
    const d = await take(), st = await state();
    all.frames.push(...d.frames); all.long.push(...d.long); all.events.push(...d.events);
    out.growth.push({ upToSimT: st.simT, nodes: st.nodes, leafInst: st.leafInst, pixelRatio: st.pixelRatio, ...analyse(d.frames, d.long) });
  }
  if (GROW_S > 0) { out.growthAll = analyse(all.frames, all.long); out.growthEvents = all.events; }
  out.mature = await state();
  out.matureDraw = await drawStats();
  if (IDLE_S > 0) {
    await page.evaluate(() => { window.__arbor.params.time.paused = true; });
    await page.waitForTimeout(1500);
    await take();
    await page.waitForTimeout(IDLE_S * 1000);
    const d = await take();
    out.idle = analyse(d.frames, d.long); out.idleEvents = d.events; out.idleState = await state();
  }
  writeFileSync(`prof/${NAME}.json`, JSON.stringify(out, null, 1));
  const line = (t, a) => console.log(`${t}: fps ${a.fps} interval med/p95/p99/max ${a.interval.median}/${a.interval.p95}/${a.interval.p99}/${a.interval.max} >33:${a.interval.over33} >100:${a.interval.over100} | js med/p95/max ${a.js.median}/${a.js.p95}/${a.js.max} js>16.7:${a.js.over16} >33:${a.js.over33} >100:${a.js.over100} of ${a.frames} | heap drops ${a.heapMb.heapDrops} alloc ${a.heapMb.allocMbPerS} MB/s | blame ${JSON.stringify(a.slowFrameBlame)}`);
  console.log(`== ${NAME} gl=${out.start.gl}`);
  if (out.growthAll) { line('growth', out.growthAll); for (const [k, v] of Object.entries(out.growthAll.phases)) console.log(`   ${k}: ${v.sharePct}% runs ${v.runs} med ${v.medianRun} p95 ${v.p95Run} max ${v.maxRun}`); }
  if (out.idle) { line('idle', out.idle); for (const [k, v] of Object.entries(out.idle.phases)) console.log(`   ${k}: ${v.sharePct}% runs ${v.runs} med ${v.medianRun} p95 ${v.p95Run} max ${v.maxRun}`); }
  console.log('mature', JSON.stringify(out.mature), JSON.stringify(out.matureDraw));
} finally {
  await browser.close();
  vite.kill();
}

// Phone-path cost of a tree that grows over years: grows each case in phone emulation (411 x 777, Android UA, so the
// app's `lowEndDevice` path: quality Low) to the sample times and prints node count, sim / drawn leaves, height, width,
// trunk radius at 1.3 m, JS heap, an estimate of the GPU buffer bytes (every geometry attribute, index and instance
// buffer in the scene, counted once) and script ms per frame at rest (CPU throttle 4). One wide picture per case.
// Usage: node scripts/y3phone.mjs URL   CASES='name:query;name:query' TIMES=750,1350 PAR=2 DEVICE=phone|desk PREFIX=y3phone
import { mkdirSync, writeFileSync } from 'node:fs';
import { chromium } from 'playwright-core';
const url = process.argv[2] ?? 'http://127.0.0.1:5880/', E = process.env, TIMES = (E.TIMES ?? '150,750,1350').split(',').map(Number), PAR = Number(E.PAR ?? 2);
const CASES = Object.fromEntries((E.CASES ?? 'y1:years=0;y3:years=3').split(';').map((s) => { const i = s.indexOf(':'); return [s.slice(0, i), s.slice(i + 1)]; }));
const PREFIX = E.PREFIX ?? 'y3phone', DEVICE = E.DEVICE ?? 'phone';
mkdirSync('shots', { recursive: true });
const browser = await chromium.launch({ executablePath: '/usr/sbin/chromium', args: ['--headless=new', '--use-gl=angle', `--use-angle=${E.GPU ?? 'vulkan'}`, '--enable-gpu', '--ignore-gpu-blocklist', '--enable-precise-memory-info', '--js-flags=--expose-gc'] });
const phone = { viewport: { width: 411, height: 777 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, userAgent: 'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Mobile Safari/537.36' };
const desk = { viewport: { width: 1280, height: 800 }, deviceScaleFactor: 1 };
function instrument() {
  const P = (window.__prof = { js: [], on: false });
  const raf = window.requestAnimationFrame.bind(window);
  window.requestAnimationFrame = (cb) => raf((ts) => { const s = performance.now(); try { cb(ts); } finally { if (P.on) P.js.push(performance.now() - s); } });
}
let lock = Promise.resolve();
const exclusive = (f) => { const r = lock.then(f, f); lock = r.catch(() => {}); return r; };
const rows = {};
async function one(key) {
  const ctx = await browser.newContext(DEVICE === 'desk' ? desk : phone);
  const page = await ctx.newPage(); page.setDefaultTimeout(900000);
  page.on('pageerror', (e) => console.error(`[pageerror ${key}]`, e.message));
  await page.addInitScript(instrument);
  await page.goto(`${url}?start=0&nogui=1&hideui=1&cycle=false&timeOfDay=13&weather=calm&cinema=false&autoRotate=false&speed=0&season.date=0.3&season.hold=true&${CASES[key]}`, { timeout: 900000 });
  await page.waitForFunction(() => window.__arbor !== undefined, null, { timeout: 900000 });
  rows[key] = [];
  for (const T of TIMES) {
    while (await page.evaluate(() => window.__arbor.sim.time) < T - 0.01) await page.evaluate((T) => window.__arbor.fastForward(Math.min(15, T - window.__arbor.sim.time)), T);
    await page.evaluate(() => { const a = window.__arbor; a.params.camera.autoFrame = true; a.stage.autoCamera?.(); a.fastForward(0); });
    await page.waitForTimeout(3000);
    const info = await page.evaluate(() => {
      const a = window.__arbor, s = a.sim; let h = 0, x0 = 0, x1 = 0, z0 = 0, z1 = 0, live = 0, dbh = 0, best = 1e9;
      for (const n of s.nodes) { if (s.chains[n.chain].pruned) continue; live++; if (n.wy > h) h = n.wy; if (n.wx < x0) x0 = n.wx; if (n.wx > x1) x1 = n.wx; if (n.wz < z0) z0 = n.wz; if (n.wz > z1) z1 = n.wz;
        if (n.chain === 0 && Math.abs(n.wy - 1.3) < best) { best = Math.abs(n.wy - 1.3); dbh = n.radius; } }
      // GPU buffer bytes: every attribute / index / instance buffer reachable from the scene, each array buffer once.
      const seen = new Set(); let gpu = 0, tree = 0;
      const add = (arr, isTree) => { if (!arr || seen.has(arr.buffer)) return; seen.add(arr.buffer); gpu += arr.byteLength; if (isTree) tree += arr.byteLength; };
      const treeGeo = new Set([a.branches?.mesh?.geometry, a.leaves?.mesh?.geometry].filter(Boolean));
      a.stage.scene.traverse((o) => {
        const g = o.geometry, isTree = o === a.leaves?.mesh || o === a.branches?.mesh || treeGeo.has(g);
        if (g) { for (const k of Object.keys(g.attributes)) { const at = g.attributes[k]; add(at.isInterleavedBufferAttribute ? at.data.array : at.array, isTree); } if (g.index) add(g.index.array, isTree); }
        if (o.instanceMatrix) add(o.instanceMatrix.array, isTree);
        if (o.instanceColor) add(o.instanceColor.array, isTree);
      });
      if (window.gc) window.gc();
      const ri = a.stage.renderer.info;
      return { t: +s.time.toFixed(0), years: s.years, maxNodes: a.params.growth.maxNodes, quality: a.params.sky.quality, nodes: s.nodes.length, live, chains: s.chains.length, simLeaves: s.leaves.length, drawnLeaves: a.leaves.mesh.count,
        h: +h.toFixed(2), w: +Math.max(x1 - x0, z1 - z0).toFixed(2), dbh: +dbh.toFixed(3), alive: s.chains.filter((c) => c.alive).length, attr: s.attr ? s.attr.length / 3 : -1, buds: s.buds?.length ?? -1,
        heapMB: +(performance.memory.usedJSHeapSize / 1048576).toFixed(1), gpuMB: +(gpu / 1048576).toFixed(1), treeGpuMB: +(tree / 1048576).toFixed(1), geometries: ri.memory.geometries, textures: ri.memory.textures, programs: ri.programs?.length, tris: ri.render.triangles, calls: ri.render.calls };
    });
    info.jsMs = await exclusive(async () => {
      const cdp = await ctx.newCDPSession(page);
      await cdp.send('Emulation.setCPUThrottlingRate', { rate: Number(E.THROTTLE ?? 4) });
      await page.evaluate(() => { const A = window.__arbor; A.params.time.speed = 1; A.params.time.paused = false; });
      await page.waitForTimeout(2500);
      await page.evaluate(() => { window.__prof.js = []; window.__prof.on = true; });
      await page.waitForTimeout(5000);
      const js = await page.evaluate(() => { window.__prof.on = false; window.__arbor.params.time.speed = 0; return window.__prof.js; });
      await cdp.send('Emulation.setCPUThrottlingRate', { rate: 1 });
      js.sort((x, y) => x - y);
      return `${(js[js.length >> 1] ?? NaN).toFixed(1)} (${(js[Math.floor(js.length * 0.9)] ?? NaN).toFixed(1)}) n=${js.length}`;
    });
    rows[key].push(info);
    console.log(key, JSON.stringify(info));
    const H = info.h, R = Math.max(H, info.w, 9);
    if (E.FIXCAM) { // same camera for every case: sizes are comparable between pictures
      const [d, y] = E.FIXCAM.split(',').map(Number);
      await page.evaluate(([d, y]) => { const a = window.__arbor; a.params.camera.autoFrame = false; a.stage.takeControl?.(); a.stage.controls.target.set(0, y, 0); a.stage.camera.position.set(d * 0.76, y * 0.5 + 1.5, d * 0.65); a.stage.controls.update?.(); a.fastForward(0); }, [d, y]);
    } else await page.evaluate(([H, R]) => { const a = window.__arbor; a.params.camera.autoFrame = false; a.stage.takeControl?.(); a.stage.controls.target.set(0, H * 0.45, 0); a.stage.camera.position.set(R * 2.6, H * 0.2 + 1.5, R * 2.2); a.stage.controls.update?.(); a.fastForward(0); }, [H, R]);
    await page.waitForTimeout(2500);
    await page.screenshot({ path: `shots/${PREFIX}-${DEVICE}-${key}-t${T}.jpg`, type: 'jpeg', quality: 88 });
  }
  await ctx.close();
}
try {
  const queue = Object.keys(CASES);
  await Promise.all(Array.from({ length: PAR }, async () => { while (queue.length) { const k = queue.shift(); try { await one(k); } catch (e) { console.log(k, 'FAILED', String(e).slice(0, 300)); } } }));
  writeFileSync(`shots/${PREFIX}-${DEVICE}.json`, JSON.stringify(rows, null, 1));
} finally { await browser.close(); }

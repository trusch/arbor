// Leaf emergence probe: first-draw scale per leaf + a close-up frame burst assembled into one contact sheet.
// Usage: node scripts/leafgrow.mjs URL prefix [extraQuery]
//   env: MODE=desktop|phone  T0=0|40 (0 = seedling tip, else an outer twig after fastForward)  SPEED=1  BURST_S=6 (sim s)
//        THROTTLE=n (CPU)  SHOTS=0 (numbers only)  GPU=vulkan
// Output: shots/<prefix>-sheet.png, a table of the first 30 leaves (sim birth, first draw, scale at first draw as a
// fraction of the largest scale the instance reaches, taken at the first frame it is drawn larger than 0) and one JSON summary line (also used by smoke-style gates).
import { mkdirSync, rmSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { chromium } from 'playwright-core';
const url = process.argv[2] ?? 'http://127.0.0.1:5500/', PRE = process.argv[3] ?? 'leafgrow', extra = process.argv[4] ?? '';
const E = process.env, MODE = E.MODE ?? 'desktop', T0 = Number(E.T0 ?? 0), SPEED = Number(E.SPEED ?? 1), BURST = Number(E.BURST_S ?? 6);
const phone = MODE === 'phone';
mkdirSync('shots', { recursive: true });
const tmp = `/tmp/leafgrow-${PRE}`; rmSync(tmp, { recursive: true, force: true }); mkdirSync(tmp, { recursive: true });
const browser = await chromium.launch({ executablePath: '/usr/sbin/chromium', args: ['--headless=new', '--use-gl=angle', `--use-angle=${E.GPU ?? 'vulkan'}`, '--enable-gpu', '--ignore-gpu-blocklist'] });
try {
  const ctx = await browser.newContext(phone
    ? { viewport: { width: 411, height: 777 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, userAgent: 'Mozilla/5.0 (Linux; Android 15; Pixel) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0 Mobile Safari/537.36' }
    : { viewport: { width: 1280, height: 800 } });
  const page = await ctx.newPage();
  page.on('pageerror', (e) => console.error('[pageerror]', e.message));
  if (E.THROTTLE) await (await ctx.newCDPSession(page)).send('Emulation.setCPUThrottlingRate', { rate: Number(E.THROTTLE) });
  await page.goto(`${url}?nogui=1&hideui=1&speed=0&autoRotate=false&cinema=false&weather=calm&timeOfDay=13${phone ? '' : '&quality=High'}${extra ? '&' + extra : ''}`);
  await page.waitForFunction(() => window.__arbor !== undefined);
  await page.waitForTimeout(1500);
  await page.evaluate((t0) => {
    const a = window.__arbor; a.params.camera.autoFrame = false; a.params.sky.timeOfDay = 13;
    let tgt = [0, 0.2, 0], pos = [0.42, 0.42, 0.42];
    if (t0 > 0) {
      a.fastForward(t0);
      const N = a.sim.nodes;
      let best = null;
      for (let i = N.length - 1; i >= 0 && !best; i--) { const n = N[i], c = a.sim.chains[n.chain]; if (n.leafy && c.order >= 1 && !c.pruned && c.juv === undefined && Math.hypot(n.wx, n.wz) > 1.5 && n.wy > 2) best = n; }
      best ??= N[N.length - 1];
      const h = Math.hypot(best.wx, best.wz) || 1;
      tgt = [best.wx, best.wy, best.wz]; pos = [best.wx + best.wx / h * 0.9, best.wy + 0.35, best.wz + best.wz / h * 0.9];
    }
    a.stage.controls.target.set(...tgt); a.stage.camera.position.set(...pos); a.stage.controls.update?.(); a.fastForward(0);
    // Per-frame tracker: scale (length of the card's y column) of every drawn instance at first draw and its maximum.
    const T = (window.__lg = { m: new Map(), t0: a.sim.time, js: [], on: false });
    const scan = (old) => {
      const L = a.leaves, mesh = L.mesh; if (!mesh) return;
      const n = mesh.count, D = L.frontD, ND = L.frontNode, arr = mesh.instanceMatrix.array, now = a.sim.time;
      for (let i = 0; i < n; i++) {
        const key = ND[i] * 4096 + Math.round(D[i * 11] * 4000), o = i * 16, s = Math.hypot(arr[o + 4], arr[o + 5], arr[o + 6]);
        let r = T.m.get(key);
        if (!r) { r = { node: ND[i], born: D[i * 11 + 8], first: now, s0: s, max: s, old }; T.m.set(key, r); }
        if (s > r.max) r.max = s;
        if (r.seen === undefined && s > 0) { r.seen = now; r.sv = s; }
      }
    };
    scan(true);
    const raf = window.requestAnimationFrame.bind(window);
    window.requestAnimationFrame = (cb) => raf((ts) => { const s = performance.now(); cb(ts); if (T.on) T.js.push(performance.now() - s); scan(false); });
  }, T0);
  await page.waitForTimeout(800);
  const box = phone ? { x: 0, y: 150, width: 411, height: 411 } : { x: 340, y: 100, width: 600, height: 600 };
  const t0 = await page.evaluate((sp) => { const a = window.__arbor; window.__lg.on = true; a.params.time.speed = sp; return a.sim.time; }, SPEED);
  const files = [];
  let next = 0;
  for (let i = 0; i < 400; i++) {
    const t = await page.evaluate(() => window.__arbor.sim.time) - t0;
    if (t > BURST) break;
    if (E.SHOTS !== '0' && t >= next && files.length < 60) {
      const f = `${tmp}/${String(files.length).padStart(2, '0')}.png`;
      await page.screenshot({ path: f, clip: box });
      const ts = await page.evaluate(() => window.__arbor.sim.time) - t0;
      files.push([f, ts]); next = Math.max(next + BURST / 60, ts);
    } else await page.waitForTimeout(8);
  }
  // Let the leaves of the burst finish growing (their final scale is the reference).
  await page.waitForFunction(([t]) => window.__arbor.sim.time > t, [t0 + BURST + 9], { timeout: 120000 });
  const res = await page.evaluate(([t0, B]) => {
    const a = window.__arbor, T = window.__lg; a.params.time.speed = 0;
    const rows = [...T.m.values()].filter((r) => !r.old && r.first <= t0 + B && r.max > 0).sort((x, y) => x.first - y.first);
    const fr = rows.map((r) => (r.sv ?? r.s0) / r.max).sort((x, y) => x - y);
    // Leaves that came into being during the run (the rest are old leaves newly included by thinning / shell fill).
    const yf = rows.filter((r) => r.born >= t0 - 0.5).map((r) => (r.sv ?? r.s0) / r.max).sort((x, y) => x - y);
    const js = T.js.slice().sort((x, y) => x - y);
    // Clusters: leaves of one node that became visible within the same 50 ms of sim time.
    const byNode = new Map();
    for (const r of rows) { const l = byNode.get(r.node) ?? []; l.push(r.seen ?? r.first); byNode.set(r.node, l); }
    let spread = 0, nodes = 0;
    for (const l of byNode.values()) if (l.length > 1) { spread += Math.max(...l) - Math.min(...l); nodes++; }
    return {
      rows: rows.slice(0, 30).map((r) => [r.node, +(r.born - t0).toFixed(2), +(r.first - t0).toFixed(2), +((r.seen ?? r.first) - t0).toFixed(2), +((r.sv ?? r.s0) / r.max).toFixed(3)]),
      sum: { leaves: rows.length, firstFracMax: +(fr[fr.length - 1] ?? 0).toFixed(3), firstFracMedian: +(fr[fr.length >> 1] ?? 0).toFixed(3), over10pct: fr.filter((x) => x > 0.1).length, young: yf.length, youngFirstFracMax: +(yf[yf.length - 1] ?? 0).toFixed(3), youngOver10pct: yf.filter((x) => x > 0.1).length,
        clusterSpreadMeanS: +(nodes ? spread / nodes : 0).toFixed(2), jsMeanMs: +(js.reduce((s, x) => s + x, 0) / (js.length || 1)).toFixed(2), jsP95Ms: +(js[Math.floor(js.length * 0.95)] ?? 0).toFixed(2), frames: js.length,
        quality: a.params.sky.quality, drawn: a.leaves.mesh.count, errors: a.frameErrors() },
    };
  }, [t0, BURST]);
  console.log('node  born  firstDraw  visible  scaleAtFirstVisibleFrame/final   (sim s after start)');
  for (const r of res.rows) console.log(r.join('\t'));
  console.log(JSON.stringify({ prefix: PRE, mode: MODE, t0: T0, speed: SPEED, ...res.sum }));
  if (files.length) {
    const args = [];
    for (const [f, t] of files) args.push('-label', `${t.toFixed(2)}s`, f);
    execFileSync('montage', [...args, '-tile', '10x', '-geometry', '240x240+2+2', '-background', '#222', '-fill', 'white', `shots/${PRE}-sheet.png`]);
    console.log(`shots/${PRE}-sheet.png (${files.length} frames)`);
  }
  await ctx.close();
} finally { await browser.close(); }

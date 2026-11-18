// Year-3 survey of every tree the app offers (panel presets + start-screen kinds): grows `?years=3` to T, then
// framed / wide / under shots in summer, a wide shot in winter, the numbers (height, width, trunk radius at breast
// height, nodes, leaves, structureCheck) and script ms per frame at rest (phone emulation, CPU throttle 4).
// One contact sheet per tree (shots/y3-<key>-sheet.jpg) and an overview of the wide summer shots (shots/y3-overview.jpg).
// Usage: node scripts/y3survey.mjs URL   T=750 ONLY=oak,willow PAR=3 GPU=vulkan THROTTLE=4 YEARS=3
import { mkdirSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { chromium } from 'playwright-core';
const url = process.argv[2] ?? 'http://127.0.0.1:5880/', E = process.env, T = Number(E.T ?? 750), PAR = Number(E.PAR ?? 3);
const q = (o) => Object.entries(o).map(([k, v]) => `&${k}=${encodeURIComponent(v)}`).join('');
const P = (name) => `&preset=${encodeURIComponent(name)}`;
// Start-screen earth kinds at the middle of their roll ranges (src/start.ts KINDS); willow / cypress / the four worlds
// roll around the presets of the same name.
const TREES = {
  oak: P('Oak meadow'), cypress: P('Windswept cypress'), willow: P('Weeping willow'), lowgrav: P('Low-gravity alien'),
  crimson: P('Crimson world'), biolum: P('Bioluminescent night'), heavy: P('Heavy world'), journey: P('Journey: Earth → alien'),
  'kind-broad-maple': q({ 'crown.shape': 0.15, 'crown.height': 6.5, 'crown.radius': 3.75, 'crown.base': 2.4, 'crown.bole': 1.65, 'growth.branchAngle': 44, 'growth.wander': 0.32, 'leaves.form': 'maple', 'leaves.hue': 0.275, 'leaves.saturation': 0.53, 'leaves.size': 0.155 }),
  'kind-slender-birch': q({ 'crown.shape': 0.18, 'crown.height': 8.3, 'crown.radius': 2.6, 'crown.base': 2.75, 'crown.bole': 2.2, 'growth.branchAngle': 35, 'growth.apicalDominance': 0.64, 'growth.weeping': 0.3, 'growth.straightness': 1.8, 'leaves.form': 'birch', 'leaves.hue': 0.27, 'leaves.saturation': 0.54, 'leaves.lightness': 1.11, 'leaves.size': 0.15 }),
  'kind-spreading-linden': q({ 'crown.shape': 1.75, 'crown.height': 4.9, 'crown.radius': 5.2, 'crown.base': 2.9, 'crown.bole': 2.25, 'growth.branchAngle': 60, 'growth.scaffoldBranching': 0.75, 'growth.vigorDecay': 0.845, 'thickness.rootFlare': 1.9, 'leaves.form': 'round', 'leaves.hue': 0.26, 'leaves.saturation': 0.54, 'leaves.size': 0.165 }),
  'kind-young-ginkgo': q({ 'crown.shape': 0.85, 'crown.height': 7.9, 'crown.radius': 3.05, 'crown.base': 1.9, 'crown.bole': 1.35, 'growth.branchAngle': 46, 'growth.apicalDominance': 0.68, 'leaves.form': 'ginkgo', 'leaves.hue': 0.235, 'leaves.saturation': 0.56, 'leaves.lightness': 1.08, 'leaves.size': 0.155 }),
};
const keys = (E.ONLY ? E.ONLY.split(',') : Object.keys(TREES));
mkdirSync('shots', { recursive: true });
const browser = await chromium.launch({ executablePath: '/usr/sbin/chromium', args: ['--headless=new', '--use-gl=angle', `--use-angle=${E.GPU ?? 'vulkan'}`, '--enable-gpu', '--ignore-gpu-blocklist'] });
const phone = { viewport: { width: 411, height: 777 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, userAgent: 'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Mobile Safari/537.36' };
function instrument() {
  const P = (window.__prof = { js: [], on: false });
  const raf = window.requestAnimationFrame.bind(window);
  window.requestAnimationFrame = (cb) => raf((ts) => { const s = performance.now(); try { cb(ts); } finally { if (P.on) P.js.push(performance.now() - s); } });
}
let lock = Promise.resolve();
const exclusive = (f) => { const r = lock.then(f, f); lock = r.catch(() => {}); return r; };
const rows = {};
async function grow(key, date) {
  const ctx = await browser.newContext(phone);
  const page = await ctx.newPage(); page.setDefaultTimeout(900000);
  page.on('pageerror', (e) => console.error(`[pageerror ${key}]`, e.message));
  await page.addInitScript(instrument);
  await page.goto(`${url}?start=0&nogui=1&hideui=1&years=${E.YEARS ?? 3}&cycle=false&timeOfDay=13&weather=calm&cinema=false&autoRotate=false&speed=0&season.date=${date}&season.hold=true${TREES[key]}`, { timeout: 900000 });
  await page.waitForFunction(() => window.__arbor !== undefined, null, { timeout: 900000 });
  while (await page.evaluate(() => window.__arbor.sim.time) < T - 0.01) await page.evaluate((T) => window.__arbor.fastForward(Math.min(15, T - window.__arbor.sim.time)), T);
  await page.evaluate(() => { const a = window.__arbor; a.params.camera.autoFrame = true; a.stage.autoCamera?.(); a.fastForward(0); });
  await page.waitForTimeout(5000);
  const info = await page.evaluate(() => {
    const a = window.__arbor, s = a.sim; let h = 0, x0 = 0, x1 = 0, z0 = 0, z1 = 0, live = 0, dbh = 0, best = 1e9;
    for (const n of s.nodes) { if (s.chains[n.chain].pruned) continue; live++; if (n.wy > h) h = n.wy; if (n.wx < x0) x0 = n.wx; if (n.wx > x1) x1 = n.wx; if (n.wz < z0) z0 = n.wz; if (n.wz > z1) z1 = n.wz;
      if (n.chain === 0 && Math.abs(n.wy - 1.3) < best) { best = Math.abs(n.wy - 1.3); dbh = n.radius; } }
    const c = a.stage.camera.position, t = a.stage.controls.target;
    return { h: +h.toFixed(2), w: +Math.max(x1 - x0, z1 - z0).toFixed(2), wx: +(x1 - x0).toFixed(2), wz: +(z1 - z0).toFixed(2), dbh: +dbh.toFixed(3), nodes: s.nodes.length, live, leaves: s.leaves.length, check: s.structureCheck().differing, cam: [c.x, c.y, c.z].map((v) => +v.toFixed(1)), tgt: [t.x, t.y, t.z].map((v) => +v.toFixed(1)) };
  });
  return { ctx, page, info };
}
const camTo = async (page, t, p, file) => {
  await page.evaluate(([t, p]) => { const a = window.__arbor; a.params.camera.autoFrame = false; a.stage.takeControl?.(); a.stage.controls.target.set(...t); a.stage.camera.position.set(...p); a.stage.controls.update?.(); a.fastForward(0); }, [t, p]);
  await page.waitForTimeout(2500);
  await page.screenshot({ path: file, type: 'jpeg', quality: 88 });
};
async function one(key) {
  const t0 = Date.now();
  try {
    const { ctx, page, info } = await grow(key, 0.3);
    await page.screenshot({ path: `shots/y3-${key}-framed.jpg`, type: 'jpeg', quality: 88 });
    // script time per frame at rest: clock running at speed 1, CPU throttle 4, one window at a time over all pages
    info.jsMs = await exclusive(async () => {
      const cdp = await ctx.newCDPSession(page);
      await cdp.send('Emulation.setCPUThrottlingRate', { rate: Number(E.THROTTLE ?? 4) });
      await page.evaluate(() => { const A = window.__arbor; A.params.time.speed = 1; A.params.time.paused = false; });
      await page.waitForTimeout(2500);
      await page.evaluate(() => { window.__prof.js = []; window.__prof.on = true; });
      await page.waitForTimeout(5000);
      const js = await page.evaluate(() => { window.__prof.on = false; window.__arbor.params.time.speed = 0; return window.__prof.js; });
      await cdp.send('Emulation.setCPUThrottlingRate', { rate: 1 });
      js.sort((a, b) => a - b);
      return { med: +(js[js.length >> 1] ?? NaN).toFixed(1), p90: +(js[Math.floor(js.length * 0.9)] ?? NaN).toFixed(1), frames: js.length };
    });
    info.tAfter = await page.evaluate(() => +window.__arbor.sim.time.toFixed(1));
    const H = info.h, R = Math.max(H, info.w);
    await camTo(page, [0, H * 0.45, 0], [R * 2.6, H * 0.2 + 1.5, R * 2.2], `shots/y3-${key}-wide.jpg`);
    await camTo(page, [0, H * 0.6, 0], [H * 0.42, 1.6, H * 0.28], `shots/y3-${key}-under.jpg`);
    await ctx.close();
    const w = await grow(key, 0.85);
    await camTo(w.page, [0, H * 0.45, 0], [R * 2.6, H * 0.2 + 1.5, R * 2.2], `shots/y3-${key}-winter.jpg`);
    info.winter = { nodes: w.info.nodes, h: w.info.h, check: w.info.check };
    await w.ctx.close();
    info.s = Math.round((Date.now() - t0) / 1000);
    rows[key] = info;
    console.log(key, JSON.stringify(info));
    const f = (n) => `shots/y3-${key}-${n}.jpg`;
    execFileSync('montage', ['-label', '%t', f('wide'), f('framed'), f('under'), f('winter'), '-tile', '4x1', '-geometry', '411x777+3+3', '-background', '#222', '-fill', '#ddd', `shots/y3-${key}-sheet.jpg`]);
  } catch (e) { console.log(key, 'FAILED', String(e).slice(0, 300)); rows[key] = { failed: String(e).slice(0, 300) }; }
}
try {
  const queue = [...keys];
  await Promise.all(Array.from({ length: PAR }, async () => { while (queue.length) await one(queue.shift()); }));
  const ok = keys.filter((k) => rows[k] && !rows[k].failed);
  if (ok.length > 1) execFileSync('montage', ['-label', '%t', ...ok.map((k) => `shots/y3-${k}-wide.jpg`), '-tile', '6x', '-geometry', '300x567+3+3', '-background', '#222', '-fill', '#ddd', 'shots/y3-overview.jpg']);
  writeFileSync(`shots/y3-survey${E.ONLY ? '-' + keys.join('+') : ''}.json`, JSON.stringify(rows, null, 1));
  console.log('| tree | height | width | dbh r | nodes (live) | leaves | check | js ms med (p90) |');
  for (const k of ok) { const r = rows[k]; console.log(`| ${k} | ${r.h} | ${r.w} | ${r.dbh} | ${r.nodes} (${r.live}) | ${r.leaves} | ${r.check} | ${r.jsMs.med} (${r.jsMs.p90}) |`); }
} finally { await browser.close(); }

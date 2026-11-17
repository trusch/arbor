// Wildlife measurements + the bird heading gate, on the real GPU in phone emulation.
// Usage: PORT=5520 node scripts/crittercheck.mjs [seconds=90] [bird,fire]
// bird: forces bird activity (short perches, short absences, a flush now and then) and logs per frame the angle
//   between the drawn heading and the horizontal velocity, plus how the two birds relate (arrival / leave offsets,
//   route azimuths, bound phase). Exit code 1 when a moving bird (> 1 m/s horizontal) is drawn more than MAX_DEG off
//   its direction of travel, or a frame-to-frame step is a teleport.
// fire: glow quad size in metres and CSS px from the automatic camera at night.
import { spawn } from 'node:child_process';
import { chromium } from 'playwright-core';

const SECS = Number(process.argv[2] ?? 90), cases = (process.argv[3] ?? 'bird,fire').split(',');
const PORT = Number(process.env.PORT ?? 5520), MAX_DEG = Number(process.env.MAX_DEG ?? 20);
const vite = spawn('npx', ['vite', '--port', String(PORT), '--strictPort'], { stdio: ['ignore', 'pipe', 'inherit'] });
await new Promise((res) => vite.stdout.on('data', (d) => String(d).includes('Local') && res()));
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM ?? '/usr/sbin/chromium', args: ['--headless=new', '--use-gl=angle', `--use-angle=${process.env.GPU ?? 'vulkan'}`, '--enable-gpu', '--ignore-gpu-blocklist'] });
const PHONE = { viewport: { width: 411, height: 777 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, userAgent: 'Mozilla/5.0 (Linux; Android 15; Pixel) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0 Mobile Safari/537.36' };
const url = (hour) => `http://localhost:${PORT}/?speed=0&autoRotate=false&cinema=false&weather=calm&timeOfDay=${hour}&cycle=false&season.date=0.3&season.hold=true&nogui=1&hideui=1`;
const open = async (hour) => {
  const ctx = await browser.newContext(PHONE), page = await ctx.newPage();
  page.on('pageerror', (e) => console.error('[pageerror]', e.message));
  await page.goto(url(hour));
  await page.waitForFunction(() => window.__arbor !== undefined);
  await page.evaluate(() => window.__arbor.fastForward(90));
  await page.waitForTimeout(4000);
  return { ctx, page };
};
let fail = 0;
try {
  if (cases.includes('bird')) {
    const { ctx, page } = await open(13);
    await page.evaluate(() => {
      const c = window.__arbor.critters, R = window.__rec = { frames: [], ev: [] };
      c.force = { butterflies: 0, fireflies: 0, birds: 1 };
      const prev = c.birds.map(() => null);
      let lastFlush = 0;
      const tick = () => {
        const t = c.t;
        c.birds.forEach((b, i) => {
          // Forced activity: short absences and perches.
          if (b.st === 0 && b.wait > 2.5) b.wait = 0.3 + 2.2 * (b.wait % 1);
          if (b.st === 2 && b.dur > 7) b.dur = 2.5 + 4.5 * (b.dur % 1);
          const p = prev[i];
          if (p && p.st !== b.st) R.ev.push({ i, t, from: p.st, to: b.st, x: b.x, y: b.y, z: b.z });
          if (b.st !== 0 && p && p.st !== 0 && t > p.t) {
            const dt = t - p.t, vx = (b.x - p.x) / dt, vy = (b.y - p.y) / dt, vz = (b.z - p.z) / dt, vh = Math.hypot(vx, vz);
            const ang = vh > 1e-6 ? Math.acos(Math.max(-1, Math.min(1, (vx * b.hx + vz * b.hz) / vh))) * 180 / Math.PI : 0;
            R.frames.push({ i, t, st: b.st, pst: p.st, vh, vy, ang, dt, cyc: b.cyc ?? (b.t * 1.8) % 1, flapping: b.flapping, fly: b.st === 1 || (b.st === 3 && b.launched !== false), pitch: b.pitch, bank: b.bank ?? 0 });
          }
          prev[i] = { st: b.st, x: b.x, y: b.y, z: b.z, t };
        });
        // A flush now and then, also in mid approach.
        if (t - lastFlush > 23 && c.birds.some((b) => b.st === 1 && b.t > 2)) { lastFlush = t; c.flush(); R.ev.push({ i: -1, t, flush: true }); }
        requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
    await page.waitForTimeout(SECS * 1000);
    const R = await page.evaluate(() => window.__rec);
    const NAMES = ['away', 'approach', 'perched', 'leaving', 'hop'];
    const deg = (a) => +a.toFixed(1);
    for (const i of [0, 1]) {
      for (const st of [1, 2, 3, 4]) {
        const f = R.frames.filter((r) => r.i === i && r.st === st), mv = f.filter((r) => r.vh > 1);
        if (!f.length) continue;
        const angs = mv.map((r) => r.ang).sort((a, b) => a - b), q = (p) => angs.length ? deg(angs[Math.min(angs.length - 1, Math.floor(p * angs.length))]) : 0;
        const sp = f.map((r) => Math.hypot(r.vh, r.vy)).sort((a, b) => a - b);
        console.log(`bird ${i} ${NAMES[st]}: frames ${f.length}, moving ${mv.length}, heading-vs-velocity deg median ${q(0.5)} p95 ${q(0.95)} max ${q(0.9999)}, >20deg ${mv.filter((r) => r.ang > 20).length}, >90deg (backwards) ${mv.filter((r) => r.ang > 90).length}, speed m/s median ${deg(sp[sp.length >> 1])} max ${deg(sp[sp.length - 1])}`);
      }
    }
    // Flight frames only: a perched, crouching or hopping bird is also carried by its swaying twig (reported above).
    const hopBack = R.frames.filter((r) => r.st === 4 && r.vh > 1 && r.ang > 90).length;
    const moving = R.frames.filter((r) => r.fly && r.vh > 1 && r.dt < 0.1), bad = moving.filter((r) => r.ang > MAX_DEG);
    const tele = R.frames.filter((r) => Math.hypot(r.vh, r.vy) > 30 && r.dt < 0.1);
    // How the two relate.
    const evs = (i, from, to) => R.ev.filter((e) => e.i === i && e.from === from && e.to === to);
    const near = (a, list) => list.reduce((m, e) => Math.min(m, Math.abs(e.t - a.t)), 1e9);
    const offs = (from, to) => evs(1, from, to).map((e) => +near(e, evs(0, from, to)).toFixed(2));
    const az = (e) => Math.atan2(e.z, e.x) * 180 / Math.PI;
    const dAz = (from, to) => evs(1, from, to).map((e) => { const l = evs(0, from, to).filter((x) => x.t <= e.t + 1e-6).pop(); if (!l) return null; let d = Math.abs(az(e) - az(l)) % 360; if (d > 180) d = 360 - d; return deg(d); }).filter((x) => x !== null);
    console.log('visits', evs(0, 0, 1).length, evs(1, 0, 1).length, 'flushes', R.ev.filter((e) => e.flush).length);
    console.log('start-of-approach offset bird1 vs nearest bird0 (s):', JSON.stringify(offs(0, 1)));
    console.log('landing offset (s):', JSON.stringify(offs(1, 2)));
    console.log('take-off offset (s):', JSON.stringify(offs(2, 3)));
    console.log('approach azimuth difference (deg):', JSON.stringify(dAz(0, 1)));
    // Bound phase difference while both are in flight.
    const byT = new Map();
    for (const r of R.frames) if (r.st === 1 || r.st === 3) { const k = r.t.toFixed(4); (byT.get(k) ?? byT.set(k, []).get(k)).push(r); }
    const both = [...byT.values()].filter((v) => v.length === 2);
    const same = both.filter((v) => v[0].flapping === v[1].flapping).length;
    const pd = both.map((v) => { let d = Math.abs(v[0].cyc - v[1].cyc) % 1; return d > 0.5 ? 1 - d : d; });
    const drift = pd.length ? Math.max(...pd) - Math.min(...pd) : 0;
    console.log(`both in flight: ${both.length} frames, wings in the same state (beating / tucked) ${both.length ? (100 * same / both.length).toFixed(0) : 0} % (independent ~50 %), bound phase difference range over the run ${drift.toFixed(2)} (0 = locked)`);
    console.log(`HEADING GATE: ${moving.length} moving frames, ${bad.length} over ${MAX_DEG} deg, worst ${deg(moving.reduce((m, r) => Math.max(m, r.ang), 0))} deg; teleport frames (> 30 m/s) ${tele.length}; hop frames facing backwards ${hopBack}`);
    for (const r of bad.slice(0, 6)) console.log('  bad', JSON.stringify({ i: r.i, t: +r.t.toFixed(2), st: r.st, pst: r.pst, vh: deg(r.vh), ang: deg(r.ang) }));
    if (bad.length || tele.length || hopBack || moving.length < 500) fail = 1;
    console.log(fail ? 'FAIL' : 'PASS', 'bird heading follows velocity');
    await ctx.close();
  }
  if (cases.includes('fire')) {
    const { ctx, page } = await open(23.5);
    await page.evaluate(() => { window.__arbor.critters.force = { butterflies: 0, fireflies: 1, birds: 0 }; });
    await page.waitForTimeout(2500);
    const out = await page.evaluate(() => {
      const A = window.__arbor, c = A.critters, cam = A.stage.camera, g = c.glow.geometry, P = g.attributes.position.array, n = g.drawRange.count / 6;
      const pxPerRad = innerHeight / (2 * Math.tan(cam.fov * Math.PI / 360));
      const rows = [];
      for (let q = 0; q < n; q++) {
        const o = q * 12, w = Math.hypot(P[o + 3] - P[o], P[o + 4] - P[o + 1], P[o + 5] - P[o + 2]);
        const cx = (P[o] + P[o + 6]) / 2, cy = (P[o + 1] + P[o + 7]) / 2, cz = (P[o + 2] + P[o + 8]) / 2, d = Math.hypot(cx - cam.position.x, cy - cam.position.y, cz - cam.position.z);
        rows.push({ w, d, px: w / d * pxPerRad });
      }
      return { n, camDist: Math.hypot(cam.position.x, cam.position.z), treeH: A.sim.bboxMax[1], rows };
    });
    const med = (k) => { const a = out.rows.map((r) => r[k]).sort((x, y) => x - y); return a.length ? [a[0], a[a.length >> 1], a[a.length - 1]].map((x) => +x.toFixed(3)) : []; };
    console.log(`fireflies lit ${out.n}, automatic camera ${out.camDist.toFixed(1)} m from the trunk (tree ${out.treeH.toFixed(1)} m), viewport 411 CSS px wide`);
    console.log('  quad width m [min, median, max]:', JSON.stringify(med('w')), ' distance m:', JSON.stringify(med('d')), ' quad width CSS px:', JSON.stringify(med('px')));
    await ctx.close();
  }
} finally { await browser.close(); vite.kill(); }
process.exit(fail);

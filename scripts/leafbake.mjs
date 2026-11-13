// Safe-path bake probe for emerging leaves: baked instance colour, n.L, E_lambert, E_wanted per leaf age.
// Usage: node scripts/leafbake.mjs URL [hour] [extraQuery]   env: RUN_S=6 (sim s), MODE=phone|desktop
// Prints one row per age bin (0.5 s): leaves, mean and max baked colour (linear rgb, as uploaded), mean luminance
// relative to grown leaves (> 8 s), mean |n.L|, share with the sun on the back of the seen face, mean E_l and E_w (green).
import { chromium } from 'playwright-core';
const url = process.argv[2] ?? 'http://127.0.0.1:5520/', hour = Number(process.argv[3] ?? 13), extra = process.argv[4] ?? '';
const E = process.env, RUN = Number(E.RUN_S ?? 6), phone = (E.MODE ?? 'phone') === 'phone';
const browser = await chromium.launch({ executablePath: '/usr/sbin/chromium', args: ['--headless=new', '--use-gl=angle', `--use-angle=${E.GPU ?? 'vulkan'}`, '--enable-gpu', '--ignore-gpu-blocklist'] });
try {
  const ctx = await browser.newContext(phone
    ? { viewport: { width: 411, height: 777 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, userAgent: 'Mozilla/5.0 (Linux; Android 15; Pixel) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0 Mobile Safari/537.36' }
    : { viewport: { width: 1280, height: 800 } });
  const page = await ctx.newPage();
  page.on('pageerror', (e) => console.error('[pageerror]', e.message));
  await page.goto(`${url}?cycle=false&nogui=1&hideui=1&speed=0&autoRotate=false&cinema=false&weather=calm&timeOfDay=${hour}${phone ? '' : '&quality=High'}${extra ? '&' + extra : ''}`);
  await page.waitForFunction(() => window.__arbor !== undefined);
  await page.waitForTimeout(1500);
  const rows = await page.evaluate(([hour, RUN]) => new Promise((done) => {
    const a = window.__arbor; a.params.camera.autoFrame = false; a.params.sky.timeOfDay = hour;
    a.stage.controls.target.set(0, 0.2, 0); a.stage.camera.position.set(0.42, 0.42, 0.42); a.stage.controls.update?.();
    const LD = 11, bins = [], t0 = a.sim.time;
    const bin = (k) => (bins[k] ??= { n: 0, r: 0, g: 0, b: 0, mx: 0, ndl: 0, back: 0, el: 0, ew: 0, clamp: 0 });
    const sm = (x0, x1, x) => { const t = Math.min(1, Math.max(0, (x - x0) / (x1 - x0))); return t * t * (3 - 2 * t); };
    let lastPass = -1;
    const tick = () => {
      const L = a.leaves, mesh = L.mesh, now = a.sim.time;
      if (L.passes !== lastPass && mesh.count > 0) {
        lastPass = L.passes;
        const D = L.frontD, ND = L.frontNode, M = mesh.instanceMatrix.array, C = mesh.instanceColor.array, lit = L.lit, S = lit.sun, cam = lit.cam;
        for (let i = 0; i < mesh.count; i++) {
          const o = i * 16, age = now - D[i * LD + 8];
          let nx = M[o + 8], ny = M[o + 9], nz = M[o + 10]; const nl = Math.hypot(nx, ny, nz);
          if (nl < 1e-9 || age < 0) continue;
          nx /= nl; ny /= nl; nz /= nl;
          if (nx * (cam.x - M[o + 12]) + ny * (cam.y - M[o + 13]) + nz * (cam.z - M[o + 14]) < 0) { nx = -nx; ny = -ny; nz = -nz; }
          const ndl = nx * S.x + ny * S.y + nz * S.z, hw = 0.5 * ny + 0.5, nd = a.sim.nodes[ND[i]];
          const occ = 0.42 + 0.78 * sm(0.15, 0.85, nd ? nd.light : 1), vis = (0.35 + 0.65 * occ) * 0.85;
          const hemi = lit.ground.g + (lit.sky.g - lit.ground.g) * hw, el = hemi + lit.sunCol.g * Math.max(0, ndl);
          const glow = 0.15 * (ndl < 0 ? 1 : 0.3) * vis, ew = hemi * occ + lit.sunCol.g * (Math.abs(ndl) * vis + glow * 1.15);
          const b = bin(age > 8 ? 17 : Math.min(16, Math.floor(age * 2)));
          b.n++; b.r += C[i * 3]; b.g += C[i * 3 + 1]; b.b += C[i * 3 + 2]; b.mx = Math.max(b.mx, C[i * 3], C[i * 3 + 1], C[i * 3 + 2]);
          b.ndl += Math.abs(ndl); if (ndl < 0) b.back++; b.el += el; b.ew += ew; if (ew / Math.max(0.02, el) >= 8) b.clamp++;
        }
      }
      if (now - t0 < RUN) return requestAnimationFrame(tick);
      const lit = L.lit;
      done({ lit: { sun: [lit.sunCol.r, lit.sunCol.g, lit.sunCol.b], sky: [lit.sky.r, lit.sky.g, lit.sky.b], ground: [lit.ground.r, lit.ground.g, lit.ground.b], dir: [lit.sun.x, lit.sun.y, lit.sun.z] }, safe: !!L.variant, passes: L.passes,
        bins: bins.map((b, k) => b && { age: k === 17 ? '>8' : (k / 2).toFixed(1), n: b.n, r: b.r / b.n, g: b.g / b.n, b: b.b / b.n, max: b.mx, absNdl: b.ndl / b.n, back: b.back / b.n, El: b.el / b.n, Ew: b.ew / b.n, clamp: b.clamp / b.n }) });
    };
    a.params.time.speed = 1; requestAnimationFrame(tick);
  }), [hour, RUN]);
  const f = (x) => x.toFixed(3).padStart(7);
  console.log(JSON.stringify({ hour, safe: rows.safe, passes: rows.passes, lit: Object.fromEntries(Object.entries(rows.lit).map(([k, v]) => [k, v.map((x) => +x.toFixed(3))])) }));
  const ref = rows.bins[17], lum = (b) => 0.2126 * b.r + 0.7152 * b.g + 0.0722 * b.b;
  console.log('age(s)      n       r       g       b     max  lum/grown  |n.L|  sunBack    E_l     E_w  clamped');
  for (const b of rows.bins) if (b) console.log(`${String(b.age).padStart(5)} ${String(b.n).padStart(6)} ${f(b.r)} ${f(b.g)} ${f(b.b)} ${f(b.max)} ${f(ref ? lum(b) / lum(ref) : 0)}   ${f(b.absNdl)} ${f(b.back)} ${f(b.El)} ${f(b.Ew)} ${f(b.clamp)}`);
  await ctx.close();
} finally { await browser.close(); }

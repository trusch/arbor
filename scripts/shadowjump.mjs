// Ground-shadow continuity probe: grows the tree in real time and samples the ground under it at a steady rate, with the
// tree's own colour/depth writes off (shadows stay), logging next to each sample the canopy decal state, the meadow shade
// fill counter and the shadow camera bounds. Prints the largest frame-to-frame steps and what changed at each.
// Usage: node scripts/shadowjump.mjs URL prefix [extraQuery]
//   env: MODE=phone|desktop  SPEED=1  DUR=60 (sim s)  FPS=8  AUTO=1 (app camera, tree visible, lower 40 % of the frame)
//        HOUR=h  CYCLE=1 (day cycle on; the app default is off, hour 17.6)  THROTTLE=n  GPU=vulkan
// Output: shots/<prefix>-curve.png (mean |dL| per sample, bake events marked), shots/<prefix>-jumpN-{a,b}.png, /tmp/<prefix>.json
import { mkdirSync, writeFileSync } from 'node:fs';
import { chromium } from 'playwright-core';
const url = process.argv[2] ?? 'http://127.0.0.1:5620/', PRE = process.argv[3] ?? 'sj', extra = process.argv[4] ?? '';
const E = process.env, phone = (E.MODE ?? 'phone') === 'phone', SPEED = Number(E.SPEED ?? 1), DUR = Number(E.DUR ?? 60), FPS = Number(E.FPS ?? 8), AUTO = E.AUTO === '1';
mkdirSync('shots', { recursive: true });
const browser = await chromium.launch({ executablePath: '/usr/sbin/chromium', args: ['--headless=new', '--use-gl=angle', `--use-angle=${E.GPU ?? 'vulkan'}`, '--enable-gpu', '--ignore-gpu-blocklist'] });
try {
  const ctx = await browser.newContext(phone
    ? { viewport: { width: 411, height: 777 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, userAgent: 'Mozilla/5.0 (Linux; Android 15; Pixel) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0 Mobile Safari/537.36' }
    : { viewport: { width: 1280, height: 800 } });
  const page = await ctx.newPage();
  page.on('pageerror', (e) => console.error('[pageerror]', e.message));
  if (E.THROTTLE) await (await ctx.newCDPSession(page)).send('Emulation.setCPUThrottlingRate', { rate: Number(E.THROTTLE) });
  await page.goto(`${url}?nogui=1&hideui=1&speed=0&weather=calm&season.on=false${AUTO ? '' : '&autoRotate=false&cinema=false'}${phone ? '' : '&quality=High'}${extra ? '&' + extra : ''}`);
  await page.waitForFunction(() => window.__arbor !== undefined);
  await page.waitForTimeout(1500);
  const info = await page.evaluate(([auto, fps, hour, cycle]) => {
    const a = window.__arbor, st = a.stage;
    if (hour >= 0) a.params.sky.timeOfDay = hour;
    if (cycle) a.params.sky.cycle = true;
    if (!auto) {
      a.params.camera.autoFrame = false; a.params.sky.wind = 0;
      st.controls.target.set(0, 0, 0); st.camera.position.set(0.01, 30, 0.01); st.controls.update?.();
      // Tree off (colour and depth), shadows stay: shadow passes use their own depth materials.
      const mats = new Set([a.leaves.mesh.material]);
      mats.add(a.branches.mesh.material);
      window.__sjMats = mats;
    }
    const N = 128, c = document.createElement('canvas'); c.width = c.height = N;
    const g = c.getContext('2d', { willReadFrequently: true }), gl = st.renderer.domElement;
    const S = (window.__sj = { on: false, rows: [], frames: [], N, c, js: [] });
    let last = 0, prev = null;
    // Decal alpha at fixed WORLD points (24 x 24 over +-9 m), read every frame from the canvas pixels through the plane
    // transform: what the ground under a fixed spot shows. aMean / aMax = largest per-frame mean / single-point step (0..255).
    const G = 24, A0 = new Float32Array(G * G), A1 = new Float32Array(G * G);
    let aHas = false, aMean = 0, aMax = 0;
    const alpha = () => {
      const m = a.canopy.mesh, px = a.canopy.img.data, cs = Math.cos(m.rotation.y), sn = Math.sin(m.rotation.y);
      for (let j = 0, i = 0; j < G; j++) for (let k = 0; k < G; k++, i++) {
        let v = 0;
        if (m.visible) {
          const dx = (k / (G - 1) - 0.5) * 18 + 0.137 - m.position.x, dz = (j / (G - 1) - 0.5) * 18 + 0.071 - m.position.z;
          const tx = ((dx * cs - dz * sn) / m.scale.x + 0.5) * 256 - 0.5, tz = ((dx * sn + dz * cs) / m.scale.z + 0.5) * 256 - 0.5;
          const x0 = Math.floor(tx), z0 = Math.floor(tz), fx = tx - x0, fz = tz - z0;
          const at = (x, z) => (x < 0 || z < 0 || x > 255 || z > 255 ? 0 : px[(z * 256 + x) * 4 + 3]);
          v = (at(x0, z0) * (1 - fx) + at(x0 + 1, z0) * fx) * (1 - fz) + (at(x0, z0 + 1) * (1 - fx) + at(x0 + 1, z0 + 1) * fx) * fz;
        }
        A1[i] = v;
      }
      if (aHas) { let s = 0; for (let i = 0; i < G * G; i++) { const e = Math.abs(A1[i] - A0[i]); s += e; if (e > aMax) aMax = e; } if (s / (G * G) > aMean) aMean = s / (G * G); }
      A0.set(A1); aHas = true;
    };
    const tick = () => {
      requestAnimationFrame(tick);
      const now = performance.now();
      if (S.on) alpha();
      if (!S.on || now - last < 1000 / fps) return;
      last = now;
      const W = gl.width, H = gl.height;
      if (auto) g.drawImage(gl, 0, H * 0.6, W, H * 0.4, 0, 0, N, N);
      else { const s = Math.min(W, H); g.drawImage(gl, (W - s) / 2, (H - s) / 2, s, s, 0, 0, N, N); }
      const d = g.getImageData(0, 0, N, N).data, L = new Uint8Array(N * N);
      for (let i = 0; i < N * N; i++) L[i] = (d[i * 4] * 54 + d[i * 4 + 1] * 183 + d[i * 4 + 2] * 19) >> 8;
      let sum = 0, big = 0, blk = 0;
      if (prev) {
        for (let i = 0; i < N * N; i++) { const e = Math.abs(L[i] - prev[i]); sum += e; if (e > 8) big++; }
        for (let by = 0; by < N; by += 8) for (let bx = 0; bx < N; bx += 8) { let b = 0; for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) b += Math.abs(L[(by + y) * N + bx + x] - prev[(by + y) * N + bx + x]); if (b / 64 > blk) blk = b / 64; }
      }
      prev = L; S.frames.push(L);
      const m = a.canopy.mesh, sc = st.sun.shadow.camera, sp = st.sun.position;
      S.rows.push({ t: +a.sim.time.toFixed(2), hr: +a.params.sky.timeOfDay.toFixed(3), d: +(sum / (N * N)).toFixed(3), big: +(100 * big / (N * N)).toFixed(2), blk: +blk.toFixed(2),
        bakes: a.canopy.bakes, vis: m.visible, px: +m.position.x.toFixed(3), pz: +m.position.z.toFixed(3), rot: +m.rotation.y.toFixed(4), sx: +m.scale.x.toFixed(3), sz: +m.scale.z.toFixed(3), op: +m.material.opacity.toFixed(3),
        fills: a.meadow?.stats.bakes ?? 0, lv: a.sim.lightVersion, fr: [sc.left, sc.right, sc.top, sc.bottom].map((v) => +v.toFixed(3)).join('/'), sun: [sp.x, sp.y, sp.z].map((v) => +v.toFixed(2)).join('/'), ms: +a.canopy.lastMs.toFixed(1), aMean: +aMean.toFixed(2), aMax: +aMax.toFixed(1), fu: a.canopy.fadeUploads ?? 0 });
      aMean = 0; aMax = 0;
    };
    requestAnimationFrame(tick);
    return { cycle: a.params.sky.cycle, hour: a.params.sky.timeOfDay, dayLength: a.params.sky.dayLength, quality: a.params.sky.quality, leafCast: a.leaves.mesh.castShadow, hidden: window.__sjMats?.size };
  }, [AUTO, FPS, Number(E.HOUR ?? -1), E.CYCLE === '1']);
  console.log(PRE, JSON.stringify(info));
  await page.evaluate((sp) => { const a = window.__arbor; for (const m of window.__sjMats ?? []) { m.colorWrite = false; m.depthWrite = false; } if (a.stage.post?.gtao && window.__sjMats) a.stage.post.gtao.enabled = false; window.__sj.on = true; a.params.time.speed = sp; }, SPEED);
  const t0 = Date.now();
  while ((await page.evaluate(() => window.__arbor.sim.time)) < DUR && Date.now() - t0 < (DUR / SPEED + 30) * 1000) await page.waitForTimeout(500);
  const out = await page.evaluate(() => {
    const S = window.__sj, a = window.__arbor, R = S.rows, N = S.N;
    S.on = false;
    const png = (L) => { const c = document.createElement('canvas'); c.width = c.height = N; const g = c.getContext('2d'), im = g.createImageData(N, N); for (let i = 0; i < N * N; i++) { im.data[i * 4] = im.data[i * 4 + 1] = im.data[i * 4 + 2] = L[i]; im.data[i * 4 + 3] = 255; } g.putImageData(im, 0, 0); return c.toDataURL('image/png'); };
    const idx = R.map((_, i) => i).filter((i) => i > 0).sort((p, q) => R[q].d - R[p].d).slice(0, 4);
    // Curve: mean |dL| over sim time; red ticks = decal bakes, blue = shade fills, green = shadow frustum change.
    const W = 900, H = 260, c = document.createElement('canvas'); c.width = W; c.height = H;
    const g = c.getContext('2d'); g.fillStyle = '#fff'; g.fillRect(0, 0, W, H);
    const tMax = R[R.length - 1].t || 1, dMax = Math.max(2, ...R.map((r) => r.d));
    for (let i = 1; i < R.length; i++) {
      const x = (R[i].t / tMax) * W;
      if (R[i].bakes !== R[i - 1].bakes) { g.fillStyle = '#e33'; g.fillRect(x, 0, 1, 12); }
      if (R[i].fills !== R[i - 1].fills) { g.fillStyle = '#36e'; g.fillRect(x, 14, 1, 12); }
      if (R[i].fr !== R[i - 1].fr) { g.fillStyle = '#2a2'; g.fillRect(x, 28, 1, 12); }
    }
    g.strokeStyle = '#000'; g.beginPath();
    R.forEach((r, i) => { const x = (r.t / tMax) * W, y = H - 4 - (r.d / dMax) * (H - 50); i ? g.lineTo(x, y) : g.moveTo(x, y); });
    g.stroke(); g.fillStyle = '#000'; g.font = '11px sans-serif'; g.fillText(`max ${dMax.toFixed(2)} L/255 mean |dL| per sample; t 0..${tMax.toFixed(0)} s; red decal bake, blue shade fill, green frustum`, 4, 52);
    return { rows: R, top: idx.map((i) => ({ i, a: png(S.frames[i - 1]), b: png(S.frames[i]) })), curve: c.toDataURL('image/png'), canopy: { bakes: a.canopy.bakes, maxMs: a.canopy.maxMs, fadeMs: a.canopy.fadeMs, fadeUploads: a.canopy.fadeUploads }, programs: a.stage.renderer.info.programs.length };
  });
  const save = (p, u) => writeFileSync(p, Buffer.from(u.split(',')[1], 'base64'));
  save(`shots/${PRE}-curve.png`, out.curve);
  writeFileSync(`/tmp/${PRE}.json`, JSON.stringify(out.rows));
  const R = out.rows, ds = R.slice(1).map((r) => r.d).sort((p, q) => p - q);
  const ev = (i) => [R[i].bakes !== R[i - 1].bakes && 'decal-bake', R[i].fills !== R[i - 1].fills && 'shade-fill', R[i].fr !== R[i - 1].fr && 'frustum', R[i].op !== R[i - 1].op && 'opacity', R[i].vis !== R[i - 1].vis && 'visible'].filter(Boolean).join('+') || '-';
  // Decal transform steps (m) between consecutive samples.
  let maxPos = 0, maxScale = 0;
  for (let i = 1; i < R.length; i++) if (R[i].vis && R[i - 1].vis) { maxPos = Math.max(maxPos, Math.hypot(R[i].px - R[i - 1].px, R[i].pz - R[i - 1].pz)); maxScale = Math.max(maxScale, Math.abs(R[i].sx - R[i - 1].sx), Math.abs(R[i].sz - R[i - 1].sz)); }
  const by = {};
  for (let i = 1; i < R.length; i++) { const k = ev(i); (by[k] ??= []).push(R[i].d); }
  console.log(PRE, JSON.stringify({ samples: R.length, simEnd: R[R.length - 1].t, hours: [R[0].hr, R[R.length - 1].hr], median: ds[ds.length >> 1], p95: ds[Math.floor(ds.length * 0.95)], max: ds[ds.length - 1], decalAlphaStepMean: Math.max(...R.map((r) => r.aMean)), decalAlphaStepMax: Math.max(...R.map((r) => r.aMax)), decalAlphaStepMaxAfterFirst: Math.max(...R.filter((r, i) => i > 0 && R[i - 1].vis).map((r) => r.aMax)), fadeUploads: R[R.length - 1].fu, firstDecalT: (R.find((r) => r.vis) ?? {}).t, decalMaxPosStep: +maxPos.toFixed(3), decalMaxScaleStep: +maxScale.toFixed(3), canopy: out.canopy, fills: R[R.length - 1].fills, programs: out.programs }));
  console.log(PRE, 'mean step by event:', JSON.stringify(Object.fromEntries(Object.entries(by).map(([k, v]) => [k, { n: v.length, mean: +(v.reduce((p, q) => p + q, 0) / v.length).toFixed(3), max: Math.max(...v) }]))));
  out.top.forEach((s, n) => { const r = R[s.i], p = R[s.i - 1]; save(`shots/${PRE}-jump${n}-a.png`, s.a); save(`shots/${PRE}-jump${n}-b.png`, s.b);
    console.log(PRE, `jump${n} t=${r.t} d=${r.d} big=${r.big}% blk=${r.blk} event=${ev(s.i)} pos ${p.px},${p.pz}->${r.px},${r.pz} scale ${p.sx}x${p.sz}->${r.sx}x${r.sz} rot ${p.rot}->${r.rot} fr ${p.fr}->${r.fr}`); });
} finally {
  await browser.close();
}

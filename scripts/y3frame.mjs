// Does the automatic camera keep the growing big tree in frame? `?years=3` from T0, growth running at SPEED for
// WALL seconds; every 0.5 s the live crown box (unpruned nodes) is projected and the largest |x|, |y| in NDC kept.
// Modes: framed (cinema off), wide, orbit, far (director shot held by re-asking for it). In frame = max <= 1.
// Usage: node scripts/y3frame.mjs URL [phone|desk]   T0=285 SPEED=8 WALL=20 MODES=framed,wide,orbit,far
import { chromium } from 'playwright-core';
const url = process.argv[2], layout = process.argv[3] ?? 'phone', E = process.env, T0 = Number(E.T0 ?? 285);
const browser = await chromium.launch({ executablePath: '/usr/sbin/chromium', args: ['--headless=new', '--use-gl=angle', `--use-angle=${E.GPU ?? 'vulkan'}`, '--enable-gpu', '--ignore-gpu-blocklist'] });
try {
  for (const mode of (E.MODES ?? 'framed,wide,orbit,far').split(',')) {
    const ctx = await browser.newContext(layout === 'phone' ? { viewport: { width: 411, height: 777 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true } : { viewport: { width: 1600, height: 900 } });
    const page = await ctx.newPage(); page.setDefaultTimeout(900000);
    await page.goto(`${url}?start=0&nogui=1&hideui=1&years=3&critters=0&cycle=false&timeOfDay=13&weather=calm&autoRotate=false&speed=0&cinema=${mode !== 'framed'}`);
    await page.waitForFunction(() => window.__arbor !== undefined);
    while (await page.evaluate(() => window.__arbor.sim.time) < T0 - 0.01) await page.evaluate((T) => window.__arbor.fastForward(Math.min(15, T - window.__arbor.sim.time)), T0);
    if (mode !== 'framed') await page.evaluate((k) => window.__arbor.stage.director.go(k), mode);
    await page.waitForTimeout(4000);
    const probe = () => page.evaluate((mode) => {
      const A = window.__arbor, s = A.sim, cam = A.stage.camera, D = A.stage.director;
      if (mode !== 'framed' && D.shot && D.shot.kind === mode) D.shot.t = Math.min(D.shot.t, D.shot.dur * 0.5); // hold the shot
      let x0 = 1e9, x1 = -1e9, y1 = 0, z0 = 1e9, z1 = -1e9;
      for (const n of s.nodes) { if (s.chains[n.chain].pruned) continue; if (n.wx < x0) x0 = n.wx; if (n.wx > x1) x1 = n.wx; if (n.wy > y1) y1 = n.wy; if (n.wz < z0) z0 = n.wz; if (n.wz > z1) z1 = n.wz; }
      cam.updateMatrixWorld(); let mx = 0, my = 0, top = -9;
      const v = cam.position.clone();
      for (const x of [x0, x1]) for (const y of [0, y1]) for (const z of [z0, z1]) { v.set(x, y, z).project(cam); mx = Math.max(mx, Math.abs(v.x)); my = Math.max(my, Math.abs(v.y)); if (y) top = Math.max(top, v.y); }
      return { t: +s.time.toFixed(0), h: +y1.toFixed(1), w: +Math.max(x1 - x0, z1 - z0).toFixed(1), mx: +mx.toFixed(2), my: +my.toFixed(2), top: +top.toFixed(2), kind: D.state().kind, dist: +cam.position.length().toFixed(1) };
    }, mode);
    const first = await probe();
    await page.evaluate((sp) => { window.__arbor.params.time.speed = sp; window.__arbor.params.time.paused = false; }, Number(E.SPEED ?? 8));
    let worst = first, last = first;
    for (let i = 0; i < Number(E.WALL ?? 20) * 2; i++) { await page.waitForTimeout(500); last = await probe(); if (Math.max(last.mx, last.my) > Math.max(worst.mx, worst.my)) worst = last; }
    console.log(layout, mode, 'start', JSON.stringify(first), 'end', JSON.stringify(last), 'worst', JSON.stringify(worst));
    await ctx.close();
  }
} finally { await browser.close(); }

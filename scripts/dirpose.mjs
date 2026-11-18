// Director poses as numbers, for comparing two builds exactly: for a tree at T, every shot kind's pose at three
// shot times with a fixed azimuth and side (the pure `pose` function on the live smoothed box), 300 draws of `choose`
// from a fixed rng state, and the plain framed view (cinema off, snapped). Prints one JSON line.
// Usage: node scripts/dirpose.mjs URL [query] [T]     e.g. node scripts/dirpose.mjs http://localhost:5880/ '' 90
import { chromium } from 'playwright-core';
const [url, q = '', T = '90'] = process.argv.slice(2);
const browser = await chromium.launch({ executablePath: '/usr/sbin/chromium', args: ['--headless=new', '--use-gl=angle', `--use-angle=${process.env.GPU ?? 'vulkan'}`, '--enable-gpu', '--ignore-gpu-blocklist'] });
try {
  const out = {};
  for (const [name, vp] of [['desk', { width: 1600, height: 900 }], ['phone', { width: 411, height: 777 }]]) {
    const ctx = await browser.newContext({ viewport: vp });
    const page = await ctx.newPage(); page.setDefaultTimeout(900000);
    await page.goto(`${url}?start=0&cycle=false&speed=0&autoRotate=false&cinema=true&weather=calm&season.on=false&timeOfDay=13&nogui=1&hideui=1&quality=High${q}`);
    await page.waitForFunction(() => window.__arbor !== undefined);
    while (await page.evaluate(() => window.__arbor.sim.time) < Number(T) - 0.01) await page.evaluate((T) => window.__arbor.fastForward(Math.min(15, T - window.__arbor.sim.time)), Number(T));
    await page.waitForTimeout(6000); // the smoothed box settles (rate 1.2 / s)
    out[name] = await page.evaluate(() => {
      const A = window.__arbor, D = A.stage.director, cam = A.stage.camera, r = (v) => +v.toFixed(4);
      const env = { aspect: cam.aspect, vf: (cam.fov * Math.PI) / 360, fit: D.fit, trunkR: Math.max(0.03, A.sim.nodes[0].radius), sunDir: A.stage.atmo.sunDir, sunH: A.stage.atmo.sunH, moonDir: A.stage.atmo.moonDir, night: 0, cloud: 0, flash: 0 };
      const P = cam.position.clone(), G = cam.position.clone(), poses = {};
      for (const kind of ['wide', 'hero', 'orbit', 'rise', 'canopy', 'branch']) for (const u of [0, 0.4, 1]) {
        const s = { kind, t: 20 * u, dur: 20, yaw: 0.7, side: 1, sx: D.R * 0.6, sy: D.H * 0.5, sz: D.R * 0.6, event: false };
        D.pose(s, env, P, G);
        poses[`${kind}@${u}`] = [P.x, P.y, P.z, G.x, G.y, G.z].map(r);
      }
      D.rng = 12345; D.history = [];
      let seq = '';
      for (let i = 0; i < 300; i++) { const k = D.choose(i % 3 ? env : null); D.history.push(k); if (D.history.length > 4) D.history.shift(); seq += k[0] + (k === 'far' ? 'F' : ''); }
      A.params.camera.cinema = false; A.params.camera.autoFrame = true; A.fastForward(0);
      const c = A.stage.camera.position, t = A.stage.controls.target;
      return { box: [D.H, D.R, D.cy, D.fit].map(r), poses, seq, framed: [c.x, c.y, c.z, t.x, t.y, t.z].map(r) };
    });
    await ctx.close();
  }
  console.log(JSON.stringify(out));
} finally { await browser.close(); }

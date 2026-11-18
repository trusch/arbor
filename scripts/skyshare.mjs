// Share of the phone portrait frame that is sky in each director shot, and how many clouds are in it.
//   node scripts/skyshare.mjs URL [kind=fair]
// Per shot kind: the director is sent to it (`director.go`), then 40 columns x 80 rows of the frame are tested: a
// sample counts as sky when its view ray points above the terrain horizon of its azimuth (24-step march of
// `clouds.probe` is not needed: the ray's elevation against 3 degrees, the height of the far ridges) and no crown box
// covers it (the tree's bounding box projected). Clouds = entries of `clouds.probe` whose base projects into the frame.
import { chromium } from 'playwright-core';
const [url = 'http://127.0.0.1:5903/', kind = 'fair'] = process.argv.slice(2);
const browser = await chromium.launch({ executablePath: '/usr/sbin/chromium', args: ['--headless=new', '--use-gl=angle', '--use-angle=vulkan', '--enable-gpu', '--ignore-gpu-blocklist'] });
const ctx = await browser.newContext({ viewport: { width: 411, height: 777 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, userAgent: 'Mozilla/5.0 (Linux; Android 15; Pixel) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0 Mobile Safari/537.36' });
const page = await ctx.newPage();
try {
  await page.goto(`${url}?cycle=false&speed=0&panel=closed&weather.kind=${kind}&timeOfDay=12&season.date=0.375&season.hold=true`);
  await page.waitForFunction(() => window.__arbor !== undefined);
  await page.evaluate((kind) => { const a = window.__arbor; a.fastForward(90); a.weather.snap(kind); if (a.clouds) { a.clouds.amount = -1; a.clouds.probe = new Float32Array(7 * 800); } }, kind);
  await page.waitForTimeout(6000);
  for (const shot of ['wide', 'hero', 'orbit', 'rise', 'canopy', 'branch', 'plain']) {
    await page.evaluate((shot) => { const a = window.__arbor; if (shot === 'plain') a.params.camera.cinema = false; else { a.params.camera.cinema = true; a.stage.director.go(shot); } }, shot);
    await page.waitForTimeout(shot === 'plain' ? 5000 : 3500);
    const r = await page.evaluate(() => {
      const a = window.__arbor, cam = a.stage.camera, C = a.clouds, sim = a.sim;
      cam.updateMatrixWorld();
      const V = cam.position.clone().constructor, v = new V(), e = cam.matrixWorld.elements;
      const bmin = sim.bboxMin, bmax = sim.bboxMax, corners = [];
      for (let i = 0; i < 8; i++) { v.set(i & 1 ? bmax[0] : bmin[0], i & 2 ? bmax[1] : Math.max(bmin[1], bmax[1] * 0.3), i & 4 ? bmax[2] : bmin[2]).project(cam); corners.push([v.x, v.y, v.z]); }
      const vis = corners.filter((c) => c[2] < 1), x0 = Math.min(...vis.map((c) => c[0])), x1 = Math.max(...vis.map((c) => c[0])), y0 = Math.min(...vis.map((c) => c[1])), y1 = Math.max(...vis.map((c) => c[1]));
      let sky = 0, open = 0, n = 0;
      for (let j = 0; j < 80; j++) for (let i = 0; i < 40; i++) {
        const nx = (i + 0.5) / 20 - 1, ny = (j + 0.5) / 40 - 1;
        v.set(nx, ny, 0.5).unproject(cam).sub(cam.position).normalize();
        n++;
        if (v.y > Math.sin(3 * Math.PI / 180)) { sky++; if (!(vis.length && nx > x0 && nx < x1 && ny > y0 && ny < y1)) open++; }
      }
      let inFrame = 0, big = 0;
      for (let k = 0; k < C.probeN; k++) { const p = C.probe; v.set(p[7 * k + 2], p[7 * k + 3], p[7 * k + 4]).project(cam); if (v.z < 1 && Math.abs(v.x) < 1 && Math.abs(v.y) < 1) { inFrame++; } }
      const f = cam.getWorldDirection(new V());
      return { kind: a.stage.director.state().kind, pitchDeg: +(Math.asin(f.y) * 180 / Math.PI).toFixed(1), skyAboveHorizon: +(sky / n).toFixed(2), skyClearOfCrownBox: +(open / n).toFixed(2), cloudsInFrame: inFrame, quads: C.stats.quads };
    });
    console.log(shot, JSON.stringify(r));
    await page.screenshot({ path: `shots/c5sky-${kind}-${shot}.png` });
  }
} finally { await browser.close(); }

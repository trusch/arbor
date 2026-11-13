// Wind sway proof on the t = 90 oak. Per mode (desktop High / Android phone emulation) and weather (calm / storm):
// (1) timing: frame interval and app JS per frame with sway on and with ?sway=0, program counts, sway cost (node pass,
//     leaf pass), peak offsets over 8 s (any node, and the tip of the biggest order-1 limb),
// (2) shots: burst of 4 frames 0.45 s apart of the whole tree, 2 close frames on a limb junction,
// (3) rest: amount -> 0, then every drawn leaf translation must equal its rest translation and all offsets be 0.
// Usage: node scripts/swayshots.mjs http://127.0.0.1:5421/   env: GPU=vulkan, MODES=desktop,phone, WX=calm,storm,
//        THROTTLE=1|4, SHOTS=0, SHOT_PREFIX=sway, HOUR=13
import { mkdirSync } from 'node:fs';
import { chromium } from 'playwright-core';
const url = process.argv[2] ?? 'http://127.0.0.1:5421/';
const E = process.env, GPU = E.GPU ?? 'vulkan', THROTTLE = Number(E.THROTTLE ?? 1), HOUR = Number(E.HOUR ?? 13), PRE = E.SHOT_PREFIX ?? 'sway';
mkdirSync('shots', { recursive: true });
const browser = await chromium.launch({ executablePath: '/usr/sbin/chromium', args: ['--headless=new', '--use-gl=angle', `--use-angle=${GPU}`, '--enable-gpu', '--ignore-gpu-blocklist'] });
const setup = async (mode, wx, extra = '') => {
  const ctx = await browser.newContext(mode === 'phone'
    ? { viewport: { width: 411, height: 777 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, userAgent: 'Mozilla/5.0 (Linux; Android 15; Pixel) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0 Mobile Safari/537.36' }
    : { viewport: { width: 1280, height: 800 } });
  const page = await ctx.newPage();
  const errs = [];
  page.on('pageerror', (e) => errs.push(e.message));
  await page.goto(`${url}?cycle=false&nogui=1&hideui=1&speed=0&autoRotate=false&cinema=false&lightning=0&weather=${wx}${mode === 'desktop' ? '&quality=High' : ''}${extra}`);
  await page.waitForFunction(() => window.__arbor !== undefined);
  if (THROTTLE > 1) { const cdp = await ctx.newCDPSession(page); await cdp.send('Emulation.setCPUThrottlingRate', { rate: THROTTLE }); }
  const info = await page.evaluate((h) => {
    const A = window.__arbor, S = A.sim;
    A.params.sky.timeOfDay = h;
    A.fastForward(90);
    // Biggest order-1 limb: its base (junction) and the last node of its chain (tip).
    let best = null;
    for (const ch of S.chains) if (!ch.pruned && ch.order === 1 && ch.nodes.length >= 4 && (!best || S.nodes[ch.nodes[1]].subLen > S.nodes[best.nodes[1]].subLen)) best = ch;
    window.__tip = best.nodes[best.nodes.length - 1]; window.__base = best.nodes[0];
    const H = S.bboxMax[1], W = A.wind;
    A.params.camera.autoFrame = false;
    // Camera across the wind, so the downwind lean is in the image plane.
    A.stage.controls.target.set(0, H * 0.55, 0);
    A.stage.camera.position.set(-W.dirZ * H * 1.9, H * 0.5, W.dirX * H * 1.9);
    A.stage.controls.update?.();
    A.fastForward(0);
    return { H: +H.toFixed(2), nodes: S.nodes.length, quality: A.params.sky.quality, leafShader: A.leaves.mode?.shader ?? '?', leafInst: A.leaves.mesh.count, tipR: S.nodes[window.__tip].radius, limbNodes: best.nodes.length };
  }, HOUR);
  await page.waitForTimeout(7000); // settle (bark program re-key, storm look)
  return { ctx, page, errs, info };
};
const timing = (page, ms) => page.evaluate((ms) => new Promise((res) => {
  const A = window.__arbor, iv = [], js = []; let last = 0, t0 = 0, peak = 0, tipPeak = 0, node = 0, leaf = 0, n = 0;
  const tick = (t) => {
    if (!t0) t0 = t;
    if (last) { iv.push(t - last); js.push(performance.now() - t); }
    last = t;
    const s = A.swayStats(), D = A.sway.D, o = window.__tip * 3;
    if (s.live) { peak = Math.max(peak, s.maxOffset); tipPeak = Math.max(tipPeak, Math.hypot(D[o], D[o + 1], D[o + 2])); node += s.nodeMs; leaf += s.leafMs; n++; }
    if (t - t0 > ms) {
      const med = (a) => +[...a].sort((x, y) => x - y)[a.length >> 1].toFixed(2), p95 = (a) => +[...a].sort((x, y) => x - y)[Math.floor(a.length * 0.95)].toFixed(2);
      return res({ frames: iv.length, intervalMed: med(iv), intervalP95: p95(iv), jsMed: med(js), jsP95: p95(js), peakOffsetM: +peak.toFixed(3), limbTipPeakM: +tipPeak.toFixed(3), swayNodeMs: n ? +(node / n).toFixed(3) : 0, swayLeafMs: n ? +(leaf / n).toFixed(3) : 0,
        programs: A.stage.renderer.info.programs.length, base: +A.wind.base.toFixed(2), fe: A.frameErrors() });
    }
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}), ms);
try {
  for (const mode of (E.MODES ?? 'desktop,phone').split(',')) for (const wx of (E.WX ?? 'calm,storm').split(',')) {
    {
      const { ctx, page, errs, info } = await setup(mode, wx);
      const on = await timing(page, 8000);
      // Rest: amount 0 -> offsets zero, leaf translations exactly the rest translations.
      const rest = await page.evaluate(() => new Promise((res) => {
        const A = window.__arbor; A.params.sway.amount = 0;
        setTimeout(() => {
          const L = A.leaves, M = L.mesh.instanceMatrix.array, R = L.restT, ND = L.frontNode; let bad = 0, n = 0;
          for (let i = 0; i < L.mesh.count; i++) { if (ND[i] < 0) continue; n++; if (M[i * 16 + 12] !== R[i * 3] || M[i * 16 + 13] !== R[i * 3 + 1] || M[i * 16 + 14] !== R[i * 3 + 2]) bad++; }
          let nz = 0; for (const v of A.sway.D) if (v !== 0) nz++;
          res({ live: A.sway.live, leavesChecked: n, leavesOffRest: bad, nonZeroOffsets: nz });
        }, 600);
      }));
      await ctx.close();
      const off = await (async () => { const s = await setup(mode, wx, '&sway=0'); const r = await timing(s.page, 6000); await s.ctx.close(); return r; })();
      console.log(JSON.stringify({ mode, wx, throttle: THROTTLE, gpu: GPU, info, on, off: { intervalMed: off.intervalMed, intervalP95: off.intervalP95, jsMed: off.jsMed, jsP95: off.jsP95, programs: off.programs }, rest, errs }));
    }
    if (E.SHOTS !== '0') {
      const { ctx, page } = await setup(mode, wx);
      for (let i = 0; i < 4; i++) { await page.screenshot({ path: `shots/${PRE}-${mode}-${wx}-${i}.png` }); await page.waitForTimeout(450); }
      // Close on the junction of the biggest limb.
      await page.evaluate(() => {
        const A = window.__arbor, b = A.sim.nodes[window.__base], W = A.wind;
        A.stage.controls.target.set(b.wx, b.wy + 0.3, b.wz);
        A.stage.camera.position.set(b.wx - W.dirZ * 3.2, b.wy + 0.8, b.wz + W.dirX * 3.2);
        A.stage.controls.update?.();
      });
      await page.waitForTimeout(1500);
      for (let i = 0; i < 2; i++) { await page.screenshot({ path: `shots/${PRE}-${mode}-${wx}-junction-${i}.png` }); await page.waitForTimeout(500); }
      await ctx.close();
    }
  }
} finally { await browser.close(); }

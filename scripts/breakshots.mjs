// Breakage proof: forced limb break on the t = 90 oak. Per mode (desktop High / Android phone emulation):
// (1) frame intervals around the break (longest frame within 1 s) and shader program counts before / in flight / at rest,
// (2) screenshots about 0.2 s, 0.8 s, 3 s and 9 s after the break from a camera that looks at the limb.
// Usage: node scripts/breakshots.mjs http://127.0.0.1:5401/   env: GPU=vulkan|gl-egl, MODES=desktop,phone, THROTTLE=1|4,
//        PICK=mid|big|twig, HOUR=13, SHOT_PREFIX=break
import { mkdirSync } from 'node:fs';
import { chromium } from 'playwright-core';
const url = process.argv[2] ?? 'http://127.0.0.1:5401/';
const E = process.env, GPU = E.GPU ?? 'vulkan', THROTTLE = Number(E.THROTTLE ?? 1), PICK = E.PICK ?? 'mid', HOUR = Number(E.HOUR ?? 13), PRE = E.SHOT_PREFIX ?? 'break';
mkdirSync('shots', { recursive: true });
const browser = await chromium.launch({ executablePath: '/usr/sbin/chromium', args: ['--headless=new', '--use-gl=angle', `--use-angle=${GPU}`, '--enable-gpu', '--ignore-gpu-blocklist'] });
const setup = async (mode, extra = '') => {
  const ctx = await browser.newContext(mode === 'phone'
    ? { viewport: { width: 411, height: 777 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, userAgent: 'Mozilla/5.0 (Linux; Android 15; Pixel) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0 Mobile Safari/537.36' }
    : { viewport: { width: 1280, height: 800 } });
  const page = await ctx.newPage();
  const errs = [];
  page.on('pageerror', (e) => errs.push(e.message));
  await page.goto(`${url}?nogui=1&hideui=1&speed=0&autoRotate=false&cinema=false${mode === 'desktop' ? '&quality=High' : ''}${extra}`);
  await page.waitForFunction(() => window.__arbor !== undefined);
  if (THROTTLE > 1) { const cdp = await ctx.newCDPSession(page); await cdp.send('Emulation.setCPUThrottlingRate', { rate: THROTTLE }); }
  const info = await page.evaluate(([h, pick]) => {
    const A = window.__arbor, S = A.sim;
    A.params.sky.timeOfDay = h;
    A.fastForward(90);
    // Candidate limbs (order 1) by size; 'mid' = the one nearest 45 % of the largest, on the camera-friendly side.
    const c = S.chains.filter((ch) => !ch.pruned && ch.order === (pick === 'twig' ? 2 : 1) && ch.nodes.length >= 4).map((ch) => ({ id: ch.nodes[1], len: S.nodes[ch.nodes[1]].subLen })).sort((a, b) => a.len - b.len);
    const want = pick === 'big' ? c[c.length - 1].len : pick === 'twig' ? 1.2 : c[c.length - 1].len * 0.45;
    let best = c[0];
    for (const k of c) if (Math.abs(k.len - want) < Math.abs(best.len - want)) best = k;
    // Limb centroid for the camera.
    const inS = new Uint8Array(S.nodes.length); inS[best.id] = 1;
    let n = 0, x = 0, y = 0, z = 0;
    for (let j = best.id; j < S.nodes.length; j++) { if (j > best.id && !inS[S.nodes[j].parent]) continue; inS[j] = 1; n++; x += S.nodes[j].wx; y += S.nodes[j].wy; z += S.nodes[j].wz; }
    x /= n; y /= n; z /= n;
    const b = S.nodes[best.id], H = S.bboxMax[1];
    A.params.camera.autoFrame = false;
    // Look from the side of the limb (perpendicular to its horizontal direction), slightly above eye level.
    let dx = x - b.wx, dz = z - b.wz; const dl = Math.hypot(dx, dz) || 1; dx /= dl; dz /= dl;
    const D = Math.max(6, H * 0.95);
    A.stage.controls.target.set(x, y * 0.5, z);
    A.stage.camera.position.set(x - dz * D + dx * D * 0.35, y * 0.5 + H * 0.12, z + dx * D + dz * D * 0.35);
    A.stage.controls.update?.();
    A.fastForward(0);
    window.__pick = best.id;
    return { pick: best, nodes: n, H: +H.toFixed(2), quality: A.params.sky.quality, leafShader: A.leaves.mode?.shader ?? '?', gl: A.stage.renderer.getContext().getParameter(A.stage.renderer.getContext().VERSION) };
  }, [HOUR, PICK]);
  await page.waitForTimeout(2500);
  return { ctx, page, errs, info };
};
const progs = (page) => page.evaluate(() => { const A = window.__arbor; return { programs: A.stage.renderer.info.programs.length, calls: A.stage.renderer.info.render.calls, fe: A.frameErrors(), debris: A.debris.state, stats: A.debris.stats, leafInst: A.leaves.mesh.count }; });
try {
  for (const mode of (E.MODES ?? 'desktop,phone').split(',')) {
    // (1) Timing run: no screenshots (they stall the page).
    {
      const { ctx, page, errs, info } = await setup(mode);
      const before = await progs(page);
      const tim = await page.evaluate(() => new Promise((res) => {
        const A = window.__arbor, iv = []; let last = 0, t0 = 0, n = 0, pre = [];
        const tick = (t) => {
          if (last) (t0 ? iv : pre).push(+(t - last).toFixed(1));
          last = t; n++;
          if (n === 40) { A.breakLimb(window.__pick); t0 = t; }
          if (t0 && t - t0 > 1000) return res({ pre: pre.slice(-30), iv });
          requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }));
      const during = await progs(page);
      await page.waitForTimeout(9000);
      const rest = await progs(page);
      const med = (a) => [...a].sort((x, y) => x - y)[a.length >> 1];
      console.log(JSON.stringify({ mode, throttle: THROTTLE, gpu: GPU, info, preMedianMs: med(tim.pre), preMaxMs: Math.max(...tim.pre), breakMaxMs: Math.max(...tim.iv), breakFirst5: tim.iv.slice(0, 5), breakMedianMs: med(tim.iv),
        programs: { before: before.programs, flight: during.programs, rest: rest.programs }, calls: { before: before.calls, flight: during.calls, rest: rest.calls },
        buildMs: +rest.stats.lastBuildMs.toFixed(2), limbLeaves: rest.stats.lastLeaves, limbNodes: rest.stats.lastNodes, flight: during.debris, rest: rest.debris, fe: rest.fe, errs }));
      await ctx.close();
    }
    // (2) Shots.
    {
      const { ctx, page } = await setup(mode);
      await page.screenshot({ path: `shots/${PRE}-${mode}-0-before.png` });
      await page.evaluate(() => { window.__bt = performance.now(); window.__arbor.breakLimb(window.__pick); });
      for (const [name, at] of [['1-0.2s', 200], ['2-0.8s', 800], ['3-1.5s', 1500], ['4-3s', 3000], ['5-9s', 9000]]) {
        const now = await page.evaluate(() => performance.now() - window.__bt);
        if (at > now) await page.waitForTimeout(at - now - 15);
        const real = await page.evaluate(() => performance.now() - window.__bt);
        await page.screenshot({ path: `shots/${PRE}-${mode}-${name}.png` });
        console.log(`shots/${PRE}-${mode}-${name}.png at ${real.toFixed(0)} ms`, JSON.stringify((await progs(page)).debris));
      }
      await ctx.close();
    }
  }
} finally { await browser.close(); }

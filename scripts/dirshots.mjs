// Director's camera on the real GPU (ANGLE Vulkan). Serves the build in PROF_DIST with vite preview.
// PORT=5640 PROF_DIST=/tmp/arbor-dir-dist node scripts/dirshots.mjs [sheet,burst,events,trace] [desk,phone] [prefix]
//   sheet  = one frame of every shot type per tree (sapling t30, oak t90, tall, wide) at noon and sunset
//   burst  = frames through a travelling move and a cut (CASES env narrows `sheet`: e.g. CASES=oak:13)
//   events = lightning and bird event shots forced
//   trace  = TRACE_S (120) seconds of automatic running: per-frame step and angular speed
import { spawn, execFileSync } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { chromium } from 'playwright-core';

const PORT = Number(process.env.PORT ?? 5640), DIST = process.env.PROF_DIST ?? '/tmp/arbor-dir-dist';
const modes = (process.argv[2] ?? 'sheet').split(','), layouts = (process.argv[3] ?? 'desk,phone').split(','), prefix = process.argv[4] ?? 'dir';
mkdirSync('shots', { recursive: true });
const vite = spawn('npx', ['vite', 'preview', '--outDir', DIST, '--port', String(PORT), '--strictPort'], { stdio: ['ignore', 'pipe', 'inherit'] });
await new Promise((res) => vite.stdout.on('data', (d) => String(d).includes('Local') && res()));
const browser = await chromium.launch({ executablePath: '/usr/sbin/chromium', args: ['--headless=new', '--use-gl=angle', `--use-angle=${process.env.GPU ?? 'vulkan'}`, '--enable-gpu', '--ignore-gpu-blocklist'] });
const PHONE = { viewport: { width: 411, height: 777 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, userAgent: 'Mozilla/5.0 (Linux; Android 15; Pixel) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0 Mobile Safari/537.36' };
const DESK = { viewport: { width: 1600, height: 900 } };
const url = (hour, q = '') => `http://localhost:${PORT}/?start=0&cycle=false&speed=0&autoRotate=false&cinema=true&weather=calm&season.on=false&timeOfDay=${hour}&nogui=1&hideui=1${q}`;
const sheet = (name, files, tile, geo) => { execFileSync('montage', [...files, '-tile', tile, '-geometry', geo, '-background', '#222', `shots/${name}.jpg`]); console.log(`shots/${name}.jpg (${files.length} frames)`); };
const KINDS = (process.env.KINDS ?? 'wide,hero,orbit,rise,canopy,branch').split(',');
const TREES = { sapling: ['', 30], oak: ['', 90], tall: ['&preset=Low-gravity%20alien', 90], broad: ['&preset=Heavy%20world', 90], y3: ['&years=3&critters=0', 750], y2: ['&years=3&critters=0', 450] };
const HOURS = { 13: 'noon', 19.3: 'sunset' };
const cases = (process.env.CASES ?? Object.keys(TREES).flatMap((t) => Object.keys(HOURS).map((h) => `${t}:${h}`)).join(',')).split(',').map((c) => c.split(':'));
const open = async (layout, hour, q, t) => {
  const ctx = await browser.newContext(layout === 'phone' ? PHONE : DESK);
  const page = await ctx.newPage();
  page.on('pageerror', (e) => console.error('[pageerror]', e.message));
  await page.goto(url(hour, q));
  await page.waitForFunction(() => window.__arbor !== undefined);
  page.setDefaultTimeout(900000);
  while (await page.evaluate(() => window.__arbor.sim.time) < t - 0.01) await page.evaluate((T) => window.__arbor.fastForward(Math.min(15, T - window.__arbor.sim.time)), t);
  await page.waitForTimeout(2500);
  return { ctx, page };
};
const go = (page, kind, at, cut = true) => page.evaluate(([k, a, c]) => { const A = window.__arbor, D = A.stage.director; D.go(k, c); if (a >= 0) { A.fastForward(0); D.shot.t = D.shot.dur * a; A.fastForward(0); } return D.state(); }, [kind, at, cut]);

try {
  for (const layout of layouts) {
    const geo = layout === 'phone' ? '274x518+2+2' : '640x360+2+2';
    if (modes.includes('sheet')) for (const [tree, hour] of cases) {
      const [q, t] = TREES[tree];
      const { ctx, page } = await open(layout, hour, q, t);
      const files = [];
      for (const k of KINDS) {
        let st = await go(page, k, -1);
        // The shot starts through a dip to black over the next frames: wait for it, then set its clock (AT=0..1).
        await page.waitForFunction((k) => { const s = window.__arbor.stage.director.state(); return s.kind === k && !s.cutting; }, k, { timeout: 20000 }).catch(() => {});
        const at = process.env.AT !== undefined ? Number(process.env.AT) : k === 'rise' || k === 'ascend' ? 0.62 : 0.4;
        st = await page.evaluate((a) => { const D = window.__arbor.stage.director; if (D.shot) D.shot.t = D.shot.dur * a; return D.state(); }, at);
        await page.waitForTimeout(1500);
        const f = `shots/${prefix}-${layout}-${tree}-${HOURS[hour] ?? hour}-${st.kind === k ? k : `${k}_as_${st.kind}`}${process.env.AT !== undefined ? `-at${process.env.AT}` : ''}.png`;
        await page.screenshot({ path: f });
        files.push(f);
        console.log(layout, tree, k, JSON.stringify(await page.evaluate(() => { const A = window.__arbor, c = A.stage.camera.position, t = A.stage.controls.target, r = (v) => +v.toFixed(1); return { pos: [r(c.x), r(c.y), r(c.z)], tgt: [r(t.x), r(t.y), r(t.z)], dh: r(Math.hypot(c.x, c.z)) }; })));
      }
      {
        // The plain framed view (cinema off, auto-frame), as a last tile.
        await page.evaluate(() => { const A = window.__arbor; A.params.camera.cinema = false; A.params.camera.autoFrame = true; A.stage.autoCamera?.(); A.fastForward(0); });
        await page.waitForTimeout(5000);
        const f = `shots/${prefix}-${layout}-${tree}-${HOURS[hour] ?? hour}-framed.png`;
        await page.screenshot({ path: f });
        files.push(f);
        await page.evaluate(() => { window.__arbor.params.camera.cinema = true; });
      }
      console.log(layout, tree, hour, await page.evaluate(() => { const A = window.__arbor; return { h: +A.sim.bboxMax[1].toFixed(1), camY: +A.stage.camera.position.y.toFixed(2), programs: A.stage.renderer.info.programs.length }; }));
      sheet(`${prefix}-${layout}-${tree}-${HOURS[hour] ?? hour}${process.env.AT !== undefined ? `-at${process.env.AT}` : ''}-sheet`, files, layout === 'phone' ? '7x' : '4x', geo);
      await ctx.close();
    }
    if (modes.includes('burst')) {
      const { ctx, page } = await open(layout, 13, '', 90);
      // Travel: wide -> hero on the same side (travelling move); cut: hero -> canopy (dip through black).
      await go(page, 'wide', 0.5);
      await page.waitForTimeout(1200);
      for (const [name, kind, cut, n] of [['travel', 'hero', false, 12], ['cut', 'canopy', false, 10]]) {
        await go(page, kind, -1, cut);
        const files = [];
        for (let i = 0; i < n; i++) {
          const f = `shots/${prefix}-${layout}-burst-${name}-${String(i).padStart(2, '0')}.png`;
          await page.screenshot({ path: f });
          files.push(f);
          await page.waitForTimeout(name === 'cut' ? 60 : 420);
        }
        console.log(layout, name, await page.evaluate(() => window.__arbor.stage.director.state()));
        sheet(`${prefix}-${layout}-burst-${name}-sheet`, files, '6x', layout === 'phone' ? '137x259+1+1' : '400x225+1+1');
        await page.waitForTimeout(1500);
      }
      await ctx.close();
    }
    if (modes.includes('events')) {
      const files = [];
      {
        const { ctx, page } = await open(layout, 15, '&weather=storm', 90);
        await page.evaluate(() => { const A = window.__arbor; A.stage.director.shot.t = 8; A.weather.holdFlash = true; });
        await page.waitForFunction(() => window.__arbor.stage.director.state().kind === 'storm' && !window.__arbor.stage.director.state().cutting, null, { timeout: 30000 }).catch(() => console.log('storm shot did not start'));
        await page.waitForTimeout(1200);
        const f = `shots/${prefix}-${layout}-event-lightning.png`; await page.screenshot({ path: f }); files.push(f);
        await page.evaluate(() => (window.__arbor.weather.holdFlash = false)); await page.waitForTimeout(900);
        const g = `shots/${prefix}-${layout}-event-storm.png`; await page.screenshot({ path: g }); files.push(g);
        console.log(layout, 'lightning', await page.evaluate(() => window.__arbor.stage.director.state()));
        await ctx.close();
      }
      {
        const { ctx, page } = await open(layout, 11, '', 90);
        await page.evaluate(() => { const A = window.__arbor; A.critters.force = { butterflies: 0, fireflies: 0, birds: 1 }; });
        const ok = await page.waitForFunction(() => { const D = window.__arbor.stage.director; if (D.shot && D.shot.kind !== 'bird') D.shot.t = Math.min(D.shot.t, 10); return D.state().kind === 'bird' && !D.state().cutting; }, null, { timeout: 90000, polling: 200 }).then(() => true).catch(() => false);
        if (!ok) console.log('bird shot did not start');
        await page.waitForTimeout(1500);
        const f = `shots/${prefix}-${layout}-event-bird.png`; await page.screenshot({ path: f }); files.push(f);
        console.log(layout, 'bird', await page.evaluate(() => window.__arbor.stage.director.state()));
        await ctx.close();
      }
      sheet(`${prefix}-${layout}-events-sheet`, files, '3x', geo);
    }
    if (modes.includes('trace')) {
      const secs = Number(process.env.TRACE_S ?? 120);
      const { ctx, page } = await open(layout, 13, '', 90);
      const r = await page.evaluate((S) => new Promise((res) => {
        const A = window.__arbor, st = A.stage, cam = st.camera, D = st.director;
        let lp = cam.position.clone(), ld = cam.getWorldDirection(new cam.position.constructor()), lt = document.timeline.currentTime, t0 = lt;
        const o = { frames: 0, maxStep: 0, maxStepAt: '', maxSpeed: 0, maxAng: 0, maxAngAt: '', maxAngStep: 0, path: 0, kinds: [], cuts: 0, minY: 1e9, minTrunk: 1e9, maxDt: 0 };
        // rAF timestamps (the frame time the camera moved by), not performance.now() in this callback: that one can sit
        // 7 ms after the previous callback in a 100 ms frame and turned a 0.1 m step into "14 to 24 m/s".
        const tick = (now) => {
          const dt = (now - lt) / 1000, s = D.state(), d = cam.getWorldDirection(new cam.position.constructor());
          if (s.kind && o.kinds[o.kinds.length - 1] !== s.kind) o.kinds.push(s.kind);
          const n0 = A.sim.nodes[0];
          o.minY = Math.min(o.minY, cam.position.y); o.minTrunk = Math.min(o.minTrunk, Math.hypot(cam.position.x - n0.wx, cam.position.z - n0.wz));
          if (s.cutFrame) o.cuts++;
          else if (dt > 0 && dt < 1) {
            const step = cam.position.distanceTo(lp), ang = d.angleTo(ld) * 57.2958;
            o.frames++; o.path += step; o.maxDt = Math.max(o.maxDt, dt);
            if (step > o.maxStep) { o.maxStep = step; o.maxStepAt = `${s.kind}@${s.t.toFixed(1)}${s.travelling ? ' travel' : ''}`; }
            o.maxSpeed = Math.max(o.maxSpeed, step / dt); o.maxAngStep = Math.max(o.maxAngStep, ang);
            if (ang / dt > o.maxAng) { o.maxAng = ang / dt; o.maxAngAt = `${s.kind}@${s.t.toFixed(1)}${s.travelling ? ' travel' : ''}`; }
          }
          lp.copy(cam.position); ld = d; lt = now;
          if (now - t0 < S * 1000) requestAnimationFrame(tick); else res(o);
        };
        requestAnimationFrame(tick);
      }), secs);
      console.log(layout, 'trace', JSON.stringify(r));
      await ctx.close();
    }
  }
} finally {
  await browser.close();
  vite.kill();
}

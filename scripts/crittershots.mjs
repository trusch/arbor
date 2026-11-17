// Wildlife shots on the real GPU (ANGLE Vulkan): close-up bursts of each creature as contact sheets, the app's framed
// camera by day and night, program counts with / without (`?critters=0`) and the per-frame cost.
// Usage: PORT=5661 node scripts/crittershots.mjs [prefix=crit] [modes=desk,phone] [cases=bfly,settle,fire,bird,framed,cost]
// THROTTLE=4 sets the CPU throttle for the cost case.
import { spawn, execFileSync } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { chromium } from 'playwright-core';

const prefix = process.argv[2] ?? 'crit';
const modes = (process.argv[3] ?? 'desk,phone').split(',');
const cases = (process.argv[4] ?? 'bfly,settle,fire,bird,framed,cost').split(',');
const PORT = Number(process.env.PORT ?? 5661);
mkdirSync('shots', { recursive: true });
const vite = spawn('npx', ['vite', '--port', String(PORT), '--strictPort'], { stdio: ['ignore', 'pipe', 'inherit'] });
await new Promise((res) => vite.stdout.on('data', (d) => String(d).includes('Local') && res()));
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM ?? '/usr/sbin/chromium',
  args: ['--headless=new', '--use-gl=angle', `--use-angle=${process.env.GPU ?? 'vulkan'}`, '--enable-gpu', '--ignore-gpu-blocklist'],
});
const PHONE = { viewport: { width: 411, height: 777 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, userAgent: 'Mozilla/5.0 (Linux; Android 15; Pixel) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0 Mobile Safari/537.36' };
const url = (hour, q = '') => `http://localhost:${PORT}/?speed=0&autoRotate=false&cinema=false&weather=calm&timeOfDay=${hour}&season.date=0.3&season.hold=true&nogui=1&hideui=1${q}`;
const sheet = (name, files, tile, geo) => { execFileSync('montage', [...files, '-tile', tile, '-geometry', geo, '-background', '#222', `shots/${name}.png`]); console.log(`shots/${name}.png (${files.length} frames)`); };
const stats = (page) => page.evaluate(() => { const A = window.__arbor, s = A.critters?.stats; return { programs: A.stage.renderer.info.programs.length, calls: A.stage.renderer.info.render.calls, ...(s ? { bf: s.butterflies, sit: s.settled, ff: s.fireflies, lit: s.lit, birds: s.birds, perched: s.perched, ms: s.frames ? +(s.sumMs / s.frames).toFixed(4) : 0, maxMs: +s.maxMs.toFixed(2) } : {}), fe: A.frameErrors() }; });
try {
  for (const mode of modes) {
    const geo = mode === 'phone' ? '274x518+2+2' : '512x320+2+2';
    const open = async (hour, q = '', force = { butterflies: 1, fireflies: 0, birds: 1 }) => {
      const ctx = await browser.newContext(mode === 'phone' ? PHONE : { viewport: { width: 1024, height: 640 } });
      const page = await ctx.newPage();
      page.on('pageerror', (e) => console.error('[pageerror]', e.message));
      await page.goto(url(hour, q));
      await page.waitForFunction(() => window.__arbor !== undefined);
      await page.evaluate((f) => { const A = window.__arbor; A.fastForward(90); if (A.critters && f) A.critters.force = f; }, force);
      await page.waitForTimeout(5000);
      return { ctx, page };
    };
    const burst = async (page, name, n, gap, aim, tile = '6x') => {
      const files = [];
      for (let i = 0; i < n; i++) {
        if (aim) await page.evaluate(aim);
        const f = `shots/${prefix}-${mode}-${name}-${String(i).padStart(2, '0')}.png`;
        await page.screenshot({ path: f });
        files.push(f);
        if (gap) await page.waitForTimeout(gap);
      }
      sheet(`${prefix}-${mode}-${name}-sheet`, files, tile, geo);
    };
    // Camera `d` metres from a point, looking at it.
    const look = `(p, d, h = 0.25) => { const A = window.__arbor, st = A.stage; A.params.camera.autoFrame = false; const r = Math.hypot(p.x, p.z), ux = r > 0.01 ? p.x / r : 0.7, uz = r > 0.01 ? p.z / r : 0.7; st.controls.target.set(p.x, p.y, p.z); if (!window.__fix) st.camera.position.set(p.x + ux * d, p.y + h * d, p.z + uz * d); st.controls.update(); }`;
    if (cases.includes('bfly') || cases.includes('settle')) {
      const { ctx, page } = await open(13);
      if (cases.includes('bfly')) {
        await page.evaluate(`window.__look = ${look}; window.__bf = () => { const A = window.__arbor, s = A.critters.state().butterflies; const b = s.find((b) => !b.sit) ?? s[0]; window.__look(b, 3, 0.3); window.__fix = true; }`);
        await page.waitForTimeout(1500);
        await burst(page, 'bfly-flight', 18, 0, 'window.__bf()'); await page.evaluate(() => { window.__fix = false; });
      }
      if (cases.includes('settle')) {
        await page.waitForFunction(() => window.__arbor.critters.stats.settled > 0, null, { timeout: 60000 }).catch(() => console.log('no butterfly settled in 60 s'));
        await page.evaluate(`window.__look = ${look}; (() => { const b = window.__arbor.critters.state().butterflies.find((b) => b.sit); if (b) window.__look(b, 0.8, 0.5); })()`);
        await burst(page, 'bfly-settle', 12, 150, null);
      }
      console.log(mode, 'butterflies', JSON.stringify(await stats(page)));
      await ctx.close();
    }
    if (cases.includes('fire')) {
      const { ctx, page } = await open(23.5, '', { butterflies: 0, fireflies: 1, birds: 0 });
      await page.evaluate(`(${look})({ x: 0, y: 1.2, z: 0 }, 9, 0.05)`);
      await page.waitForTimeout(1500);
      await burst(page, 'fire-rhythm', 12, 250, null);
      console.log(mode, 'fireflies', JSON.stringify(await stats(page)));
      await ctx.close();
    }
    if (cases.includes('bird')) {
      const { ctx, page } = await open(13, '', { butterflies: 0, fireflies: 0, birds: 0 });
      // Both in the air, from the framed camera: start two visits now (each bird picks its own route).
      await page.evaluate(() => { const A = window.__arbor, c = A.critters; c.force = { butterflies: 0, fireflies: 0, birds: 1 }; c.birds.forEach((b, i) => { b.st = 0; b.wait = 0.01 + i * 0.8; }); });
      await page.waitForFunction(() => window.__arbor.critters.birds.every((b) => b.st === 1 && b.s > 0.45), null, { timeout: 20000 }).catch(() => console.log('not both in the air'));
      await burst(page, 'bird-approach', 24, 0, null);
      // Bird 0 stays; bird 1 is kept away for the close-ups.
      await page.waitForFunction(() => window.__arbor.critters.birds[0].st === 2, null, { timeout: 30000 }).catch(() => console.log('bird did not perch'));
      await page.evaluate(`window.__look = ${look}; (() => { const c = window.__arbor.critters, b = c.birds[0]; b.dur = 1e9; c.birds[1].wait = 1e9; window.__look(b, 1.6, 0.1); })()`);
      await page.waitForTimeout(800);
      await burst(page, 'bird-perched', 18, 120, null);
      await page.evaluate(`(() => { const b = window.__arbor.critters.birds[0]; window.__look(b, 5, 0.12); })()`);
      await page.waitForFunction(() => window.__arbor.critters.birds[0].st === 2, null, { timeout: 5000 }).catch(() => {});
      await page.waitForTimeout(400);
      await page.evaluate(() => { const b = window.__arbor.critters.birds[0]; b.dur = 0; });
      await burst(page, 'bird-takeoff', 18, 0, null);
      // Land again in front of the same camera: second visit to the same node.
      await page.evaluate(`(() => { const c = window.__arbor.critters, keep = c.birds[0].node; c.birds[0].st = 0; c.birds[0].wait = 0.01; c.pickPerch = () => keep; })()`);
      await page.waitForFunction(() => { const b = window.__arbor.critters.birds[0]; return b.st === 1 && b.s > 0.84; }, null, { timeout: 30000 }).catch(() => console.log('no approach'));
      await burst(page, 'bird-landing', 24, 0, null);
      console.log(mode, 'birds', JSON.stringify(await stats(page)));
      await ctx.close();
    }
    if (cases.includes('birdclose')) {
      // Slow motion (SLOW x real time, so a frame every 50 ms of bird time or less), leaves hidden, camera 2.4 m beside
      // bird 0 and following it: landing, perch, take-off.
      const { ctx, page } = await open(13, '', { butterflies: 0, fireflies: 0, birds: 1 });
      await page.evaluate((slow) => {
        const A = window.__arbor, c = A.critters, f = c.frame.bind(c);
        window.__slow = 1; c.frame = (dt, sim, env) => f(dt * window.__slow, sim, env);
        A.leaves.mesh.visible = false; A.params.camera.autoFrame = false;
        c.birds[0].st = 0; c.birds[0].wait = 0.01; c.birds[1].st = 0; c.birds[1].wait = 1e9;
        window.__side = null;
        window.__track = (d = 2.4) => { const b = c.birds[0], st = A.stage; if (!window.__side || b.st === 1 || b.st === 3) window.__side = [-b.hz, b.hx]; const [sx, sz] = window.__side; st.controls.target.set(b.x, b.y + 0.05, b.z); st.camera.position.set(b.x + sx * d, b.y + 0.25, b.z + sz * d); st.controls.update(); };
        window.__slowBy = slow;
      }, Number(process.env.SLOW ?? 0.2));
      await page.waitForFunction(() => { const b = window.__arbor.critters.birds[0]; return b.st === 1 && b.s > 0.9; }, null, { timeout: 30000 }).catch(() => console.log('no approach'));
      await page.evaluate(() => { window.__slow = window.__slowBy; });
      await burst(page, 'close-landing', 36, 0, 'window.__track()');
      await page.evaluate(() => { window.__slow = 1; window.__arbor.critters.birds[0].dur = 1e9; });
      await page.waitForFunction(() => window.__arbor.critters.birds[0].st === 2, null, { timeout: 20000 }).catch(() => console.log('did not perch'));
      await burst(page, 'close-perched', 24, 120, 'window.__track(1.5)');
      await page.waitForFunction(() => window.__arbor.critters.birds[0].st === 2, null, { timeout: 5000 }).catch(() => {});
      await page.evaluate(() => { window.__slow = window.__slowBy; window.__arbor.critters.birds[0].dur = 0; });
      await burst(page, 'close-takeoff', 36, 0, 'window.__track(3)');
      await page.evaluate(() => { window.__slow = window.__slowBy * 2; });
      await burst(page, 'close-bounding', 24, 0, 'window.__track(3.2)');
      await ctx.close();
    }
    if (cases.includes('framed')) {
      for (const [name, hour, force] of [['day', 13, { butterflies: 1, fireflies: 0, birds: 1 }], ['dusk', 21.2, null], ['night', 23.5, { butterflies: 0, fireflies: 1, birds: 0 }]]) {
        const { ctx, page } = await open(hour, '', force);
        if (name === 'day') await page.waitForFunction(() => window.__arbor.critters.stats.perched > 0, null, { timeout: 30000 }).catch(() => {});
        await page.waitForTimeout(1500);
        await burst(page, `framed-${name}`, 4, 400, null, '4x');
        console.log(mode, 'framed', name, JSON.stringify(await stats(page)), JSON.stringify(await page.evaluate(() => { const s = window.__arbor.critters.stats; return { pb: s.pb, pf: s.pf, pbird: s.pbird, night: window.__arbor.stage.atmo.night }; })));
        await ctx.close();
      }
    }
    if (cases.includes('cost')) {
      for (const [name, hour] of [['day', 13], ['night', 23.5]]) {
        const row = {};
        for (const q of ['', '&critters=0']) {
          const { ctx, page } = await open(hour, q, name === 'day' ? { butterflies: 1, fireflies: 1, birds: 1 } : { butterflies: 1, fireflies: 1, birds: 1 });
          const thr = Number(process.env.THROTTLE ?? 4);
          if (thr > 1) { const cdp = await ctx.newCDPSession(page); await cdp.send('Emulation.setCPUThrottlingRate', { rate: thr }); }
          await page.waitForTimeout(3000);
          await page.evaluate(() => { const s = window.__arbor.critters?.stats; if (s) { s.frames = 0; s.sumMs = 0; s.maxMs = 0; } });
          await page.waitForTimeout(6000);
          row[q || 'on'] = await stats(page);
          await ctx.close();
        }
        console.log(mode, 'cost', name, JSON.stringify(row));
      }
    }
  }
} finally { await browser.close(); vite.kill(); }

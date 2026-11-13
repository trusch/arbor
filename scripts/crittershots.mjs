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
      // Approach from the framed camera: start a visit now.
      await page.evaluate(() => { const A = window.__arbor, c = A.critters; c.force = { butterflies: 0, fireflies: 0, birds: 1 }; c.birds.forEach((b, i) => { b.st = 0; b.wait = i; }); });
      await burst(page, 'bird-approach', 18, 280, null);
      await page.waitForFunction(() => window.__arbor.critters.stats.perched === 2, null, { timeout: 30000 }).catch(() => console.log('birds did not perch'));
      await page.evaluate(`window.__look = ${look}; (() => { const b = window.__arbor.critters.state().birds[0]; window.__look(b, 1.6, 0.1); })()`);
      await page.waitForTimeout(800);
      await burst(page, 'bird-perched', 12, 350, null);
      // Land again right in front of the camera: second visit to the same node.
      await page.evaluate(() => { const c = window.__arbor.critters; c.flush(); });
      await burst(page, 'bird-takeoff', 12, 0, null);
      await page.evaluate(`(() => { const A = window.__arbor, c = A.critters, keep = c.birds[0].node; c.birds.forEach((b, i) => { b.st = 0; b.wait = 0.01 + i; }); const pp = c.pickPerch.bind(c); c.pickPerch = (s, near) => (near < 0 ? keep : pp(s, near)); })()`);
      await page.waitForFunction(() => { const b = window.__arbor.critters.birds[0]; return b.st === 1 && b.t / b.dur > 0.72; }, null, { timeout: 30000 }).catch(() => console.log('no approach'));
      await burst(page, 'bird-landing', 18, 0, null);
      console.log(mode, 'birds', JSON.stringify(await stats(page)));
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

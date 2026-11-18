// Bird close-ups on the real GPU (ANGLE Vulkan) with the bird clock frozen or stepped: a full turn around a flying
// bird (level and banked), from above, a wing beat from the side and from the front, landing, perched (orbit, night),
// take-off, against the sunset sky, the director's bird shot; program counts along the way.
// Usage: PORT=5861 node scripts/birdsheet.mjs [prefix=birds3d-after] [modes=desk,phone] [cases=fly,perch,director]
import { spawn, execFileSync } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { chromium } from 'playwright-core';

const prefix = process.argv[2] ?? 'birds3d-after';
const modes = (process.argv[3] ?? 'desk,phone').split(',');
const cases = (process.argv[4] ?? 'fly,perch,director').split(',');
const PORT = Number(process.env.PORT ?? 5861);
mkdirSync('shots', { recursive: true });
const vite = spawn('npx', ['vite', '--port', String(PORT), '--strictPort'], { stdio: ['ignore', 'pipe', 'inherit'] });
await new Promise((res) => vite.stdout.on('data', (d) => String(d).includes('Local') && res()));
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM ?? '/usr/sbin/chromium',
  args: ['--headless=new', '--use-gl=angle', `--use-angle=${process.env.GPU ?? 'vulkan'}`, '--enable-gpu', '--ignore-gpu-blocklist'],
});
const PHONE = { viewport: { width: 411, height: 777 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, userAgent: 'Mozilla/5.0 (Linux; Android 15; Pixel) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0 Mobile Safari/537.36' };
const url = (q = '') => `http://localhost:${PORT}/?speed=0&autoRotate=false&weather=calm&timeOfDay=13&cycle=false&season.date=0.3&season.hold=true&nogui=1&hideui=1${q}`;
const T = 120000;
try {
  for (const mode of modes) {
    const geo = mode === 'phone' ? '274x518+2+2' : '512x320+2+2';
    const sheet = (name, files, tile = '8x') => { execFileSync('montage', [...files, '-tile', tile, '-geometry', geo, '-background', '#222', `shots/${prefix}-${mode}-${name}.jpg`]); console.log(`shots/${prefix}-${mode}-${name}.jpg (${files.length})`); };
    const open = async (q) => {
      const ctx = await browser.newContext(mode === 'phone' ? PHONE : { viewport: { width: 1024, height: 640 } });
      const page = await ctx.newPage();
      page.setDefaultTimeout(T);
      page.on('pageerror', (e) => console.error('[pageerror]', e.message));
      await page.goto(url(q), { timeout: T });
      await page.waitForFunction(() => window.__arbor !== undefined, null, { timeout: T });
      await page.evaluate(`(() => {
        const A = window.__arbor, c = A.critters;
        A.fastForward(90);
        if (!c) return;
        c.force = { butterflies: 0, fireflies: 0, birds: 1 };
        const f = c.frame.bind(c);
        window.__slow = 1; window.__step = 0; window.__freezeAt = 0.35; window.__kind = ${Number(process.env.KIND ?? 0)};
        c.frame = (dt, sim, env) => { const b0 = c.birds[0]; if (window.__freezeAt && b0.st === 1 && b0.s > window.__freezeAt) { window.__slow = 0; window.__freezeAt = 0; } if (window.__kind >= 0 && b0.kind !== undefined && b0.kind !== window.__kind && b0.st !== 0) { b0.kind = window.__kind; c.birdUv(0, b0.kind); } let d = dt * window.__slow; if (window.__step) { d = window.__step; window.__step = 0; } f(d, sim, env); };
        c.birds[1].st = 0; c.birds[1].wait = 1e9; c.birds[0].st = 0; c.birds[0].wait = 0.01;
        // Camera d metres from bird 0: az from its heading (0 = in front of it), el up.
        window.__cam = (az, el, d) => {
          const b = c.birds[0], st = A.stage, ce = Math.cos(el), fx = b.hx, fz = b.hz, rx = -fz, rz = fx;
          A.params.camera.autoFrame = false;
          st.controls.target.set(b.x, b.y + 0.06, b.z);
          st.camera.position.set(b.x + d * ce * (Math.cos(az) * fx + Math.sin(az) * rx), b.y + 0.06 + d * Math.sin(el), b.z + d * ce * (Math.cos(az) * fz + Math.sin(az) * rz));
          st.controls.update();
        };
      })()`);
      await page.waitForTimeout(6000);
      return { ctx, page };
    };
    const raf = (page) => page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(() => requestAnimationFrame(r)))));
    const prog = async (page, what) => console.log(mode, what, JSON.stringify(await page.evaluate(() => { const A = window.__arbor, i = A.stage.renderer.info; return { programs: i.programs.length, calls: i.render.calls, tris: i.render.triangles, birds: A.critters?.birds.map((b) => b.st) }; })));
    let n = 0;
    const snap = async (page, js) => { if (js) await page.evaluate(js); await raf(page); const f = `shots/tmp-${prefix}-${mode}-${String(n++).padStart(3, '0')}.png`; await page.screenshot({ path: f }); return f; };
    const hour = async (page, h) => { await page.evaluate((h) => { window.__arbor.params.sky.timeOfDay = h; }, h); await page.waitForTimeout(3500); };
    const AZ = [0, 1, 2, 3, 4, 5, 6, 7].map((i) => (i * Math.PI) / 4);
    if (cases.includes('fly') || cases.includes('perch')) {
      const { ctx, page } = await open('&cinema=false');
      await page.waitForFunction(() => { const b = window.__arbor.critters.birds[0]; return window.__slow === 0 || b.st === 2; });
      await page.evaluate(() => { window.__slow = 0; const b = window.__arbor.critters.birds[0]; b.fold = 1; b.flapping = true; b.flap = 0.6; b.cyc = 0.05; b.per = 0.7; b.bank = 0; });
      if (cases.includes('fly')) {
        await prog(page, 'flying');
        let fs = [];
        for (const az of AZ) fs.push(await snap(page, `window.__cam(${az}, 0.2, 0.8)`));
        await page.evaluate(() => { window.__arbor.critters.birds[0].bank = 0.75; });
        for (const az of AZ) fs.push(await snap(page, `window.__cam(${az}, 0.2, 0.8)`));
        for (const az of [0, 1.57, 3.14, 4.71]) fs.push(await snap(page, `window.__cam(${az}, 1.4, 0.8)`));
        for (const az of [0, 1.57, 3.14, 4.71]) fs.push(await snap(page, `window.__cam(${az}, -1.1, 0.8)`));
        sheet('turn', fs);
        fs = [];
        for (const k of [0, 1, 2]) { await page.evaluate((k) => { window.__kind = k; window.__step = 1e-6; }, k); for (const [az, el] of [[1.57, 0.1], [0.5, 0.25], [2.4, 0.5], [1.57, -0.6]]) fs.push(await snap(page, `window.__cam(${az}, ${el}, 0.7)`)); }
        await page.evaluate((k) => { window.__kind = k; window.__step = 1e-6; }, Number(process.env.KIND ?? 0));
        sheet('kinds', fs, '4x');
        await page.evaluate(() => { window.__arbor.critters.birds[0].bank = 0; });
        fs = [];
        for (const az of [1.57, 0, 0.8]) for (let i = 0; i < 8; i++) fs.push(await snap(page, `window.__step = 0.009; requestAnimationFrame(() => requestAnimationFrame(() => window.__cam(${az}, 0.12, 0.8)))`));
        sheet('beat', fs);
        // Gliding / tucked phase of a bound.
        fs = [];
        await page.evaluate(() => { const b = window.__arbor.critters.birds[0]; b.cyc = 0.6; b.per = 0.7; b.flapping = false; });
        for (let i = 0; i < 8; i++) fs.push(await snap(page, `window.__step = 0.02; requestAnimationFrame(() => requestAnimationFrame(() => window.__cam(${i < 4 ? 1.57 : 0.5}, 0.15, 0.8)))`));
        await hour(page, 19.4);
        for (const [az, el] of [[1.57, -0.35], [0.6, -0.3], [2.6, -0.2], [1.57, 0.5]]) fs.push(await snap(page, `window.__cam(${az}, ${el}, 0.9)`));
        for (const [az, el] of [[1.57, -0.2], [0.6, -0.2]]) fs.push(await snap(page, `window.__cam(${az}, ${el}, 6)`));
        await hour(page, 13);
        sheet('glide-sunset', fs);
        await page.evaluate(() => { window.__slow = 1; });
        await page.waitForFunction(() => { const b = window.__arbor.critters.birds[0]; return b.st === 1 && b.s > 0.9; });
        await page.evaluate(() => { window.__slow = 0.15; });
        fs = [];
        for (let i = 0; i < 16; i++) fs.push(await snap(page, `window.__cam(1.9, 0.15, 1.6)`));
        sheet('landing', fs);
      }
      await page.evaluate(() => { window.__slow = 1; window.__arbor.critters.birds[0].dur = 1e9; });
      await page.waitForFunction(() => window.__arbor.critters.birds[0].st === 2);
      await page.evaluate(() => { window.__arbor.critters.birds[0].dur = 1e9; });
      await page.waitForTimeout(1500);
      await page.waitForFunction(() => window.__arbor.critters.birds[0].st === 2);
      await page.evaluate(() => { window.__slow = 0; });
      await prog(page, 'perched');
      let fs = [];
      for (const az of AZ) fs.push(await snap(page, `window.__cam(${az}, 0.12, 0.7)`));
      await page.evaluate(() => { window.__arbor.leaves.mesh.visible = false; });
      for (const az of AZ) fs.push(await snap(page, `window.__cam(${az}, 0.12, 0.7)`));
      for (const [az, el] of [[1.57, 1.3], [0.8, 0.7], [1.57, -0.5], [0.3, 0.1]]) fs.push(await snap(page, `window.__cam(${az}, ${el}, 0.5)`));
      await hour(page, 23.5);
      for (const az of [1.57, 0.6]) fs.push(await snap(page, `window.__cam(${az}, 0.12, 0.7)`));
      await hour(page, 19.4);
      for (const az of [1.57, 0.6]) fs.push(await snap(page, `window.__cam(${az}, -0.25, 0.7)`));
      await hour(page, 13);
      sheet('perched', fs);
      await page.evaluate(() => { window.__slow = 0.15; window.__arbor.critters.birds[0].dur = 0; });
      fs = [];
      for (let i = 0; i < 16; i++) fs.push(await snap(page, `window.__cam(1.9, 0.15, 1.8)`));
      sheet('takeoff', fs);
      await prog(page, 'after take-off');
      await ctx.close();
    }
    if (cases.includes('director')) {
      const { ctx, page } = await open('&cinema=true');
      try {
        await page.waitForFunction(() => window.__arbor.critters.birds[0].st === 2, null, { timeout: 60000 });
        await page.evaluate(() => { const A = window.__arbor, b = A.critters.birds[0]; b.dur = 1e9; A.stage.director.event('bird', b.x, b.y, b.z); });
        await page.waitForFunction(() => window.__arbor.stage.director.state().kind === 'bird', null, { timeout: 60000 });
        await page.waitForTimeout(3000);
        const fs = [];
        for (let i = 0; i < 4; i++) { fs.push(await snap(page)); await page.waitForTimeout(1200); }
        sheet('director', fs, '4x');
        await prog(page, 'director bird shot');
      } catch (e) { console.log(mode, 'director case failed:', e.message.split('\n')[0]); }
      await ctx.close();
      const z = await open('&cinema=false&critters=0');
      await prog(z.page, 'critters=0');
      await z.ctx.close();
    }
  }
} finally { await browser.close(); vite.kill(); execFileSync('sh', ['-c', `rm -f shots/tmp-${prefix}-*.png`]); }

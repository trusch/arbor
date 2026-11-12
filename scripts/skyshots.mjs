// Sun / moon / star shots on the real GPU with a fixed camera that looks toward the body (the app camera cannot look
// up more than about 18 degrees, so the script lifts OrbitControls' polar limit), plus the program count per case.
// Usage: PROF_DIST=/tmp/dist PORT=5460 node scripts/skyshots.mjs desk|phone [prefix=sky] [cases=all] [query]
import { spawn } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { chromium } from 'playwright-core';

const PORT = Number(process.env.PORT ?? 5460), DIST = process.env.PROF_DIST ?? '/tmp/arbor-prof-dist';
const mode = process.argv[2] ?? 'desk', prefix = process.argv[3] ?? 'sky', query = process.argv[5] ?? '';
// name: [body, hour | {el: wanted elevation sine, from, to}, moon phase, storm, yaw offset of the camera (rad)]
const CASES = {
  noon: ['sun', 13, 0.5, false, 0.2],
  h1730: ['sun', 17.5, 0.5, false, 0.2],
  crown: ['sun', 17.5, 0.5, false, 0],
  sunset: ['sun', { el: 0.11, from: 17, to: 23 }, 0.5, false, 0.2],
  dusk: ['sun', { el: -0.06, from: 17, to: 23 }, 0.5, false, 0.2],
  full: ['moon', 23.2, 0.5, false, 0.2],
  half: ['moon', 21.8, 0.25, false, 0.2],
  new: ['moon', 23.5, 0.02, false, 0.2],
  moonrise: ['moon', { el: 0.2, from: 19.5, to: 23.9 }, 0.5, false, 0.2],
  storm: ['sun', 17.5, 0.5, true, 0.2],
};
const names = (process.argv[4] && process.argv[4] !== 'all' ? process.argv[4].split(',') : Object.keys(CASES));
mkdirSync('shots', { recursive: true });
const vite = spawn('npx', ['vite', 'preview', '--outDir', DIST, '--port', String(PORT), '--strictPort'], { stdio: ['ignore', 'pipe', 'inherit'] });
await new Promise((res) => vite.stdout.on('data', (d) => String(d).includes('Local') && res()));
const browser = await chromium.launch({ executablePath: '/usr/sbin/chromium', args: ['--headless=new', '--use-gl=angle', `--use-angle=${process.env.GPU ?? 'vulkan'}`, '--enable-gpu', '--ignore-gpu-blocklist'] });
const setup = ([body, hour, phase, storm, yawOff]) => {
  const a = window.__arbor, k = a.params.sky, A = a.stage.atmo;
  k.moonPhase = phase;
  const dir = () => (body === 'sun' ? A.sunDir : A.moonDir);
  const at = (h) => { k.timeOfDay = h; a.fastForward(0); return dir().y; };
  if (typeof hour === 'object') {
    // First hour in [from, to] where the body's elevation crosses the wanted value.
    let best = hour.from, bd = 9;
    for (let h = hour.from; h <= hour.to; h += 0.02) { const d = Math.abs(at(h) - hour.el); if (d < bd) { bd = d; best = h; } }
    hour = best;
  }
  if (storm) { a.params.weather.event = 'storm'; a.weather.snapStorm(); a.weather.nextStrike = 1e9; }
  at(hour);
  const d = dir(), H = a.sim.bboxMax[1], n0 = a.sim.nodes[0], portrait = innerWidth < innerHeight;
  a.params.camera.autoFrame = false;
  a.stage.controls.maxPolarAngle = Math.PI;
  const az = Math.atan2(d.z, d.x) + yawOff, D = H * (portrait ? 3.0 : 2.1);
  const px = n0.wx - Math.cos(az) * D, pz = n0.wz - Math.sin(az) * D, py = 1.7;
  // Aim: body in the upper third; never below a slightly raised horizon view.
  const el = Math.max(0.1, Math.asin(Math.max(-1, Math.min(1, d.y))) - 0.17), baz = Math.atan2(d.z, d.x) + yawOff * 0.45;
  a.stage.camera.position.set(px, py, pz);
  a.stage.controls.target.set(px + Math.cos(baz) * Math.cos(el) * 10, py + Math.sin(el) * 10, pz + Math.sin(baz) * Math.cos(el) * 10);
  a.fastForward(0);
  return { hour: +hour.toFixed(2), bodyY: +d.y.toFixed(3) };
};
try {
  for (const name of names) {
    // A fresh page per case: equal settle time for every program count, and no storm state carried over.
    const ctx = await browser.newContext(mode === 'phone'
      ? { viewport: { width: 411, height: 777 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, userAgent: 'Mozilla/5.0 (Linux; Android 15; Pixel) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0 Mobile Safari/537.36' }
      : { viewport: { width: 1280, height: 800 } });
    const page = await ctx.newPage();
    page.on('pageerror', (e) => console.error('[pageerror]', e.message));
    await page.goto(`http://localhost:${PORT}/?nogui=1&hideui=1&speed=0&autoRotate=false&cinema=false&weather=calm&${query}`);
    await page.waitForFunction(() => window.__arbor !== undefined);
    await page.evaluate(() => window.__arbor.fastForward(90));
    const info = await page.evaluate(setup, CASES[name]);
    await page.waitForTimeout(Number(process.env.SETTLE_MS ?? 7000));
    await page.screenshot({ path: `shots/${prefix}-${mode}-${name}.png` });
    console.log(mode, name, JSON.stringify({ ...info, ...(await page.evaluate(() => { const a = window.__arbor, r = a.stage.renderer; return { programs: r.info.programs.length, calls: r.info.render.calls, quality: a.params.sky.quality, sky: a.sky?.stats, fe: a.frameErrors() }; })) }));
    await ctx.close();
  }
} finally {
  await browser.close();
  vite.kill();
}

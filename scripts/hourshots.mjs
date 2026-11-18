// The framed tree at five hours on two builds side by side, real GPU, one fixed pose per case (camera on the far side of
// the tree from the light, turned YAW rad off it: the crown is backlit three-quarter, as the light branch is about).
// Usage: node scripts/hourshots.mjs desk|phone prefix NAME=URL [NAME=URL ...]   (servers already running; GPU, SETTLE_MS, YAW)
// Writes shots/<prefix>-<mode>-<name>-<case>.png, prints luminance medians per case.
import { chromium } from 'playwright-core';
import { mkdirSync } from 'node:fs';
const mode = process.argv[2] ?? 'desk', prefix = process.argv[3] ?? 'hr', builds = process.argv.slice(4).map((s) => s.split('='));
const YAW = Number(process.env.YAW ?? 0.6);
// name: [body, hour | {el, from, to}, moon phase]
const CASES = { noon: ['sun', 13, 0.5], golden: ['sun', 17.5, 0.5], sunset: ['sun', { el: 0.11, from: 17, to: 23 }, 0.5], full: ['moon', 23.2, 0.5], moonless: ['moon', 23.5, 0.02] };
mkdirSync('shots', { recursive: true });
const browser = await chromium.launch({ executablePath: '/usr/sbin/chromium', args: ['--headless=new', '--use-gl=angle', `--use-angle=${process.env.GPU ?? 'vulkan'}`, '--enable-gpu', '--ignore-gpu-blocklist'] });
const setup = ([[body, hour, phase], yaw]) => {
  const a = window.__arbor, k = a.params.sky, A = a.stage.atmo;
  k.moonPhase = phase;
  const dir = () => (body === 'sun' ? A.sunDir : A.moonDir);
  const at = (h) => { k.timeOfDay = h; a.fastForward(0); return dir().y; };
  if (typeof hour === 'object') { let best = hour.from, bd = 9; for (let h = hour.from; h <= hour.to; h += 0.02) { const d = Math.abs(at(h) - hour.el); if (d < bd) { bd = d; best = h; } } hour = best; }
  at(hour);
  const d = dir(), H = a.sim.bboxMax[1], n0 = a.sim.nodes[0], portrait = innerWidth < innerHeight;
  a.params.camera.autoFrame = false; a.stage.takeControl();
  const az = Math.atan2(d.z, d.x) + yaw, D = H * (portrait ? 3.0 : 2.1);
  a.stage.camera.position.set(n0.wx - Math.cos(az) * D, 1.7, n0.wz - Math.sin(az) * D);
  a.stage.controls.target.set(n0.wx, H * (portrait ? 0.5 : 0.45), n0.wz);
  a.fastForward(0);
  return { hour: +hour.toFixed(2), bodyY: +d.y.toFixed(3) };
};
const lum = (page) => page.evaluate(async () => {
  const c = document.querySelector('canvas'), w = 96, h = Math.round(96 * c.height / c.width), o = new OffscreenCanvas(w, h), g = o.getContext('2d');
  await new Promise((r) => requestAnimationFrame(() => { g.drawImage(c, 0, 0, w, h); r(); }));
  const px = g.getImageData(0, 0, w, h).data, L = [];
  for (let i = 0; i < px.length; i += 4) L.push(0.2126 * px[i] + 0.7152 * px[i + 1] + 0.0722 * px[i + 2]);
  L.sort((x, y) => x - y); return { p50: +L[L.length >> 1].toFixed(1), p90: +L[Math.floor(L.length * 0.9)].toFixed(1) };
});
try {
  for (const name of Object.keys(CASES)) for (const [bn, url] of builds) {
    const ctx = await browser.newContext(mode === 'phone'
      ? { viewport: { width: 411, height: 777 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, userAgent: 'Mozilla/5.0 (Linux; Android 15; Pixel) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0 Mobile Safari/537.36' }
      : { viewport: { width: 1280, height: 800 } });
    const page = await ctx.newPage();
    page.on('pageerror', (e) => console.error('[pageerror]', e.message));
    await page.goto(`${url}?cycle=false&nogui=1&hideui=1&speed=0&autoRotate=false&cinema=false&weather=calm&season.on=false&start=0`);
    await page.waitForFunction(() => window.__arbor !== undefined);
    await page.evaluate(() => window.__arbor.fastForward(90));
    const info = await page.evaluate(setup, [CASES[name], YAW]);
    await page.waitForTimeout(Number(process.env.SETTLE_MS ?? 7000));
    await page.screenshot({ path: `shots/${prefix}-${mode}-${bn}-${name}.png` });
    console.log(mode, name, bn, JSON.stringify({ ...info, ...(await lum(page)), ...(await page.evaluate(() => { const a = window.__arbor; return { programs: a.stage.renderer.info.programs.length, q: a.params.sky.quality, leaf: a.leaves.mode ?? a.leaves.mesh.material.type, fe: a.frameErrors() }; })) }));
    await ctx.close();
  }
} finally { await browser.close(); }

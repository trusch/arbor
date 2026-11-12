// Weather proof shots on the real GPU (pattern of meadowshots.mjs): calm, storm (two frames 0.5 s apart + motion diff),
// forced flash frame, then the storm clears on its own path and the calm state/screenshot is compared with the start.
// Usage: PROF_DIST=/tmp/dist PORT=5382 node scripts/weathershots.mjs [phone|desk] [hour=13] [query]
import { spawn } from 'node:child_process';
import { mkdirSync, readFileSync } from 'node:fs';
import { chromium } from 'playwright-core';

const PORT = Number(process.env.PORT ?? 5382), DIST = process.env.PROF_DIST ?? '/tmp/arbor-prof-dist';
const mode = process.argv[2] ?? 'phone', hour = Number(process.argv[3] ?? 13), query = process.argv[4] ?? '';
mkdirSync('shots', { recursive: true });
const vite = spawn('npx', ['vite', 'preview', '--outDir', DIST, '--port', String(PORT), '--strictPort'], { stdio: ['ignore', 'pipe', 'inherit'] });
await new Promise((res) => vite.stdout.on('data', (d) => String(d).includes('Local') && res()));
const browser = await chromium.launch({ executablePath: '/usr/sbin/chromium', args: ['--headless=new', '--use-gl=angle', `--use-angle=${process.env.GPU ?? 'vulkan'}`, '--enable-gpu', '--ignore-gpu-blocklist'] });
const tag = `${process.env.SHOT_PREFIX ?? 'wx'}-${mode}-h${hour}`;
const diffFn = async ([a, b, y0f]) => {
  const load = async (u) => { const i = new Image(); i.src = u; await i.decode(); const c = new OffscreenCanvas(i.width, i.height); const g = c.getContext('2d'); g.drawImage(i, 0, 0); return g.getImageData(0, 0, i.width, i.height); };
  const A = await load(a), B = await load(b);
  let changed = 0, total = 0, sum = 0; const mA = [0, 0, 0], mB = [0, 0, 0];
  for (let y = Math.floor(A.height * y0f); y < A.height; y++) for (let x = 0; x < A.width; x++) {
    const i = (y * A.width + x) * 4; total++;
    const d = Math.abs(A.data[i] - B.data[i]) + Math.abs(A.data[i + 1] - B.data[i + 1]) + Math.abs(A.data[i + 2] - B.data[i + 2]);
    sum += d; if (d > 24) changed++;
    for (let k = 0; k < 3; k++) { mA[k] += A.data[i + k]; mB[k] += B.data[i + k]; }
  }
  return { changedPct: +((100 * changed) / total).toFixed(2), meanAbs: +(sum / total / 3).toFixed(2), meanA: mA.map((v) => +(v / total).toFixed(1)), meanB: mB.map((v) => +(v / total).toFixed(1)) };
};
const uri = (n) => `data:image/png;base64,${readFileSync(`shots/${tag}-${n}.png`).toString('base64')}`;
try {
  const ctx = await browser.newContext(mode === 'phone'
    ? { viewport: { width: 411, height: 777 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, userAgent: 'Mozilla/5.0 (Linux; Android 15; Pixel) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0 Mobile Safari/537.36' }
    : { viewport: { width: 1280, height: 800 } });
  const page = await ctx.newPage();
  page.on('pageerror', (e) => console.error('[pageerror]', e.message));
  await page.goto(`http://localhost:${PORT}/?nogui=1&hideui=1&speed=0&autoRotate=false&cinema=false&weather=calm&${query}`);
  await page.waitForFunction(() => window.__arbor !== undefined);
  const state = () => page.evaluate(() => {
    const a = window.__arbor, s = a.stage, su = s.atmo.sky.material.uniforms, U = s.atmo.skyUniforms, r = (v) => +v.toFixed(5);
    return { programs: s.renderer.info.programs.length, calls: s.renderer.info.render.calls, quality: a.params.sky.quality, leafMode: a.leaves.mode, phase: a.weather.phase,
      look: { exposure: r(s.renderer.toneMappingExposure), fogDensity: r(s.fog.density), fog: s.fog.color.toArray().map(r), sunI: r(s.sun.intensity), sun: s.sun.color.toArray().map(r), hemiI: r(s.hemi.intensity), hemi: s.hemi.color.toArray().map(r), hemiG: s.hemi.groundColor.toArray().map(r), env: r(s.scene.environmentIntensity), skyGain: r(U.skyGain.value), cloudCov: r(su.cloudCoverage.value), cloudDen: r(su.cloudDensity.value), windBase: r(a.wind.base), windStorm: r(a.wind.storm), decal: r(a.canopy.mesh.material.opacity), rainVisible: a.rain ? a.rain.sheets.filter((m) => m.visible).length : 0, boltVisible: !!a.rain?.bolt.visible } };
  });
  await page.evaluate((h) => { const a = window.__arbor; a.params.sky.timeOfDay = h; a.params.camera.autoFrame = true; a.fastForward(90); }, hour);
  await page.waitForTimeout(9000); // Low re-bakes the env map at most every 3 to 4 s: let the hour change settle first
  await page.screenshot({ path: `shots/${tag}-calm.png` });
  const s0 = await state();
  console.log('calm', JSON.stringify(s0));
  await page.evaluate(() => { const a = window.__arbor; a.params.weather.event = 'storm'; a.weather.snapStorm(); a.weather.nextStrike = 1e9; });
  await page.waitForTimeout(2500);
  await page.screenshot({ path: `shots/${tag}-storm-a.png` });
  await page.waitForTimeout(500);
  await page.screenshot({ path: `shots/${tag}-storm-b.png` });
  console.log('storm', JSON.stringify(await state()));
  console.log('storm motion, lower 40 % over 0.5 s:', JSON.stringify(await page.evaluate(diffFn, [uri('storm-a'), uri('storm-b'), 0.6])));
  await page.evaluate(() => { window.__arbor.weather.holdFlash = true; });
  await page.waitForTimeout(400);
  await page.screenshot({ path: `shots/${tag}-flash.png` });
  console.log('flash', JSON.stringify(await state()));
  await page.evaluate(() => { const a = window.__arbor; a.weather.holdFlash = false; a.params.weather.event = 'calm'; });
  await page.waitForTimeout(6000);
  await page.screenshot({ path: `shots/${tag}-clearing.png` });
  await page.waitForFunction(() => !window.__arbor.weather.storming, null, { timeout: 120000 });
  await page.waitForTimeout(2500);
  await page.screenshot({ path: `shots/${tag}-after.png` });
  const s1 = await state();
  console.log('after', JSON.stringify(s1));
  console.log('calm look restored exactly:', JSON.stringify(s0.look) === JSON.stringify(s1.look), 'programs calm/after:', s0.programs, s1.programs);
  console.log('calm vs after, whole frame:', JSON.stringify(await page.evaluate(diffFn, [uri('calm'), uri('after'), 0])));
} finally {
  await browser.close();
  vite.kill();
}

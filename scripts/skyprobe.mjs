// Sky numbers per quality path: uniforms, exposure and read-back pixels up the sky column at one hour.
// Usage: PROF_DIST=/tmp/dist PORT=5466 node scripts/skyprobe.mjs [hour=17.5] [query]
import { spawn } from 'node:child_process';
import { chromium } from 'playwright-core';
const PORT = Number(process.env.PORT ?? 5466), DIST = process.env.PROF_DIST ?? '/tmp/arbor-prof-dist';
const hour = Number(process.argv[2] ?? 17.5), only = process.env.ONLY, query = process.argv[3] ?? '';
const vite = spawn('npx', ['vite', 'preview', '--outDir', DIST, '--port', String(PORT), '--strictPort'], { stdio: ['ignore', 'pipe', 'inherit'] });
await new Promise((res) => vite.stdout.on('data', (d) => String(d).includes('Local') && res()));
const browser = await chromium.launch({ executablePath: '/usr/sbin/chromium', args: ['--headless=new', '--use-gl=angle', `--use-angle=${process.env.GPU ?? 'vulkan'}`, '--enable-gpu', '--ignore-gpu-blocklist'] });
const phone = { viewport: { width: 411, height: 777 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, userAgent: 'Mozilla/5.0 (Linux; Android 15; Pixel) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0 Mobile Safari/537.36' };
try {
  for (const [name, opt, q] of [['desk-High', { viewport: { width: 1280, height: 800 } }, ''], ['desk-Low', { viewport: { width: 1280, height: 800 } }, 'quality=Low'], ['phone', phone, '']]) {
    if (only && only !== name) continue;
    const ctx = await browser.newContext(opt), page = await ctx.newPage();
    await page.goto(`http://localhost:${PORT}/?cycle=false&nogui=1&hideui=1&speed=0&autoRotate=false&cinema=false&weather=calm&${q}&${query}`);
    await page.waitForFunction(() => window.__arbor !== undefined);
    await page.evaluate(() => window.__arbor.fastForward(90));
    const out = await page.evaluate(async (hour) => {
      const a = window.__arbor, k = a.params.sky, A = a.stage.atmo, st = a.stage;
      k.timeOfDay = hour; a.fastForward(0);
      const d = A.sunDir, n0 = a.sim.nodes[0], H = a.sim.bboxMax[1];
      a.params.camera.autoFrame = false; st.controls.maxPolarAngle = Math.PI;
      const az = Math.atan2(d.z, d.x) + Number(new URLSearchParams(location.search).get('az') ?? 0.2), D = H * 3, px = n0.wx - Math.cos(az) * D, pz = n0.wz - Math.sin(az) * D;
      st.camera.position.set(px, 1.7, pz);
      st.controls.target.set(px + Math.cos(az) * 9.8, 1.7 + 2, pz + Math.sin(az) * 9.8);
      a.fastForward(0);
      await new Promise((r) => setTimeout(r, 3000));
      const gl = st.renderer.getContext(), px4 = new Uint8Array(4), rows = {};
      const orig = st.render.bind(st);
      const gains = JSON.parse(new URLSearchParams(location.search).get('probe') ?? '[{}]'), sweep = {};
      for (const gv of gains) await new Promise((res) => { const gf = JSON.stringify(gv); st.render = (p) => { for (const [kk, v] of Object.entries(gv)) { if (kk === 'gain') A.skyUniforms.skyGain.value *= v; else if (kk === 'horizonK') A.skyUniforms.horizonK.value = v; else A.sky.material.uniforms[kk].value = v; } orig(p); const W = gl.drawingBufferWidth, Hh = gl.drawingBufferHeight; for (const f of [0.97, 0.85, 0.7, 0.6, 0.55]) { gl.readPixels((W * 0.5) | 0, (Hh * f) | 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, px4); rows[f] = [px4[0], px4[1], px4[2]]; } sweep[gf] = JSON.stringify(rows); st.render = orig; res(); }; });
      const u = A.sky.material.uniforms, U = A.skyUniforms, c = (v) => [v.r, v.g, v.b].map((x) => +x.toFixed(3));
      return { quality: k.quality, sunH: +A.sunH.toFixed(3), exposure: st.renderer.toneMappingExposure, toneMapping: st.renderer.toneMapping, skyGain: +U.skyGain.value.toFixed(3), kSkyGain: k.skyGain, kExposure: k.exposure, horizonK: U.horizonK.value, fogCol: c(U.fogCol.value), turbidity: u.turbidity.value, rayleigh: u.rayleigh.value, mie: u.mieCoefficient.value, cloudCov: u.cloudCoverage.value, envI: st.scene.environmentIntensity, pixelsUpScreen: sweep };
    }, hour);
    console.log(name, JSON.stringify(out));
    await ctx.close();
  }
} finally { await browser.close(); vite.kill(); }

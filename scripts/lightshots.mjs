// Light part 2 probes on the real GPU: moving sun flecks (frame burst + per-frame change of a ground patch under the
// crown) and the light inside the crown (director canopy / hero shot at 17:30 and in morning mist).
// Usage: node scripts/lightshots.mjs desk|phone prefix flecks|shafts[,..] URL   (server already running; THROTTLE, GPU)
// flecks: meadow, critters and falling leaves are off (they move in the wind themselves); camera above the shaded
// ground looking down. Prints mean |luminance step| per frame (0..255) of the patch for calm / breeze / gale / storm.
import { chromium } from 'playwright-core';
import { mkdirSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
const mode = process.argv[2] ?? 'desk', prefix = process.argv[3] ?? 'l2', what = (process.argv[4] ?? 'flecks,shafts').split(','), url = process.argv[5] ?? 'http://localhost:5900/';
mkdirSync('shots', { recursive: true });
const browser = await chromium.launch({ executablePath: '/usr/sbin/chromium', args: ['--headless=new', '--use-gl=angle', `--use-angle=${process.env.GPU ?? 'vulkan'}`, '--enable-gpu', '--ignore-gpu-blocklist'] });
const PHONE = { viewport: { width: 411, height: 777 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, userAgent: 'Mozilla/5.0 (Linux; Android 15; Pixel) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0 Mobile Safari/537.36' };
const open = async (q, t = 90) => {
  const ctx = await browser.newContext(mode === 'phone' ? PHONE : { viewport: { width: 1280, height: 800 } });
  const page = await ctx.newPage();
  page.on('pageerror', (e) => console.error('[pageerror]', e.message));
  if (process.env.THROTTLE) { const c = await ctx.newCDPSession(page); await c.send('Emulation.setCPUThrottlingRate', { rate: Number(process.env.THROTTLE) }); }
  await page.goto(`${url}?start=0&cycle=false&nogui=1&hideui=1&speed=0&autoRotate=false&season.on=false&${q}`);
  await page.waitForFunction(() => window.__arbor !== undefined);
  await page.evaluate((s) => window.__arbor.fastForward(s), t);
  return { ctx, page };
};
const sheet = (name, files, tile, geo) => { execFileSync('montage', [...files, '-tile', tile, '-geometry', geo, '-background', '#222', `shots/${name}.jpg`]); console.log(`shots/${name}.jpg`); };
try {
  if (what.includes('flecks')) {
    const files = [];
    for (const [name, q] of [['calm', 'sky.wind=0&weather=calm'], ['breeze', 'sky.wind=0.35&weather=calm'], ['gale', 'sky.wind=1&weather=calm'], ['storm', 'sky.wind=0.35&weather=storm']]) {
      const { ctx, page } = await open(`cinema=false&timeOfDay=14.5&meadow=0&critters=0&leaffall=0&${q}`);
      await page.evaluate(() => {
        const a = window.__arbor, n0 = a.sim.nodes[0], d = a.stage.atmo.sunDir, H = a.sim.bboxMax[1], hl = Math.hypot(d.x, d.z) || 1;
        // Shadow centre on the ground: the crown centre projected along the sun.
        const k = (0.6 * H) / Math.max(0.3, d.y), cx = n0.wx - d.x * k, cz = n0.wz - d.z * k;
        a.params.camera.autoFrame = false; a.stage.takeControl(); a.stage.controls.maxPolarAngle = Math.PI;
        a.stage.camera.position.set(cx - (d.x / hl) * 3.5, 3.2, cz - (d.z / hl) * 3.5);
        a.stage.controls.target.set(cx, 0, cz);
        a.fastForward(0);
      });
      await page.waitForTimeout(5000);
      const r = await page.evaluate(() => new Promise((res) => {
        const c = document.querySelector('canvas'), w = 96, h = 96, o = new OffscreenCanvas(w, h), g = o.getContext('2d', { willReadFrequently: true });
        let prev = null, n = 0, sum = 0, max = 0, mean = 0;
        const tick = () => {
          // The middle of the frame: ground in the crown shadow.
          g.drawImage(c, c.width * 0.3, c.height * 0.4, c.width * 0.4, c.height * 0.3, 0, 0, w, h);
          const px = g.getImageData(0, 0, w, h).data, L = new Float32Array(w * h);
          let m = 0;
          for (let i = 0; i < L.length; i++) { L[i] = 0.2126 * px[i * 4] + 0.7152 * px[i * 4 + 1] + 0.0722 * px[i * 4 + 2]; m += L[i]; }
          mean = m / L.length;
          if (prev) { let d = 0; for (let i = 0; i < L.length; i++) d += Math.abs(L[i] - prev[i]); d /= L.length; sum += d; if (d > max) max = d; n++; }
          prev = L;
          if (n < 90) requestAnimationFrame(tick); else { const a = window.__arbor; res({ step: +(sum / n).toFixed(3), max: +max.toFixed(3), patchLum: +mean.toFixed(1), wind: +a.wind?.base?.toFixed?.(2), programs: a.stage.renderer.info.programs.length, fe: a.frameErrors() }); }
        };
        requestAnimationFrame(tick);
      }));
      console.log(mode, 'flecks', name, JSON.stringify(r));
      for (let i = 0; i < 6; i++) { const f = `shots/${prefix}-${mode}-flecks-${name}-${i}.png`; await page.screenshot({ path: f }); files.push(f); await page.waitForTimeout(250); }
      await ctx.close();
    }
    sheet(`${prefix}-${mode}-flecks-sheet`, files, '6x4', mode === 'phone' ? '206x389+2+2' : '320x200+2+2');
  }
  if (what.includes('shafts')) {
    const files = [];
    for (const [name, q, kind] of [['canopy1730', 'timeOfDay=17.5&weather=calm', 'canopy'], ['hero1730', 'timeOfDay=17.5&weather=calm', 'hero'], ['canopymist', 'timeOfDay=7&weather=auto&weather.kind=mist', 'canopy'], ['heromist', 'timeOfDay=7&weather=auto&weather.kind=mist', 'hero']]) {
      const { ctx, page } = await open(`cinema=true&${q}`);
      await page.waitForTimeout(1500);
      const st = await page.evaluate(([k, mist]) => {
        const A = window.__arbor, D = A.stage.director, d = A.stage.atmo.sunDir;
        if (mist) A.weather.snap('mist');
        D.go(k, true); A.fastForward(0);
        // Turn the shot so it looks toward the sun (canopy: camera on the far side of the trunk from the sun).
        if (D.shot && 'yaw' in D.shot) D.shot.yaw = Math.atan2(-d.x, -d.z) + (k === 'canopy' ? 0 : 0.3);
        D.shot.t = D.shot.dur * 0.4; A.fastForward(0);
        return { ...D.state(), haze: A.weather.haze, sunH: +d.y.toFixed(2) };
      }, [kind, name.endsWith('mist')]);
      await page.waitForTimeout(5000);
      const f = `shots/${prefix}-${mode}-shafts-${name}.png`;
      await page.screenshot({ path: f }); files.push(f);
      console.log(mode, 'shafts', name, JSON.stringify({ ...st, ...(await page.evaluate(() => { const a = window.__arbor; return { programs: a.stage.renderer.info.programs.length, fe: a.frameErrors() }; })) }));
      await ctx.close();
    }
    sheet(`${prefix}-${mode}-shafts-sheet`, files, '4x1', mode === 'phone' ? '300x567+2+2' : '480x300+2+2');
  }
} finally { await browser.close(); }

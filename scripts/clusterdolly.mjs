// Cluster cards (P8) dolly: year-3 tree on the phone path, camera moves in a straight line from inside the crown
// edge to 2.4 crown heights out over DUR s while the app runs; a shot every STEP s + per-shot single / cluster counts.
// Usage: PORT=5791 node scripts/clusterdolly.mjs URL prefix   (URL = a built app being served)
import { chromium } from 'playwright-core';
const [url, prefix = 'cdolly'] = process.argv.slice(2), E = process.env, DUR = Number(E.DUR ?? 14), STEP = Number(E.STEP ?? 1.75);
const browser = await chromium.launch({ executablePath: '/usr/sbin/chromium', args: ['--headless=new', '--use-gl=angle', '--use-angle=vulkan', '--enable-gpu', '--ignore-gpu-blocklist'] });
try {
  const ctx = await browser.newContext({ viewport: { width: 411, height: 777 }, deviceScaleFactor: 2.625, isMobile: true, hasTouch: true, userAgent: 'Mozilla/5.0 (Linux; Android 15; Pixel) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0 Mobile Safari/537.36' });
  const page = await ctx.newPage();
  page.on('pageerror', (e) => console.error('[pageerror]', e.message));
  await page.goto(`${url}?start=0&nogui=1&hideui=1&autoRotate=false&cinema=false&weather=calm&timeOfDay=13&cycle=false&season.date=0.3&season.hold=true&years=3${E.EXTRA ?? ''}`);
  await page.waitForFunction(() => window.__arbor !== undefined);
  await page.evaluate(() => { const a = window.__arbor; a.fastForward(750); a.params.time.paused = true; a.params.camera.autoFrame = false; a.stage.takeControl?.(); });
  const H = await page.evaluate(() => window.__arbor.sim.bboxMax[1]);
  const rows = [];
  const t0 = Date.now();
  let shot = 0;
  await page.evaluate(([H, DUR]) => {
    const a = window.__arbor, t0 = performance.now();
    const go = () => { const u = Math.min(1, (performance.now() - t0) / 1000 / DUR), d = H * (0.35 + 2.05 * u);
      a.stage.controls.target.set(0, H * 0.55, 0); a.stage.camera.position.set(d * 0.8, H * 0.45 + d * 0.12, d * 0.6); a.stage.controls.update?.();
      if (u < 1) requestAnimationFrame(go); };
    go();
  }, [H, DUR]);
  while (Date.now() - t0 < DUR * 1000 + 500) {
    await page.waitForTimeout(STEP * 1000);
    await page.screenshot({ path: `shots/${prefix}-${String(shot).padStart(2, '0')}.png` });
    rows.push(await page.evaluate(() => { const L = window.__arbor.leaves; return { singles: L.nS, clusters: L.nAll - L.nS, K: +L.clK.toFixed(2), active: L.clusterActive, passes: L.passes }; }));
    shot++;
  }
  console.log(JSON.stringify({ H, rows }));
} finally { await browser.close(); }

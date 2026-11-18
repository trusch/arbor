// Season flush vs summer leaf colour on the phone path, like for like: the smoke scrub reading (auto camera) and the
// same stations under one fixed hand-set camera. Usage: node scripts/flushprobe.mjs URL [label]  (GPU env, default vulkan)
import { chromium } from 'playwright-core';
const url = process.argv[2], label = process.argv[3] ?? '';
const GPU = process.env.GPU ?? 'vulkan';
const browser = await chromium.launch({ executablePath: '/usr/sbin/chromium', args: ['--headless=new', '--use-gl=angle', `--use-angle=${GPU}`, '--enable-gpu', '--ignore-gpu-blocklist'] });
const read = (pg) => pg.evaluate(() => {
  const A = window.__arbor, n = A.leaves.mesh.count, c = A.leaves.mesh.instanceColor.array, m = A.leaves.mesh.instanceMatrix.array, D = A.leaves.frontD, now = A.sim.time;
  let r = 0, g = 0, b = 0, kc = 0;
  for (let i = 0; i < n; i++) { const o = i * 16; if (m[o + 4] ** 2 + m[o + 5] ** 2 + m[o + 6] ** 2 < 1e-8) continue; if (now - D[i * 11 + 8] < 6) continue; r += c[i * 3]; g += c[i * 3 + 1]; b += c[i * 3 + 2]; kc++; }
  const p = A.stage.camera.position;
  return { n: kc, rg: +(r / g).toFixed(3), gb: +(g / b).toFixed(3), lum: +((r + g + b) / kc).toFixed(3), cam: [p.x, p.y, p.z].map((v) => +v.toFixed(1)).join(',') };
});
for (const fixed of [false, true]) {
  const ctx = await browser.newContext({ viewport: { width: 412, height: 915 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true, userAgent: 'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Mobile Safari/537.36' });
  const mp = await ctx.newPage();
  await mp.goto(url + '?cycle=false&speed=0&weather=calm', { waitUntil: 'domcontentloaded' });
  await mp.waitForFunction(() => window.__arbor !== undefined);
  await mp.evaluate(() => { const A = window.__arbor; A.params.sky.timeOfDay = 13; A.fastForward(60); });
  await mp.waitForTimeout(8000);
  if (fixed) await mp.evaluate(() => { const S = window.__arbor.stage; S.takeControl(); S.camera.position.set(14, 4, 14); S.controls.target.set(0, 4.5, 0); });
  const out = [];
  for (const [name, d] of [['flush', 0.045], ['summer', 0.38], ['flush2', 0.045], ['summer2', 0.38]]) {
    await mp.evaluate((dd) => { const A = window.__arbor; window.__p0 = A.leaves.passes; A.automation.userSet('season.hold', true); A.automation.userSet('season.date', dd); }, d);
    await mp.waitForTimeout(600);
    await mp.waitForFunction(() => window.__arbor.leaves.passes >= window.__p0 + 1 && !window.__arbor.leaves.passOpen, null, { timeout: 30000 });
    await mp.waitForTimeout(900);
    out.push(name + ' ' + JSON.stringify(await read(mp)));
  }
  console.log(`${label} ${fixed ? 'FIXED camera' : 'auto camera'}\n  ` + out.join('\n  '));
  await ctx.close();
}
await browser.close();

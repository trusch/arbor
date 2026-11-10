// Interaction smoke test in headless chromium (SwiftShader).
// Usage: node scripts/smoke.mjs [url]   (default: the deployed app http://10.77.0.2:8050/; pass "dev" to start vite)
// Checks: no console errors, preset dropdown, drift, journey keyframes + interpolation, H/C keys, cinema camera motion.
import { spawn } from 'node:child_process';
import { chromium } from 'playwright-core';

let url = process.argv[2] ?? 'http://10.77.0.2:8050/';
let vite;
if (url === 'dev') {
  const PORT = Number(process.env.PORT ?? 5198);
  vite = spawn('npx', ['vite', '--port', String(PORT), '--strictPort'], { stdio: ['ignore', 'pipe', 'inherit'] });
  await new Promise((res) => vite.stdout.on('data', (d) => String(d).includes('Local') && res()));
  url = `http://localhost:${PORT}/`;
}

const results = [];
const check = (name, ok, detail = '') => { results.push({ name, ok }); console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? '  ' + detail : ''}`); };
const errors = [];

const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM ?? '/usr/sbin/chromium',
  args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'],
});
try {
  const page = await browser.newPage({ viewport: { width: 1024, height: 640 } });
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  page.on('pageerror', (e) => errors.push(e.message));
  // Low quality keeps SwiftShader frame times sane; the app path under test is the same.
  await page.goto(`${url}?quality=Low`);
  await page.waitForFunction(() => window.__arbor !== undefined, null, { timeout: 30000 });
  await page.waitForTimeout(1500);
  check('loads without console errors', errors.length === 0, errors.slice(0, 3).join(' | '));

  // Presets via the GUI dropdown (first <select> in the panel).
  const sel = page.locator('.lil-gui select').first();
  const names = await sel.locator('option').allTextContents();
  check('preset dropdown lists presets', names.length >= 8, `${names.length} options`);
  for (const n of names) {
    const before = errors.length;
    await sel.selectOption({ label: n });
    const info = await page.evaluate(() => window.__arbor.fastForward(12));
    const ov = await page.evaluate(() => ({ g: window.__arbor.params.growth.gravity, sim: window.__arbor.sim.time }));
    check(`preset "${n}" grows`, info.nodes > 5 && errors.length === before && ov.sim < 20, `nodes=${info.nodes} t=${ov.sim.toFixed(1)} gravity=${ov.g.toFixed(2)}`);
  }
  await sel.selectOption({ label: 'Oak meadow' });

  // Drift on gravity (default selected drift param) via the GUI checkbox.
  const driftBox = page.locator('.lil-gui .lil-controller', { hasText: 'drift this param' }).locator('input[type=checkbox]');
  await page.evaluate(() => { window.__arbor.params.growth.gravity = 1; });
  await driftBox.check();
  // Fast rate so a few sim seconds show movement.
  await page.evaluate(() => { window.__arbor.automation.drift['growth.gravity'].rate = 0.2; });
  const gs = [];
  for (let i = 0; i < 6; i++) gs.push(await page.evaluate(() => { window.__arbor.fastForward(1.5); return window.__arbor.params.growth.gravity; }));
  const spread = Math.max(...gs) - Math.min(...gs);
  check('drift moves gravity over time', spread > 0.02, gs.map((g) => g.toFixed(3)).join(','));
  await driftBox.uncheck();
  const gOff = await page.evaluate(() => window.__arbor.params.growth.gravity);
  check('drift off restores base', Math.abs(gOff - 1) < 1e-6, `gravity=${gOff}`);

  // Journey: two keyframes via the GUI button, then interpolation.
  const addKf = page.locator('.lil-gui button', { hasText: 'Add keyframe (now)' });
  await page.locator('.lil-gui button', { hasText: 'Clear journey' }).click();
  await page.evaluate(() => { window.__arbor.params.growth.gravity = 1; window.__arbor.params.leaves.hue = 0.3; });
  await addKf.click();
  await page.evaluate(() => { window.__arbor.fastForward(10); window.__arbor.params.growth.gravity = 0.2; window.__arbor.params.leaves.hue = 0.9; });
  await addKf.click();
  const kfInfo = await page.locator('.lil-gui .lil-controller', { hasText: 'keyframes' }).locator('input').inputValue();
  const jr = await page.evaluate(() => {
    const A = window.__arbor.automation, P = window.__arbor.params;
    const [a, b] = A.journey.map((k) => k.t); // keyframe times as recorded (the sim keeps growing in real time)
    const at = (t) => { A.apply(t); return P.growth.gravity; };
    return { n: A.journey.length, start: at(a), mid: at((a + b) / 2), end: at(b), after: at(b + 50) };
  });
  check('two keyframes recorded', jr.n === 2, `gui="${kfInfo}"`);
  check('journey interpolates', Math.abs(jr.start - 1) < 1e-6 && Math.abs(jr.mid - 0.6) < 1e-3 && Math.abs(jr.end - 0.2) < 1e-6 && Math.abs(jr.after - 0.2) < 1e-6,
    `start=${jr.start.toFixed(3)} mid=${jr.mid.toFixed(3)} end=${jr.end.toFixed(3)} after=${jr.after.toFixed(3)}`);
  await page.locator('.lil-gui button', { hasText: 'Clear journey' }).click();

  // Keys: H hides UI, C toggles cinema (focus is still on a GUI button: keys must work there too).
  await page.keyboard.press('h');
  const hidden = await page.evaluate(() => document.body.classList.contains('watch') && getComputedStyle(document.querySelector('.lil-gui')).display === 'none');
  await page.keyboard.press('h');
  const shown = await page.evaluate(() => !document.body.classList.contains('watch'));
  check('H hides and restores UI', hidden && shown);
  const c0 = await page.evaluate(() => window.__arbor.params.camera.cinema);
  await page.keyboard.press('c');
  const c1 = await page.evaluate(() => window.__arbor.params.camera.cinema);
  await page.keyboard.press('c');
  const c2 = await page.evaluate(() => window.__arbor.params.camera.cinema);
  check('C toggles cinema', c0 === true && c1 === false && c2 === true);

  // Cinema camera moves while idle (real frames, ~3 s).
  const p0 = await page.evaluate(() => window.__arbor.stage.camera.position.toArray());
  await page.waitForTimeout(3000);
  const p1 = await page.evaluate(() => window.__arbor.stage.camera.position.toArray());
  const moved = Math.hypot(p1[0] - p0[0], p1[1] - p0[1], p1[2] - p0[2]);
  check('cinema camera moves while idle', moved > 0.02, `moved ${moved.toFixed(3)} m`);

  // Tree stays in view: crown bounding sphere inside the frustum.
  const inView = await page.evaluate(() => {
    const { sim, stage } = window.__arbor;
    window.__arbor.fastForward(60);
    const cam = stage.camera; cam.updateMatrixWorld();
    const mn = sim.bboxMin, mx = sim.bboxMax;
    let ok = 0;
    const V = cam.position.constructor;
    for (const x of [mn[0], mx[0]]) for (const y of [mn[1], mx[1]]) for (const z of [mn[2], mx[2]]) {
      const v = new V(x, y, z).project(cam);
      if (Math.abs(v.x) <= 1.05 && Math.abs(v.y) <= 1.05) ok++;
    }
    return ok;
  });
  check('auto-frame keeps crown bbox in view', inView === 8, `${inView}/8 corners`);

  check('no console errors overall', errors.length === 0, errors.slice(0, 3).join(' | '));
} finally {
  await browser.close();
  vite?.kill();
}
const failed = results.filter((r) => !r.ok).length;
console.log(`\n${results.length - failed}/${results.length} passed`);
process.exit(failed ? 1 : 0);

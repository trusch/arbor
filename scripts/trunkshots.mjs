// Trunk orbit + junction close-up contact sheets (trunkfix). Real GPU (GPU env, default vulkan).
// Usage: node scripts/trunkshots.mjs <tag> [cases] ; PORT env (5860+).
// cases: comma list of mode:t:hour:kind[:probe[:dist]]  mode=phone|desk, kind=orbit|junc|sap, probe=none|double|noshadow|noao|sway0|storm|move
import { spawn, execFileSync } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { chromium } from 'playwright-core';

const tag = process.argv[2] ?? 'before';
const cases = (process.argv[3] ?? 'phone:90:13:orbit,desk:90:13:orbit').split(',').map((s) => {
  const [mode, t, hour, kind, probe = 'none', dist = '2.5'] = s.split(':');
  return { mode, t: Number(t), hour: Number(hour), kind, probe, dist: Number(dist) };
});
const PORT = Number(process.env.PORT ?? 5860);
const TMP = `/tmp/trunkshots-${tag}`;
mkdirSync(TMP, { recursive: true });
mkdirSync('shots', { recursive: true });
const vite = spawn('npx', ['vite', '--port', String(PORT), '--strictPort'], { stdio: ['ignore', 'pipe', 'inherit'] });
await new Promise((res) => vite.stdout.on('data', (d) => String(d).includes('Local') && res()));
const browser = await chromium.launch({ executablePath: '/usr/sbin/chromium', args: ['--headless=new', '--use-gl=angle', `--use-angle=${process.env.GPU ?? 'vulkan'}`, '--enable-gpu', '--ignore-gpu-blocklist'] });
const settle = async (page, ms = 450) => { await page.evaluate(() => window.__arbor.fastForward(0)); await page.waitForTimeout(ms); };
try {
  for (const cs of cases) {
    const phone = cs.mode === 'phone';
    const ctx = await browser.newContext(phone ? {
      viewport: { width: 411, height: 777 }, deviceScaleFactor: 1, isMobile: true, hasTouch: true,
      userAgent: 'Mozilla/5.0 (Linux; Android 15; Pixel) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0 Mobile Safari/537.36',
    } : { viewport: { width: 800, height: 600 } });
    const page = await ctx.newPage();
    page.setDefaultTimeout(180000);
    page.on('pageerror', (e) => console.error('[pageerror]', e.message));
    const still = cs.probe === 'storm' || cs.probe === 'move' ? '' : '&sway=0';
    await page.goto(`http://localhost:${PORT}/?cycle=false&nogui=1&hideui=1&speed=0&autoRotate=false&cinema=false${phone ? '' : '&quality=High'}${cs.probe === 'sway0' ? '&sway=0' : still}`);
    await page.waitForFunction(() => window.__arbor !== undefined);
    await page.evaluate(([t, h]) => { const A = window.__arbor; A.params.sky.timeOfDay = h; A.params.camera.autoFrame = false; return A.fastForward(t); }, [cs.t, cs.hour]);
    await page.evaluate((probe) => {
      const A = window.__arbor, m = A.branches.mesh.material;
      if (probe === 'double') { m.side = 2; m.needsUpdate = true; }
      if (probe === 'noshadow') { A.branches.mesh.receiveShadow = false; m.needsUpdate = true; A.stage.renderer.shadowMap.enabled = false; }
      if (probe === 'noao' && A.stage.post?.gtao) A.stage.post.gtao.enabled = false;
      if (probe === 'storm') { try { A.wind.base = 14; A.wind.gust = 1; } catch {} if (A.params.wind) { A.params.wind.speed = 14; } }
    }, cs.probe);
    const name = `${cs.mode}-t${cs.t}-h${cs.hour}-${cs.kind}-${cs.probe}`;
    const files = [];
    const shot = async (label) => { const f = `${TMP}/${name}-${label}.png`; await page.screenshot({ path: f }); files.push(f); };
    if (cs.kind === 'orbit' || cs.kind === 'sap') {
      const steps = cs.kind === 'sap' ? 6 : 12;
      for (let i = 0; i < steps; i++) {
        const a = (i / steps) * Math.PI * 2;
        await page.evaluate(([a, dist, sap]) => {
          const A = window.__arbor, n0 = A.sim.nodes[0];
          const y = sap ? Math.max(0.3, A.sim.bboxMax[1] * 0.4) : 1.5;
          A.stage.controls.target.set(n0.wx, n0.wy + y, n0.wz);
          A.stage.camera.position.set(n0.wx + Math.cos(a) * dist, n0.wy + y + 0.1, n0.wz + Math.sin(a) * dist);
          A.stage.controls.update();
        }, [a, cs.dist, cs.kind === 'sap']);
        if (cs.probe === 'move' || cs.probe === 'storm') await page.waitForTimeout(120); else await settle(page);
        await shot(String(Math.round(a * 180 / Math.PI)).padStart(3, '0'));
      }
    } else {
      const n = await page.evaluate(() => {
        const A = window.__arbor, s = A.sim, trunk = new Set(s.chains[0].nodes);
        const js = [];
        for (let c = 1; c < s.chains.length; c++) {
          const ch = s.chains[c];
          if (ch.pruned || ch.nodes.length < 3 || !trunk.has(ch.nodes[0])) continue;
          const a = s.nodes[ch.nodes[0]], b = s.nodes[ch.nodes[1]], e = s.nodes[ch.nodes[2]];
          js.push({ r: b.radius, J: [a.wx, a.wy, a.wz], d: [e.wx - a.wx, e.wy - a.wy, e.wz - a.wz], pr: a.radius });
        }
        js.sort((x, y) => y.r - x.r);
        window.__junc = js.slice(0, 6);
        return window.__junc.length;
      });
      for (let i = 0; i < n; i++) for (const view of ['side', 'far', 'below']) {
        await page.evaluate(([i, view]) => {
          const A = window.__arbor, j = window.__junc[i];
          const hl = Math.hypot(j.d[0], j.d[2]) || 1, dx = j.d[0] / hl, dz = j.d[2] / hl;
          const D = 0.35 + j.pr * 5;
          let px, py, pz;
          if (view === 'side') { px = -dz * D + dx * D * 0.3; pz = dx * D + dz * D * 0.3; py = D * 0.15; }
          else if (view === 'far') { px = -dx * D * 0.8 + dz * D * 0.6; pz = -dz * D * 0.8 - dx * D * 0.6; py = D * 0.2; }
          else { px = dx * D * 0.7 - dz * D * 0.4; pz = dz * D * 0.7 + dx * D * 0.4; py = -D * 0.6; }
          A.stage.controls.target.set(j.J[0], j.J[1], j.J[2]);
          A.stage.camera.position.set(j.J[0] + px, j.J[1] + py, j.J[2] + pz);
          A.stage.controls.update();
        }, [i, view]);
        if (cs.probe === 'storm') await page.waitForTimeout(150); else await settle(page);
        await shot(`j${i}-${view}`);
      }
    }
    const info = await page.evaluate(() => { const A = window.__arbor, r = A.stage.renderer; return { q: A.params.sky.quality, programs: r.info.programs.length, tris: A.branches.mesh.geometry.drawRange.count / 3, side: A.branches.mesh.material.side }; });
    console.log(name, JSON.stringify(info));
    const out = `shots/trunkfix-${tag}-${name}.jpg`;
    execFileSync('montage', [...files, '-tile', cs.kind === 'junc' ? '6x' : phone ? '6x' : '4x', '-geometry', phone ? '274x518+2+2' : '400x300+2+2', '-quality', '82', out]);
    console.log(out);
    await ctx.close();
  }
} finally { await browser.close(); vite.kill(); }

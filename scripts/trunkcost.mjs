// Cost of the branch rebuild and of applyOffsets, before (git ref REF, default main) vs working tree, alternating
// in ONE page (phone emulation, CPU throttle THROTTLE=4). Usage: PORT=5862 node scripts/trunkcost.mjs [t=90]
import { spawn, execFileSync } from 'node:child_process';
import { writeFileSync, rmSync } from 'node:fs';
import { chromium } from 'playwright-core';
const t = Number(process.argv[2] ?? 90), PORT = Number(process.env.PORT ?? 5862), REF = process.env.REF ?? 'main';
const tmp = 'scripts/_branchMesh.before.ts';
writeFileSync(tmp, execFileSync('git', ['show', `${REF}:src/render/branchMesh.ts`]).toString().replaceAll("'../tel'", "'../src/tel'").replaceAll("'../sim/tree'", "'../src/sim/tree'").replaceAll("'./textures'", "'../src/render/textures'"));
const vite = spawn('npx', ['vite', '--port', String(PORT), '--strictPort'], { stdio: ['ignore', 'pipe', 'inherit'] });
await new Promise((res) => vite.stdout.on('data', (d) => String(d).includes('Local') && res()));
const browser = await chromium.launch({ executablePath: '/usr/sbin/chromium', args: ['--headless=new', '--use-gl=angle', `--use-angle=${process.env.GPU ?? 'vulkan'}`, '--enable-gpu', '--ignore-gpu-blocklist'] });
try {
  const ctx = await browser.newContext({ viewport: { width: 411, height: 777 }, deviceScaleFactor: 1, isMobile: true, hasTouch: true, userAgent: 'Mozilla/5.0 (Linux; Android 15; Pixel) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0 Mobile Safari/537.36' });
  const page = await ctx.newPage();
  page.setDefaultTimeout(240000);
  page.on('pageerror', (e) => console.error('[pageerror]', e.message));
  await page.goto(`http://localhost:${PORT}/?cycle=false&nogui=1&hideui=1&speed=0&autoRotate=false&cinema=false&weather=calm`);
  await page.waitForFunction(() => window.__arbor !== undefined);
  await page.evaluate((t) => window.__arbor.fastForward(t), t);
  await page.waitForTimeout(6000);
  const programs = await page.evaluate(() => window.__arbor.stage.renderer.info.programs.length);
  const cdp = await ctx.newCDPSession(page);
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: Number(process.env.THROTTLE ?? 4) });
  const res = await page.evaluate(async () => {
    const A = window.__arbor;
    const before = (await import('/scripts/_branchMesh.before.ts')).BranchMesh, after = (await import('/src/render/branchMesh.ts?cost=1')).BranchMesh;
    const mat = A.branches.mesh.material;
    const ms = { before: new before(mat), after: new after(mat) };
    const D = new Float32Array(A.sim.nodes.length * 3);
    const out = { before: { upd: [], off: [] }, after: { upd: [], off: [] } };
    const med = (a) => a.sort((x, y) => x - y)[a.length >> 1];
    for (let i = 0; i < 24; i++) for (const k of i % 2 ? ['before', 'after'] : ['after', 'before']) {
      let t0 = performance.now(); ms[k].update(A.sim, 1); out[k].upd.push(performance.now() - t0);
      t0 = performance.now(); for (let q = 0; q < 10; q++) ms[k].applyOffsets(D); out[k].off.push((performance.now() - t0) / 10);
    }
    const r = {};
    for (const k of ['before', 'after']) r[k] = { updateMs: +med(out[k].upd).toFixed(2), applyOffsetsMs: +med(out[k].off).toFixed(3), tris: ms[k].mesh.geometry.drawRange.count / 3, verts: ms[k].vUsed };
    // Zero offsets = exactly the rest pose.
    const m = ms.after; let diff = 0; for (let i = 0; i < m.vUsed * 3; i++) diff = Math.max(diff, Math.abs(m.pos[i] - m.rest[i]));
    r.restDiff = diff;
    return r;
  });
  console.log(JSON.stringify({ t, programs, ...res }));
} finally { await browser.close(); vite.kill(); rmSync(tmp); }

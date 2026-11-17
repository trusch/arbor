// P3 gate: branch mesh chain ranges equal a full rebuild. Grows the tree step by step with an incremental
// `branches.update` after every step (and wind offsets applied every 5th), then (1) `rebuildCheck` = every chain
// rewritten in place, buffers compared bit by bit, (2) the drawn triangle soup compared with a fresh BranchMesh.
// Usage: PROF_DIST=dir PORT=5722 CASES='oak:0:60,y3:600:60' node scripts/p3check.mjs   (name:fastForward s:grow s)
import { spawn } from 'node:child_process';
import { chromium } from 'playwright-core';
const E = process.env, PORT = Number(E.PORT ?? 5722), DIST = E.PROF_DIST ?? '/tmp/arbor-bg-dist';
const CASES = (E.CASES ?? 'oak:0:60,y3:600:60').split(',').map((s) => { const [n, ff, g] = s.split(':'); return { n, ff: +ff, g: +g }; });
const vite = spawn('npx', ['vite', 'preview', '--outDir', DIST, '--port', String(PORT), '--strictPort'], { stdio: ['ignore', 'pipe', 'inherit'] });
await new Promise((res) => vite.stdout.on('data', (d) => String(d).includes('Local') && res()));
const browser = await chromium.launch({ executablePath: '/usr/sbin/chromium', args: ['--headless=new', '--use-gl=angle', `--use-angle=${E.GPU ?? 'vulkan'}`, '--enable-gpu', '--ignore-gpu-blocklist'] });
let bad = 0;
try {
  for (const c of CASES) {
    const page = await (await browser.newContext({ viewport: { width: 800, height: 600 } })).newPage();
    page.on('pageerror', (e) => console.error('[pageerror]', e.message));
    const q = c.n.startsWith('y') ? '&years=3' : '';
    await page.goto(`http://localhost:${PORT}/?start=0&nogui=1&speed=0&cinema=false&weather=calm&timeOfDay=13&cycle=false&season.on=false${q}`);
    await page.waitForFunction(() => window.__arbor !== undefined);
    const r = await page.evaluate(async ({ ff, g }) => {
      const a = window.__arbor, s = a.sim, b = a.branches, fl = a.params.thickness.rootFlare;
      a.params.time.paused = true;
      if (ff) a.fastForward(ff);
      b.update(s, fl);
      const D = new Float32Array(s.nodes.length * 3 + 3 * 200000);
      let layouts = 0, written = 0, chains = 0, ms = 0, n = 0;
      for (let i = 0; i < g * 60; i++) {
        s.step(1 / 60);
        if (i % 7 === 0) s.flushStructure();
        const t = performance.now(); b.update(s, fl); ms += performance.now() - t; n++;
        layouts += b.stats.layout ? 1 : 0; written += b.stats.written; chains += b.stats.chains;
        if (i % 5 === 0) { for (let k = 0; k < D.length; k++) D[k] = Math.sin(k * 0.37 + i) * 0.05; b.applyOffsets(D); }
        if (i % 600 === 0) await new Promise((r) => setTimeout(r, 0));
      }
      s.flushStructure(); b.update(s, fl);
      const chk = b.rebuildCheck(s, fl);
      const fresh = new b.constructor(b.mesh.material); fresh.update(s, fl);
      const A = b.triangleSoup(), B = fresh.triangleSoup();
      let soupDiff = A.length === B.length ? 0 : -1;
      if (soupDiff === 0) for (let i = 0; i < A.length; i++) if (!Object.is(A[i], B[i])) soupDiff++;
      return { t: +s.time.toFixed(1), nodes: s.nodes.length, chk, soupFloats: A.length, soupDiff, layouts, meanWrittenChains: +(written / n).toFixed(1), meanChains: +(chains / n).toFixed(1), msPerUpdate: +(ms / n).toFixed(3) };
    }, c);
    const ok = r.chk.pos === 0 && r.chk.nrm === 0 && r.chk.uv === 0 && r.chk.idx === 0 && r.chk.rest === 0 && r.soupDiff === 0;
    if (!ok) bad++;
    console.log(JSON.stringify({ case: c.n, ok, ...r }));
    await page.close();
  }
} finally { await browser.close(); vite.kill(); }
process.exit(bad ? 1 : 0);

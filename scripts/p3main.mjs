// Default tree draw equality across builds: grows the default oak step by step with a branch update per step and
// prints a hash of the drawn triangles (position, normal, uv per corner, index order, degenerate slots skipped)
// read from the live geometry. Run once per build (PROF_DIST) and compare. Usage: PROF_DIST=dir PORT=5726 GROW=60 node scripts/p3main.mjs
import { spawn } from 'node:child_process';
import { chromium } from 'playwright-core';
const E = process.env, PORT = Number(E.PORT ?? 5726), DIST = E.PROF_DIST ?? '/tmp/arbor-bg-dist';
const vite = spawn('npx', ['vite', 'preview', '--outDir', DIST, '--port', String(PORT), '--strictPort'], { stdio: ['ignore', 'pipe', 'inherit'] });
await new Promise((res) => vite.stdout.on('data', (d) => String(d).includes('Local') && res()));
const browser = await chromium.launch({ executablePath: '/usr/sbin/chromium', args: ['--headless=new', '--use-gl=angle', '--use-angle=vulkan', '--enable-gpu', '--ignore-gpu-blocklist'] });
try {
  const page = await (await browser.newContext({ viewport: { width: 800, height: 600 } })).newPage();
  await page.goto(`http://localhost:${PORT}/?start=0&nogui=1&speed=0&cinema=false&weather=calm&timeOfDay=13&cycle=false&season.on=false${E.Q ?? ''}`);
  await page.waitForFunction(() => window.__arbor !== undefined);
  const r = await page.evaluate(async (g) => {
    const a = window.__arbor, s = a.sim, b = a.branches, fl = a.params.thickness.rootFlare;
    a.params.time.paused = true;
    const out = [];
    for (let i = 0; i < g * 60; i++) {
      s.step(1 / 60); b.update(s, fl);
      if (i % 600 === 599) {
        const geo = b.mesh.geometry, I = geo.index.array, P = geo.attributes.position.array, N = geo.attributes.normal.array, U = geo.attributes.uv.array;
        const n = geo.drawRange.count;
        let h = 0, acc = 0, tris = 0; const f = new Float32Array(1), u = new Uint32Array(f.buffer);
        const mix = (x) => { f[0] = x; h = Math.imul(h ^ u[0], 16777619) >>> 0; };
        for (let k = 0; k < n; k += 3) {
          if (I[k] === I[k + 1] && I[k] === I[k + 2]) continue;
          tris++; h = 2166136261 >>> 0;
          for (let j = 0; j < 3; j++) { const v = I[k + j]; mix(P[v * 3]); mix(P[v * 3 + 1]); mix(P[v * 3 + 2]); mix(N[v * 3]); mix(N[v * 3 + 1]); mix(N[v * 3 + 2]); mix(U[v * 2]); mix(U[v * 2 + 1]); }
          acc = (acc + Math.imul(h, 2654435761)) >>> 0;
        }
        out.push({ t: +s.time.toFixed(1), tris, hash: acc.toString(16) });
        await new Promise((r) => setTimeout(r, 0));
      }
    }
    return out;
  }, Number(E.GROW ?? 60));
  console.log(JSON.stringify(r));
} finally { await browser.close(); vite.kill(); }

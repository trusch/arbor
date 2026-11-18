// Crown cleft census, headless (node): top-down leaf reach by azimuth sector, and the side silhouette (top outline of
// the leaf mass) from 8 compass directions with its deepest notch below the upper convex hull.
// Usage: node scripts/cleft.mjs [query]   T=750 YEARS=3 SEED=7 HZ=30 CHECK=1 MAP=1
import { execSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
const root = resolve(import.meta.dirname, '..'), tmp = `/tmp/arbor-cleft-${process.pid}`;
mkdirSync(tmp, { recursive: true });
writeFileSync(`${tmp}/e.ts`, `export { TreeSim } from '${root}/src/sim/tree';\nexport { defaultParams, applyQueryOverrides } from '${root}/src/params';\n`);
execSync(`${root}/node_modules/.bin/rolldown ${tmp}/e.ts --file ${tmp}/b.mjs --format esm`, { stdio: ['ignore', 'ignore', 'inherit'] });
if (process.env.G) Object.assign(globalThis, JSON.parse(process.env.G));
const B = await import(`${tmp}/b.mjs`);
const T = Number(process.env.T ?? 750), HZ = Number(process.env.HZ ?? 30);
const p = B.defaultParams();
if (process.argv[2]) B.applyQueryOverrides(p, process.argv[2]);
p.seed.seed = Number(process.env.SEED ?? 7);
const sim = new B.TreeSim(p);
sim.years = Number(process.env.YEARS ?? 3); sim.reset();
while (sim.time < T - 1e-9) sim.step(1 / HZ);
sim.flushStructure();
const N = sim.nodes, C = sim.chains;
const leafy = [...new Set(sim.leaves.map((l) => l.node))].map((i) => N[i]).filter((n) => !C[n.chain].pruned);
let h = 0, lowWood = 1e9; for (const n of N) if (!C[n.chain].pruned) { if (n.wy > h) h = n.wy; if (n.wy < lowWood && n.parent >= 0) lowWood = Math.min(lowWood, n.wy > 0.3 && C[n.chain].order > 0 ? n.wy : 1e9); }
const rs = leafy.map((n) => Math.hypot(n.wx, n.wz)).sort((a, b) => a - b), R = rs[Math.floor(rs.length * 0.95)];
const q = (a, f) => { if (!a.length) return 0; a.sort((x, y) => x - y); return a[Math.min(a.length - 1, Math.floor(a.length * f))]; };
// top-down: p95 reach and leafy-node count per 15 degree sector, whole crown and upper half
const S = 24, sec = Array.from({ length: S }, () => []), secU = Array.from({ length: S }, () => []);
let yLo = 1e9; for (const n of leafy) yLo = Math.min(yLo, n.wy);
for (const n of leafy) { const s = Math.floor(((Math.atan2(n.wz, n.wx) + Math.PI) / (2 * Math.PI)) * S) % S; const r = Math.hypot(n.wx, n.wz); sec[s].push(r); if (n.wy > (yLo + h) / 2) secU[s].push(r); }
const az = sim.scafAz ?? [];
console.log(JSON.stringify({ seed: p.seed.seed, t: T, h: +h.toFixed(2), R95: +R.toFixed(2), nodes: N.length, leaves: sim.leaves.length, lowWood: +lowWood.toFixed(2), scafAz: az.map((x) => +(x * 57.3).toFixed(0)), ...(process.env.CHECK ? { diff: sim.structureCheck().differing } : {}) }));
if (process.env.MAP) { console.log('sector deg: reach p95 / n | upper half reach p95 / n');
  for (let s = 0; s < S; s++) console.log(`${String(-180 + s * 15).padStart(5)}: ${q(sec[s], 0.95).toFixed(1).padStart(5)} ${String(sec[s].length).padStart(5)} | ${q(secU[s], 0.95).toFixed(1).padStart(5)} ${String(secU[s].length).padStart(5)}  ${'#'.repeat(Math.round(sec[s].length / 60))}`); }
// side silhouettes: per view direction, top outline (p97 leaf height per column of width R/8) and deepest notch below its upper hull
const out = []; let worst = 0;
for (let v = 0; v < 8; v++) { const a = v * Math.PI / 8, ca = Math.cos(a), sa = Math.sin(a), W = R / 8, cols = new Map();
  for (const n of leafy) { const u = Math.round((n.wx * ca + n.wz * sa) / W); (cols.get(u) ?? cols.set(u, []).get(u)).push(n.wy); }
  const us = [...cols.keys()].sort((x, y) => x - y).filter((u) => Math.abs(u) <= 7), top = us.map((u) => cols.get(u).length >= 4 ? q(cols.get(u), 0.97) : yLo);
  let deep = 0, at = 0;
  for (let i = 1; i < us.length - 1; i++) { let hull = Infinity; // lowest chord over column i between any left and right column
    let bl = -1e9, br = -1e9; for (let j = 0; j < i; j++) for (let k = i + 1; k < us.length; k++) { const y = top[j] + (top[k] - top[j]) * (us[i] - us[j]) / (us[k] - us[j]); if (y > bl) bl = y; } hull = Math.max(bl, top[i]);
    if (hull - top[i] > deep) { deep = hull - top[i]; at = us[i] * W; } }
  worst = Math.max(worst, deep / R);
  out.push(`${(v * 22.5).toFixed(0)}deg notch ${deep.toFixed(1)}m (${(deep / R).toFixed(2)}R) at u=${at.toFixed(1)}  top: ${top.map((y) => y.toFixed(0)).join(' ')}`); }
console.log(out.join('\n')); console.log(`deepest notch ${worst.toFixed(2)} R`);

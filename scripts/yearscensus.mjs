// Growth over years, headless (node, no browser): grows the default oak with the sim of this checkout and prints height,
// crown width (2 x the 95th percentile of the horizontal distance of leafy nodes from the trunk axis), trunk radius at
// 1.3 m, nodes, live attractors and ms per step at the sample times.
// Usage: node scripts/yearscensus.mjs [query]   TIMES=150,300,...  YEARS=3 (0 = today's sim)  SEED=7  HZ=30
import { execSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
const root = resolve(import.meta.dirname, '..'), tmp = `/tmp/arbor-years-${process.pid}`;
mkdirSync(tmp, { recursive: true });
writeFileSync(`${tmp}/e.ts`, `export { TreeSim } from '${root}/src/sim/tree';\nexport { defaultParams, applyQueryOverrides } from '${root}/src/params';\n`);
execSync(`${root}/node_modules/.bin/rolldown ${tmp}/e.ts --file ${tmp}/b.mjs --format esm`, { stdio: ['ignore', 'ignore', 'inherit'] });
const B = await import(`${tmp}/b.mjs`);
const TIMES = (process.env.TIMES ?? '45,90,150,300,450,600,750,900').split(',').map(Number), HZ = Number(process.env.HZ ?? 30);
const p = B.defaultParams();
if (process.argv[2]) B.applyQueryOverrides(p, process.argv[2]);
p.seed.seed = Number(process.env.SEED ?? 7);
const sim = new B.TreeSim(p);
if ('years' in sim) { sim.years = Number(process.env.YEARS ?? 3); sim.reset(); }
const rows = [];
let prevN = 0;
for (const T of TIMES) {
  const t0 = performance.now(); let steps = 0, winterAdd = 0;
  while (sim.time < T - 1e-9) {
    const n0 = sim.nodes.length; sim.step(1 / HZ); steps++;
    const ph = ((sim.time / p.season.yearLength + 0.12) % 1);
    if (ph > 0.62 && ph < 0.98) winterAdd += sim.nodes.length - n0;
  }
  const ms = (performance.now() - t0) / steps;
  sim.flushStructure();
  const N = sim.nodes; let h = 0; const d = [];
  for (const n of N) { if (n.wy > h) h = n.wy; }
  const leafy = new Set(sim.leaves.map((l) => l.node));
  for (const id of leafy) { const n = N[id]; if (!sim.chains[n.chain].pruned) d.push(Math.hypot(n.wx, n.wz)); }
  d.sort((a, b) => a - b);
  const w = 2 * (d[Math.floor(d.length * 0.95)] ?? 0);
  let r13 = 0; for (const id of sim.chains[0].nodes) { if (N[id].ry <= 1.3) r13 = N[id].radius; }
  const live = sim.chains.filter((c) => !c.pruned).length;
  rows.push({ t: T, h: +h.toFixed(2), w: +w.toFixed(2), r13cm: +(r13 * 100).toFixed(1), nodes: N.length, add: N.length - prevN, winterAdd, chains: live, leaves: sim.leaves.length, attr: sim.attractorCount, msStep: +ms.toFixed(2) });
  prevN = N.length;
}
console.table(rows);
if (process.env.JSON) console.log(JSON.stringify(rows));

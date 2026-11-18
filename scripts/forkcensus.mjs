// Fork census, headless (node): trunk radius profile, scaffold limb base radii and the area ratio (sum of child
// cross-sections / parent cross-section) at every fork of orders 0 to 2 (Leonardo's rule: about 1).
// Usage: node scripts/forkcensus.mjs [query]   T=750  YEARS=3  SEED=7  HZ=30  CHECK=1  MINR=0.03 (child counted as a limb, m)
import { execSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
const root = resolve(import.meta.dirname, '..'), tmp = `/tmp/arbor-fork-${process.pid}`;
mkdirSync(tmp, { recursive: true });
writeFileSync(`${tmp}/e.ts`, `export { TreeSim } from '${root}/src/sim/tree';\nexport { defaultParams, applyQueryOverrides } from '${root}/src/params';\n`);
execSync(`${root}/node_modules/.bin/rolldown ${tmp}/e.ts --file ${tmp}/b.mjs --format esm`, { stdio: ['ignore', 'ignore', 'inherit'] });
const B = await import(`${tmp}/b.mjs`);
const T = Number(process.env.T ?? 750), HZ = Number(process.env.HZ ?? 30), MINR = Number(process.env.MINR ?? 0.03);
const p = B.defaultParams();
if (process.argv[2]) B.applyQueryOverrides(p, process.argv[2]);
p.seed.seed = Number(process.env.SEED ?? 7);
const sim = new B.TreeSim(p);
sim.years = Number(process.env.YEARS ?? 3); sim.reset();
while (sim.time < T - 1e-9) sim.step(1 / HZ);
sim.flushStructure();
const N = sim.nodes, C = sim.chains, cm = (r) => +(r * 100).toFixed(1);
const kids = N.map(() => []);
for (let i = 0; i < N.length; i++) { const n = N[i]; if (n.parent >= 0 && !C[n.chain].pruned) kids[n.parent].push(i); }
let h = 0; for (const n of N) if (!C[n.chain].pruned && n.wy > h) h = n.wy;
const trunk = C[0].nodes;
const at = (hh) => { let r = 0; for (const id of trunk) if (N[id].ry <= hh) r = N[id].radius; return cm(r); };
console.log(JSON.stringify({ t: T, years: sim.years, nodes: N.length, leaves: sim.leaves.length, h: +h.toFixed(2), exp: sim.sParams?.[0], r0: sim.sParams?.[1],
  ...(process.env.CHECK ? { diff: sim.structureCheck().differing } : {}) }));
console.log('trunk r cm:', [0.05, 0.2, 0.5, 1.3, 2, 3, 4, 6, 8, 10].map((x) => `${x}m:${at(x)}`).join(' '));
// forks: a node of order <= 2 with at least 2 unpruned children of which the second thickest is >= MINR
const rows = { 0: [], 1: [], 2: [] };
for (let i = 0; i < N.length; i++) { const n = N[i], c = C[n.chain]; if (c.pruned || c.order > 2 || kids[i].length < 2) continue;
  const rs = kids[i].map((k) => N[k].radius).sort((a, b) => b - a); if (rs[1] < MINR) continue;
  let a = 0, tn = 0; for (const k of kids[i]) { a += N[k].radius ** 2; tn += (sim.sT?.[k] ?? 0) ** 2; }
  rows[c.order].push({ id: i, y: +n.wy.toFixed(2), r: cm(n.radius), tgt: cm(sim.sT?.[i] ?? 0), kids: rs.map(cm).join('+'), ratio: +(a / n.radius ** 2).toFixed(2), ratioTgt: +(tn / (sim.sT?.[i] ?? 1) ** 2).toFixed(2), pipeN: +(Math.log(rs.reduce((s, x) => s + x ** (sim.sParams?.[0] ?? 2), 0)) / Math.log(n.radius)).toFixed(2) }); }
for (const o of [0, 1, 2]) { const R = rows[o]; if (!R.length) continue; const q = R.map((x) => x.ratio).sort((a, b) => a - b);
  console.log(`order ${o}: ${R.length} forks (2nd child >= ${MINR * 100} cm); ratio min ${q[0]} med ${q[q.length >> 1]} max ${q[q.length - 1]}; in 0.85..1.25: ${q.filter((x) => x >= 0.85 && x <= 1.25).length}`);
  for (const x of (o === 0 ? R : R.sort((a, b) => b.r - a.r).slice(0, 10))) console.log('  ', JSON.stringify(x)); }
// trunk: every node, radius just below and above each fork with a limb >= 5 cm
console.log('trunk forks with a limb >= 5 cm (below = this node, above = trunk child, limb):');
for (let k = 0; k < trunk.length; k++) { const id = trunk[k], n = N[id]; const side = kids[id].filter((c) => N[c].chain !== 0 && N[c].radius >= 0.05); if (!side.length) continue;
  const cont = kids[id].find((c) => N[c].chain === 0);
  console.log('  ', JSON.stringify({ y: +n.wy.toFixed(2), below: cm(n.radius), above: cont != null ? cm(N[cont].radius) : 0, limbs: side.map((c) => cm(N[c].radius)), all: kids[id].length })); }
// dead feed: pruned children by trunk node (radius kept after the limb was shed)
let shedA = 0, shedN = 0; for (const id of trunk) for (let i = 0; i < N.length; i++) if (N[i].parent === id && C[N[i].chain].pruned) { shedA += N[i].radius ** 2; shedN++; }
console.log(`pruned children on the trunk: ${shedN}, summed r^2 as radius ${cm(Math.sqrt(shedA))} cm`);

// Trunk taper census, headless: grows the `?years=3` oak (seed 7, 30 Hz) to T and prints the trunk radius at set heights,
// the radius profile along the trunk through its forks, the thickest limb bases and the largest radius drop per metre.
// `drop*` and `maxStep*` follow the thickest stem (from the root always into the thickest child, down to 8 cm), so the
// leader twig left on top of the last fork does not count as a step. REF=<git ref> measures that commit's sim instead.
// Usage: node scripts/tapercensus.mjs [query]   T=750 YEARS=3 SEED=7 HZ=30 CHECK=1 PROFILE=1 REF=998ce56
import { execSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
const repo = resolve(import.meta.dirname, '..'), tmp = `/tmp/arbor-taper-${process.pid}`;
mkdirSync(tmp, { recursive: true });
let root = repo;
if (process.env.REF) { mkdirSync(`${tmp}/ref`); execSync(`git -C ${repo} archive ${process.env.REF} src | tar -x -C ${tmp}/ref`); root = `${tmp}/ref`; }
writeFileSync(`${tmp}/e.ts`, `export { TreeSim } from '${root}/src/sim/tree';\nexport { defaultParams, applyQueryOverrides } from '${root}/src/params';\n`);
execSync(`${repo}/node_modules/.bin/rolldown ${tmp}/e.ts --file ${tmp}/b.mjs --format esm`, { stdio: ['ignore', 'ignore', 'inherit'] });
const B = await import(`${tmp}/b.mjs`);
const T = Number(process.env.T ?? 750), HZ = Number(process.env.HZ ?? 30);
const p = B.defaultParams();
if (process.argv[2]) B.applyQueryOverrides(p, process.argv[2]);
p.seed.seed = Number(process.env.SEED ?? 7);
const sim = new B.TreeSim(p);
sim.years = Number(process.env.YEARS ?? 3); sim.reset();
while (sim.time < T - 1e-9) sim.step(1 / HZ);
sim.flushStructure();
const N = sim.nodes, trunk = sim.chains[0].nodes;
const kids = new Map();
for (const n of N) { if (n.parent >= 0 && !sim.chains[n.chain].pruned) { let a = kids.get(n.parent); if (!a) kids.set(n.parent, a = []); a.push(n); } }
const cm = (r) => +(r * 100).toFixed(1);
const at = (h) => { let r = 0; for (const id of trunk) if (N[id].wy <= h) r = N[id].radius; return cm(r); };
let height = 0; for (const n of N) if (n.wy > height) height = n.wy;
// Limb bases: first node of every chain that leaves the trunk.
const limbs = [];
for (const id of trunk) for (const c of kids.get(id) ?? []) if (c.chain !== 0) limbs.push({ y: +N[id].wy.toFixed(2), parentR: cm(N[id].radius), r: cm(c.radius), sub: +c.subLen.toFixed(0) });
limbs.sort((a, b) => b.r - a.r);
// Largest drop per metre along the trunk, over a 0.4 m and a 1 m window (below 85 % of the trunk's length).
let s = 0; const prof = [];
const kidIds = new Map();
N.forEach((n, i) => { if (n.parent >= 0 && !sim.chains[n.chain].pruned) { let a = kidIds.get(n.parent); if (!a) kidIds.set(n.parent, a = []); a.push(i); } });
for (let i = trunk[0]; i >= 0 && N[i].radius >= 0.08;) { const n = N[i]; s += n.len; prof.push({ s, y: n.wy, r: n.radius }); let b = -1; for (const c of kidIds.get(i) ?? []) if (b < 0 || N[c].radius > N[b].radius) b = c; i = b; }
const drop = (win) => { let best = 0, where = 0; for (let i = 0; i < prof.length; i++) for (let j = i + 1; j < prof.length && prof[j].s - prof[i].s <= win; j++) { const d = prof[i].r - prof[j].r; if (d > best) { best = d; where = prof[i].y; } } return { cm: cm(best), y: +where.toFixed(2) }; };
let step = 0, stepY = 0; for (let i = 1; i < prof.length; i++) { const d = 1 - prof[i].r / prof[i - 1].r; if (d > step) { step = d; stepY = prof[i].y; } }
const out = { t: T, nodes: N.length, leaves: sim.leaves.length, height: +height.toFixed(2), trunkR: { '0.5': at(0.5), '1.3': at(1.3), '2': at(2), '3': at(3), '5': at(5) }, limbs: limbs.slice(0, 5), ratio: +(at(1.3) / limbs[0].r).toFixed(2), drop04: drop(0.4), drop1m: drop(1), maxStepShare: +step.toFixed(3), maxStepY: +stepY.toFixed(2) };
if (process.env.CHECK) out.diff = sim.structureCheck().differing;
console.log(JSON.stringify(out, null, 1));
if (process.env.PROFILE) for (const id of trunk) { const n = N[id]; if (n.radius < 0.04) break; console.log(n.wy.toFixed(2), cm(n.radius), (kids.get(id) ?? []).filter((c) => c.chain !== 0).map((c) => cm(c.radius)).join(' ')); }

// Year-3 architecture census, headless (node): limbs by order (count, base girth), order-1 limbs over 10 cm with their
// base height, length, spread angle and reach, trunk taper, crown silhouette (width by height band), crown width/height.
// Usage: node scripts/archcensus.mjs [query]   T=750  YEARS=3  SEED=7  HZ=30  CHECK=1
import { execSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
const root = resolve(import.meta.dirname, '..'), tmp = `/tmp/arbor-arch-${process.pid}`;
mkdirSync(tmp, { recursive: true });
writeFileSync(`${tmp}/e.ts`, `export { TreeSim } from '${root}/src/sim/tree';\nexport { defaultParams, applyQueryOverrides } from '${root}/src/params';\n`);
execSync(`${root}/node_modules/.bin/rolldown ${tmp}/e.ts --file ${tmp}/b.mjs --format esm`, { stdio: ['ignore', 'ignore', 'inherit'] });
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
let h = 0; for (const n of N) if (!C[n.chain].pruned && n.wy > h) h = n.wy;
const leafy = new Set(sim.leaves.map((l) => l.node));
const d = []; let lowLeaf = 1e9;
const bands = new Array(10).fill(0);
for (const id of leafy) { const n = N[id]; if (C[n.chain].pruned) continue; const r = Math.hypot(n.wx, n.wz); d.push(r); if (n.wy < lowLeaf) { lowLeaf = n.wy; globalThis.lowId = id; }
  const b = Math.min(9, Math.max(0, Math.floor(n.wy / h * 10))); bands[b] = Math.max(bands[b], r); }
d.sort((a, b) => a - b);
const w = 2 * d[Math.floor(d.length * 0.95)];
const trunk = C[0].nodes; const taper = [];
for (const hh of [0.05, 0.5, 1.3, 2, 3, 4, 6, 8, 10, 12]) { let r = 0; for (const id of trunk) if (N[id].ry <= hh) r = N[id].radius; taper.push(`${hh}m:${(r * 100).toFixed(1)}`); }
// World (sagged) elevation in degrees of the limb's chord over its first, middle and last fifth of nodes.
const wElev = (c) => { const ids = c.nodes, m = ids.length, q = Math.max(1, Math.floor(m / 5));
  const ch = (a, b) => { const A = N[ids[a]], Bn = N[ids[b]]; return +(Math.atan2(Bn.wy - A.wy, Math.hypot(Bn.wx - A.wx, Bn.wz - A.wz)) * 57.3).toFixed(0); };
  const mid = Math.floor(m / 2);
  return { eB: ch(0, Math.min(m - 1, q)), eM: ch(Math.max(0, mid - (q >> 1)), Math.min(m - 1, mid + (q >> 1) + 1)), eT: ch(Math.max(0, m - 1 - q), m - 1) }; };
// order stats: base radius = radius of chain.nodes[1]
const byOrd = {};
const limbs = [];
for (let ci = 1; ci < C.length; ci++) { const c = C[ci]; if (c.pruned || c.nodes.length < 2) continue;
  const b = N[c.nodes[1]], o = c.order; const r = b.radius;
  (byOrd[o] ??= []).push(r);
  if (o === 1) { const tip = N[c.nodes[c.nodes.length - 1]]; let L = 0; for (let k = 1; k < c.nodes.length; k++) L += N[c.nodes[k]].len;
    limbs.push({ r: +(r * 100).toFixed(1), y0: +N[c.nodes[0]].wy.toFixed(1), L: +L.toFixed(1), reach: +Math.hypot(tip.wx, tip.wz).toFixed(1), tipY: +tip.wy.toFixed(1), elev: +(Math.asin(Math.max(-1, Math.min(1, b.dy))) * 57.3).toFixed(0), ...wElev(c), sub: +b.subLen.toFixed(0) }); } }
const ostat = Object.entries(byOrd).map(([o, a]) => { a.sort((x, y) => y - x); return `o${o}: n=${a.length} max=${(a[0] * 100).toFixed(1)} p90=${(a[Math.floor(a.length * 0.1)] * 100).toFixed(1)} med=${(a[a.length >> 1] * 100).toFixed(2)}cm`; });
limbs.sort((a, b) => b.r - a.r);
let r13 = 0; for (const id of trunk) if (N[id].ry <= 1.3) r13 = N[id].radius;
const big = limbs.filter((l) => l.r >= 10);
const lc = C[N[globalThis.lowId]?.chain]; if (lc) console.log("lowLeaf chain", JSON.stringify({ order: lc.order, sup: lc.sup ?? 0, nodes: lc.nodes.length, ry: +N[globalThis.lowId].ry.toFixed(2) }));
console.log(JSON.stringify({ t: T, h: +h.toFixed(2), w: +w.toFixed(2), wOverH: +(w / h).toFixed(2), r13cm: +(r13 * 100).toFixed(1), lowLeaf: +lowLeaf.toFixed(2), nodes: N.length, leaves: sim.leaves.length, limbs10: big.length, limbs5: limbs.filter((l) => l.r >= 5).length,
  ...(process.env.CHECK ? { diff: sim.structureCheck().differing } : {}), breaks: sim.breaks?.length }));
{ // bays: share of outer leafy nodes (beyond half the leaf reach) whose azimuth lies in a bay (scaffold sigma 0.25, lobe < 0.15 / 0.3)
  const az = sim.scafAz ?? [], R = d[d.length - 1] * 0.5; let o = 0, b12 = 0, b30 = 0;
  const lobe = (a) => { let m = 0; for (const x of az) { const dd = Math.atan2(Math.sin(a - x), Math.cos(a - x)); m = Math.max(m, Math.exp(-(dd * dd) / (2 * 0.25 * 0.25))); } return m; };
  for (const id of leafy) { const n = N[id]; if (C[n.chain].pruned) continue; const r = Math.hypot(n.wx, n.wz); if (r < R) continue; o++; const l = lobe(Math.atan2(n.wz, n.wx)); if (l < 0.15) b12++; if (l < 0.3) b30++; }
  console.log(`bays: scaffold az ${az.map((x) => x.toFixed(2)).join(' ')}; outer leafy nodes ${o}, in bay lobe<0.15 ${(100 * b12 / o).toFixed(1)}%, lobe<0.3 ${(100 * b30 / o).toFixed(1)}%`); }
console.log('taper', taper.join(' '));
console.log('silhouette r by band (0=ground..9=top):', bands.map((x) => x.toFixed(1)).join(' '));
console.log(ostat.join('\n'));
console.log('top order-1 limbs (r cm, base y, len, reach, tipY, elev deg, subLen):');
for (const l of limbs.slice(0, 14)) console.log(' ', JSON.stringify(l));
// PROF=1: per-limb world elevation profile (deg) over 3-node chords, base to tip, + rest elevation and sag, and the
// count of sign changes of the elevation slope (waviness: a smooth sweep has <= 2).
if (process.env.PROF) {
  const top = [];
  for (let ci = 1; ci < C.length; ci++) { const c = C[ci]; if (c.order === 1 && !c.pruned && c.nodes.length > 6) top.push(c); }
  top.sort((a, b) => N[b.nodes[1]].radius - N[a.nodes[1]].radius);
  for (const c of top.slice(0, 5)) {
    const ids = c.nodes, we = [], re = [], sg = []; let y1 = 0;
    for (let k = 0; k + 3 < ids.length; k += 3) { const A = N[ids[k]], Bn = N[ids[k + 3]];
      we.push(Math.round(Math.atan2(Bn.wy - A.wy, Math.hypot(Bn.wx - A.wx, Bn.wz - A.wz)) * 57.3));
      if (N[ids[k]].born < 264) y1 = we.length + 1;
      re.push(Math.round(Math.atan2(Bn.ry - A.ry, Math.hypot(Bn.rx - A.rx, Bn.rz - A.rz)) * 57.3)); sg.push(+Bn.sag.toFixed(2)); }
    const wav = (a) => { let n = 0, s = 0; for (let k = 1; k < a.length; k++) { const d = a[k] - a[k - 1]; if (Math.abs(d) < 3) continue; const ns = Math.sign(d); if (s && ns !== s) n++; s = ns; } return n; };
    console.log(`limb r=${(N[ids[1]].radius * 100).toFixed(1)} y0=${N[ids[0]].wy.toFixed(1)} wavy(world/rest)=${wav(we)}/${wav(re)} years2-3 from chord ${y1}: ${wav(we.slice(y1))}/${wav(re.slice(y1))}\n  world ${we.join(' ')}\n  rest  ${re.join(' ')}\n  sag   ${sg.join(' ')}`);
  }
}

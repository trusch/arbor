// Structure equality: grows the same trees with the sim of this checkout and of a reference commit (headless, node, no
// browser) and compares every node's world position, direction, radius, sag and subtree length, the chains' pruned
// flags, the leaf count and the bounding box bit by bit at the sample times. Also times `sim.step` per window.
// Usage: node scripts/structeq.mjs [case,...]      REF=e15fa47 (git ref of the reference sim), TIMES=30,90,150, HZ=60
//   cases: oak, oak2x, willow, break (forced limb break + parameter change while paused, jittered step length)
// Exit code 1 when any case differs.
import { execSync } from 'node:child_process';
import { mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { resolve } from 'node:path';
const REF = process.env.REF ?? 'e15fa47', TIMES = (process.env.TIMES ?? '30,90,150').split(',').map(Number), HZ = Number(process.env.HZ ?? 60);
const root = resolve(import.meta.dirname, '..'), tmp = `/tmp/arbor-structeq-${process.pid}`;
mkdirSync(`${tmp}/ref`, { recursive: true });
execSync(`git -C ${root} archive ${REF} src | tar -x -C ${tmp}/ref`);
async function load(name, src) {
  const entry = `${tmp}/${name}-entry.ts`;
  writeFileSync(entry, `export { TreeSim } from '${src}/sim/tree';\nexport { defaultParams, applyQueryOverrides } from '${src}/params';\nexport { presetParams } from '${src}/presets';\n`);
  execSync(`${root}/node_modules/.bin/rolldown ${entry} --file ${tmp}/${name}.mjs --format esm`, { stdio: ['ignore', 'ignore', 'inherit'] });
  return import(`${tmp}/${name}.mjs`);
}
const builds = { ref: await load('ref', `${tmp}/ref/src`), cur: await load('cur', `${root}/src`) };
const K2 = 'crown.height=13.00&crown.radius=7.20&crown.base=4.80&crown.bole=3.40&crown.attractors=32000&maxNodes=400000'; // scripts/bigtree.mjs K=2 ATTR=32000
const CASES = {
  oak: { query: '' },
  oak2x: { query: K2 },
  willow: { preset: 'Weeping willow' },
  break: { query: '', jitter: true, events: true },
};
function run(B, c) {
  const p = c.preset ? B.presetParams(c.preset) : B.defaultParams();
  if (c.query) B.applyQueryOverrides(p, c.query);
  p.seed.seed = 7;
  const sim = new B.TreeSim(p);
  let seed = 12345; const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);
  const snaps = [], cost = []; let ev = 0, t0 = performance.now(), steps = 0, info = {};
  for (const T of TIMES) {
    while (sim.time < T - 1e-9) {
      // Events of the break case: limb break on a paused tree at t = 45, parameter changes while paused at t = 60 and 100.
      if (c.events && ev === 0 && sim.time >= 45) {
        ev = 1;
        const ch = sim.chains.find((x) => x.order === 1 && !x.pruned && x.nodes.length >= 12 && x.juv === undefined);
        const e = sim.breakAt(ch.nodes[3]);
        info.breakNodes = e.nodeIds.length; info.breakChains = e.chains.length;
        sim.updateStructure(0);
      }
      if (c.events && ev === 1 && sim.time >= 60) { ev = 2; p.thickness.exponent += 0.25; p.growth.sag *= 1.6; sim.updateStructure(0); sim.updateStructure(0); }
      if (c.events && ev === 2 && sim.time >= 100) { ev = 3; p.thickness.twigRadius *= 1.3; p.growth.weeping = 0.5; p.thickness.thickeningRate *= 2; sim.updateStructure(0); }
      const dt = Math.min(T - sim.time, c.jitter ? (0.4 + 2.2 * rnd()) / HZ : 1 / HZ);
      sim.step(dt); steps++;
    }
    cost.push(+((performance.now() - t0) / steps).toFixed(3)); t0 = performance.now(); steps = 0;
    if (process.env.FLUSH !== '0') sim.flushStructure?.(); // deferred forward pass (structureInterval): bring positions to this instant
    const N = sim.nodes.length, a = new Float64Array(N * 9);
    for (let i = 0; i < N; i++) { const d = sim.nodes[i], o = i * 9; a[o] = d.wx; a[o + 1] = d.wy; a[o + 2] = d.wz; a[o + 3] = d.wdx; a[o + 4] = d.wdy; a[o + 5] = d.wdz; a[o + 6] = d.radius; a[o + 7] = d.sag; a[o + 8] = d.subLen; }
    snaps.push({ t: T, N, a, pruned: sim.chains.map((x) => (x.pruned ? 1 : 0)).join(''), leaves: sim.leaves.length, bbox: [...sim.bboxMin, ...sim.bboxMax], height: +sim.bboxMax[1].toFixed(2) });
  }
  // Cost on the tree as it stands at the last sample time: 300 more steps (growth continues if it has not finished).
  t0 = performance.now(); for (let i = 0; i < 300; i++) sim.step(1 / HZ);
  return { snaps, cost, tail: +((performance.now() - t0) / 300).toFixed(3), info, stats: sim.structStats ? { ...sim.structStats } : null };
}
const KEYS = ['pos', 'pos', 'pos', 'dir', 'dir', 'dir', 'radius', 'sag', 'subLen'];
let bad = 0;
for (const name of (process.argv[2] ?? Object.keys(CASES).join(',')).split(',')) {
  const c = CASES[name];
  const r = run(builds.ref, c), q = run(builds.cur, c);
  const rows = r.snaps.map((s, i) => {
    const u = q.snaps[i], d = { pos: 0, dir: 0, radius: 0, sag: 0, subLen: 0 }; let differing = 0;
    if (s.N === u.N) for (let j = 0; j < s.a.length; j++) if (s.a[j] !== u.a[j]) { differing++; const e = Math.abs(s.a[j] - u.a[j]); if (!(e <= d[KEYS[j % 9]])) d[KEYS[j % 9]] = e; }
    const equal = s.N === u.N && differing === 0 && s.pruned === u.pruned && s.leaves === u.leaves && s.bbox.every((v, k) => v === u.bbox[k]);
    if (!equal) bad++;
    return { t: s.t, nodes: s.N, nodesCur: u.N, height: s.height, chains: s.pruned.length, pruned: s.pruned.split('1').length - 1, leaves: s.leaves, bitEqual: equal, differingValues: differing, maxDiff: d,
      prunedEqual: s.pruned === u.pruned, leavesEqual: s.leaves === u.leaves, stepMsRef: r.cost[i], stepMsCur: q.cost[i] };
  });
  console.log(JSON.stringify({ case: name, ref: REF, info: q.info, rows, tailStepMs: { ref: r.tail, cur: q.tail }, structStats: q.stats }));
}
rmSync(tmp, { recursive: true, force: true });
process.exit(bad ? 1 : 0);

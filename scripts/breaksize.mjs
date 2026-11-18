// Breakage at size, headless (node, no browser): grows the default oak (YEARS, T), then runs the breakage rule exactly as
// `__arbor.stormTest` does (windLoad at 4 Hz on a synthetic wind clock, fixed wind.base) for 120 s per base, each from a
// fresh copy of the grown tree. Prints u percentiles at gust 1.0 and twigs / limbs per base.
// Usage: node scripts/breaksize.mjs [query]   YEARS=3 T=750 BASES=1,0.8,0.6,0.35 SIGMA=1 SEED=7
import { execSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
const root = resolve(import.meta.dirname, '..'), tmp = `/tmp/arbor-bs-${process.pid}`;
mkdirSync(tmp, { recursive: true });
writeFileSync(`${tmp}/e.ts`, `export { TreeSim } from '${root}/src/sim/tree';\nexport { Wind } from '${root}/src/wind';\nexport { defaultParams, applyQueryOverrides } from '${root}/src/params';\n`);
execSync(`${root}/node_modules/.bin/rolldown ${tmp}/e.ts --file ${tmp}/b.mjs --format esm`, { stdio: ['ignore', 'ignore', 'inherit'] });
const B = await import(`${tmp}/b.mjs`);
const T = Number(process.env.T ?? 750), sigma = Number(process.env.SIGMA ?? 1);
const grow = () => {
  const p = B.defaultParams();
  p.growth.maxNodes = 40000;
  if (process.argv[2]) B.applyQueryOverrides(p, process.argv[2]);
  p.seed.seed = Number(process.env.SEED ?? 7);
  const sim = new B.TreeSim(p); sim.years = Number(process.env.YEARS ?? 3); sim.reset();
  if (process.env.YSIG) sim.yearSigma = Number(process.env.YSIG);
  while (sim.time < T - 1e-9) sim.step(1 / 30);
  sim.flushStructure();
  return sim;
};
const wind = new B.Wind();
let sim = grow();
const u = []; sim.loadRatios(wind, sigma, (i, v) => u.push(v), 1); u.sort((a, b) => a - b);
const q = (f) => +u[Math.min(u.length - 1, Math.floor(u.length * f))].toFixed(2);
console.log(JSON.stringify({ years: sim.years, t: T, nodes: sim.nodes.length, limbsEvaluated: u.length, p50: q(0.5), p95: q(0.95), p98: q(0.98), max: +u[u.length - 1].toFixed(2) }));
for (const base of (process.env.BASES ?? '1,0.8,0.6,0.35').split(',').map(Number)) {
  if (base !== 1) sim = grow();
  const tw0 = sim.loadStats.twigs, li0 = sim.loadStats.limbs, ev = [];
  for (let t = 0; t < 120; t += 0.25) { wind.t = t; wind.base = base; const e = sim.windLoad(0.25, wind, sigma); if (e) ev.push(`${t}s:${e.nodeIds.length}n/${(e.radius * 100).toFixed(1)}cm`); }
  console.log(`base ${base}: twigs ${sim.loadStats.twigs - tw0} limbs ${sim.loadStats.limbs - li0}`, ev.join(' '));
}

// Headless weather census: imports src/weather.ts (node >= 22.18 strips the types) and the day / year clocks for many simulated
// years and prints a per-year table. `node scripts/wxsim.mjs [years=40] [seed=1] [yearLength=300] [dayLength=96] [nightSpeed=3]`
// JSON=1 prints {years:[...]} for smoke.
const [YEARS = 40, SEED = 1, YEAR = 300, DAY = 96, NIGHT = 3] = process.argv.slice(2).map(Number);
const { Weather, KINDS, temperature } = await import('../src/weather.ts');
let s = SEED * 2654435761 >>> 0;
const rnd = () => ((s ^= s << 13, s ^= s >>> 17, s ^= s << 5, s >>>= 0) / 4294967296);
Math.random = rnd;
const W = new Weather();
W.rnd = rnd;
const dt = 1 / 20, kinds = Object.keys(KINDS);
let hour = 12, t = 0.12 * YEAR;
const years = [];
for (let y = 0; y < YEARS; y++) {
  const Y = { year: y + 1, s: Object.fromEntries(kinds.map((k) => [k, 0])), rains: 0, storms: 0, strikes: 0, longest: 0, longestKind: '', changes: 0, sunny: 0, grey: 0, sunFlips: 0, windy: 0, still: 0, dark: 0, days: 0, tmin: 99, tmax: -99 };
  let run = 0, last = W.kind, wet = W.rain > 0.05, st = W.phase === 'rain', sun = W.cloud < 0.25, s0 = W.strikes;
  for (let i = 0; i < YEAR / dt; i++, t += dt) {
    const h0 = hour;
    hour = (hour + (dt * 24 / DAY) * (hour >= 21 || hour < 4.5 ? NIGHT : 1)) % 24;
    if (hour < h0) Y.days++;
    const night = hour < 5 || hour > 20.5 ? 1 : 0;
    const calm = 0.35 * W.breeze * (1 - 0.5 * night), base = calm + (Math.max(calm, 1) - calm) * W.wind;
    W.update(dt, 'auto', true, { phase: (t / YEAR) % 1, hour, wind: base });
    const k = W.kind;
    Y.s[k] += dt;
    if (k === last) run += dt; else { if (run > Y.longest) { Y.longest = run; Y.longestKind = last; } run = 0; last = k; Y.changes++; }
    const w = W.rain > 0.05; if (w && !wet) Y.rains++; wet = w;
    const r = W.phase === 'rain'; if (r && !st) Y.storms++; st = r;
    const su = sun ? W.cloud < 0.3 : W.cloud < 0.2; if (su !== sun) Y.sunFlips++; sun = su;
    if (W.cloud < 0.25) Y.sunny += dt; if (W.cloud > 0.45) Y.grey += dt;
    if (base >= 0.56) Y.windy += dt; if (base < 0.2 && !night) Y.still += dt;
    if (night) Y.dark += dt;
    Y.tmin = Math.min(Y.tmin, W.temp); Y.tmax = Math.max(Y.tmax, W.temp);
  }
  if (run > Y.longest) { Y.longest = run; Y.longestKind = last; }
  Y.strikes = W.strikes - s0;
  years.push(Y);
}
if (process.env.JSON) { console.log(JSON.stringify({ years })); process.exit(0); }
const f = (v, n = 5) => String(Math.round(v)).padStart(n);
console.log(`year ${kinds.map((k) => k.slice(0, 5).padStart(5)).join(' ')} | rains storms strikes changes sunFlips | longest same kind | sunny grey windy still dark days | tmin tmax   (seconds unless noted)`);
for (const Y of years) console.log(`${f(Y.year, 4)} ${kinds.map((k) => f(Y.s[k])).join(' ')} | ${f(Y.rains)} ${f(Y.storms, 6)} ${f(Y.strikes, 7)} ${f(Y.changes, 7)} ${f(Y.sunFlips, 8)} | ${f(Y.longest, 4)} ${Y.longestKind.padEnd(9)} | ${f(Y.sunny)} ${f(Y.grey, 4)} ${f(Y.windy)} ${f(Y.still)} ${f(Y.dark, 4)} ${f(Y.days, 4)} | ${Y.tmin.toFixed(1).padStart(5)} ${Y.tmax.toFixed(1).padStart(5)}`);
const mean = (g) => years.reduce((a, Y) => a + g(Y), 0) / years.length, min = (g) => Math.min(...years.map(g)), max = (g) => Math.max(...years.map(g));
console.log(`mean ${kinds.map((k) => f(mean((Y) => Y.s[k]))).join(' ')} | rains ${mean((Y) => Y.rains).toFixed(1)} (min ${min((Y) => Y.rains)}) storms ${mean((Y) => Y.storms).toFixed(2)} (min ${min((Y) => Y.storms)}) changes ${mean((Y) => Y.changes).toFixed(1)} (min ${min((Y) => Y.changes)}) sunFlips ${mean((Y) => Y.sunFlips).toFixed(1)} | longest same kind max ${f(max((Y) => Y.longest), 1)} s | windy ${f(mean((Y) => Y.windy), 1)} s (min ${f(min((Y) => Y.windy), 1)}) still ${f(mean((Y) => Y.still), 1)} s (min ${f(min((Y) => Y.still), 1)}) dark ${f(mean((Y) => Y.dark), 1)} s`);
const kindless = kinds.filter((k) => years.every((Y) => Y.s[k] === 0));
console.log(`years missing a kind: ${kinds.map((k) => `${k} ${years.filter((Y) => Y.s[k] === 0).length}`).join(', ')}${kindless.length ? ' NEVER: ' + kindless : ''}`);
console.log('temp checks (phase, hour, clear/overcast-rain):', [[0.375, 15], [0.375, 3], [0.64, 12], [0.9, 3], [0.9, 14], [0.12, 9]].map(([p, h]) => `${p}@${h}h ${temperature(p, h, 0, 0, 0.35).toFixed(1)}/${temperature(p, h, 0.84, 0.5, 0.4).toFixed(1)}`).join('  '));

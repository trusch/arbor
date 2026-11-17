// Sound verification: drives the built app through weather / time / season cases in headless chromium (autoplay allowed),
// records `__arbor.audio.levels()` over time, checks that each layer follows its signal, and renders two WAVs offline.
// Usage: node scripts/audiotrace.mjs URL [outDir=audio-samples]   (THROTTLE=4 PHONE=1 for the per-frame cost)
import { chromium, devices } from 'playwright-core';
import { writeFileSync, mkdirSync } from 'node:fs';
const url = process.argv[2] ?? 'http://127.0.0.1:5620/', out = process.argv[3] ?? 'audio-samples';
mkdirSync(out, { recursive: true });
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM ?? '/usr/sbin/chromium', args: ['--headless=new', '--use-gl=angle', `--use-angle=${process.env.SMOKE_GPU ?? 'vulkan'}`, '--enable-gpu', '--ignore-gpu-blocklist', '--autoplay-policy=no-user-gesture-required'] });
const results = [], check = (name, ok, detail = '') => { results.push(ok); console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? '  ' + detail : ''}`); };
const errors = [], trace = {};
const corr = (a, b) => { const n = a.length, ma = a.reduce((s, v) => s + v, 0) / n, mb = b.reduce((s, v) => s + v, 0) / n; let x = 0, y = 0, z = 0; for (let i = 0; i < n; i++) { x += (a[i] - ma) * (b[i] - mb); y += (a[i] - ma) ** 2; z += (b[i] - mb) ** 2; } return x / Math.sqrt(y * z || 1); };
const mean = (a) => a.reduce((s, v) => s + v, 0) / Math.max(1, a.length), fx = (v, d = 4) => +v.toFixed(d);
try {
  const phone = process.env.PHONE === '1';
  const ctx = await browser.newContext(phone ? { ...devices['Pixel 7'] } : { viewport: { width: 1024, height: 640 } });
  const page = await ctx.newPage();
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  page.on('pageerror', (e) => errors.push(e.message));
  if (process.env.THROTTLE) { const cdp = await ctx.newCDPSession(page); await cdp.send('Emulation.setCPUThrottlingRate', { rate: Number(process.env.THROTTLE) }); }
  await page.goto(`${url}?t=90&timeOfDay=12&cycle=false&weather=calm&season.on=false&panel=closed&critters.amount=1`);
  await page.waitForFunction(() => window.__arbor !== undefined, null, { timeout: 60000 });
  await page.waitForTimeout(1500);
  check('no audio context before the gesture', await page.evaluate(() => window.__arbor.audio.ctx === null && window.__arbor.audio.levels() === null));
  await page.click('#arbor-sound');
  await page.waitForTimeout(1500);
  /** Sample levels + signals for `s` seconds at 10 Hz. */
  const sample = async (name, s) => {
    const rows = [];
    for (let i = 0; i < s * 10; i++) {
      rows.push(await page.evaluate(() => { const A = window.__arbor, L = A.audio.levels(), b = L.bus, r = (x) => +x.toFixed(5); return { t: r(L.t), gust: r(L.drive.gust), rain: r(A.weather.rain), night: r(A.stage.atmo.night), master: r(b.master.rms), peak: r(b.master.peak), wind: r(b.wind.rms), rustle: r(b.rustle.rms), rainL: r(b.rain.rms), thunder: r(b.thunder.rms), birds: r(b.birds.rms), nightL: r(b.night.rms), events: r(b.events.rms), duck: r(L.duck), phrases: L.drive.birdPhrases ?? 0, crickets: r(L.drive.crickets ?? 0) }; }));
      await page.waitForTimeout(100);
    }
    trace[name] = rows;
    const col = (k) => rows.map((x) => x[k]);
    console.log(`  ${name}: master rms ${fx(mean(col('master')))} peak ${fx(Math.max(...col('peak')))} | wind ${fx(mean(col('wind')))} rustle ${fx(mean(col('rustle')))} rain ${fx(mean(col('rainL')))} thunder ${fx(mean(col('thunder')))} birds ${fx(mean(col('birds')))} night ${fx(mean(col('nightL')))} | gust ${fx(Math.min(...col('gust')), 2)}..${fx(Math.max(...col('gust')), 2)} phrases ${rows[rows.length - 1].phrases - rows[0].phrases}`);
    return { rows, col };
  };
  const set = (fn, arg) => page.evaluate(fn, arg);
  // 1 calm noon
  const st0 = await page.evaluate(() => ({ state: window.__arbor.audio.ctx.state, on: window.__arbor.audio.on }));
  const calm = await sample('calm-noon', 12);
  check('after the speaker button a context is running, levels non-zero and finite', st0.state === 'running' && st0.on && mean(calm.col('master')) > 1e-4 && calm.rows.every((r) => Object.values(r).every(Number.isFinite)), `state ${st0.state}`);
  check('calm noon is gentle, not empty', mean(calm.col('master')) > 0.0005 && mean(calm.col('master')) < 0.12, `rms ${fx(mean(calm.col('master')))}`);
  // 2 windy day
  await set(() => { const A = window.__arbor; A.params.weather.event = 'auto'; A.params.weather.kind = 'windy'; A.weather.snap('windy'); });
  await page.waitForTimeout(2500);
  const windy = await sample('windy', 30);
  const cw = corr(windy.col('gust'), windy.col('wind')), cr = corr(windy.col('gust'), windy.col('rustle'));
  check('wind and rustle track the gust', cw > 0.5 && cr > 0.5 && Math.max(...windy.col('rustle')) > 3 * mean(calm.col('rustle')), `corr wind ${fx(cw, 2)} rustle ${fx(cr, 2)}; rustle rms calm mean ${fx(mean(calm.col('rustle')))} -> windy mean ${fx(mean(windy.col('rustle')))} / gust peak ${fx(Math.max(...windy.col('rustle')))}`);
  // 3 rain shower: from dry into rain
  await set(() => { const A = window.__arbor; A.params.weather.kind = 'rain'; });
  const shower = await sample('rain-onset', 25);
  const crn = corr(shower.col('rain'), shower.col('rainL'));
  check('rain layer tracks weather.rain', crn > 0.6 && Math.max(...shower.col('rain')) > 0.2, `corr ${fx(crn, 2)}; rain ${fx(shower.rows[0].rain, 2)} -> ${fx(shower.rows.at(-1).rain, 2)}, level ${fx(shower.rows[0].rainL)} -> ${fx(shower.rows.at(-1).rainL)}`);
  check('birds thin out in rain', shower.rows.at(-1).phrases - shower.rows[Math.floor(shower.rows.length / 2)].phrases <= 1, `phrases in the wet half ${shower.rows.at(-1).phrases - shower.rows[Math.floor(shower.rows.length / 2)].phrases}`);
  // 4 thunderstorm with a forced strike
  await set(() => { const A = window.__arbor; A.params.weather.kind = 'auto'; A.params.weather.event = 'storm'; A.weather.snapStorm(); });
  await page.waitForTimeout(3000);
  const strike = await set(() => { const A = window.__arbor; let d = 0; const prev = A.weather.onStrike; A.weather.onStrike = (x) => { d = x; prev(x); }; A.weather.strike(); A.weather.onStrike = prev; const L = A.audio.levels(); return { dist: d, now: L.t, at: L.drive.lastThunderAt, len: L.drive.lastThunderLen }; });
  const storm = await sample('storm-strike', 14);
  {
    const base = mean(storm.rows.filter((r) => r.t < strike.at - 0.15).map((r) => r.thunder)), th = storm.rows.filter((r) => r.t >= strike.at);
    const first = storm.rows.find((r) => r.thunder > Math.max(0.01, 4 * base)), last = [...storm.rows].reverse().find((r) => r.thunder > 0.01);
    const delay = first ? first.t - strike.now : NaN, want = strike.dist / 343;
    check('thunder starts at distance / 343 s after the flash', Math.abs(delay - want) < 0.3, `dist ${fx(strike.dist, 0)} m, expected ${fx(want, 2)} s, measured ${fx(delay, 2)} s (10 Hz sampling); other strikes of the running storm can precede it`);
    check('thunder rolls on for seconds and ducks the rest', last && last.t - strike.at > 2.5 && Math.min(...th.map((r) => r.duck)) < 0.7, `audible ${fx(last ? last.t - strike.at : 0, 1)} s of ${fx(strike.len, 1)} s scheduled; duck min ${fx(Math.min(...th.map((r) => r.duck)), 2)}; peak thunder rms ${fx(Math.max(...storm.col('thunder')))}`);
  }
  check('master never exceeds full scale (calm..storm)', Math.max(...Object.values(trace).flatMap((r) => r.map((x) => x.peak))) < 1, `max peak ${fx(Math.max(...Object.values(trace).flatMap((r) => r.map((x) => x.peak))))}`);
  // 5 limb break (calm again, so the event bus is read alone)
  await set(() => { const A = window.__arbor; A.params.weather.event = 'calm'; A.weather.snap('clear'); });
  await page.waitForTimeout(6000);
  await set(() => { window.__arbor.breakLimb('big'); });
  const brk = await sample('limb-break', 3);
  check('a limb break cracks and thuds', Math.max(...brk.col('events')) > 0.005, `event bus peak rms ${fx(Math.max(...brk.col('events')))}`);
  // 6 dusk into night (summer, warm): birds stop, crickets start
  await set(() => { const A = window.__arbor; A.params.season.on = true; A.params.season.hold = true; A.params.season.date = 0.3; A.params.sky.timeOfDay = 19; A.params.sky.cycle = true; A.params.sky.dayLength = 60; A.params.sky.nightSpeed = 1; });
  const dusk = await sample('dusk-to-night', 20);
  await set(() => { const A = window.__arbor; A.params.sky.cycle = false; A.params.sky.timeOfDay = 23.5; });
  await page.waitForTimeout(1500);
  const night = await sample('night', 12);
  check('birds stop at night, crickets take over', night.rows.at(-1).phrases - night.rows[0].phrases === 0 && mean(night.col('nightL')) > 0.001 && mean(calm.col('nightL')) < 1e-5, `phrases at night ${night.rows.at(-1).phrases - night.rows[0].phrases} (calm noon ${calm.rows.at(-1).phrases - calm.rows[0].phrases} in 12 s), cricket bus rms noon ${fx(mean(calm.col('nightL')), 5)} -> night ${fx(mean(night.col('nightL')))}`);
  // 7 winter noon, windy: bare crown whistles, no rustle
  await set(() => { const A = window.__arbor; A.params.sky.timeOfDay = 12; A.params.season.date = 0.86; A.params.weather.event = 'auto'; A.params.weather.kind = 'windy'; A.weather.snap('windy'); });
  await page.waitForTimeout(4000);
  const winter = await sample('winter-windy', 15);
  const wd = await set(() => window.__arbor.audio.levels().drive);
  check('winter: bare crown (foliage 0, whistle instead of rustle), few birds', wd.foliage < 0.02 && wd.bare > 0.8 && wd.rustle < 0.002, `foliage ${fx(wd.foliage, 3)} bare ${fx(wd.bare, 2)} rustle gain ${fx(wd.rustle)} whistle gain ${fx(wd.whistle)}; tree bus rms ${fx(mean(winter.col('rustle')))} vs summer windy ${fx(mean(windy.col('rustle')))}`);
  // 8 pause, hidden tab, off
  await set(() => { window.__arbor.params.time.paused = true; });
  await page.waitForTimeout(1500);
  const paused = await set(() => window.__arbor.audio.levels().bus.master.rms);
  await set(() => { window.__arbor.params.time.paused = false; });
  await page.waitForTimeout(1200);
  const resumed = await set(() => window.__arbor.audio.levels().bus.master.rms);
  check('a paused world goes quiet and comes back', paused < 1e-3 && resumed > 5 * paused && resumed > 1e-3, `paused rms ${fx(paused, 5)} resumed ${fx(resumed)}`);
  const cost = await set(() => { const s = window.__arbor.audio.stats; return { mean: s.sumMs / s.frames, max: s.maxMs, frames: s.frames }; });
  console.log(`  per-frame audio update: mean ${fx(cost.mean, 3)} ms, max ${fx(cost.max, 2)} ms over ${cost.frames} frames${process.env.THROTTLE ? ` at ${process.env.THROTTLE}x CPU throttle` : ''}${phone ? ' (phone emulation)' : ''}`);
  await page.click('#arbor-sound');
  await page.waitForTimeout(800);
  const off = await set(() => { const A = window.__arbor.audio, f0 = A.stats.frames; return new Promise((res) => setTimeout(() => res({ state: A.ctx.state, on: A.on, frames: A.stats.frames - f0, stored: localStorage.getItem('arbor.sound') }), 700)); });
  check('toggling off silences and releases the per-frame work', off.state === 'suspended' && !off.on && off.frames === 0 && off.stored === '0', JSON.stringify(off));
  check('no console errors', errors.length === 0, errors.slice(0, 3).join(' | '));
  writeFileSync(`${out}/trace.json`, JSON.stringify(trace));
  // Offline renders (same graph, scripted env, the real Wind class).
  if (process.env.WAV !== '0') {
    const render = async (file, seconds, keys, events) => { const r = await page.evaluate(([s, k, e]) => window.__arbor.audio.render(s, k, e), [seconds, keys, events]); writeFileSync(`${out}/${file}`, Buffer.from(r.wav, 'base64')); console.log(`  wrote ${out}/${file}: ${fx(r.seconds, 1)} s, peak ${fx(r.peak, 3)}, rms ${fx(r.rms)}`); return r; };
    const a = await render('calm-noon.wav', 28, [{ t: 0, env: { wind: 0.35, hour: 12 } }], []);
    const b = await render('storm.wav', 30, [{ t: 0, env: { wind: 0.5, storm: 0.3, rain: 0, hour: 15 } }, { t: 5, env: { storm: 0.8, rain: 0.08 } }, { t: 10, env: { storm: 1, rain: 0.7 } }, { t: 22, env: { storm: 1, rain: 1 } }, { t: 30, env: { storm: 0.8, rain: 0.8 } }], [{ t: 9, strike: 760 }, { t: 15.5, strike: 320 }, { t: 19, limb: 0.8 }, { t: 23, strike: 520 }]);
    const c = await render('summer-night.wav', 20, [{ t: 0, env: { wind: 0.25, hour: 23, night: 1, temp: 17 } }], []);
    const d = await render('winter-gale.wav', 15, [{ t: 0, env: { wind: 0.7, storm: 0.5, hour: 13, phase: 0.86, leafOn: 0, temp: 2 } }], []);
    check('offline renders stay below full scale', [a, b, c, d].every((r) => r.peak < 1 && r.rms > 1e-4), [a, b, c, d].map((r) => fx(r.peak, 3)).join(' '));
  }
} finally { await browser.close(); }
const failed = results.filter((r) => !r).length;
console.log(`\n${results.length - failed}/${results.length} passed`);
process.exit(failed ? 1 : 0);

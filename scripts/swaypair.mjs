// Sway cost as before/after PAIRS inside one job (shared host: single numbers mean little, pairs of one job do).
// Phone emulation (411 x 777, DPR 2.625, CPU throttle THROTTLE 4), calm wind, like scripts/bigtree.mjs.
// Usage: node scripts/swaypair.mjs URL_AFTER [URL_BEFORE]
//   one URL : ONE page, the sway scheme switched live between windows (A = direct cascade, `sway.keyMin = Infinity`;
//             B = the build's default), A B A B ..., live then paused. Same tree, same GPU state.
//   two URLs: fresh pages alternating BEFORE, AFTER, BEFORE, AFTER (two builds), each live then paused.
// env: Q='&years=3' AGE=750 (fastForward target), WIN_S=5, PAIRS=3, THROTTLE=4, GPU=vulkan, JSON=1
import { chromium } from 'playwright-core';
const [urlB, urlA] = process.argv.slice(2), E = process.env;
const AGE = Number(E.AGE ?? 90), WIN = Number(E.WIN_S ?? 5) * 1000, PAIRS = Number(E.PAIRS ?? 3), THROTTLE = Number(E.THROTTLE ?? 4);
const browser = await chromium.launch({ executablePath: '/usr/sbin/chromium', args: ['--headless=new', '--use-gl=angle', `--use-angle=${E.GPU ?? 'vulkan'}`, '--enable-gpu', '--ignore-gpu-blocklist'] });
function instrument() {
  const P = (window.__prof = { frames: [], cur: null, phase: 'boot', t: performance.now(), on: false });
  const enter = (n) => { const now = performance.now(); if (P.cur) P.cur.p[P.phase] = (P.cur.p[P.phase] || 0) + (now - P.t); P.phase = n; P.t = now; };
  let tel;
  Object.defineProperty(window, '__tel', { configurable: true, get: () => tel, set: (v) => { const ph = v.phase.bind(v); v.phase = (n, f) => { enter(n); return ph(n, f); }; tel = v; } });
  const raf = window.requestAnimationFrame.bind(window);
  window.requestAnimationFrame = (cb) => raf((ts) => {
    const s = performance.now(); P.cur = { ts, p: {} }; P.t = s;
    try { cb(ts); } finally { const e = performance.now(); P.cur.p[P.phase] = (P.cur.p[P.phase] || 0) + (e - P.t); P.cur.js = e - s; const sw = window.__arbor?.sway; if (sw) { P.cur.node = sw.lastMs; P.cur.ev = sw.stats.evaluated; } if (P.on) P.frames.push(P.cur); P.cur = null; }
  });
}
const med = (a) => { const s = [...a].sort((x, y) => x - y); return s.length ? s[Math.floor(s.length / 2)] : NaN; };
const mean = (a) => a.reduce((x, y) => x + y, 0) / (a.length || 1);
const open = async (url) => {
  const ctx = await browser.newContext({ viewport: { width: 411, height: 777 }, deviceScaleFactor: 2.625, isMobile: true, hasTouch: true, userAgent: 'Mozilla/5.0 (Linux; Android 15; Pixel) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0 Mobile Safari/537.36' });
  const page = await ctx.newPage(); page.setDefaultTimeout(600000);
  page.on('pageerror', (e) => console.error('[pageerror]', e.message));
  await page.addInitScript(instrument);
  await page.goto(`${url}?nogui=1&hideui=1&speed=0&autoRotate=false&cinema=false&cycle=false&weather=calm&timeOfDay=13&season.date=0.3&season.hold=true${E.Q ?? ''}`, { timeout: 600000 });
  await page.waitForFunction(() => window.__arbor !== undefined, null, { timeout: 600000 });
  const info = await page.evaluate((age) => { const A = window.__arbor; A.fastForward(age); return { nodes: A.sim.nodes.length, check: A.sim.structureCheck ? A.sim.structureCheck() : null }; }, AGE);
  const cdp = await ctx.newCDPSession(page);
  await page.waitForTimeout(8000); // leaf passes, bakes
  if (THROTTLE > 1) await cdp.send('Emulation.setCPUThrottlingRate', { rate: THROTTLE });
  return { ctx, page, info };
};
const win = async (page, paused, keyMin) => {
  await page.evaluate(([p, k]) => { const A = window.__arbor; A.params.time.speed = 1; A.params.time.paused = p; if (k !== null) A.sway.keyMin = k === 'inf' ? Infinity : k; }, [paused, keyMin]);
  await page.waitForTimeout(2000);
  await page.evaluate(() => { window.__prof.frames = []; window.__prof.on = true; });
  await page.waitForTimeout(WIN);
  const fr = await page.evaluate(() => { const P = window.__prof; P.on = false; return P.frames; });
  const st = await page.evaluate(() => ({ ...window.__arbor.sway.stats, programs: window.__arbor.stage.renderer.info.programs?.length }));
  const ph = (k) => mean(fr.map((f) => f.p[k] || 0));
  const dts = []; for (let i = 1; i < fr.length; i++) dts.push(fr[i].ts - fr[i - 1].ts);
  // The cascade runs every second frame on Low: `node` is read in every frame, so its mean over frames that ran it.
  return { frames: fr.length, jsMed: med(fr.map((f) => f.js)), jsMean: mean(fr.map((f) => f.js)), intMed: med(dts), sway: ph('sway'), leafSway: ph('leaves sway'), follow: ph('leaves follow'), render: ph('render'), node: mean(fr.map((f) => f.node ?? 0)), ev: mean(fr.map((f) => f.ev ?? 0)), st };
};
const rows = [];
const say = (tag, state, r) => { rows.push({ tag, state, ...r }); console.log(`${tag.padEnd(7)} ${state.padEnd(6)} frames ${String(r.frames).padStart(3)} js med ${r.jsMed.toFixed(1)} mean ${r.jsMean.toFixed(1)} ms, interval med ${r.intMed.toFixed(1)} | per frame: sway phase ${r.sway.toFixed(2)} (cascade per update ${r.node.toFixed(2)} ms, ${Math.round(r.ev)} nodes), leaves sway ${r.leafSway.toFixed(2)}, follow ${r.follow.toFixed(2)}, render ${r.render.toFixed(2)} | keyed ${r.st.keyed} slices ${r.st.slices} live ${r.st.live} programs ${r.st.programs}`); };
try {
  if (!urlA) {
    const { ctx, page, info } = await open(urlB);
    console.log(`one page, AGE ${AGE} Q '${E.Q ?? ''}': nodes ${info.nodes}, structureCheck ${JSON.stringify(info.check)}`);
    const def = await page.evaluate(() => window.__arbor.sway.keyMin);
    for (const paused of [false, true]) for (let i = 0; i < PAIRS; i++) { say('direct', paused ? 'paused' : 'live', await win(page, paused, 'inf')); say('default', paused ? 'paused' : 'live', await win(page, paused, def)); }
    await ctx.close();
  } else {
    for (let i = 0; i < PAIRS; i++) for (const [tag, url] of [['before', urlA], ['after', urlB]]) {
      const { ctx, page, info } = await open(url);
      if (i === 0) console.log(`${tag}: nodes ${info.nodes}, structureCheck ${JSON.stringify(info.check)}`);
      say(tag, 'live', await win(page, false, null)); say(tag, 'paused', await win(page, true, null));
      await ctx.close();
    }
  }
  console.log('medians over windows:');
  for (const state of ['live', 'paused']) for (const tag of [...new Set(rows.map((r) => r.tag))]) {
    const a = rows.filter((r) => r.tag === tag && r.state === state), m = (k) => med(a.map((r) => r[k])).toFixed(2);
    console.log(`  ${tag.padEnd(7)} ${state.padEnd(6)} js med ${m('jsMed')} mean ${m('jsMean')} | sway phase ${m('sway')} cascade/update ${m('node')} leaves sway ${m('leafSway')} follow ${m('follow')} render ${m('render')}`);
  }
  if (E.JSON) console.log(JSON.stringify(rows));
} finally { await browser.close(); }

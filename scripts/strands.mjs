// Hanging-strand census: chains whose sagged (world) pose hangs far below their base or runs steeply down.
// Usage: node scripts/strands.mjs URL [t,t,...] [extraQuery]   (default 30,60,90). Prints one JSON line per time.
import { chromium } from 'playwright-core';
const url = process.argv[2] ?? 'http://127.0.0.1:5420/';
const times = (process.argv[3] ?? '30,60,90').split(',').map(Number);
const extra = process.argv[4] ?? '';
const browser = await chromium.launch({ executablePath: '/usr/sbin/chromium', args: ['--headless=new', '--use-gl=angle', `--use-angle=${process.env.GPU ?? 'vulkan'}`, '--enable-gpu', '--ignore-gpu-blocklist'] });
try {
  const page = await browser.newPage({ viewport: { width: 800, height: 600 } });
  page.on('pageerror', (e) => console.error('[pageerror]', e.message));
  await page.goto(`${url}?cycle=false&nogui=1&cinema=false&speed=0&breakage=0&weather=calm${extra ? '&' + extra : ''}`);
  await page.waitForFunction(() => window.__arbor !== undefined);
  let done = 0;
  for (const t of times) {
    await page.evaluate((s) => window.__arbor.fastForward(s), t - done);
    done = t;
    const r = await page.evaluate((verbose) => {
      const s = window.__arbor.sim, N = s.nodes, f = (x) => +x.toFixed(3);
      let live = 0, liveNodes = 0, below2 = 0, steep = 0, steepBare = 0, sagMax = 0, sagCap = 0, restSteep = 0, lowBare = Infinity, crownLow = Infinity;
      const rows = [];
      const lf = new Uint16Array(N.length); for (const l of s.leaves) lf[l.node]++;
      for (let c = 0; c < s.chains.length; c++) {
        const ch = s.chains[c]; if (ch.pruned || ch.nodes.length < 2) continue;
        live++;
        const b = N[ch.nodes[0]], tip = N[ch.nodes[ch.nodes.length - 1]];
        let len = 0, drop = 0, run = 0, maxRun = 0, nSteep = 0, minL = 1, maxL = 0, restDrop = 0;
        for (let j = 1; j < ch.nodes.length; j++) {
          const n = N[ch.nodes[j]]; liveNodes++; len += n.len;
          drop = Math.max(drop, b.wy - n.wy); restDrop = Math.max(restDrop, b.ry - n.ry);
          if (b.wy - n.wy > 2) below2++;
          if (n.wdy < -0.75) { steep++; nSteep++; run += n.len; maxRun = Math.max(maxRun, run); if (n.wy < lowBare) lowBare = n.wy; } else { run = 0; if (n.leafy && n.wy < crownLow) crownLow = n.wy; }
          if (n.dy < -0.75) restSteep++; if (n.sag > sagMax) sagMax = n.sag; if (n.sag >= 1.299) sagCap++;
          minL = Math.min(minL, n.light); maxL = Math.max(maxL, n.light);
        }
        if (drop > 2 || maxRun > 1.5) rows.push({ c, order: ch.order, n: ch.nodes.length - 1, len: f(len), drop: f(drop), restDrop: f(restDrop), steepRun: f(maxRun), nSteep, alive: ch.alive, shade: ch.shade, rTip: f(tip.radius), rBase: f(N[ch.nodes[1]].radius), born: f(N[ch.nodes[1]].born), tipBorn: f(tip.born), sagBase: f(N[ch.nodes[1]].sag), sagTip: f(tip.sag), baseSub: f(N[ch.nodes[1]].subLen), light: [f(minL), f(maxL)], baseY: f(b.wy), baseR: f(Math.hypot(b.wx, b.wz)), tipY: f(tip.wy), tipRestY: f(tip.ry), parentOrder: s.chains[b.chain].order, restDy: f(N[ch.nodes[1]].dy) });
      }
      rows.sort((a, b) => b.drop - a.drop);
      return { t: f(s.time), nodes: N.length, chains: s.chains.length, liveChains: live, liveNodes, leaves: s.leaves.length, height: f(s.bboxMax[1]), bboxMinY: f(s.bboxMin[1]), nodesBelow2m: below2, steepSegs: steep, restSteepSegs: restSteep, lowestSteepY: f(lowBare), lowestLeafyY: f(crownLow), sagMax: f(sagMax), nodesAtSagCap: sagCap, hangChains: rows.length, rows: rows.slice(0, verbose) };
    }, Number(process.env.ROWS ?? 12));
    const { rows, ...sum } = r;
    console.log(JSON.stringify(sum));
    for (const x of rows) console.log('  ', JSON.stringify(x));
  }
} finally { await browser.close(); }

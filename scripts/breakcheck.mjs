// Breakage sim check (audit WP10): grow to t = 90, breakAt on an order-1 chain base, assert the detached subtree is
// pruned, no bud references it, topology changed, and the app keeps running for 10 s.
// Usage: node scripts/breakcheck.mjs http://127.0.0.1:5401/   (built app; GPU=vulkan default, GPU=swiftshader)
import { chromium } from 'playwright-core';
const url = process.argv[2] ?? 'http://127.0.0.1:5401/';
const GPU = process.env.GPU ?? 'vulkan';
const browser = await chromium.launch({ executablePath: '/usr/sbin/chromium', args: GPU === 'swiftshader'
  ? ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist']
  : ['--headless=new', '--use-gl=angle', `--use-angle=${GPU}`, '--enable-gpu', '--ignore-gpu-blocklist'] });
let fail = 0;
const check = (name, ok, info = '') => { console.log(`${ok ? 'ok  ' : 'FAIL'} ${name} ${info}`); if (!ok) fail++; };
try {
  for (const [mode, q] of [['limb', 'big'], ['twig', 'twig']]) {
    const page = await browser.newPage({ viewport: { width: 1000, height: 700 } });
    const errs = [];
    page.on('pageerror', (e) => errs.push(e.message));
    page.on('console', (m) => m.type() === 'error' && errs.push(m.text()));
    await page.goto(`${url}?cycle=false&nogui=1&cinema=false&speed=0`);
    await page.waitForFunction(() => window.__arbor !== undefined);
    const r = await page.evaluate((q) => {
      const A = window.__arbor, S = A.sim;
      A.fastForward(90);
      const topo0 = S.topology, chains0 = S.chains.filter((c) => !c.pruned).length, nodes0 = S.nodes.length;
      const ev = q === 'twig' ? A.breakTwig() : A.breakLimb('big');
      if (!ev) return { ev: null };
      const inSub = new Uint8Array(S.nodes.length);
      for (const i of ev.nodeIds) inSub[i] = 1;
      // Independent subtree walk (parent links) to cross-check the event's node list.
      let walk = 0;
      for (let i = 0; i < S.nodes.length; i++) { let j = i; while (j >= 0 && j !== ev.root) j = S.nodes[j].parent; if (j === ev.root) { walk++; if (!inSub[i]) walk = -1e9; } }
      let unpruned = 0, mixed = 0, badChainRef = 0;
      for (let c = 0; c < S.chains.length; c++) {
        const ch = S.chains[c];
        const own = ch.nodes.slice(1);
        const inn = own.filter((i) => inSub[i]).length;
        if (inn > 0 && !ch.pruned) unpruned++;
        if (inn > 0 && inn < own.length) mixed++;
        for (const i of own) if (S.nodes[i].chain !== c) badChainRef++;
      }
      const prunedNode = (i) => S.chains[S.nodes[i].chain].pruned;
      const badBuds = S.buds.filter((b) => inSub[b.node] || prunedNode(b.node) || S.chains[b.chain].pruned).length;
      const stub = S.nodes[S.nodes[ev.root].parent];
      return { ev: { root: ev.root, nodes: ev.nodeIds.length, chains: ev.chains.length, leaves: ev.leaves, radius: +ev.radius.toFixed(4) }, walk, unpruned, mixed, badChainRef, badBuds,
        topo: S.topology - topo0, chains0, chains1: S.chains.filter((c) => !c.pruned).length, nodes0, nodes1: S.nodes.length, stubAlive: !S.chains[stub.chain].pruned, breaks: S.breaks.length };
    }, q);
    check(`${mode}: break event`, !!r.ev, JSON.stringify(r.ev));
    if (r.ev) {
      check(`${mode}: event node list equals the parent-link subtree`, r.walk === r.ev.nodes, `walk ${r.walk}`);
      check(`${mode}: every descendant chain pruned, none half detached, node.chain consistent`, r.unpruned === 0 && r.mixed === 0 && r.badChainRef === 0, `unpruned ${r.unpruned} mixed ${r.mixed} badRef ${r.badChainRef}`);
      check(`${mode}: no bud on a pruned node`, r.badBuds === 0, `bad ${r.badBuds}`);
      check(`${mode}: topology changed, stub stays`, r.topo > 0 && r.stubAlive && r.chains1 <= r.chains0 && r.ev.chains >= 1, `topo +${r.topo} live chains ${r.chains0}→${r.chains1}`);
    }
    // Keep running (growing) for 10 s.
    await page.evaluate(() => { const A = window.__arbor; A.params.time.speed = 1; A.params.time.paused = false; });
    await page.waitForTimeout(10000);
    const a = await page.evaluate(() => { const A = window.__arbor, S = A.sim; const pr = (i) => S.chains[S.nodes[i].chain].pruned;
      return { fe: A.frameErrors(), t: S.time, badBuds: S.buds.filter((b) => pr(b.node)).length, debris: A.debris?.stats ?? null, leafInst: A.leaves.mesh.count, programs: A.stage.renderer.info.programs.length }; });
    check(`${mode}: runs 10 s after the break, frameErrors 0, no console errors, still no bud on pruned wood`, a.fe === 0 && errs.length === 0 && a.t > 91 && a.badBuds === 0, JSON.stringify(a) + ' ' + errs.slice(0, 3).join(' | '));
    await page.close();
  }
} finally { await browser.close(); }
console.log(fail ? `${fail} FAIL` : 'all ok');
process.exit(fail ? 1 : 0);

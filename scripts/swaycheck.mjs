// Bend profiles of the wind sway in a held wind: sapling and grown oak, growth running and paused.
// Usage: node scripts/swaycheck.mjs http://localhost:5477/   env: GPU=vulkan, AGES=20,90, WX=storm,windy, SPEEDS=1,0,
//        MS=4000, PROFILES=3 (print leader + N longest chains), TOL=0.05 (rad), KINK=0.15, TIP=0.75
// Exit 1 when wood that kept its rotation is drawn more than TOL straighter than wood nearer the chain base, the lean
// falls more than KINK from one segment to the next, or a tip's offset is < TIP x its parent's (see swayprobe.mjs).
import { chromium } from 'playwright-core';
import { swayProbe } from './swayprobe.mjs';
const url = process.argv[2] ?? 'http://localhost:5477/';
const E = process.env, TOL = Number(E.TOL ?? 0.05), TIP = Number(E.TIP ?? 0.75), KINK = Number(E.KINK ?? 0.15);
const browser = await chromium.launch({ executablePath: '/usr/sbin/chromium', args: ['--headless=new', '--use-gl=angle', `--use-angle=${E.GPU ?? 'vulkan'}`, '--enable-gpu', '--ignore-gpu-blocklist'] });
let bad = 0;
const short = (p) => p.map((r) => `${r.j}:r${(r.r * 1000).toFixed(1)}mm y${r.rest[1]} off${r.off} lean${r.lean} th${r.th}`).join('\n      ');
try {
  for (const age of (E.AGES ?? '20,90').split(',').map(Number)) for (const wx of (E.WX ?? 'storm,windy').split(',')) for (const speed of (E.SPEEDS ?? '1,0').split(',')) {
    const ctx = await browser.newContext(E.MODE === 'phone' ? { viewport: { width: 412, height: 915 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true } : { viewport: { width: 800, height: 600 } }); // MODE=phone: Low quality path
    const page = await ctx.newPage(); const errs = [];
    page.on('pageerror', (e) => errs.push(e.message));
    await page.goto(`${url}?cycle=false&nogui=1&hideui=1&speed=0&cinema=false&lightning=0&weather=${wx}`);
    await page.waitForFunction(() => window.__arbor !== undefined);
    await page.evaluate(([age, speed]) => { const A = window.__arbor; A.fastForward(age); A.params.time.speed = Number(speed); A.params.time.paused = false; }, [age, speed]);
    await page.waitForTimeout(2500);
    const r = await page.evaluate(swayProbe, { ms: Number(E.MS ?? 4000), profiles: Number(E.PROFILES ?? 0) });
    const fail = r.maxFlat > TOL || r.maxKink > KINK || r.minTipRatio < TIP || errs.length > 0;
    if (fail) bad++;
    console.log(`${fail ? 'FAIL' : 'ok  '} t=${age} ${wx} speed=${speed}: frames ${r.frames} chains ${r.chains} simTime ${r.t0.toFixed(2)}->${r.t1.toFixed(2)} nodes ${r.n0}->${r.n1} maxOffset ${r.maxOffset} m maxLean ${r.maxLean} rad | lean lost with rotation kept ${r.maxFlat} rad (frames > 0.05: ${r.dropFrames}), worst kink ${r.maxKink} rad, any lean drop ${r.maxDrop} rad | min tip/parent offset ${r.minTipRatio} ${JSON.stringify(r.worstTip)} errs ${errs.length}`);
    if (r.worst && (fail || E.PROFILES)) console.log(`    worst chain ${r.worst.chain} (order ${r.worst.order}, ${r.worst.nodes} nodes, sim t ${r.worst.simTime}):\n      ${short(r.worst.profile)}`);
    if (r.leader) console.log(`    leader:\n      ${short(r.leader)}`);
    for (const c of r.long ?? []) console.log(`    chain ${c.chain} (order ${c.order}):\n      ${short(c.profile)}`);
    await ctx.close();
  }
} finally { await browser.close(); }
process.exit(bad ? 1 : 0);

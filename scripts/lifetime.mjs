// Lifetime (`growth.years`, docs/bigtree.md 6.16) read from the running app: what every preset and start-screen kind
// defaults to on desktop and on the phone path, the Lifetime control on both layouts (screenshots), the remembered
// choice across a reload, and a live switch on a tree that has stopped.
// Usage: node scripts/lifetime.mjs URL [table,control,switch]   (built app; PREFIX=life)
import { mkdirSync } from 'node:fs';
import { chromium } from 'playwright-core';
const url = process.argv[2] ?? 'http://127.0.0.1:5880/', what = (process.argv[3] ?? 'table,control,switch').split(','), PREFIX = process.env.PREFIX ?? 'life';
mkdirSync('shots', { recursive: true });
const browser = await chromium.launch({ executablePath: '/usr/sbin/chromium', args: ['--headless=new', '--use-gl=angle', '--use-angle=vulkan', '--enable-gpu', '--ignore-gpu-blocklist'] });
const DEV = {
  desk: { viewport: { width: 1280, height: 800 }, deviceScaleFactor: 1 },
  phone: { viewport: { width: 411, height: 777 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, userAgent: 'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Mobile Safari/537.36' },
};
const Q = 'cycle=false&timeOfDay=13&weather=calm&cinema=false';
const state = (page) => page.evaluate(() => { const a = window.__arbor; return { param: a.params.growth.years, sim: a.sim.years, shift: a.sim.yearShift, maxNodes: a.params.growth.maxNodes, nodes: a.sim.nodes.length, t: +a.sim.time.toFixed(0), h: +a.sim.bboxMax[1].toFixed(2), stored: localStorage.getItem('arbor.years'), pressed: document.querySelector('.ap-life[aria-pressed="true"]')?.textContent ?? null, note: document.querySelector('#arbor-lifetime + .ap-note')?.textContent ?? null }; });
const open = async (ctx, q) => { const page = await ctx.newPage(); page.setDefaultTimeout(240000); page.on('pageerror', (e) => console.log('[pageerror]', e.message)); await page.goto(`${url}?${q}`, { timeout: 240000 }); await page.waitForFunction(() => window.__arbor !== undefined, null, { timeout: 240000 }); return page; };
const ff = async (page, T) => { while (await page.evaluate(() => window.__arbor.sim.time) < T - 0.01) await page.evaluate((T) => window.__arbor.fastForward(Math.min(15, T - window.__arbor.sim.time)), T); };
try {
  if (what.includes('table')) for (const dev of ['desk', 'phone']) for (const extra of ['', '&years=3', '&years=0']) {
    const ctx = await browser.newContext(DEV[dev]);
    const page = await open(ctx, `start=0&speed=0&${Q}${extra}`);
    const names = await page.evaluate(() => window.__arbor.presetNames ?? [...document.querySelectorAll('.ap-chip[data-preset]')].map((e) => e.dataset.preset));
    const out = [];
    for (const n of names) { await page.evaluate((n) => window.__arbor.loadPreset(n), n); await page.waitForTimeout(150); const s = await state(page); out.push(`${n}: ${s.sim > 1 ? s.sim : 1} (sim.years ${s.sim}, maxNodes ${s.maxNodes})`); }
    console.log(`PRESETS ${dev}${extra || ' default'} | ${out.join(' | ')}`);
    // Start-screen kinds: rolls until every kind was seen; the kind is the title's first word (or the world's name).
    const seen = {};
    await page.evaluate(() => document.querySelector('#arbor-choose').click());
    for (let roll = 1; roll <= 140 && Object.keys(seen).length < 10; roll++) {
      const r = await page.evaluate((roll) => { const a = window.__arbor; a.start().open(roll); return { name: document.querySelector('#arbor-start-name').textContent, facts: document.querySelector('#arbor-start-facts').textContent, param: a.params.growth.years, sim: a.sim.years, maxNodes: a.params.growth.maxNodes }; }, roll).catch((e) => ({ err: String(e).slice(0, 200) }));
      if (r.err) { console.log('roll failed', r.err); break; }
      const kind = /^(Broad|Slender|Spreading|Young)/.exec(r.name)?.[1] ?? r.name;
      if (!seen[kind]) seen[kind] = `${kind} (roll ${roll}): ${r.sim > 1 ? r.sim : 1} (sim.years ${r.sim}, maxNodes ${r.maxNodes}; facts "${r.facts}")`;
    }
    console.log(`KINDS ${dev}${extra || ' default'} | ${Object.values(seen).join(' | ')}`);
    if (!extra) { await page.screenshot({ path: `shots/${PREFIX}-start-${dev}.jpg`, type: 'jpeg', quality: 88 }); }
    await ctx.close();
  }
  if (what.includes('control')) for (const dev of ['desk', 'phone']) {
    const ctx = await browser.newContext(DEV[dev]);
    let page = await open(ctx, `start=0&panel=open&tab=grow&${Q}`);
    await page.waitForTimeout(2500);
    console.log(`CONTROL ${dev} fresh`, JSON.stringify(await state(page)));
    await page.screenshot({ path: `shots/${PREFIX}-control-${dev}-default.jpg`, type: 'jpeg', quality: 88 });
    const other = dev === 'phone' ? 3 : 1;
    await page.locator(`.ap-life[data-years="${other}"]`).click();
    await page.waitForTimeout(1500);
    console.log(`CONTROL ${dev} after click ${other}`, JSON.stringify(await state(page)));
    await page.screenshot({ path: `shots/${PREFIX}-control-${dev}-set${other}.jpg`, type: 'jpeg', quality: 88 });
    await page.close();
    page = await open(ctx, `start=0&panel=open&tab=grow&${Q}`);
    await page.waitForTimeout(1500);
    console.log(`CONTROL ${dev} after reload (remembered)`, JSON.stringify(await state(page)));
    await page.evaluate(() => window.__arbor.loadPreset('Weeping willow')); await page.waitForTimeout(600);
    console.log(`CONTROL ${dev} remembered, willow`, JSON.stringify(await state(page)));
    await page.close();
    page = await open(ctx, `start=0&panel=open&tab=grow&${Q}&years=${dev === 'phone' ? 0 : 3}`);
    await page.waitForTimeout(1000);
    console.log(`CONTROL ${dev} remembered, but link says years=${dev === 'phone' ? 0 : 3}`, JSON.stringify(await state(page)));
    await ctx.close();
  }
  if (what.includes('switch')) for (const dev of ['desk', 'phone']) {
    // A one-year tree that has long stopped (t = 700, growth clock in "year 3"): 3 years continues at the next bud break.
    const ctx = await browser.newContext(DEV[dev]);
    const page = await open(ctx, `start=0&panel=open&tab=grow&speed=0&season.on=false&${Q}${dev === 'desk' ? '' : ''}`);
    if (dev === 'desk') { await page.locator('.ap-life[data-years="1"]').click(); await page.evaluate(() => window.__arbor.loadPreset('Oak meadow')); }
    await ff(page, 700);
    console.log(`SWITCH ${dev} one-year tree at 700`, JSON.stringify(await state(page)));
    await page.locator('.ap-life[data-years="3"]').click();
    for (const T of [701, 800, 864, 900, 1000, 1050, 1164, 1350, 1700]) { await ff(page, T); const s = await state(page); console.log(`SWITCH ${dev} t=${T} years ${s.sim} shift ${s.shift} nodes ${s.nodes} h ${s.h} maxNodes ${s.maxNodes}`); }
    await page.screenshot({ path: `shots/${PREFIX}-switch-${dev}.jpg`, type: 'jpeg', quality: 88 });
    // Back to 1 year in the middle of a later growing season: the season finishes, then the tree stops.
    await ctx.close();
  }
} finally { await browser.close(); }

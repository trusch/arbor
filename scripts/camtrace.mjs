// Camera trace: orbit + zoom by hand (desktop mouse/wheel, phone touch/pinch via CDP), then log camera position,
// target and the camera flags once a second. Usage: node scripts/camtrace.mjs [url] [seconds=30]
import { chromium } from 'playwright-core';
const url = process.argv[2] ?? 'http://10.77.0.2:8050/';
const secs = Number(process.argv[3] ?? 30);
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM ?? '/usr/sbin/chromium',
  args: ['--headless=new', '--use-gl=angle', `--use-angle=${process.env.SMOKE_GPU ?? 'vulkan'}`, '--enable-gpu', '--ignore-gpu-blocklist'],
});
const snap = (page) => page.evaluate(() => {
  const a = window.__arbor, s = a.stage, c = s.camera.position, t = s.controls.target;
  return { p: [c.x, c.y, c.z], t: [t.x, t.y, t.z], d: c.distanceTo(t), af: a.params.camera.autoFrame, cin: a.params.camera.cinema, manual: s.manual, age: a.sim.time };
});
const fmt = (s) => `pos ${s.p.map((v) => v.toFixed(3)).join(',')}  tgt ${s.t.map((v) => v.toFixed(3)).join(',')}  dist ${s.d.toFixed(3)}  autoFrame=${s.af} cinema=${s.cin} manual=${s.manual} age=${s.age.toFixed(1)}`;
const trace = async (name, page) => {
  const s0 = await snap(page);
  console.log(`${name} t=0   ${fmt(s0)}`);
  for (let i = 1; i <= secs; i++) {
    await page.waitForTimeout(1000);
    const s = await snap(page);
    const dp = Math.hypot(...s.p.map((v, j) => v - s0.p[j])), dt = Math.hypot(...s.t.map((v, j) => v - s0.t[j]));
    console.log(`${name} t=${String(i).padEnd(3)} ${fmt(s)}  moved pos ${dp.toFixed(3)} tgt ${dt.toFixed(3)}`);
  }
};
{
  const page = await browser.newPage({ viewport: { width: 1024, height: 640 } });
  await page.goto(`${url}?cycle=false&quality=Low&panel=closed`);
  await page.waitForFunction(() => window.__arbor !== undefined);
  await page.waitForTimeout(3000);
  console.log('desktop before input  ' + fmt(await snap(page)));
  await page.mouse.move(400, 250); await page.mouse.down(); await page.mouse.move(560, 300, { steps: 10 }); await page.mouse.up();
  await page.mouse.wheel(0, -400);
  await page.waitForTimeout(1500); // damping settles
  await trace('desktop', page);
  await page.close();
}
{
  const ctx = await browser.newContext({ viewport: { width: 412, height: 915 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true,
    userAgent: 'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Mobile Safari/537.36' });
  const page = await ctx.newPage();
  await page.goto(`${url}?cycle=false&panel=closed`);
  await page.waitForFunction(() => window.__arbor !== undefined);
  await page.waitForTimeout(3000);
  console.log('phone before input  ' + fmt(await snap(page)));
  const cdp = await ctx.newCDPSession(page);
  const T = (type, pts) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: pts.map(([x, y], id) => ({ x, y, id })) });
  await T('touchStart', [[120, 300]]);
  for (let i = 1; i <= 8; i++) { await T('touchMove', [[120 + i * 15, 300 + i * 4]]); await page.waitForTimeout(30); }
  await T('touchEnd', []);
  await page.waitForTimeout(300);
  await T('touchStart', [[180, 350], [230, 350]]);
  for (let i = 1; i <= 8; i++) { await T('touchMove', [[180 - i * 8, 350], [230 + i * 8, 350]]); await page.waitForTimeout(30); }
  await T('touchEnd', []);
  await page.waitForTimeout(1500);
  await trace('phone', page);
  await ctx.close();
}
await browser.close();

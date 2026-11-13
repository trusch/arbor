// Leaf form shots on the real GPU (ANGLE Vulkan): for every form a framed view and a crown close-up, on desktop High
// and in phone emulation, switched LIVE on one grown tree per mode (so this also exercises the data-only swap), plus
// a contact sheet of the painted maps and the picker on the phone layout. Prints the program count per form.
// Usage: PORT=5440 node scripts/formshots.mjs [prefix=form] [modes=desk,phone] [forms=all] [extraQuery]
import { spawn } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { chromium } from 'playwright-core';

const prefix = process.argv[2] ?? 'form';
const modes = (process.argv[3] ?? 'desk,phone').split(',');
const only = process.argv[4] && process.argv[4] !== 'all' ? process.argv[4].split(',') : null;
const extra = process.argv[5] ?? '';
const PORT = Number(process.env.PORT ?? 5440);
mkdirSync('shots', { recursive: true });
const vite = spawn('npx', ['vite', '--port', String(PORT), '--strictPort'], { stdio: ['ignore', 'pipe', 'inherit'] });
await new Promise((res) => vite.stdout.on('data', (d) => String(d).includes('Local') && res()));
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM ?? '/usr/sbin/chromium',
  args: ['--headless=new', '--use-gl=angle', `--use-angle=${process.env.GPU ?? 'vulkan'}`, '--enable-gpu', '--ignore-gpu-blocklist'],
});
const PHONE = { viewport: { width: 411, height: 777 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, userAgent: 'Mozilla/5.0 (Linux; Android 15; Pixel) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0 Mobile Safari/537.36' };
const base = `http://localhost:${PORT}/?cycle=false&speed=0&autoRotate=false&cinema=false&weather=calm&sway=0&leaffall=0`;
try {
  for (const mode of modes) {
    const ctx = await browser.newContext(mode === 'phone' ? PHONE : { viewport: { width: 1024, height: 640 } });
    const page = await ctx.newPage();
    page.on('pageerror', (e) => console.error('[pageerror]', e.message));
    await page.goto(`${base}&nogui=1&hideui=1&${extra}`);
    await page.waitForFunction(() => window.__arbor !== undefined);
    if (mode === modes[0]) {
      const url = await page.evaluate(async () => {
        const T = await import('/src/render/textures.ts');
        const n = T.LEAF_FORMS.length, c = document.createElement('canvas');
        c.width = 5 * 260; c.height = Math.ceil(n / 5) * 260;
        const g = c.getContext('2d');
        g.fillStyle = '#20242a'; g.fillRect(0, 0, c.width, c.height);
        T.LEAF_FORMS.forEach((f, i) => { const s = T.leafFormCanvas(f.id, 512), h = 250 * Math.min(1, 1 / f.aspect), w = h * f.aspect; g.drawImage(s, (i % 5) * 260 + (260 - w) / 2, Math.floor(i / 5) * 260 + (260 - h) / 2, w, h); });
        return c.toDataURL('image/png');
      });
      writeFileSync(`shots/${prefix}-sheet.png`, Buffer.from(url.split(',')[1], 'base64'));
      console.log(`shots/${prefix}-sheet.png`);
    }
    const forms = only ?? await page.evaluate(async () => (await import('/src/render/textures.ts')).LEAF_FORMS.map((f) => f.id));
    await page.evaluate(() => window.__arbor.fastForward(90));
    await page.waitForTimeout(6000);
    for (const f of forms) {
      await page.evaluate((id) => { const A = window.__arbor; A.automation.userSet('leaves.form', id); A.params.camera.autoFrame = true; A.fastForward(0); }, f);
      await page.waitForTimeout(900);
      await page.screenshot({ path: `shots/${prefix}-${mode}-${f}-framed.png` });
      await page.evaluate(() => {
        const A = window.__arbor, s = A.sim, st = A.stage, d = 1.5;
        A.params.camera.autoFrame = false;
        const mn = s.bboxMin, mx = s.bboxMax, cx = (mn[0] + mx[0]) / 2, cz = (mn[2] + mx[2]) / 2, rx = (mx[0] - mn[0]) / 2, y = mn[1] + (mx[1] - mn[1]) * 0.72;
        st.controls.target.set(cx + rx * 0.75, y, cz);
        st.camera.position.set(cx + rx * 0.75 + d, y + 0.25 * d, cz + 0.5 * d);
        st.controls.update();
        A.fastForward(0);
      });
      await page.waitForTimeout(900);
      await page.screenshot({ path: `shots/${prefix}-${mode}-${f}-close.png` });
      const info = await page.evaluate(() => { const A = window.__arbor; return { programs: A.stage.renderer.info.programs.length, leaves: A.leaves.mesh.count, form: A.leaves.formId, mode: A.leaves.mode.shader, fe: A.frameErrors() }; });
      console.log(mode, f, JSON.stringify(info));
    }
    await ctx.close();
  }
  if (modes.includes('phone')) {
    const ctx = await browser.newContext(PHONE);
    const page = await ctx.newPage();
    await page.goto(`${base}&panel=open&tab=colours`);
    await page.waitForFunction(() => window.__arbor !== undefined);
    await page.waitForTimeout(2500);
    await page.screenshot({ path: `shots/${prefix}-picker-phone.png` });
    console.log(`shots/${prefix}-picker-phone.png`);
    await ctx.close();
  }
} finally { await browser.close(); vite.kill(); }

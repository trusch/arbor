import * as THREE from 'three';
import { Rng } from '../sim/rng';

/** Periodic value noise on an integer lattice (tileable with periods px, py). */
function makeNoise(seed: number) {
  const rng = new Rng(seed);
  const perm = new Float32Array(4096).map(() => rng.next());
  const h = (x: number, y: number) => perm[((x * 73856093) ^ (y * 19349663)) & 4095];
  return (x: number, y: number, px: number, py: number) => {
    const ix = Math.floor(x), iy = Math.floor(y);
    const fx = x - ix, fy = y - iy;
    const ux = fx * fx * (3 - 2 * fx), uy = fy * fy * (3 - 2 * fy);
    const m = (v: number, p: number) => ((v % p) + p) % p;
    const x0 = m(ix, px), x1 = m(ix + 1, px), y0 = m(iy, py), y1 = m(iy + 1, py);
    const a = h(x0, y0), b = h(x1, y0), c = h(x0, y1), d = h(x1, y1);
    return a + (b - a) * ux + (c - a) * uy + (a - b - c + d) * ux * uy;
  };
}

function fbm(noise: ReturnType<typeof makeNoise>, x: number, y: number, px: number, py: number, oct: number) {
  let s = 0, a = 0.5, f = 1;
  for (let o = 0; o < oct; o++) {
    s += a * noise(x * f, y * f, px * f, py * f);
    a *= 0.5;
    f *= 2;
  }
  return s;
}

export interface BarkTextures {
  map: THREE.Texture;
  normalMap: THREE.Texture;
  roughnessMap: THREE.Texture;
}

/** Furrowed bark: vertical ridges with fbm breakup. Tileable. */
export function makeBarkTextures(): BarkTextures {
  const W = 256, H = 512;
  const noise = makeNoise(7);
  const hgt = new Float32Array(W * H);
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      const u = (x / W) * 8, v = (y / H) * 4;
      const warp = fbm(noise, u * 0.5, v * 2, 4, 8, 3) * 2.5;
      const ridge = 1 - Math.abs(Math.sin((u + warp) * Math.PI));
      const plates = fbm(noise, u, v * 6, 8, 24, 4);
      hgt[y * W + x] = Math.pow(ridge, 0.6) * 0.7 + plates * 0.5;
    }
  const mk = () => {
    const c = document.createElement('canvas');
    c.width = W;
    c.height = H;
    return c;
  };
  const cc = mk(), cn = mk(), cr = mk();
  const ic = cc.getContext('2d')!.createImageData(W, H);
  const inn = cn.getContext('2d')!.createImageData(W, H);
  const ir = cr.getContext('2d')!.createImageData(W, H);
  const at = (x: number, y: number) => hgt[((y + H) % H) * W + ((x + W) % W)];
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      const i = (y * W + x) * 4;
      const v = at(x, y);
      const tone = 0.25 + 0.75 * v;
      ic.data[i] = 120 * tone + 40; ic.data[i + 1] = 104 * tone + 34; ic.data[i + 2] = 88 * tone + 30; ic.data[i + 3] = 255;
      const dx = (at(x + 1, y) - at(x - 1, y)) * 4, dy = (at(x, y + 1) - at(x, y - 1)) * 4;
      const l = Math.hypot(dx, dy, 1);
      inn.data[i] = (-dx / l * 0.5 + 0.5) * 255; inn.data[i + 1] = (dy / l * 0.5 + 0.5) * 255; inn.data[i + 2] = (1 / l * 0.5 + 0.5) * 255; inn.data[i + 3] = 255;
      const r = 200 + 55 * (1 - v);
      ir.data[i] = ir.data[i + 1] = ir.data[i + 2] = r; ir.data[i + 3] = 255;
    }
  cc.getContext('2d')!.putImageData(ic, 0, 0);
  cn.getContext('2d')!.putImageData(inn, 0, 0);
  cr.getContext('2d')!.putImageData(ir, 0, 0);
  const tex = (c: HTMLCanvasElement, srgb: boolean) => {
    const t = new THREE.CanvasTexture(c);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.colorSpace = srgb ? THREE.SRGBColorSpace : THREE.NoColorSpace;
    t.anisotropy = 8;
    return t;
  };
  return { map: tex(cc, true), normalMap: tex(cn, false), roughnessMap: tex(cr, false) };
}

/**
 * Painted oak leaf (512 px, base at bottom centre, tip at top) on a transparent background: obovate lobed outline with
 * asymmetric lobes and fine marginal teeth, base→tip colour gradient, lighter tapering midrib and secondary veins running
 * into the lobes, blotches/speckles, darker margins and a baked soft highlight band. Real albedo colours: instance colours
 * are divided by the map mean (`mapMeanColor` in leaves.ts), so only the relative variation shows.
 */
export function makeLeafTexture(): THREE.Texture {
  const S = 512, cx = S / 2, yB = S * 0.985, yT = S * 0.015, L = yB - yT;
  const rng = new Rng(29);
  const noise = makeNoise(17);
  const c = document.createElement('canvas');
  c.width = c.height = S;
  const g = c.getContext('2d')!;
  g.clearRect(0, 0, S, S);
  // Half-width profile along t (0 = base, 1 = tip): obovate envelope × rounded lobes (5 per side, sides out of phase).
  const NL = 5;
  const env = (t: number) => 0.47 * S * Math.pow(Math.sin(Math.PI * Math.min(1, t * 0.86 + 0.02)), 0.8) * (0.55 + 0.45 * Math.min(1, t * 1.6));
  const lobe = (t: number, side: number) => {
    const ph = t * NL + (side > 0 ? 0.0 : 0.38) + 0.15;
    const f = ph - Math.floor(ph);
    const bump = Math.pow(Math.sin(Math.PI * f), 0.55); // rounded lobe, sharp-ish sinus
    const sinusDepth = 0.42 * smoothstep(0.05, 0.25, t) * (1 - 0.6 * smoothstep(0.75, 1, t));
    return 1 - sinusDepth * (1 - bump);
  };
  const half = (t: number, side: number) => {
    if (t <= 0 || t >= 1) return 0;
    const teeth = 1 + 0.025 * Math.sin(t * 140 + side * 1.7) * smoothstep(0.1, 0.3, t);
    return env(t) * lobe(t, side) * teeth * (side > 0 ? 1 : 0.94);
  };
  // Midrib curves slightly.
  const mid = (t: number) => cx + S * 0.025 * Math.sin(t * Math.PI * 0.9);
  const yAt = (t: number) => yB - t * L;
  g.beginPath();
  const N = 400;
  g.moveTo(mid(0), yAt(0));
  for (let i = 1; i <= N; i++) { const t = i / N; g.lineTo(mid(t) + half(t, 1), yAt(t)); }
  for (let i = N; i >= 0; i--) { const t = i / N; g.lineTo(mid(t) - half(t, -1), yAt(t)); }
  g.closePath();
  // Base colour: yellow-green at the base → deeper green at the tip.
  const grad = g.createLinearGradient(0, yB, 0, yT);
  grad.addColorStop(0, '#8fa64a');
  grad.addColorStop(0.35, '#6e9038');
  grad.addColorStop(1, '#4f7a2c');
  g.fillStyle = grad;
  g.fill();
  // Veins: lighter, tapering. Secondary veins run from the midrib into each lobe tip.
  const vein = (pts: [number, number][], w0: number, w1: number, col: string) => {
    g.strokeStyle = col;
    g.lineCap = 'round';
    for (let i = 1; i < pts.length; i++) {
      g.lineWidth = w0 + (w1 - w0) * (i / (pts.length - 1));
      g.beginPath(); g.moveTo(pts[i - 1][0], pts[i - 1][1]); g.lineTo(pts[i][0], pts[i][1]); g.stroke();
    }
  };
  const midPts: [number, number][] = [];
  for (let i = 0; i <= 40; i++) { const t = (i / 40) * 0.97; midPts.push([mid(t), yAt(t)]); }
  vein(midPts, 9, 1.5, 'rgba(196,206,120,0.85)');
  for (const side of [1, -1]) {
    for (let k = 0; k < NL; k++) {
      const off = (side > 0 ? 0.0 : 0.38) + 0.15;
      const tl = (k + 0.5 - off) / NL; // lobe centre
      if (tl < 0.08 || tl > 0.95) continue;
      const t0 = Math.max(0.03, tl - 0.09), pts: [number, number][] = [];
      for (let i = 0; i <= 12; i++) {
        const u = i / 12, t = t0 + (tl - t0) * Math.pow(u, 0.7);
        pts.push([mid(t) + side * half(tl, side) * 0.92 * u, yAt(t)]);
      }
      vein(pts, 4, 0.8, 'rgba(176,192,104,0.7)');
      // Tertiary veinlets off each secondary.
      for (let m = 1; m < 4; m++) {
        const [px, py] = pts[m * 3];
        const ang = -Math.PI / 2 + side * (0.5 + rng.next() * 0.5), len = S * (0.03 + rng.next() * 0.035);
        vein([[px, py], [px + Math.cos(ang) * len * 0.5 + side * len * 0.4, py + Math.sin(ang) * len * 0.5], [px + Math.cos(ang) * len + side * len * 0.6, py + Math.sin(ang) * len]], 1.6, 0.5, 'rgba(160,180,96,0.45)');
      }
    }
  }
  // Per-pixel pass: blotches, speckles, darker margins, baked highlight band.
  const img = g.getImageData(0, 0, S, S), d = img.data;
  for (let y = 0; y < S; y++) {
    const t = (yB - y) / L;
    if (t <= 0 || t >= 1) continue;
    const m = mid(t);
    for (let x = 0; x < S; x++) {
      const i = (y * S + x) * 4;
      if (d[i + 3] < 8) continue;
      const side = x >= m ? 1 : -1, hw = Math.max(1, half(t, side));
      const r = Math.abs(x - m) / hw; // 0 at midrib, 1 at the margin
      let k = 1;
      k *= 1 - 0.28 * smoothstep(0.72, 1.0, r);                                   // darker margin
      const bl = fbm(noise, (x / S) * 6, (y / S) * 6, 64, 64, 3);
      k *= 0.86 + 0.26 * bl;                                                      // blotches
      const sp = noise((x / S) * 90, (y / S) * 90, 128, 128);
      if (sp > 0.82) k *= 0.82;                                                   // speckles
      const band = Math.exp(-(((r - 0.38) / 0.18) ** 2)) * (side > 0 ? 1 : 0.55); // soft sheen across the blade
      const hl = 0.12 * band * (0.6 + 0.4 * Math.sin(t * Math.PI));
      d[i] = Math.min(255, d[i] * k + 255 * hl * 0.8);
      d[i + 1] = Math.min(255, d[i + 1] * k + 255 * hl);
      d[i + 2] = Math.min(255, d[i + 2] * k + 255 * hl * 0.55);
    }
  }
  g.putImageData(img, 0, 0);
  // Short petiole.
  vein([[mid(0), yB], [mid(0) - 2, S - 1]], 7, 5, '#7d8a40');
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}

function smoothstep(a: number, b: number, x: number) {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
}

/** Grass/meadow ground texture, tileable. */
export function makeGrassTexture(): THREE.Texture {
  const S = 512;
  const noise = makeNoise(3);
  const c = document.createElement('canvas');
  c.width = c.height = S;
  const g = c.getContext('2d')!;
  const img = g.createImageData(S, S);
  for (let y = 0; y < S; y++)
    for (let x = 0; x < S; x++) {
      const n = fbm(noise, (x / S) * 8, (y / S) * 8, 8, 8, 5);
      const fine = noise((x / S) * 128, (y / S) * 128, 128, 128);
      const i = (y * S + x) * 4;
      img.data[i] = 48 + 40 * n + 20 * fine;
      img.data[i + 1] = 72 + 50 * n + 30 * fine;
      img.data[i + 2] = 30 + 18 * n;
      img.data[i + 3] = 255;
    }
  g.putImageData(img, 0, 0);
  // Blade strokes.
  const rng = new Rng(11);
  for (let k = 0; k < 6000; k++) {
    const x = rng.next() * S, y = rng.next() * S;
    const l = 3 + rng.next() * 6;
    const a = -Math.PI / 2 + rng.range(-0.5, 0.5);
    const v = rng.next();
    g.strokeStyle = `rgba(${60 + v * 70},${90 + v * 80},${30 + v * 30},0.55)`;
    g.lineWidth = 1;
    for (const ox of [0, -S, S]) for (const oy of [0, -S, S]) {
      g.beginPath();
      g.moveTo(x + ox, y + oy);
      g.lineTo(x + ox + Math.cos(a) * l, y + oy + Math.sin(a) * l);
      g.stroke();
    }
  }
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}

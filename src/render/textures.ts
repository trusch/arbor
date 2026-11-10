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

/** Leaf shape with midrib and veins on a transparent background (white, tinted by material). */
export function makeLeafTexture(): THREE.Texture {
  const S = 256;
  const c = document.createElement('canvas');
  c.width = c.height = S;
  const g = c.getContext('2d')!;
  g.clearRect(0, 0, S, S);
  // Leaf outline: base at bottom centre, tip at top.
  g.beginPath();
  g.moveTo(S / 2, S * 0.98);
  g.bezierCurveTo(S * 0.02, S * 0.72, S * 0.12, S * 0.22, S / 2, S * 0.02);
  g.bezierCurveTo(S * 0.88, S * 0.22, S * 0.98, S * 0.72, S / 2, S * 0.98);
  const grad = g.createLinearGradient(0, S, 0, 0);
  grad.addColorStop(0, '#c8d8b0');
  grad.addColorStop(1, '#f2f6e6');
  g.fillStyle = grad;
  g.fill();
  g.strokeStyle = 'rgba(120,140,90,0.55)';
  g.lineWidth = 3;
  g.beginPath();
  g.moveTo(S / 2, S * 0.98);
  g.lineTo(S / 2, S * 0.06);
  g.stroke();
  g.lineWidth = 1.5;
  for (let k = 1; k < 8; k++) {
    const y = S * (0.9 - k * 0.1);
    for (const sgn of [-1, 1]) {
      g.beginPath();
      g.moveTo(S / 2, y);
      g.quadraticCurveTo(S / 2 + sgn * S * 0.12, y - S * 0.04, S / 2 + sgn * S * 0.28 * Math.sin((k / 8) * Math.PI), y - S * 0.1);
      g.stroke();
    }
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
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

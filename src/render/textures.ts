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
function oakLeafCanvas(): HTMLCanvasElement {
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
  return c;
}

// ---- Leaf forms -------------------------------------------------------------------------------------------------
// Every form is painted into a square map that it fills; `aspect` (blade width / length) and `len` (length relative
// to the oak) give the card its real proportions through the instance matrices (`Leaves.place`). Painters work in
// "leaf space": x right, y up, base at (0, 0), tip near (0, 1), half-width aspect / 2; line widths are in the same units.

type Pt = [number, number];
interface Kit {
  g: CanvasRenderingContext2D;
  rng: Rng;
  /** Fill a blade outline (base-to-tip gradient, darker margin), then run `inner` (veins) clipped to it. */
  blade(path: Path2D, rule: CanvasFillRule, inner?: () => void): void;
  /** Tapering polyline. */
  vein(pts: Pt[], w0: number, w1: number, col: string | CanvasGradient): void;
  grad: CanvasGradient;
}
export interface LeafForm {
  id: string;
  name: string;
  /** Blade width / length of the painted form. */
  aspect: number;
  /** Card length relative to the oak card. */
  len: number;
  paint?: (k: Kit) => void;
}
const VEIN = 'rgba(196,206,120,0.85)', VEIN2 = 'rgba(176,192,104,0.7)', VEIN3 = 'rgba(160,180,96,0.5)', STALK = '#7d8a40';
const frac = (x: number) => x - Math.floor(x);
const toPath = (pts: Pt[]) => { const p = new Path2D(); pts.forEach(([x, y], i) => (i ? p.lineTo(x, y) : p.moveTo(x, y))); p.closePath(); return p; };
/** Outline of a blade along +y from y0 to y1: right margin up, left margin down. */
function bladePts(half: (u: number, side: number) => number, mid: (u: number) => number, y0: number, y1: number, N = 260): Pt[] {
  const pts: Pt[] = [];
  for (let i = 0; i <= N; i++) { const u = i / N; pts.push([mid(u) + half(u, 1), y0 + (y1 - y0) * u]); }
  for (let i = N; i >= 0; i--) { const u = i / N; pts.push([mid(u) - half(u, -1), y0 + (y1 - y0) * u]); }
  return pts;
}
/** Closed outline r(theta) around (cx, cy); theta = 0 points up, positive toward +x. */
function polarPts(cx: number, cy: number, r: (th: number) => number, a0 = -Math.PI, a1 = Math.PI, N = 420): Pt[] {
  const pts: Pt[] = [];
  for (let i = 0; i <= N; i++) { const th = a0 + ((a1 - a0) * i) / N, rr = r(th); pts.push([cx + rr * Math.sin(th), cy + rr * Math.cos(th)]); }
  return pts;
}
const rot = (pts: Pt[], a: number, ox: number, oy: number): Pt[] => pts.map(([x, y]) => [ox + x * Math.cos(a) + y * Math.sin(a), oy - x * Math.sin(a) + y * Math.cos(a)]);
const line = (a: Pt, b: Pt, n = 8, bow = 0): Pt[] => {
  const pts: Pt[] = [], nx = -(b[1] - a[1]), ny = b[0] - a[0];
  for (let i = 0; i <= n; i++) { const t = i / n, k = bow * Math.sin(Math.PI * t); pts.push([a[0] + (b[0] - a[0]) * t + nx * k, a[1] + (b[1] - a[1]) * t + ny * k]); }
  return pts;
};

export const LEAF_FORMS: readonly LeafForm[] = [
  { id: 'oak', name: 'Oak', aspect: 0.6, len: 1 },
  {
    id: 'willow', name: 'Willow', aspect: 0.27, len: 1.5,
    paint(k) {
      const y0 = 0.07, y1 = 0.99, mid = (u: number) => 0.032 * Math.sin(Math.PI * u) - 0.016;
      const half = (u: number) => 0.098 * Math.pow(Math.sin(Math.PI * Math.pow(u, 0.72)), 0.85) * (1 + 0.04 * frac(u * 40) * smoothstep(0.05, 0.2, u));
      k.blade(toPath(bladePts(half, mid, y0, y1)), 'nonzero', () => {
        const Y = (u: number) => y0 + (y1 - y0) * u;
        for (const sd of [1, -1]) for (let i = 0; i < 17; i++) {
          const u = 0.06 + i * 0.052 + (sd > 0 ? 0 : 0.026);
          k.vein(line([mid(u), Y(u)], [mid(u + 0.085) + sd * half(u + 0.085) * 0.95, Y(u + 0.085)], 6, sd * 0.08), 0.007, 0.003, VEIN3);
        }
        const m: Pt[] = []; for (let i = 0; i <= 40; i++) { const u = (i / 40) * 0.98; m.push([mid(u), Y(u)]); }
        k.vein(m, 0.024, 0.005, VEIN);
      });
      k.vein([[0, 0], [mid(0), y0 + 0.02]], 0.026, 0.022, STALK);
    },
  },
  {
    id: 'birch', name: 'Birch', aspect: 0.74, len: 0.9,
    paint(k) {
      const y0 = 0.14, y1 = 0.99, mid = (u: number) => 0.012 * Math.sin(Math.PI * u);
      const half = (u: number, sd: number) => 0.33 * Math.pow(Math.sin(Math.PI * Math.pow(u, 0.58)), 0.95) * (1 - 0.3 * u)
        * (1 + (0.085 * frac(u * 12 + (sd > 0 ? 0 : 0.4)) + 0.04 * frac(u * 36)) * smoothstep(0.04, 0.16, u)) * (sd > 0 ? 1 : 0.95);
      k.blade(toPath(bladePts(half, mid, y0, y1)), 'nonzero', () => {
        const Y = (u: number) => y0 + (y1 - y0) * u;
        for (const sd of [1, -1]) for (let i = 0; i < 9; i++) {
          const u = 0.03 + (i + (sd > 0 ? 0 : 0.4)) / 12, ue = Math.min(0.99, u + 0.1 + 0.06 * (1 - u));
          const a: Pt = [mid(u), Y(u)], b: Pt = [mid(ue) + sd * half(ue, sd) * 0.97, Y(ue)];
          k.vein(line(a, b, 8, -sd * 0.04), 0.011, 0.004, VEIN2);
          for (let j = 1; j < 4; j++) { const t = j / 4, px = a[0] + (b[0] - a[0]) * t, py = a[1] + (b[1] - a[1]) * t; k.vein([[px, py], [px + sd * 0.012, py + 0.04]], 0.004, 0.002, VEIN3); }
        }
        const m: Pt[] = []; for (let i = 0; i <= 40; i++) { const u = (i / 40) * 0.97; m.push([mid(u), Y(u)]); }
        k.vein(m, 0.022, 0.004, VEIN);
      });
      k.vein([[0, 0], [0.004, y0 + 0.02]], 0.028, 0.022, STALK);
    },
  },
  {
    id: 'maple', name: 'Maple', aspect: 0.92, len: 0.88,
    paint(k) {
      const cy = 0.36, r0 = 0.2;
      const lobes = [{ a: 0, len: 0.62, w: 0.8 }, { a: 0.95, len: 0.53, w: 0.78 }, { a: -0.95, len: 0.5, w: 0.78 }, { a: 1.9, len: 0.36, w: 0.7 }, { a: -1.9, len: 0.35, w: 0.7 }];
      const r = (th: number) => {
        let best = r0;
        for (const l of lobes) {
          const q = Math.abs(th - l.a) / l.w;
          if (q >= 1) continue;
          const v = l.len * Math.max(Math.pow(1 - q, 1.15), 0.7 * Math.max(0, 1 - Math.abs(q - 0.33) / 0.13), 0.5 * Math.max(0, 1 - Math.abs(q - 0.55) / 0.1));
          if (v > best) best = v;
        }
        return best;
      };
      k.blade(toPath(polarPts(0, cy, r, -Math.PI, Math.PI, 720)), 'nonzero', () => {
        const base: Pt = [0, cy - r0 + 0.02];
        for (const l of lobes) {
          const tip: Pt = [l.len * 0.96 * Math.sin(l.a), cy + l.len * 0.96 * Math.cos(l.a)];
          const main = line(base, tip, 12, 0);
          for (let j = 3; j < 11; j += 2) for (const sd of [1, -1]) {
            const [px, py] = main[j], dx = tip[0] - base[0], dy = tip[1] - base[1], L = Math.hypot(dx, dy), s = 0.13 * l.len * (1 - j / 14);
            const ca = Math.cos(sd * 0.75), sa = Math.sin(sd * 0.75);
            k.vein([[px, py], [px + ((dx * ca - dy * sa) / L) * s, py + ((dx * sa + dy * ca) / L) * s]], 0.008, 0.003, VEIN3);
          }
          k.vein(main, 0.02, 0.004, l.a === 0 ? VEIN : VEIN2);
        }
      });
      k.vein([[0, 0], [0, cy - r0 + 0.03]], 0.028, 0.022, STALK);
    },
  },
  {
    id: 'ginkgo', name: 'Ginkgo', aspect: 1.24, len: 0.8,
    paint(k) {
      const oy = 0.27, A = 1.08;
      const r = (th: number) => 0.675 * (1 + 0.025 * Math.sin(th * 23) + 0.015 * Math.sin(th * 47 + 1)) * (1 - 0.34 * Math.exp(-((th / 0.055) ** 2))) * (1 - 0.07 * Math.pow(Math.abs(th) / A, 4));
      const pts = polarPts(0, oy, r, -A, A, 360);
      pts.push([0.012, oy - 0.03], [-0.012, oy - 0.03]);
      k.blade(toPath(pts), 'nonzero', () => {
        for (let i = 0; i < 38; i++) {
          const th = -A * 0.97 + (2 * A * 0.97 * (i + 0.5)) / 38 + (k.rng.next() - 0.5) * 0.02, rr = r(th) * (0.9 + 0.07 * k.rng.next());
          k.vein(line([0, oy - 0.01], [rr * Math.sin(th), oy + rr * Math.cos(th)], 6, 0), 0.008, 0.003, i % 3 === 0 ? VEIN2 : VEIN3);
        }
      });
      k.vein([[0, 0], [0, oy + 0.03]], 0.03, 0.022, STALK);
    },
  },
  {
    id: 'round', name: 'Round', aspect: 0.84, len: 0.8,
    paint(k) {
      const cy = 0.565, R = 0.385;
      const r = (th: number) => R * (1 + 0.1 * Math.exp(-((th / 0.2) ** 2)) + 0.012 * Math.sin(th * 28)) * (1 - 0.13 * Math.exp(-(((Math.PI - Math.abs(th)) / 0.32) ** 2)));
      const by = cy - r(Math.PI);
      k.blade(toPath(polarPts(0, cy, r)), 'nonzero', () => {
        for (const sd of [1, -1]) for (let i = 0; i < 4; i++) {
          const th = sd * (0.5 + i * 0.52), rr = r(th) * 0.93, sy = by + 0.02 + i * 0.0 + (3 - i) * 0.09;
          const a: Pt = [0, sy], b: Pt = [rr * Math.sin(th), cy + rr * Math.cos(th)];
          const v = line(a, b, 10, sd * 0.1);
          k.vein(v, 0.012, 0.004, VEIN2);
          for (let j = 3; j < 10; j += 3) k.vein([v[j], [v[j][0] + sd * 0.03, v[j][1] + 0.06]], 0.005, 0.002, VEIN3);
        }
        k.vein(line([0, by], [0, cy + r(0) * 0.96], 12, 0), 0.02, 0.004, VEIN);
      });
      k.vein([[0, 0], [0, by + 0.03]], 0.026, 0.02, STALK);
    },
  },
  {
    id: 'spray', name: 'Conifer', aspect: 0.62, len: 1.15,
    paint(k) {
      // Flattened scale-leaf frond (cypress / thuja): a twig with alternating branchlets, each with two side shoots.
      const segs: { pts: Pt[]; w0: number; w1: number }[] = [];
      const mid = (u: number) => 0.02 * Math.sin(u * 5);
      const stem: Pt[] = []; for (let i = 0; i <= 30; i++) { const u = i / 30 * 0.97; stem.push([mid(u), u]); }
      segs.push({ pts: stem, w0: 0.05, w1: 0.03 });
      for (let i = 0; i < 15; i++) {
        const u = 0.09 + i * 0.058, sd = i % 2 ? 1 : -1;
        const L = (0.05 + 0.3 * Math.pow(1 - u, 0.65)) * smoothstep(-0.05, 0.22, u) * (0.9 + 0.2 * k.rng.next());
        const a = sd * (0.8 + 0.12 * k.rng.next()), o: Pt = [mid(u), u], e: Pt = [o[0] + L * Math.sin(a), o[1] + L * Math.cos(a)];
        const b = line(o, e, 8, sd * 0.07);
        segs.push({ pts: b, w0: 0.05, w1: 0.03 });
        if (L > 0.13) for (const [t, s2] of [[0.38, 1], [0.62, -1]] as const) {
          const q = b[Math.round(t * 8)], a2 = a + s2 * 0.62, l2 = L * 0.36;
          segs.push({ pts: line(q, [q[0] + l2 * Math.sin(a2), q[1] + l2 * Math.cos(a2)], 4, 0), w0: 0.042, w1: 0.026 });
        }
      }
      const { g } = k;
      for (const s of segs) k.vein(s.pts, s.w0 * 1.3, s.w1 * 1.3, '#456c28');
      for (const s of segs) k.vein(s.pts, s.w0 * 0.86, s.w1 * 0.86, k.grad);
      // Scale leaves: pale chevrons across each shoot.
      g.strokeStyle = 'rgba(176,196,110,0.6)'; g.lineWidth = 0.0055; g.lineCap = 'round';
      for (const s of segs) {
        const a = s.pts[0], b = s.pts[s.pts.length - 1], L = Math.hypot(b[0] - a[0], b[1] - a[1]), n = Math.floor(L / 0.03);
        for (let j = 1; j < n; j++) {
          const f = j / n, p = s.pts[Math.min(s.pts.length - 1, Math.round(f * (s.pts.length - 1)))], dx = (b[0] - a[0]) / L, dy = (b[1] - a[1]) / L, w = (s.w0 + (s.w1 - s.w0) * f) * 0.4;
          g.beginPath(); g.moveTo(p[0] - dy * w - dx * 0.012, p[1] + dx * w - dy * 0.012); g.lineTo(p[0] + dx * 0.006, p[1] + dy * 0.006); g.lineTo(p[0] + dy * w - dx * 0.012, p[1] - dx * w - dy * 0.012); g.stroke();
        }
      }
    },
  },
  {
    id: 'frond', name: 'Forked', aspect: 0.82, len: 1.1,
    paint(k) {
      // Alien: a stalk that forks into two lyre-curved blades with a bulb at the fork.
      const fy = 0.27, L = 0.71;
      for (const sd of [1, -1]) {
        const mid = (u: number) => sd * 0.075 * Math.sin(Math.PI * u) * (1 - 0.6 * u);
        const half = (u: number) => 0.105 * Math.pow(Math.sin(Math.PI * Math.pow(u, 0.8)), 0.8) * (1 + 0.05 * Math.sin(u * 60));
        const tr = (pts: Pt[]) => rot(pts, sd * 0.4, 0, fy);
        k.blade(toPath(tr(bladePts(half, mid, 0, L * (sd > 0 ? 1 : 0.93)))), 'nonzero', () => {
          const m: Pt[] = []; for (let i = 0; i <= 30; i++) { const u = (i / 30) * 0.96; m.push([mid(u), u * L * (sd > 0 ? 1 : 0.93)]); }
          const mm = tr(m);
          for (let i = 3; i < 29; i += 2) for (const s2 of [1, -1]) {
            const [px, py] = mm[i], dx = mm[i + 1][0] - px, dy = mm[i + 1][1] - py, l = Math.hypot(dx, dy), w = half(i / 30) * 0.85;
            k.vein([[px, py], [px + (dx / l) * 0.03 - s2 * (dy / l) * w, py + (dy / l) * 0.03 + s2 * (dx / l) * w]], 0.006, 0.003, VEIN3);
          }
          k.vein(mm, 0.024, 0.005, VEIN);
        });
      }
      k.vein([[0, 0], [0, fy + 0.03]], 0.05, 0.04, STALK);
      const { g } = k;
      g.fillStyle = '#93a653'; g.beginPath(); g.arc(0, fy + 0.02, 0.05, 0, Math.PI * 2); g.fill();
      g.fillStyle = 'rgba(214,222,150,0.9)'; g.beginPath(); g.arc(-0.012, fy + 0.032, 0.02, 0, Math.PI * 2); g.fill();
    },
  },
  {
    id: 'ring', name: 'Ring', aspect: 0.88, len: 0.9,
    paint(k) {
      // Alien: a ring-shaped blade, thicker below the off-centre hole, with spokes.
      const cy = 0.565, R = 0.4, hy = 0.635, hr = 0.2;
      const r = (th: number) => R * (1 + 0.035 * Math.sin(th * 9 + 0.6));
      const p = toPath(polarPts(0, cy, r));
      p.moveTo(hr, hy); p.arc(0, hy, hr, 0, Math.PI * 2);
      k.blade(p, 'evenodd', () => {
        for (let i = 0; i < 18; i++) {
          const th = ((i + 0.5) / 18) * Math.PI * 2 - Math.PI, rr = r(th) * 0.94;
          k.vein(line([hr * Math.sin(th), hy + hr * Math.cos(th)], [rr * Math.sin(th), cy + rr * Math.cos(th)], 5, 0.05), 0.012, 0.004, VEIN2);
        }
        const c: Pt[] = []; for (let i = 0; i <= 64; i++) { const th = (i / 64) * Math.PI * 2; c.push([(hr + 0.03) * Math.sin(th), hy + (hr + 0.03) * Math.cos(th)]); }
        k.vein(c, 0.014, 0.014, VEIN);
      });
      k.vein([[0, 0], [0, cy - R + 0.04]], 0.04, 0.03, STALK);
    },
  },
  {
    id: 'spiral', name: 'Spiral', aspect: 0.86, len: 1.1,
    paint(k) {
      // Alien: a fleshy tendril coiled like a fiddlehead, with a row of beads on the outside of the coil.
      const cx = -0.05, cy = 0.6, R = 0.325, pts: Pt[] = [];
      for (let i = 0; i <= 20; i++) {
        const t = i / 20, a = (1 - t) ** 3, b = 3 * t * (1 - t) ** 2, c = 3 * t * t * (1 - t), d = t ** 3;
        pts.push([b * 0.22 + c * (cx + R) + d * (cx + R), b * 0.05 + c * 0.3 + d * cy + a * 0]);
      }
      const PH = Math.PI * 2 * 1.72, beads: Pt[] = [];
      for (let i = 1; i <= 110; i++) {
        const f = i / 110, ph = f * PH, rr = R - 0.275 * Math.pow(f, 0.9);
        pts.push([cx + rr * Math.cos(ph), cy + rr * Math.sin(ph)]);
        if (i % 6 === 3 && f < 0.62) beads.push([cx + (rr + 0.07 - 0.02 * f) * Math.cos(ph), cy + (rr + 0.07 - 0.02 * f) * Math.sin(ph)]);
      }
      const { g } = k;
      g.fillStyle = '#456c28'; for (const [x, y] of beads) { g.beginPath(); g.arc(x, y, 0.03, 0, Math.PI * 2); g.fill(); }
      k.vein(pts, 0.14, 0.066, '#456c28');
      const end = pts[pts.length - 1];
      g.beginPath(); g.arc(end[0], end[1], 0.05, 0, Math.PI * 2); g.fill();
      k.vein(pts, 0.11, 0.048, k.grad);
      g.fillStyle = '#86a046'; for (const [x, y] of beads) { g.beginPath(); g.arc(x, y, 0.02, 0, Math.PI * 2); g.fill(); }
      k.vein(pts, 0.02, 0.006, VEIN);
      g.fillStyle = '#a9bb62'; g.beginPath(); g.arc(end[0], end[1], 0.036, 0, Math.PI * 2); g.fill();
    },
  },
];
export const leafForm = (id: string): LeafForm => LEAF_FORMS.find((f) => f.id === id) ?? LEAF_FORMS[0];

/** Paint a leaf form into a new S x S canvas (transparent background). The oak is the original 512 px painting, scaled. */
export function leafFormCanvas(id: string, S = 512): HTMLCanvasElement {
  const def = leafForm(id);
  const c = document.createElement('canvas');
  c.width = c.height = S;
  const g = c.getContext('2d', { willReadFrequently: true })!;
  if (!def.paint) {
    const oak = oakLeafCanvas();
    if (S === 512) return oak;
    g.drawImage(oak, 0, 0, S, S);
    return c;
  }
  g.save();
  g.setTransform((0.97 * S) / def.aspect, 0, 0, -0.97 * S, S / 2, 0.985 * S);
  g.lineCap = 'round'; g.lineJoin = 'round';
  const grad = g.createLinearGradient(0, 0, 0, 1);
  grad.addColorStop(0, '#8fa64a'); grad.addColorStop(0.35, '#6e9038'); grad.addColorStop(1, '#4f7a2c');
  const kit: Kit = {
    g, grad, rng: new Rng(31),
    vein(pts, w0, w1, col) {
      g.strokeStyle = col; g.lineCap = 'round';
      for (let i = 1; i < pts.length; i++) {
        g.lineWidth = w0 + (w1 - w0) * (i / (pts.length - 1));
        g.beginPath(); g.moveTo(pts[i - 1][0], pts[i - 1][1]); g.lineTo(pts[i][0], pts[i][1]); g.stroke();
      }
    },
    blade(path, rule, inner) {
      g.fillStyle = grad; g.fill(path, rule);
      g.save(); g.clip(path, rule);
      g.strokeStyle = 'rgba(34,58,14,0.17)';
      g.lineWidth = 0.085; g.stroke(path); g.lineWidth = 0.035; g.stroke(path);
      inner?.();
      g.restore();
    },
  };
  def.paint(kit);
  g.restore();
  // Per-pixel pass: blotches, speckles, a soft sheen band.
  const noise = makeNoise(17);
  const img = g.getImageData(0, 0, S, S), d = img.data;
  for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {
    const i = (y * S + x) * 4;
    if (d[i + 3] < 8) continue;
    const u = x / S, v = y / S;
    const bl = fbm(noise, u * 6, v * 6, 64, 64, 3);
    let k = 0.86 + 0.26 * bl;
    if (noise(u * 90, v * 90, 128, 128) > 0.82) k *= 0.82;
    const band = Math.exp(-(((u - 0.62 + 0.25 * (v - 0.5) + 0.2 * (bl - 0.5)) / 0.1) ** 2));
    const hl = 0.1 * band * (0.6 + 0.4 * Math.sin((1 - v) * Math.PI));
    d[i] = Math.min(255, d[i] * k + 255 * hl * 0.8);
    d[i + 1] = Math.min(255, d[i + 1] * k + 255 * hl);
    d[i + 2] = Math.min(255, d[i + 2] * k + 255 * hl * 0.55);
  }
  g.putImageData(img, 0, 0);
  return c;
}

/**
 * Leaf map of a form (see `LEAF_FORMS`; unknown ids give the oak). `userData.form` carries what `Leaves` needs besides
 * the pixels: the card stretch (`kx`, `ky` on top of `leaves.shape`) and whether the safe-path mips must preserve
 * coverage (thin forms; the oak keeps its original mip chain).
 */
export function makeLeafTexture(id = 'oak'): THREE.Texture {
  const def = leafForm(id);
  const t = new THREE.CanvasTexture(leafFormCanvas(def.id));
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  t.userData.form = { id: def.id, kx: (def.len * def.aspect) / 0.6, ky: def.len, preserve: def.id !== 'oak' };
  return t;
}

function smoothstep(a: number, b: number, x: number) {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
}

/** Grass/meadow ground texture, tileable. */
/** `patchy` (backdrop): more contrast in the low frequencies. The ground shader reads this map at 140 m and 526 m per
 *  tile for its dry / lush patches, so the far meadow gets visible patches from texture pixels alone; the mean is unchanged. */
export function makeGrassTexture(patchy = false): THREE.Texture {
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
      const k = patchy ? 1.9 : 1, m = n - 0.5;
      img.data[i] = 68 + 40 * k * m + 20 * fine;
      img.data[i + 1] = 97 + 50 * k * m + 30 * fine;
      img.data[i + 2] = 39 + 18 * k * m;
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

/** Meadow tuft map (WP3): a fan of tapering grass blades from the bottom centre, darker at the base, lighter tips. Dense low down so far mips keep a clump. */
export function makeTuftTexture(seed = 5): THREE.Texture {
  const S = 256;
  const c = document.createElement('canvas');
  c.width = c.height = S;
  const g = c.getContext('2d')!;
  const rng = new Rng(seed);
  g.lineCap = 'round';
  // Back-to-front: darker blades first.
  const N = 64;
  for (let k = 0; k < N; k++) {
    const f = k / N; // 0 back .. 1 front
    const x0 = S * (0.5 + rng.range(-0.3, 0.3) * (0.4 + 0.6 * rng.next()));
    const lean = rng.range(-1, 1);
    const hgt = S * (0.35 + 0.6 * Math.pow(rng.next(), 0.8)) * (k % 7 === 0 ? 1 : 0.85);
    const x1 = x0 + lean * hgt * 0.42, y1 = S - hgt;
    const cx = x0 + lean * hgt * 0.08, cy = S - hgt * 0.6;
    const v = rng.next(), dry = rng.next() < 0.14;
    const w0 = S * (0.028 + 0.022 * rng.next());
    // Tapered blade: several strokes of decreasing width along the quadratic.
    const seg = 10;
    for (let s = 0; s < seg; s++) {
      const a = s / seg, b = (s + 1) / seg;
      const P = (t: number) => [(1 - t) * (1 - t) * x0 + 2 * t * (1 - t) * cx + t * t * x1, (1 - t) * (1 - t) * S + 2 * t * (1 - t) * cy + t * t * y1];
      const [ax, ay] = P(a), [bx, by] = P(b);
      const lt = 0.72 + 0.22 * f + 0.3 * a; // lighter toward the tip and for front blades
      const r = dry ? 118 + 30 * v : 62 + 46 * v, gg = dry ? 150 + 30 * v : 104 + 52 * v, bl = dry ? 40 + 12 * v : 38 + 22 * v;
      g.strokeStyle = `rgb(${Math.min(255, r * lt) | 0},${Math.min(255, gg * lt) | 0},${Math.min(255, bl * lt) | 0})`;
      g.lineWidth = Math.max(1.6, w0 * (1 - 0.82 * a));
      g.beginPath(); g.moveTo(ax, ay); g.lineTo(bx, by); g.stroke();
    }
  }
  // Base: no straight bottom edge and no dark foot. The lowest rows are cut into a ragged line of blade roots (alpha
  // stays 0/1) and the bottom fifth fades to the mean tuft colour, which is the colour the instance gains match to the ground.
  const im = g.getImageData(0, 0, S, S), d = im.data;
  let mr = 0, mg = 0, mb = 0, mn = 0;
  for (let i = 0; i < d.length; i += 4) if (d[i + 3] >= 128) { mr += d[i]; mg += d[i + 1]; mb += d[i + 2]; mn++; }
  mr = (mr / mn) * 1.1; mg = (mg / mn) * 1.1; mb = (mb / mn) * 1.1;
  for (let x = 0; x < S; x++) {
    // Root line height per column: two octaves of column noise, 0..15 % of the card, in runs 2-5 px wide.
    const hsh = (v: number) => { const q = Math.sin(v * 91.7 + seed * 13.1) * 43758.5453; return q - Math.floor(q); };
    const cut = S * (0.015 + 0.09 * hsh(Math.floor(x / 5)) + 0.05 * hsh(Math.floor(x / 2) + 77));
    for (let y = 0; y < S; y++) {
      const up = S - 1 - y, i = (y * S + x) * 4;
      if (up < cut) { d[i + 3] = 0; continue; }
      const f = 1 - Math.min(1, up / (S * 0.22));
      if (f <= 0 || d[i + 3] < 128) continue;
      const k = f * (2 - f) * 0.9;
      d[i] += (mr - d[i]) * k; d[i + 1] += (mg - d[i + 1]) * k; d[i + 2] += (mb - d[i + 2]) * k;
    }
  }
  g.putImageData(im, 0, 0);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

/** Backdrop tree / bush map: a crown of leaf-clump dabs over a trunk (bush: a low mound, no trunk), lit from above
 *  with dark gaps inside and a ragged outline. Alpha is 0/1 after cleanLeafTexture. */
export function makeTreeTexture(seed = 3, bush = false): THREE.Texture {
  const S = 256;
  const c = document.createElement('canvas');
  c.width = c.height = S;
  const g = c.getContext('2d')!;
  const rng = new Rng(seed * 31 + (bush ? 7 : 0));
  if (!bush) {
    // Trunk and two limbs.
    g.strokeStyle = 'rgb(58,46,36)'; g.lineCap = 'round';
    const tx = S * (0.5 + rng.range(-0.03, 0.03));
    g.lineWidth = S * 0.06; g.beginPath(); g.moveTo(tx, S); g.lineTo(tx + S * rng.range(-0.02, 0.02), S * 0.6); g.stroke();
    g.lineWidth = S * 0.028;
    for (const sgn of [-1, 1]) { g.beginPath(); g.moveTo(tx, S * 0.84); g.lineTo(tx + sgn * S * rng.range(0.1, 0.22), S * rng.range(0.55, 0.65)); g.stroke(); }
  }
  // Lobes: the crown outline is their union.
  const lobes: number[][] = [];
  const cy0 = bush ? 0.66 : 0.43, ry0 = bush ? 0.3 : 0.4, nl = bush ? 6 : 13;
  for (let i = 0; i < nl; i++) {
    const a = rng.next() * Math.PI * 2, d = Math.sqrt(rng.next()) * 0.62;
    lobes.push([0.5 + Math.cos(a) * d * 0.5, cy0 + Math.sin(a) * d * ry0 * (Math.sin(a) > 0 ? 0.8 : 1), rng.range(0.09, 0.19)]);
  }
  lobes.push([0.5, cy0, 0.22]);
  const dabs: number[][] = [];
  for (let k = 0; k < 2200; k++) {
    const L = lobes[Math.floor(rng.next() * lobes.length)];
    const a = rng.next() * Math.PI * 2, d = Math.sqrt(rng.next()) * L[2];
    const x = L[0] + Math.cos(a) * d, y = L[1] + Math.sin(a) * d * 0.9;
    if (y > 0.985) continue;
    // Light: top of its lobe and top of the crown are lit, undersides and the interior are dark.
    const inLobe = (L[1] - y) / L[2], glob = (cy0 - y) / ry0;
    dabs.push([x, y, 0.5 + 0.3 * inLobe + 0.16 * glob + rng.range(-0.22, 0.22), rng.range(0.008, 0.024)]);
  }
  dabs.sort((p, q) => q[1] - p[1] + (p[2] - q[2]) * 0.2); // lower ones first, so each lobe's lit top overlaps the shade below
  for (const [x, y, lt, r] of dabs) {
    const v = Math.min(1, Math.max(0, lt));
    g.fillStyle = `rgb(${(26 + 78 * v * v) | 0},${(40 + 96 * v) | 0},${(20 + 34 * v * v) | 0})`;
    g.beginPath(); g.ellipse(x * S, y * S, r * S * 1.25, r * S, rng.range(-0.6, 0.6), 0, Math.PI * 2); g.fill();
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

export type FlowerKind = 'daisy' | 'buttercup' | 'poppy' | 'clover';
/** Wildflower map (WP3): a few stems with side-on flower heads in the upper part, small leaves low down. */
export function makeFlowerTexture(kind: FlowerKind): THREE.Texture {
  const S = 128;
  const c = document.createElement('canvas');
  c.width = c.height = S;
  const g = c.getContext('2d')!;
  const rng = new Rng({ daisy: 21, buttercup: 22, poppy: 23, clover: 24 }[kind]);
  g.lineCap = 'round';
  const stems = kind === 'clover' ? 4 : 3;
  for (let k = 0; k < stems; k++) {
    const x0 = S * (0.5 + rng.range(-0.12, 0.12));
    const hgt = S * (kind === 'clover' ? rng.range(0.45, 0.7) : rng.range(0.62, 0.86));
    const x1 = S * (0.5 + (k - (stems - 1) / 2) * 0.24 + rng.range(-0.05, 0.05)), y1 = S - hgt;
    g.strokeStyle = `rgb(${70 + rng.next() * 20},${112 + rng.next() * 25},${44})`;
    g.lineWidth = 3.4;
    g.beginPath(); g.moveTo(x0, S); g.quadraticCurveTo(x0, S - hgt * 0.5, x1, y1); g.stroke();
    // A leaf or two on the stem.
    for (let l = 0; l < 2; l++) {
      const t = rng.range(0.15, 0.5), lx = x0 + (x1 - x0) * t * t, ly = S - hgt * t, sd = rng.next() < 0.5 ? -1 : 1;
      g.fillStyle = `rgb(${66 + rng.next() * 24},${118 + rng.next() * 24},46)`;
      g.beginPath(); g.ellipse(lx + sd * 7, ly - 3, 8, 3.2, sd * -0.5, 0, Math.PI * 2); g.fill();
    }
    const R = S * (kind === 'poppy' ? 0.115 : kind === 'daisy' ? 0.1 : kind === 'clover' ? 0.075 : 0.07);
    g.save();
    g.translate(x1, y1);
    g.rotate(rng.range(-0.35, 0.35));
    if (kind === 'daisy') {
      // Seen three-quarter on: an ellipse of white rays around a yellow dome.
      for (let p = 0; p < 14; p++) {
        const a = (p / 14) * Math.PI * 2;
        g.fillStyle = p % 2 ? '#f6f4ea' : '#e6e6dc';
        g.beginPath(); g.ellipse(Math.cos(a) * R * 0.62, Math.sin(a) * R * 0.4, R * 0.5, R * 0.2, Math.atan2(Math.sin(a) * 0.65, Math.cos(a)), 0, Math.PI * 2); g.fill();
      }
      g.fillStyle = '#e8b422';
      g.beginPath(); g.ellipse(0, -R * 0.05, R * 0.36, R * 0.27, 0, 0, Math.PI * 2); g.fill();
    } else if (kind === 'buttercup') {
      for (let p = 0; p < 5; p++) {
        const a = (p / 5) * Math.PI * 2 + 0.3;
        g.fillStyle = p % 2 ? '#f4cf1c' : '#e9bd10';
        g.beginPath(); g.ellipse(Math.cos(a) * R * 0.5, Math.sin(a) * R * 0.38, R * 0.55, R * 0.42, a, 0, Math.PI * 2); g.fill();
      }
      g.fillStyle = '#c99408';
      g.beginPath(); g.arc(0, 0, R * 0.25, 0, Math.PI * 2); g.fill();
    } else if (kind === 'poppy') {
      for (let p = 0; p < 4; p++) {
        const a = (p / 4) * Math.PI * 2 + 0.6;
        g.fillStyle = p % 2 ? '#d8301c' : '#c4220f';
        g.beginPath(); g.ellipse(Math.cos(a) * R * 0.42, Math.sin(a) * R * 0.3, R * 0.72, R * 0.58, a, 0, Math.PI * 2); g.fill();
      }
      g.fillStyle = '#2a1410';
      g.beginPath(); g.ellipse(0, 0, R * 0.26, R * 0.2, 0, 0, Math.PI * 2); g.fill();
    } else {
      // Clover head: a ball of small pink-mauve florets.
      for (let p = 0; p < 26; p++) {
        const a = rng.next() * Math.PI * 2, rr = Math.sqrt(rng.next()) * R;
        const v = rng.next();
        g.fillStyle = `rgb(${196 + v * 40},${120 + v * 50},${170 + v * 40})`;
        g.beginPath(); g.ellipse(Math.cos(a) * rr, Math.sin(a) * rr * 0.9, R * 0.3, R * 0.2, a, 0, Math.PI * 2); g.fill();
      }
    }
    g.restore();
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

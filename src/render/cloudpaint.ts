/**
 * Cloud maps, painted in plain JS (no three, no DOM): runs in a Web Worker (`cloudpaint.worker.ts`) so the page start
 * does not pay for it (about 0.5 s of main-thread time on a desktop, 3 s at 4x CPU throttle when it ran in the
 * `Clouds` constructor). `paintClouds()` returns both maps with rows already in texture order (first row = v 0).
 */

const smooth = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};
function hash2(x: number, y: number) {
  const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return s - Math.floor(s);
}
function vnoise(x: number, y: number, wrap = 0) {
  const xi = Math.floor(x), yi = Math.floor(y), fx = x - xi, fy = y - yi;
  const u = fx * fx * (3 - 2 * fx), v = fy * fy * (3 - 2 * fy);
  const w = (a: number) => (wrap ? ((a % wrap) + wrap) % wrap : a);
  const x0 = w(xi), x1 = w(xi + 1), y0 = w(yi), y1 = w(yi + 1);
  return (hash2(x0, y0) * (1 - u) + hash2(x1, y0) * u) * (1 - v) + (hash2(x0, y1) * (1 - u) + hash2(x1, y1) * u) * v;
}
/** 4 octaves; `wrap` = period of the first octave in cells (0 = none). */
function fbm(x: number, y: number, wrap = 0) {
  let s = 0, a = 0.5;
  for (let o = 0; o < 4; o++) { s += a * vnoise(x, y, wrap); x *= 2; y *= 2; wrap *= 2; a *= 0.5; }
  return s / 0.9375;
}

export const BASE = 0.2; // flat base line, as a fraction of the cell height from the bottom
/**
 * Atlas: 2 x 3 cells of CW x CH. Cells 0..2 = cumulus heaps (light from the upper left), cell 3 = storm tower,
 * cells 4, 5 = scud (ragged, soft-edged shreds without a base or a lit side). The `lit` map has the same layout:
 * white, alpha = cloud alpha x how much the pixel faces the painted light (drawn over the heaps in the low sun's colour).
 */
export const CW = 256, CH = 128, ROWS = 3;

function paintAtlas() {
  const W = CW * 2, H = CH * ROWS, d = new Uint8Array(W * H * 4), l = new Uint8Array(W * H * 4);
  for (let cell = 0; cell < 2 * ROWS; cell++) {
    const ox = (cell & 1) * CW, oy = (cell >> 1) * CH, tower = cell === 3, scud = cell >= 4;
    // Blobs: x, y (0..1 in the cell, y up), radius (in cell heights).
    const blobs: [number, number, number][] = [];
    let s = 11 + cell * 7.3;
    const rnd = () => { s = (s * 16807) % 2147483647; return (s % 100000) / 100000; };
    for (let i = 0; i < 40; i++) rnd();
    if (scud) {
      // Shreds strung out level, no heap.
      for (let i = 0; i < 13; i++) blobs.push([0.16 + 0.68 * rnd(), 0.36 + 0.26 * rnd(), 0.1 + 0.13 * rnd()]);
    } else if (tower) {
      // A wide dark body, a rising column, an anvil spreading at the top.
      for (let i = 0; i < 14; i++) blobs.push([0.12 + 0.76 * (i / 13), 0.2 + 0.1 * rnd(), 0.22 + 0.08 * rnd()]);
      for (let i = 0; i < 9; i++) blobs.push([0.5 + 0.12 * (rnd() - 0.5) - 0.05 * (i / 8), 0.3 + 0.42 * (i / 8), 0.2 - 0.05 * (i / 8) + 0.05 * rnd()]);
      for (let i = 0; i < 11; i++) blobs.push([0.2 + 0.62 * (i / 10), 0.76 + 0.04 * rnd(), 0.1 + 0.05 * rnd()]);
    } else {
      const n = 9 + cell * 2, wide = 0.26 + 0.05 * cell;
      for (let i = 0; i < n; i++) {
        const u = (i + 0.5) / n, x = 0.5 + (u - 0.5) * 2 * wide + 0.05 * (rnd() - 0.5);
        // Tallest in the middle, low shoulders: a heap.
        const hgt = (1 - Math.pow(Math.abs(u - 0.5) * 2, 1.7)) * (0.3 + 0.2 * rnd()) + 0.06;
        blobs.push([x, BASE + 0.1 + hgt * 0.5, 0.15 + hgt * 0.42]);
        if (rnd() > 0.4) blobs.push([x + 0.06 * (rnd() - 0.5), BASE + 0.14 + hgt, 0.09 + 0.1 * rnd()]);
      }
    }
    const asp = CW / CH;
    for (let j = 0; j < CH; j++) for (let i = 0; i < CW; i++) {
      const x = (i + 0.5) / CW, y = 1 - (j + 0.5) / CH;
      // Billowy edge: the sample point is displaced by noise before the blob test.
      const nx = fbm(x * 9 + cell * 5, y * 5), ny = fbm(x * 9 + 31, y * 5 + cell * 3), fine = fbm(x * 30, y * 15 + cell);
      const px = x + (scud ? 0.1 : 0.035) * (nx - 0.5), py = y + (scud ? 0.2 : 0.07) * (ny - 0.5);
      let den = 0;
      for (const [bx, by, br] of blobs) {
        const dx = (px - bx) * asp, dy = py - by, q = 1 - Math.sqrt(dx * dx + dy * dy) / br;
        if (q > 0) den += q * q * (3 - 2 * q) * 1.4;
      }
      den += 0.6 * (fine - 0.5) * (1 - smooth(0.8, 2, den));
      let a = smooth(0.33, 0.63, den);
      // Scud: torn by the fine noise, alpha rises slowly (no outline), thin all over.
      if (scud) a = smooth(0.2, 1.5, den + 1.1 * (fine - 0.5) + 0.5 * (nx - 0.5)) * 0.9 * smooth(0, 0.12, y) * smooth(0, 0.1, x) * smooth(1, 0.9, x) * smooth(1, 0.88, y);
      // Flat base (cumulus) / ragged foot (tower); nothing touches the cell border (mips of neighbours stay clean).
      const baseY = tower ? 0.08 : BASE + 0.025 * (nx - 0.5);
      if (!scud) a *= smooth(baseY - 0.012, baseY + (tower ? 0.1 : 0.03), y);
      a *= smooth(0, 0.04, x) * smooth(1, 0.96, x) * smooth(1, 0.95, y);
      // Shade: bright where the heap is thin toward the upper left (the lit side), grey-blue toward the base and the
      // lower right, darker in the creases between billows.
      const up = Math.min(1, Math.max(0, (y - baseY) / (tower ? 0.8 : 0.5)));
      const edge = 1 - smooth(0.4, tower ? 2.4 : 1.5, den), bil = fbm(x * 16 + cell * 3, y * 9 + 5);
      let b: number, lit = 0;
      if (scud) b = 0.8 + 0.22 * (bil - 0.5) + 0.08 * (fine - 0.5);
      else if (tower) {
        // Dark body, bright rim along the upper outline, a little structure inside.
        b = 0.2 + 0.12 * up + 0.16 * (bil - 0.5) + 0.8 * edge * edge * smooth(0.2, 0.6, up);
        lit = 0.7 * edge * edge * smooth(0.2, 0.6, up);
      } else {
        const side = (0.5 - x) * 0.5 + (up - 0.5) * 0.7;
        b = 0.8 + 0.2 * smooth(-0.3, 0.2, side + 0.5 * (nx - 0.5)) + 0.06 * edge - 0.34 * (1 - smooth(0.0, 0.45, up)) + 0.3 * (bil - 0.5) + 0.08 * (fine - 0.5);
        // Facing the light: the upper left flank and the billow tops, never the base.
        lit = smooth(-0.22, 0.3, side + 0.5 * (nx - 0.5) + 0.35 * (bil - 0.5)) * smooth(0.02, 0.4, up);
      }
      b = Math.min(1, Math.max(tower ? 0.08 : 0.42, b));
      const o = ((oy + j) * W + ox + i) * 4;
      // sRGB bytes: white tops, grey-blue shade.
      d[o] = 255 * b * (0.84 + 0.16 * b);
      d[o + 1] = 255 * b * (0.9 + 0.1 * b);
      d[o + 2] = 255 * b;
      d[o + 3] = 255 * a;
      l[o] = l[o + 1] = l[o + 2] = 255;
      l[o + 3] = 255 * a * Math.min(1, lit);
    }
  }
  return { d, l, W, H };
}

/** Tileable layer for the deck: soft rolls in grey, alpha never far below 1 (a ceiling, not separate clouds). */
function paintDeck() {
  const S = 256, d = new Uint8Array(S * S * 4);
  for (let j = 0; j < S; j++) for (let i = 0; i < S; i++) {
    const x = i / S, y = j / S;
    const wv = fbm(x * 4 + 3 * fbm(x * 4 + 9, y * 4, 4), y * 4 + 7, 4), fine = fbm(x * 16, y * 16, 16);
    const v = 0.62 * wv + 0.38 * fine, b = 0.72 + 0.28 * smooth(0.3, 0.75, v);
    const o = (j * S + i) * 4;
    d[o] = 255 * b * 0.95; d[o + 1] = 255 * b * 0.975; d[o + 2] = 255 * b;
    d[o + 3] = 255 * (0.8 + 0.2 * smooth(0.25, 0.6, v));
  }
  return { d, W: S, H: S };
}

export interface CloudMap { d: Uint8Array; W: number; H: number }
/** Painted top row first; a data texture's first row is v = 0: reverse the rows. */
function flip(p: CloudMap): CloudMap {
  const f = new Uint8Array(p.d.length), row = p.W * 4;
  for (let j = 0; j < p.H; j++) f.set(p.d.subarray(j * row, (j + 1) * row), (p.H - 1 - j) * row);
  return { d: f, W: p.W, H: p.H };
}
export const ATLAS_W = CW * 2, ATLAS_H = CH * ROWS, DECK_S = 256;
export function paintClouds(): { atlas: CloudMap; deck: CloudMap; lit: CloudMap } {
  const a = paintAtlas();
  return { atlas: flip({ d: a.d, W: a.W, H: a.H }), deck: flip(paintDeck()), lit: flip({ d: a.l, W: a.W, H: a.H }) };
}

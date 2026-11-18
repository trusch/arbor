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
 * Atlas: 4 x 4 cells of CW x CH (1024 x 512). Cells 0..9 = ten different cumulus heaps, from small puffs (0..2) over
 * medium heaps to broad banks with several turrets (7..9), light from the upper left; cells 12, 13 = scud (ragged,
 * soft-edged shreds without a base or a lit side); the 2 x 2 block at columns 2..3, rows 2..3 = the storm tower with
 * its anvil at twice the resolution. The `lit` map has the same layout: white, alpha = cloud alpha x how much the
 * pixel faces the painted light (drawn over the heaps in the low sun's colour, and in a lightning flash).
 */
export const CW = 256, CH = 128, COLS = 4, ROWS = 4, HEAPS = 10, SCUD0 = 12;
const HEAP_WIDE = [0.12, 0.16, 0.2, 0.25, 0.3, 0.27, 0.33, 0.4, 0.36, 0.41];

function paintAtlas() {
  const W = CW * COLS, H = CH * ROWS, d = new Uint8Array(W * H * 4), l = new Uint8Array(W * H * 4);
  // RGB under alpha 0 is cloud colour everywhere (no dark fringe in the mips).
  for (let o = 0; o < d.length; o += 4) { d[o] = 226; d[o + 1] = 232; d[o + 2] = 240; l[o] = l[o + 1] = l[o + 2] = 255; }
  const regions: [number, number, number, number, number][] = [];
  for (let c = 0; c < HEAPS; c++) regions.push([c, (c % COLS) * CW, Math.floor(c / COLS) * CH, CW, CH]);
  regions.push([SCUD0, 0, 3 * CH, CW, CH], [SCUD0 + 1, CW, 3 * CH, CW, CH], [99, 2 * CW, 2 * CH, 2 * CW, 2 * CH]);
  for (const [cell, ox, oy, RW, RH] of regions) {
    const tower = cell === 99, scud = cell === SCUD0 || cell === SCUD0 + 1;
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
      // Every cell its own heap: width, number of billows, where the top sits, how tall, one or two turrets.
      const wide = HEAP_WIDE[cell], n = 3 + Math.round(wide * 26), peak = 0.3 + 0.4 * rnd(), tall = 0.7 + 0.5 * rnd() - 0.5 * (wide - 0.25), peak2 = rnd() > 0.5 ? rnd() : -1;
      for (let i = 0; i < n; i++) {
        const u = (i + 0.5) / n, x = 0.5 + (u - 0.5) * 2 * wide + 0.05 * (rnd() - 0.5);
        // Tallest at the peak, low shoulders: a heap; a second turret on some.
        let env = 1 - Math.pow(Math.min(1, Math.abs(u - peak) / Math.max(peak, 1 - peak)), 1.7);
        if (peak2 >= 0) env = Math.max(env, 0.75 * (1 - Math.pow(Math.min(1, Math.abs(u - peak2) * 3), 2)));
        const hgt = Math.min(0.56, env * (0.3 + 0.2 * rnd()) * tall + 0.06);
        blobs.push([x, BASE + 0.1 + hgt * 0.5, Math.min(0.3, 0.13 + hgt * 0.42)]);
        if (rnd() > 0.4) blobs.push([x + 0.06 * (rnd() - 0.5), Math.min(0.8, BASE + 0.14 + hgt), 0.08 + 0.09 * rnd()]);
      }
    }
    const asp = CW / CH;
    for (let j = 0; j < RH; j++) for (let i = 0; i < RW; i++) {
      const x = (i + 0.5) / RW, y = 1 - (j + 0.5) / RH;
      // Far from every blob: stays transparent (skips the noise for about half the pixels).
      let near = false;
      for (const [bx, by, br] of blobs) { const dx = (x - bx) * asp, dy = y - by, rr = br + (scud ? 0.25 : 0.1); if (dx * dx + dy * dy < rr * rr) { near = true; break; } }
      if (!near) continue;
      // Billowy edge: the sample point is displaced by noise before the blob test.
      const nx = fbm(x * 9 + cell * 5, y * 5), ny = fbm(x * 9 + 31, y * 5 + cell * 3), fine = fbm(x * 30, y * 15 + cell);
      const px = x + (scud ? 0.1 : 0.035) * (nx - 0.5), py = y + (scud ? 0.2 : 0.07) * (ny - 0.5);
      let den = 0;
      for (const [bx, by, br] of blobs) {
        const dx = (px - bx) * asp, dy = py - by, q = 1 - Math.sqrt(dx * dx + dy * dy) / br;
        if (q > 0) den += q * q * (3 - 2 * q) * 1.4;
      }
      // Margin: torn by two scales of noise, thin and wispy outside, a dense core inside (no outline, no blur).
      const fine2 = fbm(x * 84 + 3, y * 42 + cell);
      den += (0.75 * (fine - 0.5) + 0.5 * (fine2 - 0.5)) * (1 - smooth(0.7, 1.8, den));
      let a = smooth(0.26, 0.82, den);
      a = a * (0.55 + 0.45 * a) * (0.9 + 0.1 * smooth(0.8, 1.6, den));
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
      let b: number, lit = 0, under = 0;
      if (scud) b = 0.8 + 0.22 * (bil - 0.5) + 0.08 * (fine - 0.5);
      else if (tower) {
        // Dark body, bright rim along the upper outline, a little structure inside.
        b = 0.2 + 0.12 * up + 0.16 * (bil - 0.5) + 0.8 * edge * edge * smooth(0.2, 0.6, up);
        lit = 0.7 * edge * edge * smooth(0.2, 0.6, up);
      } else {
        const side = (0.5 - x) * 0.5 + (up - 0.5) * 0.7;
        b = 0.8 + 0.2 * smooth(-0.3, 0.2, side + 0.5 * (nx - 0.5)) + 0.06 * edge - 0.5 * (1 - smooth(0.0, 0.62, up)) + 0.34 * (bil - 0.5) + 0.08 * (fine - 0.5);
        // Facing the light: the upper left flank and the billow tops, never the base.
        lit = smooth(-0.22, 0.3, side + 0.5 * (nx - 0.5) + 0.35 * (bil - 0.5)) * smooth(0.02, 0.4, up);
        // A thin bright margin along the upper outline (the rim of a cloud against the light), and the underside on
        // the light's side: what a sun at the horizon, or a strike below the cloud, lights. Painted warmer (`warm`).
        const rim = 0.45 * edge * edge * smooth(0.15, 0.5, up);
        under = 0.8 * (1 - smooth(0.04, 0.42, up)) * smooth(-0.35, 0.25, (0.5 - x) * 0.9 + 0.5 * (bil - 0.5)) * (0.6 + 0.4 * smooth(0.3, 0.7, fine));
        lit = Math.max(lit, rim);
      }
      b = Math.min(1, Math.max(tower ? 0.08 : 0.3, b));
      const o = ((oy + j) * W + ox + i) * 4;
      // sRGB bytes: white tops, grey-blue shade.
      d[o] = 255 * b * (0.84 + 0.16 * b);
      d[o + 1] = 255 * b * (0.9 + 0.1 * b);
      d[o + 2] = 255 * b;
      d[o + 3] = 255 * a;
      const warm = under / Math.max(1e-3, under + lit);
      l[o] = 255; l[o + 1] = 255 * (1 - 0.24 * warm); l[o + 2] = 255 * (1 - 0.42 * warm);
      l[o + 3] = 255 * a * Math.min(1, Math.max(lit, under));
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
export const ATLAS_W = CW * COLS, ATLAS_H = CH * ROWS, DECK_S = 256;
/**
 * The deck's two edges, 512 x 256: each half is one deck tile (same pixels, so it continues the tiled plane without
 * a seam) with its alpha torn away along u. Left half = the upwind (trailing) edge, alpha rising with u; right half
 * = the downwind (leading) edge, alpha falling to 0. Tileable along v.
 */
function paintEdge(deck: CloudMap): CloudMap {
  const S = deck.W, d = new Uint8Array(2 * S * S * 4);
  for (let j = 0; j < S; j++) for (let i = 0; i < 2 * S; i++) {
    const lead = i >= S, ii = lead ? i - S : i, x = (ii + 0.5) / S, y = j / S, q = lead ? 1 - x : x;
    const n = fbm(q * 5 + (lead ? 0 : 2), y * 6 + (lead ? 0 : 3), 6), n2 = fbm(q * 14 + 5, y * 18, 18);
    // q = 0 at the open side, 1 where the plane begins: shreds and holes in between, nothing at the outer border.
    let a = smooth(0, 1, q * 2.1 - 0.75 + 1.5 * (n - 0.5) + 0.5 * (n2 - 0.5)) * smooth(0, 0.08, q);
    a = Math.max(a, smooth(0.86, 1, q));
    const o = (j * 2 * S + i) * 4, s = (j * S + ii) * 4;
    d[o] = deck.d[s]; d[o + 1] = deck.d[s + 1]; d[o + 2] = deck.d[s + 2]; d[o + 3] = deck.d[s + 3] * a;
  }
  return { d, W: 2 * S, H: S };
}
export function paintClouds(): { atlas: CloudMap; deck: CloudMap; lit: CloudMap; edge: CloudMap } {
  const a = paintAtlas();
  const deck = flip(paintDeck());
  return { atlas: flip({ d: a.d, W: a.W, H: a.H }), deck, lit: flip({ d: a.l, W: a.W, H: a.H }), edge: paintEdge(deck) };
}

import * as THREE from 'three';
import type { TreeSim } from '../sim/tree';
import { season } from '../season';
import { Wind } from '../wind';
import { cleanLeafTexture, type Leaves } from './leaves';

/**
 * Spring blossom. A flower cluster is one card that STANDS ON THE TWIG: its bottom centre sits on the twig surface
 * (point on the segment + twig radius, riding `sway.D`), its y axis is the stalk direction, and the painting grows out
 * of the bottom centre of its atlas cell (spur, common stalk, forking flower stalks, flowers). Hanging types (wisteria,
 * catkins) use the same painting with the card's y axis pointing down.
 *
 * Growth = nine atlas cells (3 x 3) per type, one `InstancedMesh` per cell (same card, uv baked to the cell):
 * 0 bud scale on the twig, 1 stalk half out with green buds, 2 stalk out and buds showing colour, 3 opening,
 * 4 nearly open, 5 full bloom, 6 / 7 petals going, 8 bare stalks with the calyx (and a fruitlet), which lingers,
 * browns and shrinks away. Inside a stage the card scale carries the continuous part (stalk lengthening).
 *
 * PowerVR rule: every mesh's material is a clone of the LIVE leaf material with only `map` swapped (two clones: the
 * atlas and the petal map), maps through `cleanLeafTexture`, geometry position / normal / uv, instance matrices and
 * colours only, no shadows. Type and colour changes repaint the pixels of the same texture objects.
 *
 * Seasons rule: stage, size and colour of a cluster are pure functions of `season.phase` and its own dates. Petals in
 * the air are a pure function of a clock and the phase (each slot loops: leaves a shedding cluster, drifts down,
 * lies, starts again); the carpet is a pure function of the phase. The one exception is `strip`: a storm during
 * bloom advances the fall dates and that advance is accumulated until the bloom is over.
 */

const OPEN0 = 0.008, OPEN_SPREAD = 0.036, BUD = 0.022, OPENING = 0.018;
const HOLD0 = 0.05, HOLD_SPREAD = 0.03, SHED = 0.024, LINGER = 0.04;
/** No cluster is drawn after this phase. */
export const BLOSSOM_END = OPEN0 + OPEN_SPREAD + HOLD0 + HOLD_SPREAD + SHED + LINGER + 0.002;
/** The carpet has faded by this phase; the system is idle from here to the next spring. */
export const CARPET_END = 0.3;
export const BLOSSOM_PEAK = 0.056;
const SOUTH_X = 0.5, SOUTH_Z = 0.866;
const CAP_LOW = 3000, CAP_HIGH = 7000;
const AIR_LOW = 900, AIR_HIGH = 2400, CARPET_LOW = 1600, CARPET_HIGH = 4200;
const R = 16, STAGES = 9;
/** Atlas edge in pixels (a cell is a third): High / Low. A repaint costs about 250 ms unthrottled at 1024. */
const ATLAS_HIGH = 1024, ATLAS_LOW = 768;

type Kind = 'umbel' | 'spur' | 'goblet' | 'raceme' | 'panicle' | 'catkin' | 'star' | 'orb';
export interface BlossomType {
  id: string; name: string; kind: Kind;
  /** Default petal colour and centre / accent colour. */
  colour: string; accent: string;
  /** Suggested petal colours. */
  swatches: string[];
  /** How much of the petal goes pale toward white (0 = solid colour). */
  pale: number;
  /** Share of eligible twigs that flower, cards per twig, card height in metres. */
  amount: number; per: number; size: number;
  hang?: boolean; glow?: boolean; petals: boolean;
  /** Flowers per cluster, flower radius (cell units), petals per flower, notch. */
  n: number; fr: number; pn: number; notch?: boolean;
}

export const BLOSSOM_TYPES: BlossomType[] = [
  { id: 'cherry', name: 'Cherry', kind: 'umbel', colour: '#f590b8', accent: '#e9b23a', swatches: ['#f590b8', '#ffffff', '#ff6fa5', '#e0457f', '#ffd9c8'], pale: 0.38, amount: 0.8, per: 2, size: 0.34, petals: true, n: 5, fr: 0.17, pn: 5, notch: true },
  { id: 'apple', name: 'Apple', kind: 'spur', colour: '#ee6f9c', accent: '#f0d060', swatches: ['#ee6f9c', '#ffffff', '#ff9a8a', '#d9366e', '#ffc7de'], pale: 0.82, amount: 0.7, per: 2, size: 0.32, petals: true, n: 5, fr: 0.185, pn: 5 },
  { id: 'plum', name: 'Plum', kind: 'spur', colour: '#ffffff', accent: '#e7c94e', swatches: ['#ffffff', '#ffe3ee', '#ffb3cf', '#fff3c4', '#e8d5ff'], pale: 0.3, amount: 0.95, per: 3, size: 0.26, petals: true, n: 7, fr: 0.14, pn: 5 },
  { id: 'magnolia', name: 'Magnolia', kind: 'goblet', colour: '#d95f9f', accent: '#e8d38a', swatches: ['#d95f9f', '#ffffff', '#a43d86', '#ffe9a8', '#ff9db5'], pale: 0.7, amount: 0.32, per: 1, size: 0.5, petals: true, n: 1, fr: 0.4, pn: 8 },
  { id: 'wisteria', name: 'Wisteria', kind: 'raceme', colour: '#8f76e6', accent: '#f4e27a', swatches: ['#8f76e6', '#ffffff', '#f2d040', '#e58ad0', '#5e8df0'], pale: 0.45, amount: 0.5, per: 1, size: 0.7, hang: true, petals: true, n: 24, fr: 0.075, pn: 2 },
  { id: 'lilac', name: 'Lilac candle', kind: 'panicle', colour: '#c08be6', accent: '#f6e08a', swatches: ['#c08be6', '#ffffff', '#f3a0b8', '#7d5fd0', '#fff2c0'], pale: 0.35, amount: 0.42, per: 1, size: 0.58, petals: true, n: 46, fr: 0.05, pn: 4 },
  { id: 'catkin', name: 'Catkins', kind: 'catkin', colour: '#c9cf45', accent: '#f1e36a', swatches: ['#c9cf45', '#c4a455', '#e4b03a', '#b6304a', '#e9f0b8'], pale: 0.1, amount: 0.42, per: 2, size: 0.4, hang: true, petals: false, n: 3, fr: 0.05, pn: 0 },
  { id: 'star', name: 'Star lantern', kind: 'star', colour: '#5ff2e0', accent: '#ffffff', swatches: ['#5ff2e0', '#9fc0ff', '#ff7ae0', '#b6ff6a', '#ffd76a'], pale: 0.2, amount: 0.7, per: 2, size: 0.42, glow: true, petals: true, n: 3, fr: 0.3, pn: 6 },
  { id: 'orb', name: 'Trefoil orb', kind: 'orb', colour: '#ffae2e', accent: '#fff0b0', swatches: ['#ffae2e', '#ff6a5a', '#c58bff', '#6ae0ff', '#ffffff'], pale: 0.1, amount: 0.6, per: 2, size: 0.4, glow: true, petals: true, n: 1, fr: 0.36, pn: 3 },
];
const BY_ID: Record<string, BlossomType> = Object.fromEntries(BLOSSOM_TYPES.map((t) => [t.id, t]));
/** Default blossom per leaf form: [type, colour override]. Conifer spray: none. */
const FORM_DEFAULT: Record<string, [string, string?]> = {
  oak: ['apple'], round: ['cherry'], maple: ['plum', '#f4f6c8'], willow: ['catkin'], birch: ['catkin', '#c4a455'], ginkgo: ['magnolia', '#fff3d0'],
  spray: ['none'], frond: ['star'], ring: ['orb'], spiral: ['star', '#9fc0ff'],
};
/** The type a tree wears: `choice` = a type id, 'none', or 'auto' (by leaf form). */
export function blossomTypeFor(choice: string, formId: string): BlossomType | null {
  const id = choice && choice !== 'auto' ? choice : (FORM_DEFAULT[formId] ?? FORM_DEFAULT.oak)[0];
  return BY_ID[id] ?? null;
}
/** The petal colour in use: the user's, else the form's override, else the type's. */
export function blossomColourFor(choice: string, formId: string, colour: string): string {
  if (/^#[0-9a-f]{6}$/i.test(colour)) return colour;
  const t = blossomTypeFor(choice, formId), d = FORM_DEFAULT[formId] ?? FORM_DEFAULT.oak;
  return (!choice || choice === 'auto') && d[1] ? d[1] : t?.colour ?? '#ffffff';
}

const sm = (a: number, b: number, x: number) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a || 1e-6))); return t * t * (3 - 2 * t); };
function h01(a: number) { a = Math.imul(a ^ 0x9e3779b9, 0x85ebca6b); a ^= a >>> 13; a = Math.imul(a, 0xc2b2ae35); a ^= a >>> 16; return (a >>> 0) / 4294967296; }

// ---------------------------------------------------------------------------------------------------------------
// Painting
type RGB = [number, number, number];
const hex = (s: string): RGB => [parseInt(s.slice(1, 3), 16), parseInt(s.slice(3, 5), 16), parseInt(s.slice(5, 7), 16)];
const mix = (a: RGB, b: RGB, t: number): RGB => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
const css = (c: RGB, a = 1) => `rgba(${Math.round(c[0])},${Math.round(c[1])},${Math.round(c[2])},${a})`;
const WHITE: RGB = [255, 255, 255], STALK: RGB = [112, 150, 62], STALK_D: RGB = [122, 84, 58], SEPAL: RGB = [98, 138, 58], SCALE: RGB = [110, 78, 56];

interface Pal { c: RGB; mid: RGB; throat: RGB; edge: RGB; vein: RGB; bud: RGB; acc: RGB; glow: boolean }
function palette(t: BlossomType, colour: string, accent: string): Pal {
  const c = hex(colour), acc = hex(/^#[0-9a-f]{6}$/i.test(accent) ? accent : t.accent);
  // Nothing is painted pure white: the card is lit on top of this, and white leaves no room for veins and shading.
  const cap = (x: RGB): RGB => [Math.min(246, x[0]), Math.min(241, x[1]), Math.min(232, x[2])];
  const mid = cap(mix(c, WHITE, t.pale));
  return { c, mid, throat: t.glow ? mix(c, WHITE, 0.85) : t.kind === 'umbel' ? mix(c, [205, 50, 110], 0.3) : mix(mix(c, WHITE, t.pale * 0.4), [226, 232, 150], t.pale * 0.35), edge: mix(cap(mix(c, WHITE, t.pale * 0.55)), [150, 120, 130], 0.12), vein: mix(cap(c), [90, 30, 60], 0.5), bud: mix(c, [200, 40, 90], t.glow || t.pale < 0.4 ? 0 : 0.12), acc, glow: !!t.glow };
}

type G = CanvasRenderingContext2D;
function stalk(g: G, x0: number, y0: number, x1: number, y1: number, w: number, bend: number, col: RGB) {
  const mx = (x0 + x1) / 2 + (y1 - y0) * bend, my = (y0 + y1) / 2 - (x1 - x0) * bend;
  g.lineCap = 'round';
  g.strokeStyle = css(mix(col, [40, 50, 20], 0.45)); g.lineWidth = w * 1.5; g.beginPath(); g.moveTo(x0, y0); g.quadraticCurveTo(mx, my, x1, y1); g.stroke();
  g.strokeStyle = css(col); g.lineWidth = w * 0.9; g.beginPath(); g.moveTo(x0 - w * 0.12, y0); g.quadraticCurveTo(mx - w * 0.12, my, x1, y1); g.stroke();
}
/** One petal, base at the origin, pointing +x. */
function petal(g: G, L: number, W: number, p: Pal, notch: boolean, shade: number) {
  g.beginPath(); g.moveTo(0, 0);
  g.bezierCurveTo(L * 0.25, -W * 1.3, L * 0.95, -W * 1.1, L, -W * 0.2);
  if (notch) g.lineTo(L * 0.87, 0);
  g.lineTo(L, W * 0.2);
  g.bezierCurveTo(L * 0.95, W * 1.1, L * 0.25, W * 1.3, 0, 0);
  const gr = g.createLinearGradient(0, 0, L, 0), k = 1 - shade;
  const d = (c: RGB) => css([c[0] * k, c[1] * k, c[2] * k]);
  gr.addColorStop(0, d(p.throat)); gr.addColorStop(0.22, d(mix(p.throat, p.mid, 0.7))); gr.addColorStop(0.6, d(p.mid)); gr.addColorStop(1, d(p.edge));
  g.fillStyle = gr; g.fill();
  g.strokeStyle = css(p.vein, 0.4); g.lineWidth = Math.min(2.4, Math.max(1, L * 0.03)); g.stroke();
  g.strokeStyle = css(p.vein, 0.2); g.lineWidth = Math.min(1.5, Math.max(0.8, L * 0.018));
  for (let v = -2; v <= 2; v++) { g.beginPath(); g.moveTo(L * 0.08, 0); g.quadraticCurveTo(L * 0.45, v * W * 0.2, L * (0.9 - 0.07 * Math.abs(v)), v * W * 0.36); g.stroke(); }
}
function sepals(g: G, x: number, y: number, r: number, a0: number, n: number, col: RGB) {
  g.fillStyle = css(col);
  for (let k = 0; k < n; k++) {
    const a = a0 + ((k + 0.5) * 6.283) / n;
    g.save(); g.translate(x, y); g.rotate(a);
    g.beginPath(); g.moveTo(0, -r * 0.16); g.lineTo(r, 0); g.lineTo(0, r * 0.16); g.fill();
    g.restore();
  }
}
/** A closed bud at (x, y) pointing along `a`: green cup, coloured tip once `o` > 0. */
function bud(g: G, x: number, y: number, r: number, a: number, o: number, p: Pal) {
  g.save(); g.translate(x, y); g.rotate(a);
  const c = o > 0.02 ? mix(SEPAL, p.bud, Math.min(1, 0.35 + o * 4)) : mix(SEPAL, [150, 170, 80], 0.3);
  const gr = g.createLinearGradient(-r * 0.3, 0, r, 0);
  gr.addColorStop(0, css(mix(c, [60, 30, 40], 0.25))); gr.addColorStop(0.5, css(c)); gr.addColorStop(1, css(mix(c, WHITE, 0.35)));
  g.fillStyle = gr;
  g.beginPath(); g.moveTo(-r * 0.25, 0); g.bezierCurveTo(-r * 0.1, -r * 0.62, r * 0.7, -r * 0.5, r, 0); g.bezierCurveTo(r * 0.7, r * 0.5, -r * 0.1, r * 0.62, -r * 0.25, 0); g.fill();
  g.strokeStyle = css(p.vein, 0.3); g.lineWidth = Math.max(1, r * 0.06);
  g.beginPath(); g.moveTo(r * 0.05, -r * 0.2); g.quadraticCurveTo(r * 0.6, -r * 0.1, r * 0.95, 0); g.stroke();
  g.fillStyle = css(SEPAL);
  for (const s of [-1, 1]) { g.beginPath(); g.moveTo(-r * 0.3, 0); g.quadraticCurveTo(-r * 0.05, s * r * 0.6, r * 0.45, s * r * 0.3); g.quadraticCurveTo(0, s * r * 0.2, -r * 0.3, 0); g.fill(); }
  g.restore();
}
/** A flower seen face-on. `o` openness 0..1, `shed` share of petals gone, `a` = stalk direction (for buds). */
function flower(g: G, x: number, y: number, r: number, a: number, o: number, shed: number, t: BlossomType, p: Pal, seed: number) {
  if (o < 0.3) { bud(g, x - Math.cos(a) * r * 0.35, y - Math.sin(a) * r * 0.35, r * (0.5 + 0.9 * o), a, o, p); return; }
  const n = t.pn, a0 = h01(seed) * 6.283, k = (o - 0.3) / 0.7, L = r * (0.5 + 0.5 * k), W = r * (0.2 + 0.26 * k) * (5 / n) ** 0.6;
  sepals(g, x, y, r * 0.5, a0, n, shed >= 1 ? mix(SEPAL, SCALE, 0.35) : SEPAL);
  if (shed >= 1) {
    // After the petals: calyx, dried stamens, a small fruitlet.
    g.strokeStyle = css([150, 120, 70]); g.lineWidth = Math.max(1, r * 0.035);
    for (let s = 0; s < 8; s++) { const b = a0 + s * 0.785; g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(b) * r * 0.3, y + Math.sin(b) * r * 0.3); g.stroke(); }
    g.fillStyle = css([120, 160, 70]); g.beginPath(); g.arc(x, y, r * 0.17, 0, 6.283); g.fill();
    g.fillStyle = css([170, 200, 110]); g.beginPath(); g.arc(x - r * 0.05, y - r * 0.05, r * 0.07, 0, 6.283); g.fill();
    return;
  }
  // Petals: odd ones first (under), even ones on top; half-open flowers overlap and are darker inside.
  for (let pass = 0; pass < 2; pass++) for (let i = pass; i < n; i += 2) {
    if (h01(seed * 13 + i) < shed || (shed === 0 && h01(seed * 29 + i) < 0.03)) continue;
    g.save(); g.translate(x, y); g.rotate(a0 + (i * 6.283) / n + (h01(seed + i * 7) - 0.5) * 0.16);
    g.translate(r * 0.06, 0);
    petal(g, L * (0.92 + 0.16 * h01(seed + i * 3)), W, p, !!t.notch, (1 - pass) * 0.07 + (1 - k) * 0.1);
    g.restore();
  }
  // Centre: green eye, filaments, anthers in the accent colour.
  const sr = r * (0.2 + 0.2 * k);
  g.fillStyle = css(mix(p.throat, [150, 180, 70], 0.5)); g.beginPath(); g.arc(x, y, r * 0.1, 0, 6.283); g.fill();
  const ns = 13;
  for (let s = 0; s < ns; s++) {
    const b = a0 + (s * 6.283) / ns + h01(seed + s * 11) * 0.3, l = sr * (0.6 + 0.4 * h01(seed + s * 5)), ex = x + Math.cos(b) * l, ey = y + Math.sin(b) * l;
    g.strokeStyle = css(mix(p.acc, WHITE, 0.6), 0.9); g.lineWidth = Math.max(1, r * 0.022); g.beginPath(); g.moveTo(x, y); g.lineTo(ex, ey); g.stroke();
    g.fillStyle = css(mix(p.acc, [150, 90, 20], 0.25)); g.beginPath(); g.arc(ex, ey, Math.max(1.2, r * 0.045), 0, 6.283); g.fill();
    g.fillStyle = css(mix(p.acc, WHITE, 0.3)); g.beginPath(); g.arc(ex - r * 0.012, ey - r * 0.012, Math.max(0.7, r * 0.022), 0, 6.283); g.fill();
  }
}
function leaflet(g: G, x: number, y: number, a: number, L: number) {
  g.save(); g.translate(x, y); g.rotate(a);
  const gr = g.createLinearGradient(0, 0, L, 0); gr.addColorStop(0, '#5f8f34'); gr.addColorStop(1, '#a9c95a');
  g.fillStyle = gr; g.beginPath(); g.moveTo(0, 0); g.bezierCurveTo(L * 0.3, -L * 0.34, L * 0.8, -L * 0.2, L, 0); g.bezierCurveTo(L * 0.8, L * 0.2, L * 0.3, L * 0.34, 0, 0); g.fill();
  g.strokeStyle = 'rgba(220,240,160,0.6)'; g.lineWidth = Math.max(1, L * 0.03); g.beginPath(); g.moveTo(0, 0); g.lineTo(L * 0.92, 0); g.stroke();
  g.restore();
}

/** Stage parameters: growth of the stalk, openness, share shed. */
const STAGE: [number, number, number][] = [[0.1, 0, 0], [0.6, 0, 0], [1, 0.14, 0], [1, 0.5, 0], [1, 0.8, 0], [1, 1, 0], [1, 1, 0.4], [1, 1, 0.8], [1, 1, 1]];

/** Paints one growth stage of a type into the square (0,0)-(S,S) of `g`; the cluster grows up from the bottom centre. */
export function paintStage(g: G, t: BlossomType, p: Pal, stage: number, S: number) {
  const [gr, o, shed] = STAGE[stage];
  const X = (u: number) => S * (0.5 + u), Y = (v: number) => S * (1 - v);
  const seed0 = 77 + stage * 0; // the same flowers in every stage: only their state differs
  // Bud scale / spur on the twig (every type, every stage).
  const spur = t.kind === 'umbel' || t.kind === 'spur' ? 0.07 : 0.04;
  g.fillStyle = css(SCALE);
  g.beginPath(); g.moveTo(X(-0.035), Y(0)); g.quadraticCurveTo(X(-0.05), Y(spur * 0.8), X(0), Y(spur * 1.25)); g.quadraticCurveTo(X(0.05), Y(spur * 0.8), X(0.035), Y(0)); g.fill();
  g.fillStyle = css(mix(SCALE, [190, 150, 110], 0.5));
  g.beginPath(); g.moveTo(X(-0.012), Y(0)); g.quadraticCurveTo(X(-0.02), Y(spur * 0.7), X(0.004), Y(spur * 1.1)); g.quadraticCurveTo(X(0.02), Y(spur * 0.6), X(0.014), Y(0)); g.fill();
  if (stage === 0) { bud(g, X(0), Y(spur * 0.9), S * 0.045, -1.571, 0, p); return; }
  const sw = S * 0.016;
  const stCol = shed >= 1 ? mix(STALK, STALK_D, 0.5) : t.kind === 'umbel' ? mix(STALK, STALK_D, 0.45) : STALK;
  const each = (i: number) => (shed > 0 ? o : Math.max(0, Math.min(1, o * 1.25 + (h01(seed0 + i * 17) - 0.6) * 0.5 * (o > 0 && o < 1 ? 1 : 0.0) - (o >= 1 && h01(seed0 + i * 31) < 0.14 ? 0.85 : 0))));
  if (t.kind === 'umbel' || t.kind === 'spur') {
    const um = t.kind === 'umbel', n = t.n, by = spur;
    if (!um) for (const [a, l] of [[-2.5, 0.2], [-0.65, 0.22], [-1.2, 0.15]] as const) leaflet(g, X(0), Y(by * 0.8), a, S * l * gr);
    const pts: [number, number, number, number][] = [];
    for (let i = 0; i < n; i++) {
      // Cherry: long stalks fanning from the spur. Apple / plum: a short axis with the flowers close on it.
      const f = (i + 0.5) / n - 0.5, j = h01(seed0 + i * 5) - 0.5;
      let u: number, v: number;
      if (um) { const a = f * 2.0 + j * 0.25, l = (0.5 + 0.22 * h01(seed0 + i * 9) - 0.12 * Math.abs(f)) * gr; u = Math.sin(a) * l; v = by + Math.cos(a) * l; }
      else if (n > 6) { const tt = (i + 0.6) / n; u = (i % 2 ? 1 : -1) * (0.17 + 0.1 * h01(seed0 + i * 9)) * (1.1 - 0.5 * tt) * gr; v = by + (0.1 + 0.72 * tt) * gr; }
      else { const a = f * 2.5 + j * 0.3, l = (0.3 + 0.2 * h01(seed0 + i * 9)) * gr; u = Math.sin(a) * l * 1.1; v = by + 0.1 * gr + Math.cos(a) * l; }
      u = Math.max(-0.5 + t.fr, Math.min(0.5 - t.fr, u)); v = Math.min(0.95 - t.fr, v);
      pts.push([u, v, Math.atan2(-(v - by), u), i]);
    }
    if (!um && n > 6) stalk(g, X(0), Y(by), X(0.01), Y(by + 0.8 * gr), sw * 1.3, 0.03, mix(STALK, STALK_D, 0.6));
    for (const [u, v, , i] of pts) stalk(g, X(um || n <= 6 ? 0 : 0.005), Y(um || n <= 6 ? by : Math.max(by, v - 0.09 * gr)), X(u), Y(v), sw * (um ? 0.8 : 0.9), (i % 2 ? 0.12 : -0.12), stCol);
    // Back to front: outer flowers first, so the middle ones overlap them.
    pts.sort((a, b) => Math.abs(b[0]) - Math.abs(a[0]));
    for (const [u, v, a, i] of pts) flower(g, X(u), Y(v), S * t.fr * (0.88 + 0.24 * h01(seed0 + i * 3)) * (0.75 + 0.25 * gr), a, each(i), shed, t, p, seed0 + i * 101);
  } else if (t.kind === 'goblet') {
    // Magnolia: one thick stalk at the twig tip, a furry bud scale, a goblet of long tepals seen from the side.
    const bx = 0.02, by = 0.04 + 0.2 * gr, H = S * 0.68 * (0.45 + 0.55 * Math.max(o, 0.25)) * gr;
    stalk(g, X(0), Y(0.02), X(bx), Y(by), sw * 2.4, 0.08, mix(STALK, STALK_D, 0.7));
    g.fillStyle = css([150, 160, 120]);
    for (const s of [-1, 1]) { g.beginPath(); g.moveTo(X(bx), Y(by - 0.02)); g.quadraticCurveTo(X(bx + s * 0.1), Y(by + 0.04), X(bx + s * 0.07), Y(by + 0.15 * gr)); g.quadraticCurveTo(X(bx + s * 0.01), Y(by + 0.06), X(bx), Y(by - 0.02)); g.fill(); }
    if (shed >= 1) {
      g.fillStyle = css([150, 170, 80]); g.beginPath(); g.ellipse(X(bx), Y(by + 0.1), S * 0.035, S * 0.1, 0, 0, 6.283); g.fill();
      g.fillStyle = css([200, 170, 90]); for (let i = 0; i < 9; i++) { g.beginPath(); g.arc(X(bx + (h01(i) - 0.5) * 0.05), Y(by + 0.04 + 0.014 * i), S * 0.012, 0, 6.283); g.fill(); }
      return;
    }
    const n = o < 0.2 ? 2 : t.pn, spread = 0.08 + 0.5 * o;
    const order = [...Array(n).keys()].sort((a, b) => Math.abs(b - (n - 1) / 2) - Math.abs(a - (n - 1) / 2));
    order.reverse(); // outer (most tilted) ones are drawn last = in front? No: inner back tepals first, outer front last.
    for (const i of order.reverse()) {
      if (h01(seed0 * 13 + i) < shed) continue;
      const f = n > 1 ? i / (n - 1) - 0.5 : 0, ang = -1.571 + f * 2 * spread + (h01(seed0 + i) - 0.5) * 0.1;
      g.save(); g.translate(X(bx), Y(by)); g.rotate(ang);
      const pp: Pal = { ...p, throat: mix(p.c, [120, 20, 70], 0.2), mid: mix(p.c, WHITE, 0.2 + 0.4 * t.pale), edge: mix(p.c, WHITE, t.pale) };
      petal(g, H * (0.84 + 0.16 * Math.cos(f * 3)), H * (0.1 + 0.05 * o), pp, false, (i % 2) * 0.1);
      g.restore();
    }
  } else if (t.kind === 'raceme' || t.kind === 'panicle') {
    // An axis with florets along it; they open from the base (twig end) toward the tip.
    const pan = t.kind === 'panicle', len = 0.93 * gr, n = t.n;
    stalk(g, X(0), Y(0.02), X(0.02), Y(len), sw * (pan ? 1.4 : 1.1), 0.04, stCol);
    const fl: [number, number, number, number][] = [];
    for (let i = 0; i < n; i++) {
      const tt = 0.1 + 0.9 * ((i + h01(seed0 + i) * 0.8) / n), side = (i % 2 ? 1 : -1) * (0.25 + 0.75 * h01(seed0 + i * 7));
      const w = pan ? 0.3 * (1 - tt) ** 0.8 + 0.03 : 0.2 * (1 - 0.65 * tt);
      fl.push([side * w * Math.min(1, gr * 1.2), tt * len, tt, i]);
    }
    if (pan) for (let b = 0; b < 7; b++) { const tt = 0.12 + 0.11 * b, s = b % 2 ? 1 : -1; stalk(g, X(0.01), Y(tt * len), X(s * 0.3 * (1 - tt) * Math.min(1, gr * 1.2)), Y((tt + 0.1) * len), sw * 0.7, 0.1 * s, stCol); }
    for (const [u, v, tt, i] of fl) {
      const x = X(u), y = Y(v), r = S * t.fr * (1.15 - 0.45 * tt) * (0.8 + 0.4 * h01(seed0 + i * 3));
      if (!pan) stalk(g, X(0.01 + 0.01 * tt), Y(v + 0.02), x, y, sw * 0.5, 0.1, stCol);
      const open = o * 1.3 > tt + 0.12;
      if (shed > 0 && h01(seed0 * 13 + i) < shed) { if (shed >= 1 || h01(i) < 0.5) { g.fillStyle = css(mix(SEPAL, SCALE, shed >= 1 ? 0.5 : 0)); g.beginPath(); g.arc(x, y, r * 0.3, 0, 6.283); g.fill(); } continue; }
      if (!open) { bud(g, x, y, r * (0.75 + 0.5 * o), pan ? -1.571 + u * 3 : 1.571 * 0 + Math.atan2(-0.3, u), Math.max(0, o * 1.3 - tt + 0.25), p); continue; }
      if (pan) {
        // Four-lobed floret with a tube shadow and a pale eye.
        g.save(); g.translate(x, y); g.rotate(h01(seed0 + i * 9) * 1.57);
        for (let k = 0; k < 4; k++) { g.rotate(1.571); const q = g.createLinearGradient(0, 0, r * 1.3, 0); q.addColorStop(0, css(mix(p.c, [60, 20, 80], 0.25))); q.addColorStop(0.5, css(p.mid)); q.addColorStop(1, css(p.edge)); g.fillStyle = q; g.beginPath(); g.ellipse(r * 0.68, 0, r * 0.66, r * 0.44, 0, 0, 6.283); g.fill(); g.strokeStyle = css(p.vein, 0.3); g.lineWidth = 1; g.stroke(); }
        g.fillStyle = css(p.acc); g.beginPath(); g.arc(0, 0, r * 0.2, 0, 6.283); g.fill();
        g.restore();
      } else {
        // Pea flower: pale standard behind, darker wings and keel in front, a yellow blotch.
        g.save(); g.translate(x, y); g.rotate(u > 0 ? 0.5 : -0.5);
        let q = g.createLinearGradient(0, r, 0, -r * 1.2); q.addColorStop(0, css(p.mid)); q.addColorStop(1, css(mix(p.mid, WHITE, 0.5)));
        g.fillStyle = q; g.beginPath(); g.ellipse(0, -r * 0.45, r * 1.05, r * 0.95, 0, 0, 6.283); g.fill(); g.strokeStyle = css(p.vein, 0.25); g.lineWidth = 1; g.stroke();
        g.fillStyle = css(p.acc, 0.9); g.beginPath(); g.ellipse(0, -r * 0.3, r * 0.2, r * 0.3, 0, 0, 6.283); g.fill();
        q = g.createLinearGradient(0, -r * 0.2, 0, r * 1.1); q.addColorStop(0, css(p.c)); q.addColorStop(1, css(mix(p.c, [50, 20, 110], 0.4)));
        g.fillStyle = q; for (const s of [-1, 1]) { g.beginPath(); g.ellipse(s * r * 0.3, r * 0.42, r * 0.36, r * 0.72, s * -0.25, 0, 6.283); g.fill(); }
        g.restore();
      }
    }
  } else if (t.kind === 'catkin') {
    // Tassels from one bud: scales overlapping down an axis; open = longer, looser, anthers showing.
    const dry = shed >= 1 ? 0.75 : shed * 0.5;
    for (let c = 0; c < t.n; c++) {
      const x0 = (c - 1) * 0.16 + 0.03 * (h01(c + 5) - 0.5), len = (0.55 + 0.4 * h01(c + 9)) * gr * (0.55 + 0.45 * Math.max(o, 0.2)) * (1 - 0.25 * dry);
      const w = S * 0.05 * (0.75 + 0.45 * o) * (1 - 0.5 * dry), nS = Math.max(3, Math.round((len * S) / (w * 0.62)));
      stalk(g, X(0), Y(0.03), X(x0 * 0.5), Y(0.09), sw * 0.8, 0.1, stCol);
      for (let j = 0; j < nS; j++) {
        const tt = j / nS, v = 0.09 + tt * len, u = x0 * (0.5 + 0.5 * tt) + Math.sin(c * 2 + tt * 3.5) * 0.035 * tt;
        const base = mix(mix(p.c, [90, 110, 40], 0.35), p.c, o), col = mix(j % 2 ? base : mix(base, [70, 60, 30], 0.3), [120, 90, 50], dry);
        g.fillStyle = css(mix(col, [30, 30, 10], 0.35)); g.beginPath(); g.ellipse(X(u), Y(v) + w * 0.12, w * (1.05 - 0.4 * tt), w * 0.72, 0, 0, 6.283); g.fill();
        g.fillStyle = css(col); g.beginPath(); g.ellipse(X(u), Y(v), w * (0.95 - 0.4 * tt), w * 0.6, 0, 0, 6.283); g.fill();
        if (o > 0.45 && shed < 1) for (const s of [-1, 1]) { g.fillStyle = css(mix(p.acc, WHITE, 0.2 * (j % 3))); g.beginPath(); g.arc(X(u) + s * w * (0.75 - 0.3 * tt), Y(v) + w * 0.2, w * 0.3 * o, 0, 6.283); g.fill(); }
      }
    }
  } else {
    // Alien blooms on a pale filament: six-rayed star lanterns, or a three-fold orb with a bead ring.
    const fil = mix(p.c, [40, 60, 90], 0.45), st = t.kind === 'star';
    const heads: [number, number, number][] = st ? [[0, 0.62, 1], [-0.27, 0.34, 0.45], [0.28, 0.4, 0.5]] : [[0, 0.58, 1]];
    for (const [u, v, k] of heads) {
      const x = X(u * gr), y = Y(0.03 + (v - 0.03) * gr), r = S * t.fr * k * (0.75 + 0.25 * gr);
      stalk(g, X(0), Y(0.03), x, y, sw * (k === 1 ? 1.2 : 0.8), u > 0 ? -0.15 : 0.15, fil);
      if (o < 0.1) { bud(g, x, y + r * 0.1, r * 0.3, -1.571, 0, p); continue; }
      const oo = Math.max(0.25, o), a0 = 0.3 + u * 3;
      const ray = (a: number, L: number, W: number, c0: RGB, c1: RGB) => {
        g.save(); g.translate(x, y); g.rotate(a);
        const q = g.createLinearGradient(0, 0, L, 0); q.addColorStop(0, css(c0)); q.addColorStop(0.45, css(c1)); q.addColorStop(1, css(mix(c1, [20, 30, 80], 0.35)));
        g.fillStyle = q; g.beginPath(); g.moveTo(0, 0); g.quadraticCurveTo(L * 0.3, -W, L, 0); g.quadraticCurveTo(L * 0.3, W, 0, 0); g.fill();
        g.strokeStyle = css(WHITE, 0.55); g.lineWidth = Math.max(1, r * 0.02); g.beginPath(); g.moveTo(0, 0); g.lineTo(L * 0.8, 0); g.stroke();
        g.restore();
      };
      if (st) {
        for (let i = 0; i < 6; i++) if (!(h01(i + 3 + k * 7) < shed)) ray(a0 + i * 1.047 + 0.52, r * 0.55 * oo, r * 0.13, p.mid, mix(p.c, [30, 40, 120], 0.3));
        for (let i = 0; i < 6; i++) { if (h01(i + 40 + k * 7) < shed) continue; ray(a0 + i * 1.047, r * (0.35 + 0.65 * oo), r * (0.1 + 0.1 * oo), mix(p.c, WHITE, 0.8), p.c); if (o > 0.6) { g.fillStyle = css(p.acc); g.beginPath(); g.arc(x + Math.cos(a0 + i * 1.047) * r * 1.02, y + Math.sin(a0 + i * 1.047) * r * 1.02, r * 0.05, 0, 6.283); g.fill(); } }
      } else {
        if (o > 0.6 && shed < 1) for (let i = 0; i < 9; i++) { const a = a0 + i * 0.698; g.strokeStyle = css(fil); g.lineWidth = Math.max(1, r * 0.02); g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r); g.stroke(); g.fillStyle = css(mix(p.acc, p.c, 0.3)); g.beginPath(); g.arc(x + Math.cos(a) * r, y + Math.sin(a) * r, r * 0.07, 0, 6.283); g.fill(); }
        for (let ring = 0; ring < 2; ring++) for (let i = 0; i < 3; i++) {
          if (h01(i + ring * 9 + 3) < shed) continue;
          const a = a0 + i * 2.094 + ring * 1.047, L = r * (ring ? 0.5 : 0.85) * (0.4 + 0.6 * oo);
          g.save(); g.translate(x, y); g.rotate(a);
          const q = g.createRadialGradient(L * 0.2, 0, 0, L * 0.5, 0, L * 0.75); q.addColorStop(0, css(mix(p.c, WHITE, ring ? 0.9 : 0.6))); q.addColorStop(0.7, css(ring ? p.mid : p.c)); q.addColorStop(1, css(mix(p.c, [90, 20, 60], 0.45)));
          g.fillStyle = q; g.beginPath(); g.moveTo(0, 0); g.bezierCurveTo(L * 0.2, -L * 0.9, L * 1.15, -L * 0.6, L * 0.86, 0); g.bezierCurveTo(L * 1.15, L * 0.6, L * 0.2, L * 0.9, 0, 0); g.fill();
          g.strokeStyle = css(p.vein, 0.35); g.lineWidth = Math.max(1, r * 0.02); g.stroke();
          g.restore();
        }
      }
      g.fillStyle = css(shed >= 1 ? mix(p.c, [60, 60, 60], 0.5) : mix(p.acc, WHITE, 0.5)); g.beginPath(); g.arc(x, y, r * 0.13, 0, 6.283); g.fill();
    }
  }
}

/** The 3 x 3 stage atlas of a type in the given colours. */
export function blossomAtlas(t: BlossomType, colour: string, accent: string, S: number): HTMLCanvasElement {
  const cv = document.createElement('canvas'); cv.width = cv.height = S;
  const g = cv.getContext('2d')!, c = S / 3, p = palette(t, colour, accent);
  for (let s = 0; s < STAGES; s++) {
    g.save(); g.translate((s % 3) * c, Math.floor(s / 3) * c);
    g.beginPath(); g.rect(0, c * 0.03, c, c * 0.97); g.clip();
    paintStage(g, t, p, s, c);
    g.restore();
  }
  return cv;
}
/** Picker picture: the full-bloom stage (hanging types upside down, as on the tree). */
export function blossomThumb(cv: HTMLCanvasElement, t: BlossomType, colour: string, accent = '') {
  const g = cv.getContext('2d')!, S = cv.width;
  g.clearRect(0, 0, S, S); g.save();
  if (t.hang) { g.translate(S, S); g.rotate(Math.PI); }
  paintStage(g, t, palette(t, colour, accent), 5, S);
  g.restore();
}
/** A single fallen petal (or glowing mote), tip up. */
function petalCanvas(t: BlossomType, colour: string, accent: string, S = 64): HTMLCanvasElement {
  const cv = document.createElement('canvas'); cv.width = cv.height = S;
  const g = cv.getContext('2d')!, p = palette(t, colour, accent);
  g.translate(S / 2, S * 0.97); g.rotate(-1.571);
  const pp: Pal = t.kind === 'goblet' ? { ...p, throat: p.c, edge: mix(p.c, WHITE, t.pale) } : p;
  petal(g, S * 0.92, S * (t.kind === 'goblet' ? 0.26 : 0.36), pp, !!t.notch, 0);
  return cv;
}

// ---------------------------------------------------------------------------------------------------------------
/** Doubled flat card (x -0.5..0.5, y 0..1) whose uv covers one atlas cell (`cell` < 0: the whole map). */
function cardGeometry(cell: number, ATLAS = 1024): THREE.BufferGeometry {
  const q = [-0.5, 0, 0.5, 0, 0.5, 1, -0.5, 0, 0.5, 1, -0.5, 1];
  const P = new Float32Array(36), N = new Float32Array(36), U = new Float32Array(24);
  const cx = cell < 0 ? 0 : (cell % 3) / 3, cy = cell < 0 ? 0 : 1 - (Math.floor(cell / 3) + 1) / 3, cs = cell < 0 ? 1 : 1 / 3;
  // Half a texel inside the cell, so neighbours do not bleed in at the card edge.
  const e = cell < 0 ? 0 : 0.6 / ATLAS;
  for (let v = 0; v < 12; v++) {
    const back = v >= 6, s = back ? [0, 2, 1, 3, 5, 4][v - 6] : v;
    P[v * 3] = q[s * 2]; P[v * 3 + 1] = q[s * 2 + 1];
    N[v * 3 + 2] = back ? -1 : 1;
    U[v * 2] = cx + e + (q[s * 2] + 0.5) * (cs - 2 * e); U[v * 2 + 1] = cy + e + q[s * 2 + 1] * (cs - 2 * e);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(P, 3));
  g.setAttribute('normal', new THREE.BufferAttribute(N, 3));
  g.setAttribute('uv', new THREE.BufferAttribute(U, 2));
  g.boundingSphere = new THREE.Sphere(new THREE.Vector3(0, 6, 0), 80);
  return g;
}

export interface BlossomEnv {
  /** `params.season.blossom`: 0 = none, 1 = normal. */
  amount: number;
  low: boolean;
  night: number;
  /** `sway.D` (offset per node id). */
  D: Float32Array;
  wind: Wind;
  violence: number;
  formId: string;
  /** `params.season.blossomType / blossomColour / blossomCentre`. */
  type: string; colour: string; accent: string;
  sun: THREE.DirectionalLight;
  hemi: THREE.HemisphereLight;
  cam: THREE.Vector3;
}

export class Blossom {
  group = new THREE.Group();
  /** One mesh per growth stage; `mesh` = full bloom. */
  meshes: THREE.InstancedMesh[] = [];
  mesh: THREE.InstancedMesh;
  /** Petals: slots [0, air) fly, [air, air + carpet) lie on the ground. */
  pet: THREE.InstancedMesh;
  private tex: THREE.Texture;
  private ptex: THREE.Texture;
  private cap: number; private air: number; private carpet: number;
  private rec: Float32Array;
  private node: Int32Array;
  /** Stage (0..8, 255 = not drawn) and slot in its stage mesh, per cluster, as of the last full pass. */
  private stg: Uint8Array;
  private idx: Int32Array[] = [];
  private cnt = new Int32Array(STAGES);
  private lastPh = NaN; private tick = 0; private n = 0;
  private key = ''; private paintKey = ''; private paintAt = 0;
  type: BlossomType | null = null;
  private colKey = NaN; private simT = 0; private clock = 0;
  /** Phase by which storms have advanced the petal fall this spring. */
  strip = 0;
  private up = new Float32Array(3);
  private crown = [0, 0, 1, 1];
  stats = { clusters: 0, drawn: 0, open: 0, falling: 0, petals: 0, carpet: 0, rebuilds: 0, paints: 0, paintMs: 0, lastMs: 0, maxMs: 0, sumMs: 0, frames: 0, type: '', colour: '' };

  constructor(leaves: Leaves, low: boolean) {
    this.group.name = 'blossom';
    const cap = this.cap = low ? CAP_LOW : CAP_HIGH;
    this.air = low ? AIR_LOW : AIR_HIGH; this.carpet = low ? CARPET_LOW : CARPET_HIGH;
    this.rec = new Float32Array(cap * R); this.node = new Int32Array(cap); this.stg = new Uint8Array(cap).fill(255);
    const live = leaves.mesh.material as THREE.MeshLambertMaterial;
    const safe = live.isMeshLambertMaterial || (live as unknown as THREE.MeshBasicMaterial).isMeshBasicMaterial;
    const t0 = BY_ID.apple;
    this.size = low ? ATLAS_LOW : ATLAS_HIGH;
    this.paintKey = `${t0.id}|${t0.colour}|`;
    this.tex = this.clean(blossomAtlas(t0, t0.colour, t0.accent, this.size));
    this.ptex = this.clean(petalCanvas(t0, t0.colour, t0.accent));
    const material = (tex: THREE.Texture) => {
      // Safe path: clone of the live leaf material. Full leaf path (desktop): the Lambert V0 configuration of the meadow.
      const m = safe ? live.clone() : new THREE.MeshLambertMaterial({ side: THREE.FrontSide, map: tex, alphaTest: 0.5 });
      m.map = tex;
      return m;
    };
    const make = (geo: THREE.BufferGeometry, m: THREE.Material, tex: THREE.Texture, count: number) => {
      const mesh = new THREE.InstancedMesh(geo, m, count);
      mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
      (mesh.instanceMatrix.array as Float32Array).fill(0);
      mesh.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(count * 3), 3).setUsage(THREE.DynamicDrawUsage);
      mesh.castShadow = false; mesh.receiveShadow = false; mesh.frustumCulled = false; mesh.matrixAutoUpdate = false;
      if (!low) {
        // GTAO g-buffer material with the alpha cut-out (High only; never compiled on Low). See Post and the meadow.
        const gb = new THREE.MeshNormalMaterial({ side: THREE.FrontSide, blending: THREE.NoBlending });
        gb.allowOverride = false;
        gb.onBeforeCompile = (sh) => {
          sh.uniforms.cutMap = { value: tex };
          sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying vec2 vCutUv;').replace('#include <begin_vertex>', '#include <begin_vertex>\nvCutUv = uv;');
          sh.fragmentShader = sh.fragmentShader.replace('void main() {', 'uniform sampler2D cutMap;\nvarying vec2 vCutUv;\nvoid main() {')
            .replace('#include <clipping_planes_fragment>', '#include <clipping_planes_fragment>\nif (texture2D(cutMap, vCutUv).a < 0.5) discard;');
        };
        mesh.userData.gbufferMaterial = gb;
      }
      mesh.count = 0; mesh.visible = false;
      this.group.add(mesh);
      return mesh;
    };
    const m = material(this.tex);
    for (let s = 0; s < STAGES; s++) { this.meshes.push(make(cardGeometry(s, this.size), m, this.tex, cap)); this.idx.push(new Int32Array(cap)); }
    this.mesh = this.meshes[5];
    this.pet = make(cardGeometry(-1), material(this.ptex), this.ptex, this.air + this.carpet);
  }

  private size = ATLAS_HIGH;
  /** Cheap checksum of the live atlas pixels and what is drawn (smoke: a type or colour change changes the picture). */
  signature(): string {
    const d = (this.tex.mipmaps as unknown as { data: Uint8Array }[])[0].data; let h = 0;
    for (let i = 0; i < d.length; i += 97) h = (Math.imul(h, 31) + d[i]) | 0;
    return `${h}|${this.stats.type}|${this.stats.colour}|${Array.from(this.cnt).join(',')}`;
  }

  private clean(cv: HTMLCanvasElement): THREE.Texture {
    const src = new THREE.CanvasTexture(cv);
    src.colorSpace = THREE.SRGBColorSpace;
    const t = cleanLeafTexture(src, true);
    src.dispose();
    return t;
  }

  /** Type or colour change: the pixels of the live maps are replaced level by level (same texture objects, no new program). */
  private repaint(t: BlossomType, colour: string, accent: string) {
    const t0 = performance.now();
    const put = (live: THREE.Texture, fresh: THREE.Texture) => {
      const dst = live.mipmaps as unknown as { data: Uint8Array }[], src = fresh.mipmaps as unknown as { data: Uint8Array }[];
      for (let i = 0; i < dst.length && i < src.length; i++) dst[i].data.set(src[i].data);
      live.needsUpdate = true;
      fresh.dispose();
    };
    put(this.tex, this.clean(blossomAtlas(t, colour, accent, this.size)));
    put(this.ptex, this.clean(petalCanvas(t, colour, accent)));
    this.stats.paints++; this.stats.paintMs = performance.now() - t0;
    this.stats.type = t.id; this.stats.colour = colour;
  }

  /** Which twigs flower, where each card stands on its twig, and each cluster's dates. Pure function of the tree and the controls. */
  private rebuild(sim: TreeSim, e: BlossomEnv) {
    const f = this.type!, nodes = sim.nodes, chains = sim.chains, rec = this.rec;
    const mn = sim.bboxMin, mx = sim.bboxMax, cx = (mn[0] + mx[0]) / 2, cz = (mn[2] + mx[2]) / 2;
    const H = Math.max(1, mx[1] - mn[1]), Rr = Math.max(0.5, (mx[0] - mn[0] + mx[2] - mn[2]) / 4);
    this.crown = [cx, cz, Rr, H];
    // Old enough: none on a sapling, all from a crown of about 3000 leaves; and only on wood from before this spring.
    const mature = sm(600, 3000, sim.leaves.length);
    const share = Math.min(1, e.amount) * f.amount * mature, per = f.per + (e.amount > 1 ? 1 : 0);
    const tSpring = season.springTime;
    let elig = 0;
    for (let pass = 0; pass < 2; pass++) {
      // Pass 0 counts, pass 1 fills (thinned evenly by hash when the cap would be exceeded).
      const keep = pass === 0 ? 1 : Math.min(1, this.cap / Math.max(1, elig * per));
      let n = 0;
      for (let id = 1; id < nodes.length && n < this.cap; id++) {
        const nd = nodes[id];
        if (!nd.leafy || nd.order === 0 || nd.born > tSpring || nd.light < 0.06 || chains[nd.chain]?.pruned) continue;
        const lw = sm(0.06, 0.28, nd.light);
        // Whole twigs flower or do not (hash of the chain), so bloom gathers along twigs instead of sprinkling evenly.
        if (h01(nd.chain * 7 + 1) * 0.6 + h01(id * 7 + 1) * 0.4 >= share * (0.3 + 0.7 * lw)) continue;
        if (pass === 0) { elig++; continue; }
        const pa = nodes[nd.parent] ?? nd;
        const ox = nd.wx - cx, oz = nd.wz - cz, ol = Math.hypot(ox, oz) || 1;
        const hgt = Math.min(1, Math.max(0, (nd.wy - mn[1]) / H));
        const side = 0.5 + 0.5 * Math.min(1, Math.max(-1, (ox * SOUTH_X + oz * SOUTH_Z) / Rr));
        const expo = 0.4 * lw + 0.35 * hgt + 0.25 * side;
        for (let k = 0; k < per && n < this.cap; k++) {
          const q = id * 4 + k;
          if (k >= f.per && h01(q * 5 + 4) > e.amount - 1) continue;
          if (h01(q * 5 + 3) >= keep) continue;
          const u = h01(q * 5), v = h01(q * 5 + 1), w = h01(q * 5 + 2);
          const o = n * R, size = f.size * (0.78 + 0.44 * w) * (0.85 + 0.3 * lw);
          // Stalk direction Y: out of the twig, up and outward (hanging types: down). Made perpendicular-ish to the twig.
          let yx: number, yy: number, yz: number;
          if (f.hang) { yx = (u - 0.5) * 0.24; yy = -1; yz = (w - 0.5) * 0.24; }
          else {
            yx = (ox / ol) * 0.55 + (u - 0.5) * 1.3; yy = 0.9 + (v - 0.5) * 0.7; yz = (oz / ol) * 0.55 + (w - 0.5) * 1.3;
            const along = (yx * nd.wdx + yy * nd.wdy + yz * nd.wdz) * 0.75;
            yx -= along * nd.wdx; yy -= along * nd.wdy; yz -= along * nd.wdz;
          }
          const yl = Math.hypot(yx, yy, yz) || 1; yx /= yl; yy /= yl; yz /= yl;
          // Card normal: outward from the crown with scatter, perpendicular to the stalk. X = Y x N.
          let nx = ox / ol + (v - 0.5) * 1.4, ny = 0.3, nz = oz / ol + (u - 0.5) * 1.4;
          const dn = nx * yx + ny * yy + nz * yz; nx -= dn * yx; ny -= dn * yy; nz -= dn * yz;
          const nl = Math.hypot(nx, ny, nz) || 1; nx /= nl; ny /= nl; nz /= nl;
          const fl = h01(q * 5 + 7) < 0.5 ? -1 : 1;
          const xx = (yy * nz - yz * ny) * fl, xy = (yz * nx - yx * nz) * fl, xz = (yx * ny - yy * nx) * fl;
          // Foot of the stalk: a point along the segment, pushed to the twig surface.
          const ts = k === 0 ? 1 : 0.15 + 0.8 * h01(q * 5 + 6), rad = nd.radius * 0.85;
          rec[o] = pa.wx + (nd.wx - pa.wx) * ts + yx * rad; rec[o + 1] = pa.wy + (nd.wy - pa.wy) * ts + yy * rad; rec[o + 2] = pa.wz + (nd.wz - pa.wz) * ts + yz * rad;
          rec[o + 3] = xx * size; rec[o + 4] = xy * size; rec[o + 5] = xz * size;
          rec[o + 6] = yx * size; rec[o + 7] = yy * size; rec[o + 8] = yz * size;
          rec[o + 9] = nx * size * fl; rec[o + 10] = ny * size * fl; rec[o + 11] = nz * size * fl;
          const tOpen = OPEN0 + OPEN_SPREAD * (0.72 * (1 - expo) + 0.28 * u);
          rec[o + 12] = tOpen; rec[o + 13] = tOpen + HOLD0 + HOLD_SPREAD * v;
          rec[o + 14] = (0.86 + 0.24 * w) * (0.72 + 0.28 * lw);
          rec[o + 15] = u;
          this.node[n++] = id;
        }
      }
      if (pass === 1) this.n = n;
    }
    this.stats.clusters = this.n; this.stats.rebuilds++;
    this.colKey = NaN; this.lastPh = NaN;
  }

  private hide() {
    for (const m of this.meshes) { m.visible = false; m.count = 0; }
    this.pet.visible = false; this.pet.count = 0;
    this.key = ''; this.stats.drawn = this.stats.open = this.stats.falling = this.stats.petals = this.stats.carpet = 0;
  }

  /** Once per frame, after the sway offsets of the frame are known. */
  frame(dt: number, sim: TreeSim, e: BlossomEnv) {
    const t0 = performance.now(), ph = season.phase, st = this.stats;
    this.clock += Math.min(0.1, dt);
    const type = blossomTypeFor(e.type, e.formId);
    const on = season.active && e.amount > 0 && type !== null && ph < CARPET_END;
    if (ph < OPEN0 - BUD || ph > BLOSSOM_END || season.jumped && ph < OPEN0) this.strip = 0;
    if (!on) { if (this.key !== '' || this.pet.visible) this.hide(); this.type = type; return; }
    // Repaint when the type or a colour changed (at most every 0.25 s while a colour is dragged).
    const colour = blossomColourFor(e.type, e.formId, e.colour), pk = `${type.id}|${colour}|${e.accent}`, newType = type !== this.type;
    if (newType) { this.type = type; this.key = ''; }
    const f = type;
    const key = `${sim.topology}|${Math.round(sim.time * 2)}|${sim.nodes.length}|${e.amount}|${f.id}`;
    if (key !== this.key || sim.time < this.simT) { this.key = key; this.rebuild(sim, e); }
    this.simT = sim.time;
    // Not before there is something to draw (a first-year tree never pays for a painting).
    if (pk !== this.paintKey && this.n > 0 && (newType || t0 - this.paintAt > 250)) { this.paintKey = pk; this.paintAt = t0; this.repaint(type, colour, e.accent); }
    if (this.stats.type === '') { this.stats.type = type.id; this.stats.colour = colour; }
    // A storm in bloom strips the tree: the fall dates move forward (up to the whole hold) while it blows.
    if (ph > OPEN0 && ph < BLOSSOM_END && !season.jumped) this.strip = Math.min(HOLD0 + HOLD_SPREAD, this.strip + dt * e.violence * 0.004);
    const strip = this.strip;
    const n = this.n, rec = this.rec, D = e.D, ND = this.node;
    const ck = Math.round(e.night * 20) + Math.floor(t0 / 1000) * 100 + Math.round(strip * 2000) * 7;
    const full = !(Math.abs(ph - this.lastPh) < 0.0005) || season.jumped || ck !== this.colKey;
    this.tick++;
    if (!full) {
      // Between full passes only the translations follow the sway (every second frame on Low).
      if (!e.low || (this.tick & 1)) for (let s = 0; s < STAGES; s++) {
        const c = this.cnt[s]; if (c === 0) continue;
        const M = this.meshes[s].instanceMatrix, a = M.array as Float32Array, ix = this.idx[s];
        for (let j = 0, q = 12; j < c; j++, q += 16) {
          const i = ix[j], o = i * R, d = ND[i] * 3;
          if (d + 2 >= D.length) continue;
          a[q] = rec[o] + D[d]; a[q + 1] = rec[o + 1] + D[d + 1]; a[q + 2] = rec[o + 2] + D[d + 2];
        }
        M.clearUpdateRanges(); M.addUpdateRange(0, c * 16); M.needsUpdate = true;
      }
    } else {
      this.lastPh = ph; this.colKey = ck;
      const glow = f.glow ? 1 + 7 * e.night : 1, dim = 0.66 * (1 - 0.5 * e.night) * glow;
      // Lights as the Lambert shader of the card will see them.
      const S = e.sun, Hm = e.hemi, si = S.intensity, hi = Hm.intensity;
      let lx = S.position.x - S.target.position.x, ly = S.position.y - S.target.position.y, lz = S.position.z - S.target.position.z;
      const ll = Math.hypot(lx, ly, lz) || 1; lx /= ll; ly /= ll; lz /= ll;
      const sr = S.color.r * si, sg = S.color.g * si, sb = S.color.b * si;
      const kr = Hm.color.r * hi, kg = Hm.color.g * hi, kb = Hm.color.b * hi, gr = Hm.groundColor.r * hi, gg = Hm.groundColor.g * hi, gb = Hm.groundColor.b * hi;
      // Wanted light: the hemisphere half-way, pulled 60 % to neutral (a blossom in shade is not sky blue), plus the sun.
      const hl = 0.15 * (kr + gr) + 0.3 * (kg + gg) + 0.05 * (kb + gb);
      const wr = 0.6 * hl + 0.2 * (kr + gr), wg = 0.6 * hl + 0.2 * (kg + gg), wb = 0.6 * hl + 0.2 * (kb + gb);
      const lim = f.glow ? 8 : 6;
      // An up-facing petal (air and carpet).
      const uw = 0.24 + 0.4 * Math.max(0, ly) + 0.14;
      this.up[0] = Math.min(lim, (wr + sr * uw) / (kr + sr * Math.max(0, ly) + 1e-4)) * dim; this.up[1] = Math.min(lim, (wg + sg * uw) / (kg + sg * Math.max(0, ly) + 1e-4)) * dim; this.up[2] = Math.min(lim, (wb + sb * uw) / (kb + sb * Math.max(0, ly) + 1e-4)) * dim;
      const camX = e.cam.x, camY = e.cam.y, camZ = e.cam.z, cnt = this.cnt, stg = this.stg;
      cnt.fill(0);
      let open = 0, nf = 0;
      for (let i = 0, o = 0; i < n; i++, o += R) {
        const tOpen = rec[o + 12], tFall = Math.max(tOpen + OPENING, rec[o + 13] - strip * (0.5 + rec[o + 15])), a0 = tOpen - BUD;
        // Stage and in-stage scale (the continuous part: the stalk lengthens, the bud swells).
        let s = 255, sc = 1, age = 0, wither = 0;
        if (ph > a0 && ph < tFall + SHED + LINGER) {
          if (ph < a0 + 0.3 * BUD) { s = 0; sc = 0.5 + 0.5 * (ph - a0) / (0.3 * BUD); }
          else if (ph < a0 + 0.65 * BUD) { s = 1; sc = 0.3 + 0.7 * (ph - a0 - 0.3 * BUD) / (0.35 * BUD); }
          else if (ph < tOpen) { s = 2; sc = 0.62 + 0.38 * sm(a0 + 0.65 * BUD, tOpen, ph); }
          else if (ph < tOpen + OPENING * 0.5) s = 3;
          else if (ph < tOpen + OPENING) s = 4;
          else if (ph < tFall) { s = 5; age = (ph - tOpen - OPENING) / Math.max(1e-4, tFall - tOpen - OPENING); open++; }
          else if (ph < tFall + SHED * 0.4) { s = 6; age = 1; nf++; }
          else if (ph < tFall + SHED * 0.8) { s = 7; age = 1; nf++; }
          else { s = 8; wither = sm(tFall + SHED + LINGER * 0.4, tFall + SHED + LINGER, ph); sc = 1 - 0.55 * wither; }
        }
        stg[i] = s;
        if (s === 255) continue;
        const j = cnt[s]++, mesh = this.meshes[s], a = mesh.instanceMatrix.array as Float32Array, col = mesh.instanceColor!.array as Float32Array, q = j * 16;
        this.idx[s][j] = i;
        const d = ND[i] * 3, ok = d + 2 < D.length;
        a[q] = rec[o + 3] * sc; a[q + 1] = rec[o + 4] * sc; a[q + 2] = rec[o + 5] * sc; a[q + 3] = 0;
        a[q + 4] = rec[o + 6] * sc; a[q + 5] = rec[o + 7] * sc; a[q + 6] = rec[o + 8] * sc; a[q + 7] = 0;
        a[q + 8] = rec[o + 9] * sc; a[q + 9] = rec[o + 10] * sc; a[q + 10] = rec[o + 11] * sc; a[q + 11] = 0;
        a[q + 12] = rec[o] + (ok ? D[d] : 0); a[q + 13] = rec[o + 1] + (ok ? D[d + 1] : 0); a[q + 14] = rec[o + 2] + (ok ? D[d + 2] : 0); a[q + 15] = 1;
        // Colour: the painted colours, a little paler and warmer with age, brown while the bare stalk withers.
        const g = dim * rec[o + 14];
        const il = 1 / (Math.hypot(rec[o + 9], rec[o + 10], rec[o + 11]) || 1);
        let nx = rec[o + 9] * il, ny = rec[o + 10] * il, nz = rec[o + 11] * il;
        if (nx * (camX - rec[o]) + ny * (camY - rec[o + 1]) + nz * (camZ - rec[o + 2]) < 0) { nx = -nx; ny = -ny; nz = -nz; }
        const ndl = Math.max(0, nx * lx + ny * ly + nz * lz), hw = 0.5 + 0.5 * ny, want = 0.24 + 0.4 * ndl + 0.14 * hw;
        const cr = Math.min(lim, (wr + sr * want) / (gr + (kr - gr) * hw + sr * ndl + 1e-4));
        const cg = Math.min(lim, (wg + sg * want) / (gg + (kg - gg) * hw + sg * ndl + 1e-4));
        const cb = Math.min(lim, (wb + sb * want) / (gb + (kb - gb) * hw + sb * ndl + 1e-4));
        col[j * 3] = g * cr * (1 - 0.03 * age - 0.25 * wither); col[j * 3 + 1] = g * cg * (1 - 0.08 * age - 0.4 * wither); col[j * 3 + 2] = g * cb * (1 - 0.13 * age - 0.55 * wither);
      }
      let drawn = 0;
      for (let s = 0; s < STAGES; s++) {
        const mesh = this.meshes[s], c = cnt[s];
        mesh.count = c; mesh.visible = c > 0; drawn += c;
        if (c === 0) continue;
        const M = mesh.instanceMatrix, C = mesh.instanceColor!;
        M.clearUpdateRanges(); M.addUpdateRange(0, c * 16); M.needsUpdate = true;
        C.clearUpdateRanges(); C.addUpdateRange(0, c * 3); C.needsUpdate = true;
      }
      st.drawn = drawn; st.open = open; st.falling = nf;
      this.carpetPass(e, f, ph);
    }
    this.petalsInAir(e, f, n);
    st.lastMs = performance.now() - t0; st.sumMs += st.lastMs; st.frames++;
    if (st.lastMs > st.maxMs) st.maxMs = st.lastMs;
  }

  /** Size cheat, as the critters have: petals grow with the camera distance (1x up to 7 m, 3.2x from 22 m) so the fall and the carpet read from the framed view. */
  private boost(e: BlossomEnv) { return Math.min(3.2, Math.max(1, Math.hypot(e.cam.x - this.crown[0], e.cam.y - this.crown[3] * 0.5, e.cam.z - this.crown[1]) / 7)); }

  /** The carpet: petals lying under the crown, appearing as the tree sheds and fading over the following weeks. Pure function of the phase. */
  private carpetPass(e: BlossomEnv, f: BlossomType, ph: number) {
    const pet = this.pet, a = pet.instanceMatrix.array as Float32Array, col = pet.instanceColor!.array as Float32Array, A0 = this.air;
    const [cx, cz, Rr] = this.crown, w = e.wind, strip = this.strip;
    const want = f.petals && this.n > 0 ? Math.round(this.carpet * Math.min(1, e.amount * f.amount / 0.7) * Math.min(1, this.n / (this.cap * 0.25))) : 0;
    const F0 = OPEN0 + HOLD0 - strip, F1 = OPEN0 + OPEN_SPREAD + HOLD0 + HOLD_SPREAD + SHED - strip * 0.5;
    let shown = 0;
    for (let i = 0; i < this.carpet; i++) {
      const q = (A0 + i) * 16, h1 = h01(i * 3 + 11), h2 = h01(i * 3 + 12), h3 = h01(i * 3 + 13);
      const born = F0 + (F1 - F0) * (0.15 + 0.85 * h1), gone = born + 0.05 + 0.08 * h2;
      if (i >= want || ph < born || ph > gone + 0.03) { a[q + 15] = 0; a[q] = a[q + 5] = a[q + 10] = 0; a[q + 1] = a[q + 2] = a[q + 4] = a[q + 6] = a[q + 8] = a[q + 9] = 0; continue; }
      shown++;
      // Denser under the drip line than at the trunk, drawn out downwind; lying nearly flat, caught in the grass.
      const r = Rr * 1.25 * Math.sqrt(0.04 + 0.96 * h2) * (0.75 + 0.5 * h3), ang = h1 * 61.7, s = this.boost(e) * (0.05 + 0.035 * h3) * (1 - sm(gone, gone + 0.03, ph)) * (f.kind === 'goblet' ? 1.7 : 1);
      const hd = h3 * 6.283, tl = (h2 - 0.5) * 0.9, ct = Math.cos(tl), sn = Math.sin(tl), ch = Math.cos(hd), sh = Math.sin(hd);
      a[q] = ch * s; a[q + 1] = 0; a[q + 2] = -sh * s; a[q + 3] = 0;
      a[q + 4] = sh * ct * s; a[q + 5] = sn * s; a[q + 6] = ch * ct * s; a[q + 7] = 0;
      a[q + 8] = sh * -sn * s; a[q + 9] = ct * s; a[q + 10] = ch * -sn * s; a[q + 11] = 0;
      a[q + 12] = cx + Math.cos(ang) * r + w.dirX * Rr * 0.3 * h3; a[q + 13] = 0.07 + 0.2 * h3 * h1; a[q + 14] = cz + Math.sin(ang) * r + w.dirZ * Rr * 0.3 * h3; a[q + 15] = 1;
      // Fresh, then tan as it dries.
      const old = sm(born + 0.02, gone, ph), v = 0.82 + 0.3 * h2, o = (A0 + i) * 3;
      col[o] = this.up[0] * v * (1 - 0.18 * old); col[o + 1] = this.up[1] * v * (1 - 0.3 * old); col[o + 2] = this.up[2] * v * (1 - 0.45 * old);
    }
    this.stats.carpet = shown;
    // Colours of the air slots (static per slot, relit with the pass).
    for (let i = 0; i < A0; i++) { const v = 0.85 + 0.3 * h01(i * 7 + 2); col[i * 3] = this.up[0] * v; col[i * 3 + 1] = this.up[1] * v; col[i * 3 + 2] = this.up[2] * v; }
    const M = pet.instanceMatrix, C = pet.instanceColor!;
    M.clearUpdateRanges(); M.addUpdateRange(A0 * 16, this.carpet * 16); M.needsUpdate = true;
    C.clearUpdateRanges(); C.addUpdateRange(0, (A0 + this.carpet) * 3); C.needsUpdate = true;
  }

  /** Petals in the air. Slot j loops on the clock: it leaves a (hashed) shedding cluster, drifts down on the wind, lies, starts again. */
  private petalsInAir(e: BlossomEnv, f: BlossomType, n: number) {
    const pet = this.pet, a = pet.instanceMatrix.array as Float32Array, A0 = this.air, rec = this.rec, stg = this.stg, D = e.D, ND = this.node;
    let live = 0;
    if (f.petals && n > 0) {
      const w = e.wind, cl = this.clock, [cx, cz] = this.crown;
      const g0 = w.base > 1e-3 ? w.gust(cx, cz) / w.base : 0, g3 = g0 * g0 * g0;
      // Open clusters let a few go (more in a gust, many in a storm); shedding clusters always do.
      const trickle = Math.min(1, 0.02 + 0.12 * g3 + 1.6 * e.violence);
      const bst = this.boost(e);
      const drift = Wind.speed(w.base) * (0.16 + 0.5 * e.violence), vx = w.dirX * drift, vz = w.dirZ * drift, big = f.kind === 'goblet' ? 1.7 : 1;
      for (let j = 0, q = 0; j < A0; j++, q += 16) {
        const T = 6 + 5 * h01(j * 5 + 1), x = cl / T + h01(j * 5 + 2), cyc = Math.floor(x), t = (x - cyc) * T;
        const i = Math.floor(h01(j * 131 + cyc * 7919) * n), s = stg[i];
        if (!(s === 6 || s === 7 || (s === 5 && h01(j * 17 + cyc * 31) < trickle))) { if (a[q + 15] !== 0) { for (let k = 0; k < 16; k++) a[q + k] = 0; } continue; }
        live++;
        const o = i * R, d = ND[i] * 3, h1 = h01(j * 5 + 3), h2 = h01(j * 5 + 4);
        const y0 = rec[o + 1] + rec[o + 7] * 0.7, vf = (0.75 + 0.6 * h1) * (1 + 1.5 * e.violence), rest = 0.07 + 0.18 * h2;
        const tl = Math.min(t, Math.max(0, (y0 - rest) / vf)), down = tl < t, fl = down ? 0 : 1;
        const y = y0 - vf * tl;
        // Flutter: a sideways swing that grows after the release, and a tumble; lying flat once down.
        const sw = Math.min(1, tl * 1.5) * 0.28 * fl + 0, pa = tl * (2.2 + 2 * h2) + h1 * 6.283;
        const px = rec[o] + rec[o + 6] * 0.7 + (d + 2 < D.length && tl < 0.3 ? D[d] : 0) + vx * tl + Math.sin(pa) * sw + Math.sin(tl * 0.9 + h2 * 9) * 0.3 * Math.min(1, tl);
        const pz = rec[o + 2] + rec[o + 8] * 0.7 + vz * tl + Math.cos(pa * 0.8) * sw + Math.cos(tl * 0.7 + h1 * 9) * 0.3 * Math.min(1, tl);
        const aa = down ? (h2 - 0.5) * 0.8 + 1.571 : tl * (3 + 4 * h1) + h2 * 6.283, bb = down ? h1 * 6.283 : tl * (1.5 + 2 * h2) + h1 * 6.283;
        const sa = Math.sin(aa), ca = Math.cos(aa), sb = Math.sin(bb), cb = Math.cos(bb);
        // Grows out of nothing in the first 0.25 s, shrinks away before the loop restarts.
        const s0 = (0.05 + 0.035 * h1) * big * bst * Math.min(1, t * 4) * Math.min(1, (T - t) * 2);
        const Yx = sa * cb, Yy = ca, Yz = sa * sb, Xx = -sb, Xz = cb;
        a[q] = Xx * s0; a[q + 1] = 0; a[q + 2] = Xz * s0; a[q + 3] = 0;
        a[q + 4] = Yx * s0; a[q + 5] = Yy * s0; a[q + 6] = Yz * s0; a[q + 7] = 0;
        a[q + 8] = -Xz * Yy * s0; a[q + 9] = (Xz * Yx - Xx * Yz) * s0; a[q + 10] = Xx * Yy * s0; a[q + 11] = 0;
        a[q + 12] = px; a[q + 13] = y; a[q + 14] = pz; a[q + 15] = 1;
      }
      const M = pet.instanceMatrix;
      M.addUpdateRange(0, A0 * 16); M.needsUpdate = true;
    }
    this.stats.petals = live;
    pet.count = this.air + this.carpet;
    pet.visible = live > 0 || this.stats.carpet > 0;
  }
}

import type { ArborParams } from '../params';
import { Rng } from './rng';

/**
 * Crown envelope: radial extent (fraction of crown radius) at normalized
 * height h in [0,1] from crown base to crown top. `shape` blends
 * 0 ellipsoid -> 1 cone -> 2 vase/umbrella.
 */
export function envelopeProfile(shape: number, h: number): number {
  const ell = Math.sqrt(Math.max(0, 1 - (2 * h - 1) * (2 * h - 1)));
  const cone = Math.max(0, 1 - h) * Math.min(1, h * 8);
  const vase = Math.pow(Math.max(0, h), 0.6) * Math.sqrt(Math.max(0, 1 - Math.pow(h, 6)));
  if (shape <= 1) return ell + (cone - ell) * Math.max(0, shape);
  return cone + (vase - cone) * Math.min(1, shape - 1);
}

/** Effective envelope dimensions; low gravity stretches the crown upward. */
export function envelopeDims(p: ArborParams) {
  const g = Math.max(0.02, p.growth.gravity);
  const stretch = 1 + 0.7 * Math.max(0, 1 - g);
  return { radius: p.crown.radius, height: p.crown.height * stretch, base: p.crown.base * stretch };
}

/** Rejection-sample attractor points inside the envelope. */
export function sampleAttractors(p: ArborParams, seed: number): Float32Array {
  const rng = new Rng(seed ^ 0x9e3779b9);
  const { radius, height, base } = envelopeDims(p);
  const n = Math.max(10, Math.floor(p.crown.attractors));
  const out = new Float32Array(n * 3);
  let i = 0;
  let guard = 0;
  while (i < n && guard++ < n * 50) {
    const x = rng.range(-1, 1);
    const z = rng.range(-1, 1);
    const h = rng.next();
    const rr = Math.sqrt(x * x + z * z);
    if (rr > envelopeProfile(p.crown.shape, h)) continue;
    out[i * 3] = x * radius;
    out[i * 3 + 1] = base + h * height;
    out[i * 3 + 2] = z * radius;
    i++;
  }
  return out.subarray(0, i * 3);
}

/**
 * Growth over years (big tree P11, `TreeSim.years` > 0, `?years=3`). The growth clock runs on sim time alone:
 * age = time / yearLength + YEAR_DATE0 (the default season date, so the growth year turns at the season's bud break;
 * year 2 starts at t = 264 with yearLength 300). Scrubbing the season date does not move it (wood cannot be ungrown).
 */
export const YEAR_DATE0 = 0.12;
/**
 * Final envelope scale after the last growing year (majestic-oak pass): crown height x1.7 over a crown base lifted x1.6
 * (the low limbs are shed, G4), radius x2.3: a crown broader than tall on a short, clean bole.
 */
export const YEAR_H = 1.7, YEAR_R = 2.3, YEAR_B = 1.6;
/** Lobes of the year shells: radial reach and attractor density vary with azimuth (domes and bays, a few long limbs). */
export const YEAR_LOBE = 0.22, YEAR_BAY = 0.6;
/** Share of the total extra size gained in year 2 (section 5 table: 54 %); the rest comes in year 3. */
const YEAR2_SHARE = 0.54;
/** Attractor density of the new shells relative to the year-1 crown (coarser twig structure, bounded node count). */
export const YEAR_DENSITY = 0.17;

/** Envelope scale (height, radius) of growth year `yi` (0 = first year = today's crown). */
export function yearScale(yi: number, years: number): { h: number; r: number; b: number } {
  if (yi <= 0 || years <= 1) return { h: 1, r: 1, b: 1 };
  const f = yi >= years - 1 ? 1 : years === 3 ? YEAR2_SHARE : yi / (years - 1);
  return { h: 1 + (YEAR_H - 1) * f, r: 1 + (YEAR_R - 1) * f, b: 1 + (YEAR_B - 1) * f };
}

/** Effective envelope of growth year `yi` (crown base lifts, height and radius scale). */
export function envelopeDimsYear(p: ArborParams, yi: number, years: number) {
  const e = envelopeDims(p), s = yearScale(yi, years);
  return { radius: e.radius * s.r, height: e.height * s.h, base: e.base * s.b };
}

/** Lobe function of the year shells, 0..1 over azimuth `a` and normalized height `h` (two harmonics, phases per seed). */
export function yearLobe(seed: number, a: number, h: number): number {
  const p1 = ((seed * 0.6180339887) % 1) * 6.2832, p2 = ((seed * 0.4142135623) % 1) * 6.2832;
  const v = 0.6 * Math.cos(3 * a + p1 + 1.2 * h) + 0.4 * Math.cos(5 * a + p2 - 2 * h);
  return 0.5 + 0.5 * v;
}

/**
 * Attractors in the shell between the envelope of year `yi - 1` and year `yi` (T9), at YEAR_DENSITY x the year-1
 * density. Own rng stream per year (seed ^ year), the sim rng is not consumed.
 */
export function sampleShell(p: ArborParams, seed: number, yi: number, years: number): Float32Array {
  const rng = new Rng((seed ^ 0x51ed27) + yi * 7919);
  const a = envelopeDimsYear(p, yi - 1, years), b = envelopeDimsYear(p, yi, years);
  const vol = (e: { radius: number; height: number }) => e.radius * e.radius * e.height;
  const n = Math.max(0, Math.floor(p.crown.attractors * YEAR_DENSITY * (vol(b) - vol(a)) / vol(envelopeDims(p))));
  const out = new Float32Array(n * 3);
  const sh = p.crown.shape;
  let i = 0, guard = 0;
  while (i < n && guard++ < n * 120) {
    const x = rng.range(-1.25, 1.25), z = rng.range(-1.25, 1.25), h = rng.next();
    const rr = Math.sqrt(x * x + z * z);
    // Lobed crown: reach x (1 - YEAR_LOBE .. 1 + YEAR_LOBE) by azimuth, and bays thinned (density down to 1 - YEAR_BAY).
    const lb = yearLobe(seed, Math.atan2(z, x), h);
    if (rr > envelopeProfile(sh, h) * (1 + YEAR_LOBE * (2 * lb - 1)) || rng.next() > 1 - YEAR_BAY * (1 - lb)) continue;
    const px = x * b.radius, py = b.base + h * b.height, pz = z * b.radius;
    // Inside last year's envelope: already colonised.
    const ha = (py - a.base) / a.height;
    if (ha >= 0 && ha <= 1 && Math.hypot(px, pz) <= envelopeProfile(sh, ha) * a.radius) continue;
    out[i * 3] = px; out[i * 3 + 1] = py; out[i * 3 + 2] = pz;
    i++;
  }
  return out.subarray(0, i * 3);
}

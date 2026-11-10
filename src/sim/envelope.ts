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

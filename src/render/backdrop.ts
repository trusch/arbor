import * as THREE from 'three';

/**
 * Backdrop geometry: rolling terrain beyond the flat meadow and middle/far-distance vegetation (lone trees, hedgerows,
 * woods on the ridges). Geometry only (PowerVR rule): the terrain is drawn with the live ground material, the vegetation
 * 
 * by the meadow as alpha-cut crossed cards on clones of its tuft material (see Meadow), so no
 * shader program is added on any path. Lighting, night, storm and aerial perspective come from the scene lights and
 * the scene fog like everything else; nothing here has per-frame state.
 */

/** The ground is exactly y = 0 inside this radius (tree, tufts, canopy decal, falling leaves and debris assume it). */
export const R_FLAT = 66;
const R_OUT = 2600;

const smooth = (a: number, b: number, v: number) => { const t = Math.min(1, Math.max(0, (v - a) / (b - a))); return t * t * (3 - 2 * t); };
function hash(ix: number, iz: number) {
  let h = (Math.imul(ix, 374761393) + Math.imul(iz, 668265263)) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}
function vnoise(x: number, z: number) {
  const ix = Math.floor(x), iz = Math.floor(z), fx = x - ix, fz = z - iz;
  const ux = fx * fx * (3 - 2 * fx), uz = fz * fz * (3 - 2 * fz);
  const a = hash(ix, iz), b = hash(ix + 1, iz), c = hash(ix, iz + 1), d = hash(ix + 1, iz + 1);
  return a + (b - a) * ux + (c - a) * uz + (a - b - c + d) * ux * uz;
}
function fbm(x: number, z: number, oct: number) {
  let s = 0, a = 0.5, n = 0;
  for (let i = 0; i < oct; i++) { s += a * vnoise(x, z); n += a; a *= 0.5; x = x * 2.03 + 11.7; z = z * 2.03 - 5.3; }
  return s / n;
}

/** Ground height at a world point: 0 within R_FLAT, gentle rolls from there, ridges from about 150 m. */
export function terrainHeight(x: number, z: number) {
  const r = Math.hypot(x, z);
  if (r <= R_FLAT) return 0;
  const roll = (fbm(x / 150 + 7.3, z / 150 - 2.1, 3) - 0.5) * 2;
  const rid = 1 - Math.abs(fbm(x / 460 + 1.7, z / 460 + 9.2, 4) - 0.5) * 2;
  const k1 = smooth(R_FLAT, 210, r), k2 = smooth(130, 560, r);
  return k1 * roll * 8 * (1 + r / 500) + k2 * rid * rid * 78 + k1 * 1.5;
}

/** Polar grid: 2 flat rings, then rings growing 4.5 % each to R_OUT. position / normal / uv like the old disc. */
export function makeTerrainGeometry(): THREE.BufferGeometry {
  const SEG = 256, radii = [R_FLAT * 0.5, R_FLAT];
  for (let r = R_FLAT * 1.045; r < R_OUT; r *= 1.045) radii.push(r);
  const P: number[] = [0, 0, 0], U: number[] = [0, 0], I: number[] = [];
  radii.forEach((r, k) => {
    for (let s = 0; s < SEG; s++) {
      const a = ((s + (k & 1) * 0.5) / SEG) * Math.PI * 2, x = Math.cos(a) * r, z = Math.sin(a) * r;
      P.push(x, terrainHeight(x, z), z); U.push(x * 0.01, z * 0.01);
    }
  });
  const v = (k: number, s: number) => 1 + k * SEG + (s % SEG);
  for (let s = 0; s < SEG; s++) I.push(0, v(0, s + 1), v(0, s));
  for (let k = 0; k + 1 < radii.length; k++)
    for (let s = 0; s < SEG; s++) {
      // Odd rings are offset by half a segment: pick the diagonal that keeps the triangles near-equilateral.
      if (k & 1) I.push(v(k, s), v(k + 1, s + 1), v(k + 1, s), v(k, s), v(k, s + 1), v(k + 1, s + 1));
      else I.push(v(k, s), v(k, s + 1), v(k + 1, s), v(k, s + 1), v(k + 1, s + 1), v(k + 1, s));
    }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(P, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(U, 2));
  g.setIndex(I);
  g.computeVertexNormals();
  return g;
}

export interface Plant { x: number; y: number; z: number; h: number; w: number; bush: boolean; hash: number }

/**
 * Middle- and far-distance vegetation placement: lone trees and bushes from R_FLAT + 20 m, hedgerows that follow the
 * ground, and woods in noise-masked patches on the slopes (closed canopy, coarser and larger with distance, out to
 * 1000 m where the haze has taken nearly everything). The meadow draws them as alpha-cut crossed cards.
 */
export function plantScenery(): Plant[] {
  const out: Plant[] = [];
  const add = (x: number, z: number, h: number, w: number, bush: boolean, seed: number) =>
    out.push({ x, y: terrainHeight(x, z), z, h, w, bush, hash: hash(Math.floor(seed * 7) + 3, 59) });
  for (let i = 0; i < 30; i++) {
    const a = hash(i, 101) * 6.283, r = R_FLAT + 24 + 230 * Math.pow(hash(i, 202), 1.3);
    const bush = hash(i, 303) < 0.35, h = bush ? 1.8 + 2.2 * hash(i, 404) : 7 + 8 * hash(i, 404);
    add(Math.cos(a) * r, Math.sin(a) * r, h, bush ? h * 1.5 : h * 0.85, bush, i + 1);
  }
  for (let k = 0; k < 5; k++) {
    const a = hash(k, 11) * 6.283, r = 100 + 55 * k + 30 * hash(k, 12);
    let x = Math.cos(a) * r, z = Math.sin(a) * r, dir = a + Math.PI / 2 + (hash(k, 13) - 0.5) * 0.9;
    const n = 60 + Math.floor(50 * hash(k, 14));
    for (let i = 0; i < n; i++) {
      dir += (vnoise(i * 0.13 + k * 9, k) - 0.5) * 0.12;
      x += Math.cos(dir) * 2.6; z += Math.sin(dir) * 2.6;
      if (Math.hypot(x, z) < R_FLAT + 20 || hash(i, k + 40) < 0.1) continue;
      const tall = hash(i, k + 50) < 0.09, h = tall ? 7 + 6 * hash(i, k + 60) : 2.2 + 1.6 * hash(i, k + 60);
      add(x, z, h, tall ? h * 0.85 : h * 1.7, !tall, k * 100 + i);
    }
  }
  for (const [STEP, r0, r1, size] of [[10, 170, 460, 1], [19, 460, 1000, 1.7]]) {
    for (let gx = -r1; gx <= r1; gx += STEP)
      for (let gz = -r1; gz <= r1; gz += STEP) {
        const ix = Math.round(gx / STEP), iz = Math.round(gz / STEP);
        const x = gx + (hash(ix, iz) - 0.5) * STEP, z = gz + (hash(iz + 77, ix) - 0.5) * STEP, r = Math.hypot(x, z);
        if (r < r0 || r >= r1) continue;
        const mask = fbm(x / 230 + 4.4, z / 230 + 8.8, 3) + 0.08 * smooth(300, 700, r);
        if (mask < 0.57 + 0.04 * hash(ix + 5, iz)) continue;
        const h = (9 + 8 * hash(ix, iz + 9)) * (0.8 + 0.2 * size);
        add(x, z, h, h * 0.95 * size, false, ix * 31 + iz);
      }
  }
  return out;
}

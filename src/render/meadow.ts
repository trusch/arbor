import * as THREE from 'three';
import type { TreeSim } from '../sim/tree';
import { Rng } from '../sim/rng';
import { wind } from '../wind';
import { cleanLeafTexture } from './leaves';
import { makeTuftTexture, makeFlowerTexture, type FlowerKind } from './textures';

/**
 * Living meadow (audit WP3): grass tufts and wildflowers around the tree, rippling in travelling gusts.
 *
 * PowerVR rule (audit 3.1): every mesh here is a P-LEAF object. Its material is a clone of the live safe leaf material
 * with only `map` swapped, the geometry has position/normal/uv only, the mesh is an InstancedMesh with instanceColor,
 * castShadow = receiveShadow = false. So the phone compiles no new program (smoke asserts the program count).
 * Motion is CPU-only and uploads nothing: tufts are sorted into PHASES meshes by their distance along the wind, and each
 * mesh's object matrix is a shear (x += kx·y, z += kz·y) from `wind.gust` at its phase, which bends tips and keeps roots.
 * Lighting comes from the Lambert shader with up normals (same as the ground); the instance colour carries the tint
 * variation and the canopy shade (march through the sim light grid toward the sun), rebaked a few patches per frame.
 */
const PHASES = 24; // 8 bands x 3 interleaved groups along the wind
const R_DISC = 14, R_FAR = 26;
/** Shade field resolution and half extent (m); ms of bake work per frame. */
const SG = 112, SE = R_FAR + 1, FRAME_BUDGET_MS = 1;
const GRASS_MAX = 26000, FLOWER_MAX = 800;
const KINDS: FlowerKind[] = ['daisy', 'buttercup', 'poppy', 'clover'];
/** Floats per instance: x, z, rot, width, height, hashA, hashB, r. */
const STRIDE = 8;

export interface MeadowLight {
  /** Toward the key light, world space, normalised. */
  sunDir: THREE.Vector3;
  /** Key colour x intensity and hemisphere sky colour x intensity (linear). */
  sunCol: THREE.Color;
  hemi: THREE.Color;
  night: number;
  /** Ground tint (params.sky.groundHue / groundTint). */
  tintHue: number;
  tint: number;
  /** Fraction of the full instance set to draw (Low 0.3, High 1; halved when the pixel ratio stepped down). */
  frac: number;
}

interface Patch {
  mesh: THREE.InstancedMesh;
  data: Float32Array;
  n: number;
  flower: boolean;
  /** Phase slot whose shear this patch uses. */
  phase: number;
}

/** 3 crossed cards, each with a reversed-winding back copy (FrontSide shows both faces); normals straight up. 12 tris. */
function crossCardGeometry(): THREE.BufferGeometry {
  const P: number[] = [], N: number[] = [], U: number[] = [];
  for (let k = 0; k < 3; k++) {
    const a = (k / 3) * Math.PI, cx = Math.cos(a) * 0.5, cz = Math.sin(a) * 0.5;
    const v = [[-cx, 0, -cz, 0, 0], [cx, 0, cz, 1, 0], [cx, 1, cz, 1, 1], [-cx, 1, -cz, 0, 1]];
    for (const idx of [[0, 1, 2], [0, 2, 3], [0, 2, 1], [0, 3, 2]]) for (const i of idx) {
      P.push(v[i][0], v[i][1], v[i][2]); N.push(0, 1, 0); U.push(v[i][3], v[i][4]);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(P, 3));
  g.setAttribute('normal', new THREE.Float32BufferAttribute(N, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(U, 2));
  return g;
}

const hash2 = (x: number, z: number) => { const s = Math.sin(x * 127.1 + z * 311.7) * 43758.5453; return s - Math.floor(s); };
/** Smooth value noise 0..1. */
function vnoise(x: number, z: number) {
  const ix = Math.floor(x), iz = Math.floor(z), fx = x - ix, fz = z - iz;
  const ux = fx * fx * (3 - 2 * fx), uz = fz * fz * (3 - 2 * fz);
  const a = hash2(ix, iz), b = hash2(ix + 1, iz), c = hash2(ix, iz + 1), d = hash2(ix + 1, iz + 1);
  return a + (b - a) * ux + (c - a) * uz + (a - b - c + d) * ux * uz;
}
const smooth = (a: number, b: number, v: number) => { const t = Math.min(1, Math.max(0, (v - a) / (b - a))); return t * t * (3 - 2 * t); };

export class Meadow {
  /** Add this to the scene (a group, so code that sweeps the scene's direct InstancedMesh children leaves it alone). */
  readonly group = new THREE.Group();
  private patches: Patch[] = [];
  private kx = new Float32Array(PHASES);
  private kz = new Float32Array(PHASES);
  private phaseD = new Float32Array(PHASES);
  private dirty: number[] = [];
  private key = '';
  private lightKeyT = -1e9;
  private lightVersion = -1;
  private L: MeadowLight | null = null;
  /** Shade field: transmission straight up and toward the sun on a SG² grid over ±SE m, blurred; tufts sample it bilinearly. */
  private shUp = new Float32Array(SG * SG).fill(1);
  private shSun = new Float32Array(SG * SG).fill(1);
  private bkUp = new Float32Array(SG * SG);
  private bkSun = new Float32Array(SG * SG);
  private shTmp = new Float32Array(SG * SG);
  private shKey = '';
  /** Row being filled in the back buffers; -1 = idle. The sun direction of the fill in flight is in fillSun. */
  private fillRow = -1;
  private fillSun = [0, 1, 0];
  private col = new THREE.Color();
  private tintCol = new THREE.Color();
  /** Drawn instance counts (for reports and tests). */
  counts = { grass: 0, flowers: 0, meshes: 0 };
  /** Bake timings (ms): last patch, max patch, patches baked. */
  stats = { lastMs: 0, maxMs: 0, bakes: 0 };

  /** `leafMaterial`: the live leaf material. When it is the safe Lambert/basic one it is cloned (same program). */
  constructor(leafMaterial: THREE.Material, seed = 7) {
    const safe = (leafMaterial as THREE.MeshLambertMaterial).isMeshLambertMaterial || (leafMaterial as THREE.MeshBasicMaterial).isMeshBasicMaterial;
    const material = (map: THREE.Texture) => {
      const tex = cleanLeafTexture(map);
      let m: THREE.MeshLambertMaterial;
      if (safe) m = leafMaterial.clone() as THREE.MeshLambertMaterial;
      // Full leaf path (desktop): no live safe material exists, so build the same configuration (safe leaf V0).
      else m = new THREE.MeshLambertMaterial({ side: THREE.FrontSide, map: tex, alphaTest: 0.5 });
      m.map = tex;
      // GTAO g-buffer material with the alpha cut-out (High only; never compiled on Low). See Post.
      const gb = new THREE.MeshNormalMaterial({ side: THREE.FrontSide, blending: THREE.NoBlending });
      gb.allowOverride = false;
      gb.onBeforeCompile = (sh) => {
        sh.uniforms.cutMap = { value: tex };
        sh.vertexShader = sh.vertexShader
          .replace('#include <common>', '#include <common>\nvarying vec2 vCutUv;')
          .replace('#include <begin_vertex>', '#include <begin_vertex>\nvCutUv = uv;');
        sh.fragmentShader = sh.fragmentShader
          .replace('void main() {', 'uniform sampler2D cutMap;\nvarying vec2 vCutUv;\nvoid main() {')
          .replace('#include <clipping_planes_fragment>', '#include <clipping_planes_fragment>\nif (texture2D(cutMap, vCutUv).a < 0.5) discard;');
      };
      return { m, gb };
    };
    const geo = crossCardGeometry();
    const rng = new Rng(seed);
    const half = R_DISC + 1, slot = (2 * half) / PHASES;
    for (let p = 0; p < PHASES; p++) this.phaseD[p] = -half + (p + 0.5) * slot;
    const phaseOf = (x: number, z: number) => Math.min(PHASES - 1, Math.max(0, Math.floor((wind.along(x, z) + half + rng.range(-0.5, 0.5)) / slot)));
    const lists: number[][] = [];
    const push = (li: number, x: number, z: number, w: number, h: number) => {
      (lists[li] ??= []).push(x, z, rng.next() * Math.PI, w, h, rng.next(), rng.next(), Math.hypot(x, z));
    };

    // Grass: 30 % in a core that thickens toward the tree (density exp(-r / 6)), 70 % spread evenly over the whole disc so
    // the foreground of a portrait frame is as covered as the middle; both thin out between R_DISC and R_FAR.
    for (let i = 0; i < GRASS_MAX; i++) {
      let r: number;
      if (rng.next() < 0.3) do r = -6 * Math.log(Math.max(1e-9, rng.next() * rng.next())); while (r > R_FAR);
      else do r = R_FAR * Math.sqrt(rng.next()); while (rng.next() > 1 - 0.9 * smooth(R_DISC + 2, R_FAR, r));
      const a = rng.next() * Math.PI * 2, x = Math.cos(a) * r, z = Math.sin(a) * r;
      const tall = rng.next() < 0.16;
      // Far tufts are larger so coverage holds where the density drops.
      // Past the disc they shrink away again, so the meadow has no edge: it thins and sinks into the ground texture.
      const edge = 1 - 0.65 * smooth(R_DISC + 4, R_FAR + 1, r);
      const far = (1 + Math.min(r, R_DISC) / 11) * edge;
      const w = rng.range(0.26, 0.5) * far, h = (tall ? rng.range(0.34, 0.5) : rng.range(0.13, 0.3)) * (1 + r / 22) * edge;
      const ph = r > R_DISC ? Math.floor(rng.next() * PHASES) : phaseOf(x, z);
      push(ph, x, z, w, h);
    }
    // Flowers: clusters; 2 patches per species, split by gust phase so each follows a nearby grass patch.
    KINDS.forEach((_, s) => {
      let left = Math.round(FLOWER_MAX * [1, 1, 0.45, 0.8][s]); // poppies are the rare accent
      while (left > 0) {
        const cr = 1.6 + 11 * Math.sqrt(rng.next()), ca = rng.next() * Math.PI * 2;
        const cxp = Math.cos(ca) * cr, czp = Math.sin(ca) * cr, spread = rng.range(0.35, 1.3);
        const n = Math.min(left, 5 + Math.floor(rng.next() * rng.next() * 40));
        for (let i = 0; i < n; i++) {
          const x = cxp + (rng.next() + rng.next() - 1) * spread * 1.4, z = czp + (rng.next() + rng.next() - 1) * spread * 1.4;
          const h = rng.range(0.2, 0.38) * (s === 3 ? 0.7 : 1) * (1 + Math.hypot(x, z) / 28);
          push(PHASES + s * 2 + (phaseOf(x, z) % 6 < 3 ? 0 : 1), x, z, h * 0.8, h);
        }
        left -= n;
      }
    });
    const tuft = [material(makeTuftTexture(5)), material(makeTuftTexture(9))];
    const flowerMat = KINDS.map((k) => material(makeFlowerTexture(k)));
    for (let li = 0; li < PHASES + KINDS.length * 2; li++) {
      const data = new Float32Array(lists[li] ?? []);
      const n = data.length / STRIDE;
      const flower = li >= PHASES;
      const mm = flower ? flowerMat[(li - PHASES) >> 1] : tuft[li % 2];
      const mesh = new THREE.InstancedMesh(geo, mm.m, Math.max(1, n));
      mesh.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(Math.max(1, n) * 3), 3);
      mesh.castShadow = false;
      mesh.receiveShadow = false;
      mesh.frustumCulled = false;
      mesh.matrixAutoUpdate = false;
      mesh.userData.gbufferMaterial = mm.gb;
      mesh.count = 0;
      this.group.add(mesh);
      // Flower patches copy the shear of a mid-field grass phase with the same fast-ripple phase.
      this.patches.push({ mesh, data, n, flower, phase: flower ? ((li - PHASES) % 2 ? 16 : 13) : li });
    }
    this.counts.meshes = this.patches.length;
  }

  /** Per frame: shear every patch from the wind (no buffer uploads), then rebake a couple of patches if lighting changed. */
  frame(sim: TreeSim, L: MeadowLight, time: number) {
    const amp = 0.95;
    for (let p = 0; p < PHASES; p++) {
      const d = this.phaseD[p];
      const g = wind.gustAlong(d);
      // Flutter: small faster wobble along and across the wind, scaled by strength, different per phase.
      const fl = wind.base * 0.1;
      const along = g * amp + fl * Math.sin(wind.t * 3.1 + p * 2.4);
      const across = fl * 0.8 * Math.sin(wind.t * 2.3 + p * 1.7);
      this.kx[p] = wind.dirX * along - wind.dirZ * across;
      this.kz[p] = wind.dirZ * along + wind.dirX * across;
    }
    for (const pt of this.patches) {
      const e = pt.mesh.matrix.elements;
      e[4] = this.kx[pt.phase]; e[6] = this.kz[pt.phase];
      pt.mesh.matrixWorldNeedsUpdate = true;
    }
    // Rebake triggers: sun direction/brightness, night, tint, trunk radius, draw fraction; light grid at most every 3 s.
    if (sim.lightVersion !== this.lightVersion && time - this.lightKeyT > 3) { this.lightVersion = sim.lightVersion; this.lightKeyT = time; }
    const s = L.sunDir, lum = (c: THREE.Color) => (c.r + c.g + c.b).toFixed(1);
    const shKey = `${s.x.toFixed(2)},${s.y.toFixed(2)},${s.z.toFixed(2)}|${this.lightVersion}`;
    const key = `${lum(L.sunCol)}|${lum(L.hemi)}|${L.night.toFixed(1)}|${L.tint.toFixed(2)},${L.tintHue.toFixed(2)}|${L.frac}|${(sim.nodes[0]?.radius ?? 0).toFixed(2)}`;
    this.L = L;
    if (shKey !== this.shKey && this.fillRow < 0) {
      this.shKey = shKey;
      this.fillRow = 0;
      this.fillSun = [s.x, Math.max(0.08, s.y), s.z];
    }
    if (key !== this.key) {
      this.key = key;
      this.dirty = this.patches.map((_, i) => i);
    }
    // Time-sliced: shade field rows first (patches wait for it, so a tuft is never baked twice for one change), then
    // patches, both inside one small budget per frame.
    const t0 = performance.now();
    if (this.fillRow >= 0) this.fillShade(sim, t0 + FRAME_BUDGET_MS);
    else while (this.dirty.length) { this.bake(sim, this.dirty.shift()!); if (performance.now() - t0 > FRAME_BUDGET_MS) break; }
  }

  /** Bake every pending patch now (screenshots, fastForward). */
  bakeAll(sim: TreeSim) {
    if (this.fillRow >= 0) this.fillShade(sim, Infinity);
    while (this.dirty.length) this.bake(sim, this.dirty.shift()!);
  }

  /** March rows of the shade field into the back buffers until `deadline`; the last row blurs into the live field and dirties every patch. */
  private fillShade(sim: TreeSim, deadline: number) {
    const [sx, sy, sz] = this.fillSun, cell = (2 * SE) / SG;
    while (this.fillRow < SG) {
      const z = -SE + (this.fillRow + 0.5) * cell, o = this.fillRow * SG;
      for (let i = 0; i < SG; i++) {
        const x = -SE + (i + 0.5) * cell;
        this.bkUp[o + i] = this.transmit(sim, x, z, 0, 1, 0);
        this.bkSun[o + i] = this.transmit(sim, x, z, sx, sy, sz);
      }
      this.fillRow++;
      if (performance.now() > deadline) return;
    }
    // Binomial 1-4-6-4-1 blur per axis: the voxel steps of the light grid become a gradient about 1 m wide.
    const T = this.shTmp, cl = (v: number) => Math.min(SG - 1, Math.max(0, v));
    for (const [src, dst] of [[this.bkUp, this.shUp], [this.bkSun, this.shSun]]) {
      for (let zr = 0; zr < SG; zr++) for (let i = 0; i < SG; i++) {
        const o = zr * SG;
        T[o + i] = (src[o + cl(i - 2)] + src[o + cl(i + 2)] + 4 * (src[o + cl(i - 1)] + src[o + cl(i + 1)]) + 6 * src[o + i]) / 16;
      }
      for (let zr = 0; zr < SG; zr++) for (let i = 0; i < SG; i++) {
        dst[zr * SG + i] = (T[cl(zr - 2) * SG + i] + T[cl(zr + 2) * SG + i] + 4 * (T[cl(zr - 1) * SG + i] + T[cl(zr + 1) * SG + i]) + 6 * T[zr * SG + i]) / 16;
      }
    }
    this.fillRow = -1;
    this.dirty = this.patches.map((_, i) => i);
  }

  /** Bilinear sample of a shade field at a ground point. */
  private shade(F: Float32Array, x: number, z: number): number {
    const k = SG / (2 * SE);
    const fx = Math.min(SG - 1.001, Math.max(0, (x + SE) * k - 0.5)), fz = Math.min(SG - 1.001, Math.max(0, (z + SE) * k - 0.5));
    const ix = fx | 0, iz = fz | 0, ax = fx - ix, az = fz - iz, o = iz * SG + ix;
    const a = F[o] + (F[o + 1] - F[o]) * ax, b = F[o + SG] + (F[o + SG + 1] - F[o + SG]) * ax;
    return a + (b - a) * az;
  }

  /** exp(-k x leaf density) from a ground point toward (dx, dy, dz) through the sim light grid. */
  private transmit(sim: TreeSim, x: number, z: number, dx: number, dy: number, dz: number): number {
    const G = sim.lightGrid;
    if (!G) return 1;
    const { dens, nx, ny, nz, cell } = G;
    let px = (x - G.ox) / cell, py = (0.05 - G.oy) / cell, pz = (z - G.oz) / cell;
    // Jump to the grid box (slab test), then march one cell per step.
    let t0 = 0, t1 = 1e9;
    const slab = (p: number, d: number, n: number) => {
      if (Math.abs(d) < 1e-6) { if (p < 0 || p >= n) t1 = -1; return; }
      const a = -p / d, b = (n - p) / d;
      t0 = Math.max(t0, Math.min(a, b)); t1 = Math.min(t1, Math.max(a, b));
    };
    slab(px, dx, nx); slab(py, dy, ny); slab(pz, dz, nz);
    if (t1 <= t0) return 1;
    px += dx * (t0 + 0.01); py += dy * (t0 + 0.01); pz += dz * (t0 + 0.01);
    let acc = 0;
    for (let i = 0; i < 96; i++) {
      const ix = Math.floor(px), iy = Math.floor(py), iz = Math.floor(pz);
      if (ix < 0 || iy < 0 || iz < 0 || ix >= nx || iy >= ny || iz >= nz) break;
      acc += dens[(iy * nz + iz) * nx + ix];
      px += dx; py += dy; pz += dz;
    }
    return Math.exp(-0.05 * acc);
  }

  private bake(sim: TreeSim, pi: number) {
    const L = this.L;
    if (!L) return;
    const t0 = performance.now();
    const pt = this.patches[pi], { data, mesh } = pt;
    const n = Math.min(pt.n, Math.ceil(pt.n * L.frac));
    const M = mesh.instanceMatrix.array as Float32Array, C = mesh.instanceColor!.array as Float32Array;
    const n0 = sim.nodes[0], tx = n0?.wx ?? 0, tz = n0?.wz ?? 0, tR = Math.max(0.03, n0?.radius ?? 0.05);
    const sun = L.sunCol, hemi = L.hemi, ly = Math.max(0, L.sunDir.y);
    const tc = this.tintCol.setHSL(L.tintHue, 0.55, 0.4);
    const open = 1 - L.night; // flowers close at night
    for (let i = 0; i < n; i++) {
      const o = i * STRIDE, x = data[o], z = data[o + 1], rot = data[o + 2], hA = data[o + 5], hB = data[o + 6];
      let w = data[o + 3], h = data[o + 4];
      const rt = Math.hypot(x - tx, z - tz);
      // Crown shade: straight up decides how the plant grows, toward the sun decides how it is lit right now.
      // Both come from the blurred shade field, so neighbouring tufts get neighbouring values (a gradient, not squares).
      const up = this.shade(this.shUp, x, z);
      const ts = (0.38 + 0.34 * L.night) + (0.62 - 0.34 * L.night) * this.shade(this.shSun, x, z); // floor: the decal shadow is not black either
      let show = rt > tR * 1.3 + 0.02;
      if (pt.flower) {
        if (up < 0.55 + 0.3 * hA || rt < tR * 3 + 0.5) show = false; // no flowers in deep shade or against the trunk
        h *= 1 - 0.2 * L.night;
      } else {
        // Shorter and sparser under the crown; the ring right at the trunk stays, it hides the trunk/ground line.
        const near = rt < tR * 2.2 + 0.25;
        if (!near && hA > 0.4 + 0.6 * up) show = false;
        h *= near ? 0.8 + 0.5 * hB : 0.55 + 0.45 * up;
        if (near) w *= 0.75;
      }
      const c = Math.cos(rot), s = Math.sin(rot), q = i * 16;
      if (!show) w = h = 0;
      M[q] = c * w; M[q + 1] = 0; M[q + 2] = -s * w; M[q + 3] = 0;
      M[q + 4] = (hB - 0.5) * 0.3 * h; M[q + 5] = h; M[q + 6] = (hA - 0.5) * 0.3 * h; M[q + 7] = 0; // slight static lean per tuft
      M[q + 8] = s * w; M[q + 9] = 0; M[q + 10] = c * w; M[q + 11] = 0;
      M[q + 12] = x; M[q + 13] = -0.03 * h; M[q + 14] = z; M[q + 15] = 1;
      // Colour: tint variation (macro drifts of lush / dry, per-tuft jitter) x shade.
      const col = this.col;
      if (pt.flower) col.setRGB(1, 0.94, 1.1).multiplyScalar((0.62 + 0.16 * hB) * (0.6 + 0.4 * open));
      else {
        const macro = vnoise(x * 0.23 + 3.1, z * 0.23 - 1.7), fine = vnoise(x * 1.3, z * 1.3);
        // Toward the rim the tufts stand alone on the ground texture: less straw and a little darker there, so they read as grass, not clumps.
        const rim = smooth(9, 22, data[o + 7]);
        const dry = smooth(0.5, 0.8, macro * 0.7 + fine * 0.2 + hB * 0.25) * (1 - 0.7 * rim);
        const v = (0.72 + 0.34 * hA + 0.14 * (fine - 0.5)) * (1 - 0.16 * rim);
        // Channel gains measured against the ground in screenshots (the ground also gets sky fill from the env map).
        col.setRGB(v * (0.95 + 0.45 * dry), v * (0.66 + 0.1 * dry), v * (1.7 - 0.5 * dry));
        if (L.tint > 0) { const lumc = (col.r * 0.3 + col.g * 0.59 + col.b * 0.11) * 2.0; col.r += (tc.r * lumc - col.r) * L.tint; col.g += (tc.g * lumc - col.g) * L.tint; col.b += (tc.b * lumc - col.b) * L.tint; }
        // Contact darkening at the trunk, like the ground shader.
        col.multiplyScalar(0.72 + 0.28 * smooth(tR * 0.6, tR * 7, rt));
      }
      // E_wanted / E_lambert: blades stand upright, so a low sun still lights them (the up normal alone would not).
      const amb = 0.78 + 0.22 * Math.min(up, ts);
      const side = ly + 0.4 * (1 - ly) * (1 - ly);
      const f = (hc: number, sc: number) => Math.min(4, (hc * amb + sc * side * ts + 1e-4) / (hc + sc * ly + 1e-4));
      C[i * 3] = col.r * f(hemi.r, sun.r); C[i * 3 + 1] = col.g * f(hemi.g, sun.g); C[i * 3 + 2] = col.b * f(hemi.b, sun.b);
    }
    mesh.count = n;
    mesh.instanceMatrix.needsUpdate = true;
    mesh.instanceColor!.needsUpdate = true;
    let g = 0, fl = 0;
    for (const p of this.patches) if (p.flower) fl += p.mesh.count; else g += p.mesh.count;
    this.counts.grass = g; this.counts.flowers = fl;
    const ms = performance.now() - t0;
    this.stats.lastMs = ms; this.stats.maxMs = Math.max(this.stats.maxMs, ms); this.stats.bakes++;
  }
}

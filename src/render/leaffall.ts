import * as THREE from 'three';
import { Wind } from '../wind';
import type { Leaves } from './leaves';

/**
 * Falling leaves and leaf litter (audit 3.3 "Falling leaves" / "Fallen leaves on the ground", WP6; storm part after WP9/10).
 *
 * PowerVR rule: two `InstancedMesh`es (air, ground) with the LIVE leaf geometry and the LIVE leaf material instance,
 * instance matrices and colours only, inside `group`: no new program, no material flag.
 * A leaf starts as a copy of a drawn crown leaf (`Leaves.sampleInstance`: world matrix + baked colour at that moment),
 * so it has that leaf's place, size and colour. The crown instance itself stays (1 of about 30k; the next pass redraws it).
 * Wind comes from `src/wind.ts`, storm strength from the caller (`weather.violence`); time is the caller's dt.
 * Randomness is a render-side xorshift (the sim rng is not consumed).
 */
const GROUND = 0.02;
/** Per air leaf: vx vy vz, fall speed, sail, spin axis xyz, spin rate, phase, age, lift, landing timer (-1 = flying), brown age, light gain. */
const S = 15;
const AIR_ALLOC = 512, LITTER_ALLOC = 2400;
/** Seconds for a lying leaf to dry to brown. */
const BROWN_S = 120;
/** A full litter scan (browning, gust push) takes this long. */
const SCAN_S = 0.7;
const LAND_S = 0.3;
/** Height range in which a landed leaf comes to rest in the grass. */
const REST_MIN = 0.06, REST_MAX = 0.3;
/** Leaves that land farther than this from the trunk are dropped (outside the meadow). */
const R_GONE = 42;

export interface LeafFallEnv {
  /** `weather.violence` 0..1. */
  violence: number;
  /** 0..1, peaks at dusk and dawn. */
  dusk: number;
  /** Sim leaf count (maturity: none from a sapling). */
  simLeaves: number;
  /** Crown box (world). */
  min: ArrayLike<number>;
  max: ArrayLike<number>;
  /** Quality: caps and storm rate. */
  low: boolean;
  /** 1, or 0.5 once the adaptive pixel ratio has stepped down. */
  scale: number;
  /** Param multipliers. */
  rate: number;
  litter: number;
  /** Seasons: share of the litter still lying (1 = all; falls to 0 over winter). Slots above it (hash) are removed. */
  keep?: number;
}

const m16 = new Float32Array(16), c3 = new Float32Array(3), bm = new Float32Array(16), bc = new Float32Array(3);

export class LeafFall {
  group = new THREE.Group();
  private air: THREE.InstancedMesh;
  private lit: THREE.InstancedMesh;
  private st = new Float32Array(AIR_ALLOC * S);
  /** Landing target matrices (flat on the ground) of air leaves. */
  private tgt = new Float32Array(AIR_ALLOC * 16);
  private n = 0;
  /** Colours as copied from the crown; the drawn colour brightens to open-air light over the first second of flight. */
  private aBase = new Float32Array(AIR_ALLOC * 3);
  /** Running mean luminance of the crown leaves that let go. */
  private refLum = 0;
  /** Litter: ring of slots; age < 0 = empty. */
  private lAge = new Float32Array(LITTER_ALLOC).fill(-1);
  private lBase = new Float32Array(LITTER_ALLOC * 3);
  private lQ = new Uint8Array(LITTER_ALLOC);
  private head = 0;
  private scan = 0;
  private scanAcc = 0;
  private acc = 0;
  private seed = 0x9e3779b9;
  private colDirty = false;
  stats = { spawned: 0, landed: 0, gone: 0, relaunched: 0, adopted: 0, air: 0, airPeak: 0, ground: 0, recycled: 0, rate: 0, airCap: 0, litterCap: 0, lastMs: 0, maxMs: 0, sumMs: 0, frames: 0 };

  constructor(private leaves: Leaves) {
    this.group.name = 'leaffall';
    const live = leaves.mesh;
    const mk = (cap: number) => {
      const m = new THREE.InstancedMesh(live.geometry, live.material, cap);
      m.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
      (m.instanceMatrix.array as Float32Array).fill(0);
      m.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(cap * 3), 3).setUsage(THREE.DynamicDrawUsage);
      m.castShadow = false; m.receiveShadow = live.receiveShadow;
      m.frustumCulled = false;
      if (live.userData.gbufferMaterial) m.userData.gbufferMaterial = live.userData.gbufferMaterial;
      m.count = 0; m.visible = false;
      this.group.add(m);
      return m;
    };
    this.air = mk(AIR_ALLOC);
    this.lit = mk(LITTER_ALLOC);
  }

  private rnd() {
    let h = this.seed;
    h ^= h << 13; h >>>= 0; h ^= h >>> 17; h ^= h << 5; h >>>= 0;
    this.seed = h;
    return h / 4294967296;
  }

  /** Leaves in the air / on the ground, for scripts. */
  get counts() { return { air: this.n, ground: this.stats.ground }; }

  /** Positions for scripts: air leaves [x, y, z, speed] and a sample of the litter [x, y, z]. */
  get state() {
    const a = this.air.instanceMatrix.array as Float32Array, l = this.lit.instanceMatrix.array as Float32Array, air: number[][] = [], ground: number[][] = [];
    for (let i = 0; i < this.n; i++) air.push([a[i * 16 + 12], a[i * 16 + 13], a[i * 16 + 14], Math.hypot(this.st[i * S], this.st[i * S + 1], this.st[i * S + 2])].map((x) => +x.toFixed(2)));
    for (let i = 0; i < this.lit.count; i++) if (this.lAge[i] >= 0) ground.push([l[i * 16 + 12], l[i * 16 + 13], l[i * 16 + 14]].map((x) => +x.toFixed(2)));
    return { air, ground };
  }

  /** Put one leaf (world matrix + colour) into the air. `storm` 0..1 sets how hard it is thrown; `delay` staggers a group. */
  private launch(m: ArrayLike<number>, mo: number, c: ArrayLike<number>, co: number, storm: number, delay = 0, hop = false, brown = 0): boolean {
    if (this.n >= AIR_ALLOC) return false;
    const i = this.n++, a = this.air.instanceMatrix.array as Float32Array, col = this.air.instanceColor!.array as Float32Array, s = this.st, o = i * S;
    for (let j = 0; j < 16; j++) a[i * 16 + j] = m[mo + j];
    const B = this.aBase;
    B[i * 3] = col[i * 3] = c[co]; B[i * 3 + 1] = col[i * 3 + 1] = c[co + 1]; B[i * 3 + 2] = col[i * 3 + 2] = c[co + 2];
    // A leaf from the shaded inside of the crown carries its baked occlusion: outside it is lit like the outer leaves.
    const lum = 0.3 * c[co] + 0.6 * c[co + 1] + 0.1 * c[co + 2] + 1e-5;
    // (and on the safe path the baked colour compensates the Lambert term of the crown orientation: up to 8x on a leaf
    // edge-on to the sun, which glows once the leaf turns). Pull the luminance into [0.9, 1.3] x the running mean.
    if (!hop) this.refLum = this.refLum > 0 ? this.refLum + (Math.min(lum, 3 * this.refLum) - this.refLum) * 0.04 : lum;
    s[o + 14] = hop ? 1 : Math.min(1.3 * this.refLum, Math.max(0.9 * this.refLum, lum)) / lum;
    const r = () => this.rnd();
    s[o] = 0; s[o + 1] = hop ? 0.9 + 1.4 * r() : 0; s[o + 2] = 0;
    // Fall speed: calm 0.7..1.3 m/s (a slow flutter), storm up to 3 m/s (wet, driven down between the lifts).
    s[o + 3] = 0.7 + 0.6 * r() + storm * (0.5 + 1.2 * r());
    // Share of the wind speed the leaf takes on.
    s[o + 4] = hop ? 0.1 + 0.12 * r() : 0.22 + 0.2 * r() + storm * (0.1 + 0.3 * r());
    let kx = r() - 0.5, ky = r() - 0.5, kz = r() - 0.5;
    const kl = Math.hypot(kx, ky, kz) || 1;
    kx /= kl; ky /= kl; kz /= kl;
    s[o + 5] = kx; s[o + 6] = ky; s[o + 7] = kz;
    s[o + 8] = 1.6 + 2.6 * r() + storm * (3 + 6 * r());
    s[o + 9] = r() * 6.283;
    s[o + 10] = -delay;
    // Some storm leaves are carried up before they drop.
    s[o + 11] = !hop && r() < 0.45 * storm ? 2 + 4.5 * r() : 0;
    s[o + 12] = -1;
    s[o + 13] = brown;
    this.colDirty = true;
    return true;
  }

  /** Dev/test hook: let `count` crown leaves go now (as in calm weather, or thrown as in a storm of the given strength). */
  force(count = 1, storm = 0): number {
    let k = 0;
    for (let t = 0; t < count * 6 && k < count; t++) {
      if (!this.leaves.sampleInstance(this.rnd(), m16, c3)) continue;
      if (!this.launch(m16, 0, c3, 0, storm)) break;
      k++; this.stats.spawned++;
    }
    return k;
  }

  /** Twig hand-over from the breakage debris: leaves already taken out of the crown (matrices 16/leaf, colours 3/leaf). */
  adopt(matrices: Float32Array, colours: Float32Array, n: number, storm: number) {
    for (let i = 0; i < n; i++) if (this.launch(matrices, i * 16, colours, i * 3, storm * 0.6, this.rnd() * 0.45)) this.stats.adopted++;
  }

  /** Tree reset: remove everything. */
  clear() {
    this.n = 0; this.air.count = 0; this.air.visible = false;
    this.lAge.fill(-1); this.head = 0; this.lit.count = 0; this.lit.visible = false; this.stats.ground = 0;
    (this.lit.instanceMatrix.array as Float32Array).fill(0);
    this.lit.instanceMatrix.clearUpdateRanges(); this.lit.instanceMatrix.needsUpdate = true;
  }

  /** Advance by dt seconds of real time: spawn, fly, land, litter upkeep. */
  frame(dt: number, wind: Wind, e: LeafFallEnv) {
    const t0 = performance.now();
    const live = this.leaves.mesh;
    this.lit.receiveShadow = this.air.receiveShadow = live.receiveShadow;
    const airCap = Math.round((e.low ? 110 : 320) * e.scale), litCap = Math.min(LITTER_ALLOC, Math.round((e.low ? 600 : 2000) * e.scale * e.litter));
    this.stats.airCap = airCap; this.stats.litterCap = litCap;
    const cx = (e.min[0] + e.max[0]) / 2, cz = (e.min[2] + e.max[2]) / 2, H = Math.max(1, e.max[1]);
    const R = Math.max(0.5, (e.max[0] - e.min[0] + e.max[2] - e.min[2]) / 4);
    const v = e.violence;

    // Spawn. Rate follows the gust at the crown relative to the base wind (0.1..1): rare singles in calm, a stream in storm gusts.
    const mature = Math.min(1, Math.max(0, (e.simLeaves - 500) / 2500));
    const g = wind.gust(cx, cz), gr = wind.base > 1e-3 ? g / wind.base : 0, gr3 = gr * gr * gr;
    const calm = (0.04 + 0.5 * gr3) * Math.min(2, (wind.base / 0.35) ** 2) * (1 + 2 * e.dusk);
    const storm = v * (e.low ? 40 : 110) * e.scale * (0.06 + gr3);
    const rate = mature * e.rate * (calm + storm);
    this.stats.rate = rate;
    this.acc += rate * dt;
    while (this.acc >= 1) {
      this.acc -= 1;
      if (this.n >= airCap) { this.acc = 0; break; }
      // Storm: the best of a few candidates by "windward and outer" (calm: any leaf).
      const K = v > 0.3 ? 4 : 1;
      let best = -Infinity;
      for (let k = 0; k < K; k++) {
        if (!this.leaves.sampleInstance(this.rnd(), m16, c3)) continue;
        const dx = m16[12] - cx, dz = m16[14] - cz;
        const sc = (-(dx * wind.dirX + dz * wind.dirZ) + 0.6 * Math.hypot(dx, dz)) / R + 0.4 * (m16[13] / H) + 0.7 * this.rnd();
        if (sc > best) { best = sc; bm.set(m16); bc.set(c3); }
      }
      if (best > -Infinity && this.launch(bm, 0, bc, 0, v)) this.stats.spawned++;
    }

    this.stepAir(dt, wind, v, H, cx, cz, litCap);
    this.stepLitter(dt, wind, litCap, airCap, e.keep ?? 1);

    this.stats.air = this.n;
    if (this.n > this.stats.airPeak) this.stats.airPeak = this.n;
    this.stats.lastMs = performance.now() - t0;
    this.stats.sumMs += this.stats.lastMs; this.stats.frames++;
    if (this.stats.lastMs > this.stats.maxMs) this.stats.maxMs = this.stats.lastMs;
  }

  private stepAir(dt: number, wind: Wind, v: number, H: number, cx: number, cz: number, litCap: number) {
    const a = this.air.instanceMatrix.array as Float32Array, col = this.air.instanceColor!.array as Float32Array, s = this.st, T = this.tgt, B = this.aBase;
    const px = -wind.dirZ, pz = wind.dirX;
    const kh = 1 - Math.exp(-dt / 0.4), kv = 1 - Math.exp(-dt / 0.3);
    for (let i = this.n - 1; i >= 0; i--) {
      const o = i * S, q = i * 16;
      if (s[o + 10] < 0) { s[o + 10] += dt; continue; }
      s[o + 10] += dt;
      const age = s[o + 10];
      let done = false;
      if (s[o + 12] >= 0) {
        // Landing: settle flat onto the grass over LAND_S while sliding to a stop.
        const k0 = s[o + 12];
        s[o + 12] += dt;
        const k = Math.min(1, s[o + 12] / LAND_S), w = k >= 1 ? 1 : Math.min(1, (k - k0 / LAND_S) / Math.max(1e-4, 1 - k0 / LAND_S));
        const slide = dt * (1 - k);
        a[q + 12] += s[o] * slide; a[q + 14] += s[o + 2] * slide;
        for (let j = 0; j < 12; j++) a[q + j] += (T[q + j] - a[q + j]) * w;
        a[q + 13] += (T[q + 13] - a[q + 13]) * w;
        if (k >= 1) {
          done = true;
          const x = a[q + 12], z = a[q + 14];
          if (Math.hypot(x - cx, z - cz) > R_GONE || litCap <= 0) this.stats.gone++;
          else { this.toLitter(a, q, col, i * 3, s[o + 13], litCap); this.stats.landed++; }
        }
      } else {
        const x = a[q + 12], y = a[q + 13], z = a[q + 14];
        if (s[o + 14] !== 1 && age < 1.2) {
          const gk = 1 + (s[o + 14] - 1) * Math.min(1, age);
          col[i * 3] = B[i * 3] * gk; col[i * 3 + 1] = B[i * 3 + 1] * gk; col[i * 3 + 2] = B[i * 3 + 2] * gk;
          this.colDirty = true;
        }
        const W = Wind.speed(wind.gust(x, z));
        // Sheltered near the ground, full wind from about 60 % of the crown height.
        const sh = 0.3 + 0.7 * Math.min(1, Math.max(0, y / (0.6 * H)));
        const ph = s[o + 9] + age * (2.4 + 2.5 * v);
        const tgtH = W * s[o + 4] * sh;
        const side = (0.55 + 0.05 * W) * Math.sin(ph), fore = 0.35 * Math.cos(ph * 0.8 + 1);
        s[o] += (wind.dirX * (tgtH + fore) + px * side - s[o]) * kh;
        s[o + 2] += (wind.dirZ * (tgtH + fore) + pz * side - s[o + 2]) * kh;
        const lift = s[o + 11] * Math.exp(-age / 0.9) + v * W * 0.07 * Math.sin(ph * 0.63 + 2);
        s[o + 1] += (-s[o + 3] * (0.8 + 0.3 * Math.sin(ph * 1.7)) + lift - s[o + 1]) * kv;
        a[q + 12] = x + s[o] * dt; a[q + 13] = y + s[o + 1] * dt; a[q + 14] = z + s[o + 2] * dt;
        // Tumble about the leaf's own axis, faster the faster it flies.
        const ang = s[o + 8] * (0.6 + 0.08 * Math.hypot(s[o], s[o + 2])) * Math.min(1, age * 3) * dt;
        const cs = Math.cos(ang), sn = Math.sin(ang), kx = s[o + 5], ky = s[o + 6], kz = s[o + 7];
        for (let c = 0; c < 12; c += 4) {
          const X = a[q + c], Y = a[q + c + 1], Z = a[q + c + 2];
          const d = (kx * X + ky * Y + kz * Z) * (1 - cs);
          a[q + c] = X * cs + (ky * Z - kz * Y) * sn + kx * d;
          a[q + c + 1] = Y * cs + (kz * X - kx * Z) * sn + ky * d;
          a[q + c + 2] = Z * cs + (kx * Y - ky * X) * sn + kz * d;
        }
        const size = Math.hypot(a[q + 4], a[q + 5], a[q + 6]);
        if (a[q + 13] <= REST_MAX + 0.02 && s[o + 1] < 0) {
          // Touch-down: target = lying flat (blade normal up or down, random heading, a few degrees of tilt).
          s[o + 12] = 0;
          const yaw = this.rnd() * 6.283, up = this.rnd() < 0.5 ? 1 : -1, tl = (this.rnd() - 0.5) * 0.9;
          const lx = Math.cos(yaw), lz = Math.sin(yaw), ct = Math.cos(tl), stl = Math.sin(tl);
          // Columns: X = Y × Z, Y = long axis (horizontal, tilted by tl), Z = normal.
          const Yx = lx * ct, Yy = stl, Yz = lz * ct, Zx = -lx * stl * up, Zy = ct * up, Zz = -lz * stl * up;
          T[q] = (Yy * Zz - Yz * Zy) * size; T[q + 1] = (Yz * Zx - Yx * Zz) * size; T[q + 2] = (Yx * Zy - Yy * Zx) * size;
          T[q + 4] = Yx * size; T[q + 5] = Yy * size; T[q + 6] = Yz * size;
          T[q + 8] = Zx * size; T[q + 9] = Zy * size; T[q + 10] = Zz * size;
          // Caught in the grass at some height (the tufts are 0.3 m tall: a leaf flat on the soil is never seen); the
          // blade is cupped (tip 0.22 below its base along the normal), so the lowest point stays above the ground.
          const r = this.rnd();
          T[q + 13] = Math.max(GROUND + size * (up > 0 ? 0.24 : 0.07) + Math.max(0, -stl) * size * 1.1, REST_MIN + (REST_MAX - REST_MIN) * r * r);
        } else if (age > 40) { done = true; this.stats.gone++; }
      }
      if (done) {
        // Swap-remove.
        const l = --this.n;
        if (l !== i) {
          a.copyWithin(q, l * 16, l * 16 + 16); T.copyWithin(q, l * 16, l * 16 + 16);
          col.copyWithin(i * 3, l * 3, l * 3 + 3); B.copyWithin(i * 3, l * 3, l * 3 + 3); s.copyWithin(o, l * S, l * S + S);
        }
        this.colDirty = true;
      }
    }
    const M = this.air.instanceMatrix;
    this.air.count = this.n; this.air.visible = this.n > 0;
    if (this.n > 0) {
      // One ranged upload of the live slots.
      M.clearUpdateRanges(); M.addUpdateRange(0, this.n * 16); M.needsUpdate = true;
      if (this.colDirty) {
        const C = this.air.instanceColor!;
        C.clearUpdateRanges(); C.addUpdateRange(0, this.n * 3); C.needsUpdate = true;
        this.colDirty = false;
      }
    }
  }

  private toLitter(a: Float32Array, q: number, col: Float32Array, c: number, brown: number, cap: number) {
    if (this.head >= cap) this.head = 0;
    const i = this.head++, L = this.lit, la = L.instanceMatrix.array as Float32Array;
    if (this.lAge[i] >= 0) this.stats.recycled++; else this.stats.ground++;
    for (let j = 0; j < 16; j++) la[i * 16 + j] = a[q + j];
    la[i * 16 + 15] = 1;
    this.lBase[i * 3] = col[c]; this.lBase[i * 3 + 1] = col[c + 1]; this.lBase[i * 3 + 2] = col[c + 2];
    this.lAge[i] = brown;
    this.lQ[i] = 255; // forces a colour write on the next scan
    this.paint(i);
    L.instanceMatrix.addUpdateRange(i * 16, 16); L.instanceMatrix.needsUpdate = true;
    if (i >= L.count) L.count = i + 1;
    L.visible = true;
  }

  /** Litter colour from its age (green to brown), written only when the quantised step changed. */
  private paint(i: number) {
    const k = Math.min(1, this.lAge[i] / BROWN_S), kq = Math.round(k * 24);
    if (kq === this.lQ[i]) return;
    this.lQ[i] = kq;
    const C = this.lit.instanceColor!, c = C.array as Float32Array, b = this.lBase;
    c[i * 3] = b[i * 3] * (1 + 0.25 * k); c[i * 3 + 1] = b[i * 3 + 1] * (1 - 0.42 * k); c[i * 3 + 2] = b[i * 3 + 2] * (1 - 0.55 * k);
    C.addUpdateRange(i * 3, 3); C.needsUpdate = true;
  }

  /** Round-robin over the litter (a full scan per SCAN_S): browning, strong gusts lift lying leaves into a short hop. */
  private stepLitter(dt: number, wind: Wind, cap: number, airCap: number, keep = 1) {
    const L = this.lit, hw = L.count;
    if (hw === 0) return;
    const la = L.instanceMatrix.array as Float32Array;
    this.scanAcc += (hw * dt) / SCAN_S;
    let todo = Math.min(hw, Math.floor(this.scanAcc));
    this.scanAcc -= todo;
    while (todo-- > 0) {
      if (this.scan >= hw) this.scan = 0;
      const i = this.scan++;
      if (this.lAge[i] < 0) continue;
      if (i >= cap || (keep < 1 && ((i * 2246822519) >>> 8 & 1023) / 1023 >= keep)) { this.hide(i); continue; } // cap went down (quality, pixel ratio), or the winter took it
      this.lAge[i] += SCAN_S;
      const x = la[i * 16 + 12], z = la[i * 16 + 14];
      // Half of the leaves are lodged in the grass and never move.
      if ((i * 2654435761 >>> 0) & 0x10000 && this.n < airCap) {
        const g = wind.gust(x, z);
        if (g > 0.72 && this.rnd() < (g - 0.72) * 0.9) {
          const c = L.instanceColor!.array as Float32Array;
          // Fly on with the base colour; the brown age travels along.
          if (this.launch(la, i * 16, this.lBase, i * 3, 0.5, 0, true, this.lAge[i])) {
            const n = this.n - 1, ac = this.air.instanceColor!.array as Float32Array;
            ac[n * 3] = c[i * 3]; ac[n * 3 + 1] = c[i * 3 + 1]; ac[n * 3 + 2] = c[i * 3 + 2];
            this.hide(i); this.stats.relaunched++;
            continue;
          }
        }
      }
      this.paint(i);
    }
  }

  private hide(i: number) {
    const L = this.lit, la = L.instanceMatrix.array as Float32Array;
    for (let j = 0; j < 16; j++) la[i * 16 + j] = 0;
    L.instanceMatrix.addUpdateRange(i * 16, 16); L.instanceMatrix.needsUpdate = true;
    this.lAge[i] = -1; this.stats.ground--;
  }
}

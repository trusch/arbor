import * as THREE from 'three';
import type { TreeSim } from '../sim/tree';

/**
 * Low-quality canopy shadow: the safe leaf path cannot cast shadow-map shadows (a depth program for alpha-tested leaves
 * is exactly the shader class that crashed PowerVR), so the crown shadow is baked on the CPU instead, as optical depth
 * in a sun-aligned ground frame (texture u = sun azimuth, w = perpendicular; the decal plane is rotated to the azimuth
 * and sized to the footprint, so u and w have independent texel sizes).
 *
 * Deposit, then blur: every caster (a leaf clump per leafy node, samples along trunk and order ≤ 1 limbs) is projected
 * along the sun and adds its mass bilinearly to two of K = 5 blur-level layers, chosen by its penumbra sigma (own radius +
 * a term growing with the caster's height along the sun ray; the split between the two neighbouring levels matches the
 * variance exactly). The layers are then cascaded from the widest level down: add layer k, blur (one fractional-box pass per axis) by the variance
 * step to level k-1 (sigma x `stretch` along u, which is a blob's elongated footprint at low sun). Cost is a fixed
 * 10 sliding-sum passes over a 128² blur grid (upsampled to the 256² texture) instead of one exp per covered texel per caster.
 *
 * A contact ring darkens the trunk base, sun flecks are punched into moderately dense parts, world-anchored value noise
 * dapples it; opacity is capped at `strength`. Drawn as a transparent MeshBasicMaterial plane just above the ground
 * (dark colour x alpha). Branches stop casting shadow-map shadows on Low. Data-only for the GPU: texture pixels and
 * the plane transform.
 */
/** Sliding sums leave rounding residue behind the window; anything this small is flushed to 0 (denormals are slow). */
const EPS = 1e-7;
/** Cross-fade from the drawn decal to a new bake: duration (real s, under the 0.5 s minimum bake gap) and uploads. */
const FADE_S = 0.45, FADE_STEPS = 6;

export class CanopyShadow {
  readonly mesh: THREE.Mesh;
  private readonly S = 256;
  private readonly canvas: HTMLCanvasElement;
  private readonly ctx: CanvasRenderingContext2D;
  private readonly tex: THREE.CanvasTexture;
  private readonly tau: Float32Array;
  private readonly tmp: Float32Array;
  private readonly noise: Float32Array;
  private img: ImageData;
  /** Blur grid: the deposit/blur cascade runs at half resolution (its content is band-limited by the clump size). */
  private readonly N = 128;
  private readonly K = 5;
  private readonly bufA: Float32Array;
  private readonly bufB: Float32Array;
  private readonly layers: Float32Array[] = [];
  private readonly colAcc: Float64Array;
  private readonly sig = new Float64Array(5);
  private readonly used = new Uint8Array(5);
  /** Cross-fade between bakes: alpha drawn now, alpha at the fade start (resampled into the new frame), the new bake. */
  private readonly shown: Uint8Array;
  private readonly from: Uint8Array;
  private readonly to: Uint8Array;
  /** Ground frame of the drawn texture (u0, w0, texels per metre along u and w, azimuth); `has` = something is drawn. */
  private fr = { u0: 0, w0: 0, toU: 1, toW: 1, ux: 1, uz: 0, has: false };
  private fadeP = 1;
  private fadeStep = 0;
  /** Texture uploads of fade steps (profiling). */
  fadeUploads = 0;
  private key = '';
  private lastT = -1e9;
  private ver = -1;
  /** Bake statistics (ms), for profiling. */
  lastMs = 0;
  maxMs = 0;
  bakes = 0;

  constructor() {
    const S = this.S;
    this.canvas = document.createElement('canvas');
    this.canvas.width = this.canvas.height = S;
    this.ctx = this.canvas.getContext('2d')!;
    this.img = this.ctx.createImageData(S, S);
    this.tex = new THREE.CanvasTexture(this.canvas);
    this.tex.colorSpace = THREE.SRGBColorSpace;
    this.tau = new Float32Array(S * S);
    this.tmp = new Float32Array(S * S);
    this.shown = new Uint8Array(S * S);
    this.from = new Uint8Array(S * S);
    this.to = new Uint8Array(S * S);
    const N = this.N;
    for (let k = 0; k < this.K; k++) this.layers.push(new Float32Array(N * N));
    this.bufA = new Float32Array(N * N);
    this.bufB = new Float32Array(N * N);
    this.colAcc = new Float64Array(N);
    this.img.data.fill(255);
    // Two-octave value noise for dappling.
    this.noise = new Float32Array(S * S);
    const rnd = (i: number) => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
    for (const [f, w] of [[16, 0.6], [48, 0.4]] as const) for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {
      const gx = (x / S) * f, gy = (y / S) * f, ix = Math.floor(gx), iy = Math.floor(gy), fx = gx - ix, fy = gy - iy;
      const h = (a: number, b: number) => rnd(((a % f) + f) % f + (((b % f) + f) % f) * 97 + f * 7);
      const sx = fx * fx * (3 - 2 * fx), sy = fy * fy * (3 - 2 * fy);
      const v = (h(ix, iy) * (1 - sx) + h(ix + 1, iy) * sx) * (1 - sy) + (h(ix, iy + 1) * (1 - sx) + h(ix + 1, iy + 1) * sx) * sy;
      this.noise[y * S + x] += v * w;
    }
    const mat = new THREE.MeshBasicMaterial({ map: this.tex, transparent: true, depthWrite: false, color: 0x0a1206 });
    this.mesh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2), mat);
    this.mesh.renderOrder = 1;
    this.mesh.visible = false;
  }

  /** dir: toward the shadow-casting light (y clamped like the stage sun). Rebuilds at most every `minGap` s unless the sun moved. */
  update(sim: TreeSim, dir: THREE.Vector3, strength: number, time: number, minGap = 2) {
    const G = sim.lightGrid;
    if (sim.nodes.length < 2) { this.mesh.visible = false; this.fr.has = false; this.ver = -1; return; }
    // Before the first light grid (seedling) the node count stands in for the light version.
    const ver = G ? sim.lightVersion : -2 - sim.nodes.length, cell = G ? G.cell : 0.25;
    const key = `${dir.x.toFixed(2)},${dir.y.toFixed(2)},${dir.z.toFixed(2)}`;
    const gap = time - this.lastT;
    if (key === this.key && (ver === this.ver || gap < minGap)) return;
    if (gap < 0.5) return;
    this.key = key;
    this.ver = ver;
    this.lastT = time;
    const t0 = performance.now();
    const S = this.S, N = this.N, K = this.K, sig = this.sig, layers = this.layers, used = this.used;
    const ly = Math.max(0.3, dir.y), hl = Math.hypot(dir.x, dir.z);
    // Sun-aligned ground frame: U = unit azimuth the shadows fall along, W = perpendicular. world = U·u + W·w.
    let ux = 1, uz = 0;
    if (hl > 1e-4) { ux = -dir.x / hl; uz = -dir.z / hl; }
    const slope = hl / ly; // ground shift along +u per metre of caster height
    const stretch = Math.min(2.5, 1 / ly); // a blob's footprint elongation along u at low sun
    const pen = 0.035, clumpR = 0.12;
    // Footprint: tree bbox projected along the sun, in (u, w), padded by the widest blur.
    const mn = sim.bboxMin, mx = sim.bboxMax, top = Math.max(0, mx[1]);
    let u0 = Infinity, u1 = -Infinity, w0 = Infinity, w1 = -Infinity;
    for (let c = 0; c < 8; c++) {
      const x = c & 1 ? mx[0] : mn[0], z = c & 2 ? mx[2] : mn[2], y = c & 4 ? top : 0;
      const u = x * ux + z * uz + y * slope, w = -x * uz + z * ux;
      if (u < u0) u0 = u; if (u > u1) u1 = u; if (w < w0) w0 = w; if (w > w1) w1 = w;
    }
    const sMax = clumpR * 1.3 + pen * (top / ly);
    const padW = cell + 1.5 * sMax, padU = cell + 1.5 * sMax * stretch;
    u0 -= padU; u1 += padU; w0 -= padW; w1 += padW;
    // World-anchored grid: the blur cell size comes from a ladder (steps of 2^(1/3)) and the origin sits on a multiple
    // of it, so from bake to bake the texels stay where they are on the ground (a growing footprint adds whole cells)
    // until the ladder steps; the refit plane then shows unchanged content in the same place.
    const cu = Math.pow(2, Math.ceil(Math.log2((u1 - u0) / (N - 2)) * 3) / 3), cw = Math.pow(2, Math.ceil(Math.log2((w1 - w0) / (N - 2)) * 3) / 3);
    u0 = Math.floor(u0 / cu) * cu; u1 = u0 + N * cu; w0 = Math.floor(w0 / cw) * cw; w1 = w0 + N * cw;
    const extU = u1 - u0, extW = w1 - w0, toU = S / extU, toW = S / extW, hU = N / extU, hW = N / extW;
    // Blur levels: geometric sigmas (world units, w axis) from the pixel floor to the widest penumbra.
    const sMin = 0.6 / hW, ratio = Math.pow(Math.max(1.01, sMax / sMin), 1 / (K - 1));
    for (let k = 0; k < K; k++) { sig[k] = sMin * Math.pow(ratio, k); layers[k].fill(0); used[k] = 0; }
    const texel = hU * hW; // blur-grid texels per m²: mass (tau·m²) → tau per texel
    /** Adds `mass` at world (wx, wy, wz) projected along the sun, to be blurred by gaussian sigma `s` (world, w axis). */
    const deposit = (wx: number, wy: number, wz: number, s: number, mass: number) => {
      const pu = (wx * ux + wz * uz + wy * slope - u0) * hU - 0.5, pw = (-wx * uz + wz * ux - w0) * hW - 0.5;
      if (!(pu >= 0 && pw >= 0 && pu < N - 1 && pw < N - 1)) return;
      let k = 0;
      while (k < K - 2 && s > sig[k + 1]) k++;
      const a = sig[k] * sig[k], b = sig[k + 1] * sig[k + 1];
      const f = Math.min(1, Math.max(0, (s * s - a) / (b - a)));
      const iu = pu | 0, iw = pw | 0, fu = pu - iu, fw = pw - iw, o = iw * N + iu, m = mass * texel;
      const w00 = (1 - fu) * (1 - fw), w10 = fu * (1 - fw), w01 = (1 - fu) * fw, w11 = fu * fw;
      if (f < 1) { const L = layers[k], v = m * (1 - f); L[o] += v * w00; L[o + 1] += v * w10; L[o + N] += v * w01; L[o + N + 1] += v * w11; used[k] = 1; }
      if (f > 0) { const L = layers[k + 1], v = m * f; L[o] += v * w00; L[o + 1] += v * w10; L[o + N] += v * w01; L[o + N + 1] += v * w11; used[k + 1] = 1; }
    };
    // Crown: one deposit per leafy node (the leaf clump) at its real position. Overlapping clumps under the dense core
    // build optical depth; gaps between clumps stay lighter. Mass = integral of the clump's gaussian footprint.
    const nodes = sim.nodes;
    let j = 1;
    const jr = () => { j = (Math.imul(j, 1664525) + 1013904223) | 0; return (j >>> 8) / 16777216 - 0.5; };
    const TAU = 2 * Math.PI;
    for (let i = 1; i < nodes.length; i++) {
      const nd = nodes[i];
      if (!nd.leafy || sim.chains[nd.chain].pruned || nd.wdy < -0.75) continue;
      const jx = jr() * 0.15, jz = jr() * 0.15, r = clumpR * (0.8 + 0.5 * (jr() + 0.5));
      deposit(nd.wx + jx, nd.wy, nd.wz + jz, r + pen * (nd.wy / ly), TAU * 0.1 * r * r * stretch);
    }
    // Trunk and main limbs: samples along each segment.
    for (const ch of sim.chains) {
      if (ch.pruned || ch.order > 1) continue;
      const v = TAU * (ch.order === 0 ? 1.2 : 0.6);
      for (let i = 1; i < ch.nodes.length; i++) {
        const a = nodes[ch.nodes[i - 1]], b = nodes[ch.nodes[i]];
        const len = Math.hypot(b.wx - a.wx, b.wy - a.wy, b.wz - a.wz);
        const steps = Math.max(1, Math.ceil(len * hW));
        const r = Math.max(sMin, b.radius * 0.8), m = v * r * r;
        for (let s = 0; s < steps; s++) {
          const t = (s + 0.5) / steps, y = a.wy + (b.wy - a.wy) * t;
          deposit(a.wx + (b.wx - a.wx) * t, y, a.wz + (b.wz - a.wz) * t, r + pen * (y / ly), m);
        }
      }
    }
    // Cascade from the widest level down: add the level's deposits, blur by the variance step to the next level.
    let cur = this.bufA, oth = this.bufB, any = false;
    cur.fill(0);
    for (let k = K - 1; k >= 0; k--) {
      if (used[k]) { const L = layers[k]; for (let i = 0; i < N * N; i++) cur[i] += L[i]; any = true; }
      if (!any) continue;
      const dv = sig[k] * sig[k] - (k > 0 ? sig[k - 1] * sig[k - 1] : 0);
      if (this.blur(cur, oth, dv * stretch * stretch * hU * hU, true)) { const t = cur; cur = oth; oth = t; }
      if (this.blur(cur, oth, dv * hW * hW, false)) { const t = cur; cur = oth; oth = t; }
    }
    // Bilinear upsample to the full-resolution optical depth (texel centres: full x ↔ blur-grid x/2 - 0.25).
    const tau = this.tau, holes = this.tmp;
    const row = this.colAcc;
    for (let z = 0; z < S; z++) {
      const hz = Math.max(0, z * 0.5 - 0.25), iz = Math.min(N - 2, hz | 0), fz = Math.min(1, hz - iz), r0 = iz * N, r1 = r0 + N, o = z * S;
      for (let x = 0; x < N; x++) { const a = cur[r0 + x]; row[x] = a + (cur[r1 + x] - a) * fz; }
      tau[o] = row[0]; tau[o + S - 1] = row[N - 1];
      for (let x = 0, q = o + 1; x < N - 1; x++, q += 2) { const a = row[x], b = row[x + 1]; tau[q] = 0.75 * a + 0.25 * b; tau[q + 1] = 0.25 * a + 0.75 * b; }
    }
    // Contact darkening at the trunk base (ambient occlusion ring; on the ground, so neither projected nor stretched).
    const n0 = nodes[0], tr = Math.max(0.08, nodes[Math.min(1, nodes.length - 1)].radius);
    const bu = (n0.wx * ux + n0.wz * uz - u0) * toU - 0.5, bw = (-n0.wx * uz + n0.wz * ux - w0) * toW - 0.5;
    for (const [r, v] of [[tr * 2.2, 1.4], [tr * 5, 0.35]] as const) {
      const ru = 2.5 * r * toU, rw = 2.5 * r * toW, inv = 1 / (2 * r * r);
      for (let z = Math.max(0, Math.floor(bw - rw)); z <= Math.min(S - 1, Math.ceil(bw + rw)); z++) for (let x = Math.max(0, Math.floor(bu - ru)); x <= Math.min(S - 1, Math.ceil(bu + ru)); x++) {
        const du = (x - bu) / toU, dw = (z - bw) / toW, q = (du * du + dw * dw) * inv;
        if (q < 3.2) tau[z * S + x] += v * Math.exp(-q);
      }
    }
    // Sun flecks: small soft ellipses (stretched along u like the shadow) punched into the crown shadow where it is
    // only moderately dense (gaps between clumps), not under the trunk/core.
    holes.fill(0);
    // Candidates sit on a world-anchored 0.5 m lattice in the (u, w) frame (one hashed fleck per cell), so a fleck
    // keeps its place on the ground from bake to bake.
    let f = 1;
    const fr = () => { f = Math.imul(f ^ (f >>> 15), 2246822519); f = Math.imul(f ^ (f >>> 13), 3266489917); f ^= f >>> 16; return (f >>> 8) / 16777216; };
    const FL = 0.5, fe = Math.min(2.2, stretch), i1 = Math.ceil(u1 / FL), j1 = Math.ceil(w1 / FL);
    for (let jj = Math.floor(w0 / FL); jj < j1; jj++) for (let ii = Math.floor(u0 / FL); ii < i1; ii++) {
      f = (Math.imul(ii, 374761393) ^ Math.imul(jj, 668265263)) | 0;
      const gx = ((ii + fr()) * FL - u0) * toU, gz = ((jj + fr()) * FL - w0) * toW;
      if (!(gx >= 0 && gz >= 0 && gx < S && gz < S)) continue;
      const t = tau[(gz | 0) * S + (gx | 0)];
      if (t < 0.15 || t > 2.2) continue;
      const rr = 0.06 + 0.11 * fr(), ru = Math.min(2.5 * fe, Math.max(0.8, rr * fe * toU)), rw = Math.min(2.5, Math.max(0.8, rr * toW)), wgt = 0.55 + 0.45 * fr();
      const eu = Math.ceil(ru * 1.6), ew = Math.ceil(rw * 1.6), iu2 = 1 / (ru * ru), iw2 = 1 / (rw * rw);
      for (let z = Math.max(0, (gz | 0) - ew); z <= Math.min(S - 1, (gz | 0) + ew); z++) for (let x = Math.max(0, (gx | 0) - eu); x <= Math.min(S - 1, (gx | 0) + eu); x++) {
        const du = x - gx, dw = z - gz, q = du * du * iu2 + dw * dw * iw2;
        if (q < 2.5) { const h = wgt * Math.exp(-q); if (h > holes[z * S + x]) holes[z * S + x] = h; }
      }
    }
    // Dapple with world-anchored noise (stable while the footprint grows or the sun moves), map optical depth to
    // opacity (cap = strength), fade to 0 at the border.
    const to = this.to, noise = this.noise, NS = 15, dxu = (ux / toU) * NS, dzu = (uz / toU) * NS, k255 = 255 * Math.min(1, strength);
    for (let z = 0, i = 0; z < S; z++) {
      const ww = w0 + (z + 0.5) / toW, uu = u0 + 0.5 / toU;
      // +4096: keeps the noise coordinate positive so `| 0` floors.
      let nx = (uu * ux - ww * uz) * NS + 4096, nz = (uu * uz + ww * ux) * NS + 4096;
      const ez = Math.min(z, S - 1 - z);
      for (let x = 0; x < S; x++, i++, nx += dxu, nz += dzu) {
        const t = tau[i];
        let a8 = 0;
        if (t > 1e-3) {
          const nv = noise[(((nz | 0) & 255) << 8) | ((nx | 0) & 255)];
          let a = (1 - Math.exp(-t * (0.35 + 1.2 * nv * nv))) * (1 - 0.8 * holes[i]) * k255;
          if (ez < 4 || x < 4 || x > S - 5) a *= Math.min(x, S - 1 - x, ez) / 4;
          a8 = (a + 0.5) | 0;
        }
        to[i] = a8;
      }
    }
    // Cross-fade: what is drawn now is resampled into the new frame (exact while the grid only shifted by whole
    // texels) and blended to the new bake in `FADE_STEPS` uploads over `FADE_S`, so a bake never shows as a step.
    // A paused or fast-forwarded tree with nothing drawn yet gets the bake at once.
    const P = this.fr, from = this.from, shown = this.shown;
    if (!P.has) from.fill(0);
    else {
      // new texel (x, z) -> old texel: affine in x and z.
      const c = ux * P.ux + uz * P.uz, sn = ux * P.uz - uz * P.ux; // rotation between the frames (1, 0 unless the sun moved)
      const ax = (c / toU) * P.toU, az = (-sn / toU) * P.toW;
      for (let z = 0, i = 0; z < S; z++) {
        const un = u0 + 0.5 / toU, wn = w0 + (z + 0.5) / toW;
        let ox = (un * c + wn * sn - P.u0) * P.toU - 0.5, oz = (-un * sn + wn * c - P.w0) * P.toW - 0.5;
        for (let x = 0; x < S; x++, i++, ox += ax, oz += az) {
          const fx0 = Math.floor(ox + 1e-4), fz0 = Math.floor(oz + 1e-4);
          if (fx0 < -1 || fz0 < -1 || fx0 >= S || fz0 >= S) { from[i] = 0; continue; }
          const tx = Math.max(0, ox - fx0), tz = Math.max(0, oz - fz0), o = fz0 * S + fx0;
          const inX0 = fx0 >= 0, inX1 = fx0 < S - 1, inZ0 = fz0 >= 0, inZ1 = fz0 < S - 1;
          const v00 = inX0 && inZ0 ? shown[o] : 0, v10 = inX1 && inZ0 ? shown[o + 1] : 0, v01 = inX0 && inZ1 ? shown[o + S] : 0, v11 = inX1 && inZ1 ? shown[o + S + 1] : 0;
          from[i] = (v00 + (v10 - v00) * tx + (v01 - v00 + (v11 - v10 - v01 + v00) * tx) * tz + 0.5) | 0;
        }
      }
    }
    const instant = !P.has && minGap < 2;
    P.u0 = u0; P.w0 = w0; P.toU = toU; P.toW = toW; P.ux = ux; P.uz = uz; P.has = true;
    this.fadeP = instant ? 1 : 0; this.fadeStep = instant ? FADE_STEPS - 1 : 0;
    this.fadeTo(this.fadeStep + 1);
    const uc = (u0 + u1) / 2, wc = (w0 + w1) / 2;
    this.mesh.position.set(uc * ux - wc * uz, 0.015, uc * uz + wc * ux);
    this.mesh.rotation.y = Math.atan2(-uz, ux); // local +x → U, local +z → W
    this.mesh.scale.set(extU, 1, extW);
    this.mesh.visible = true;
    this.lastMs = performance.now() - t0;
    if (this.lastMs > this.maxMs) this.maxMs = this.lastMs;
    this.bakes++;
  }

  /** Per frame (`dt` real seconds): advances the cross-fade to the latest bake; uploads the texture only on a new step. */
  fade(dt: number) {
    if (this.fadeStep >= FADE_STEPS || !this.mesh.visible) return;
    this.fadeP = Math.min(1, this.fadeP + dt / FADE_S);
    const step = Math.max(this.fadeStep, Math.ceil(this.fadeP * FADE_STEPS));
    if (step > this.fadeStep) { this.fadeTo(step); this.fadeUploads++; }
  }

  private fadeTo(step: number) {
    this.fadeStep = step;
    const k = Math.round((256 * step) / FADE_STEPS), from = this.from, to = this.to, shown = this.shown, px8 = this.img.data, n = this.S * this.S;
    for (let i = 0; i < n; i++) { const a = from[i], v = a + (((to[i] - a) * k) >> 8); shown[i] = v; px8[i * 4 + 3] = v; }
    this.ctx.putImageData(this.img, 0, 0);
    this.tex.needsUpdate = true;
  }

  /**
   * One sliding-sum pass of `src` into `dst` along one axis with variance `v` (px², zero outside): a box of radius R
   * whose two outer taps carry a fractional weight f, so any variance is matched exactly (R = 0 is a 3-tap kernel).
   * The cascade stacks several of these, which rounds the kernel off. Returns false (nothing written) for v ≈ 0.
   */
  private blur(src: Float32Array, dst: Float32Array, v: number, alongU: boolean): boolean {
    const S = this.N;
    if (v < 0.02) return false;
    let R = 0;
    while (R < (S >> 1) && ((R + 1) * (R + 2)) / 3 <= v) R++; // box variance R(R+1)/3
    const bv = (R * (R + 1) * (2 * R + 1)) / 3, E = R + 1;
    const f = Math.min(1, Math.max(0, (v * (2 * R + 1) - bv) / (2 * E * E - 2 * v)));
    const inv = 1 / (2 * R + 1 + 2 * f), acc = this.colAcc;
    if (alongU) {
      for (let z = 0; z < S; z++) {
        const o = z * S;
        let s = 0;
        for (let x = 0; x < R; x++) s += src[o + x];
        for (let x = 0; x < S; x++) {
          if (x + R < S) s += src[o + x + R];
          const e = (x >= E ? src[o + x - E] : 0) + (x + E < S ? src[o + x + E] : 0);
          const t = s + f * e;
          dst[o + x] = t > EPS ? t * inv : 0;
          if (x >= R) s -= src[o + x - R];
        }
      }
    } else {
      acc.fill(0);
      for (let z = 0; z < R; z++) { const o = z * S; for (let x = 0; x < S; x++) acc[x] += src[o + x]; }
      for (let z = 0; z < S; z++) {
        const o = z * S;
        if (z + R < S) { const q = o + R * S; for (let x = 0; x < S; x++) acc[x] += src[q + x]; }
        const lo = z >= E ? o - E * S : -1, hi = z + E < S ? o + E * S : -1;
        for (let x = 0; x < S; x++) {
          const t = acc[x] + f * ((lo >= 0 ? src[lo + x] : 0) + (hi >= 0 ? src[hi + x] : 0));
          dst[o + x] = t > EPS ? t * inv : 0;
        }
        if (z >= R) { const q = o - R * S; for (let x = 0; x < S; x++) acc[x] -= src[q + x]; }
      }
    }
    return true;
  }
}

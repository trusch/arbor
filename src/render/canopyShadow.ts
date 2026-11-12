import * as THREE from 'three';
import type { TreeSim } from '../sim/tree';

/**
 * Low-quality canopy shadow: the safe leaf path cannot cast shadow-map shadows (a depth program for alpha-tested leaves
 * is exactly the shader class that crashed PowerVR), so the crown shadow is baked on the CPU instead, as optical depth
 * in a sun-aligned ground frame (texture u = sun azimuth, w = perpendicular; the decal plane is rotated to the azimuth
 * and sized to the footprint, so u and w have independent texel sizes).
 *
 * Deposit, then blur: every caster (a leaf clump per leafy node, samples along trunk and order ≤ 1 limbs) is projected
 * along the sun and adds its mass bilinearly to two of K blur-level layers, chosen by its penumbra sigma (own radius +
 * a term growing with the caster's height along the sun ray; the split between the two neighbouring levels matches the
 * variance exactly). The layers are then cascaded from the widest level down: add layer k, box-blur by the variance
 * step to level k-1 (sigma x `stretch` along u, which is a blob's elongated footprint at low sun). Cost is a fixed
 * ~26 sliding-sum passes over 256² instead of one exp per covered texel per caster.
 *
 * A contact ring darkens the trunk base, sun flecks are punched into moderately dense parts, world-anchored value noise
 * dapples it; opacity is capped at `strength`. Drawn as a transparent MeshBasicMaterial plane just above the ground
 * (dark colour x alpha). Branches stop casting shadow-map shadows on Low. Data-only for the GPU: texture pixels and
 * the plane transform.
 */
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
  private readonly K = 6;
  private readonly layers: Float32Array[] = [];
  private readonly colAcc: Float64Array;
  private readonly sig = new Float64Array(6);
  private readonly used = new Uint8Array(6);
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
    for (let k = 0; k < this.K; k++) this.layers.push(new Float32Array(S * S));
    this.colAcc = new Float64Array(S);
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
    if (!G || sim.nodes.length < 2) { this.mesh.visible = false; return; }
    const key = `${dir.x.toFixed(2)},${dir.y.toFixed(2)},${dir.z.toFixed(2)}`;
    const gap = time - this.lastT;
    if (key === this.key && (sim.lightVersion === this.ver || gap < minGap)) return;
    if (gap < 0.5) return;
    this.key = key;
    this.ver = sim.lightVersion;
    this.lastT = time;
    const t0 = performance.now();
    const S = this.S, K = this.K, sig = this.sig, layers = this.layers, used = this.used;
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
    const padW = G.cell + 1.5 * sMax, padU = G.cell + 1.5 * sMax * stretch;
    u0 -= padU; u1 += padU; w0 -= padW; w1 += padW;
    const extU = u1 - u0, extW = w1 - w0, toU = S / extU, toW = S / extW;
    // Blur levels: geometric sigmas (world units, w axis) from the pixel floor to the widest penumbra.
    const sMin = 0.6 / toW, ratio = Math.pow(Math.max(1.01, sMax / sMin), 1 / (K - 1));
    for (let k = 0; k < K; k++) { sig[k] = sMin * Math.pow(ratio, k); layers[k].fill(0); used[k] = 0; }
    const texel = toU * toW; // texels per m²: mass (tau·m²) → tau per texel
    /** Adds `mass` at world (wx, wy, wz) projected along the sun, to be blurred by gaussian sigma `s` (world, w axis). */
    const deposit = (wx: number, wy: number, wz: number, s: number, mass: number) => {
      const pu = (wx * ux + wz * uz + wy * slope - u0) * toU - 0.5, pw = (-wx * uz + wz * ux - w0) * toW - 0.5;
      if (!(pu >= 0 && pw >= 0 && pu < S - 1 && pw < S - 1)) return;
      let k = 0;
      while (k < K - 2 && s > sig[k + 1]) k++;
      const a = sig[k] * sig[k], b = sig[k + 1] * sig[k + 1];
      const f = Math.min(1, Math.max(0, (s * s - a) / (b - a)));
      const iu = pu | 0, iw = pw | 0, fu = pu - iu, fw = pw - iw, o = iw * S + iu, m = mass * texel;
      const w00 = (1 - fu) * (1 - fw), w10 = fu * (1 - fw), w01 = (1 - fu) * fw, w11 = fu * fw;
      if (f < 1) { const L = layers[k], v = m * (1 - f); L[o] += v * w00; L[o + 1] += v * w10; L[o + S] += v * w01; L[o + S + 1] += v * w11; used[k] = 1; }
      if (f > 0) { const L = layers[k + 1], v = m * f; L[o] += v * w00; L[o + 1] += v * w10; L[o + S] += v * w01; L[o + S + 1] += v * w11; used[k + 1] = 1; }
    };
    // Crown: one deposit per leafy node (the leaf clump) at its real position. Overlapping clumps under the dense core
    // build optical depth; gaps between clumps stay lighter. Mass = integral of the clump's gaussian footprint.
    const nodes = sim.nodes;
    let j = 1;
    const jr = () => { j = (j * 16807) % 2147483647; return j / 2147483647 - 0.5; };
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
        const steps = Math.max(1, Math.ceil((len * toW) / 1.2));
        const r = Math.max(sMin, b.radius * 0.8), m = v * r * r;
        for (let s = 0; s < steps; s++) {
          const t = (s + 0.5) / steps, y = a.wy + (b.wy - a.wy) * t;
          deposit(a.wx + (b.wx - a.wx) * t, y, a.wz + (b.wz - a.wz) * t, r + pen * (y / ly), m);
        }
      }
    }
    // Cascade from the widest level down: add the level's deposits, blur by the variance step to the next level.
    let cur = this.tau, oth = this.tmp, any = false;
    cur.fill(0);
    for (let k = K - 1; k >= 0; k--) {
      if (used[k]) { const L = layers[k]; for (let i = 0; i < S * S; i++) cur[i] += L[i]; any = true; }
      if (!any) continue;
      const dv = sig[k] * sig[k] - (k > 0 ? sig[k - 1] * sig[k - 1] : 0), extra = k === 0 ? 1 : 0, n = k === 0 ? 3 : 2;
      if (this.blur(cur, oth, dv * stretch * stretch * toU * toU + extra, true, n)) { const t = cur; cur = oth; oth = t; }
      if (this.blur(cur, oth, dv * toW * toW + extra, false, n)) { const t = cur; cur = oth; oth = t; }
    }
    const tau = cur, holes = oth;
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
    let f = 7;
    const fr = () => { f = (f * 48271) % 2147483647; return f / 2147483647; };
    const nF = Math.round(S * S / 90), fe = Math.min(2.2, stretch);
    for (let k = 0; k < nF; k++) {
      const gx = fr() * S, gz = fr() * S, t = tau[(gz | 0) * S + (gx | 0)];
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
    const px8 = this.img.data, noise = this.noise, NS = 15, dxu = (ux / toU) * NS, dzu = (uz / toU) * NS;
    for (let z = 0, i = 0; z < S; z++) {
      const ww = w0 + (z + 0.5) / toW, uu = u0 + 0.5 / toU;
      let nx = (uu * ux - ww * uz) * NS, nz = (uu * uz + ww * ux) * NS;
      const ez = Math.min(z, S - 1 - z);
      for (let x = 0; x < S; x++, i++, nx += dxu, nz += dzu) {
        const t = tau[i];
        let a8 = 0;
        if (t > 1e-4) {
          const nv = noise[((Math.floor(nz) & 255) << 8) | (Math.floor(nx) & 255)];
          const a = (1 - Math.exp(-t * (0.35 + 1.2 * nv * nv))) * strength * (1 - 0.8 * holes[i]);
          const e = Math.min(x, S - 1 - x, ez);
          a8 = Math.round(255 * Math.min(1, a) * Math.min(1, e / 4));
        }
        const p = i * 4;
        px8[p] = px8[p + 1] = px8[p + 2] = 255;
        px8[p + 3] = a8;
      }
    }
    this.ctx.putImageData(this.img, 0, 0);
    this.tex.needsUpdate = true;
    const uc = (u0 + u1) / 2, wc = (w0 + w1) / 2;
    this.mesh.position.set(uc * ux - wc * uz, 0.015, uc * uz + wc * ux);
    this.mesh.rotation.y = Math.atan2(-uz, ux); // local +x → U, local +z → W
    this.mesh.scale.set(extU, 1, extW);
    this.mesh.visible = true;
    this.lastMs = performance.now() - t0;
    if (this.lastMs > this.maxMs) this.maxMs = this.lastMs;
    this.bakes++;
  }

  /**
   * Gaussian blur of `src` along one axis with variance `v` (px²) by `n` sliding box passes (zero outside), ping-ponging
   * with `tmp`. Variances under 0.5 use one 3-tap pass. Returns true when the result ended up in `tmp`.
   */
  private blur(src: Float32Array, tmp: Float32Array, v: number, alongU: boolean, n: number): boolean {
    const S = this.S;
    if (v < 0.02) return false;
    let a = src, b = tmp, swapped = false;
    if (v <= 0.5) {
      const e = v / 2, c = 1 - v;
      if (alongU) for (let z = 0; z < S; z++) { const o = z * S; for (let x = 0; x < S; x++) b[o + x] = c * a[o + x] + e * ((x > 0 ? a[o + x - 1] : 0) + (x < S - 1 ? a[o + x + 1] : 0)); }
      else for (let z = 0; z < S; z++) { const o = z * S; for (let x = 0; x < S; x++) b[o + x] = c * a[o + x] + e * ((z > 0 ? a[o + x - S] : 0) + (z < S - 1 ? a[o + x + S] : 0)); }
      return true;
    }
    let wl = Math.floor(Math.sqrt((12 * v) / n + 1));
    if (wl % 2 === 0) wl--;
    const m = Math.round((12 * v - n * wl * wl - 4 * n * wl - 3 * n) / (-4 * wl - 4));
    const acc = this.colAcc;
    for (let p = 0; p < n; p++) {
      const R = Math.min(S >> 1, ((p < m ? wl : wl + 2) - 1) >> 1);
      if (R < 1) continue;
      const inv = 1 / (2 * R + 1);
      if (alongU) {
        for (let z = 0; z < S; z++) {
          const o = z * S;
          let s = 0;
          for (let x = 0; x < R; x++) s += a[o + x];
          for (let x = 0; x < S; x++) { if (x + R < S) s += a[o + x + R]; b[o + x] = s * inv; if (x >= R) s -= a[o + x - R]; }
        }
      } else {
        acc.fill(0);
        for (let z = 0; z < R; z++) { const o = z * S; for (let x = 0; x < S; x++) acc[x] += a[o + x]; }
        for (let z = 0; z < S; z++) {
          const o = z * S;
          if (z + R < S) { const q = o + R * S; for (let x = 0; x < S; x++) acc[x] += a[q + x]; }
          for (let x = 0; x < S; x++) b[o + x] = acc[x] * inv;
          if (z >= R) { const q = o - R * S; for (let x = 0; x < S; x++) acc[x] -= a[q + x]; }
        }
      }
      const t = a; a = b; b = t; swapped = !swapped;
    }
    return swapped;
  }
}

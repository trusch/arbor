import * as THREE from 'three';
import type { TreeSim } from '../sim/tree';

/**
 * Low-quality canopy shadow: the safe leaf path cannot cast shadow-map shadows (a depth program for alpha-tested leaves
 * is exactly the shader class that crashed PowerVR), so the crown shadow is baked on the CPU instead. Every leaf clump
 * (leafy node) is projected along the sun onto the ground as a soft gaussian splat of optical depth, stretched along the
 * sun azimuth at low sun; trunk and main limbs (order ≤ 1) add thin streaks, a contact ring darkens the trunk base; the
 * result is lightly blurred, noise-dappled, mapped to opacity capped at `strength` and drawn as a transparent
 * MeshBasicMaterial plane just above the ground (dark colour × alpha). Branches stop casting shadow-map shadows on Low.
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
  private key = '';
  private lastT = -1e9;
  private ver = -1;

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
    const S = this.S, tau = this.tau;
    tau.fill(0);
    const ly = Math.max(0.3, dir.y), px = dir.x / ly, pz = dir.z / ly;
    // Unit sun azimuth on the ground (shadows stretch along it by 1/ly at low sun).
    const hl = Math.hypot(dir.x, dir.z) || 1, ux = -dir.x / hl, uz = -dir.z / hl;
    const stretch = Math.min(2.5, 1 / ly);
    // Ground footprint: tree bbox projected along the sun.
    const mn = sim.bboxMin, mx = sim.bboxMax;
    let x0 = Math.min(mn[0], mn[0] - px * mx[1]), x1 = Math.max(mx[0], mx[0] - px * mx[1]);
    let z0 = Math.min(mn[2], mn[2] - pz * mx[1]), z1 = Math.max(mx[2], mx[2] - pz * mx[1]);
    const pad = G.cell * 2;
    x0 -= pad; x1 += pad; z0 -= pad; z1 += pad;
    const ext = Math.max(x1 - x0, z1 - z0), cx = (x0 + x1) / 2, cz = (z0 + z1) / 2;
    const toPx = S / ext;
    // Gaussian splat (sigma r), stretched along the sun azimuth by `el` (a blob's ground footprint at low sun).
    // Penumbra grows with the caster's distance to the ground along the sun ray (wy / ly); the splat keeps its integral.
    const splat = (wx: number, wy: number, wz: number, r: number, v: number, el = stretch, pen = 0.035) => {
      const gx = (wx - px * wy - cx) * toPx + S / 2, gz = (wz - pz * wy - cz) * toPx + S / 2;
      const r0 = Math.max(0.6, r * toPx), sp = r0 + pen * (wy / ly) * toPx, inv = 1 / (2 * sp * sp), ie = 1 / el;
      v *= (r0 * r0) / (sp * sp);
      const rp = 2.5 * sp * el;
      const ax = Math.max(0, Math.floor(gx - rp)), bx = Math.min(S - 1, Math.ceil(gx + rp));
      const az = Math.max(0, Math.floor(gz - rp)), bz = Math.min(S - 1, Math.ceil(gz + rp));
      for (let z = az; z <= bz; z++) for (let x = ax; x <= bx; x++) {
        const dx = x - gx, dz = z - gz;
        const u = (dx * ux + dz * uz) * ie, w = -dx * uz + dz * ux;
        const q = (u * u + w * w) * inv;
        if (q < 3.2) tau[z * S + x] += v * Math.exp(-q);
      }
    };
    // Crown: one soft splat per leafy node (the leaf clump) at its real position, projected along the sun. Overlapping
    // clumps under the dense core build optical depth; gaps between clumps stay as light flecks.
    const nodes = sim.nodes;
    let j = 1;
    const jr = () => { j = (j * 16807) % 2147483647; return j / 2147483647 - 0.5; };
    const clumpR = 0.12;
    for (let i = 1; i < nodes.length; i++) {
      const nd = nodes[i];
      if (!nd.leafy || sim.chains[nd.chain].pruned || nd.wdy < -0.75) continue;
      splat(nd.wx + jr() * 0.15, nd.wy, nd.wz + jr() * 0.15, clumpR * (0.8 + 0.5 * (jr() + 0.5)), 0.1);
    }
    // Trunk and main limbs: thin streaks.
    for (const ch of sim.chains) {
      if (ch.pruned || ch.order > 1) continue;
      for (let i = 1; i < ch.nodes.length; i++) {
        const a = nodes[ch.nodes[i - 1]], b = nodes[ch.nodes[i]];
        const len = Math.hypot(b.wx - a.wx, b.wy - a.wy, b.wz - a.wz);
        const steps = Math.max(1, Math.ceil((len * toPx) / 1.2));
        for (let s = 0; s < steps; s++) {
          const t = (s + 0.5) / steps;
          splat(a.wx + (b.wx - a.wx) * t, a.wy + (b.wy - a.wy) * t, a.wz + (b.wz - a.wz) * t, b.radius * 0.8, ch.order === 0 ? 1.2 : 0.6, 1);
        }
      }
    }
    // Contact darkening at the trunk base (ambient occlusion ring; on the ground, so not projected).
    const n0 = nodes[0], tr = Math.max(0.08, nodes[Math.min(1, nodes.length - 1)].radius);
    splat(n0.wx, 0, n0.wz, tr * 2.2, 1.4, 1, 0);
    splat(n0.wx, 0, n0.wz, tr * 5, 0.35, 1, 0);
    // One light separable box blur (penumbra), then dapple and map optical depth to opacity (cap = strength).
    const tmp = this.tmp, R = 1;
    for (let pass = 0; pass < 2; pass++) {
      for (let z = 0; z < S; z++) { let acc = 0; for (let x = -R; x < S + R; x++) { if (x + R < S) acc += tau[z * S + x + R]; if (x - R - 1 >= 0) acc -= tau[z * S + x - R - 1]; if (x >= 0 && x < S) tmp[z * S + x] = acc / (2 * R + 1); } }
      for (let x = 0; x < S; x++) { let acc = 0; for (let z = -R; z < S + R; z++) { if (z + R < S) acc += tmp[(z + R) * S + x]; if (z - R - 1 >= 0) acc -= tmp[(z - R - 1) * S + x]; if (z >= 0 && z < S) tau[z * S + x] = acc / (2 * R + 1); } }
    }
    // Sun flecks: small soft ellipses (stretched along the sun azimuth like the shadow) punched into the crown shadow
    // where it is only moderately dense (gaps between clumps), not under the trunk/core.
    const holes = this.tmp;
    holes.fill(0);
    let f = 7;
    const fr = () => { f = (f * 48271) % 2147483647; return f / 2147483647; };
    const nF = Math.round(S * S / 90), fe = Math.min(2.2, stretch);
    for (let k = 0; k < nF; k++) {
      const gx = fr() * S, gz = fr() * S, t = tau[(gz | 0) * S + (gx | 0)];
      if (t < 0.15 || t > 2.2) continue;
      const rp = 0.9 + 1.6 * fr(), inv = 1 / (rp * rp), w0 = 0.55 + 0.45 * fr(), ext2 = Math.ceil(rp * fe * 1.6);
      for (let z = Math.max(0, (gz | 0) - ext2); z <= Math.min(S - 1, (gz | 0) + ext2); z++) for (let x = Math.max(0, (gx | 0) - ext2); x <= Math.min(S - 1, (gx | 0) + ext2); x++) {
        const dx = x - gx, dz = z - gz, u = (dx * ux + dz * uz) / fe, w = -dx * uz + dz * ux;
        const q = (u * u + w * w) * inv;
        if (q < 2.5) holes[z * S + x] = Math.max(holes[z * S + x], w0 * Math.exp(-q));
      }
    }
    const px8 = this.img.data;
    for (let i = 0; i < S * S; i++) {
      const a = (1 - Math.exp(-tau[i] * (0.35 + 1.2 * this.noise[i] * this.noise[i]))) * strength * (1 - 0.8 * holes[i]);
      const e = Math.min(i % S, S - 1 - (i % S), Math.floor(i / S), S - 1 - Math.floor(i / S)); // fade to 0 at the border
      px8[i * 4] = px8[i * 4 + 1] = px8[i * 4 + 2] = 255;
      px8[i * 4 + 3] = Math.round(255 * Math.min(1, a) * Math.min(1, e / 4));
    }
    this.ctx.putImageData(this.img, 0, 0);
    this.tex.needsUpdate = true;
    this.mesh.position.set(cx, 0.015, cz);
    this.mesh.scale.set(ext, 1, ext);
    this.mesh.visible = true;
  }
}

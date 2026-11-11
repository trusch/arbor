import * as THREE from 'three';
import type { TreeSim } from '../sim/tree';

/**
 * Low-quality canopy shadow: the safe leaf path cannot cast shadow-map shadows (a depth program for alpha-tested leaves
 * is exactly the shader class that crashed PowerVR), so the crown shadow is baked on the CPU instead. Leafy-node density
 * from the sim light grid is projected along the sun onto the ground as optical depth, trunk and main limbs (order ≤ 1)
 * are stamped as discs along their segments, the result is blurred, dappled with noise and drawn as a transparent
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
    // Ground footprint: tree bbox projected along the sun.
    const mn = sim.bboxMin, mx = sim.bboxMax;
    let x0 = Math.min(mn[0], mn[0] - px * mx[1]), x1 = Math.max(mx[0], mx[0] - px * mx[1]);
    let z0 = Math.min(mn[2], mn[2] - pz * mx[1]), z1 = Math.max(mx[2], mx[2] - pz * mx[1]);
    const pad = G.cell * 2;
    x0 -= pad; x1 += pad; z0 -= pad; z1 += pad;
    const ext = Math.max(x1 - x0, z1 - z0), cx = (x0 + x1) / 2, cz = (z0 + z1) / 2;
    const toPx = S / ext;
    const splat = (wx: number, wy: number, wz: number, r: number, v: number) => {
      const gx = (wx - px * wy - cx) * toPx + S / 2, gz = (wz - pz * wy - cz) * toPx + S / 2;
      const rp = Math.max(0.7, r * toPx), r2 = rp * rp;
      const ax = Math.max(0, Math.floor(gx - rp)), bx = Math.min(S - 1, Math.ceil(gx + rp));
      const az = Math.max(0, Math.floor(gz - rp)), bz = Math.min(S - 1, Math.ceil(gz + rp));
      for (let z = az; z <= bz; z++) for (let x = ax; x <= bx; x++) {
        const d2 = (x - gx) ** 2 + (z - gz) ** 2;
        if (d2 <= r2) tau[z * S + x] += v * (1 - d2 / r2);
      }
    };
    // Crown: each leafy voxel as a few jittered splats; optical depth per leafy node chosen so a dense crown goes ~opaque.
    const { dens, ox, oy, oz, cell, nx, ny, nz } = G;
    let j = 1;
    const jr = () => { j = (j * 16807) % 2147483647; return j / 2147483647 - 0.5; };
    for (let y = 0; y < ny; y++) for (let z = 0; z < nz; z++) for (let x = 0; x < nx; x++) {
      const d = dens[(y * nz + z) * nx + x];
      if (d <= 0) continue;
      for (let k = 0; k < 4; k++) splat(ox + (x + 0.5 + jr()) * cell, oy + (y + 0.5 + jr()) * cell, oz + (z + 0.5 + jr()) * cell, cell * 0.85, d * 0.09);
    }
    // Trunk and main limbs.
    for (const ch of sim.chains) {
      if (ch.pruned || ch.order > 1) continue;
      for (let i = 1; i < ch.nodes.length; i++) {
        const a = sim.nodes[ch.nodes[i - 1]], b = sim.nodes[ch.nodes[i]];
        const len = Math.hypot(b.wx - a.wx, b.wy - a.wy, b.wz - a.wz);
        const steps = Math.max(1, Math.ceil((len * toPx) / 1.5));
        for (let s = 0; s < steps; s++) {
          const t = (s + 0.5) / steps;
          splat(a.wx + (b.wx - a.wx) * t, a.wy + (b.wy - a.wy) * t, a.wz + (b.wz - a.wz) * t, b.radius * 1.4, 1.6);
        }
      }
    }
    // Separable box blur ×2 (soft penumbra), then dapple and write alpha.
    const tmp = this.tmp, R = 3;
    for (let pass = 0; pass < 2; pass++) {
      for (let z = 0; z < S; z++) { let acc = 0; for (let x = -R; x < S + R; x++) { if (x + R < S) acc += tau[z * S + x + R]; if (x - R - 1 >= 0) acc -= tau[z * S + x - R - 1]; if (x >= 0 && x < S) tmp[z * S + x] = acc / (2 * R + 1); } }
      for (let x = 0; x < S; x++) { let acc = 0; for (let z = -R; z < S + R; z++) { if (z + R < S) acc += tmp[(z + R) * S + x]; if (z - R - 1 >= 0) acc -= tmp[(z - R - 1) * S + x]; if (z >= 0 && z < S) tau[z * S + x] = acc / (2 * R + 1); } }
    }
    const px8 = this.img.data;
    for (let i = 0; i < S * S; i++) {
      const a = (1 - Math.exp(-tau[i] * (0.6 + 0.6 * this.noise[i]))) * strength;
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

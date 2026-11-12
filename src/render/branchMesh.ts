import * as THREE from 'three';
import type { TreeSim } from '../sim/tree';
import type { BarkTextures } from './textures';
import { tel } from '../tel';

const BARK_V_SCALE = 0.35; // metres of length per texture repeat (scaled by radius)

/**
 * Tapered generalized-cylinder mesh for all chains. Each chain is one tube
 * with parallel-transported frames; buffers are reused and grown by doubling.
 */
export class BranchMesh {
  mesh: THREE.Mesh;
  private geo = new THREE.BufferGeometry();
  private pos = new Float32Array(0);
  private nrm = new Float32Array(0);
  private uv = new Float32Array(0);
  private idx = new Uint32Array(0);
  /** Rest positions of the last full `update` and the node id of every vertex (for `applyOffsets`). */
  private rest = new Float32Array(0);
  private vNode = new Int32Array(0);
  private vUsed = 0;
  private lastTopology = -1;
  private ringCache = new Map<number, { c: Float32Array; s: Float32Array }>();

  /** Pass the bark textures, or an existing bark material to share (debris: same program, P-BARK). */
  constructor(bark: BarkTextures | THREE.Material) {
    const mat = bark instanceof THREE.Material ? bark : new THREE.MeshStandardMaterial({
      map: bark.map,
      normalMap: bark.normalMap,
      normalScale: new THREE.Vector2(1.4, 1.4),
      roughnessMap: bark.roughnessMap,
      roughness: 1,
      metalness: 0,
    });
    this.mesh = new THREE.Mesh(this.geo, mat);
    this.mesh.castShadow = true;
    this.mesh.receiveShadow = true;
    this.mesh.frustumCulled = false;
  }

  private ring(R: number) {
    let r = this.ringCache.get(R);
    if (!r) {
      const c = new Float32Array(R + 1), s = new Float32Array(R + 1);
      for (let j = 0; j <= R; j++) {
        c[j] = Math.cos((j / R) * Math.PI * 2);
        s[j] = Math.sin((j / R) * Math.PI * 2);
      }
      this.ringCache.set(R, (r = { c, s }));
    }
    return r;
  }

  private static radial(order: number, r: number) {
    if (r > 0.08) return 16;
    if (r > 0.03) return 10;
    if (order <= 2 || r > 0.012) return 7;
    return 5;
  }

  /** `off`: optional per-node offsets (3 floats per node id, `Sway.D`) added to the rest positions. */
  update(sim: TreeSim, flare = 1, off: Float32Array | null = null) {
    const nodes = sim.nodes;
    const chains = sim.chains;
    // Count.
    let vCount = 0, iCount = 0, sig = chains.length;
    const radials: number[] = new Array(chains.length);
    for (let c = 0; c < chains.length; c++) {
      const ch = chains[c];
      const m = ch.nodes.length;
      if (m < 2 || ch.pruned) { radials[c] = 0; continue; }
      const R = BranchMesh.radial(ch.order, nodes[ch.nodes[1]].radius);
      radials[c] = R;
      sig = (sig * 31 + R * m) | 0;
      const rings = m + 1; // +1 tip cap ring
      vCount += rings * (R + 1);
      iCount += (rings - 1) * R * 6;
    }
    let realloc = false;
    if (vCount * 3 > this.pos.length) {
      const cap = Math.max(1024, vCount * 2);
      this.pos = new Float32Array(cap * 3);
      this.nrm = new Float32Array(cap * 3);
      this.uv = new Float32Array(cap * 2);
      this.rest = new Float32Array(cap * 3);
      this.vNode = new Int32Array(cap);
      realloc = true;
    }
    if (iCount > this.idx.length) {
      this.idx = new Uint32Array(Math.max(4096, iCount * 2));
      realloc = true;
    }
    if (realloc) {
      tel.log('branch_realloc', { verts: vCount, idx: iCount, vCap: this.pos.length / 3, iCap: this.idx.length });
      this.geo.dispose();
      this.geo.setAttribute('position', new THREE.BufferAttribute(this.pos, 3).setUsage(THREE.DynamicDrawUsage));
      this.geo.setAttribute('normal', new THREE.BufferAttribute(this.nrm, 3).setUsage(THREE.DynamicDrawUsage));
      this.geo.setAttribute('uv', new THREE.BufferAttribute(this.uv, 2).setUsage(THREE.DynamicDrawUsage));
      this.geo.setIndex(new THREE.BufferAttribute(this.idx, 1).setUsage(THREE.DynamicDrawUsage));
      this.lastTopology = -1;
    }
    const writeIndex = sig !== this.lastTopology;

    const P = this.pos, Nn = this.nrm, UV = this.uv, I = this.idx, VN = this.vNode;
    let v = 0, ii = 0;
    let nx = 0, ny = 0, nz = 0; // transported normal
    for (let c = 0; c < chains.length; c++) {
      const R = radials[c];
      if (!R) continue;
      const ids = chains[c].nodes;
      const m = ids.length;
      const { c: cs, s: sn } = this.ring(R);
      const baseR = nodes[ids[1]].radius;
      const uRep = Math.max(1, Math.round((Math.PI * 2 * baseR) / 0.12));
      const vScale = 1 / (BARK_V_SCALE * Math.max(0.3, Math.min(2, baseR / 0.05 + 0.3)));
      let along = 0;
      const vStart = v;
      let px = 0, py = 0, pz = 0;
      for (let k = 0; k <= m; k++) {
        // Ring centre/radius; k === m is the closing tip cap.
        const kk = Math.min(k, m - 1);
        const nd = nodes[ids[kk]];
        let cx = nd.wx, cy = nd.wy, cz = nd.wz;
        let r = k === 0 ? nodes[ids[1]].radius : nd.radius;
        // Tangent: central difference, one-sided at ends.
        const ia = ids[Math.max(0, kk - 1)], ib = ids[Math.min(m - 1, kk + 1)];
        const a = nodes[ia], b = nodes[ib];
        let tx = b.wx - a.wx, ty = b.wy - a.wy, tz = b.wz - a.wz;
        if (off) {
          const oc = ids[kk] * 3, oa = ia * 3, ob = ib * 3;
          cx += off[oc]; cy += off[oc + 1]; cz += off[oc + 2];
          tx += off[ob] - off[oa]; ty += off[ob + 1] - off[oa + 1]; tz += off[ob + 2] - off[oa + 2];
        }
        let tl = Math.hypot(tx, ty, tz);
        if (tl < 1e-7) { tx = nd.wdx; ty = nd.wdy; tz = nd.wdz; tl = 1; }
        tx /= tl; ty /= tl; tz /= tl;
        // Root flare: trunk widens toward the ground with buttress lobes.
        let lobe = 0;
        if (c === 0 && flare > 0) {
          const f = flare * Math.exp(-Math.max(0, cy) / Math.max(0.15, r * 3));
          r *= 1 + 0.9 * f;
          lobe = 0.22 * f;
        }
        if (k === m) {
          cx += tx * r * 1.5; cy += ty * r * 1.5; cz += tz * r * 1.5;
          r = 0;
        }
        if (k === 0) {
          // Initial frame normal: any perpendicular.
          if (Math.abs(ty) < 0.9) { nx = -tz; ny = 0; nz = tx; } else { nx = 1; ny = 0; nz = 0; }
        } else {
          along += Math.hypot(cx - px, cy - py, cz - pz);
        }
        // Parallel transport: project previous normal onto the plane of t.
        const d = nx * tx + ny * ty + nz * tz;
        nx -= tx * d; ny -= ty * d; nz -= tz * d;
        let nl = Math.hypot(nx, ny, nz);
        if (nl < 1e-6) { if (Math.abs(ty) < 0.9) { nx = -tz; ny = 0; nz = tx; } else { nx = 1; ny = 0; nz = 0; } nl = Math.hypot(nx, ny, nz); }
        nx /= nl; ny /= nl; nz /= nl;
        const bx = ty * nz - tz * ny, by = tz * nx - tx * nz, bz = tx * ny - ty * nx;
        px = cx; py = cy; pz = cz;
        const vv = along * vScale;
        for (let j = 0; j <= R; j++) {
          const ox = cs[j] * nx + sn[j] * bx, oy = cs[j] * ny + sn[j] * by, oz = cs[j] * nz + sn[j] * bz;
          const o3 = v * 3;
          const rr = lobe > 0 ? r * (1 + lobe * Math.cos(j / R * Math.PI * 10)) : r;
          P[o3] = cx + ox * rr; P[o3 + 1] = cy + oy * rr; P[o3 + 2] = cz + oz * rr;
          Nn[o3] = ox; Nn[o3 + 1] = oy; Nn[o3 + 2] = oz;
          UV[v * 2] = (j / R) * uRep; UV[v * 2 + 1] = vv;
          VN[v] = ids[kk];
          v++;
        }
      }
      if (writeIndex) {
        const rings = m + 1;
        for (let k = 0; k < rings - 1; k++) {
          const r0 = vStart + k * (R + 1), r1 = r0 + R + 1;
          for (let j = 0; j < R; j++) {
            I[ii++] = r0 + j; I[ii++] = r1 + j; I[ii++] = r0 + j + 1;
            I[ii++] = r0 + j + 1; I[ii++] = r1 + j; I[ii++] = r1 + j + 1;
          }
        }
      }
    }
    this.vUsed = off ? 0 : v;
    if (!off) this.rest.set(P.subarray(0, v * 3));
    const g = this.geo;
    (g.attributes.position as THREE.BufferAttribute).needsUpdate = true;
    (g.attributes.normal as THREE.BufferAttribute).needsUpdate = true;
    (g.attributes.uv as THREE.BufferAttribute).needsUpdate = true;
    if (writeIndex) {
      g.index!.clearUpdateRanges();
      g.index!.addUpdateRange(0, ii);
      g.index!.needsUpdate = true;
      this.lastTopology = sig;
    }
    (g.attributes.position as THREE.BufferAttribute).clearUpdateRanges();
    (g.attributes.position as THREE.BufferAttribute).addUpdateRange(0, v * 3);
    (g.attributes.normal as THREE.BufferAttribute).clearUpdateRanges();
    (g.attributes.normal as THREE.BufferAttribute).addUpdateRange(0, v * 3);
    (g.attributes.uv as THREE.BufferAttribute).clearUpdateRanges();
    (g.attributes.uv as THREE.BufferAttribute).addUpdateRange(0, v * 2);
    g.setDrawRange(0, iCount);
  }

  /**
   * Cheap wind pose (Low): every vertex = its rest position + the offset of its ring's node (`Sway.D`). Translation
   * per ring only (normals and uvs keep their rest values), one position upload, no index work. Needs a full
   * `update(sim, flare)` without offsets first; returns false when there is none to build on.
   */
  applyOffsets(off: Float32Array): boolean {
    const n = this.vUsed;
    if (n === 0) return false;
    const P = this.pos, R = this.rest, VN = this.vNode;
    for (let v = 0, o = 0; v < n; v++, o += 3) {
      const q = VN[v] * 3;
      P[o] = R[o] + off[q]; P[o + 1] = R[o + 1] + off[q + 1]; P[o + 2] = R[o + 2] + off[q + 2];
    }
    const a = this.geo.attributes.position as THREE.BufferAttribute;
    a.clearUpdateRanges();
    a.addUpdateRange(0, n * 3);
    a.needsUpdate = true;
    return true;
  }
}

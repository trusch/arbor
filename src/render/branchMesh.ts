import * as THREE from 'three';
import type { TreeSim } from '../sim/tree';
import type { BarkTextures } from './textures';
import { tel } from '../tel';

const BARK_V_SCALE = 0.35; // metres of length per texture repeat (scaled by radius)
/** Upload runs closer than this many vertices are merged into one `bufferSubData`. */
const GAP = 2048;

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

  // Chain ranges (big tree P3, T3): every chain owns a fixed vertex range [cV, cV + cVc) and index range
  // [cI, cI + cIc) with slack for growth; a rebuild rewrites only the chains whose inputs changed (a node of the chain
  // moved, thickened or turned, its ring count or radial count changed) and uploads only their ranges. Index slots a
  // chain does not use are degenerate (0, 0, 0) triangles; slack vertices are never indexed. A chain that outgrows its
  // range or changes its radial count moves to the end; the layout is rebuilt (dense, fresh slack) when the waste
  // passes half the buffer, on buffer growth, on `flare` change and when chains or nodes shrank (reset).
  private cV = new Int32Array(0); private cVc = new Int32Array(0); private cI = new Int32Array(0); private cIc = new Int32Array(0);
  private cR = new Int32Array(0); private cM = new Int32Array(0); private cA = new Int32Array(0); private cB = new Int32Array(0);
  private nC = 0; private vEnd = 0; private iEnd = 0; private vLive = 0;
  /** Node inputs of the last write (wx, wy, wz, radius, wdx, wdy, wdz per node id) and the per-node dirty flag. */
  private nCache = new Float64Array(0); private nDirty = new Uint8Array(0); private nN = 0;
  private lastFlare = NaN;
  /** Positions currently hold offsets (`applyOffsets`), not the rest pose. */
  private swayed = false;
  /** Stats of the last `update`: chains rewritten, of chains drawn; vertices written; full layout or not. */
  stats = { chains: 0, written: 0, verts: 0, layout: false, ranges: 0 };
  /** Debug: rewrite every chain in place on the next update (the reference for `rebuildCheck`). */
  private forceAll = false;

  private static slack(rings: number) { return rings + Math.max(3, Math.ceil(rings * 0.5)); }

  /** `off`: optional per-node offsets (3 floats per node id, `Sway.D`) added to the rest positions. */
  update(sim: TreeSim, flare = 1, off: Float32Array | null = null) {
    const nodes = sim.nodes, chains = sim.chains, N = nodes.length, C = chains.length;
    // Node change detection (exact: a node is dirty when any input the rings read differs by value).
    if (this.nCache.length < N * 7) {
      const cap = Math.ceil(N * 1.5) + 256, nc = new Float64Array(cap * 7), nd = new Uint8Array(cap);
      nc.set(this.nCache.subarray(0, this.nN * 7)); this.nCache = nc; this.nDirty = nd;
    }
    const NC = this.nCache, ND = this.nDirty;
    let layout = !(this.nC > 0) || C < this.nC || N < this.nN || flare !== this.lastFlare || off !== null;
    for (let i = 0, o = 0; i < N; i++, o += 7) {
      const n = nodes[i];
      if (i >= this.nN || NC[o] !== n.wx || NC[o + 1] !== n.wy || NC[o + 2] !== n.wz || NC[o + 3] !== n.radius || NC[o + 4] !== n.wdx || NC[o + 5] !== n.wdy || NC[o + 6] !== n.wdz) {
        NC[o] = n.wx; NC[o + 1] = n.wy; NC[o + 2] = n.wz; NC[o + 3] = n.radius; NC[o + 4] = n.wdx; NC[o + 5] = n.wdy; NC[o + 6] = n.wdz;
        ND[i] = 1;
      } else ND[i] = 0;
    }
    this.nN = N;
    if (this.cV.length < C) {
      const cap = Math.ceil(C * 1.5) + 64, grow = (a: Int32Array) => { const b = new Int32Array(cap); b.set(a.subarray(0, this.nC)); return b; };
      this.cV = grow(this.cV); this.cVc = grow(this.cVc); this.cI = grow(this.cI); this.cIc = grow(this.cIc);
      this.cR = grow(this.cR); this.cM = grow(this.cM); this.cA = grow(this.cA); this.cB = grow(this.cB);
    }
    // Plan: which chains change and where they go.
    const radials: number[] = new Array(C);
    let vNeed = 0, iNeed = 0, vLive = 0, iLive = 0;
    for (let c = 0; c < C; c++) {
      const ch = chains[c], m = ch.nodes.length;
      const R = m < 2 || ch.pruned ? 0 : BranchMesh.radial(ch.order, nodes[ch.nodes[1]].radius);
      radials[c] = R;
      if (!R) continue;
      const rings = m + 1;
      vLive += rings * (R + 1); iLive += (rings - 1) * R * 6;
      const rc = BranchMesh.slack(rings);
      vNeed += rc * (R + 1); iNeed += (rc - 1) * R * 6;
    }
    // Append space needed by chains that do not fit their range.
    let vApp = 0, iApp = 0;
    if (!layout) {
      for (let c = 0; c < C; c++) {
        const R = radials[c];
        if (!R) continue;
        const m = chains[c].nodes.length, rings = m + 1;
        if (c >= this.nC || this.cR[c] !== R || rings * (R + 1) > this.cVc[c] || (rings - 1) * R * 6 > this.cIc[c]) {
          const rc = BranchMesh.slack(rings); vApp += rc * (R + 1); iApp += (rc - 1) * R * 6;
        }
      }
      const vTot = this.vEnd + vApp, iTot = this.iEnd + iApp;
      if (vTot * 3 > this.pos.length || iTot > this.idx.length || vTot > 2 * vLive + 4096) layout = true;
    }
    let realloc = false;
    if (layout && (vNeed * 3 > this.pos.length || iNeed > this.idx.length)) {
      const vc = Math.max(1024, Math.ceil(vNeed * 1.5)), ic = Math.max(4096, Math.ceil(iNeed * 1.5));
      if (vc * 3 > this.pos.length) {
        this.pos = new Float32Array(vc * 3); this.nrm = new Float32Array(vc * 3); this.uv = new Float32Array(vc * 2);
        this.rest = new Float32Array(vc * 3); this.vNode = new Int32Array(vc);
      }
      if (ic > this.idx.length) this.idx = new Uint32Array(ic);
      realloc = true;
      tel.log('branch_realloc', { verts: vLive, idx: iLive, vCap: this.pos.length / 3, iCap: this.idx.length });
      this.geo.dispose();
      this.geo.setAttribute('position', new THREE.BufferAttribute(this.pos, 3).setUsage(THREE.DynamicDrawUsage));
      this.geo.setAttribute('normal', new THREE.BufferAttribute(this.nrm, 3).setUsage(THREE.DynamicDrawUsage));
      this.geo.setAttribute('uv', new THREE.BufferAttribute(this.uv, 2).setUsage(THREE.DynamicDrawUsage));
      this.geo.setIndex(new THREE.BufferAttribute(this.idx, 1).setUsage(THREE.DynamicDrawUsage));
    }
    if (layout) {
      // Dense layout with fresh slack, chain order.
      let v = 0, ii = 0;
      for (let c = 0; c < C; c++) {
        const R = radials[c];
        this.cR[c] = R;
        if (!R) { this.cV[c] = v; this.cVc[c] = 0; this.cI[c] = ii; this.cIc[c] = 0; this.cM[c] = 0; continue; }
        const rc = BranchMesh.slack(chains[c].nodes.length + 1);
        this.cV[c] = v; this.cVc[c] = rc * (R + 1); this.cI[c] = ii; this.cIc[c] = (rc - 1) * R * 6;
        v += this.cVc[c]; ii += this.cIc[c];
        this.cM[c] = -1; // force write
      }
      this.vEnd = v; this.iEnd = ii;
      this.idx.fill(0, 0, ii); this.vNode.fill(0, 0, v);
      this.nC = C;
    }
    const P = this.pos, Nn = this.nrm, UV = this.uv, I = this.idx, VN = this.vNode, REST = this.rest;
    const keepRest = off === null;
    // Ranges written this update (vertex start, count, index start, count), merged later.
    const wr: number[] = [];
    let written = 0, wverts = 0, drawn = 0;
    let nx = 0, ny = 0, nz = 0; // transported normal
    for (let c = 0; c < C; c++) {
      const R = radials[c], ids = chains[c].nodes, m = ids.length;
      if (!R) {
        if (c < this.nC && this.cR[c] && this.cIc[c]) { I.fill(0, this.cI[c], this.cI[c] + this.cIc[c]); wr.push(-1, 0, this.cI[c], this.cIc[c]); }
        this.cR[c] = 0; this.cM[c] = 0; if (c >= this.nC) { this.cVc[c] = 0; this.cIc[c] = 0; }
        continue;
      }
      drawn++;
      const rings = m + 1;
      let moved = false;
      if (c >= this.nC || this.cR[c] !== R || rings * (R + 1) > this.cVc[c] || (rings - 1) * R * 6 > this.cIc[c]) {
        // Relocate to the end with fresh slack; the old index range becomes degenerate.
        if (c < this.nC && this.cIc[c]) { I.fill(0, this.cI[c], this.cI[c] + this.cIc[c]); wr.push(-1, 0, this.cI[c], this.cIc[c]); }
        const rc = BranchMesh.slack(rings);
        this.cV[c] = this.vEnd; this.cVc[c] = rc * (R + 1); this.cI[c] = this.iEnd; this.cIc[c] = (rc - 1) * R * 6;
        this.vEnd += this.cVc[c]; this.iEnd += this.cIc[c];
        this.cR[c] = R; moved = true;
      }
      const reIndex = moved || this.cM[c] !== m || this.cA[c] !== ids[1] || this.cB[c] !== ids[m - 1];
      let dirty = reIndex || this.forceAll || layout;
      if (!dirty) for (let k = 0; k < m; k++) if (ND[ids[k]]) { dirty = true; break; }
      if (!dirty) continue;
      written++;
      const vStart = this.cV[c];
      let v = vStart;
      const { c: cs, s: sn } = this.ring(R);
      const baseR = nodes[ids[1]].radius;
      const uRep = Math.max(1, Math.round((Math.PI * 2 * baseR) / 0.12));
      const vScale = 1 / (BARK_V_SCALE * Math.max(0.3, Math.min(2, baseR / 0.05 + 0.3)));
      let along = 0;
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
          const qx = cx + ox * rr, qy = cy + oy * rr, qz = cz + oz * rr;
          P[o3] = qx; P[o3 + 1] = qy; P[o3 + 2] = qz;
          if (keepRest) { REST[o3] = qx; REST[o3 + 1] = qy; REST[o3 + 2] = qz; }
          Nn[o3] = ox; Nn[o3 + 1] = oy; Nn[o3 + 2] = oz;
          UV[v * 2] = (j / R) * uRep; UV[v * 2 + 1] = vv;
          VN[v] = ids[kk];
          v++;
        }
      }
      wverts += v - vStart;
      let iCnt = 0;
      if (reIndex || layout) {
        let ii = this.cI[c];
        for (let k = 0; k < rings - 1; k++) {
          const r0 = vStart + k * (R + 1), r1 = r0 + R + 1;
          for (let j = 0; j < R; j++) {
            I[ii++] = r0 + j; I[ii++] = r1 + j; I[ii++] = r0 + j + 1;
            I[ii++] = r0 + j + 1; I[ii++] = r1 + j; I[ii++] = r1 + j + 1;
          }
        }
        I.fill(0, ii, this.cI[c] + this.cIc[c]);
        iCnt = this.cIc[c];
        this.cM[c] = m; this.cA[c] = ids[1]; this.cB[c] = ids[m - 1];
      }
      wr.push(vStart, v - vStart, iCnt ? this.cI[c] : -1, iCnt);
    }
    if (C > this.nC) this.nC = C;
    this.lastFlare = flare;
    this.forceAll = false;
    this.vLive = vLive;
    // Positions of clean chains still hold the last wind pose: back to rest (the caller re-applies offsets if live).
    const fullPos = layout || realloc || (this.swayed && keepRest);
    if (this.swayed && keepRest) { P.set(REST.subarray(0, this.vEnd * 3)); this.swayed = false; }
    this.vUsed = keepRest ? this.vEnd : 0;
    if (!keepRest) this.nN = 0; // offsets went into the buffers: next update rewrites everything
    // Upload: merge ranges closer than GAP vertices (one bufferSubData per run).
    const g = this.geo;
    const pa = g.attributes.position as THREE.BufferAttribute, na = g.attributes.normal as THREE.BufferAttribute, ua = g.attributes.uv as THREE.BufferAttribute, ia = g.index!;
    pa.clearUpdateRanges(); na.clearUpdateRanges(); ua.clearUpdateRanges(); ia.clearUpdateRanges();
    let nr = 0;
    if (layout || realloc) {
      pa.addUpdateRange(0, this.vEnd * 3); na.addUpdateRange(0, this.vEnd * 3); ua.addUpdateRange(0, this.vEnd * 2); ia.addUpdateRange(0, this.iEnd);
      nr = 1;
    } else {
      const vr: number[] = [], ir: number[] = [];
      for (let k = 0; k < wr.length; k += 4) { if (wr[k] >= 0 && wr[k + 1] > 0) vr.push(wr[k], wr[k + 1]); if (wr[k + 2] >= 0 && wr[k + 3] > 0) ir.push(wr[k + 2], wr[k + 3]); }
      const merge = (rs: number[], gap: number, add: (s: number, n: number) => void) => {
        if (!rs.length) return;
        const ord: number[] = []; for (let k = 0; k < rs.length; k += 2) ord.push(k);
        ord.sort((a, b) => rs[a] - rs[b]);
        let s = rs[ord[0]], e = s + rs[ord[0] + 1];
        for (let q = 1; q < ord.length; q++) {
          const a = rs[ord[q]], b = a + rs[ord[q] + 1];
          if (a <= e + gap) { if (b > e) e = b; } else { add(s, e - s); nr++; s = a; e = b; }
        }
        add(s, e - s); nr++;
      };
      merge(vr, GAP, (s, n) => { if (!fullPos) pa.addUpdateRange(s * 3, n * 3); na.addUpdateRange(s * 3, n * 3); ua.addUpdateRange(s * 2, n * 2); });
      if (fullPos) pa.addUpdateRange(0, this.vEnd * 3);
      merge(ir, GAP * 6, (s, n) => ia.addUpdateRange(s, n));
    }
    if (pa.updateRanges.length) pa.needsUpdate = true;
    if (na.updateRanges.length) { na.needsUpdate = true; ua.needsUpdate = true; }
    if (ia.updateRanges.length) ia.needsUpdate = true;
    g.setDrawRange(0, this.iEnd);
    this.stats.chains = drawn; this.stats.written = written; this.stats.verts = wverts; this.stats.layout = layout; this.stats.ranges = nr;
  }

  /**
   * Debug (P3 gate): rewrite every chain in place from the current sim state and compare position, normal, uv, index
   * and rest buffers with what the incremental updates had left. Returns the number of differing values per buffer
   * (all 0 = bit-equal) and the triangle count. Call on a tree whose `update` just ran (no offsets applied since).
   */
  rebuildCheck(sim: TreeSim, flare = 1) {
    const n3 = this.vEnd * 3, n2 = this.vEnd * 2, ni = this.iEnd;
    const P0 = this.pos.slice(0, n3), N0 = this.nrm.slice(0, n3), U0 = this.uv.slice(0, n2), I0 = this.idx.slice(0, ni), R0 = this.rest.slice(0, n3);
    const sw = this.swayed;
    this.forceAll = true;
    this.update(sim, flare);
    const diff = (a: ArrayLike<number>, b: ArrayLike<number>) => { let d = 0; for (let i = 0; i < a.length; i++) if (!Object.is(a[i], b[i])) d++; return d; };
    // Positions are compared with the rest copy when the caller had applied offsets after the last update.
    const out = { pos: diff(sw ? R0 : P0, this.pos.subarray(0, n3)), nrm: diff(N0, this.nrm.subarray(0, n3)), uv: diff(U0, this.uv.subarray(0, n2)),
      idx: diff(I0, this.idx.subarray(0, ni)), rest: diff(R0, this.rest.subarray(0, n3)), verts: this.vEnd, tris: 0, layoutEnd: [this.vEnd, this.iEnd] };
    for (let i = 0; i < ni; i += 3) if (this.idx[i] !== this.idx[i + 1]) out.tris++;
    return out;
  }

  /** Drawn triangles (position, normal, uv per corner) in chain order, degenerate slots skipped: layout-independent. */
  triangleSoup(): Float32Array {
    const I = this.idx, P = this.pos, Nn = this.nrm, U = this.uv, out: number[] = [];
    for (let c = 0; c < this.nC; c++) {
      if (!this.cR[c]) continue;
      for (let i = this.cI[c], e = i + this.cIc[c]; i < e; i += 3) {
        if (I[i] === I[i + 1] && I[i] === I[i + 2]) continue;
        for (let k = 0; k < 3; k++) { const v = I[i + k] - this.cV[c]; const w = I[i + k]; out.push(v, P[w * 3], P[w * 3 + 1], P[w * 3 + 2], Nn[w * 3], Nn[w * 3 + 1], Nn[w * 3 + 2], U[w * 2], U[w * 2 + 1]); }
      }
    }
    return Float32Array.from(out);
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
    this.swayed = true;
    return true;
  }
}

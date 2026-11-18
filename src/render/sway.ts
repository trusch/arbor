import type { TreeSim } from '../sim/tree';
import type { Wind } from '../wind';

/**
 * Wind motion of the wood (render-side, no three import, no sim feedback). Every update derives a displacement per
 * node from the REST pose (`TreeNode.w*`), the wind and the wind clock; nothing accumulates, so zero wind is exactly
 * the rest pose. The sim fields are never written: break rule, light grid, canopy shadow and meadow shade keep
 * reading rest geometry.
 *
 * Model: a bend cascade. Each chain gets one force vector F (downwind lean from the travelling gust at the chain
 * base, slightly lagged, plus an own-phase oscillation along, across and vertical); each segment adds a small
 * rotation `(s^ x F) * len * flex(radius)` to the rotation inherited from its parent, and the node offset is the
 * parent's offset plus the rotated segment minus the rest segment. Thick wood barely turns, thin wood turns a lot,
 * child chains start from their branch point's rotation and offset, so junctions cannot tear.
 */
export class Sway {
  /** Offset per node id (x, y, z), metres. All zero while `live` is false. */
  D = new Float32Array(0);
  /** Parent id per node (for leaf interpolation along the segment). */
  P = new Int32Array(0);
  /** True while D holds a non-zero pose. */
  live = false;
  /** Largest offset of the last update (m) and the node it belongs to. */
  maxOffset = 0;
  maxNode = -1;
  lastMs = 0;
  private TH = new Float32Array(0);
  private F = new Float32Array(0);
  private S = new Float32Array(0);
  private K = new Float32Array(0);
  private C = new Int32Array(0);
  /** Rotation limit per node (rad) and scratch (flex-weighted path length below the node). */
  private CAP = new Float32Array(0);
  private W = new Float32Array(0);
  private cTime = NaN; private cTopo = -1; private cN = -1;
  /**
   * Two rates (big tree P4 / T5). Thick wood (radius > `THICK_R` on a thick parent) is evaluated every update. Thin
   * wood is drawn as its thick anchor's CURRENT offset (`A` = nearest thick ancestor) plus an offset relative to that
   * anchor, interpolated between the last two complete keys (`R0` -> `R1`); the next key (`RN`, with its raw
   * rotations `TN`) is computed in `RATE` slices by node id, one slice per update, so no update pays the whole thin
   * cascade and junctions cannot tear (a thin node's relative offset is 0 at its anchor by construction).
   */
  private A = new Int32Array(0);
  private R0 = new Float32Array(0); private R1 = new Float32Array(0); private RN = new Float32Array(0);
  private TN = new Float32Array(0);
  private slice = 0; private keys = 0; private thin = 0; private cyN = 0;
  /** Update counter inside the current key cycle and how many thin nodes the last update evaluated (stats). */
  stats = { thick: 0, thin: 0, evaluated: 0, keys: 0 };
  /** Two-rate switch (`?swayrate=1` = every node every update, the reference). */
  twoRate = true;

  /**
   * Recompute D. Returns true when the pose changed (moving, or it just returned to rest and consumers must draw
   * the rest pose once more).
   */
  update(sim: TreeSim, wind: Wind, amount: number): boolean {
    const nodes = sim.nodes, chains = sim.chains, N = nodes.length;
    if (!(amount > 0) || !(wind.base > 0) || N === 0) {
      this.keys = 0; this.slice = 0;
      if (!this.live) return false;
      this.D.fill(0); this.live = false; this.maxOffset = 0; this.maxNode = -1;
      return true;
    }
    const t0 = performance.now();
    if (this.D.length < N * 3) {
      const cap = Math.ceil(N * 1.5) + 256;
      this.D = new Float32Array(cap * 3); this.TH = new Float32Array(cap * 3); this.P = new Int32Array(cap);
      this.A = new Int32Array(cap); this.R0 = new Float32Array(cap * 3); this.R1 = new Float32Array(cap * 3);
      this.RN = new Float32Array(cap * 3); this.TN = new Float32Array(cap * 3); this.keys = 0; this.slice = 0;
    }
    if (this.F.length < chains.length * 3) this.F = new Float32Array((chains.length * 2 + 64) * 3);
    const D = this.D, TH = this.TH, F = this.F, P = this.P;
    // Rest cache (segment vector, flex, chain per node): refilled only when the tree changed, so a grown or paused
    // tree runs on typed arrays alone.
    if (sim.time !== this.cTime || sim.topology !== this.cTopo || N !== this.cN) {
      if (this.S.length < D.length) { this.S = new Float32Array(D.length); this.K = new Float32Array(D.length / 3); this.C = new Int32Array(D.length / 3); this.CAP = new Float32Array(D.length / 3); this.W = new Float32Array(D.length / 3); }
      const S = this.S, K = this.K, C = this.C, CAP = this.CAP, W = this.W;
      for (let i = 0, o = 0; i < N; i++, o += 3) {
        const nd = nodes[i], pi = nd.parent, pn = pi >= 0 ? nodes[pi] : undefined;
        P[i] = pi;
        if (!pn || chains[nd.chain].pruned) { C[i] = -1; continue; }
        C[i] = nd.chain;
        S[o] = nd.wx - pn.wx; S[o + 1] = nd.wy - pn.wy; S[o + 2] = nd.wz - pn.wz;
        // Bend per metre at unit force: FLEX / r^1.5, capped (twigs streamline, they do not spin).
        const r = nd.radius > 0.002 ? nd.radius : 0.002, k = FLEX / (r * Math.sqrt(r));
        K[i] = k > FLEX_MAX ? FLEX_MAX : k;
      }
      // Rotation limit per node. The deflection limit acts on the whole shoot: the limit falls with the length of
      // flexible wood (metres weighted by flex / FLEX_MAX, so a trunk counts for almost nothing) on the longest path
      // root -> node -> tip, the same value all along that path, so a long whip bends less per metre from base to
      // tip instead of being cut off where its offset reaches a ceiling. Side shoots lie on shorter paths: their
      // limit is never below their parent's, so the limit never decreases toward a tip.
      W.fill(0, 0, N);
      for (let i = N - 1; i > 0; i--) {
        if (C[i] < 0) continue;
        const o = i * 3, w = W[i] + Math.sqrt(S[o] * S[o] + S[o + 1] * S[o + 1] + S[o + 2] * S[o + 2]) * K[i] * (1 / FLEX_MAX), pi = P[i];
        CAP[i] = w; // own weighted segment + longest weighted path below
        if (w > W[pi]) W[pi] = w;
      }
      for (let i = 0; i < N; i++) {
        if (C[i] < 0) { W[i] = 0; continue; }
        // W[i] becomes the weighted length root -> node; the longest path through the node is that + the part below.
        const pi = P[i], up = W[pi] + (CAP[i] - (W[i] > 0 ? W[i] : 0));
        const q = TH_MAX * (up + W[i]) * (1 / D_LIM);
        W[i] = up;
        CAP[i] = TH_MAX / Math.sqrt(1 + q * q);
      }
      // Anchors: -1 = thick (evaluated every update), else the nearest thick ancestor. A node whose anchor changed
      // (new wood, a limb thickening past THICK_R, a break) has its keys re-expressed against the new anchor from the
      // offsets drawn last update (D), so its drawn position does not jump: new = old drawn - new anchor's offset.
      const A = this.A, R0 = this.R0, R1 = this.R1, RN = this.RN, TN = this.TN, two = this.twoRate && this.keys >= 2;
      const oldN = this.cN > 0 ? Math.min(this.cN, N) : 0;
      let thin = 0;
      for (let i = 0, o = 0; i < N; i++, o += 3) {
        const pi = P[i], was = i < oldN ? A[i] : -2;
        let a = -1;
        if (pi >= 0 && C[i] >= 0 && this.twoRate && !(A[pi] < 0 && nodes[i].radius > THICK_R)) { a = A[pi] < 0 ? pi : A[pi]; thin++; }
        A[i] = a;
        if (a >= 0 && a !== was && two) {
          const ao = a * 3, po = pi * 3;
          // New node: starts where its parent is drawn (the parent's keys, set earlier in this loop; 0 on its anchor).
          // D of a new parent is not written yet, so new nodes never read D.
          if (i >= oldN) for (let j = 0; j < 3; j++) { const r = A[pi] >= 0 ? R1[po + j] : 0; R0[o + j] = A[pi] >= 0 ? R0[po + j] : 0; R1[o + j] = r; RN[o + j] = A[pi] >= 0 ? RN[po + j] : 0; }
          else for (let j = 0; j < 3; j++) { const r = D[o + j] - D[ao + j]; R0[o + j] = R1[o + j] = RN[o + j] = r; }
          const to = was === -1 && i < oldN ? o : pi * 3, TT = was === -1 && i < oldN ? TH : (A[pi] >= 0 ? TN : TH);
          TN[o] = TT[to]; TN[o + 1] = TT[to + 1]; TN[o + 2] = TT[to + 2];
        }
      }
      this.thin = thin;
      this.cTime = sim.time; this.cTopo = sim.topology; this.cN = N;
    }
    const S = this.S, K = this.K, C = this.C, CAP = this.CAP;
    const wx = wind.dirX, wz = wind.dirZ, t = wind.t;
    // Per chain: force vector. The lean follows the gust wave at the chain base (0.35 s behind the front) and goes
    // with gust^2.5 (drag ~ v^2, v ~ gust^2): small in a breeze, dominant in a storm. The oscillation (own phase per
    // chain, faster on thinner wood) goes with gust^1.25, so a breeze is mostly stir and a storm mostly lean + whip.
    for (let c = 0; c < chains.length; c++) {
      const ch = chains[c], o = c * 3;
      if (ch.pruned || ch.nodes.length <= 2) { F[o] = F[o + 1] = F[o + 2] = 0; continue; } // stubs ride their parent
      const b = nodes[ch.nodes[1]];
      const g = wind.gustAlong(wx * b.wx + wz * b.wz, t - 0.35);
      const lean0 = g * g * Math.sqrt(g) * amount, osc = OSC * g * Math.sqrt(Math.sqrt(g)) * amount;
      const ph = ((c * 2654435761) >>> 0) / 4294967296 * 6.2832;
      const om = Math.min(7, 0.55 / Math.sqrt(Math.max(0.003, b.radius)));
      const s1 = Math.sin(om * t + ph), s2 = Math.sin(0.83 * om * t + 2.1 * ph), s3 = Math.sin(1.31 * om * t + 3.7 * ph);
      const lean = lean0 * 0.8 + osc * s1, cross = osc * 0.9 * s2;
      F[o] = wx * lean - wz * cross;
      F[o + 1] = osc * 0.6 * s3;
      F[o + 2] = wz * lean + wx * cross;
    }
    let maxSq = 0, maxNode = -1;
    const A = this.A, R0 = this.R0, R1 = this.R1, RN = this.RN, TN = this.TN;
    // Until two keys exist (start, wind back from zero, anchors changed) every node is evaluated in full and both
    // keys are written, so the first interpolated update continues exactly from the last full one.
    const full = this.thin === 0 || this.keys < 2;
    // Slice bounds are fixed by the node count at the start of the cycle; the last slice also takes every node added
    // since (new ids are larger), so each thin node is evaluated exactly once per key.
    if (this.slice === 0) this.cyN = N;
    const cyN = Math.min(this.cyN, N);
    const lo = full ? 0 : Math.floor(cyN * this.slice / RATE), hi = full || this.slice === RATE - 1 ? N : Math.floor(cyN * (this.slice + 1) / RATE);
    const al = full ? 1 : (this.slice + 1) / RATE;
    let evaluated = 0;
    for (let i = 0, o = 0; i < N; i++, o += 3) {
      const c = C[i];
      if (c < 0) { D[o] = D[o + 1] = D[o + 2] = 0; TH[o] = TH[o + 1] = TH[o + 2] = 0; RN[o] = RN[o + 1] = RN[o + 2] = 0; TN[o] = TN[o + 1] = TN[o + 2] = 0; continue; }
      const an = A[i];
      if (an >= 0 && !(i >= lo && i < hi) && !full) {
        // Thin, not in this update's slice: anchor's current offset + interpolated relative offset.
        const ao = an * 3;
        D[o] = D[ao] + R0[o] + (R1[o] - R0[o]) * al;
        D[o + 1] = D[ao + 1] + R0[o + 1] + (R1[o + 1] - R0[o + 1]) * al;
        D[o + 2] = D[ao + 2] + R0[o + 2] + (R1[o + 2] - R0[o + 2]) * al;
        const dq = D[o] * D[o] + D[o + 1] * D[o + 1] + D[o + 2] * D[o + 2];
        if (dq > maxSq) { maxSq = dq; maxNode = i; }
        continue;
      }
      evaluated++;
      const pi = P[i], po = pi * 3, fo = c * 3, k = K[i];
      // Raw rotation and relative offset of the parent: thick and parent thick -> TH / D; thin -> the key in progress
      // (its parent is thick: TH of the anchor now and relative 0).
      const pThin = an >= 0 && A[pi] >= 0;
      const T = an >= 0 && pThin ? TN : TH;
      const sx = S[o], sy = S[o + 1], sz = S[o + 2];
      const fx = F[fo], fy = F[fo + 1], fz = F[fo + 2];
      // Bend added by this segment: (s x F) * flex, on top of the parent's rotation.
      // TH is the accumulated (raw) rotation, hard-limited only far beyond what is drawn.
      let tx = T[po] + (sy * fz - sz * fy) * k, ty = T[po + 1] + (sz * fx - sx * fz) * k, tz = T[po + 2] + (sx * fy - sy * fx) * k;
      const tq = tx * tx + ty * ty + tz * tz;
      if (tq > RAW_MAX * RAW_MAX) { const q = RAW_MAX / Math.sqrt(tq); tx *= q; ty *= q; tz *= q; }
      if (an >= 0) { TN[o] = tx; TN[o + 1] = ty; TN[o + 2] = tz; } else { TH[o] = tx; TH[o + 1] = ty; TH[o + 2] = tz; }
      // Drawn rotation: saturates gradually toward the node's limit (raw * cap / sqrt(cap^2 + raw^2): equal to raw
      // while small, monotonic in raw and in cap), so the lean keeps growing toward the tip and never meets a corner.
      const cap = CAP[i], sat = cap / Math.sqrt(cap * cap + (tq > RAW_MAX * RAW_MAX ? RAW_MAX * RAW_MAX : tq));
      tx *= sat; ty *= sat; tz *= sat;
      // Rotate the rest segment by the small rotation (first order, renormalised to the rest length: wood does not stretch).
      let vx = sx + ty * sz - tz * sy, vy = sy + tz * sx - tx * sz, vz = sz + tx * sy - ty * sx;
      const sl = sx * sx + sy * sy + sz * sz, vl = vx * vx + vy * vy + vz * vz;
      if (vl > 1e-12) { const q = Math.sqrt(sl / vl); vx *= q; vy *= q; vz *= q; }
      if (an >= 0) {
        // Thin node of the key in progress: offset relative to its anchor.
        const rx = (pThin ? RN[po] : 0) + vx - sx, ry = (pThin ? RN[po + 1] : 0) + vy - sy, rz = (pThin ? RN[po + 2] : 0) + vz - sz;
        RN[o] = rx; RN[o + 1] = ry; RN[o + 2] = rz;
        const ao = an * 3;
        if (full) { R0[o] = R1[o] = rx; R0[o + 1] = R1[o + 1] = ry; R0[o + 2] = R1[o + 2] = rz; }
        D[o] = D[ao] + R0[o] + (R1[o] - R0[o]) * al;
        D[o + 1] = D[ao + 1] + R0[o + 1] + (R1[o + 1] - R0[o + 1]) * al;
        D[o + 2] = D[ao + 2] + R0[o + 2] + (R1[o + 2] - R0[o + 2]) * al;
      } else {
        // No limit per node: the offset is the parent's plus this segment's turn, all the way to the tip.
        D[o] = D[po] + vx - sx; D[o + 1] = D[po + 1] + vy - sy; D[o + 2] = D[po + 2] + vz - sz;
      }
      const dq = D[o] * D[o] + D[o + 1] * D[o + 1] + D[o + 2] * D[o + 2];
      if (dq > maxSq) { maxSq = dq; maxNode = i; }
    }
    // Key cycle: after the last slice the key in progress becomes the newest key.
    if (full) { this.keys = this.thin === 0 ? 0 : this.keys + 1; this.slice = 0; }
    else if (++this.slice >= RATE) { this.slice = 0; const t0r = this.R0; this.R0 = this.R1; this.R1 = this.RN; this.RN = t0r; }
    this.stats.thick = N - this.thin; this.stats.thin = this.thin; this.stats.evaluated = evaluated; this.stats.keys = this.keys;
    this.maxOffset = Math.sqrt(maxSq); this.maxNode = maxNode;
    this.live = true;
    this.lastMs = performance.now() - t0;
    return true;
  }
}
/**
 * Bend per metre of wood at unit force: FLEX / r^1.5 rad (r in m), at most FLEX_MAX. Drawn rotation saturates toward
 * TH_MAX rad (less on long flexible paths, see D_LIM); the accumulated rotation is held at RAW_MAX (drawn: 95 % of the limit).
 */
const FLEX = 3.5e-4, FLEX_MAX = 0.6, TH_MAX = 0.63, RAW_MAX = 1.9;
/** Oscillating share of the force at gust 1. */
const OSC = 0.25;
/**
 * Deflection scale, metres: the rotation limit of a node is TH_MAX / sqrt(1 + (TH_MAX * L / D_LIM)^2), L = flex-weighted
 * length of the longest path through the node, so limit * L stays below D_LIM however long the shoot is.
 */
const D_LIM = 2.0;
/** Two-rate sway: wood thicker than THICK_R (m) on thick wood every update, thin wood keyed every RATE updates. */
const THICK_R = 0.03, RATE = 3;

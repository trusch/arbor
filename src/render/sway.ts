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
  /** Accumulated (raw) rotation per node: of the pose itself (direct), of the newest complete key (keyed). Probes read it. */
  get TH(): Float32Array {
    if (!this.keyed) return this.THd;
    // Keyed: the blend of the two keys' rotations, like the offsets (first order: the pose of the blended rotation
    // is the blend of the poses). Filled only when somebody reads it (probes), once per update.
    if (this.thDirty) {
      if (this.THb.length < this.D.length) this.THb = new Float32Array(this.D.length);
      const B = this.THb, T0 = this.T0, T1 = this.T1, al = this.slice / this.kR, LV = this.LV;
      for (let j = 0; j < this.nLive; j++) { const o = LV[j] * 3; B[o] = T0[o] + (T1[o] - T0[o]) * al; B[o + 1] = T0[o + 1] + (T1[o + 1] - T0[o + 1]) * al; B[o + 2] = T0[o + 2] + (T1[o + 2] - T0[o + 2]) * al; }
      this.thDirty = false;
    }
    return this.THb;
  }
  private THd = new Float32Array(0); private THb = new Float32Array(0); private thDirty = true;
  private F = new Float32Array(0);
  private S = new Float32Array(0);
  private K = new Float32Array(0);
  private C = new Int32Array(0);
  /** Rotation limit per node (rad) and scratch (flex-weighted path length below the node). */
  private CAP = new Float32Array(0);
  private W = new Float32Array(0);
  private cGeom = NaN; private cTopo = -1; private cN = -1;
  /** Ids of the live nodes (parent present, chain not pruned), ascending, and their count: the cascade runs over these only. */
  private LV = new Int32Array(0); private nLive = 0;
  /**
   * Key poses (big tree, docs/bigtree.md 6.14). From `keyMin` live nodes on, the cascade is not run per update: whole
   * poses of the WHOLE tree (`R*` offsets, `T*` raw rotations) are computed for a wind time ahead, in `kR` slices by
   * node id, one slice per update, every slice at the same key time and from the same forces `FN`, so a key is one
   * consistent pose. Every node is drawn as the linear blend of the last two keys `R0 -> R1`, which lands on `R1` in
   * the update `R1` was computed for: uniform in space (no anchor split, no seam between rates) and no latency while
   * the update interval holds. Below `keyMin`, and while the wood changes (growth, a break), nothing here runs: the
   * direct cascade, bit for bit.
   */
  private R0 = new Float32Array(0); private R1 = new Float32Array(0); private RN = new Float32Array(0);
  private T0 = new Float32Array(0); private T1 = new Float32Array(0); private TN = new Float32Array(0);
  private FN = new Float32Array(0); private fnChains = 0; private keyT = 0; private keyAmount = 0;
  private keyed = false; private slice = 0; private kR = 1; private kB = new Int32Array(KEY_MAX + 1);
  private lastT = NaN; private dtW = 0.05; private still = 0;
  /** Live-node count from which key poses are used (`Infinity` = never: every node every update; 0 = always). Leaves at 0.8 x. */
  keyMin = KEY_ON;
  /** Last update: nodes run through the cascade, keyed or not, slices per key. */
  stats = { evaluated: 0, live: 0, keyed: false, slices: 1, keys: 0 };

  /**
   * Recompute D. Returns true when the pose changed (moving, or it just returned to rest and consumers must draw
   * the rest pose once more).
   */
  update(sim: TreeSim, wind: Wind, amount: number): boolean {
    const nodes = sim.nodes, chains = sim.chains, N = nodes.length;
    if (!(amount > 0) || !(wind.base > 0) || N === 0) {
      this.keyed = false; this.lastT = NaN;
      if (!this.live) return false;
      this.D.fill(0); this.live = false; this.maxOffset = 0; this.maxNode = -1;
      return true;
    }
    const t0 = performance.now();
    if (this.D.length < N * 3) {
      const cap = Math.ceil(N * 1.5) + 256;
      this.D = new Float32Array(cap * 3); this.THd = new Float32Array(cap * 3); this.THb = new Float32Array(0); this.P = new Int32Array(cap);
      // Key arrays exist only once a tree is large enough to use them.
      this.R0 = this.R1 = this.RN = this.T0 = this.T1 = this.TN = new Float32Array(0); this.keyed = false;
    }
    if (this.F.length < chains.length * 3) {
      const f = new Float32Array((chains.length * 2 + 64) * 3), fn = new Float32Array(f.length);
      fn.set(this.FN); this.F = f; this.FN = fn;
    }
    const D = this.D, F = this.F, P = this.P;
    // Rest cache (segment vector, flex, chain per node): refilled only when the tree changed, so a grown or paused
    // tree runs on typed arrays alone.
    if (sim.geomVersion !== this.cGeom || sim.topology !== this.cTopo || N !== this.cN) {
      if (this.LV.length < N) this.LV = new Int32Array(D.length / 3);
      if (this.S.length < D.length) { this.S = new Float32Array(D.length); this.K = new Float32Array(D.length / 3); this.C = new Int32Array(D.length / 3); this.CAP = new Float32Array(D.length / 3); this.W = new Float32Array(D.length / 3); }
      const S = this.S, K = this.K, C = this.C, CAP = this.CAP, W = this.W, LV = this.LV, TH = this.THd;
      let nLive = 0;
      for (let i = 0, o = 0; i < N; i++, o += 3) {
        const nd = nodes[i], pi = nd.parent, pn = pi >= 0 ? nodes[pi] : undefined;
        P[i] = pi;
        // Not live (root, pruned or detached wood): offset and rotations are 0, written here once; the cascade skips it.
        if (!pn || chains[nd.chain].pruned) {
          C[i] = -1;
          D[o] = D[o + 1] = D[o + 2] = 0; TH[o] = TH[o + 1] = TH[o + 2] = 0;
          continue;
        }
        LV[nLive++] = i;
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
      // The wood changed: key poses hold offsets of the segments as they were (an elongating tip segment was drawn
      // straighter than its rotation, one-curve check 0.14 to 0.48 rad on growing trees), so a changing tree is
      // drawn by the direct cascade and key poses start again once it has been at rest for KEY_STILL updates.
      this.keyed = false; this.still = 0;
      this.nLive = nLive;
      this.cGeom = sim.geomVersion; this.cTopo = sim.topology; this.cN = N;
    }
    const t = wind.t, nLive = this.nLive, LV = this.LV;
    // Update interval on the wind clock (smoothed; a gap such as a hidden tab does not count).
    if (this.lastT === this.lastT) {
      const dw = t - this.lastT;
      if (dw > 0 && dw < 0.6) this.dtW += (dw - this.dtW) * 0.3;
    }
    this.lastT = t;
    const wasKeyed = this.keyed;
    const keyed = ++this.still > KEY_STILL && nLive >= (wasKeyed ? this.keyMin * 0.8 : this.keyMin);
    let maxSq = 0, maxNode = -1, evaluated = 0;
    if (!keyed) {
      // Direct: the pose of this instant, every live node.
      this.keyed = false;
      this.forces(sim, wind, amount, F, 0, t);
      evaluated = this.cascade(F, this.THd, D, 0, N);
    } else {
      if (this.R0.length < D.length) {
        this.R0 = new Float32Array(D.length); this.R1 = new Float32Array(D.length); this.RN = new Float32Array(D.length);
        this.T0 = new Float32Array(D.length); this.T1 = new Float32Array(D.length); this.TN = new Float32Array(D.length);
      }
      const FN = this.FN;
      if (!wasKeyed) {
        // Entering (the tree grew past `keyMin`, the wind came back from zero): this update draws the pose of now in
        // full, as the direct path would, and takes it as the newest key; the following key is computed in full too,
        // once, so the blend continues from here without a stop.
        this.keyed = true; this.stats.keys = 0;
        this.R0.fill(0); this.R1.fill(0); this.RN.fill(0); this.T0.fill(0); this.T1.fill(0); this.TN.fill(0);
        this.forces(sim, wind, amount, F, 0, t);
        evaluated = this.cascade(F, this.T1, this.R1, 0, N);
        this.kR = this.pickR();
        this.forces(sim, wind, amount, FN, 0, t + this.kR * this.dtW);
        evaluated += this.cascade(FN, this.TN, this.RN, 0, N);
        this.slice = this.kR; // the key in progress is complete: the next update starts a cycle
        this.T0.set(this.T1); // blend factor 1 below reads T1 either way; T0 only must not be stale
        D.set(this.R1.subarray(0, N * 3));
        for (let j = 0; j < nLive; j++) { const o = LV[j] * 3, dq = D[o] * D[o] + D[o + 1] * D[o + 1] + D[o + 2] * D[o + 2]; if (dq > maxSq) { maxSq = dq; maxNode = LV[j]; } }
      } else {
        if (this.slice >= this.kR) {
          // Cycle start: the finished key becomes the target; the next one is for the last update of the NEXT cycle.
          const r = this.R0; this.R0 = this.R1; this.R1 = this.RN; this.RN = r;
          const th = this.T0; this.T0 = this.T1; this.T1 = this.TN; this.TN = th;
          this.slice = 0; this.stats.keys++;
          const R = this.kR = this.pickR(), kB = this.kB;
          for (let s = 0; s < R; s++) kB[s] = LV[Math.floor(nLive * s / R)] ?? 0;
          kB[0] = 0; kB[R] = 0x7fffffff;
          this.keyT = t + (2 * R - 1) * this.dtW; this.keyAmount = amount;
          this.forces(sim, wind, amount, FN, 0, this.keyT);
        } else if (chains.length > this.fnChains) this.forces(sim, wind, this.keyAmount, FN, this.fnChains, this.keyT);
        evaluated = this.cascade(FN, this.TN, this.RN, this.kB[this.slice], this.kB[this.slice + 1]);
        this.slice++;
        const al = this.slice / this.kR, R0 = this.R0, R1 = this.R1;
        for (let j = 0; j < nLive; j++) {
          const i = LV[j], o = i * 3;
          const x = D[o] = R0[o] + (R1[o] - R0[o]) * al, y = D[o + 1] = R0[o + 1] + (R1[o + 1] - R0[o + 1]) * al, z = D[o + 2] = R0[o + 2] + (R1[o + 2] - R0[o + 2]) * al;
          const dq = x * x + y * y + z * z;
          if (dq > maxSq) { maxSq = dq; maxNode = i; }
        }
      }
      this.thDirty = true;
    }
    if (!keyed) { maxSq = this.mSq; maxNode = this.mNode; }
    this.stats.evaluated = evaluated; this.stats.live = nLive; this.stats.keyed = keyed; this.stats.slices = keyed ? this.kR : 1;
    this.maxOffset = Math.sqrt(maxSq); this.maxNode = maxNode;
    this.live = true;
    this.lastMs = performance.now() - t0;
    return true;
  }

  /**
   * Slices per key: a key about every `KEY_S` seconds of the WIND clock, at most `KEY_MAX` updates apart. The clock
   * runs up to 2.6x faster in a storm and twigs swing at up to 7 rad/s of it, so in a storm on a slow device this
   * is 1: every update computes the whole pose, as the direct path does (keys 0.5 clock seconds apart blended the
   * whip of thin wood away: one-curve check 0.28 rad).
   */
  private pickR(): number {
    const r = Math.round(KEY_S / this.dtW);
    return r < 1 ? 1 : r > KEY_MAX ? KEY_MAX : r;
  }

  /**
   * Force vector per chain (from chain `from` on) at wind time `t`. The lean follows the gust wave at the chain base
   * (0.35 s behind the front) and goes with gust^2.5 (drag ~ v^2, v ~ gust^2): small in a breeze, dominant in a storm.
   * The oscillation (own phase per chain, faster on thinner wood) goes with gust^1.25, so a breeze is mostly stir and
   * a storm mostly lean + whip.
   */
  private forces(sim: TreeSim, wind: Wind, amount: number, F: Float32Array, from: number, t: number) {
    const nodes = sim.nodes, chains = sim.chains, wx = wind.dirX, wz = wind.dirZ;
    for (let c = from; c < chains.length; c++) {
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
    if (F === this.FN) this.fnChains = chains.length;
  }

  private mSq = 0; private mNode = -1;
  /**
   * The bend cascade over the live nodes with lo <= id < hi: raw rotations into `TH`, offsets into `O` (both read
   * for the parent, so a call continues a pose begun by earlier calls with lower ids). Returns the nodes evaluated.
   */
  private cascade(F: Float32Array, TH: Float32Array, O: Float32Array, lo: number, hi: number): number {
    const S = this.S, K = this.K, C = this.C, CAP = this.CAP, P = this.P, LV = this.LV, nLive = this.nLive;
    let maxSq = 0, maxNode = -1, n = 0, j = 0;
    if (lo > 0) { let a = 0, b = nLive; while (a < b) { const m = (a + b) >> 1; if (LV[m] < lo) a = m + 1; else b = m; } j = a; }
    for (; j < nLive; j++) {
      const i = LV[j];
      if (i >= hi) break;
      n++;
      const o = i * 3, po = P[i] * 3, fo = C[i] * 3, k = K[i];
      const sx = S[o], sy = S[o + 1], sz = S[o + 2];
      const fx = F[fo], fy = F[fo + 1], fz = F[fo + 2];
      // Bend added by this segment: (s x F) * flex, on top of the parent's rotation.
      // TH is the accumulated (raw) rotation, hard-limited only far beyond what is drawn.
      let tx = TH[po] + (sy * fz - sz * fy) * k, ty = TH[po + 1] + (sz * fx - sx * fz) * k, tz = TH[po + 2] + (sx * fy - sy * fx) * k;
      const tq = tx * tx + ty * ty + tz * tz;
      if (tq > RAW_MAX * RAW_MAX) { const q = RAW_MAX / Math.sqrt(tq); tx *= q; ty *= q; tz *= q; }
      TH[o] = tx; TH[o + 1] = ty; TH[o + 2] = tz;
      // Drawn rotation: saturates gradually toward the node's limit (raw * cap / sqrt(cap^2 + raw^2): equal to raw
      // while small, monotonic in raw and in cap), so the lean keeps growing toward the tip and never meets a corner.
      const cap = CAP[i], sat = cap / Math.sqrt(cap * cap + (tq > RAW_MAX * RAW_MAX ? RAW_MAX * RAW_MAX : tq));
      tx *= sat; ty *= sat; tz *= sat;
      // Rotate the rest segment by the small rotation (first order, renormalised to the rest length: wood does not stretch).
      let vx = sx + ty * sz - tz * sy, vy = sy + tz * sx - tx * sz, vz = sz + tx * sy - ty * sx;
      const sl = sx * sx + sy * sy + sz * sz, vl = vx * vx + vy * vy + vz * vz;
      if (vl > 1e-12) { const q = Math.sqrt(sl / vl); vx *= q; vy *= q; vz *= q; }
      // No limit per node: the offset is the parent's plus this segment's turn, all the way to the tip.
      const dx = O[o] = O[po] + vx - sx, dy = O[o + 1] = O[po + 1] + vy - sy, dz = O[o + 2] = O[po + 2] + vz - sz;
      const dq = dx * dx + dy * dy + dz * dz;
      if (dq > maxSq) { maxSq = dq; maxNode = i; }
    }
    this.mSq = maxSq; this.mNode = maxNode;
    return n;
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
/**
 * Key poses: used from KEY_ON live nodes (the default tree stays under 6k; left again below 0.8 x), one key about
 * every KEY_S seconds of the wind clock and at most KEY_MAX updates apart, only on wood that has not changed for
 * KEY_STILL updates.
 */
const KEY_ON = 9000, KEY_S = 0.2, KEY_MAX = 4, KEY_STILL = 8;

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
   * Recompute D. Returns true when the pose changed (moving, or it just returned to rest and consumers must draw
   * the rest pose once more).
   */
  update(sim: TreeSim, wind: Wind, amount: number): boolean {
    const nodes = sim.nodes, chains = sim.chains, N = nodes.length;
    if (!(amount > 0) || !(wind.base > 0) || N === 0) {
      if (!this.live) return false;
      this.D.fill(0); this.live = false; this.maxOffset = 0; this.maxNode = -1;
      return true;
    }
    const t0 = performance.now();
    if (this.D.length < N * 3) {
      const cap = Math.ceil(N * 1.5) + 256;
      this.D = new Float32Array(cap * 3); this.TH = new Float32Array(cap * 3); this.P = new Int32Array(cap);
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
    for (let i = 0, o = 0; i < N; i++, o += 3) {
      const c = C[i];
      if (c < 0) { D[o] = D[o + 1] = D[o + 2] = 0; TH[o] = TH[o + 1] = TH[o + 2] = 0; continue; }
      const po = P[i] * 3, fo = c * 3, k = K[i];
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
      const ox = D[po] + vx - sx, oy = D[po + 1] + vy - sy, oz = D[po + 2] + vz - sz;
      const dq = ox * ox + oy * oy + oz * oz;
      D[o] = ox; D[o + 1] = oy; D[o + 2] = oz;
      if (dq > maxSq) { maxSq = dq; maxNode = i; }
    }
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

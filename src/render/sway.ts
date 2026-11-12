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
    const wx = wind.dirX, wz = wind.dirZ, t = wind.t;
    // Per chain: force vector. Lean follows the gust wave at the chain base (0.35 s behind the front), the
    // oscillation has a per-chain phase and a frequency that rises as the wood gets thinner.
    for (let c = 0; c < chains.length; c++) {
      const ch = chains[c], o = c * 3;
      if (ch.pruned || ch.nodes.length <= 2) { F[o] = F[o + 1] = F[o + 2] = 0; continue; } // stubs ride their parent
      const b = nodes[ch.nodes[1]];
      const g = wind.gustAlong(wx * b.wx + wz * b.wz, t - 0.35);
      const G = g * Math.sqrt(g) * amount;
      const ph = ((c * 2654435761) >>> 0) / 4294967296 * 6.2832;
      const om = Math.min(7, 0.55 / Math.sqrt(Math.max(0.003, b.radius)));
      const s1 = Math.sin(om * t + ph), s2 = Math.sin(0.83 * om * t + 2.1 * ph), s3 = Math.sin(1.31 * om * t + 3.7 * ph);
      const lean = G * (0.72 + 0.28 * s1), cross = G * 0.34 * s2;
      F[o] = wx * lean - wz * cross;
      F[o + 1] = G * 0.2 * s3;
      F[o + 2] = wz * lean + wx * cross;
    }
    let maxSq = 0, maxNode = -1;
    for (let i = 0, o = 0; i < N; i++, o += 3) {
      const nd = nodes[i], pi = nd.parent;
      P[i] = pi;
      const pn = pi >= 0 ? nodes[pi] : undefined;
      if (!pn || chains[nd.chain].pruned) { D[o] = D[o + 1] = D[o + 2] = 0; TH[o] = TH[o + 1] = TH[o + 2] = 0; continue; }
      const po = pi * 3, fo = nd.chain * 3;
      const sx = nd.wx - pn.wx, sy = nd.wy - pn.wy, sz = nd.wz - pn.wz;
      const fx = F[fo], fy = F[fo + 1], fz = F[fo + 2];
      // Bend added by this segment: (s x F) * flex. flex per metre = FLEX / r^1.5, capped (twigs streamline, not spin).
      const r = nd.radius > 0.002 ? nd.radius : 0.002;
      let k = FLEX / (r * Math.sqrt(r));
      if (k > FLEX_MAX) k = FLEX_MAX;
      let tx = TH[po] + (sy * fz - sz * fy) * k, ty = TH[po + 1] + (sz * fx - sx * fz) * k, tz = TH[po + 2] + (sx * fy - sy * fx) * k;
      const tq = tx * tx + ty * ty + tz * tz;
      if (tq > TH_MAX * TH_MAX) { const q = TH_MAX / Math.sqrt(tq); tx *= q; ty *= q; tz *= q; }
      TH[o] = tx; TH[o + 1] = ty; TH[o + 2] = tz;
      // Rotate the rest segment by the small rotation TH (first order, renormalised to the rest length: wood does not stretch).
      let vx = sx + ty * sz - tz * sy, vy = sy + tz * sx - tx * sz, vz = sz + tx * sy - ty * sx;
      const sl = sx * sx + sy * sy + sz * sz, vl = vx * vx + vy * vy + vz * vz;
      if (vl > 1e-12) { const q = Math.sqrt(sl / vl); vx *= q; vy *= q; vz *= q; }
      const ox = D[po] + vx - sx, oy = D[po + 1] + vy - sy, oz = D[po + 2] + vz - sz;
      D[o] = ox; D[o + 1] = oy; D[o + 2] = oz;
      const dq = ox * ox + oy * oy + oz * oz;
      if (dq > maxSq) { maxSq = dq; maxNode = i; }
    }
    this.maxOffset = Math.sqrt(maxSq); this.maxNode = maxNode;
    this.live = true;
    this.lastMs = performance.now() - t0;
    return true;
  }
}
/** Bend per metre of wood at unit force: FLEX / r^1.5 rad (r in m), at most FLEX_MAX; total rotation at most TH_MAX rad. */
const FLEX = 7.5e-4, FLEX_MAX = 1.5, TH_MAX = 0.85;

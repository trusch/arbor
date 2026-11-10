import type { ArborParams } from '../params';
import { Rng } from './rng';
import { PointGrid } from './grid';
import { sampleAttractors } from './envelope';

/**
 * A node is a point on the tree; its segment runs from its parent to it.
 * Rest geometry (r*) is where the plant grew; world geometry (w*) adds
 * gravity sag and is what the renderer draws.
 */
export interface TreeNode {
  parent: number;
  chain: number;
  order: number;
  /** Rest direction of the segment parent -> this (unit). */
  dx: number; dy: number; dz: number;
  len: number;
  targetLen: number;
  rx: number; ry: number; rz: number;
  radius: number;
  /** Phyllotactic angle accumulated along the chain. */
  phyllo: number;
  born: number;
  /** World (sagged) position and direction, recomputed each update. */
  wx: number; wy: number; wz: number;
  wdx: number; wdy: number; wdz: number;
  sag: number;
  subLen: number;
  pipe: number;
  leafy: boolean;
}

export interface Chain {
  /** Node ids, first is the branch point on the parent chain. */
  nodes: number[];
  order: number;
  alive: boolean;
  starve: number;
}

export interface Bud {
  node: number;
  chain: number;
  indexInChain: number;
  dx: number; dy: number; dz: number;
  born: number;
}

export interface Leaf {
  node: number;
  /** Fraction along the node's segment. */
  t: number;
  /** Angle around the branch and tilt toward the branch tip. */
  around: number;
  tilt: number;
  roll: number;
  size: number;
  /** Rank in [0,1): leaf is visible if rank * 4 < density. */
  rank: number;
  born: number;
  tint: number;
}

const UP: [number, number, number] = [0, 1, 0];

export class TreeSim {
  nodes: TreeNode[] = [];
  chains: Chain[] = [];
  buds: Bud[] = [];
  leaves: Leaf[] = [];
  time = 0;
  /** Bumps whenever topology (node/leaf count) changes. */
  topology = 0;
  bboxMin = [0, 0, 0];
  bboxMax = [0, 0, 0];

  private rng: Rng;
  private attr!: Float32Array;
  private attrAlive!: Uint8Array;
  private grid!: PointGrid;
  private gridCell = 1;
  private tmp: [number, number, number] = [0, 0, 0];

  constructor(public params: ArborParams) {
    this.rng = new Rng(params.seed.seed);
    this.reset();
  }

  reset() {
    const p = this.params;
    this.rng = new Rng(p.seed.seed);
    this.nodes = [];
    this.chains = [];
    this.buds = [];
    this.leaves = [];
    this.time = 0;
    this.topology++;
    this.rebuildAttractors();
    // Root node at ground plus the first growing leader segment.
    const root = this.addNode(-1, 0, 0, 0, 1, 0, 0);
    this.chains.push({ nodes: [root], order: 0, alive: true, starve: 0 });
    this.nodes[root].len = 0;
    this.nodes[root].targetLen = 0;
    const jitter = this.rng.unit(this.tmp);
    this.extend(0, 0.05 * jitter[0], 1, 0.05 * jitter[2]);
  }

  /** Regenerate the attractor cloud (crown params changed), removing points already occupied. */
  rebuildAttractors() {
    const p = this.params;
    this.attr = sampleAttractors(p, p.seed.seed);
    this.attrAlive = new Uint8Array(this.attr.length / 3).fill(1);
    this.gridCell = Math.max(0.3, this.perception());
    this.grid = new PointGrid(this.gridCell, this.attr, this.attrAlive);
    const kill = this.killRadius();
    for (const n of this.nodes) this.grid.query(n.rx, n.ry, n.rz, kill, (i) => (this.attrAlive[i] = 0));
  }

  get attractorCount() {
    let c = 0;
    for (let i = 0; i < this.attrAlive.length; i++) c += this.attrAlive[i];
    return c;
  }

  private perception() {
    return this.params.growth.segmentLength * 9;
  }
  private killRadius() {
    return this.params.growth.segmentLength * 2.2;
  }

  private addNode(parent: number, chain: number, order: number, dx: number, dy: number, dz: number, targetLen: number): number {
    const pn = parent >= 0 ? this.nodes[parent] : undefined;
    const n: TreeNode = {
      parent, chain, order, dx, dy, dz,
      len: 0, targetLen,
      rx: pn ? pn.rx : 0, ry: pn ? pn.ry : 0, rz: pn ? pn.rz : 0,
      radius: this.params.thickness.twigRadius * 0.3,
      phyllo: pn ? pn.phyllo + this.params.growth.phyllotaxis * (Math.PI / 180) : this.rng.range(0, Math.PI * 2),
      born: this.time,
      wx: 0, wy: 0, wz: 0, wdx: dx, wdy: dy, wdz: dz, sag: 0, subLen: 0, pipe: 0,
      leafy: false,
    };
    this.nodes.push(n);
    this.topology++;
    return this.nodes.length - 1;
  }

  /** Append a new growing segment to the end of chain c. */
  private extend(c: number, dx: number, dy: number, dz: number) {
    const ch = this.chains[c];
    const l = Math.hypot(dx, dy, dz) || 1;
    const tip = ch.nodes[ch.nodes.length - 1];
    const id = this.addNode(tip, c, ch.order, dx / l, dy / l, dz / l, this.params.growth.segmentLength * this.rng.range(0.85, 1.15));
    ch.nodes.push(id);
  }

  /** Average direction toward attractors within the perception cone; returns count. */
  private attractorPull(x: number, y: number, z: number, dx: number, dy: number, dz: number, radius: number, out: [number, number, number]): number {
    let sx = 0, sy = 0, sz = 0, cnt = 0;
    const cosCone = 0.25;
    this.grid.query(x, y, z, radius, (_i, ax, ay, az, d2) => {
      const d = Math.sqrt(d2) || 1e-6;
      if (ax * dx + ay * dy + az * dz < d * cosCone) return;
      sx += ax / d; sy += ay / d; sz += az / d; cnt++;
    });
    const l = Math.hypot(sx, sy, sz) || 1;
    out[0] = sx / l; out[1] = sy / l; out[2] = sz / l;
    return cnt;
  }

  private sunDir(): [number, number, number] {
    const az = (this.params.light.azimuth * Math.PI) / 180;
    const el = (this.params.light.elevation * Math.PI) / 180;
    return [Math.cos(el) * Math.cos(az), Math.sin(el), Math.cos(el) * Math.sin(az)];
  }

  /** Advance the simulation by dt simulated seconds. */
  step(dt: number) {
    const p = this.params;
    const g = p.growth;
    this.time += dt;
    const full = this.nodes.length >= g.maxNodes;

    // 1. Elongate growing tips; finished segments spawn the next one.
    if (!full) {
      for (let c = 0; c < this.chains.length; c++) {
        const ch = this.chains[c];
        if (!ch.alive) continue;
        const tipId = ch.nodes[ch.nodes.length - 1];
        const tip = this.nodes[tipId];
        const vigor = Math.pow(g.vigorDecay, ch.order);
        tip.len += g.segmentLength * g.growthRate * vigor * dt;
        if (tip.len >= tip.targetLen) {
          tip.len = tip.targetLen;
          this.updateRest(tipId);
          this.completeSegment(c, tipId);
        } else {
          this.updateRest(tipId);
        }
      }
    }

    // 2. Lateral bud break (apical dominance + light/space availability).
    if (!full) this.budBreak(dt);

    this.updateStructure(dt);
  }

  private updateRest(id: number) {
    const n = this.nodes[id];
    const pn = this.nodes[n.parent];
    n.rx = pn.rx + n.dx * n.len;
    n.ry = pn.ry + n.dy * n.len;
    n.rz = pn.rz + n.dz * n.len;
  }

  private completeSegment(c: number, id: number) {
    const p = this.params;
    const g = p.growth;
    const ch = this.chains[c];
    const n = this.nodes[id];
    // Occupy space.
    this.grid.query(n.rx, n.ry, n.rz, this.killRadius(), (i) => (this.attrAlive[i] = 0));

    // Lateral bud.
    if (ch.order < g.maxOrder) {
      const a = (g.branchAngle * Math.PI) / 180;
      const [px, py, pz] = perpendicular(n.dx, n.dy, n.dz, n.phyllo);
      const ca = Math.cos(a), sa = Math.sin(a);
      this.buds.push({
        node: id, chain: c, indexInChain: ch.nodes.length - 1,
        dx: n.dx * ca + px * sa, dy: n.dy * ca + py * sa, dz: n.dz * ca + pz * sa,
        born: this.time,
      });
    }

    // Leaves on young wood.
    if (ch.order >= 1 || n.ry > p.crown.base * 0.8) {
      n.leafy = true;
      for (let k = 0; k < 4; k++) {
        this.leaves.push({
          node: id, t: this.rng.range(0.2, 1), around: this.rng.range(0, Math.PI * 2),
          tilt: this.rng.range(0.3, 0.9), roll: this.rng.range(-0.6, 0.6), size: this.rng.range(0.7, 1.25),
          rank: (k + this.rng.next()) / 4, born: this.time, tint: this.rng.next(),
        });
      }
    }

    // Choose next direction.
    const pull = this.tmp;
    const cnt = this.attractorPull(n.rx, n.ry, n.rz, n.dx, n.dy, n.dz, this.perception(), pull);
    const inCrownZone = n.ry > p.crown.base * 0.7 || ch.order > 0;
    if (cnt === 0 && inCrownZone) ch.starve++;
    else ch.starve = Math.max(0, ch.starve - 1);
    if (ch.starve > 2 || (ch.order === 0 && cnt === 0 && n.ry > p.crown.base + p.crown.height * 1.6)) {
      ch.alive = false;
      return;
    }
    const sun = this.sunDir();
    const grav = g.gravitropism * Math.min(2, g.gravity);
    const w = this.rng.unit([0, 0, 0]);
    const att = cnt > 0 ? g.attraction : 0;
    // Trunk below the crown: strong upward drive.
    const lead = ch.order === 0 && cnt === 0 ? 1.2 : 0;
    const dx = n.dx * g.straightness + pull[0] * att + sun[0] * g.phototropism + w[0] * g.wander;
    const dy = n.dy * g.straightness + pull[1] * att + sun[1] * g.phototropism + (grav + lead) * UP[1] + w[1] * g.wander;
    const dz = n.dz * g.straightness + pull[2] * att + sun[2] * g.phototropism + w[2] * g.wander;
    this.extend(c, dx, dy, dz);
  }

  private budBreak(dt: number) {
    const g = this.params.growth;
    const range = g.apicalDominance * 10;
    const tmp: [number, number, number] = [0, 0, 0];
    for (let i = this.buds.length - 1; i >= 0; i--) {
      const b = this.buds[i];
      const ch = this.chains[b.chain];
      const age = this.time - b.born;
      if (age > 40) {
        this.buds[i] = this.buds[this.buds.length - 1];
        this.buds.pop();
        continue;
      }
      let release = 1;
      if (ch.alive) {
        const d = ch.nodes.length - 1 - b.indexInChain;
        release = smoothstep(range, range + 4, d);
      }
      const vigor = Math.pow(g.vigorDecay, ch.order + 1);
      if (this.rng.next() > g.branchingProbability * release * vigor * dt) continue;
      const n = this.nodes[b.node];
      const cnt = this.attractorPull(n.rx, n.ry, n.rz, b.dx, b.dy, b.dz, this.perception() * 1.2, tmp);
      this.buds[i] = this.buds[this.buds.length - 1];
      this.buds.pop();
      if (cnt < 2) continue; // shaded / no space: bud stays dormant forever
      const c = this.chains.length;
      this.chains.push({ nodes: [b.node], order: ch.order + 1, alive: true, starve: 0 });
      this.extend(c, b.dx * 2 + tmp[0] * 0.5, b.dy * 2 + tmp[1] * 0.5, b.dz * 2 + tmp[2] * 0.5);
    }
  }

  /** Pipe-model radii, subtree loads, gravity sag and world positions. */
  updateStructure(dt: number) {
    const p = this.params;
    const nodes = this.nodes;
    const N = nodes.length;
    const n = Math.max(1.2, p.thickness.exponent);
    const r0 = p.thickness.twigRadius;
    for (let i = 0; i < N; i++) {
      nodes[i].pipe = 0;
      nodes[i].subLen = 0;
    }
    // Children always have larger ids than parents: reverse pass is bottom-up.
    const k = 1 - Math.exp(-dt * p.thickness.thickeningRate * 4);
    for (let i = N - 1; i >= 0; i--) {
      const nd = nodes[i];
      let target: number;
      if (nd.pipe === 0) {
        const f = nd.targetLen > 0 ? nd.len / nd.targetLen : 1;
        target = r0 * (0.35 + 0.65 * f);
      } else {
        target = Math.max(r0, Math.pow(nd.pipe, 1 / n));
      }
      nd.radius += (target - nd.radius) * (dt > 0 ? k : 1);
      if (dt <= 0) nd.radius = Math.max(nd.radius, target * 0.999);
      nd.subLen += nd.len;
      if (nd.parent >= 0) {
        const pn = nodes[nd.parent];
        pn.pipe += Math.pow(target, n);
        pn.subLen += nd.subLen;
      }
    }
    // Forward pass: accumulate sag (bend toward -Y) and world positions.
    const gk = p.growth.gravity * p.growth.sag * 6e-5;
    const mn = this.bboxMin, mx = this.bboxMax;
    mn[0] = mn[1] = mn[2] = Infinity;
    mx[0] = mx[1] = mx[2] = -Infinity;
    for (let i = 0; i < N; i++) {
      const nd = nodes[i];
      if (nd.parent < 0) {
        nd.wx = nd.rx; nd.wy = nd.ry; nd.wz = nd.rz; nd.sag = 0;
        nd.wdx = 0; nd.wdy = 1; nd.wdz = 0;
      } else {
        const pn = nodes[nd.parent];
        const h = Math.hypot(nd.dx, nd.dz);
        const bend = Math.min(0.12, (gk * nd.subLen * nd.len * h) / (nd.radius * nd.radius));
        nd.sag = pn.sag + bend;
        bendDown(nd.dx, nd.dy, nd.dz, nd.sag, this.tmp);
        nd.wdx = this.tmp[0]; nd.wdy = this.tmp[1]; nd.wdz = this.tmp[2];
        nd.wx = pn.wx + nd.wdx * nd.len;
        nd.wy = pn.wy + nd.wdy * nd.len;
        nd.wz = pn.wz + nd.wdz * nd.len;
      }
      if (nd.wx < mn[0]) mn[0] = nd.wx; if (nd.wy < mn[1]) mn[1] = nd.wy; if (nd.wz < mn[2]) mn[2] = nd.wz;
      if (nd.wx > mx[0]) mx[0] = nd.wx; if (nd.wy > mx[1]) mx[1] = nd.wy; if (nd.wz > mx[2]) mx[2] = nd.wz;
    }
  }
}

function smoothstep(a: number, b: number, x: number) {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a || 1e-6)));
  return t * t * (3 - 2 * t);
}

/** Unit vector perpendicular to d, rotated by angle around d. */
function perpendicular(dx: number, dy: number, dz: number, angle: number): [number, number, number] {
  // Reference: world X projected; fall back to Z for x-aligned axes.
  let rx = 1, ry = 0, rz = 0;
  if (Math.abs(dx) > 0.9) { rx = 0; rz = 1; }
  // a = normalize(cross(d, r)), b = cross(d, a)
  let ax = dy * rz - dz * ry, ay = dz * rx - dx * rz, az = dx * ry - dy * rx;
  const l = Math.hypot(ax, ay, az) || 1;
  ax /= l; ay /= l; az /= l;
  const bx = dy * az - dz * ay, by = dz * ax - dx * az, bz = dx * ay - dy * ax;
  const c = Math.cos(angle), s = Math.sin(angle);
  return [ax * c + bx * s, ay * c + by * s, az * c + bz * s];
}

/** Rotate d toward -Y in its vertical plane by angle (clamped at straight down). */
function bendDown(dx: number, dy: number, dz: number, angle: number, out: [number, number, number]) {
  const h = Math.hypot(dx, dz);
  if (h < 1e-4 || angle <= 0) {
    out[0] = dx; out[1] = dy; out[2] = dz;
    return out;
  }
  const theta = Math.atan2(h, dy); // angle from up
  const t = Math.min(Math.PI * 0.97, theta + angle);
  const s = Math.sin(t);
  out[0] = (dx / h) * s; out[1] = Math.cos(t); out[2] = (dz / h) * s;
  return out;
}

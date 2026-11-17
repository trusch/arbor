import type { ArborParams } from '../params';
import { Rng } from './rng';
import { PointGrid } from './grid';
import { sampleAttractors, envelopeDims, envelopeDimsYear, sampleShell, YEAR_DATE0 } from './envelope';
import { tel } from '../tel';

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
  /** Estimated sky light 0..1 from the coarse foliage grid. */
  light: number;
  /** Juvenile scale 0..1 (1 = adult wood): internode length, speed, radius floor and leaf size of seedling wood. */
  juv: number;
}

export interface Chain {
  /** Node ids, first is the branch point on the parent chain. */
  nodes: number[];
  order: number;
  alive: boolean;
  starve: number;
  /** Self-pruned (shaded out): not drawn, no pipe contribution. */
  pruned: boolean;
  /** Consecutive light evaluations below the prune threshold. */
  shade: number;
  /** Correlated wander direction (slowly drifting). */
  wx: number; wy: number; wz: number;
  /** Juvenile side shoot (trunk-borne below `crown.bole`): number of segments it grows; shed when the trunk thickens. */
  juv?: number;
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

/** A limb or twig that came off (`TreeSim.breakAt`); renderers drain `TreeSim.breaks`. */
export interface BreakEvent {
  /** First detached node; its parent is the stub end and the hinge point. */
  root: number;
  /** All detached node ids, ascending (root first). */
  nodeIds: number[];
  /** Chains that went with it (all pruned); the first one starts at the stub end. */
  chains: number[];
  time: number;
  /** Leaves that sat on the detached nodes. */
  leaves: number;
  /** Radius at the break. */
  radius: number;
  /** A juvenile side shoot let go by the tree (`shedJuvenile`), not a wind break. */
  shed?: boolean;
}

/** What the breakage rule reads from the wind (`src/wind.ts`; kept structural so the sim stays import-free of it). */
export interface WindLike { base: number; dirX: number; dirZ: number; gust(x: number, z: number): number }
/** Load model constants: sail area per leaf, wood sail/weight factor, gravity moment factor. */
const A_LEAF = 0.012, C_WOOD = 1, G_W = 0.08;
/**
 * Strength scale: `params.breakage.strength` 1 = this sigma, the 98th percentile of u at gust 1.0 on the t = 90 default
 * oak (scripts/breakcalib.mjs): a 120 s full-strength storm (wind.base 1.0) takes about 5 twigs (4 twigs and 1 small limb before the sag-righting change, p98 now 0.94).
 */
export const SIGMA_REF = 9.94e6;

const UP: [number, number, number] = [0, 1, 0];
/**
 * Length scale (m) over which wood recovers from the sag it inherits from its parent segment (gravitropic righting).
 * Without it a long unbranched shoot (twig radius however long: the pipe model sees one tip) carried the summed bend
 * of its whole path, reached the 1.3 rad cap and hung as a bare whip to the ground while its rest pose, where growth
 * decisions are made, was still inside the crown.
 */
/** Growth over years: the first year is exempt from the seasonal gates until this sim time (today's tree, t = 150). */
const YEAR_EXEMPT = 150;
/** G3: leader elongation rate per growth year; laterals keep theirs, so the crown widens faster than it rises. */
const LEADER_VIGOR = [1, 0.6, 0.35];
/** Spring flush: a tip sees new shell attractors within perception x this; buds on the last nodes of each chain. */
const YEAR_REACH = 1.5, YEAR_BUDS = 4;
/** Phases of the growing season at which dead tips are revived and buds set (the first also adds the year's shell). */
const YEAR_WAVES = [0.02, 0.1, 0.18, 0.26];
/** Shell attractors open evenly from bud break over this share of the year (0.02 .. 0.3 of the phase). */
const SHELL_OPEN = 0.28;
const SAG_RIGHT = 3;
/** Steepest downward growth direction (unit dy) a shoot aims for when `growth.weeping` is 0; weeping >= 1 lifts the limit. */
const DOWN_MAX = 0.3;
/**
 * Seedling / sapling phase (only when `crown.bole` > 0). Wood that grows below JUV_H metres is juvenile: its scale
 * `juv` runs from JUV_MIN at the soil to 1 at JUV_H and multiplies internode length; speed, radius floor and leaf size
 * follow it (JUV_SPEED, JUV_RADIUS, JUV_LEAF at the soil). The stem carries leaves from its first node, and trunk buds
 * below the bole break early into short determinate leafy side shoots (JUV_BUDS of them, JUV_BREAK x the usual rate,
 * JUV_SEGS[0..1] segments) which the tree sheds again once the trunk at their base is thicker than
 * JUV_SHED[0..1] x twig radius: that is what leaves the clear bole.
 */
const JUV_H = 1.5, JUV_MIN = 0.2, JUV_SPEED = 0.16, JUV_RADIUS = 0.3, JUV_LEAF = 0.6;
const JUV_BUDS = 0.75, JUV_BREAK = 3, JUV_SEGS = [3, 6], JUV_SHED = [3.2, 6.4];

export class TreeSim {
  nodes: TreeNode[] = [];
  chains: Chain[] = [];
  buds: Bud[] = [];
  leaves: Leaf[] = [];
  time = 0;
  /** Last light-grid snapshot (leafy-node density per voxel) for renderers: baked leaf lighting, canopy shadow. */
  lightGrid: { dens: Float32Array; ox: number; oy: number; oz: number; cell: number; nx: number; ny: number; nz: number } | null = null;
  /** Bumps whenever `lightGrid` is recomputed. */
  lightVersion = 0;
  /** Bumps whenever topology (node/leaf count) changes. */
  topology = 0;
  /** Break events not yet consumed by the renderer (debris). */
  breaks: BreakEvent[] = [];
  /** Per-node accumulated overload (breakage rule), grown on demand. */
  damage = new Float32Array(0);
  /** Last load evaluation: ratio u per evaluated chain base (for calibration), and counters. */
  loadStats = { evals: 0, n: 0, max: 0, over: 0, twigs: 0, limbs: 0 };
  private loadTimer = 0;
  /** Juvenile side shoots: grown, shed so far, and stem/shoot leaves on juvenile wood. */
  shedStats = { shoots: 0, shed: 0, shedLeaves: 0, lastShedT: 0 };
  private ld = { leaf: new Float32Array(0), w: new Float32Array(0), cx: new Float32Array(0), cy: new Float32Array(0), cz: new Float32Array(0) };
  bboxMin = [0, 0, 0];
  bboxMax = [0, 0, 0];

  private rng: Rng;
  private attr!: Float32Array;
  private attrAlive!: Uint8Array;
  private grid!: PointGrid;
  private gridCell = 1;
  private tmp: [number, number, number] = [0, 0, 0];
  private lightTimer = 0;

  // Incremental structure pass (see `updateStructure`). Per node id: parent, child list (descending ids: first child,
  // next sibling), last pipe target and its contribution target^n to the parent, flags and a moved stamp.
  private sCap = 0;
  private sPar = new Int32Array(0);
  private sFirst = new Int32Array(0);
  private sNext = new Int32Array(0);
  private sT = new Float64Array(0);
  private sC = new Float64Array(0);
  /** Copy of `radius` as of the node's last structure visit, so the thickening-only loop touches no node object at rest. */
  private sR = new Float64Array(0);
  /** Bit 1: an input of the bottom-up values changed (recompute); bit 2: radius still below its target (thickening). */
  private sUp = new Uint8Array(0);
  /** Own sag inputs changed (len, radius, subtree length, new node). */
  private sDown = new Uint8Array(0);
  private sStamp = new Int32Array(0);
  private sStampNow = 0;
  private sDownLo = Infinity;
  /** Next `updateStructure` recomputes every node (reset, break, parameter change, node list replaced). */
  private sFull = true;
  private sLen = 0;
  private sParams = [NaN, NaN, NaN, NaN];
  /**
   * Sim seconds between forward passes (sag, world positions) inside `step`; 0 = every step. Between two passes only
   * the elongating tips are placed (on their parents' last positions). Radii and subtree loads are current every step.
   */
  structureInterval = 0.1;
  /**
   * Growth over years (big tree P11 + P12, `?years=3`; 0 = off, the tree of one season). Set before `reset()`. The
   * growth clock is sim time (`envelope.ts` YEAR_DATE0); everything below is a function of it, nothing accumulates.
   */
  years = 0;
  /** Growth year in use (0 = first), clamped to `years - 1`. */
  growYear = 0;
  /** Last growth wave (year x YEAR_WAVES.length + wave) whose tip revival and bud flush ran. */
  private yearDone = 0;
  /** Sim time at which each attractor becomes available (shell points open inside-out over the growing season). */
  private attrT = new Float64Array(0);
  /** Next shell attractor to open (attractors are stored in opening order from `attrOpen0` on). */
  private attrNext = 0;
  /** Thickening factor of this step (G2: 1 through summer, 0 in winter; 1 when `years` is 0). */
  private thickMul = 1;
  private sAcc = 0;
  /** Nodes that elongated or were created since the last forward pass of any kind, parents before children. */
  private sTips: number[] = [];
  private sBox = false;
  /** A pass has run on this tree (false between `reset` and the first pass). */
  private sValid = false;
  /** Counters of the last `updateStructure`: full pass or not, nodes recomputed bottom-up, thickening-only, forward, moved. */
  structStats = { full: 0, fullPasses: 0, up: 0, thick: 0, down: 0, moved: 0, forwardPasses: 0, tipPasses: 0 };

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
    this.lightGrid = null;
    this.lightVersion++;
    this.time = 0;
    this.topology++;
    this.breaks = [];
    this.damage = new Float32Array(0);
    this.shedStats = { shoots: 0, shed: 0, shedLeaves: 0, lastShedT: 0 };
    this.sFull = true; this.sLen = 0; this.sValid = false;
    this.sDownLo = Infinity; this.sTips.length = 0; this.sBox = false; this.sAcc = 0;
    this.yearDone = 0; this.growYear = 0; this.thickMul = 1; this.attrT = new Float64Array(0); this.attrNext = 0;
    this.rebuildAttractors();
    // Root node at ground plus the first growing leader segment.
    const root = this.addNode(-1, 0, 0, 0, 1, 0, 0);
    this.chains.push(this.newChain(root, 0));
    this.lightTimer = 0;
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
    this.attrT = new Float64Array(0); this.attrNext = 0;
    this.gridCell = Math.max(0.3, this.perception());
    this.grid = new PointGrid(this.gridCell, this.attr, this.attrAlive);
    const kill = this.killRadius();
    for (const n of this.nodes) this.grid.query(n.rx, n.ry, n.rz, kill, (i) => (this.attrAlive[i] = 0));
  }

  private newChain(node: number, order: number): Chain {
    const w = this.rng.unit([0, 0, 0]);
    return { nodes: [node], order, alive: true, starve: 0, pruned: false, shade: 0, wx: w[0], wy: w[1], wz: w[2] };
  }

  get attractorCount() {
    let c = 0;
    for (let i = 0; i < this.attrAlive.length; i++) c += this.attrAlive[i];
    return c;
  }

  private perception() {
    return this.params.growth.segmentLength * 7;
  }
  private killRadius() {
    return this.params.growth.segmentLength * 3;
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
      leafy: false, light: 1, juv: 1,
    };
    this.nodes.push(n);
    this.topology++;
    const id = this.nodes.length - 1;
    if (id >= this.sCap) this.sGrow(id + 1);
    if (this.sLen === id) {
      this.sLen = id + 1;
      this.sPar[id] = parent; this.sFirst[id] = -1; this.sT[id] = 0; this.sC[id] = NaN; this.sStamp[id] = 0;
      this.sUp[id] = 1; this.sDown[id] = 1;
      this.sTips.push(id);
      if (id < this.sDownLo) this.sDownLo = id;
      if (parent >= 0) { this.sNext[id] = this.sFirst[parent]; this.sFirst[parent] = id; this.sUp[parent] |= 1; } else this.sNext[id] = -1;
    }
    return id;
  }

  private sGrow(need: number) {
    const cap = Math.ceil(need * 1.5) + 256;
    const i32 = (a: Int32Array) => { const b = new Int32Array(cap); b.set(a); return b; };
    const f64 = (a: Float64Array) => { const b = new Float64Array(cap); b.set(a); return b; };
    const u8 = (a: Uint8Array) => { const b = new Uint8Array(cap); b.set(a); return b; };
    this.sPar = i32(this.sPar); this.sFirst = i32(this.sFirst); this.sNext = i32(this.sNext); this.sStamp = i32(this.sStamp);
    this.sT = f64(this.sT); this.sC = f64(this.sC); this.sR = f64(this.sR); this.sUp = u8(this.sUp); this.sDown = u8(this.sDown);
    this.sCap = cap;
  }

  /** A chain's pruned flag changed: its nodes drop out of (or enter) the pipe and subtree-length sums. */
  private sChainDirty(ch: Chain) {
    const up = this.sUp, nodes = this.nodes;
    if (this.sLen !== nodes.length) { this.sFull = true; return; }
    for (let j = 1; j < ch.nodes.length; j++) {
      const id = ch.nodes[j];
      up[id] |= 1;
      const p = nodes[id].parent;
      if (p >= 0) up[p] |= 1;
    }
  }

  /** Append a new growing segment to the end of chain c. */
  private extend(c: number, dx: number, dy: number, dz: number) {
    const ch = this.chains[c];
    const l = Math.hypot(dx, dy, dz) || 1;
    const tip = ch.nodes[ch.nodes.length - 1];
    const id = this.addNode(tip, c, ch.order, dx / l, dy / l, dz / l, this.params.growth.segmentLength * this.rng.range(0.85, 1.15));
    ch.nodes.push(id);
    if (this.params.crown.bole > 0) {
      const y = this.nodes[tip].ry;
      if (y < JUV_H) {
        const nd = this.nodes[id];
        nd.juv = JUV_MIN + (1 - JUV_MIN) * Math.max(0, y) / JUV_H;
        nd.targetLen *= nd.juv;
        nd.radius *= JUV_RADIUS + (1 - JUV_RADIUS) * nd.juv;
      }
    }
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
    // Growth by year (G1..G3): shoots extend from bud break to midsummer, wood thickens through summer, the leader
    // slows with age. The first year up to YEAR_EXEMPT is exactly today's tree.
    let ext = 1, lead = 1;
    if (this.years > 0) {
      const age = this.time / Math.max(10, p.season.yearLength) + YEAR_DATE0;
      const yi = Math.floor(age), ph = age - yi;
      this.growYear = Math.min(yi, this.years - 1);
      if (yi >= 1 && yi < this.years) {
        // Waves of the growing season: the first one adds this year's shell, every one revives tips and sets buds.
        let w = -1;
        for (let k = 0; k < YEAR_WAVES.length; k++) if (ph >= YEAR_WAVES[k]) w = k;
        const id = yi * YEAR_WAVES.length + w;
        if (w >= 0 && id > this.yearDone) { this.yearDone = id; this.springFlush(yi, w, this.time - (ph - YEAR_WAVES[0]) * Math.max(10, p.season.yearLength)); }
      }
      // Shell attractors open in sequence (pure function of sim time: a point is open from its time on).
      const T = this.attrT, A = this.attrAlive;
      while (this.attrNext < T.length && T[this.attrNext] <= this.time) { A[this.attrNext] = 1; this.grid.add(this.attrNext++); }
      if (this.time >= YEAR_EXEMPT) {
        ext = smoothstep(0, 0.02, ph) * (1 - smoothstep(0.33, 0.4, ph));
        this.thickMul = 1 - smoothstep(0.5, 0.6, ph);
      }
      lead = LEADER_VIGOR[Math.min(LEADER_VIGOR.length - 1, this.growYear)];
    }
    const full = this.nodes.length >= g.maxNodes || ext <= 0;
    // The light tick of this step (shading, self-pruning, juvenile shedding) reads world positions: bring them to the
    // state of the last step before anything elongates, which is exactly what a forward pass every step had left.
    if (this.lightTimer - dt <= 0) this.flushStructure();

    // 1. Elongate growing tips; finished segments spawn the next one.
    if (!full) {
      for (let c = 0; c < this.chains.length; c++) {
        const ch = this.chains[c];
        if (!ch.alive) continue;
        const tipId = ch.nodes[ch.nodes.length - 1];
        const tip = this.nodes[tipId];
        const vigor = Math.pow(g.vigorDecay, ch.order);
        // A seedling starts slowly: juvenile wood elongates at JUV_SPEED..1 of the adult rate.
        const jv = tip.juv < 1 ? JUV_SPEED + (1 - JUV_SPEED) * (tip.juv - JUV_MIN) / (1 - JUV_MIN) : 1;
        tip.len += g.segmentLength * g.growthRate * vigor * jv * dt * ext * (ch.order === 0 ? lead : 1);
        this.sUp[tipId] |= 1; this.sDown[tipId] = 1;
        this.sTips.push(tipId);
        if (tipId < this.sDownLo) this.sDownLo = tipId;
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

    this.lightTimer -= dt;
    if (this.lightTimer <= 0) {
      this.lightTimer = 0.5;
      if (this.shedStats.shoots > this.shedStats.shed) this.shedJuvenile();
      tel.phase('light grid');
      this.updateLight();
      tel.phase('sim step', true);
    }

    this.updateStructure(dt, false, true);
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
    const env = this.years > 0 ? envelopeDimsYear(p, this.growYear, this.years) : envelopeDims(p);
    // Occupy space.
    this.grid.query(n.rx, n.ry, n.rz, this.killRadius(), (i) => (this.attrAlive[i] = 0));

    // Lateral bud.
    const juvenile = p.crown.bole > 0;
    if (ch.order < g.maxOrder && ch.juv === undefined) {
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
    if (ch.order >= 1 || n.ry > env.base * 0.8 || juvenile) {
      n.leafy = true;
      // Juvenile wood: smaller leaves and, on the short internodes, fewer per node (a pair on the seedling's first
      // nodes, 4 further up), so leaf mass per metre of stem stays about that of an adult twig.
      const ls = n.juv < 1 ? JUV_LEAF + (1 - JUV_LEAF) * (n.juv - JUV_MIN) / (1 - JUV_MIN) : 1;
      const nPrim = n.juv < 0.3 ? 2 : 4, nFill = n.juv < 0.5 ? 0 : 4;
      const born = this.time;
      // A cluster at the node: leaves spiral around the twig at golden-angle steps.
      const a0 = n.phyllo + this.rng.range(0, 1);
      for (let k = 0; k < nPrim; k++) {
        this.leaves.push({
          node: id, t: this.rng.range(0.6, 1), around: a0 + k * (nPrim === 2 ? Math.PI : 2.4) + this.rng.range(-0.3, 0.3),
          tilt: this.rng.range(0.3, 0.9), roll: this.rng.range(-0.6, 0.6), size: this.rng.range(0.7, 1.25) * ls,
          rank: (k + this.rng.next()) / 4, born, tint: this.rng.next(),
        });
      }
      // Clump fill: 4 more, smaller leaves toward the twig tip from a per-node hash (does not touch the sim rng, so
      // tree shapes stay identical). Each shares the rank band of a primary leaf, so a cluster shows 2 × density/4 × 4.
      let h = (id * 2654435761 + 0x9e3779b9) >>> 0;
      const hr = () => { h ^= h << 13; h >>>= 0; h ^= h >>> 17; h ^= h << 5; h >>>= 0; return h / 4294967296; };
      for (let k = 0; k < nFill; k++) {
        this.leaves.push({
          node: id, t: 0.72 + 0.28 * hr(), around: a0 + 1.2 + k * 2.4 + (hr() - 0.5) * 0.8,
          tilt: 0.35 + 0.6 * hr(), roll: (hr() - 0.5) * 1.4, size: (0.6 + 0.45 * hr()) * ls,
          rank: (k + hr()) / 4, born, tint: hr(),
        });
      }
    }

    // Choose next direction.
    const pull = this.tmp;
    // A juvenile side shoot is determinate: it ignores the crown volume and stops after its `juv` segments.
    if (ch.juv !== undefined && ch.nodes.length - 1 >= ch.juv) { ch.alive = false; return; }
    const cnt = ch.juv !== undefined ? 0 : this.attractorPull(n.rx, n.ry, n.rz, n.dx, n.dy, n.dz, this.perception(), pull);
    const inCrownZone = n.ry > env.base * 0.95 || ch.order > 0;
    if (ch.juv !== undefined) ch.starve = 0;
    else if (cnt === 0 && inCrownZone) ch.starve++;
    else ch.starve = Math.max(0, ch.starve - 1);
    if (ch.starve > 2 || (ch.order === 0 && cnt === 0 && n.ry > env.base + env.height * 1.05)) {
      ch.alive = false;
      return;
    }
    const sun = this.sunDir();
    const grav = g.gravitropism * Math.min(2, g.gravity);
    // Correlated wander: the chain's bias direction drifts slowly instead of re-rolling every segment.
    const r = this.rng.unit([0, 0, 0]);
    let wx = ch.wx * 0.8 + r[0] * 0.35, wy = ch.wy * 0.8 + r[1] * 0.35, wz = ch.wz * 0.8 + r[2] * 0.35;
    const wl = Math.hypot(wx, wy, wz) || 1;
    ch.wx = wx /= wl; ch.wy = wy /= wl; ch.wz = wz /= wl;
    const att = cnt > 0 ? g.attraction : 0;
    // Trunk below the crown: strong upward drive.
    const lead = ch.order === 0 ? (cnt === 0 ? 1.2 : 0.6) : 0;
    // Weeping: twigs of order >= 2 bend down (positive gravitropism) ∝ gravity.
    const weep = ch.order >= 2 ? g.weeping * Math.min(3, g.gravity) * Math.min(1, (ch.order - 1) * 0.6) : 0;
    let dx = n.dx * g.straightness + pull[0] * att + sun[0] * g.phototropism + wx * g.wander;
    let dy = n.dy * g.straightness + pull[1] * att + sun[1] * g.phototropism + (grav + lead - weep) * UP[1] + wy * g.wander;
    let dz = n.dz * g.straightness + pull[2] * att + sun[2] * g.phototropism + wz * g.wander;
    // Torsion: twist the direction about the vertical axis each segment (spiralling growth).
    if (g.torsion !== 0) {
      const ta = ((g.torsion * Math.PI) / 180) * (ch.order % 2 ? -1 : 1);
      const ct = Math.cos(ta), st = Math.sin(ta);
      const ndx = dx * ct - dz * st;
      dz = dx * st + dz * ct; dx = ndx;
    }
    // Limit the per-segment turn so branches bend smoothly and never loop back.
    const l = Math.hypot(dx, dy, dz) || 1;
    dx /= l; dy /= l; dz /= l;
    // No plunging shoots: without a weeping habit the wanted direction is never steeper than DOWN_MAX below the
    // horizontal (attractors below a high branch used to pull order 1 shoots metres straight down through the crown).
    // A shoot that starts steeper (bud angle on a descending parent) levels out at maxTurn per segment.
    const minDy = -(DOWN_MAX + (1 - DOWN_MAX) * Math.min(1, Math.max(0, g.weeping)));
    if (dy < minDy) {
      const h = Math.hypot(dx, dz);
      if (h > 1e-4) { const f = Math.sqrt(1 - minDy * minDy) / h; dx *= f; dz *= f; dy = minDy; }
    }
    const maxT = (g.maxTurn * Math.PI) / 180;
    const cosA = Math.max(-1, Math.min(1, dx * n.dx + dy * n.dy + dz * n.dz));
    const ang = Math.acos(cosA);
    if (ang > maxT && ang > 1e-5) {
      // Slerp from current direction toward desired by maxT.
      const so = Math.sin(ang);
      const a = Math.sin(ang - maxT) / so, b = Math.sin(maxT) / so;
      dx = n.dx * a + dx * b; dy = n.dy * a + dy * b; dz = n.dz * a + dz * b;
    }
    this.extend(c, dx, dy, dz);
  }

  /**
   * Start of growing year `yi` (T9): attractors in the shell between last year's and this year's envelope, the tips
   * of unpruned chains that can see them grow on (new wood on the old scaffold), and the last nodes of every unpruned
   * chain get a fresh lateral bud.
   */
  private springFlush(yi: number, wave: number, t0: number) {
    const p = this.params, g = p.growth;
    if (wave === 0) {
      // This year's shell, sorted inside-out (distance from the crown base point in envelope units) and opened at an
      // even rate from bud break (t0) to SHELL_OPEN of the year, so the crown grows through the season, not in a burst.
      const add = sampleShell(p, p.seed.seed, yi, this.years);
      const env = envelopeDimsYear(p, yi, this.years), m = add.length / 3;
      const key = new Float64Array(m), ord = new Uint32Array(m);
      for (let i = 0; i < m; i++) {
        ord[i] = i;
        key[i] = Math.hypot(add[i * 3] / env.radius, (add[i * 3 + 1] - env.base) / env.height, add[i * 3 + 2] / env.radius);
      }
      ord.sort((x, y) => key[x] - key[y]);
      const n0 = this.attr.length / 3;
      const attr = new Float32Array((n0 + m) * 3);
      attr.set(this.attr);
      const T = new Float64Array(n0 + m);
      const Y = Math.max(10, p.season.yearLength);
      for (let j = 0; j < m; j++) {
        const i = ord[j];
        attr[(n0 + j) * 3] = add[i * 3]; attr[(n0 + j) * 3 + 1] = add[i * 3 + 1]; attr[(n0 + j) * 3 + 2] = add[i * 3 + 2];
        T[n0 + j] = t0 + Y * SHELL_OPEN * (j + 0.5) / m;
      }
      const alive = new Uint8Array(n0 + m);
      alive.set(this.attrAlive);
      this.attr = attr; this.attrAlive = alive; this.attrT = T; this.attrNext = n0;
      this.grid = new PointGrid(this.gridCell, this.attr, this.attrAlive);
    }
    const tmp: [number, number, number] = [0, 0, 0];
    const nChains = this.chains.length;
    for (let c = 0; c < nChains; c++) {
      const ch = this.chains[c];
      if (ch.pruned || ch.juv !== undefined || ch.nodes.length < 2) continue;
      const tipId = ch.nodes[ch.nodes.length - 1], n = this.nodes[tipId];
      if (!ch.alive && this.nodes.length < g.maxNodes) {
        const cnt = this.attractorPull(n.rx, n.ry, n.rz, n.dx, n.dy, n.dz, this.perception() * YEAR_REACH, tmp);
        if (cnt > 0 && n.len >= n.targetLen) {
          ch.alive = true; ch.starve = 0;
          this.extend(c, n.dx + tmp[0], n.dy + tmp[1], n.dz + tmp[2]);
        }
      }
      if (ch.order >= g.maxOrder) continue;
      const a = (g.branchAngle * Math.PI) / 180, ca = Math.cos(a), sa = Math.sin(a);
      for (let k = Math.max(1, ch.nodes.length - YEAR_BUDS); k < ch.nodes.length; k++) {
        const id = ch.nodes[k], m = this.nodes[id];
        if (m.len < m.targetLen) continue;
        const [px, py, pz] = perpendicular(m.dx, m.dy, m.dz, m.phyllo + 1.3);
        this.buds.push({ node: id, chain: c, indexInChain: k, dx: m.dx * ca + px * sa, dy: m.dy * ca + py * sa, dz: m.dz * ca + pz * sa, born: this.time });
      }
    }
    this.lightTimer = 0;
  }

  private budBreak(dt: number) {
    const g = this.params.growth;
    const range = g.apicalDominance * 10;
    const g_r0 = this.params.thickness.twigRadius;
    const tmp: [number, number, number] = [0, 0, 0];
    for (let i = this.buds.length - 1; i >= 0; i--) {
      const b = this.buds[i];
      const ch = this.chains[b.chain];
      const age = this.time - b.born;
      // Buds on shaded-out (pruned) wood are dead too: they used to stay up to 40 s and could even break.
      if (age > 40 || ch.pruned) {
        this.buds[i] = this.buds[this.buds.length - 1];
        this.buds.pop();
        continue;
      }
      let release = 1;
      if (ch.alive) {
        const d = ch.nodes.length - 1 - b.indexInChain;
        release = smoothstep(range, range + 4, d);
      }
      const n = this.nodes[b.node];
      // Below `crown.bole` a trunk bud does not make a limb (that is the clear bole of the grown tree). On the young
      // stem it breaks early into a short leafy side shoot instead, which is shed later (`shedJuvenile`).
      if (ch.order === 0 && n.ry < this.params.crown.bole) {
        if (age < 0.5 || n.radius > g_r0 * JUV_SHED[0]) continue;
        // Weak apical dominance on the young stem: side shoots follow 2 to 5 nodes behind the tip.
        const rel = ch.alive ? smoothstep(2, 5, ch.nodes.length - 1 - b.indexInChain) : 1;
        if (this.rng.next() > g.branchingProbability * rel * JUV_BREAK * dt) continue;
        this.buds[i] = this.buds[this.buds.length - 1];
        this.buds.pop();
        if (hash01(b.node) > JUV_BUDS) continue;
        const c = this.chains.length;
        const jc = this.newChain(b.node, 1);
        jc.juv = Math.round(JUV_SEGS[0] + (JUV_SEGS[1] - JUV_SEGS[0]) * hash01(b.node + 7919));
        this.chains.push(jc);
        this.shedStats.shoots++;
        // Starts well out from the stem and a little upward.
        this.extend(c, b.dx, b.dy * 0.6 + 0.25, b.dz);
        continue;
      }
      const vigor = Math.pow(g.vigorDecay, ch.order + 1) * (ch.order === 0 ? g.scaffoldBranching : 1);
      if (this.rng.next() > g.branchingProbability * release * vigor * dt) continue;
      const cnt = this.attractorPull(n.rx, n.ry, n.rz, b.dx, b.dy, b.dz, this.perception() * 1.2, tmp);
      this.buds[i] = this.buds[this.buds.length - 1];
      this.buds.pop();
      if (cnt < 4) continue; // shaded / no space: bud stays dormant forever
      const c = this.chains.length;
      this.chains.push(this.newChain(b.node, ch.order + 1));
      this.extend(c, b.dx * 2 + tmp[0] * 0.5, b.dy * 2 + tmp[1] * 0.5, b.dz * 2 + tmp[2] * 0.5);
    }
  }

  /**
   * Coarse light model: leafy nodes are binned into a voxel grid; each voxel's
   * light is the mean transmittance toward the sky (up) and four horizontal
   * directions. Shaded side twigs are self-pruned.
   */
  private updateLight() {
    const nodes = this.nodes, N = nodes.length;
    if (N < 50) return;
    const cell = this.params.growth.segmentLength * 4;
    const mn = this.bboxMin, mx = this.bboxMax;
    const ox = mn[0] - cell, oy = Math.min(0, mn[1]) - cell, oz = mn[2] - cell;
    const nx = Math.ceil((mx[0] - ox) / cell) + 2, ny = Math.ceil((mx[1] - oy) / cell) + 2, nz = Math.ceil((mx[2] - oz) / cell) + 2;
    if (!isFinite(nx * ny * nz) || nx * ny * nz > 400000) return;
    const idx = (x: number, y: number, z: number) => (y * nz + z) * nx + x;
    const dens = new Float32Array(nx * ny * nz);
    const cellOf = new Int32Array(N);
    for (let i = 0; i < N; i++) {
      const nd = nodes[i];
      const x = Math.floor((nd.wx - ox) / cell), y = Math.floor((nd.wy - oy) / cell), z = Math.floor((nd.wz - oz) / cell);
      const c = x >= 0 && y >= 0 && z >= 0 && x < nx && y < ny && z < nz ? idx(x, y, z) : -1;
      cellOf[i] = c;
      if (c >= 0 && nd.leafy && !this.chains[nd.chain].pruned) dens[c] += 1;
    }
    this.lightGrid = { dens, ox, oy, oz, cell, nx, ny, nz };
    this.lightVersion++;
    const k = 0.05;
    const up = new Float32Array(dens.length), sx0 = new Float32Array(dens.length), sx1 = new Float32Array(dens.length);
    const sz0 = new Float32Array(dens.length), sz1 = new Float32Array(dens.length);
    for (let x = 0; x < nx; x++) for (let z = 0; z < nz; z++) {
      let acc = 0;
      for (let y = ny - 1; y >= 0; y--) { const c = idx(x, y, z); up[c] = acc + dens[c] * 0.5; acc += dens[c]; }
    }
    for (let y = 0; y < ny; y++) for (let z = 0; z < nz; z++) {
      let a = 0, b = 0;
      for (let x = 0; x < nx; x++) { const c = idx(x, y, z); sx0[c] = a + dens[c] * 0.5; a += dens[c]; }
      for (let x = nx - 1; x >= 0; x--) { const c = idx(x, y, z); sx1[c] = b + dens[c] * 0.5; b += dens[c]; }
    }
    for (let y = 0; y < ny; y++) for (let x = 0; x < nx; x++) {
      let a = 0, b = 0;
      for (let z = 0; z < nz; z++) { const c = idx(x, y, z); sz0[c] = a + dens[c] * 0.5; a += dens[c]; }
      for (let z = nz - 1; z >= 0; z--) { const c = idx(x, y, z); sz1[c] = b + dens[c] * 0.5; b += dens[c]; }
    }
    for (let i = 0; i < N; i++) {
      const c = cellOf[i];
      if (c < 0) { nodes[i].light = 1; continue; }
      const L = (2 * Math.exp(-k * up[c]) + Math.exp(-k * sx0[c]) + Math.exp(-k * sx1[c]) + Math.exp(-k * sz0[c]) + Math.exp(-k * sz1[c])) / 6;
      nodes[i].light = L;
    }
    const thr = this.params.growth.selfPrune;
    for (const ch of this.chains) {
      if (ch.pruned) continue;
      const parentChain = this.chains[nodes[ch.nodes[0]].chain];
      if (parentChain !== ch && parentChain.pruned) { ch.pruned = true; ch.alive = false; this.sChainDirty(ch); continue; }
      if (thr <= 0 || ch.order < 2 || ch.nodes.length < 2) { ch.shade = 0; continue; }
      let L = 0;
      for (let j = 1; j < ch.nodes.length; j++) L = Math.max(L, nodes[ch.nodes[j]].light);
      if (L < thr) ch.shade++; else ch.shade = 0;
      if (ch.shade >= 4) { ch.pruned = true; ch.alive = false; this.sChainDirty(ch); }
    }
  }

  /**
   * Natural pruning of the juvenile side shoots: one per call (2 Hz of sim time) at most, lowest first, once the trunk
   * at its base is thicker than the shoot's threshold (JUV_SHED x twig radius, spread per shoot so they go over several
   * seconds). The shoot becomes a pruned chain (no stub: the bark closes over it) and a `BreakEvent` with `shed` set
   * lets the renderer drop its leaves through the falling-leaf system.
   */
  private shedJuvenile() {
    const nodes = this.nodes, chains = this.chains, r0 = this.params.thickness.twigRadius;
    let pick = -1, py = Infinity;
    for (let c = 1; c < chains.length; c++) {
      const ch = chains[c];
      if (ch.juv === undefined || ch.pruned) continue;
      const b = nodes[ch.nodes[0]];
      if (b.radius < r0 * (JUV_SHED[0] + (JUV_SHED[1] - JUV_SHED[0]) * hash01(ch.nodes[0] + 104729))) continue;
      if (b.ry < py) { py = b.ry; pick = c; }
    }
    if (pick < 0) return;
    const ch = chains[pick];
    ch.pruned = true; ch.alive = false;
    this.sChainDirty(ch);
    const nodeIds = ch.nodes.slice(1);
    const inSub = new Set(nodeIds);
    let lv = 0;
    for (const lf of this.leaves) if (inSub.has(lf.node)) lv++;
    this.shedStats.shed++; this.shedStats.shedLeaves += lv; this.shedStats.lastShedT = this.time;
    this.topology++;
    this.breaks.push({ root: nodeIds[0], nodeIds, chains: [pick], time: this.time, leaves: lv, radius: nodes[nodeIds[0]].radius, shed: true });
    if (this.breaks.length > 16) this.breaks.shift();
  }

  /**
   * Snap the limb at node `id` off the tree (audit 3.5 "Breakage rule"). The break is made at a chain base: `id` is
   * resolved to its chain, and the chain keeps its first segment as a stub when it is long enough (the remainder moves
   * to a new, pruned chain so every node keeps a valid chain index). Every chain rooted in the detached set is pruned,
   * buds on detached nodes are dropped, topology bumps and a `BreakEvent` is pushed. Returns null when nothing can
   * break there (trunk, already pruned, unknown node).
   */
  breakAt(id: number): BreakEvent | null {
    const nodes = this.nodes, chains = this.chains, N = nodes.length;
    const nd0 = nodes[id];
    if (!nd0 || nd0.parent < 0) return null;
    const ci = nd0.chain, ch = chains[ci];
    if (!ch || ch.order < 1 || ch.pruned || ch.nodes.length < 2) return null;
    const list: number[] = [];
    let root: number;
    if (ch.nodes.length >= 4) {
      // Stub: the chain keeps [branch point, first node]; the rest becomes a pruned chain of its own.
      const rest = ch.nodes.splice(2);
      root = rest[0];
      const nc = chains.length;
      chains.push({ nodes: [ch.nodes[1], ...rest], order: ch.order, alive: false, starve: 0, pruned: true, shade: 0, wx: ch.wx, wy: ch.wy, wz: ch.wz });
      for (const j of rest) nodes[j].chain = nc;
      ch.alive = false;
      list.push(nc);
    } else {
      root = ch.nodes[1];
      ch.pruned = true; ch.alive = false;
      list.push(ci);
    }
    // Children have larger ids than parents: one forward scan marks the subtree.
    const inSub = new Uint8Array(N);
    inSub[root] = 1;
    const nodeIds = [root];
    for (let j = root + 1; j < N; j++) if (inSub[nodes[j].parent]) { inSub[j] = 1; nodeIds.push(j); }
    for (let c = 0; c < chains.length; c++) {
      const cc = chains[c];
      if (cc.nodes.length < 2 || !inSub[cc.nodes[1]]) continue;
      if (!cc.pruned) { cc.pruned = true; cc.alive = false; }
      if (c !== list[0]) list.push(c);
    }
    for (let i = this.buds.length - 1; i >= 0; i--) {
      const b = this.buds[i];
      if (inSub[b.node] || chains[b.chain].pruned) { this.buds[i] = this.buds[this.buds.length - 1]; this.buds.pop(); }
    }
    let lv = 0;
    for (const lf of this.leaves) if (inSub[lf.node]) lv++;
    this.topology++;
    this.sFull = true; // chain membership and pruned flags of a whole subtree changed
    this.lightTimer = 0; // the light grid (leaf bake, canopy shadow, meadow shade) follows on the next step
    const ev: BreakEvent = { root, nodeIds, chains: list, time: this.time, leaves: lv, radius: nodes[root].radius };
    this.breaks.push(ev);
    if (this.breaks.length > 16) this.breaks.shift();
    return ev;
  }

  /**
   * Wind-load ratio u = M / S at every chain base of order >= 1 (audit 3.5 "Breakage rule"). One bottom-up pass
   * accumulates leaf count, weight and the weighted centroid per subtree. Wind force F = q (A_LEAF subLeaf + C_WOOD
   * subLen 2r), q = gust^2 at the node; lever = node-to-centroid distance perpendicular to the wind; M = F d + G_W subW
   * d_horizontal; S = sigma r^3. `gustOverride` evaluates at a fixed gust (calibration). `out(id, u, subtreeLen)` is
   * called per evaluated chain base.
   */
  loadRatios(wind: WindLike, sigma: number, out: (id: number, u: number, subLen: number) => void, gustOverride = -1) {
    const nodes = this.nodes, chains = this.chains, N = nodes.length, L = this.ld;
    if (L.w.length < N) {
      const cap = Math.ceil(N * 1.5) + 64;
      L.leaf = new Float32Array(cap); L.w = new Float32Array(cap); L.cx = new Float32Array(cap); L.cy = new Float32Array(cap); L.cz = new Float32Array(cap);
    }
    this.flushStructure();
    const lf = L.leaf, sw = L.w, cx = L.cx, cy = L.cy, cz = L.cz;
    lf.fill(0, 0, N); sw.fill(0, 0, N); cx.fill(0, 0, N); cy.fill(0, 0, N); cz.fill(0, 0, N);
    for (const l of this.leaves) lf[l.node] += 1;
    for (let i = N - 1; i > 0; i--) {
      const nd = nodes[i];
      if (chains[nd.chain].pruned) { lf[i] = 0; continue; }
      const w = A_LEAF * lf[i] + C_WOOD * nd.len * nd.radius;
      sw[i] += w; cx[i] += nd.wx * w; cy[i] += nd.wy * w; cz[i] += nd.wz * w;
      const p = nd.parent;
      lf[p] += lf[i]; sw[p] += sw[i]; cx[p] += cx[i]; cy[p] += cy[i]; cz[p] += cz[i];
    }
    for (let c = 1; c < chains.length; c++) {
      const ch = chains[c];
      // Juvenile side shoots are the tree's to shed, not the wind's (their thin wood is outside the calibration).
      if (ch.pruned || ch.order < 1 || ch.nodes.length < 2 || ch.juv !== undefined) continue;
      const i = ch.nodes[1], nd = nodes[i], W = sw[i];
      if (W <= 0) continue;
      const vx = cx[i] / W - nd.wx, vy = cy[i] / W - nd.wy, vz = cz[i] / W - nd.wz;
      const al = vx * wind.dirX + vz * wind.dirZ;
      const px = vx - al * wind.dirX, pz = vz - al * wind.dirZ;
      const d = Math.sqrt(px * px + vy * vy + pz * pz), dh = Math.hypot(vx, vz);
      const g = gustOverride >= 0 ? gustOverride : wind.gust(nd.wx, nd.wz);
      const F = g * g * (A_LEAF * lf[i] + C_WOOD * nd.subLen * 2 * nd.radius);
      const r = nd.radius;
      out(i, (F * d + G_W * W * dh) / (sigma * SIGMA_REF * r * r * r), nd.subLen);
    }
  }

  /**
   * Breakage rule, call once per frame with real seconds. Evaluated at 4 Hz and only while `wind.base` > 0.6 (a calm
   * or breezy day never breaks anything). Damage accumulates: damage += dt max(0, u - 1); a chain base whose damage
   * passes 1 breaks (at most one per evaluation, the most damaged). Returns the break event or null.
   */
  windLoad(dt: number, wind: WindLike, sigma: number): BreakEvent | null {
    if (wind.base <= 0.6 || sigma <= 0) { this.loadTimer = 0; return null; }
    this.loadTimer += dt;
    if (this.loadTimer < 0.25) return null;
    const step = Math.min(0.5, this.loadTimer);
    this.loadTimer = 0;
    if (this.damage.length < this.nodes.length) { const d = new Float32Array(Math.ceil(this.nodes.length * 1.5) + 64); d.set(this.damage); this.damage = d; }
    const D = this.damage, st = this.loadStats;
    let worst = -1, wd = 1, n = 0, max = 0, over = 0;
    this.loadRatios(wind, sigma, (i, u) => {
      n++;
      if (u > max) max = u;
      if (u > 1) { over++; D[i] += step * (u - 1); if (D[i] > wd) { wd = D[i]; worst = i; } }
    });
    st.evals++; st.n = n; st.max = max; st.over = over;
    if (worst < 0) return null;
    const ev = this.breakAt(worst);
    if (ev) { D[worst] = 0; if (ev.nodeIds.length < 30) st.twigs++; else st.limbs++; }
    return ev;
  }

  /**
   * Pipe-model radii, subtree loads, gravity sag and world positions. Incremental: only nodes whose inputs changed are
   * recomputed, with the arithmetic and summation order of the full pass, so the result is bit-equal to recomputing
   * everything. Bottom-up (pipe, subtree length, radius target): a node is redone when its length changed, a child was
   * added, a child's contribution changed or a chain at it was pruned; a node whose radius is still below its target
   * only gets the thickening step. Top-down (sag, world position): a node is redone when its own length, radius or
   * subtree length changed or its parent's sag or position changed; a redone node whose values come out the same stops
   * the cascade. `full` (also: after reset, `breakAt`, a change of the parameters read here, a replaced node list)
   * recomputes every node with the plain loops.
   */
  updateStructure(dt: number, full = false, defer = false) {
    const p = this.params;
    const nodes = this.nodes;
    const N = nodes.length;
    const n = Math.max(1.2, p.thickness.exponent);
    const r0 = p.thickness.twigRadius;
    const k = 1 - Math.exp(-(this.years > 0 ? dt * this.thickMul : dt) * p.thickness.thickeningRate * 4);
    const gk = p.growth.gravity * p.growth.sag * 4e-6;
    // A weeping habit is the lack of that righting: `growth.weeping` >= 1 switches it off (sag sums up as it used to).
    const right = (1 - Math.min(1, Math.max(0, p.growth.weeping))) / SAG_RIGHT;
    const sp = this.sParams, st = this.structStats;
    if (sp[0] !== n || sp[1] !== r0 || sp[2] !== gk || sp[3] !== right) { sp[0] = n; sp[1] = r0; sp[2] = gk; sp[3] = right; full = true; }
    if (full || this.sFull || this.sLen !== N) { this.structureFull(dt, n, r0, k, gk, right); this.sTips.length = 0; this.sAcc = 0; this.sBox = false; return; }
    st.full = 0;
    const chains = this.chains, up = this.sUp, down = this.sDown, T = this.sT, C = this.sC, R = this.sR, first = this.sFirst, next = this.sNext;
    let lo = this.sDownLo, nUp = 0, nThick = 0;
    const inv = 1 / n, kk = dt > 0 ? k : 1, snap = dt <= 0;
    for (let i = N - 1; i >= 0; i--) {
      const f = up[i];
      if (f === 0) continue;
      if (f === 2) {
        // Thickening only: inputs unchanged, the radius approaches its stored target (same two lines as below).
        nThick++;
        const target = T[i], r = R[i];
        let nr = target > r ? r + (target - r) * kk : r;
        if (snap) nr = Math.max(nr, target * 0.999);
        if (nr !== r) { nodes[i].radius = nr; R[i] = nr; down[i] = 1; if (i < lo) lo = i; if (!(target > nr)) up[i] = 0; }
        continue;
      }
      const nd = nodes[i];
      let target: number;
      {
        nUp++;
        let pipe = 0, sub = 0;
        for (let c = first[i]; c >= 0; c = next[c]) {
          const cn = nodes[c];
          if (chains[cn.chain].pruned) continue;
          pipe += C[c]; sub += cn.subLen;
        }
        const rj = nd.juv < 1 ? r0 * (JUV_RADIUS + (1 - JUV_RADIUS) * nd.juv) : r0;
        if (pipe === 0) {
          const fl = nd.targetLen > 0 ? nd.len / nd.targetLen : 1;
          target = rj * (0.35 + 0.65 * fl);
        } else {
          target = Math.max(rj, Math.pow(pipe, inv));
        }
        if (!chains[nd.chain].pruned) sub += nd.len;
        const c = Math.pow(target, n);
        let chg = c !== C[i];
        if (sub !== nd.subLen) { nd.subLen = sub; chg = true; down[i] = 1; if (i < lo) lo = i; }
        nd.pipe = pipe; T[i] = target; C[i] = c;
        if (chg && nd.parent >= 0) up[nd.parent] |= 1;
      }
      const r = nd.radius;
      if (target > r) nd.radius += (target - r) * kk;
      if (snap) nd.radius = Math.max(nd.radius, target * 0.999);
      if (nd.radius !== r) { down[i] = 1; if (i < lo) lo = i; }
      R[i] = nd.radius;
      up[i] = target > nd.radius ? 2 : 0;
    }
    st.up = nUp; st.thick = nThick;
    this.sDownLo = lo;
    if (defer && this.structureInterval > 0 && (this.sAcc += dt) < this.structureInterval - 1e-9) this.structureTips(gk, right);
    else this.structureForward(gk, right);
  }

  /**
   * Bring sag and world positions up to date now (no radius change). `step` defers the forward pass
   * (`structureInterval`); a reader that needs exact positions between two passes calls this first.
   */
  flushStructure() {
    if (!this.sValid || this.sLen !== this.nodes.length) return;
    if (this.sDownLo === Infinity && !this.sBox) return;
    this.structureForward(this.sParams[2], this.sParams[3]);
  }

  /** Forward pass over the nodes at and below the lowest changed id: sag and world position of every node whose inputs moved. */
  private structureForward(gk: number, right: number) {
    const nodes = this.nodes, N = nodes.length, down = this.sDown, st = this.structStats;
    const lo = this.sDownLo;
    let nDown = 0, moved = 0;
    if (lo < N) {
      const par = this.sPar, stamp = this.sStamp, now = ++this.sStampNow, tmp = this.tmp;
      for (let i = lo; i < N; i++) {
        const pi = par[i];
        const own = down[i];
        if (own === 0 && (pi < 0 || stamp[pi] !== now)) continue;
        down[i] = 0; nDown++;
        const nd = nodes[i];
        if (pi < 0) {
          nd.wx = nd.rx; nd.wy = nd.ry; nd.wz = nd.rz; nd.sag = 0;
          nd.wdx = 0; nd.wdy = 1; nd.wdz = 0;
          stamp[i] = now; moved++;
          continue;
        }
        const pn = nodes[pi];
        const h = Math.hypot(nd.dx, nd.dz);
        const bend = Math.min(0.08, (gk * nd.subLen * nd.len * h) / (nd.radius * nd.radius));
        const sag = Math.min(1.3, pn.sag * Math.exp(-nd.len * right) + bend);
        bendDown(nd.dx, nd.dy, nd.dz, sag, tmp);
        const wx = pn.wx + tmp[0] * nd.len, wy = pn.wy + tmp[1] * nd.len, wz = pn.wz + tmp[2] * nd.len;
        if (own !== 0 || sag !== nd.sag || wx !== nd.wx || wy !== nd.wy || wz !== nd.wz) { stamp[i] = now; moved++; }
        nd.sag = sag;
        nd.wdx = tmp[0]; nd.wdy = tmp[1]; nd.wdz = tmp[2];
        nd.wx = wx; nd.wy = wy; nd.wz = wz;
      }
    }
    this.sDownLo = Infinity; this.sTips.length = 0; this.sAcc = 0;
    st.down = nDown; st.moved = moved; st.forwardPasses++;
    if (moved > 0 || this.sBox) {
      this.sBox = false;
      const mn = this.bboxMin, mx = this.bboxMax;
      mn[0] = mn[1] = mn[2] = Infinity;
      mx[0] = mx[1] = mx[2] = -Infinity;
      for (let i = 0; i < N; i++) {
        const nd = nodes[i];
        if (nd.wx < mn[0]) mn[0] = nd.wx; if (nd.wy < mn[1]) mn[1] = nd.wy; if (nd.wz < mn[2]) mn[2] = nd.wz;
        if (nd.wx > mx[0]) mx[0] = nd.wx; if (nd.wy > mx[1]) mx[1] = nd.wy; if (nd.wz > mx[2]) mx[2] = nd.wz;
      }
    }
  }

  /**
   * Between two forward passes: only the segments that elongated or were created in this step are placed, on their
   * parents' positions of the last pass, so a growing tip moves every step. Everything else (sag of loaded wood, what
   * hangs below it) waits for the next forward pass, which also redoes these nodes if their parents moved.
   */
  private structureTips(gk: number, right: number) {
    const nodes = this.nodes, tips = this.sTips, down = this.sDown, tmp = this.tmp, mn = this.bboxMin, mx = this.bboxMax;
    for (let j = 0; j < tips.length; j++) {
      const i = tips[j], nd = nodes[i];
      if (nd.parent < 0 || down[i] === 0) continue;
      const pn = nodes[nd.parent];
      const h = Math.hypot(nd.dx, nd.dz);
      const bend = Math.min(0.08, (gk * nd.subLen * nd.len * h) / (nd.radius * nd.radius));
      nd.sag = Math.min(1.3, pn.sag * Math.exp(-nd.len * right) + bend);
      bendDown(nd.dx, nd.dy, nd.dz, nd.sag, tmp);
      nd.wdx = tmp[0]; nd.wdy = tmp[1]; nd.wdz = tmp[2];
      nd.wx = pn.wx + tmp[0] * nd.len; nd.wy = pn.wy + tmp[1] * nd.len; nd.wz = pn.wz + tmp[2] * nd.len;
      if (nd.wx < mn[0]) mn[0] = nd.wx; if (nd.wy < mn[1]) mn[1] = nd.wy; if (nd.wz < mn[2]) mn[2] = nd.wz;
      if (nd.wx > mx[0]) mx[0] = nd.wx; if (nd.wy > mx[1]) mx[1] = nd.wy; if (nd.wz > mx[2]) mx[2] = nd.wz;
    }
    if (tips.length) this.sBox = true;
    tips.length = 0;
    const st = this.structStats;
    st.down = 0; st.moved = 0; st.tipPasses++;
  }

  /** The plain pass over every node (the reference the incremental pass must equal); also rebuilds the incremental state. */
  private structureFull(dt: number, n: number, r0: number, k: number, gk: number, right: number) {
    const nodes = this.nodes, N = nodes.length;
    if (N > this.sCap) this.sGrow(N);
    const T = this.sT, C = this.sC, R = this.sR, up = this.sUp, par = this.sPar, first = this.sFirst, next = this.sNext;
    first.fill(-1, 0, N); this.sDown.fill(0, 0, N);
    for (let i = 0; i < N; i++) {
      const pi = nodes[i].parent;
      par[i] = pi;
      if (pi >= 0) { next[i] = first[pi]; first[pi] = i; } else next[i] = -1;
    }
    this.sLen = N; this.sFull = false; this.sValid = true; this.sDownLo = Infinity;
    const st = this.structStats;
    st.full = 1; st.fullPasses++; st.up = N; st.thick = 0; st.down = N; st.moved = N;
    for (let i = 0; i < N; i++) {
      nodes[i].pipe = 0;
      nodes[i].subLen = 0;
    }
    // Children always have larger ids than parents: reverse pass is bottom-up.
    for (let i = N - 1; i >= 0; i--) {
      const nd = nodes[i];
      let target: number;
      // Juvenile wood starts thinner than an adult twig (a seedling stem is a few mm) and thickens with what it carries.
      const rj = nd.juv < 1 ? r0 * (JUV_RADIUS + (1 - JUV_RADIUS) * nd.juv) : r0;
      if (nd.pipe === 0) {
        const f = nd.targetLen > 0 ? nd.len / nd.targetLen : 1;
        target = rj * (0.35 + 0.65 * f);
      } else {
        target = Math.max(rj, Math.pow(nd.pipe, 1 / n));
      }
      // Secondary growth only ever adds wood: radii never shrink (pruned twigs leave their girth behind).
      if (target > nd.radius) nd.radius += (target - nd.radius) * (dt > 0 ? k : 1);
      if (dt <= 0) nd.radius = Math.max(nd.radius, target * 0.999);
      T[i] = target; C[i] = Math.pow(target, n); R[i] = nd.radius; up[i] = target > nd.radius ? 2 : 0;
      if (this.chains[nd.chain].pruned) continue;
      nd.subLen += nd.len;
      if (nd.parent >= 0) {
        const pn = nodes[nd.parent];
        pn.pipe += C[i];
        pn.subLen += nd.subLen;
      }
    }
    // Forward pass: accumulate sag (bend toward -Y) and world positions.
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
        const bend = Math.min(0.08, (gk * nd.subLen * nd.len * h) / (nd.radius * nd.radius));
        // Inherited sag fades over SAG_RIGHT metres of wood (each new internode rights itself toward the direction it
        // grew in), so droop is local to the loaded stretch instead of piling up along the whole path to the cap.
        nd.sag = Math.min(1.3, pn.sag * Math.exp(-nd.len * right) + bend);
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

  /**
   * Debug: is the incremental state stale? Runs `updateStructure(0)` incrementally and as a full pass from the same
   * state and returns the largest differences (all 0 = bit-equal). Leaves the tree in the full-pass state.
   */
  structureCheck() {
    const nodes = this.nodes, N = nodes.length;
    const snap = () => { const a = new Float64Array(N * 10); for (let i = 0; i < N; i++) { const d = nodes[i], o = i * 10; a[o] = d.radius; a[o + 1] = d.sag; a[o + 2] = d.wx; a[o + 3] = d.wy; a[o + 4] = d.wz; a[o + 5] = d.wdx; a[o + 6] = d.wdy; a[o + 7] = d.wdz; a[o + 8] = d.subLen; a[o + 9] = d.pipe; } return a; };
    const s0 = snap();
    const wasFull = this.sFull || this.sLen !== N;
    this.updateStructure(0);
    const inc = snap(), bb = [...this.bboxMin, ...this.bboxMax];
    for (let i = 0; i < N; i++) { const d = nodes[i], o = i * 10; d.radius = s0[o]; d.sag = s0[o + 1]; d.wx = s0[o + 2]; d.wy = s0[o + 3]; d.wz = s0[o + 4]; d.wdx = s0[o + 5]; d.wdy = s0[o + 6]; d.wdz = s0[o + 7]; d.subLen = s0[o + 8]; d.pipe = s0[o + 9]; }
    this.updateStructure(0, true);
    const ref = snap(), bb2 = [...this.bboxMin, ...this.bboxMax];
    const out = { nodes: N, incremental: !wasFull, radius: 0, sag: 0, pos: 0, dir: 0, subLen: 0, bbox: 0, differing: 0 };
    for (let i = 0; i < N; i++) {
      const o = i * 10; let any = false;
      for (let j = 0; j < 10; j++) {
        const d = Math.abs(inc[o + j] - ref[o + j]);
        if (!(d === 0)) any = true;
        const key = j === 0 ? 'radius' : j === 1 ? 'sag' : j < 5 ? 'pos' : j < 8 ? 'dir' : 'subLen';
        if (!(d <= out[key])) out[key] = d;
      }
      if (any) out.differing++;
    }
    for (let j = 0; j < 6; j++) out.bbox = Math.max(out.bbox, Math.abs(bb[j] - bb2[j]));
    return out;
  }
}

/** Per-id hash in [0, 1) (does not consume the sim rng). */
function hash01(i: number) {
  let h = (i * 2654435761 + 0x9e3779b9) >>> 0;
  h ^= h << 13; h >>>= 0; h ^= h >>> 17; h ^= h << 5; h >>>= 0;
  return h / 4294967296;
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

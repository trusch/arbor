import * as THREE from 'three';
import type { TreeSim } from '../sim/tree';
import { season } from '../season';
import { terrainHeight } from './backdrop';

/**
 * Director: the automatic camera's shot repertoire. Each shot is a pure pose function of a smoothed tree box, the shot
 * clock and a few values fixed when the shot starts (azimuth, side, subject); the director only picks shots and blends.
 * Camera transforms and one DOM overlay (the dip through black on a cut): no material, program or render pass.
 * Called from the cinema branch of `Stage.frame`; never runs while `stage.manual` is set.
 */
export type ShotKind = 'wide' | 'hero' | 'orbit' | 'rise' | 'canopy' | 'branch' | 'storm' | 'bird' | 'ascend' | 'far';
/**
 * The shots `choose` draws from. The last two exist only for the tree that grows over years (`big`, see `update`):
 * their weight is 0 otherwise, and they sit at the end of the list so the draw of the other six is unchanged.
 */
export const SHOT_KINDS: ShotKind[] = ['wide', 'hero', 'orbit', 'rise', 'canopy', 'branch', 'ascend', 'far'];
/** Growth over years: from this height on the size shots (`ascend`, `far`) join the list. */
const BIG_H = 11;
const DUR: Record<ShotKind, number> = { wide: 17, hero: 18, orbit: 20, rise: 20, canopy: 14, branch: 13, storm: 12, bird: 9, ascend: 26, far: 18 };
/** Seconds of a travelling move between two shots that are close to each other. */
const TRAVEL_S = 6;
/** Dip through black: fade out, switch, fade in (seconds). */
const CUT_OUT = 0.32, CUT_IN = 0.55;
/** A new shot is never interrupted by an event before this age, and events are at least this far apart. */
const EVENT_MIN_AGE = 7, EVENT_GAP = 28;

export interface DirectorEnv {
  aspect: number;
  /** Half vertical FOV (radians). */
  vf: number;
  /** Distance at which the plain framed view holds the whole tree. */
  fit: number;
  trunkR: number;
  sunDir: THREE.Vector3; sunH: number;
  moonDir: THREE.Vector3; night: number;
  cloud: number; flash: number;
}

const smooth = (x: number) => { const t = Math.min(1, Math.max(0, x)); return t * t * (3 - 2 * t); };
const smoother = (x: number) => { const t = Math.min(1, Math.max(0, x)); return t * t * t * (t * (6 * t - 15) + 10); };
const wrap = (a: number) => Math.atan2(Math.sin(a), Math.cos(a));

interface Shot { kind: ShotKind; t: number; dur: number; yaw: number; side: number; sx: number; sy: number; sz: number; event: boolean }

export class Director {
  /** Pose of this frame (read by `Stage.frame`). */
  pos = new THREE.Vector3();
  tgt = new THREE.Vector3();
  shot: Shot | null = null;
  /** Counts shot starts; `cuts` counts the frames in which the pose switched under the black overlay. */
  shots = 0;
  cuts = 0;
  /** True in the frame the pose switched under black (probes exclude that frame's step). */
  cutFrame = false;
  /** Next shot asked for by the user or a script (N key, the next-shot button, `go`). */
  private want: ShotKind | null = null;
  private wantCut = true;
  private pending: { kind: ShotKind; x: number; y: number; z: number } | null = null;
  private lastEvent = -1e9;
  private lastBird = -1e9;
  private clock = 0;
  private hold = 0;
  private travelDy = NaN;
  // Smoothed tree box: height, crown radius, centre height, trunk position.
  private big = false;
  private H = 0; private R = 0; private cy = 0; private bx = 0; private bz = 0; private fit = 0;
  // Transition state.
  private fromPos = new THREE.Vector3(); private fromTgt = new THREE.Vector3();
  private travelT = 1e9;
  private cutT = -1; private next: Shot | null = null;
  private overlay: HTMLDivElement | null = null;
  private rng = 0x9e3779b9;
  private history: ShotKind[] = [];
  private lastPhase = -1; private wasFlash = false;
  private a = new THREE.Vector3(); private b = new THREE.Vector3();

  private rnd() { let x = this.rng; x ^= x << 13; x ^= x >>> 17; x ^= x << 5; this.rng = x; return (x >>> 0) / 4294967296; }

  /** Ask for a shot (null = the director's own choice). Used by the N key, the next-shot button and scripts. */
  go(kind: ShotKind | null = null, cut = true) { this.want = kind ?? this.choose(null); this.wantCut = cut; }
  /** Something notable happened at a place: the director may go there once the running shot is old enough. */
  event(kind: 'bird' | 'branch' | 'storm' | 'orbit', x = 0, y = 0, z = 0) {
    if (kind === 'bird') { if (this.clock - this.lastBird < 75) return; this.lastBird = this.clock; }
    this.pending = { kind, x, y, z };
  }
  /** No shot change for `s` seconds (the ease back from a hand-set view must not meet a cut). */
  rest(s: number) {
    this.hold = Math.max(this.hold, s);
    // A dip to black in flight is dropped in either half: the director may not be called again (hand-set view, cinema
    // switched off), and an overlay left part-way through its fade-in stayed dark over the picture.
    if (this.cutT >= 0) { if (this.cutT < CUT_OUT) this.next = null; this.cutT = -1; this.fade(0); }
  }
  /** Forget the running shot: the next `update` starts from the camera's pose (seedling hand-over, new tree). */
  reset() { this.shot = null; this.travelT = 1e9; this.cutT = -1; this.next = null; this.fade(0); this.H = 0; }
  state() { const s = this.shot; return { kind: s?.kind ?? null, t: s?.t ?? 0, shots: this.shots, cuts: this.cuts, cutting: this.cutT >= 0, travelling: this.travelT < TRAVEL_S, cutFrame: this.cutFrame }; }

  private fade(o: number) {
    if (!this.overlay) {
      if (o <= 0 || typeof document === 'undefined') return;
      const el = (this.overlay = document.createElement('div'));
      el.id = 'arbor-cut';
      el.style.cssText = 'position:fixed;inset:0;background:#000;opacity:0;pointer-events:none;z-index:1;display:none';
      document.body.appendChild(el);
    }
    this.overlay.style.display = o > 0 ? 'block' : 'none';
    this.overlay.style.opacity = o.toFixed(3);
  }

  /** Azimuth (camera side of the tree) from which a low light is in frame beside the tree, or null. */
  private lightYaw(env: DirectorEnv, side: number): number | null {
    let d: THREE.Vector3 | null = null;
    if (env.sunH > -0.02 && env.sunH < 0.32) d = env.sunDir;
    else if (env.night > 0.6 && env.moonDir.y > 0.08 && env.moonDir.y < 0.75) d = env.moonDir;
    if (!d) return null;
    return Math.atan2(-d.x, -d.z) + side * 0.3;
  }

  private choose(env: DirectorEnv | null): ShotKind {
    const w: Record<string, number> = { wide: 1, hero: 1.4, orbit: 1, rise: 0.9, canopy: 0.8, branch: 0.9, ascend: 0, far: 0 };
    if (env) {
      const golden = env.sunH > -0.02 && env.sunH < 0.32;
      if (golden) { w.hero *= 2.2; w.wide *= 2; w.canopy *= 0.6; }
      if (env.night > 0.5) { w.wide *= 1.6; w.hero *= 1.6; w.branch *= 0.2; w.canopy *= 0.3; w.rise *= 0.5; }
      if (env.cloud > 0.6) { w.wide *= 2.5; w.branch *= 0.3; w.canopy *= 0.4; }
    }
    if (season.active) {
      const ph = season.phase;
      if ((ph > 0.03 && ph < 0.14) || (ph > 0.5 && ph < 0.68)) { w.branch *= 2.4; w.canopy *= 1.6; w.rise *= 1.4; }
      if (ph > 0.8) { w.canopy *= 0.3; w.branch *= 0.4; w.wide *= 1.5; }
    }
    if (this.H < 5 || this.R < 1.6) { w.canopy = 0; }
    // The big tree: two shots that make its size felt take a third of the programme; the canopy shot (looking up the
    // bole into the crown) counts double.
    if (this.big) { w.ascend = 1.3; w.far = 1.3; w.canopy *= 1.6; if (env && env.night > 0.5) w.ascend *= 0.4; }
    if (this.H < 4) w.rise *= 0.5;
    const h = this.history;
    if (h.length) w[h[h.length - 1]] = 0;
    if (h.length > 1) w[h[h.length - 2]] *= 0.35;
    let sum = 0;
    for (const k of SHOT_KINDS) sum += w[k];
    let r = this.rnd() * sum;
    for (const k of SHOT_KINDS) { r -= w[k]; if (r <= 0) return k; }
    return 'orbit';
  }

  /** An outer leafy node at mid crown height on the camera's side of the tree: the subject of the branch shot. */
  private pickBranch(sim: TreeSim, yaw: number, out: THREE.Vector3) {
    const n = sim.nodes, sx = Math.sin(yaw), sz = Math.cos(yaw);
    let best = -1, bs = -1e9;
    const step = Math.max(1, Math.floor(n.length / 1500));
    for (let i = 1 + Math.floor(this.rnd() * step); i < n.length; i += step) {
      const nd = n[i];
      if (!nd.leafy || nd.order < 1 || sim.chains[nd.chain]?.pruned) continue;
      const dx = nd.wx - this.bx, dz = nd.wz - this.bz, r = Math.hypot(dx, dz);
      const hy = nd.wy / Math.max(1, this.H);
      const s = r / Math.max(0.5, this.R) + 0.5 * ((dx * sx + dz * sz) / (r + 0.3)) - 1.6 * Math.abs(hy - 0.5) + 0.6 * nd.light + 0.2 * this.rnd();
      if (s > bs) { bs = s; best = i; }
    }
    if (best < 0) return false;
    out.set(n[best].wx, n[best].wy, n[best].wz);
    return true;
  }

  private make(kind: ShotKind, env: DirectorEnv, sim: TreeSim, camYaw: number, at?: { x: number; y: number; z: number }): Shot {
    const side = this.rnd() < 0.5 ? -1 : 1;
    let yaw = camYaw + side * (0.25 + 0.5 * this.rnd());
    const s: Shot = { kind, t: 0, dur: DUR[kind] * (0.9 + 0.2 * this.rnd()), yaw, side, sx: 0, sy: 0, sz: 0, event: !!at || kind === 'storm' || kind === 'bird' };
    if (kind === 'wide' || kind === 'hero' || kind === 'storm') {
      const ly = this.lightYaw(env, side);
      if (ly !== null) yaw = ly;
    } else if ((kind === 'rise' || kind === 'branch' || kind === 'ascend' || kind === 'far') && !at && env.sunH > 0.08) {
      // The lit side: camera on the sun's side of the tree, a little round, so the subject is not a backlit mass.
      yaw = Math.atan2(env.sunDir.x, env.sunDir.z) + side * (0.45 + 0.3 * this.rnd());
    }
    if (kind === 'branch' || kind === 'bird') {
      if (at) { s.sx = at.x; s.sy = at.y; s.sz = at.z; yaw = Math.atan2(at.x - this.bx, at.z - this.bz); }
      else if (this.pickBranch(sim, yaw, this.a)) { s.sx = this.a.x; s.sy = this.a.y; s.sz = this.a.z; yaw = Math.atan2(s.sx - this.bx, s.sz - this.bz); }
      else s.kind = 'orbit';
    }
    s.yaw = yaw;
    return s;
  }

  /**
   * Looks from `pos` so that the world point (x, y, z) lands at screen (sx, sy) in -1..1 (right / up positive);
   * the horizon stays level (no roll).
   */
  private aim(pos: THREE.Vector3, x: number, y: number, z: number, sx: number, sy: number, env: DirectorEnv, out: THREE.Vector3) {
    const dx = x - pos.x, dy = y - pos.y, dz = z - pos.z, dh = Math.hypot(dx, dz), D = Math.hypot(dh, dy);
    const thf = Math.tan(env.vf) * env.aspect, tvf = Math.tan(env.vf);
    const vy = Math.atan2(dx, dz) + Math.atan(sx * thf);
    const vp = Math.max(-1.45, Math.min(1.45, Math.atan2(dy, dh) - Math.atan(sy * tvf)));
    out.set(pos.x + Math.sin(vy) * Math.cos(vp) * D, pos.y + Math.sin(vp) * D, pos.z + Math.cos(vy) * Math.cos(vp) * D);
  }

  /** Pose of a shot at its clock: writes `pos` / `tgt`. Pure given the smoothed tree box. */
  private pose(s: Shot, env: DirectorEnv, pos: THREE.Vector3, tgt: THREE.Vector3) {
    const H = this.H, R = this.R, P = env.aspect < 1, u = Math.min(1, s.t / s.dur), e = smooth(u), t = s.t, sd = s.side;
    const tvf = Math.tan(env.vf), thf = tvf * env.aspect;
    const put = (yaw: number, dh: number, y: number) => pos.set(this.bx + Math.sin(yaw) * dh, y, this.bz + Math.cos(yaw) * dh);
    switch (s.kind) {
      case 'wide': case 'storm': {
        // Establishing: the tree on a third in its landscape, horizon low, two thirds sky; slow push and drift.
        const storm = s.kind === 'storm';
        const dh = Math.max(H * 1.2 / tvf * 0.5, this.fit * (storm ? 1.2 : 1.0)) * (1 - 0.06 * e);
        put(s.yaw + sd * 0.008 * t, dh, storm ? 1.2 : Math.max(1.4, 0.05 * dh));
        this.aim(pos, this.bx, pos.y, this.bz, sd * (P ? 0.14 : 0.36), storm ? -0.6 : P ? -0.36 : -0.5, env, tgt);
        break;
      }
      case 'hero': {
        // Low in the grass, looking up: trunk base low in the frame, crown against the sky.
        const dh = Math.max(H * (P ? 1.75 : 1.95), R / (thf * 1.15), 3.2) * (1 - 0.05 * e);
        // Eye above the tufts (0.3 m): at 0.5 m single blades a hand from the lens covered the frame on landscape.
        put(s.yaw + sd * 0.006 * t, dh, (P ? 0.7 : Math.max(1.0, 0.065 * dh)) + 0.25 * e);
        this.aim(pos, this.bx, 0, this.bz, sd * (P ? 0.1 : 0.3), -0.7, env, tgt);
        break;
      }
      case 'orbit': {
        // Medium: the whole tree, a little off centre, on a slow arc at mid height.
        const dh = this.fit * 0.8;
        put(s.yaw + sd * 0.03 * t, dh, Math.max(1.2, H * 0.3));
        this.aim(pos, this.bx, this.cy, this.bz, sd * (P ? 0.04 : 0.2), -0.04, env, tgt);
        break;
      }
      case 'rise': {
        // Crane: from the trunk base up through the crown, close enough that the crown breaks the frame.
        // Far enough out that the crown is a shape against the sky, not a wall: the eye stops at 0.7 H and the view
        // looks up past the crown edge (the tree on one third, sky on the other two).
        const dh = Math.max(R * 2.3 + 4, H * 1.0, 3);
        // The big tree starts above the tufts: at 0.6 m the grass cards of the meadow covered the landscape frame.
        const y0 = this.big ? 1.5 : 0.6, y = y0 + (H * 0.7 - y0) * smoother(u);
        put(s.yaw + sd * 0.25 * e, dh, y);
        this.aim(pos, this.bx, y + 0.22 * dh, this.bz, sd * (P ? 0.12 : 0.36), -0.2, env, tgt);
        break;
      }
      case 'ascend': {
        // Elevator past the big tree, from the roots to the top: so close that the frame never holds the whole tree
        // (about two thirds of its height), so its size is the length of the ride. Just outside the crown's reach.
        // (At 1.25 R the lens was 4 m from the leaves and the frame a wall of twigs.)
        const dh = Math.max(R * 1.6 + 2, H * 0.6, 4);
        const y = 0.8 + (H * 0.75 - 0.8) * smoother(u);
        put(s.yaw + sd * 0.3 * e, dh, y);
        // Looks up into the crown from the grass and comes level, then a little down, as it reaches the top.
        this.aim(pos, this.bx, y + dh * (0.3 - 0.4 * smoother(u)), this.bz, sd * (P ? 0.04 : 0.18), 0, env, tgt);
        break;
      }
      case 'far': {
        // Scale: the tree small on a third, the meadow before it and the lone trees and hedgerows of the backdrop
        // beside it. Eye well above the grass so the far trees stand clear of the horizon line of the meadow.
        const dh = Math.max(this.fit * 1.25, H * 3.3) * (1 - 0.05 * e);
        put(s.yaw + sd * 0.005 * t, dh, 0);
        pos.y = terrainHeight(pos.x, pos.z) + 1.5 + 0.2 * H;
        this.aim(pos, this.bx, 0, this.bz, sd * (P ? 0.1 : 0.3), P ? -0.3 : -0.42, env, tgt);
        break;
      }
      case 'canopy': {
        // Beside the trunk, looking up into the crown; the canopy turns slowly overhead.
        const d0 = env.trunkR * 2 + Math.max(0.7, R * 0.16), yaw = s.yaw + sd * 0.022 * t;
        put(yaw, d0, Math.min(1.1, Math.max(0.5, H * 0.1)));
        tgt.set(this.bx - Math.sin(yaw) * R * 0.12, H * (0.74 + 0.04 * e), this.bz - Math.cos(yaw) * R * 0.12);
        break;
      }
      case 'branch': case 'bird': {
        // Close on an outer branch from outside the crown, a little below it so sky or far meadow is behind; slow push.
        const far = s.kind === 'bird' ? 4.2 : Math.max(3, Math.min(4.4, R * 0.75));
        // The camera stands off to one side of the branch (mostly along the crown's edge, a little outward), so the
        // tips are seen against sky and far meadow with the crown mass on one side of the frame only.
        // Further out of the crown (0.8 rad off the tangent) and lower, looking up: the branch is seen against sky and
        // the crown edge stays a band at the side, not half the frame.
        const d = far * (1 - 0.16 * e), ang = s.yaw + sd * (0.55 + 0.08 * e);
        pos.set(s.sx + Math.sin(s.yaw) * 1.2 + Math.sin(ang) * d, Math.max(0.5, s.sy - 0.4 * d), s.sz + Math.cos(s.yaw) * 1.2 + Math.cos(ang) * d);
        this.aim(pos, s.sx, s.sy, s.sz, sd * (P ? 0.1 : 0.22), 0.22, env, tgt);
        break;
      }
    }
    // Never below the ground (terrain rolls beyond 66 m) and never inside the trunk.
    const g = terrainHeight(pos.x, pos.z);
    if (pos.y < g + 0.42) { tgt.y += g + 0.42 - pos.y; pos.y = g + 0.42; }
    const rx = pos.x - this.bx, rz = pos.z - this.bz, rr = Math.hypot(rx, rz), rmin = env.trunkR * 2 + 0.45;
    if (rr < rmin) { const k = rmin / Math.max(1e-3, rr); pos.x = this.bx + rx * k; pos.z = this.bz + rz * k; }
  }

  /** One frame. `cam` / `ctl` are the pose the camera has now (start of the very first shot and of travels). */
  update(sim: TreeSim, env: DirectorEnv, dt: number, snap: boolean, cam: THREE.Vector3, ctl: THREE.Vector3) {
    const mn = sim.bboxMin, mx = sim.bboxMax, n0 = sim.nodes[0];
    const H = Math.max(1, mx[1]), R = Math.max(0.6, Math.hypot(mx[0] - mn[0], mx[2] - mn[2]) / 2 * 0.72 + 0.3), cy = (mn[1] + mx[1]) / 2;
    const k = snap || this.H === 0 ? 1 : 1 - Math.exp(-dt * 1.2);
    this.H += (H - this.H) * k; this.R += (R - this.R) * k; this.cy += (cy - this.cy) * k; this.fit += (env.fit - this.fit) * k;
    this.bx += ((n0?.wx ?? 0) - this.bx) * k; this.bz += ((n0?.wz ?? 0) - this.bz) * k;
    this.big = sim.years > 0 && this.H > BIG_H;
    this.clock += dt; this.hold = Math.max(0, this.hold - dt);
    this.cutFrame = false;
    const camYaw = Math.atan2(cam.x - this.bx, cam.z - this.bz);

    // Events: lightning (first flash of a storm), seasonal firsts; birds and breaks arrive through `event`.
    const fl = env.flash > 0.25;
    if (fl && !this.wasFlash && this.shot?.kind !== 'storm') this.pending = { kind: 'storm', x: 0, y: 0, z: 0 };
    this.wasFlash = fl;
    if (season.active && this.lastPhase >= 0 && season.year > 1) {
      for (const d of [0.03, 0.058, 0.56]) if (this.lastPhase < d && season.phase >= d && season.phase - this.lastPhase < 0.02) this.pending = { kind: 'branch', x: NaN, y: 0, z: 0 };
    }
    this.lastPhase = season.active ? season.phase : -1;

    let start: Shot | null = null, cut = false;
    if (!this.shot) {
      start = this.make(this.want ?? 'orbit', env, sim, camYaw); this.want = null;
      start.yaw = camYaw;
    } else if (this.cutT < 0) {
      const s = this.shot;
      if (this.want) { start = this.make(this.want, env, sim, camYaw); cut = this.wantCut; this.want = null; this.pending = null; }
      else if (this.pending && this.hold <= 0 && s.t > EVENT_MIN_AGE && this.clock - this.lastEvent > EVENT_GAP && this.travelT >= TRAVEL_S) {
        const p = this.pending; this.pending = null; this.lastEvent = this.clock;
        start = this.make(p.kind, env, sim, camYaw, Number.isNaN(p.x) || p.kind === 'storm' || p.kind === 'orbit' ? undefined : p);
        if (p.kind === 'orbit') start.yaw = Math.atan2(p.x - this.bx, p.z - this.bz) + start.side * 0.5;
        start.event = true;
      } else if (s.t >= s.dur && this.hold <= 0) start = this.make(this.choose(env), env, sim, camYaw);
      else if (this.pending && this.clock - this.lastEvent <= EVENT_GAP && this.pending.kind === 'bird') this.pending = null; // a bird does not wait
    }
    if (start) {
      if (snap || !this.shot) {
        const first = !this.shot;
        this.begin(start);
        if (first && !snap) { this.fromPos.copy(cam); this.fromTgt.copy(ctl); this.travelT = 0; }
      } else {
        // Travel when the new frame is near the current one, otherwise dip through black.
        this.pose(start, env, this.a, this.b);
        const move = this.a.distanceTo(this.pos), turn = this.a.clone().sub(this.b).normalize().angleTo(this.pos.clone().sub(this.tgt).normalize());
        const near = move < Math.max(8, this.H * 1.6) && turn < 0.6 && start.kind !== 'canopy' && this.shot.kind !== 'canopy';
        if (near && !cut) { this.fromPos.copy(this.pos); this.fromTgt.copy(this.tgt); this.begin(start); this.travelT = 0; }
        else { this.next = start; this.cutT = 0; }
      }
    }
    if (this.cutT >= 0) {
      const before = this.cutT;
      this.cutT += dt;
      if (before < CUT_OUT && this.cutT >= CUT_OUT && this.next) { this.begin(this.next); this.next = null; this.travelT = 1e9; this.cuts++; this.cutFrame = true; }
      const o = this.cutT < CUT_OUT ? smooth(this.cutT / CUT_OUT) : 1 - smooth((this.cutT - CUT_OUT - 0.08) / CUT_IN);
      if (this.cutT > CUT_OUT + 0.08 + CUT_IN) { this.cutT = -1; this.fade(0); } else this.fade(o);
    }
    const s = this.shot!;
    // A subject that is gone (bird flew off) ends its shot early; the last second still plays.
    s.t += dt;
    this.pose(s, env, this.pos, this.tgt);
    if (this.travelT < TRAVEL_S && !snap) {
      // Travelling move: blend azimuth, radius and height about the trunk (never a straight line through the crown).
      if (this.travelT === 0) this.travelDy = NaN;
      this.travelT += dt;
      const w = smoother(this.travelT / TRAVEL_S);
      const ax = this.fromPos.x - this.bx, az = this.fromPos.z - this.bz, px = this.pos.x - this.bx, pz = this.pos.z - this.bz;
      const y0 = Math.atan2(ax, az), dy0 = wrap(Math.atan2(px, pz) - y0);
      // Keep the way round the trunk chosen at the start: a target azimuth near y0 + pi would flip sides between frames.
      const dyw = Number.isNaN(this.travelDy) ? dy0 : this.travelDy + wrap(dy0 - this.travelDy);
      this.travelDy = dyw;
      const y1 = y0 + dyw, r = Math.hypot(ax, az) + (Math.hypot(px, pz) - Math.hypot(ax, az)) * w, yw = y0 + (y1 - y0) * w;
      this.pos.set(this.bx + Math.sin(yw) * r, this.fromPos.y + (this.pos.y - this.fromPos.y) * w, this.bz + Math.cos(yw) * r);
      this.tgt.lerpVectors(this.fromTgt, this.tgt, w);
    } else if (snap) this.travelT = 1e9;
  }

  private begin(s: Shot) {
    this.shot = s; this.shots++;
    this.history.push(s.kind); if (this.history.length > 4) this.history.shift();
  }
}

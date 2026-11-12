import * as THREE from 'three';
import type { TreeSim, BreakEvent } from '../sim/tree';
import type { Wind } from '../wind';
import { BranchMesh } from './branchMesh';
import type { Leaves } from './leaves';

/**
 * Broken limbs and twigs (audit 3.5 "Falling limb", WP10).
 *
 * PowerVR rule: a limb is one `Mesh` with the live bark material instance and one `InstancedMesh` with the live leaf
 * geometry and material instance (instanceColor, same attributes), inside `group`: no new program, no material flag.
 * Motion is one rigid transform per limb per frame; twigs are leaves only, with per-instance matrices while they fall.
 */
const G = 9.81;
const GROUND = 0.02;
const MAX_LIMBS = 3;
/** Subtrees below this node count fall as loose leaves (no wood mesh). */
export const TWIG_NODES = 12;
const BROWN_S = 60;

const HINGE = 0, FLY = 1, REST = 2, LEAVING = 3;

interface Limb {
  g: THREE.Group;
  bm: BranchMesh;
  lm: THREE.InstancedMesh | null;
  phase: number;
  t: number;
  /** Break point (world, fixed while hinging). */
  pivot: THREE.Vector3;
  /** Centroid relative to the pivot at the break. */
  c0: THREE.Vector3;
  com: THREE.Vector3;
  q: THREE.Quaternion;
  axis: THREE.Vector3;
  ang: number;
  w: number;
  vel: THREE.Vector3;
  omega: THREE.Vector3;
  /** Contact sample points relative to the centroid, break-time orientation (x, y, z, radius). */
  pts: Float32Array;
  /** Radius of gyration squared. */
  k2: number;
  drag: number;
  contactT: number;
  stillT: number;
  restT: number;
  cols: Float32Array | null;
  brown: number;
  leave: number;
}

interface Twig {
  m: THREE.InstancedMesh;
  n: number;
  /** Per leaf: vy scale, drift scale, spin axis xyz, spin rate, phase, landed. */
  s: Float32Array;
  t: number;
  landed: number;
}

const v1 = new THREE.Vector3(), v2 = new THREE.Vector3(), v3 = new THREE.Vector3(), v4 = new THREE.Vector3();
const dq = new THREE.Quaternion();
const DOWN = new THREE.Vector3(0, -1, 0);

export class Debris {
  group = new THREE.Group();
  private limbs: Limb[] = [];
  private twigs: Twig[] = [];
  stats = { limbs: 0, twigs: 0, falling: 0, resting: 0, leafFalls: 0, lastBuildMs: 0, maxBuildMs: 0, lastLeaves: 0, lastNodes: 0, minY: 0, takeMs: 0, tubeMs: 0 };

  /** Whether limb wood casts shadow-map shadows (mirrors the tree's branch mesh; off on the canopy-decal path). */
  barkShadow = true;

  constructor(private bark: THREE.Material, private leaves: Leaves) {
    this.group.name = 'debris';
  }

  /** Limbs for scripts: phase (0 hinge, 1 flight, 2 rest, 3 leaving), centroid, lowest sample point. */
  get state() {
    return this.limbs.map((l) => ({ phase: l.phase, t: +l.t.toFixed(2), com: l.com.toArray().map((x) => +x.toFixed(2)), ang: +l.ang.toFixed(2), speed: +l.vel.length().toFixed(2), spin: +l.omega.length().toFixed(2), lowest: +this.lowest(l).toFixed(3) }));
  }

  /** Turn a break event into a falling limb (or a leaf fall for a twig). Call after the frame's leaf follow. */
  spawn(sim: TreeSim, ev: BreakEvent, wind: Wind) {
    const t0 = performance.now();
    const nodes = sim.nodes;
    const inSub = new Uint8Array(nodes.length);
    for (const i of ev.nodeIds) inSub[i] = 1;
    const lv = this.leaves.takeInstances(inSub);
    this.stats.takeMs = performance.now() - t0;
    const live = this.leaves.mesh;
    let lm: THREE.InstancedMesh | null = null;
    if (lv.n > 0) {
      lm = new THREE.InstancedMesh(live.geometry, live.material, lv.n);
      (lm.instanceMatrix.array as Float32Array).set(lv.matrices);
      lm.instanceColor = new THREE.InstancedBufferAttribute(lv.colours, 3);
      lm.castShadow = live.castShadow; lm.receiveShadow = live.receiveShadow;
      lm.frustumCulled = false;
      if (live.userData.gbufferMaterial) lm.userData.gbufferMaterial = live.userData.gbufferMaterial;
    }
    const twig = ev.nodeIds.length < TWIG_NODES;
    if (twig) {
      if (lm) this.spawnTwig(lm, lv.n);
      this.stats.twigs++;
    } else this.spawnLimb(sim, ev, lm, wind);
    this.stats.lastBuildMs = performance.now() - t0;
    if (this.stats.lastBuildMs > this.stats.maxBuildMs) this.stats.maxBuildMs = this.stats.lastBuildMs;
    this.stats.lastLeaves = lv.n; this.stats.lastNodes = ev.nodeIds.length;
  }

  private spawnTwig(m: THREE.InstancedMesh, n: number) {
    m.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    const s = new Float32Array(n * 8);
    for (let i = 0; i < n; i++) {
      let h = ((i + 1) * 2654435761 + this.stats.twigs * 40503) >>> 0;
      const r = () => { h ^= h << 13; h >>>= 0; h ^= h >>> 17; h ^= h << 5; h >>>= 0; return h / 4294967296; };
      const o = i * 8;
      s[o] = 0.9 + 1.3 * r(); s[o + 1] = 0.5 + 0.9 * r();
      v1.set(r() - 0.5, r() - 0.5, r() - 0.5).normalize();
      s[o + 2] = v1.x; s[o + 3] = v1.y; s[o + 4] = v1.z;
      s[o + 5] = 2 + 5 * r(); s[o + 6] = r() * 6.28; s[o + 7] = 0;
    }
    this.group.add(m);
    this.twigs.push({ m, n, s, t: 0, landed: 0 });
    this.stats.leafFalls += n;
  }

  private spawnLimb(sim: TreeSim, ev: BreakEvent, lm: THREE.InstancedMesh | null, wind: Wind) {
    const nodes = sim.nodes;
    // Tubes of the detached chains, in world coordinates, through the shared tube builder.
    const bm = new BranchMesh(this.bark);
    const chains = ev.chains.map((c) => ({ ...sim.chains[c], pruned: false }));
    const tb = performance.now();
    bm.update({ nodes, chains } as unknown as TreeSim, 0);
    this.stats.tubeMs = performance.now() - tb;
    // Centroid and gyration radius, weighted by wood (len · radius) plus leaves.
    const pn = nodes[nodes[ev.root].parent];
    const pivot = new THREE.Vector3(pn.wx, pn.wy, pn.wz);
    let W = 0, cx = 0, cy = 0, cz = 0;
    for (const i of ev.nodeIds) {
      const nd = nodes[i], w = nd.len * nd.radius * 40 + (nd.leafy ? 0.05 : 0) + 1e-4;
      W += w; cx += nd.wx * w; cy += nd.wy * w; cz += nd.wz * w;
    }
    const com = new THREE.Vector3(cx / W, cy / W, cz / W);
    let k2 = 0;
    for (const i of ev.nodeIds) {
      const nd = nodes[i], w = nd.len * nd.radius * 40 + (nd.leafy ? 0.05 : 0) + 1e-4;
      k2 += w * ((nd.wx - com.x) ** 2 + (nd.wy - com.y) ** 2 + (nd.wz - com.z) ** 2);
    }
    k2 = Math.max(0.05, (k2 / W) * 0.6);
    // Contact samples: the butt end plus farthest-point samples over the subtree (tips and outline).
    const NP = Math.min(16, ev.nodeIds.length + 1);
    const pts = new Float32Array(NP * 4);
    pts[0] = pivot.x - com.x; pts[1] = pivot.y - com.y; pts[2] = pivot.z - com.z; pts[3] = ev.radius;
    const dist = new Float32Array(ev.nodeIds.length).fill(Infinity);
    let lx = pivot.x, ly = pivot.y, lz = pivot.z;
    for (let p = 1; p < NP; p++) {
      let best = 0, bd = -1;
      for (let j = 0; j < ev.nodeIds.length; j++) {
        const nd = nodes[ev.nodeIds[j]];
        const d = (nd.wx - lx) ** 2 + (nd.wy - ly) ** 2 + (nd.wz - lz) ** 2;
        if (d < dist[j]) dist[j] = d;
        if (dist[j] > bd) { bd = dist[j]; best = j; }
      }
      const nd = nodes[ev.nodeIds[best]];
      lx = nd.wx; ly = nd.wy; lz = nd.wz;
      pts[p * 4] = lx - com.x; pts[p * 4 + 1] = ly - com.y; pts[p * 4 + 2] = lz - com.z; pts[p * 4 + 3] = nd.radius + 0.03;
    }
    // Bounding spheres up front (three would compute them on first sort: every vertex and every instance).
    let R = 0;
    for (let p = 0; p < NP; p++) R = Math.max(R, Math.hypot(pts[p * 4], pts[p * 4 + 1], pts[p * 4 + 2]));
    const sphere = new THREE.Sphere(com.clone(), R + 0.5);
    bm.mesh.geometry.boundingSphere = sphere;
    if (lm) lm.boundingSphere = sphere;
    const g = new THREE.Group();
    bm.mesh.position.copy(com).negate();
    bm.mesh.castShadow = true; bm.mesh.receiveShadow = true;
    g.add(bm.mesh);
    if (lm) { lm.position.copy(com).negate(); g.add(lm); }
    g.position.copy(com);
    const c0 = com.clone().sub(pivot);
    // Hinge axis: the horizontal axis that swings the centroid down; a limb standing upright goes over downwind.
    const axis = new THREE.Vector3().crossVectors(c0, DOWN);
    if (axis.length() < 0.15 * c0.length()) axis.crossVectors(c0, v1.set(wind.dirX, -0.2, wind.dirZ));
    axis.normalize();
    const lpn = ev.leaves / ev.nodeIds.length;
    this.limbs.push({
      g, bm, lm, phase: HINGE, t: 0, pivot, c0, com, q: new THREE.Quaternion(), axis, ang: 0, w: 0.45,
      vel: new THREE.Vector3(), omega: new THREE.Vector3(), pts, k2, drag: 0.35 + 0.55 * Math.min(1, lpn / 6),
      contactT: -1, stillT: 0, restT: 0, cols: lm ? (lm.instanceColor!.array as Float32Array).slice() : null, brown: 0, leave: 0,
    });
    this.group.add(g);
    this.stats.limbs++;
    // Keep at most MAX_LIMBS: the oldest ones shrink away.
    let kept = 0;
    for (let i = this.limbs.length - 1; i >= 0; i--) {
      const l = this.limbs[i];
      if (l.phase === LEAVING) continue;
      if (++kept > MAX_LIMBS) { l.phase = LEAVING; l.leave = 0; }
    }
  }

  private lowest(l: Limb) {
    let m = Infinity;
    const P = l.pts;
    for (let i = 0; i < P.length; i += 4) {
      const y = v4.set(P[i], P[i + 1], P[i + 2]).applyQuaternion(l.q).y + l.com.y - P[i + 3];
      if (y < m) m = y;
    }
    return m;
  }

  /** Advance all debris by dt seconds of real time. */
  frame(dt: number, wind: Wind) {
    let falling = 0, resting = 0;
    for (let i = this.limbs.length - 1; i >= 0; i--) {
      const l = this.limbs[i];
      l.bm.mesh.castShadow = this.barkShadow;
      if (l.phase === HINGE || l.phase === FLY) {
        falling++;
        let left = Math.min(dt, 0.1);
        while (left > 1e-5) { const h = Math.min(left, 1 / 90); this.stepLimb(l, h, wind); left -= h; }
        l.g.position.copy(l.com); l.g.quaternion.copy(l.q);
      } else if (l.phase === REST) {
        resting++;
        l.restT += dt;
        // Leaves dry to brown over a minute (instance colours, a 2 Hz upload of this limb's colours only).
        const k = Math.min(1, l.restT / BROWN_S);
        if (l.lm && l.cols && k - l.brown > 0.5 / BROWN_S) {
          l.brown = k;
          const a = l.lm.instanceColor!.array as Float32Array, c = l.cols;
          const kr = 1 + 0.25 * k, kg = 1 - 0.42 * k, kb = 1 - 0.55 * k;
          for (let j = 0; j < c.length; j += 3) { a[j] = c[j] * kr; a[j + 1] = c[j + 1] * kg; a[j + 2] = c[j + 2] * kb; }
          l.lm.instanceColor!.needsUpdate = true;
        }
      } else {
        l.leave += dt;
        const s = Math.max(0, 1 - l.leave / 1.5);
        l.g.scale.setScalar(s * s * (3 - 2 * s) + 1e-4);
        if (s <= 0) { this.drop(l); this.limbs.splice(i, 1); }
      }
    }
    for (let i = this.twigs.length - 1; i >= 0; i--) if (this.stepTwig(this.twigs[i], dt, wind)) {
      const tw = this.twigs[i];
      this.group.remove(tw.m); tw.m.dispose();
      this.twigs.splice(i, 1);
    }
    this.stats.falling = falling; this.stats.resting = resting;
  }

  private stepLimb(l: Limb, h: number, wind: Wind) {
    l.t += h;
    const gust = wind.gust(l.com.x, l.com.z);
    if (l.phase === HINGE) {
      // Still attached by a strip of fibres: a rod swinging about the break point (alpha = 1.5 g sin(theta) / L).
      const c = v1.copy(l.c0).applyQuaternion(l.q);
      const len = c.length() || 1;
      const sinT = Math.max(0.35, Math.hypot(c.x, c.z) / len);
      const windT = 4 * gust * gust * v2.set(wind.dirX, 0, wind.dirZ).cross(v3.copy(c).divideScalar(len)).dot(l.axis) * -1;
      l.w += ((1.5 * G * sinT) / (2 * len) + windT) * h;
      if (l.w < 0.2) l.w = 0.2;
      l.ang += l.w * h;
      l.q.setFromAxisAngle(l.axis, l.ang);
      l.com.copy(l.c0).applyQuaternion(l.q).add(l.pivot);
      if (l.ang > 0.87 || l.t > 0.9 || this.lowest(l) < GROUND) {
        // Comes free: the centroid keeps the swing velocity, the limb keeps turning and starts to roll a little.
        c.copy(l.c0).applyQuaternion(l.q);
        l.omega.copy(l.axis).multiplyScalar(l.w);
        l.vel.crossVectors(l.omega, c);
        l.vel.x += wind.dirX * gust * 1.5; l.vel.z += wind.dirZ * gust * 1.5;
        l.omega.addScaledVector(c.normalize(), (l.pivot.x * 7.3 + l.pivot.z * 3.1) % 1 > 0.5 ? 0.5 : -0.5);
        l.phase = FLY;
      }
      return;
    }
    // Free flight: gravity, drag toward the wind velocity (leafy limbs sail, bare ones drop).
    const wv = gust * 10;
    l.vel.x += (wind.dirX * wv - l.vel.x) * l.drag * h;
    l.vel.z += (wind.dirZ * wv - l.vel.z) * l.drag * h;
    l.vel.y += (-G - l.vel.y * l.drag) * h;
    l.omega.multiplyScalar(Math.exp(-0.6 * h));
    l.com.addScaledVector(l.vel, h);
    const wl = l.omega.length();
    if (wl > 1e-5) { dq.setFromAxisAngle(v1.copy(l.omega).divideScalar(wl), wl * h); l.q.premultiply(dq).normalize(); }
    // Ground contact on the sample points: impulses with restitution 0.15 and friction, then a position fix.
    const P = l.pts;
    let pen = 0, touched = false;
    for (let i = 0; i < P.length; i += 4) {
      const r = v1.set(P[i], P[i + 1], P[i + 2]).applyQuaternion(l.q);
      const y = l.com.y + r.y - P[i + 3];
      if (y >= GROUND) continue;
      touched = true;
      if (GROUND - y > pen) pen = GROUND - y;
      const vp = v2.crossVectors(l.omega, r).add(l.vel);
      if (vp.y < 0) {
        // r × n with n = up.
        const rnx = -r.z, rnz = r.x;
        const jn = (-(1.15) * vp.y) / (1 + (rnx * rnx + rnz * rnz) / l.k2);
        l.vel.y += jn;
        l.omega.x += (rnx * jn) / l.k2; l.omega.z += (rnz * jn) / l.k2;
        const vt = Math.hypot(vp.x, vp.z);
        if (vt > 1e-4) {
          const tx = -vp.x / vt, tz = -vp.z / vt;
          // r × t
          const cxx = r.y * tz, cyy = r.z * tx - r.x * tz, czz = -r.y * tx;
          const jt = Math.min(0.7 * jn, vt / (1 + (cxx * cxx + cyy * cyy + czz * czz) / l.k2));
          l.vel.x += tx * jt; l.vel.z += tz * jt;
          l.omega.x += (cxx * jt) / l.k2; l.omega.y += (cyy * jt) / l.k2; l.omega.z += (czz * jt) / l.k2;
        }
      }
    }
    if (touched) {
      l.com.y += pen;
      if (l.contactT < 0) l.contactT = l.t;
      l.vel.multiplyScalar(Math.exp(-2.5 * h)); l.omega.multiplyScalar(Math.exp(-3.5 * h));
      if (l.vel.lengthSq() < 0.09 && l.omega.lengthSq() < 0.2) l.stillT += h; else l.stillT = 0;
    }
    if (l.stillT > 0.35 || (l.contactT >= 0 && l.t - l.contactT > 5) || l.t > 15) {
      l.phase = REST;
      const low = this.lowest(l);
      if (low < GROUND) l.com.y += GROUND - low;
      this.stats.minY = this.lowest(l);
    }
  }

  /** Loose leaves of a twig: flutter down with the wind, lie on the ground, shrink away after 20 s. True when done. */
  private stepTwig(tw: Twig, dt: number, wind: Wind): boolean {
    tw.t += dt;
    const a = tw.m.instanceMatrix.array as Float32Array, s = tw.s;
    if (tw.landed >= tw.n) {
      const age = tw.t - 22;
      if (age < 0) return false;
      if (age > 2) return true;
      tw.m.scale.setScalar(1 - age / 2 + 1e-4);
      return false;
    }
    let landed = 0;
    for (let i = 0; i < tw.n; i++) {
      const o = i * 16, p = i * 8;
      if (s[p + 7]) { landed++; continue; }
      const gust = wind.gust(a[o + 12], a[o + 14]);
      const ph = s[p + 6] + tw.t * 3.1;
      // Leaves let go one after the other over the first 0.4 s.
      const go = Math.min(1, Math.max(0, tw.t * 4 - (s[p + 6] / 6.28) * 1.2));
      a[o + 12] += (wind.dirX * gust * 5 * s[p + 1] + Math.sin(ph) * 0.5) * dt * go;
      a[o + 14] += (wind.dirZ * gust * 5 * s[p + 1] + Math.cos(ph * 0.8) * 0.5) * dt * go;
      a[o + 13] -= s[p] * (0.8 + 0.3 * Math.sin(ph * 1.7)) * dt * go;
      // Tumble: rotate the basis about the leaf's own spin axis.
      const ang = s[p + 5] * dt * go, cs = Math.cos(ang), sn = Math.sin(ang), kx = s[p + 2], ky = s[p + 3], kz = s[p + 4];
      for (let c = 0; c < 12; c += 4) {
        const x = a[o + c], y = a[o + c + 1], z = a[o + c + 2];
        const d = (kx * x + ky * y + kz * z) * (1 - cs);
        a[o + c] = x * cs + (ky * z - kz * y) * sn + kx * d;
        a[o + c + 1] = y * cs + (kz * x - kx * z) * sn + ky * d;
        a[o + c + 2] = z * cs + (kx * y - ky * x) * sn + kz * d;
      }
      if (a[o + 13] <= GROUND + 0.01) { a[o + 13] = GROUND + 0.01; s[p + 7] = 1; landed++; }
    }
    tw.landed = landed;
    if (landed >= tw.n) tw.t = 0;
    tw.m.instanceMatrix.needsUpdate = true;
    return false;
  }

  private drop(l: Limb) {
    this.group.remove(l.g);
    l.bm.mesh.geometry.dispose();
    l.lm?.dispose();
  }

  /** Tree reset: remove everything. */
  clear() {
    for (const l of this.limbs) this.drop(l);
    for (const t of this.twigs) { this.group.remove(t.m); t.m.dispose(); }
    this.limbs = []; this.twigs = [];
  }
}

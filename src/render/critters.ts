import * as THREE from 'three';
import type { TreeSim } from '../sim/tree';
import { Wind } from '../wind';
import { cleanLeafTexture, type Leaves } from './leaves';

/**
 * Small life in the meadow: butterflies by day over the flowers, fireflies at dusk and night, a pair of songbirds
 * that visits the crown. Pure decoration: reads season, night, weather, wind, the sway offsets and node positions;
 * writes nothing but its own meshes. Own xorshift (the sim rng is untouched).
 *
 * PowerVR rule. Butterflies and birds: three `InstancedMesh`es (butterfly wings, bird bodies, bird wings), material =
 * clone of the LIVE leaf material with only `map` swapped (safe path; on the full leaf path the Lambert configuration
 * the meadow and the blossom build), maps = canvas paintings through `cleanLeafTexture`, geometry = doubled cards with
 * position / normal / uv, instance matrices and colours only. Wing beats and body turns are matrices. Fireflies: ONE
 * `Mesh` on a clone of the canopy decal material (`map`, `color`, blending changed, like the rain) whose geometry is a
 * batch of camera-facing quads (position / normal / uv / index, the attributes of the decal plane) rewritten on the
 * CPU; the glow level of a fly is a cell of an 8-level atlas chosen through its uv plus the quad size.
 *
 * Presence is a pure function of the inputs each frame (how many of each kind should be out); the agents only carry
 * their flight state, so a date scrub or a storm removes them within a moment and nothing has to be undone.
 */

const TAU = Math.PI * 2;
const smooth = (a: number, b: number, x: number) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };

/** Butterfly colourings (albedo of the pale wing areas; margins and veins are dark in the map). */
const BF_COL = [[1.0, 0.5, 0.1], [1.0, 0.97, 0.72], [0.5, 0.68, 1.0]];
const BF_LOW = 6, BF_HIGH = 9, FF_LOW = 30, FF_HIGH = 48, BIRDS = 2;
/** Wanted brightness of a white wing under the current light (the Lambert term of an up-facing card is divided out). */
const LIT = 1.5;

function canvas(w: number, h: number) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  return [c, c.getContext('2d')!] as const;
}

/** One side of a butterfly: fore and hind wing, root at the left edge, head toward the top. White = tinted by the instance colour. */
function butterflyCanvas() {
  const [c, g] = canvas(128, 128);
  const wing = (pts: number[][]) => {
    g.beginPath(); g.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length; i++) g.quadraticCurveTo(pts[i][0], pts[i][1], pts[i][2], pts[i][3]);
    g.closePath();
  };
  const fore = [[2, 62], [40, 0, 122, 8], [128, 40, 92, 66], [50, 74, 2, 66]];
  const hind = [[2, 62], [70, 60, 96, 80], [100, 124, 52, 120], [10, 112, 2, 70]];
  for (const w of [hind, fore]) {
    wing(w); g.fillStyle = '#ffffff'; g.fill();
    g.save(); g.clip();
    g.strokeStyle = '#1c1612'; g.lineWidth = 20; wing(w); g.stroke();
    g.strokeStyle = 'rgba(40,30,22,0.55)'; g.lineWidth = 2.5;
    for (let k = 0; k < 6; k++) { g.beginPath(); g.moveTo(2, 64); g.lineTo(128, 4 + k * 24); g.stroke(); }
    g.restore();
  }
  g.fillStyle = '#1c1612';
  for (const [x, y, r] of [[88, 30, 7], [66, 44, 5], [62, 96, 6]]) { g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill(); }
  g.fillStyle = '#fff';
  for (const [x, y] of [[106, 16], [112, 30], [100, 50], [84, 100], [66, 112]]) { g.beginPath(); g.arc(x, y, 3, 0, TAU); g.fill(); }
  g.fillStyle = '#15110e'; g.fillRect(0, 26, 7, 86);
  return c;
}

/** Songbird from the side, beak to the right, feet at the bottom edge. */
function birdCanvas() {
  const [c, g] = canvas(128, 128);
  const ell = (x: number, y: number, rx: number, ry: number, rot: number, col: string) => { g.fillStyle = col; g.beginPath(); g.ellipse(x, y, rx, ry, rot, 0, TAU); g.fill(); };
  g.fillStyle = '#3a2d22'; g.beginPath(); g.moveTo(34, 62); g.lineTo(0, 48); g.lineTo(2, 64); g.lineTo(30, 80); g.closePath(); g.fill(); // tail
  g.fillStyle = '#2a2420'; g.fillRect(52, 88, 6, 38); g.fillRect(66, 88, 6, 38); // legs
  ell(60, 68, 36, 25, -0.22, '#6b5137'); // back
  ell(66, 76, 28, 18, -0.2, '#d6c6a8'); // belly
  ell(80, 66, 18, 16, -0.3, '#cf7f3c'); // breast
  ell(92, 46, 18, 17, 0, '#6b5137'); // head
  ell(97, 52, 10, 8, 0, '#cf7f3c'); // face
  ell(50, 64, 26, 13, 0.12, '#3f3226'); // folded wing
  g.strokeStyle = '#cbb894'; g.lineWidth = 3; g.beginPath(); g.moveTo(34, 60); g.lineTo(66, 66); g.stroke(); // wing bar
  g.fillStyle = '#2a2420'; g.beginPath(); g.moveTo(107, 41); g.lineTo(127, 48); g.lineTo(107, 53); g.closePath(); g.fill(); // beak
  ell(98, 43, 3.2, 3.2, 0, '#0c0a08'); // eye
  return c;
}

/** One bird wing from above: root at the left edge, leading edge toward the top. */
function birdWingCanvas() {
  const [c, g] = canvas(128, 128);
  g.beginPath(); g.moveTo(0, 28); g.quadraticCurveTo(70, 14, 126, 40); g.quadraticCurveTo(96, 74, 60, 96); g.quadraticCurveTo(26, 108, 0, 100); g.closePath();
  g.fillStyle = '#5a4633'; g.fill();
  g.save(); g.clip();
  g.strokeStyle = '#33281d'; g.lineWidth = 4;
  for (let k = 0; k < 9; k++) { g.beginPath(); g.moveTo(10 + k * 9, 50); g.lineTo(34 + k * 12, 112 - k * 8); g.stroke(); }
  g.strokeStyle = '#cbb894'; g.lineWidth = 6; g.beginPath(); g.moveTo(0, 52); g.quadraticCurveTo(50, 44, 96, 50); g.stroke();
  g.restore();
  return c;
}

/** 4 x 2 cells of a soft glow, level 1/8 .. 8/8, white on transparent (the material colour tints it). */
function glowCanvas() {
  const [c, g] = canvas(256, 128);
  for (let i = 0; i < 8; i++) {
    const x = (i % 4) * 64 + 32, y = (i >> 2) * 64 + 32, l = (i + 1) / 8;
    const gr = g.createRadialGradient(x, y, 0, x, y, 29);
    gr.addColorStop(0, `rgba(255,255,255,${l})`);
    gr.addColorStop(0.16, `rgba(255,255,255,${0.9 * l})`);
    gr.addColorStop(0.34, `rgba(255,255,255,${0.22 * l})`);
    gr.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = gr; g.fillRect(x - 32, y - 32, 64, 64);
  }
  return c;
}

/**
 * Doubled card(s) with position / normal / uv; every normal is local +y (as the meadow cards: lit from above on both
 * faces, also under a mirrored instance matrix). quads: [origin, edge u, edge v] in local space.
 */
function cards(quads: number[][][]): THREE.BufferGeometry {
  const n = quads.length * 12, P = new Float32Array(n * 3), N = new Float32Array(n * 3), U = new Float32Array(n * 2);
  const q = [0, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1];
  quads.forEach(([o, eu, ev], qi) => {
    for (let v = 0; v < 12; v++) {
      const s = v >= 6 ? [0, 2, 1, 3, 5, 4][v - 6] : v, a = q[s * 2], b = q[s * 2 + 1], k = qi * 12 + v;
      for (let d = 0; d < 3; d++) P[k * 3 + d] = o[d] + eu[d] * a + ev[d] * b;
      N[k * 3 + 1] = 1;
      U[k * 2] = a; U[k * 2 + 1] = b;
    }
  });
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(P, 3));
  g.setAttribute('normal', new THREE.BufferAttribute(N, 3));
  g.setAttribute('uv', new THREE.BufferAttribute(U, 2));
  g.boundingSphere = new THREE.Sphere(new THREE.Vector3(0, 6, 0), 90);
  return g;
}

export interface CritterEnv {
  /** `params.critters.amount`: 0 = none, 1 = normal. */
  amount: number;
  low: boolean;
  /** `Atmosphere.night` 0..1. */
  night: number;
  /** Year phase 0..1 (midsummer 0.375 when seasons are off). */
  phase: number;
  /** The season was scrubbed / switched this frame: what should not be out disappears at once. */
  jumped: boolean;
  rain: number;
  cloud: number;
  violence: number;
  wind: Wind;
  /** `sway.D`: offset per node id (3 floats). */
  D: Float32Array | null;
  cam: THREE.Vector3;
  camQ: THREE.Quaternion;
  sun: THREE.DirectionalLight;
  hemi: THREE.HemisphereLight;
  /** Flower patches of the near meadow (instance matrices are read for landing spots). */
  flowers: THREE.InstancedMesh[];
}

interface Butterfly { x: number; y: number; z: number; vx: number; vy: number; vz: number; hx: number; hz: number; tx: number; ty: number; tz: number; has: boolean; sit: boolean; timer: number; flap: number; rate: number; jx: number; jy: number; jz: number; jt: number; a: number; col: number; size: number }
/** st: 0 away, 1 approach, 2 perched, 3 leaving, 4 hop. */
interface Bird { st: number; t: number; dur: number; node: number; to: number; sx: number; sy: number; sz: number; x: number; y: number; z: number; hx: number; hz: number; gx: number; gz: number; wait: number; next: number; pitch: number; flapping: boolean; flap: number }

export class Critters {
  group = new THREE.Group();
  wings: THREE.InstancedMesh;
  bodies: THREE.InstancedMesh;
  birdWings: THREE.InstancedMesh;
  glow: THREE.Mesh;
  /** Test hooks: presence 0..1 per kind instead of the computed one (null = computed). */
  force: { butterflies?: number; fireflies?: number; birds?: number } | null = null;
  stats = { butterflies: 0, settled: 0, fireflies: 0, lit: 0, birds: 0, perched: 0, flushes: 0, frames: 0, sumMs: 0, maxMs: 0, pb: 0, pf: 0, pbird: 0 };
  private bf: Butterfly[] = [];
  private birds: Bird[] = [];
  private ffN: number;
  private ffH: Float32Array;
  private t = 0;
  private seed = 0x9e3779b9;
  private m = new THREE.Matrix4();
  private v = new THREE.Vector3();
  private right = new THREE.Vector3();
  private up = new THREE.Vector3();
  private P = [0, 0, 0];
  private flushNow = false;
  private lastViolence = 0;

  /** decal: the canopy-shadow material (program donor of the glow quads). */
  constructor(leaves: Leaves, decal: THREE.MeshBasicMaterial, low: boolean) {
    this.group.name = 'critters';
    const live = leaves.mesh.material as THREE.MeshLambertMaterial;
    const safe = live.isMeshLambertMaterial || (live as unknown as THREE.MeshBasicMaterial).isMeshBasicMaterial;
    const inst = (cv: HTMLCanvasElement, geo: THREE.BufferGeometry, n: number) => {
      const src = new THREE.CanvasTexture(cv);
      src.colorSpace = THREE.SRGBColorSpace;
      const tex = cleanLeafTexture(src, true);
      src.dispose();
      const m = safe ? live.clone() : new THREE.MeshLambertMaterial({ side: THREE.FrontSide, map: tex, alphaTest: 0.5 });
      m.map = tex;
      const mesh = new THREE.InstancedMesh(geo, m, n);
      mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
      (mesh.instanceMatrix.array as Float32Array).fill(0);
      mesh.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(n * 3).fill(1), 3).setUsage(THREE.DynamicDrawUsage);
      mesh.castShadow = false; mesh.receiveShadow = false; mesh.frustumCulled = false; mesh.matrixAutoUpdate = false;
      if (!low) {
        // GTAO g-buffer material with the alpha cut-out (High only; never compiled on Low). See Post, meadow, blossom.
        const gb = new THREE.MeshNormalMaterial({ side: THREE.FrontSide, blending: THREE.NoBlending });
        gb.allowOverride = false;
        gb.onBeforeCompile = (sh) => {
          sh.uniforms.cutMap = { value: tex };
          sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying vec2 vCutUv;').replace('#include <begin_vertex>', '#include <begin_vertex>\nvCutUv = uv;');
          sh.fragmentShader = sh.fragmentShader.replace('void main() {', 'uniform sampler2D cutMap;\nvarying vec2 vCutUv;\nvoid main() {').replace('#include <clipping_planes_fragment>', '#include <clipping_planes_fragment>\nif (texture2D(cutMap, vCutUv).a < 0.5) discard;');
        };
        mesh.userData.gbufferMaterial = gb;
      }
      mesh.visible = false;
      this.group.add(mesh);
      return mesh;
    };
    const nb = low ? BF_LOW : BF_HIGH;
    // Wing: root on the local z axis, span along +x, chord along z (uv v = toward the head).
    const wingGeo = cards([[[0, 0, -0.5], [1, 0, 0], [0, 0, 1]]]);
    this.wings = inst(butterflyCanvas(), wingGeo, nb * 2);
    // Body: an upright side view and a flat top view crossed (beak toward +x).
    this.bodies = inst(birdCanvas(), cards([[[-0.5, -0.5, 0], [1, 0, 0], [0, 1, 0]], [[-0.5, 0.02, -0.2], [1, 0, 0], [0, 0, 0.4]]]), BIRDS);
    this.birdWings = inst(birdWingCanvas(), wingGeo, BIRDS * 2);
    for (let i = 0; i < nb; i++) this.bf.push({ x: 0, y: 0, z: 0, vx: 0, vy: 0, vz: 0, hx: 1, hz: 0, tx: 0, ty: 0, tz: 0, has: false, sit: false, timer: 0, flap: this.rnd() * 6, rate: 9 + 3 * this.rnd(), jx: 0, jy: 0, jz: 0, jt: 0, a: 0, col: i % 3, size: 0.85 + 0.3 * this.rnd() });
    for (let i = 0; i < BIRDS; i++) this.birds.push({ st: 0, t: 0, dur: 1, node: -1, to: -1, sx: 0, sy: 0, sz: 0, x: 0, y: 0, z: 0, hx: 1, hz: 0, gx: 1, gz: 0, wait: 3 + 5 * this.rnd() + i * 2, next: 1, pitch: 0, flapping: false, flap: 0 });

    // Fireflies: one batch of quads on a decal clone.
    const n = this.ffN = low ? FF_LOW : FF_HIGH;
    this.ffH = new Float32Array(n * 8);
    for (let i = 0; i < n * 8; i++) this.ffH[i] = this.rnd();
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(n * 12), 3).setUsage(THREE.DynamicDrawUsage));
    const nrm = new Float32Array(n * 12);
    for (let i = 0; i < n * 4; i++) nrm[i * 3 + 2] = 1;
    geo.setAttribute('normal', new THREE.BufferAttribute(nrm, 3));
    geo.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(n * 8), 2).setUsage(THREE.DynamicDrawUsage));
    const idx = new Uint16Array(n * 6);
    for (let i = 0; i < n; i++) idx.set([i * 4, i * 4 + 1, i * 4 + 2, i * 4, i * 4 + 2, i * 4 + 3], i * 6);
    geo.setIndex(new THREE.BufferAttribute(idx, 1));
    geo.boundingSphere = new THREE.Sphere(new THREE.Vector3(0, 2, 0), 40);
    const gm = decal.clone();
    const gt = new THREE.CanvasTexture(glowCanvas());
    gt.colorSpace = decal.map?.colorSpace ?? THREE.SRGBColorSpace;
    gm.map = gt;
    gm.blending = THREE.AdditiveBlending;
    gm.depthWrite = false;
    gm.opacity = 1;
    this.glow = new THREE.Mesh(geo, gm);
    this.glow.frustumCulled = false; this.glow.visible = false; this.glow.renderOrder = 4;
    const hidden = new THREE.MeshBasicMaterial({ visible: false });
    (hidden as unknown as { allowOverride: boolean }).allowOverride = false;
    this.glow.userData.gbufferMaterial = hidden;
    this.group.add(this.glow);
  }

  private rnd() { let s = this.seed; s ^= s << 13; s ^= s >>> 17; s ^= s << 5; this.seed = s; return (s >>> 0) / 4294967296; }

  /** All birds leave at once (storm front, limb break). */
  flush() { this.flushNow = true; }

  /** Positions for scripts: butterflies, birds, lit fireflies. */
  state() {
    return {
      butterflies: this.bf.filter((b) => b.a > 0).map((b) => ({ x: b.x, y: b.y, z: b.z, sit: b.sit, col: b.col })),
      birds: this.birds.map((b) => ({ st: b.st, x: b.x, y: b.y, z: b.z, node: b.node, t: b.t, dur: b.dur })),
    };
  }

  frame(dt: number, sim: TreeSim, env: CritterEnv) {
    const t0 = performance.now(), S = this.stats, ph = env.phase, F = this.force;
    this.t += dt;
    const dry = 1 - smooth(0.01, 0.08, env.rain), amt = Math.max(0, env.amount);
    // Butterflies: flowers in bloom (spring to early autumn), bright day, dry, no strong wind.
    let pb = smooth(0.035, 0.1, ph) * (1 - smooth(0.5, 0.58, ph)) * (1 - smooth(0.02, 0.2, env.night)) * dry * (1 - smooth(0.3, 0.6, env.cloud)) * (1 - smooth(0.5, 0.72, env.wind.base));
    // Fireflies: late spring and summer, dusk and night, dry, calm.
    let pf = smooth(0.12, 0.2, ph) * (1 - smooth(0.42, 0.5, ph)) * smooth(0.25, 0.85, env.night) * dry * (1 - smooth(0.45, 0.7, env.wind.base));
    // Birds: by day, dry, no storm; one instead of two in winter.
    const winter = ph > 0.7;
    let pbird = (env.night < 0.35 && env.rain < 0.03 && env.violence < 0.4 ? 1 : 0) * (winter ? 0.5 : 1);
    if (F) { if (F.butterflies !== undefined) pb = F.butterflies; if (F.fireflies !== undefined) pf = F.fireflies; if (F.birds !== undefined) pbird = F.birds; }
    pb *= Math.min(1.5, amt); pf *= Math.min(1.5, amt); if (amt <= 0) pbird = 0;
    S.pb = pb; S.pf = pf; S.pbird = pbird;
    // Light on an up-facing Lambert card, divided out of the instance colours.
    const sp = env.sun.position, tp = env.sun.target.position, sl = Math.hypot(sp.x - tp.x, sp.y - tp.y, sp.z - tp.z) || 1;
    const sc = env.sun.color, hc = env.hemi.color;
    const E = Math.max(0.12, env.sun.intensity * Math.max(0, (sp.y - tp.y) / sl) * (0.21 * sc.r + 0.72 * sc.g + 0.07 * sc.b) + env.hemi.intensity * (0.21 * hc.r + 0.72 * hc.g + 0.07 * hc.b));
    const lit = LIT / E;
    this.butterflies(dt, env, pb, lit);
    this.fireflies(env, pf);
    this.birdFrame(dt, sim, env, pbird, lit, winter);
    this.lastViolence = env.violence;
    const ms = performance.now() - t0;
    S.frames++; S.sumMs += ms; if (ms > S.maxMs) S.maxMs = ms;
  }

  /** Size boost with camera distance, so a creature still reads from the framing distance. */
  private boost(env: CritterEnv, x: number, y: number, z: number, k: number) {
    const d = Math.hypot(x - env.cam.x, y - env.cam.y, z - env.cam.z);
    return 1 + k * Math.max(0, Math.min(1, (d - 4) / 14));
  }

  private pickFlower(env: CritterEnv, b: Butterfly) {
    let best = 1e9, found = false;
    for (let k = 0; k < 8; k++) {
      const mesh = env.flowers[(this.rnd() * env.flowers.length) | 0];
      if (!mesh || mesh.count < 1) continue;
      const a = mesh.instanceMatrix.array, o = ((this.rnd() * mesh.count) | 0) * 16, sy = Math.hypot(a[o + 4], a[o + 5], a[o + 6]);
      if (sy < 0.05) continue;
      const x = a[o + 12], z = a[o + 14], r = Math.hypot(x, z);
      if (r > 17 || r < 1.2) continue;
      const d = Math.abs(Math.hypot(x - b.x, z - b.z) - 4);
      if (d < best) { best = d; b.tx = x; b.tz = z; b.ty = a[o + 13] + sy * 0.9; found = true; }
    }
    if (!found) { const an = this.rnd() * TAU, r = 3 + 10 * this.rnd(); b.tx = Math.cos(an) * r; b.tz = Math.sin(an) * r; b.ty = 0.45; }
    b.has = true; b.timer = 0;
  }

  private butterflies(dt: number, env: CritterEnv, p: number, lit: number) {
    const mesh = this.wings, S = this.stats, n = this.bf.length, want = Math.round(n * Math.min(1, p)), wind = env.wind;
    let alive = 0, settled = 0;
    const A = mesh.instanceMatrix.array as Float32Array, C = mesh.instanceColor!.array as Float32Array;
    for (let i = 0; i < n; i++) {
      const b = this.bf[i], w = i < want;
      if (b.a <= 0 && !w) continue;
      if (b.a <= 0) {
        // Arrives small at a flower some metres out.
        b.x = 0; b.z = 0; this.pickFlower(env, b);
        b.x = b.tx + (this.rnd() - 0.5) * 3; b.z = b.tz + (this.rnd() - 0.5) * 3; b.y = 0.8 + this.rnd() * 0.6;
        b.vx = b.vy = b.vz = 0; b.sit = false; b.has = false;
      }
      b.a = w ? Math.min(1, b.a + dt * 1.2) : env.jumped ? 0 : Math.max(0, b.a - dt * 0.9);
      alive++;
      const gust = wind.gust(b.x, b.z);
      let th: number;
      if (b.sit) {
        settled++;
        b.timer -= dt;
        b.x = b.tx; b.y = b.ty; b.z = b.tz;
        // Wings held together, opening slowly and closing again.
        const o = Math.max(0, Math.sin(b.timer * 2.6 + b.rate));
        th = 1.4 - 1.15 * o * o;
        if (b.timer <= 0 || !w || gust > 0.62) { b.sit = false; b.has = false; b.vy = 0.8; }
      } else {
        if (!b.has || b.timer > 18) this.pickFlower(env, b);
        b.timer += dt;
        const dx = b.tx - b.x, dz = b.tz - b.z, d = Math.hypot(dx, dz) || 1e-3, near = Math.min(1, d / 0.6);
        b.jt -= dt;
        if (b.jt <= 0) { b.jt = 0.1 + 0.28 * this.rnd(); b.jx = (this.rnd() - 0.5) * 3.2; b.jz = (this.rnd() - 0.5) * 3.2; b.jy = (this.rnd() - 0.5) * 2.4; }
        // Carried by gusts: the part of the wind above the lull, a share of it.
        const carry = Math.max(-0.2, (Wind.speed(gust) - Wind.speed(wind.base * 0.7)) * 0.3);
        const sp = 1.5 * near + 0.15;
        let wx = (dx / d) * sp + b.jx * near + wind.dirX * carry, wz = (dz / d) * sp + b.jz * near + wind.dirZ * carry;
        // Cruise above the flowers, sink onto the target at the end.
        const hgt = b.ty + Math.min(0.75, d * 0.3) * (0.7 + 0.5 * Math.sin(b.flap * 0.07 + i));
        let wy = (hgt - b.y) * 3 + b.jy * (0.25 + 0.75 * near);
        if (!w) { wy = 1.2; wx = wind.dirX * 2 + b.jx; wz = wind.dirZ * 2 + b.jz; }
        const k = Math.min(1, dt / 0.14);
        b.vx += (wx - b.vx) * k; b.vy += (wy - b.vy) * k; b.vz += (wz - b.vz) * k;
        b.x += b.vx * dt; b.y = Math.max(0.2, b.y + b.vy * dt); b.z += b.vz * dt;
        const hv = Math.hypot(b.vx, b.vz);
        if (hv > 0.2) { const hk = Math.min(1, dt * 7); b.hx += (b.vx / hv - b.hx) * hk; b.hz += (b.vz / hv - b.hz) * hk; const hl = Math.hypot(b.hx, b.hz) || 1; b.hx /= hl; b.hz /= hl; }
        b.flap += dt * TAU * b.rate;
        th = 0.3 + 0.95 * Math.sin(b.flap);
        if (w && d < 0.1 && Math.abs(b.y - b.ty) < 0.12) { b.sit = true; b.timer = 3 + 6 * this.rnd(); }
      }
      // Two wings hinged on the body axis; the stroke lifts and drops the body a little.
      const s = 0.075 * b.size * b.a * this.boost(env, b.x, b.y, b.z, 1.3), c = Math.cos(th), sn = Math.sin(th);
      const fx = b.hx, fz = b.hz, rx = -fz, rz = fx, y = b.y + (b.sit ? 0.01 : -0.035 * sn);
      const col = BF_COL[b.col];
      for (let side = 0; side < 2; side++) {
        const q = side ? -1 : 1, o = (i * 2 + side) * 16;
        A[o] = q * rx * c * s; A[o + 1] = sn * s; A[o + 2] = q * rz * c * s; A[o + 3] = 0;
        A[o + 4] = -q * rx * sn * s; A[o + 5] = c * s; A[o + 6] = -q * rz * sn * s; A[o + 7] = 0;
        A[o + 8] = fx * s * 1.15; A[o + 9] = b.sit ? 0 : 0.3 * s; A[o + 10] = fz * s * 1.15; A[o + 11] = 0;
        A[o + 12] = b.x; A[o + 13] = y; A[o + 14] = b.z; A[o + 15] = 1;
        const ci = (i * 2 + side) * 3;
        C[ci] = col[0] * lit; C[ci + 1] = col[1] * lit; C[ci + 2] = col[2] * lit;
      }
      if (b.a <= 0) A.fill(0, i * 32, i * 32 + 32);
    }
    S.butterflies = alive; S.settled = settled;
    if (alive || mesh.visible) {
      mesh.visible = alive > 0;
      mesh.instanceMatrix.needsUpdate = true;
      mesh.instanceColor!.needsUpdate = true;
    }
  }

  private fireflies(env: CritterEnv, p: number) {
    const mesh = this.glow, S = this.stats, n = this.ffN, H = this.ffH, t = this.t;
    const shown = Math.min(n, n * Math.min(1, p));
    if (shown <= 0.01) { if (mesh.visible) mesh.visible = false; S.fireflies = 0; S.lit = 0; return; }
    const geo = mesh.geometry, P = geo.attributes.position.array as Float32Array, U = geo.attributes.uv.array as Float32Array;
    const r = this.right.set(1, 0, 0).applyQuaternion(env.camQ), u = this.up.set(0, 1, 0).applyQuaternion(env.camQ);
    let q = 0, lit = 0;
    for (let i = 0; i < n && i < shown; i++) {
      const h = i * 8, per = 2.6 + 3.4 * H[h], s = ((t / per + H[h + 1]) % 1) * per;
      // One flash: quick rise, short hold, slow fade, then dark. A quarter of them flash twice.
      let b = s < 0.22 ? s / 0.22 : s < 0.5 ? 1 : s < 1.25 ? 1 - (s - 0.5) / 0.75 : 0;
      if (H[h + 7] < 0.25 && s > 1.45 && s < 2.1) { const s2 = s - 1.45; b = s2 < 0.15 ? s2 / 0.15 : 1 - (s2 - 0.15) / 0.5; }
      b = b * b * Math.min(1, shown - i);
      if (b < 0.02) continue;
      lit++;
      // Slow drifting path around a home spot, low over the grass, denser under and around the crown.
      const an = H[h + 2] * TAU, rad = 1.6 + 13 * H[h + 3] * H[h + 3], f = 0.6 + 0.8 * H[h + 4];
      const x = Math.cos(an) * rad + 1.3 * Math.sin(t * 0.19 * f + h) + 0.5 * Math.sin(t * 0.53 * f + 2.1 * h);
      const z = Math.sin(an) * rad + 1.3 * Math.sin(t * 0.17 * f + 1.7 * h) + 0.5 * Math.cos(t * 0.47 * f + h);
      const y = 0.5 + 1.5 * H[h + 5] * H[h + 5] + (H[h + 6] < 0.2 ? 1.6 * H[h + 6] * 5 : 0) + 0.22 * Math.sin(t * 0.37 * f + 3 * h) + 0.18 * b;
      const d = Math.hypot(x - env.cam.x, y - env.cam.y, z - env.cam.z);
      const sz = Math.max(0.2, d * 0.021) * (0.6 + 0.4 * b);
      const cell = Math.min(7, Math.floor(b * 8)), u0 = (cell % 4) / 4, v0 = 1 - ((cell >> 2) + 1) / 2;
      const o = q * 12, uo = q * 8;
      for (let c = 0; c < 4; c++) {
        const a = c === 0 || c === 3 ? -1 : 1, e = c < 2 ? -1 : 1;
        P[o + c * 3] = x + (r.x * a + u.x * e) * sz; P[o + c * 3 + 1] = y + (r.y * a + u.y * e) * sz; P[o + c * 3 + 2] = z + (r.z * a + u.z * e) * sz;
        U[uo + c * 2] = u0 + (a > 0 ? 0.25 : 0); U[uo + c * 2 + 1] = v0 + (e > 0 ? 0.5 : 0);
      }
      q++;
    }
    S.fireflies = Math.ceil(shown); S.lit = lit;
    geo.setDrawRange(0, q * 6);
    mesh.visible = q > 0;
    if (!q) return;
    geo.attributes.position.needsUpdate = true;
    geo.attributes.uv.needsUpdate = true;
    // Warm yellow-green; the night exposure is high, so keep the core just under white.
    (mesh.material as THREE.MeshBasicMaterial).color.setRGB(1.25, 1.5, 0.3);
  }

  /** World position of a perch (rest pose + sway offset), top of the twig. */
  private perch(sim: TreeSim, D: Float32Array | null, id: number, out: number[]) {
    const nd = sim.nodes[id];
    if (!nd) return false;
    const k = id * 3, has = D && D.length >= k + 3;
    out[0] = nd.wx + (has ? D![k] : 0); out[1] = nd.wy + (has ? D![k + 1] : 0) + nd.radius; out[2] = nd.wz + (has ? D![k + 2] : 0);
    return !sim.chains[nd.chain]?.pruned;
  }

  private okPerch(sim: TreeSim, id: number, H: number) {
    const nd = sim.nodes[id];
    if (!nd || nd.order < 1 || nd.radius < 0.006 || nd.radius > 0.07 || nd.wy < 0.4 * H || nd.wy < 2.2) return false;
    const ch = sim.chains[nd.chain];
    return !!ch && !ch.pruned;
  }

  private pickPerch(sim: TreeSim, near: number) {
    const H = sim.bboxMax[1], N = sim.nodes.length;
    if (H < 3.5 || N < 400) return -1;
    let best = -1, bs = -1e9;
    const nn = near >= 0 ? sim.nodes[near] : null;
    for (let k = 0; k < 90; k++) {
      const id = (this.rnd() * N) | 0;
      if (!this.okPerch(sim, id, H)) continue;
      const nd = sim.nodes[id];
      let sc = nd.light * 1.2 + (nd.wy / H) * 0.8 + Math.min(nd.radius, 0.03) * 12 + this.rnd() * 0.3;
      if (nn) { const d = Math.hypot(nd.wx - nn.wx, nd.wy - nn.wy, nd.wz - nn.wz); if (d < 0.45) continue; sc = -Math.abs(d - 1) + nd.light * 0.3; }
      if (sc > bs) { bs = sc; best = id; }
    }
    return best;
  }

  private leave(b: Bird, env: CritterEnv, fast: boolean, an: number) {
    b.st = 3; b.t = 0; b.sx = b.x; b.sy = b.y; b.sz = b.z;
    b.gx = Math.cos(an); b.gz = Math.sin(an);
    b.dur = fast ? 5.2 : 7;
    void env;
  }

  private birdFrame(dt: number, sim: TreeSim, env: CritterEnv, p: number, lit: number, winter: boolean) {
    const S = this.stats, want = Math.round(BIRDS * Math.min(1, p)), P = this.P;
    // Storm front arriving, or a limb coming off under a bird: everybody goes in the same frame.
    let flush = this.flushNow || (env.violence > 0.4 && this.lastViolence <= 0.4) || env.rain > 0.05;
    this.flushNow = false;
    for (const b of this.birds) if ((b.st === 2 || b.st === 4) && !this.perch(sim, env.D, b.node, P)) flush = true;
    if (flush) {
      const an = Math.atan2(env.wind.dirZ, env.wind.dirX) + (this.rnd() - 0.5);
      let any = false;
      this.birds.forEach((b, i) => { if (b.st === 1 || b.st === 2 || b.st === 4) { this.leave(b, env, true, an + i * 0.12); any = true; } });
      if (any) S.flushes++;
    }
    let out = 0, perched = 0;
    const A = this.bodies.instanceMatrix.array as Float32Array, W = this.birdWings.instanceMatrix.array as Float32Array;
    for (let i = 0; i < BIRDS; i++) {
      const b = this.birds[i], w = i < want;
      if (env.jumped && !w) b.st = 0;
      if (b.st === 0) {
        A.fill(0, i * 16, i * 16 + 16); W.fill(0, i * 32, i * 32 + 32);
        b.wait -= dt;
        if (!w || b.wait > 0) continue;
        const lead = this.birds[0];
        if (i > 0 && lead.st !== 1 && lead.st !== 2) { b.wait = 0.5; continue; }
        b.node = this.pickPerch(sim, i > 0 ? lead.node : -1);
        if (b.node < 0) { b.wait = 4; continue; }
        const an = i > 0 ? Math.atan2(lead.sz, lead.sx) + 0.1 : this.rnd() * TAU;
        this.perch(sim, env.D, b.node, P);
        b.sx = Math.cos(an) * 55; b.sz = Math.sin(an) * 55; b.sy = P[1] + 3 + 6 * this.rnd();
        b.st = 1; b.t = 0; b.dur = 6.2 + this.rnd(); b.flap = 0;
        b.x = b.sx; b.y = b.sy; b.z = b.sz;
      }
      out++;
      b.t += dt;
      const u = Math.min(1, b.t / b.dur);
      b.flap += dt * TAU * 13;
      if (b.st === 1) {
        if (!this.perch(sim, env.D, b.node, P)) { this.leave(b, env, true, this.rnd() * TAU); continue; }
        // Bounding flight: a burst of wing beats climbs, wings closed sinks; the bounds flatten into the landing flare.
        const e = 1 - Math.pow(1 - u, 1.8), cyc = (b.t * 1.8) % 1, fade = Math.min(1, (1 - u) * 6), flare = u > 0.9;
        const dx = P[0] - b.sx, dz = P[2] - b.sz, dl = Math.hypot(dx, dz) || 1;
        b.x = b.sx + dx * e; b.z = b.sz + dz * e;
        b.y = b.sy + (P[1] + 0.05 - b.sy) * e - 0.42 * fade * Math.cos(TAU * cyc) + 0.5 * Math.sin(Math.PI * Math.min(1, (1 - u) * 5)) * (u > 0.8 ? -0.6 : 0);
        b.hx = dx / dl; b.hz = dz / dl;
        b.flapping = cyc < 0.52 || flare;
        b.pitch = flare ? 0.7 * (u - 0.9) * 10 : 0.45 * fade * Math.sin(TAU * cyc);
        if (u >= 1) { b.st = 2; b.t = 0; b.dur = (winter ? 6 : 9) + 16 * this.rnd(); b.next = 0.8 + 2 * this.rnd(); b.gx = b.hx; b.gz = b.hz; }
      } else if (b.st === 2) {
        perched++;
        b.x = P[0]; b.y = P[1]; b.z = P[2];
        this.perch(sim, env.D, b.node, P); b.x = P[0]; b.y = P[1]; b.z = P[2];
        b.flapping = false; b.pitch = 0.3;
        // Turns in quick jerks.
        const hk = Math.min(1, dt * 18); b.hx += (b.gx - b.hx) * hk; b.hz += (b.gz - b.hz) * hk; const hl = Math.hypot(b.hx, b.hz) || 1; b.hx /= hl; b.hz /= hl;
        b.next -= dt;
        if (b.next <= 0) {
          b.next = 1 + 3 * this.rnd();
          const ch = sim.chains[sim.nodes[b.node].chain], at = ch.nodes.indexOf(b.node), to = ch.nodes[at + (this.rnd() < 0.5 ? -1 : 1) * (1 + ((this.rnd() * 2) | 0))];
          if (this.rnd() < 0.45 && to !== undefined && this.okPerch(sim, to, 0)) { b.st = 4; b.to = to; b.dur = b.t; b.t = 0; b.sx = 0.24; }
          else { const an = Math.atan2(b.gz, b.gx) + (this.rnd() < 0.5 ? -1 : 1) * (0.6 + 1.8 * this.rnd()); b.gx = Math.cos(an); b.gz = Math.sin(an); }
        }
        const lead = this.birds[0];
        if (b.st === 2 && (b.t > b.dur || !w || (i > 0 && lead.st === 3 && lead.t > 0.5))) this.leave(b, env, false, i > 0 && lead.st === 3 ? Math.atan2(lead.gz, lead.gx) + 0.1 : this.rnd() * TAU);
      } else if (b.st === 4) {
        // Hop to the next node of the twig; `sx` = hop length in s, `dur` = time sat so far.
        perched++;
        const k = Math.min(1, b.t / b.sx), ax = P[0], ay = P[1], az = P[2];
        this.perch(sim, env.D, b.to, P);
        b.x = ax + (P[0] - ax) * k; b.y = ay + (P[1] - ay) * k + 0.07 * Math.sin(Math.PI * k); b.z = az + (P[2] - az) * k;
        b.flapping = true; b.pitch = 0.3;
        if (k >= 1) { b.st = 2; b.node = b.to; b.t = b.dur; b.dur = b.t + 4 + 8 * this.rnd(); }
      } else {
        // Take-off: a jump and continuous beats, then bounding away.
        const e = Math.pow(u, 1.7), cyc = (b.t * 1.8) % 1, fade = Math.min(1, u * 8);
        b.x = b.sx + b.gx * 60 * e; b.z = b.sz + b.gz * 60 * e;
        b.y = b.sy + 9 * Math.pow(u, 0.8) + 0.5 * Math.min(1, b.t * 3) - 0.42 * fade * Math.cos(TAU * cyc);
        const hk = Math.min(1, dt * 10); b.hx += (b.gx - b.hx) * hk; b.hz += (b.gz - b.hz) * hk; const hl = Math.hypot(b.hx, b.hz) || 1; b.hx /= hl; b.hz /= hl;
        b.flapping = b.t < 0.7 || cyc < 0.52;
        b.pitch = b.t < 0.7 ? 0.6 : 0.45 * Math.sin(TAU * cyc);
        if (u >= 1) { b.st = 0; b.wait = (winter ? 18 : 6) + 14 * this.rnd() + i * 1.5; continue; }
      }
      // Body: crossed side and top view, feet on the perch.
      const L = 0.17 * this.boost(env, b.x, b.y, b.z, 1.2), cp = Math.cos(b.pitch), sn = Math.sin(b.pitch);
      const fx = b.hx, fz = b.hz, rx = -fz, rz = fx, o = i * 16;
      const Xx = fx * cp, Xy = sn, Xz = fz * cp, Yx = -fx * sn, Yy = cp, Yz = -fz * sn;
      const cx = b.x + Yx * L * 0.48, cy = b.y + Yy * L * 0.48, cz = b.z + Yz * L * 0.48;
      A[o] = Xx * L; A[o + 1] = Xy * L; A[o + 2] = Xz * L; A[o + 3] = 0;
      A[o + 4] = Yx * L; A[o + 5] = Yy * L; A[o + 6] = Yz * L; A[o + 7] = 0;
      A[o + 8] = rx * L; A[o + 9] = 0; A[o + 10] = rz * L; A[o + 11] = 0;
      A[o + 12] = cx; A[o + 13] = cy; A[o + 14] = cz; A[o + 15] = 1;
      const th = 0.15 + 1.05 * Math.sin(b.flap), c = Math.cos(th), s = Math.sin(th), ws = b.flapping ? L * 0.95 : 0;
      for (let side = 0; side < 2; side++) {
        const q = side ? -1 : 1, wo = (i * 2 + side) * 16;
        W[wo] = (q * rx * c + Yx * s) * ws; W[wo + 1] = Yy * s * ws; W[wo + 2] = (q * rz * c + Yz * s) * ws; W[wo + 3] = 0;
        W[wo + 4] = (-q * rx * s + Yx * c) * ws; W[wo + 5] = Yy * c * ws; W[wo + 6] = (-q * rz * s + Yz * c) * ws; W[wo + 7] = 0;
        W[wo + 8] = Xx * ws * 0.7; W[wo + 9] = Xy * ws * 0.7; W[wo + 10] = Xz * ws * 0.7; W[wo + 11] = 0;
        W[wo + 12] = cx + Xx * L * 0.05 + Yx * L * 0.1; W[wo + 13] = cy + Xy * L * 0.05 + Yy * L * 0.1; W[wo + 14] = cz + Xz * L * 0.05 + Yz * L * 0.1; W[wo + 15] = 1;
      }
    }
    S.birds = out; S.perched = perched;
    if (out || this.bodies.visible) {
      const C = this.bodies.instanceColor!.array as Float32Array, WC = this.birdWings.instanceColor!.array as Float32Array;
      C.fill(lit * 0.8); WC.fill(lit * 0.8);
      this.bodies.visible = this.birdWings.visible = out > 0;
      this.bodies.instanceMatrix.needsUpdate = this.birdWings.instanceMatrix.needsUpdate = true;
      this.bodies.instanceColor!.needsUpdate = this.birdWings.instanceColor!.needsUpdate = true;
    }
  }
}

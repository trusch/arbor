import * as THREE from 'three';
import type { TreeSim } from '../sim/tree';
import { Wind } from '../wind';
import { cleanLeafTexture, type Leaves } from './leaves';

/**
 * Small life in the meadow: butterflies by day over the flowers, fireflies at dusk and night, a pair of songbirds
 * that visits the crown. Pure decoration: reads season, night, weather, wind, the sway offsets and node positions;
 * writes nothing but its own meshes. Own xorshift (the sim rng is untouched).
 *
 * PowerVR rule. Butterflies and birds: two `InstancedMesh`es (butterfly wings; the birds), material = clone of the
 * LIVE leaf material with only `map` swapped (safe path; on the full leaf path the Lambert configuration the meadow
 * and the blossom build), maps = canvas paintings through `cleanLeafTexture`, attributes position / normal / uv,
 * instance matrices and colours: the program the meadow tufts already use. Butterfly wings are doubled cards moved by
 * matrices. The birds are ONE mesh with a single identity instance whose geometry holds a solid model per bird (lofted
 * body with head and beak, two jointed wings, tail fan, legs), posed on the CPU in world space every frame with real
 * normals, so the scene's sun and hemisphere light it; plumage = an opaque atlas row per kind. Fireflies: ONE
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
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
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
    g.strokeStyle = '#2a1e16'; g.lineWidth = 11; wing(w); g.stroke();
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

/** Bird kinds: body length in metres, proportions against the base profile, plumage (atlas row = index). */
const KINDS = [
  // robin: plump, orange face and breast
  { L: 0.15, fat: 1.1, head: 1.06, beak: 0.8, tail: 0.85, wing: 0.95, glide: false, back: '#6b5137', belly: '#d9cdb4', breast: '#cf6a2c', face: '#cf6a2c', cap: '', cheek: '', bib: '', beakC: '#2a2420', ring: '', wing0: '#3d3024', cov: '#6b5137', bar: '#9a8462', under: '#b9a88c', leg: '#4a382c' },
  // tit: black cap and bib, white cheek, yellow belly, blue-grey wing with a white bar
  { L: 0.14, fat: 1.0, head: 1.02, beak: 0.65, tail: 0.95, wing: 0.95, glide: false, back: '#66763a', belly: '#e3c93e', breast: '', face: '', cap: '#14161a', cheek: '#f1efe6', bib: '#14161a', beakC: '#1c1c1e', ring: '', wing0: '#2c3a4a', cov: '#5a7186', bar: '#eeeeea', under: '#c4c8c8', leg: '#3c4652' },
  // blackbird: larger, slimmer, long tail, yellow beak and eye ring; glides between bursts
  { L: 0.25, fat: 0.9, head: 0.86, beak: 1.2, tail: 1.3, wing: 1.1, glide: true, back: '#2b2826', belly: '#383330', breast: '', face: '', cap: '', cheek: '', bib: '', beakC: '#eba21c', ring: '#e2a820', wing0: '#211f1d', cov: '#302c2a', bar: '', under: '#4a443f', leg: '#3a2c20' },
];
/** Body profile, tail root to beak tip: x along the body, centre height, half height, half width (units of body length). */
const RINGS = [[-0.25, 0.0, 0.014, 0.014], [-0.18, 0.0, 0.062, 0.056], [-0.08, 0.0, 0.115, 0.105], [0.04, 0.005, 0.135, 0.125], [0.14, 0.02, 0.125, 0.115], [0.21, 0.05, 0.096, 0.09], [0.27, 0.08, 0.092, 0.086], [0.32, 0.09, 0.082, 0.079], [0.36, 0.085, 0.056, 0.052], [0.385, 0.08, 0.026, 0.022], [0.47, 0.068, 0.002, 0.002]];
const NR = RINGS.length, NA = 10, BODY_V = NR * NA, WING_V = 30, TAIL_V = 20, LEG_V = 12, BIRD_V = BODY_V + 2 * WING_V + TAIL_V + 2 * LEG_V;
/** Wing stations root to tip: span fraction, chord, leading edge ahead of the span line (units of body length). */
const WING_S = [0, 0.25, 0.5, 0.78, 1], WING_C = [0.24, 0.3, 0.29, 0.2, 0.04], WING_LE = [0.05, 0.07, 0.06, 0.0, -0.1];
const WD = new Float32Array(18);
/** Factor on the plumage albedo (the birds are lit by the scene's sun and sky through their own normals). */
const BIRD_GAIN = 1.25;

/**
 * Plumage atlas: one 64 px row per kind. x 0..128 = body, tail root to beak tip (ring i at x = 4 + 12 i), back at the
 * top of the row and belly at the bottom (both flanks read the same texels); 128..192 upper wing (root left, leading
 * edge up); 192..248 underwing; 248..256 legs. Opaque.
 */
function birdAtlas() {
  const [c, g] = canvas(256, 256);
  const ell = (x: number, y: number, rx: number, ry: number, col: string) => { g.fillStyle = col; g.beginPath(); g.ellipse(x, y, rx, ry, 0, 0, TAU); g.fill(); };
  KINDS.forEach((k, i) => {
    const y = i * 64;
    g.save(); g.beginPath(); g.rect(0, y, 256, 64); g.clip();
    const gr = g.createLinearGradient(0, y, 0, y + 64);
    gr.addColorStop(0, k.back); gr.addColorStop(0.4, k.back); gr.addColorStop(0.6, k.belly); gr.addColorStop(1, k.belly);
    g.fillStyle = gr; g.fillRect(0, y, 128, 64);
    // Feather streaks on the back, darker toward the tail.
    g.strokeStyle = 'rgba(0,0,0,0.22)'; g.lineWidth = 1.5;
    for (let q = 0; q < 14; q++) { const x = 6 + q * 6; g.beginPath(); g.moveTo(x, y + 2 + (q % 3) * 4); g.lineTo(x - 7, y + 12 + (q % 3) * 4); g.stroke(); }
    g.fillStyle = 'rgba(0,0,0,0.25)'; g.fillRect(0, y, 22, 64);
    g.strokeStyle = 'rgba(255,255,255,0.1)';
    for (let q = 0; q < 12; q++) { const x = 9 + q * 7; g.beginPath(); g.moveTo(x, y + 6 + (q % 2) * 5); g.lineTo(x - 6, y + 15 + (q % 2) * 5); g.stroke(); }
    if (k.breast) ell(60, y + 50, 30, 20, k.breast);
    if (k.face) ell(90, y + 38, 20, 17, k.face);
    if (k.bib) { ell(70, y + 62, 34, 6, k.bib); ell(96, y + 56, 12, 10, k.bib); }
    if (k.cap) ell(90, y + 4, 22, 22, k.cap);
    if (k.cheek) ell(86, y + 33, 10, 7.5, k.cheek);
    g.fillStyle = k.beakC; g.fillRect(109, y, 19, 64);
    if (k.ring) ell(89, y + 24, 5, 5, k.ring);
    ell(89, y + 24, 3.2, 3.2, '#0a0908');
    // Upper wing: coverts along the leading edge, bar, dark flight feathers with pale edges.
    g.fillStyle = k.wing0; g.fillRect(128, y, 64, 64);
    g.fillStyle = k.cov; g.fillRect(128, y, 64, 22);
    if (k.bar) { g.fillStyle = k.bar; g.fillRect(128, y + 20, 50, 5); }
    g.strokeStyle = 'rgba(255,255,255,0.14)'; g.lineWidth = 1;
    for (let q = 0; q < 10; q++) { g.beginPath(); g.moveTo(131 + q * 6, y + 26); g.lineTo(134 + q * 6.4, y + 64); g.stroke(); }
    g.fillStyle = k.under; g.fillRect(192, y, 56, 64);
    g.strokeStyle = 'rgba(0,0,0,0.2)';
    for (let q = 0; q < 9; q++) { g.beginPath(); g.moveTo(195 + q * 6, y + 22); g.lineTo(198 + q * 6.2, y + 64); g.stroke(); }
    g.fillStyle = k.leg; g.fillRect(248, y, 8, 64);
    g.restore();
  });
  return c;
}

/** Body template of a kind in body space (x forward, y up, z right): positions, normals, head weight per vertex. */
function birdTemplate(k: typeof KINDS[number]) {
  const P = new Float32Array(BODY_V * 3), N = new Float32Array(BODY_V * 3), W = new Float32Array(BODY_V);
  const R = RINGS.map(([x, cy, ry, rz], i) => { const f = i >= 1 && i <= 4 ? k.fat : i >= 5 && i <= 8 ? k.head : 1; return [i === NR - 1 ? 0.385 + 0.085 * k.beak : x, cy, ry * f, rz * f]; });
  for (let i = 0; i < NR; i++) {
    const a = R[Math.max(0, i - 1)], b = R[Math.min(NR - 1, i + 1)], sl = ((b[2] + b[3]) - (a[2] + a[3])) / 2 / (b[0] - a[0]), [x, cy, ry, rz] = R[i];
    for (let j = 0; j < NA; j++) {
      const ph = (j / NA) * TAU, o = (i * NA + j) * 3, c = Math.cos(ph), s = Math.sin(ph), l = Math.hypot(sl, 1);
      P[o] = x; P[o + 1] = cy + ry * c; P[o + 2] = rz * s;
      N[o] = -sl / l; N[o + 1] = c / l; N[o + 2] = s / l;
      W[i * NA + j] = smooth(0.17, 0.27, x);
    }
  }
  return { P, N, W };
}

/** Geometry for `n` birds: position / normal rewritten per frame in world space, uv per kind, index fixed. */
function birdGeometry(n: number) {
  const idx: number[] = [];
  for (let b = 0; b < n; b++) {
    const o = b * BIRD_V;
    for (let i = 0; i < NR - 1; i++) for (let a = 0; a < NA; a++) { const p = o + i * NA + a, q = o + i * NA + ((a + 1) % NA), r = p + NA, s = q + NA; idx.push(p, q, r, q, s, r); }
    for (let side = 0; side < 2; side++) for (let face = 0; face < 2; face++) {
      const w = o + BODY_V + side * WING_V + face * 15, flip = side === face;
      for (let i = 0; i < 4; i++) for (let j = 0; j < 2; j++) { const A = w + i * 3 + j, B = A + 3, C = A + 1, D = B + 1; if (flip) idx.push(A, C, B, C, D, B); else idx.push(A, B, C, C, B, D); }
    }
    for (let face = 0; face < 2; face++) {
      const t = o + BODY_V + 2 * WING_V + face * 10;
      for (let k = 0; k < 4; k++) { const A = t + k, B = A + 5, C = A + 1, D = B + 1; if (face) idx.push(A, C, B, C, D, B); else idx.push(A, B, C, C, B, D); }
    }
    for (let leg = 0; leg < 2; leg++) {
      const l = o + BODY_V + 2 * WING_V + TAIL_V + leg * 6;
      for (let a = 0; a < 3; a++) { const a2 = (a + 1) % 3; idx.push(l + a, l + a2, l + 3 + a, l + a2, l + 3 + a2, l + 3 + a, l + a, l + 3 + a, l + a2, l + a2, l + 3 + a, l + 3 + a2); }
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(n * BIRD_V * 3), 3).setUsage(THREE.DynamicDrawUsage));
  g.setAttribute('normal', new THREE.BufferAttribute(new Float32Array(n * BIRD_V * 3), 3).setUsage(THREE.DynamicDrawUsage));
  g.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(n * BIRD_V * 2), 2));
  g.setIndex(new THREE.BufferAttribute(new Uint16Array(idx), 1));
  g.boundingSphere = new THREE.Sphere(new THREE.Vector3(0, 6, 0), 90);
  return g;
}

/** 4 x 2 cells of a soft glow, level 1/8 .. 8/8, white on transparent (the material colour tints it). */
function glowCanvas() {
  const [c, g] = canvas(256, 128);
  for (let i = 0; i < 8; i++) {
    const x = (i % 4) * 64 + 32, y = (i >> 2) * 64 + 32, l = (i + 1) / 8;
    const gr = g.createRadialGradient(x, y, 0, x, y, 29);
    gr.addColorStop(0, `rgba(255,255,255,${l})`);
    gr.addColorStop(0.2, `rgba(255,255,255,${0.95 * l})`);
    gr.addColorStop(0.42, `rgba(255,255,255,${0.3 * l})`);
    gr.addColorStop(0.7, `rgba(255,255,255,${0.07 * l})`);
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
/**
 * st: 0 away, 1 approach, 2 perched, 3 leaving (crouch on the twig until `launched`, then flight), 4 hop.
 * Flight: `B` = cubic curve (4 points), `s` its parameter, `v` speed in m/s; `bx/by/bz` = position on the curve
 * without the bound offset. Every bird has its own cruise speed, wing rate and bound lengths.
 */
interface Bird { st: number; t: number; dur: number; node: number; to: number; x: number; y: number; z: number; bx: number; by: number; bz: number; hx: number; hz: number; gx: number; gz: number; wait: number; next: number; pitch: number; bank: number; flapping: boolean; flap: number; fold: number; B: Float32Array; s: number; v: number; vc: number; rate: number; rateK: number; cyc: number; per: number; amp: number; air: number; launched: boolean; bob: number; flick: number; settle: number; hop: number; sat: number; kind: number; beat: number; look: number; lookT: number; fan: number; flare: number }

export class Critters {
  group = new THREE.Group();
  wings: THREE.InstancedMesh;
  /** The birds: one mesh, one identity instance, geometry posed per frame (`BIRD_V` vertices per bird). */
  bodies: THREE.InstancedMesh;
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
  private tpl = KINDS.map(birdTemplate);
  /** Bird basis of the vertex being written: forward, up, right, centre, size. */
  private bb = new Float32Array(13);
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
    this.bodies = inst(birdAtlas(), birdGeometry(BIRDS), 1);
    (this.bodies.instanceMatrix.array as Float32Array).set([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
    (this.bodies.instanceColor!.array as Float32Array).fill(BIRD_GAIN);
    for (let i = 0; i < nb; i++) this.bf.push({ x: 0, y: 0, z: 0, vx: 0, vy: 0, vz: 0, hx: 1, hz: 0, tx: 0, ty: 0, tz: 0, has: false, sit: false, timer: 0, flap: this.rnd() * 6, rate: 9 + 3 * this.rnd(), jx: 0, jy: 0, jz: 0, jt: 0, a: 0, col: i % 3, size: 0.85 + 0.3 * this.rnd() });
    for (let i = 0; i < BIRDS; i++) this.birds.push({ st: 0, t: 0, dur: 1, node: -1, to: -1, x: 0, y: 0, z: 0, bx: 0, by: 0, bz: 0, hx: 1, hz: 0, gx: 1, gz: 0, wait: 2 + 6 * this.rnd() + i * (3 + 8 * this.rnd()), next: 1, pitch: 0, bank: 0, flapping: false, flap: this.rnd() * 6, fold: 0, B: new Float32Array(12), s: 0, v: 0, vc: 10, rate: 14, rateK: 1, cyc: 0, per: 0.5, amp: 0.25, air: 0, launched: false, bob: 0.3, flick: 0, settle: 0, hop: 0.2, sat: 0, kind: i ? 2 : 0, beat: 0, look: 0, lookT: 0, fan: 0, flare: 0 });
    for (let i = 0; i < BIRDS; i++) this.birdUv(i, this.birds[i].kind);

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
      birds: this.birds.map((b) => ({ kind: b.kind, st: b.st, x: b.x, y: b.y, z: b.z, hx: b.hx, hz: b.hz, node: b.node, t: b.t, dur: b.dur, s: b.s, v: b.v, flapping: b.flapping })),
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
    this.birdFrame(dt, sim, env, pbird, winter);
    this.lastViolence = env.violence;
    const ms = performance.now() - t0;
    S.frames++; S.sumMs += ms; if (ms > S.maxMs) S.maxMs = ms;
  }

  /** Size boost with camera distance, so a creature still reads from the framing distance. */
  private boost(env: CritterEnv, x: number, y: number, z: number, k: number) {
    const d = Math.hypot(x - env.cam.x, y - env.cam.y, z - env.cam.z);
    return 1 + k * Math.max(0, Math.min(1, (d - 3) / 20));
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
      const d = Math.abs(Math.hypot(x - b.x, z - b.z) - 6);
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
        if (w && d < 0.1 && Math.abs(b.y - b.ty) < 0.12) { b.sit = true; b.timer = 2 + 4.5 * this.rnd(); }
      }
      // Two wings hinged on the body axis; the stroke lifts and drops the body a little.
      const s = 0.075 * b.size * b.a * this.boost(env, b.x, b.y, b.z, 3), c = Math.cos(th), sn = Math.sin(th);
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
      // Slow drifting path around a home spot, low over the grass, denser under and around the crown.
      const an = H[h + 2] * TAU, rad = 1.6 + 13 * H[h + 3] * H[h + 3], f = 0.6 + 0.8 * H[h + 4];
      const x = Math.cos(an) * rad + 1.3 * Math.sin(t * 0.19 * f + h) + 0.5 * Math.sin(t * 0.53 * f + 2.1 * h);
      const z = Math.sin(an) * rad + 1.3 * Math.sin(t * 0.17 * f + 1.7 * h) + 0.5 * Math.cos(t * 0.47 * f + h);
      const y = 0.5 + 1.5 * H[h + 5] * H[h + 5] + (H[h + 6] < 0.2 ? 1.6 * H[h + 6] * 5 : 0) + 0.22 * Math.sin(t * 0.37 * f + 3 * h) + 0.18 * b;
      const d = Math.hypot(x - env.cam.x, y - env.cam.y, z - env.cam.z);
      // Never past the lens: a fly within a few metres of the camera was a large glowing disc in the sky.
      b *= smooth(2, 5, d);
      if (b < 0.02) continue;
      lit++;
      // A pinpoint with a small soft glow: about 6 CSS px of quad from the framing distance, nearer ones a little larger.
      const sz = Math.max(0.035, d * 0.0029 * (1 + 0.7 * (1 - smooth(10, 38, d)))) * (0.75 + 0.25 * b);
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
    (mesh.material as THREE.MeshBasicMaterial).color.setRGB(0.85, 1.05, 0.14);
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
    const nn = near >= 0 ? sim.nodes[near] : null, social = this.rnd() < 0.35;
    for (let k = 0; k < 90; k++) {
      const id = (this.rnd() * N) | 0;
      if (!this.okPerch(sim, id, H)) continue;
      const nd = sim.nodes[id];
      let sc = nd.light * 1.2 + (nd.wy / H) * 0.8 + Math.min(nd.radius, 0.03) * 12 + this.rnd() * 0.3;
      if (nn) { const d = Math.hypot(nd.wx - nn.wx, nd.wy - nn.wy, nd.wz - nn.wz); if (d < 0.45) continue; if (social) sc = -Math.abs(d - 1.2) + nd.light * 0.3; }
      if (sc > bs) { bs = sc; best = id; }
    }
    return best;
  }

  /** Exit route from where the bird is, starting along its heading: a curve out to 60 m at azimuth `an`. */
  private exitPath(b: Bird, an: number, air: boolean) {
    const B = b.B, lead = air ? Math.max(6, b.v * 0.9) : 5.5, a2 = an + (this.rnd() - 0.5) * 1.1, ey = b.y + 5 + 7 * this.rnd();
    const y0 = air ? b.by : b.y;
    B[0] = b.x; B[1] = y0; B[2] = b.z;
    B[3] = b.x + b.hx * lead; B[4] = y0 + (air ? 1.2 : 2.1); B[5] = b.z + b.hz * lead;
    B[9] = b.x + Math.cos(a2) * 60; B[10] = ey; B[11] = b.z + Math.sin(a2) * 60;
    B[6] = B[9] - Math.cos(an) * 24; B[7] = ey - 1.5; B[8] = B[11] - Math.sin(an) * 24;
    b.s = 0; b.launched = true;
    if (!air) { b.v = 2.6; b.air = 0; }
  }

  /** Send a bird off: from a perch it turns, crouches and pushes off; in the air it curves away from where it is. */
  private leave(b: Bird, an: number, delay = 0) {
    const air = b.st === 1 || (b.st === 3 && b.launched);
    b.st = 3; b.t = -delay; b.gx = Math.cos(an); b.gz = Math.sin(an); b.launched = false;
    if (air) this.exitPath(b, an, true);
  }

  /**
   * One step along the bird's curve. The heading IS the direction of the step, so the body cannot point anywhere but
   * along its travel; pitch comes from the vertical speed (with the bounds), bank from the turn rate.
   */
  private fly(b: Bird, dt: number, landing: boolean) {
    const B = b.B, s0 = b.s, i0 = 1 - s0;
    const tx = 3 * i0 * i0 * (B[3] - B[0]) + 6 * i0 * s0 * (B[6] - B[3]) + 3 * s0 * s0 * (B[9] - B[6]);
    const ty = 3 * i0 * i0 * (B[4] - B[1]) + 6 * i0 * s0 * (B[7] - B[4]) + 3 * s0 * s0 * (B[10] - B[7]);
    const tz = 3 * i0 * i0 * (B[5] - B[2]) + 6 * i0 * s0 * (B[8] - B[5]) + 3 * s0 * s0 * (B[11] - B[8]);
    const tl = Math.hypot(tx, ty, tz) || 1e-3;
    const rem = landing ? Math.hypot(B[9] - b.bx, B[10] - b.by, B[11] - b.bz) : 99;
    // Cruise, slow down over the last metres to a perch; accelerate out of a take-off.
    const vt = Math.min(b.vc, 1.5 + rem * 1.7);
    b.v += (vt - b.v) * Math.min(1, dt * (landing ? 7 : 2.4));
    const s = b.s = Math.min(1, s0 + (b.v * dt) / tl), i = 1 - s;
    const k0 = i * i * i, k1 = 3 * i * i * s, k2 = 3 * i * s * s, k3 = s * s * s;
    const x = k0 * B[0] + k1 * B[3] + k2 * B[6] + k3 * B[9], y = k0 * B[1] + k1 * B[4] + k2 * B[7] + k3 * B[10], z = k0 * B[2] + k1 * B[5] + k2 * B[8] + k3 * B[11];
    b.bx = x; b.by = y; b.bz = z;
    b.air += dt;
    // Bounding flight: a burst of beats climbs, wings tucked on a short arc; each bound has its own length. It fades
    // out toward the perch (continuous beats, then the flare) and in after the first second of a take-off.
    const bound = landing ? smooth(3.5, 13, rem) : smooth(0.8, 1.9, b.air);
    b.cyc += dt / b.per;
    if (b.cyc >= 1) { b.cyc -= 1; b.per = 0.4 + 0.32 * this.rnd(); b.amp = 0.5 * b.per * (0.8 + 0.4 * this.rnd()); }
    const oy = -b.amp * bound * Math.cos(TAU * b.cyc) * (KINDS[b.kind].glide ? 0.4 : 1), flare = landing ? 1 - smooth(0.3, 2.4, rem) : 0;
    b.flare = flare;
    const ny = y + oy, vy = (ny - b.y) / Math.max(dt, 1e-3);
    const dx = x - b.x, dz = z - b.z, dl = Math.hypot(dx, dz);
    if (dl > 1e-6) {
      const nx = dx / dl, nz = dz / dl, turn = (b.hx * nz - b.hz * nx) / Math.max(dt, 1e-3);
      b.hx = nx; b.hz = nz;
      const bt = Math.max(-0.95, Math.min(0.95, (turn * b.v) / 9.8 * 0.85));
      b.bank += (bt - b.bank) * Math.min(1, dt * 6);
    }
    b.x = x; b.y = ny; b.z = z;
    b.flapping = bound < 0.5 || b.cyc < 0.5 || b.cyc > 0.93;
    const pt = Math.atan2(vy, Math.max(b.v, 2.5)) * 0.85 + 0.8 * flare + (landing ? 0 : 0.35 * (1 - smooth(0, 0.9, b.air)));
    b.pitch += (pt - b.pitch) * Math.min(1, dt * 14);
    b.rateK = 1 - 0.18 * flare;
    return landing ? rem : 99;
  }

  private birdFrame(dt: number, sim: TreeSim, env: CritterEnv, p: number, winter: boolean) {
    const S = this.stats, want = Math.round(BIRDS * Math.min(1, p)), P = this.P, CROUCH = 0.24;
    // Storm front arriving, or a limb coming off under a bird: everybody goes, each after its own reaction time.
    let flush = this.flushNow || (env.violence > 0.4 && this.lastViolence <= 0.4) || env.rain > 0.05;
    this.flushNow = false;
    for (const b of this.birds) if ((b.st === 2 || b.st === 4) && !this.perch(sim, env.D, b.node, P)) flush = true;
    if (flush) {
      const an = Math.atan2(env.wind.dirZ, env.wind.dirX);
      let any = false;
      for (const b of this.birds) if (b.st === 1 || b.st === 2 || b.st === 4) { this.leave(b, an + (this.rnd() - 0.5) * 1.5, this.rnd() * 0.22); any = true; }
      if (any) S.flushes++;
    }
    let out = 0, perched = 0;
    const geo = this.bodies.geometry, VP = geo.attributes.position.array as Float32Array, VN = geo.attributes.normal.array as Float32Array;
    for (let i = 0; i < BIRDS; i++) {
      const b = this.birds[i], w = i < want;
      if (env.jumped && !w) b.st = 0;
      let vis = 1, crouch = 0;
      if (b.st === 0) {
        VP.fill(0, i * BIRD_V * 3, (i + 1) * BIRD_V * 3);
        b.wait -= dt;
        if (!w || b.wait > 0) continue;
        // Its own visit: own perch (now and then near the other bird), own route in, own final approach.
        const other = this.birds[1 - i], near = other && (other.st === 1 || other.st === 2) ? other.node : -1;
        b.node = this.pickPerch(sim, near);
        if (b.node < 0) { b.wait = 4; continue; }
        this.perch(sim, env.D, b.node, P);
        const an = this.rnd() * TAU, B = b.B, sx = Math.cos(an) * 55, sz = Math.sin(an) * 55, sy = P[1] + 3 + 7 * this.rnd();
        const dx = P[0] - sx, dz = P[2] - sz, dl = Math.hypot(dx, dz) || 1, side = (this.rnd() - 0.5) * 30;
        const fa = Math.atan2(dz, dx) + (this.rnd() - 0.5) * 1.7;
        B[0] = sx; B[1] = sy; B[2] = sz;
        B[3] = sx + (dx / dl) * 22 - (dz / dl) * side; B[4] = sy - 1; B[5] = sz + (dz / dl) * 22 + (dx / dl) * side;
        B[6] = P[0] - Math.cos(fa) * 7; B[7] = P[1] - 0.25 + 0.9 * this.rnd(); B[8] = P[2] - Math.sin(fa) * 7;
        B[9] = P[0]; B[10] = P[1]; B[11] = P[2];
        // Its kind for this visit (never the kind of the bird that is out already).
        b.kind = (this.rnd() * KINDS.length) | 0;
        if (other && other.st !== 0 && other.kind === b.kind) b.kind = (b.kind + 1) % KINDS.length;
        this.birdUv(i, b.kind);
        const big = KINDS[b.kind].glide;
        b.st = 1; b.t = 0; b.s = 0; b.air = 2; b.vc = 8.5 + 3 * this.rnd(); b.v = b.vc; b.rate = big ? 8 + 2 * this.rnd() : 12.5 + 3 * this.rnd();
        b.cyc = this.rnd(); b.per = 0.4 + 0.32 * this.rnd(); b.amp = 0.5 * b.per; b.fold = 1; b.bank = 0; b.pitch = 0;
        b.x = b.bx = sx; b.y = b.by = sy; b.z = b.bz = sz; b.hx = dx / dl; b.hz = dz / dl;
      }
      out++;
      b.t += dt;
      b.rateK = 1;
      if (b.st === 1) {
        if (!this.perch(sim, env.D, b.node, P)) { this.leave(b, this.rnd() * TAU); }
        else {
          // The perch sways: the end of the curve rides with it.
          const B = b.B, ex = P[0] - B[9], ey = P[1] - B[10], ez = P[2] - B[11];
          B[6] += ex; B[7] += ey; B[8] += ez; B[9] = P[0]; B[10] = P[1]; B[11] = P[2];
          const rem = this.fly(b, dt, true);
          vis = smooth(0, 0.07, b.s);
          if (b.s >= 1 || rem < 0.04) {
            b.st = 2; b.t = 0; b.dur = (winter ? 6 : 8) + 18 * this.rnd(); b.next = 0.4 + 1.5 * this.rnd(); b.gx = b.hx; b.gz = b.hz; b.bob = 0.3; b.flick = 0; b.settle = 0.35;
            if (!w) b.dur = 0;
          }
        }
      }
      if (b.st === 2) {
        perched++;
        this.perch(sim, env.D, b.node, P); b.x = P[0]; b.y = P[1]; b.z = P[2];
        // A short flutter with spread wings right after touch-down, then folded.
        b.settle -= dt; b.flapping = b.settle > 0;
        b.bank += -b.bank * Math.min(1, dt * 12);
        // Turns in quick jerks; in between small looks, a bob, a tail flick, a hop: irregular, never a loop.
        const hk = Math.min(1, dt * 20); b.hx += (b.gx - b.hx) * hk; b.hz += (b.gz - b.hz) * hk; const hl = Math.hypot(b.hx, b.hz) || 1; b.hx /= hl; b.hz /= hl;
        b.flick = Math.max(0, b.flick - dt);
        const pt = b.bob + 0.3 * Math.sin(Math.PI * Math.min(1, b.flick / 0.16)) + 0.5 * Math.max(0, b.settle);
        b.pitch += (pt - b.pitch) * Math.min(1, dt * 22);
        b.next -= dt;
        if (b.next <= 0) {
          const r = this.rnd();
          b.next = r < 0.3 ? 0.25 + 0.5 * this.rnd() : 0.7 + 3.2 * this.rnd() * this.rnd();
          const act = this.rnd(), ch = sim.chains[sim.nodes[b.node].chain], at = ch.nodes.indexOf(b.node), to = ch.nodes[at + (this.rnd() < 0.5 ? -1 : 1) * (1 + ((this.rnd() * 2) | 0))];
          if (act < 0.2 && to !== undefined && this.okPerch(sim, to, 0)) {
            // Hop: turn to face along the twig first, then jump.
            const a0 = P[0], a2 = P[2];
            this.perch(sim, env.D, to, P);
            const an = Math.atan2(P[2] - a2, P[0] - a0) + (this.rnd() - 0.5) * 0.3;
            b.gx = Math.cos(an); b.gz = Math.sin(an);
            b.st = 4; b.to = to; b.sat = b.t; b.t = 0; b.hop = 0.17 + 0.08 * this.rnd();
          } else if (act < 0.45) { b.flick = 0.16; b.lookT = (this.rnd() - 0.5) * 1.2; }
          else if (act < 0.7) { b.lookT = (this.rnd() - 0.5) * 2; b.bob = 0.12 + 0.38 * this.rnd(); const an = Math.atan2(b.gz, b.gx) + (this.rnd() - 0.5) * 0.7; b.gx = Math.cos(an); b.gz = Math.sin(an); }
          else { const an = Math.atan2(b.gz, b.gx) + (this.rnd() < 0.5 ? -1 : 1) * (0.6 + 1.8 * this.rnd()); b.gx = Math.cos(an); b.gz = Math.sin(an); }
        }
        // Leaves on its own clock, outward from the crown.
        if (b.st === 2 && (b.t > b.dur || !w)) this.leave(b, Math.atan2(b.z, b.x) + (this.rnd() - 0.5) * 2.6);
      } else if (b.st === 4) {
        perched++;
        const TURN = 0.13, k = Math.max(0, Math.min(1, (b.t - TURN) / b.hop));
        this.perch(sim, env.D, b.node, P);
        const ax = P[0], ay = P[1], az = P[2];
        this.perch(sim, env.D, b.to, P);
        const hk = Math.min(1, dt * 30); b.hx += (b.gx - b.hx) * hk; b.hz += (b.gz - b.hz) * hk; const hl = Math.hypot(b.hx, b.hz) || 1; b.hx /= hl; b.hz /= hl;
        b.x = ax + (P[0] - ax) * k; b.y = ay + (P[1] - ay) * k + 0.08 * Math.sin(Math.PI * k); b.z = az + (P[2] - az) * k;
        b.flapping = k > 0 && k < 1; b.pitch += (0.3 + 0.25 * Math.sin(Math.PI * k) - b.pitch) * Math.min(1, dt * 22);
        if (k >= 1) { b.st = 2; b.node = b.to; b.t = b.sat; b.settle = 0; }
      } else if (b.st === 3) {
        if (!b.launched) {
          // Still on the twig: turn to the way out, crouch, then push off.
          if (this.perch(sim, env.D, b.node, P)) { b.x = P[0]; b.y = P[1]; b.z = P[2]; }
          const hk = Math.min(1, dt * 26); b.hx += (b.gx - b.hx) * hk; b.hz += (b.gz - b.hz) * hk; const hl = Math.hypot(b.hx, b.hz) || 1; b.hx /= hl; b.hz /= hl;
          const c = Math.max(0, b.t / CROUCH);
          crouch = Math.sin(Math.PI * Math.min(1, c));
          b.pitch += (0.3 - 0.28 * crouch + (c > 0.7 ? 0.5 : 0) - b.pitch) * Math.min(1, dt * 20);
          b.flapping = c > 0.75;
          if (c >= 1) { b.hx = b.gx; b.hz = b.gz; b.bx = b.x; b.by = b.y; b.bz = b.z; this.exitPath(b, Math.atan2(b.gz, b.gx), false); }
        } else {
          this.fly(b, dt, false);
          vis = 1 - smooth(0.86, 1, b.s);
          if (b.s >= 1) { b.st = 0; b.wait = (winter ? 18 : 5) + 16 * this.rnd(); VP.fill(0, i * BIRD_V * 3, (i + 1) * BIRD_V * 3); out--; continue; }
        }
      }
      b.flap += dt * TAU * b.rate * b.rateK;
      const K = KINDS[b.kind], T = this.tpl[b.kind], flying = b.st === 1 || (b.st === 3 && b.launched), glide = K.glide && flying && !b.flapping;
      // Wings spread and fold over a few frames; the larger kind holds them out between bursts, the small ones tuck.
      b.fold += ((b.flapping || glide ? 1 : 0) - b.fold) * Math.min(1, dt * (b.flapping ? 34 : 24));
      b.beat += ((b.flapping ? 1 : 0) - b.beat) * Math.min(1, dt * 20);
      b.look += ((flying ? 0 : b.lookT) - b.look) * Math.min(1, dt * 18);
      const flick = Math.sin(Math.PI * Math.min(1, b.flick / 0.16));
      const fanT = flying ? Math.max(b.flare, glide ? 0.3 : 0.1, b.st === 3 ? 0.7 * (1 - smooth(0.1, 0.6, b.air)) : 0) : 0.5 * flick + (b.flapping ? 0.6 : 0);
      b.fan += (fanT - b.fan) * Math.min(1, dt * 12);
      // Body frame: forward (pitched), up and right (rolled into the turn); the feet are at the bird's position.
      const L = K.L * this.boost(env, b.x, b.y, b.z, 2.6) * vis, cp = Math.cos(b.pitch), sn = Math.sin(b.pitch), cb = Math.cos(b.bank), sb = Math.sin(b.bank);
      const fx = b.hx, fz = b.hz, o = i * BIRD_V * 3, bb = this.bb;
      const Xx = fx * cp, Xy = sn, Xz = fz * cp, ux = -fx * sn, uy = cp, uz = -fz * sn;
      const Yx = ux * cb - fz * sb, Yy = uy * cb, Yz = uz * cb + fx * sb, Rx = -fz * cb - ux * sb, Ry = -uy * sb, Rz = fx * cb - uz * sb;
      const lift = L * (0.215 - 0.07 * crouch);
      const cx = b.x + Yx * lift, cy = b.y + Yy * lift, cz = b.z + Yz * lift;
      bb[0] = Xx; bb[1] = Xy; bb[2] = Xz; bb[3] = Yx; bb[4] = Yy; bb[5] = Yz; bb[6] = Rx; bb[7] = Ry; bb[8] = Rz; bb[9] = cx; bb[10] = cy; bb[11] = cz; bb[12] = L;
      // Body, head (turned by `look` about the neck) and beak: the kind's lofted template.
      for (let k = 0; k < BODY_V; k++) {
        let lx = T.P[k * 3], lz = T.P[k * 3 + 2], nx = T.N[k * 3], nz = T.N[k * 3 + 2];
        const w = T.W[k];
        if (w > 0 && b.look !== 0) { const a = b.look * w, ca = Math.cos(a), sa = Math.sin(a), dx = lx - 0.2, n0 = nx; lx = 0.2 + dx * ca - lz * sa; lz = dx * sa + lz * ca; nx = n0 * ca - nz * sa; nz = n0 * sa + nz * ca; }
        this.put(VP, VN, o + k * 3, lx, T.P[k * 3 + 1], lz, nx, T.N[k * 3 + 1], nz);
      }
      // Wings: shoulder, inner part, wrist, outer part. Spread: stroke between 62 degrees up and 46 down, the outer
      // part flexed down and swept back on the upstroke. Folded: a blade along the flank, upper side out.
      const th = 0.12 + (0.03 + 0.95 * Math.sin(b.flap)) * b.beat, flex = Math.max(0, Math.cos(b.flap)) * 0.9 * b.beat, f = b.fold, so = th - flex;
      const WL = K.wing * 0.62 * (0.62 + 0.38 * f), cs = (0.5 + 0.5 * f) * K.wing, D = WD;
      for (let side = 0; side < 2; side++) {
        const q = side ? -1 : 1, wo = o + (BODY_V + side * WING_V) * 3;
        const sx = 0.1, sy = -0.04 + 0.11 * f, sz = q * K.fat * (0.128 - 0.04 * f);
        D[0] = lerp(-0.97, -0.05, f); D[1] = lerp(-0.1, Math.sin(th), f); D[2] = q * lerp(-0.12, Math.cos(th), f);
        D[3] = lerp(-0.95, -0.25 - 0.6 * flex, f); D[4] = lerp(0.05, Math.sin(so), f); D[5] = q * lerp(-0.3, Math.cos(so), f);
        const ccx = lerp(-0.2, -1, f), ccy = 1 - f;
        for (let g = 0; g < 2; g++) {
          const d = g * 3, c = 6 + g * 3, n = 12 + g * 3;
          let l = Math.hypot(D[d], D[d + 1], D[d + 2]) || 1; D[d] /= l; D[d + 1] /= l; D[d + 2] /= l;
          const dot = ccx * D[d] + ccy * D[d + 1];
          D[c] = ccx - dot * D[d]; D[c + 1] = ccy - dot * D[d + 1]; D[c + 2] = -dot * D[d + 2];
          l = Math.hypot(D[c], D[c + 1], D[c + 2]) || 1; D[c] /= l; D[c + 1] /= l; D[c + 2] /= l;
          D[n] = q * (D[c + 1] * D[d + 2] - D[c + 2] * D[d + 1]); D[n + 1] = q * (D[c + 2] * D[d] - D[c] * D[d + 2]); D[n + 2] = q * (D[c] * D[d + 1] - D[c + 1] * D[d]);
        }
        for (let st = 0; st < 5; st++) {
          const a = Math.min(0.5, WING_S[st]) * WL, e = Math.max(0, WING_S[st] - 0.5) * WL, m = st < 2 ? 0 : st > 2 ? 1 : 0.5;
          const px = sx + D[0] * a + D[3] * e, py = sy + D[1] * a + D[4] * e, pz = sz + D[2] * a + D[5] * e;
          const kx = lerp(D[6], D[9], m), ky = lerp(D[7], D[10], m), kz = lerp(D[8], D[11], m), nx = lerp(D[12], D[15], m), ny = lerp(D[13], D[16], m), nz = lerp(D[14], D[17], m);
          for (let j = 0; j < 3; j++) {
            const h = cs * (WING_C[st] * j * 0.5 - WING_LE[st]), v = wo + (st * 3 + j) * 3;
            this.put(VP, VN, v, px + kx * h, py + ky * h, pz + kz * h, nx, ny, nz);
            this.put(VP, VN, v + 45, px + kx * h, py + ky * h, pz + kz * h, -nx, -ny, -nz);
          }
        }
      }
      // Tail: a flat fan from the rump, spread while braking and at take-off, dipped on the perch, flicked up.
      const ta = flying ? 0.05 - 0.5 * b.flare : -0.3 + 0.8 * flick, tc = Math.cos(ta), ts = Math.sin(ta), tl = 0.36 * K.tail, to = o + (BODY_V + 2 * WING_V) * 3;
      for (let r = 0; r < 2; r++) for (let k = 0; k < 5; k++) {
        const u = (k - 2) / 2, len = r ? tl * (1 - 0.12 * u * u) : 0, lz = u * (r ? 0.045 + 0.15 * b.fan : 0.035), v = to + (r * 5 + k) * 3;
        this.put(VP, VN, v, -0.2 - tc * len, 0.01 + ts * len, lz, ts, tc, 0);
        this.put(VP, VN, v + 30, -0.2 - tc * len, 0.01 + ts * len, lz, -ts, -tc, 0);
      }
      // Legs: hip to the twig while perched, stretched forward in the flare, otherwise tucked away (collapsed).
      const lo = o + (BODY_V + 2 * WING_V + TAIL_V) * 3, reach = flying ? smooth(0.3, 0.8, b.flare) * 0.17 * L : 0, rad = 0.014 * L;
      for (let leg = 0; leg < 2; leg++) {
        const q = leg ? -1 : 1, hy = -0.1 * K.fat * L, hz = q * 0.045 * L, hxl = -0.02 * L;
        const ax = cx + Xx * hxl + Yx * hy + Rx * hz, ay = cy + Xy * hxl + Yy * hy + Ry * hz, az = cz + Xz * hxl + Yz * hy + Rz * hz;
        let tx = ax + (Xx * 0.5 - Yx * 0.85) * reach, ty = ay + (Xy * 0.5 - Yy * 0.85) * reach, tz = az + (Xz * 0.5 - Yz * 0.85) * reach;
        if (!flying) { tx = b.x + Rx * hz; ty = b.y + Ry * hz; tz = b.z + Rz * hz; }
        const show = !flying || reach > 0 ? 1 : 0;
        for (let e = 0; e < 2; e++) for (let a = 0; a < 3; a++) {
          const an = (a / 3) * TAU, c = Math.cos(an), s = Math.sin(an), v = lo + (leg * 6 + e * 3 + a) * 3, nx = Xx * c + Rx * s, ny = Xy * c + Ry * s, nz = Xz * c + Rz * s;
          VP[v] = (e ? tx : ax) + nx * rad * show; VP[v + 1] = (e ? ty : ay) + ny * rad * show; VP[v + 2] = (e ? tz : az) + nz * rad * show;
          VN[v] = nx; VN[v + 1] = ny; VN[v + 2] = nz;
        }
      }
    }
    S.birds = out; S.perched = perched;
    if (out || this.bodies.visible) {
      this.bodies.visible = out > 0;
      geo.attributes.position.needsUpdate = geo.attributes.normal.needsUpdate = true;
    }
  }

  /** One vertex of the bird being drawn: body space (x forward, y up, z right, units of body length) to world. */
  private put(P: Float32Array, N: Float32Array, o: number, lx: number, ly: number, lz: number, nx: number, ny: number, nz: number) {
    const b = this.bb, L = b[12];
    P[o] = b[9] + (b[0] * lx + b[3] * ly + b[6] * lz) * L; P[o + 1] = b[10] + (b[1] * lx + b[4] * ly + b[7] * lz) * L; P[o + 2] = b[11] + (b[2] * lx + b[5] * ly + b[8] * lz) * L;
    N[o] = b[0] * nx + b[3] * ny + b[6] * nz; N[o + 1] = b[1] * nx + b[4] * ny + b[7] * nz; N[o + 2] = b[2] * nx + b[5] * ny + b[8] * nz;
  }

  /** Texture coordinates of bird `i` for a kind (its row of the plumage atlas). */
  private birdUv(i: number, kind: number) {
    const at = this.bodies.geometry.attributes.uv, U = at.array as Float32Array, o = i * BIRD_V * 2, v0 = 1 - (kind + 1) / 4, vh = 0.25;
    for (let r = 0; r < NR; r++) for (let a = 0; a < NA; a++) { const k = o + (r * NA + a) * 2; U[k] = (4 + r * 12) / 256; U[k + 1] = v0 + vh * (0.06 + 0.88 * (Math.cos((a / NA) * TAU) + 1) / 2); }
    for (let side = 0; side < 2; side++) for (let face = 0; face < 2; face++) for (let st = 0; st < 5; st++) for (let j = 0; j < 3; j++) {
      const k = o + (BODY_V + side * WING_V + face * 15 + st * 3 + j) * 2;
      U[k] = ((face ? 195 : 131) + WING_S[st] * (face ? 50 : 58)) / 256; U[k + 1] = v0 + vh * (0.94 - 0.88 * j * 0.5);
    }
    for (let face = 0; face < 2; face++) for (let r = 0; r < 2; r++) for (let q = 0; q < 5; q++) { const k = o + (BODY_V + 2 * WING_V + face * 10 + r * 5 + q) * 2; U[k] = (138 + q * 9) / 256; U[k + 1] = v0 + vh * (0.5 - 0.4 * r); }
    for (let q = 0; q < LEG_V; q++) { const k = o + (BODY_V + 2 * WING_V + TAIL_V + q) * 2; U[k] = 252 / 256; U[k + 1] = v0 + vh * 0.5; }
    at.needsUpdate = true;
  }
}

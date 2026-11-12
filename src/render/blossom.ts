import * as THREE from 'three';
import type { TreeSim } from '../sim/tree';
import { season } from '../season';
import type { Wind } from '../wind';
import { cleanLeafTexture, type Leaves } from './leaves';
import type { LeafFall } from './leaffall';

/**
 * Spring blossom: flower clusters on the outer, lit twigs of last year's wood, a course through the spring (bud,
 * opening from the top and the sunny side, peak, petal fall) and petals handed to the one falling-leaf system.
 *
 * PowerVR rule: one `InstancedMesh` in `group`; material = clone of the LIVE leaf material with only `map` swapped
 * (safe path; on the full leaf path the same Lambert configuration the meadow builds), map = canvas painting through
 * `cleanLeafTexture`, geometry = doubled card with position / normal / uv, instance matrices and colours only,
 * no shadows. A form change repaints the mip levels of the same texture object in place.
 *
 * Seasons rule: every cluster's size and colour is a pure function of `season.phase` and its own dates (hash of the
 * node id and its light / height); nothing accumulates, a scrub gives the same picture as waiting. Only the petals
 * in the air and on the ground are particles (they live in `LeafFall`, inside its caps).
 */

/** Year phases: first clusters open at OPEN0, the last OPEN_SPREAD later; a bud shows BUD before, opens over OPENING. */
const OPEN0 = 0.008, OPEN_SPREAD = 0.036, BUD = 0.016, OPENING = 0.018;
/** A cluster stays open HOLD0..HOLD0+HOLD_SPREAD, then sheds over SHED. */
const HOLD0 = 0.05, HOLD_SPREAD = 0.03, SHED = 0.022;
/** Nothing is drawn after this phase (all clusters shed) or before bud. */
export const BLOSSOM_END = OPEN0 + OPEN_SPREAD + HOLD0 + HOLD_SPREAD + SHED + 0.002;
/** Date of the fullest bloom (for scripts and docs). */
export const BLOSSOM_PEAK = 0.056;
/** A fixed "south": clusters on this side of the crown open first. */
const SOUTH_X = 0.5, SOUTH_Z = 0.866;
const CAP_LOW = 3000, CAP_HIGH = 7000;
/** Record per cluster: anchor xyz, X col, Y col, N col (each x size), tOpen, tFall, shade, anchor share along Y. */
const R = 16;
const MAX_EMIT = 6;

type Kind = 'flower' | 'catkin' | 'star';
interface BlossomForm {
  kind: Kind;
  /** Petal colour, colour toward the petal rim / detail, centre (CSS). */
  petal: string; edge: string; centre: string;
  /** Instance tint of a closed bud (open = white: the map colours as painted). */
  bud: [number, number, number];
  /** Share of eligible twigs that flower (x the control), card size in metres. */
  amount: number; size: number;
  /** Falling petal colour (CSS); null = sheds nothing visible. */
  fall: string | null;
}

/** Per leaf form. The oak gets a showy apple-like blossom on purpose (a real oak has catkins nobody would notice). */
const FORMS: Record<string, BlossomForm | null> = {
  oak: { kind: 'flower', petal: '#fbe3ea', edge: '#ee8fb2', centre: '#e0b040', bud: [1.0, 0.5, 0.62], amount: 0.7, size: 0.36, fall: '#fbe4ea' },
  round: { kind: 'flower', petal: '#ffffff', edge: '#f1ead8', centre: '#d9c050', bud: [0.92, 0.95, 0.8], amount: 0.9, size: 0.38, fall: '#f6f2e6' },
  maple: { kind: 'flower', petal: '#d9e36a', edge: '#b4c63e', centre: '#8c9a2c', bud: [0.95, 0.72, 0.5], amount: 0.8, size: 0.3, fall: '#cfdc6a' },
  willow: { kind: 'catkin', petal: '#dfe26a', edge: '#b9c048', centre: '#f1ec9a', bud: [0.85, 0.9, 0.8], amount: 0.8, size: 0.42, fall: '#d6da70' },
  birch: { kind: 'catkin', petal: '#d8c877', edge: '#a8904a', centre: '#efe3a4', bud: [0.8, 0.7, 0.55], amount: 0.6, size: 0.36, fall: '#cdbd72' },
  ginkgo: { kind: 'catkin', petal: '#cfdc8a', edge: '#a3b860', centre: '#e9f0b8', bud: [0.85, 0.9, 0.7], amount: 0.35, size: 0.26, fall: null },
  // Conifer: none.
  spray: null,
  // Alien forms: turquoise stars on the frond, pale gold on the crimson ring, cold blue-white lights on the spiral.
  frond: { kind: 'star', petal: '#8ff5e6', edge: '#2fb7c9', centre: '#f4fffb', bud: [0.5, 0.7, 1.0], amount: 0.8, size: 0.4, fall: '#9af0e4' },
  ring: { kind: 'star', petal: '#ffe9a6', edge: '#f0a858', centre: '#fffdf0', bud: [1.0, 0.6, 0.4], amount: 0.8, size: 0.38, fall: '#ffe6a8' },
  spiral: { kind: 'star', petal: '#cfe4ff', edge: '#7fa6ff', centre: '#ffffff', bud: [0.6, 0.6, 1.0], amount: 0.6, size: 0.36, fall: '#d6e6ff' },
};
export const blossomForm = (id: string): BlossomForm | null => (id in FORMS ? FORMS[id] : FORMS.oak);

const sm = (a: number, b: number, x: number) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a || 1e-6))); return t * t * (3 - 2 * t); };
function h01(a: number) { a = Math.imul(a ^ 0x9e3779b9, 0x85ebca6b); a ^= a >>> 13; a = Math.imul(a, 0xc2b2ae35); a ^= a >>> 16; return (a >>> 0) / 4294967296; }

/** Size factor of a cluster at year phase `ph`: 0 outside its course, a small bud, opening, full, shedding. */
export function blossomScale(ph: number, tOpen: number, tFall: number): number {
  if (ph <= tOpen - BUD || ph >= tFall + SHED) return 0;
  if (ph < tOpen) return 0.16 + 0.16 * (ph - (tOpen - BUD)) / BUD;
  if (ph < tFall) return 0.32 + 0.68 * sm(tOpen, tOpen + OPENING, ph);
  return 1 - 0.75 * sm(tFall, tFall + SHED, ph);
}

/** Paints the cluster map of a form (square canvas, alpha cut-out, real colours). */
export function blossomCanvas(f: BlossomForm, S = 256): HTMLCanvasElement {
  const cv = document.createElement('canvas');
  cv.width = cv.height = S;
  const g = cv.getContext('2d')!;
  let seed = 12345;
  const rnd = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
  if (f.kind === 'flower') {
    // Seven five-petalled flowers, overlapping, the later ones on top.
    const at: [number, number, number][] = [];
    for (let t = 0; t < 400 && at.length < 13; t++) {
      const x = 0.13 + 0.74 * rnd(), y = 0.13 + 0.74 * rnd(), r = 0.105 + 0.035 * rnd();
      if (Math.hypot(x - 0.5, y - 0.5) < 0.44 && at.every((p) => Math.hypot(p[0] - x, p[1] - y) > (p[2] + r) * 0.8)) at.push([x, y, r]);
    }
    for (const [x, y, r] of at) {
      const cx = x * S, cy = y * S, rr = r * S, a0 = rnd() * 6.283;
      for (let k = 0; k < 5; k++) {
        const a = a0 + (k * 6.283) / 5;
        g.save();
        g.translate(cx + Math.cos(a) * rr * 0.52, cy + Math.sin(a) * rr * 0.52);
        g.rotate(a);
        const gr = g.createRadialGradient(-rr * 0.35, 0, 0, 0, 0, rr * 0.62);
        gr.addColorStop(0, f.edge); gr.addColorStop(0.5, f.petal); gr.addColorStop(0.85, f.petal); gr.addColorStop(1, f.edge);
        g.fillStyle = gr;
        g.beginPath(); g.ellipse(0, 0, rr * 0.56, rr * 0.42, 0, 0, 6.283); g.fill();
                g.restore();
      }
      g.fillStyle = f.centre;
      g.beginPath(); g.arc(cx, cy, rr * 0.2, 0, 6.283); g.fill();
    }
  } else if (f.kind === 'catkin') {
    // Tassels hanging from the top edge (the card hangs below its twig).
    for (let k = 0; k < 6; k++) {
      const x0 = (0.12 + 0.152 * k + 0.03 * (rnd() - 0.5)) * S, len = (0.62 + 0.36 * rnd()) * S, w = (0.05 + 0.02 * rnd()) * S, ph = rnd() * 6.283;
      const n = Math.ceil(len / (w * 0.9));
      for (let j = 0; j < n; j++) {
        const t = j / n, y = t * len, x = x0 + Math.sin(ph + t * 3.2) * 0.03 * S * t;
        g.fillStyle = j % 3 === 0 ? f.edge : j % 3 === 1 ? f.petal : f.centre;
        g.beginPath(); g.ellipse(x, y + w, w * (1.05 - 0.35 * t), w * 0.95, 0, 0, 6.283); g.fill();
      }
    }
  } else {
    // Alien: six-rayed stars with a bright core.
    const at: [number, number, number][] = [[0.3, 0.3, 0.27], [0.72, 0.3, 0.22], [0.5, 0.62, 0.3], [0.2, 0.75, 0.17], [0.82, 0.76, 0.18]];
    for (const [x, y, r] of at) {
      const cx = x * S, cy = y * S, rr = r * S, a0 = rnd() * 6.283;
      g.lineCap = 'round';
      for (let k = 0; k < 6; k++) {
        const a = a0 + (k * 6.283) / 6;
        g.strokeStyle = f.edge; g.lineWidth = rr * 0.3;
        g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx + Math.cos(a) * rr * 0.85, cy + Math.sin(a) * rr * 0.85); g.stroke();
        g.strokeStyle = f.petal; g.lineWidth = rr * 0.17;
        g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx + Math.cos(a) * rr * 0.8, cy + Math.sin(a) * rr * 0.8); g.stroke();
      }
      g.fillStyle = f.centre;
      g.beginPath(); g.arc(cx, cy, rr * 0.26, 0, 6.283); g.fill();
    }
  }
  return cv;
}

/** Doubled flat card (x -0.5..0.5, y 0..1; reversed-winding back copy with flipped normals), position / normal / uv. */
function cardGeometry(): THREE.BufferGeometry {
  const q = [-0.5, 0, 0.5, 0, 0.5, 1, -0.5, 0, 0.5, 1, -0.5, 1];
  const P = new Float32Array(36), N = new Float32Array(36), U = new Float32Array(24);
  for (let v = 0; v < 12; v++) {
    const back = v >= 6, s = back ? [0, 2, 1, 3, 5, 4][v - 6] : v;
    P[v * 3] = q[s * 2]; P[v * 3 + 1] = q[s * 2 + 1]; P[v * 3 + 2] = 0;
    N[v * 3 + 2] = back ? -1 : 1;
    U[v * 2] = q[s * 2] + 0.5; U[v * 2 + 1] = q[s * 2 + 1];
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(P, 3));
  g.setAttribute('normal', new THREE.BufferAttribute(N, 3));
  g.setAttribute('uv', new THREE.BufferAttribute(U, 2));
  g.boundingSphere = new THREE.Sphere(new THREE.Vector3(0, 6, 0), 60);
  return g;
}

export interface BlossomEnv {
  /** `params.season.blossom`: 0 = none, 1 = normal. */
  amount: number;
  low: boolean;
  /** `Atmosphere.night` 0..1. */
  night: number;
  /** `sway.D` (offset per node id). */
  D: Float32Array;
  /** Falling system for the petals (null = no petals). */
  fall: LeafFall | null;
  wind: Wind;
  violence: number;
  formId: string;
  /** Scene lights and camera (the colours compensate the Lambert term, like the safe leaf bake). */
  sun: THREE.DirectionalLight;
  hemi: THREE.HemisphereLight;
  cam: THREE.Vector3;
}

const pm = new Float32Array(MAX_EMIT * 16), pc = new Float32Array(MAX_EMIT * 3);

export class Blossom {
  group = new THREE.Group();
  mesh: THREE.InstancedMesh;
  private tex: THREE.Texture;
  private cap: number;
  private rec: Float32Array;
  private node: Int32Array;
  private falling: Int32Array;
  /** Scale of each cluster at `lastPh` (0 = not drawn). */
  private sc: Float32Array;
  private lastPh = NaN;
  private tick = 0;
  private nf = 0;
  private n = 0;
  private key = '';
  private formId = '';
  private form: BlossomForm | null = null;
  private colKey = NaN;
  private acc = 0;
  private seed = 0x1234567;
  private simT = 0;
  private petal = new THREE.Color();
  stats = { clusters: 0, drawn: 0, open: 0, falling: 0, petals: 0, rebuilds: 0, lastMs: 0, maxMs: 0, sumMs: 0, frames: 0 };

  constructor(private leaves: Leaves, low: boolean) {
    this.group.name = 'blossom';
    this.cap = low ? CAP_LOW : CAP_HIGH;
    this.rec = new Float32Array(this.cap * R);
    this.node = new Int32Array(this.cap);
    this.falling = new Int32Array(this.cap);
    this.sc = new Float32Array(this.cap);
    const live = leaves.mesh.material as THREE.MeshLambertMaterial;
    const safe = live.isMeshLambertMaterial || (live as unknown as THREE.MeshBasicMaterial).isMeshBasicMaterial;
    const tex = this.tex = this.paint(blossomForm('oak')!);
    let m: THREE.MeshLambertMaterial;
    if (safe) m = live.clone();
    // Full leaf path (desktop): the configuration of the safe leaf V0, as the meadow builds it.
    else m = new THREE.MeshLambertMaterial({ side: THREE.FrontSide, map: tex, alphaTest: 0.5 });
    m.map = tex;
    const mesh = this.mesh = new THREE.InstancedMesh(cardGeometry(), m, this.cap);
    mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    (mesh.instanceMatrix.array as Float32Array).fill(0);
    mesh.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(this.cap * 3), 3).setUsage(THREE.DynamicDrawUsage);
    mesh.castShadow = false; mesh.receiveShadow = false; mesh.frustumCulled = false; mesh.matrixAutoUpdate = false;
    if (!low) {
      // GTAO g-buffer material with the alpha cut-out (High only; never compiled on Low). See Post and the meadow.
      const gb = new THREE.MeshNormalMaterial({ side: THREE.FrontSide, blending: THREE.NoBlending });
      gb.allowOverride = false;
      gb.onBeforeCompile = (sh) => {
        sh.uniforms.cutMap = { value: tex };
        sh.vertexShader = sh.vertexShader
          .replace('#include <common>', '#include <common>\nvarying vec2 vCutUv;')
          .replace('#include <begin_vertex>', '#include <begin_vertex>\nvCutUv = uv;');
        sh.fragmentShader = sh.fragmentShader
          .replace('void main() {', 'uniform sampler2D cutMap;\nvarying vec2 vCutUv;\nvoid main() {')
          .replace('#include <clipping_planes_fragment>', '#include <clipping_planes_fragment>\nif (texture2D(cutMap, vCutUv).a < 0.5) discard;');
      };
      mesh.userData.gbufferMaterial = gb;
    }
    mesh.count = 0; mesh.visible = false;
    this.group.add(mesh);
  }

  private paint(f: BlossomForm): THREE.Texture {
    const src = new THREE.CanvasTexture(blossomCanvas(f));
    src.colorSpace = THREE.SRGBColorSpace;
    const t = cleanLeafTexture(src, true);
    src.dispose();
    return t;
  }

  /** Form change: the pixels of the live map are replaced level by level (same texture object, no new program). */
  private setForm(id: string) {
    this.formId = id;
    const f = this.form = blossomForm(id);
    if (!f) return;
    const fresh = this.paint(f);
    const dst = this.tex.mipmaps as unknown as { data: Uint8Array }[], src = fresh.mipmaps as unknown as { data: Uint8Array }[];
    for (let i = 0; i < dst.length && i < src.length; i++) dst[i].data.set(src[i].data);
    this.tex.needsUpdate = true;
    fresh.dispose();
    if (f.fall) {
      // Falling petals are drawn with the live leaf material: the instance colour divides by the leaf map mean.
      const mm = (this.leaves as unknown as { mapMean: THREE.Color }).mapMean;
      this.petal.set(f.fall);
      this.petal.r = Math.min(8, this.petal.r / Math.max(0.02, mm.r)); this.petal.g = Math.min(8, this.petal.g / Math.max(0.02, mm.g)); this.petal.b = Math.min(8, this.petal.b / Math.max(0.02, mm.b));
    }
  }

  private rnd() {
    let h = this.seed;
    h ^= h << 13; h >>>= 0; h ^= h >>> 17; h ^= h << 5; h >>>= 0;
    this.seed = h;
    return h / 4294967296;
  }

  /** Which twigs flower, where the cards sit and each cluster's dates. Pure function of the tree and the controls. */
  private rebuild(sim: TreeSim, e: BlossomEnv) {
    const f = this.form!, nodes = sim.nodes, chains = sim.chains, rec = this.rec;
    const mn = sim.bboxMin, mx = sim.bboxMax, cx = (mn[0] + mx[0]) / 2, cz = (mn[2] + mx[2]) / 2;
    const H = Math.max(1, mx[1] - mn[1]), Rr = Math.max(0.5, (mx[0] - mn[0] + mx[2] - mn[2]) / 4);
    // Old enough: none on a sapling, all from a crown of about 3000 leaves; and only on wood from before this spring.
    const mature = sm(600, 3000, sim.leaves.length);
    const share = Math.min(1, e.amount) * f.amount * mature, per = e.amount > 1 ? Math.min(3, 2 * e.amount) : 2;
    const tSpring = season.springTime;
    let elig = 0;
    for (let pass = 0; pass < 2; pass++) {
      // Pass 0 counts, pass 1 fills (thinned evenly by hash when the cap would be exceeded).
      const keep = pass === 0 ? 1 : Math.min(1, this.cap / Math.max(1, elig * per));
      let n = 0;
      for (let id = 1; id < nodes.length && n < this.cap; id++) {
        const nd = nodes[id];
        if (!nd.leafy || nd.order === 0 || nd.born > tSpring || nd.light < 0.06 || chains[nd.chain]?.pruned) continue;
        const lw = sm(0.06, 0.28, nd.light);
        if (h01(id * 7 + 1) >= share * (0.25 + 0.75 * lw)) continue;
        if (pass === 0) { elig++; continue; }
        const ox = nd.wx - cx, oz = nd.wz - cz, ol = Math.hypot(ox, oz) || 1;
        const hgt = Math.min(1, Math.max(0, (nd.wy - mn[1]) / H));
        const side = 0.5 + 0.5 * Math.min(1, Math.max(-1, (ox * SOUTH_X + oz * SOUTH_Z) / Rr));
        const expo = 0.4 * lw + 0.35 * hgt + 0.25 * side;
        for (let k = 0; k < per && n < this.cap; k++) {
          const q = id * 4 + k;
          if (k >= 2 && h01(q * 5 + 4) > e.amount - 1) continue;
          if (h01(q * 5 + 3) >= keep) continue;
          const u = h01(q * 5), v = h01(q * 5 + 1), w = h01(q * 5 + 2);
          const o = n * R, size = f.size * (0.75 + 0.5 * w);
          // Card normal: outward and up (lit by the sun, seen from outside the crown), with its own scatter.
          let nx = (ox / ol) * 0.75 + (u - 0.5) * 1.1, ny = f.kind === 'catkin' ? (v - 0.5) * 0.3 : 0.55 + (v - 0.5) * 0.9, nz = (oz / ol) * 0.75 + (w - 0.5) * 1.1;
          const nl = Math.hypot(nx, ny, nz) || 1; nx /= nl; ny /= nl; nz /= nl;
          // Y: up, made perpendicular to the normal. X = Y x N.
          let yx = -ny * nx, yy = 1 - ny * ny, yz = -ny * nz;
          const yl = Math.hypot(yx, yy, yz) || 1; yx /= yl; yy /= yl; yz /= yl;
          const xx = yy * nz - yz * ny, xy = yz * nx - yx * nz, xz = yx * ny - yy * nx;
          rec[o] = nd.wx + (u - 0.5) * 0.3; rec[o + 1] = nd.wy + (v - 0.5) * 0.24; rec[o + 2] = nd.wz + (w - 0.5) * 0.3;
          rec[o + 3] = xx * size; rec[o + 4] = xy * size; rec[o + 5] = xz * size;
          rec[o + 6] = yx * size; rec[o + 7] = yy * size; rec[o + 8] = yz * size;
          rec[o + 9] = nx * size; rec[o + 10] = ny * size; rec[o + 11] = nz * size;
          const tOpen = OPEN0 + OPEN_SPREAD * (0.72 * (1 - expo) + 0.28 * u);
          rec[o + 12] = tOpen; rec[o + 13] = tOpen + HOLD0 + HOLD_SPREAD * v;
          rec[o + 14] = 0.86 + 0.28 * w;
          rec[o + 15] = f.kind === 'catkin' ? 1 : 0.5;
          this.node[n++] = id;
        }
      }
      if (pass === 1) this.n = n;
    }
    this.stats.clusters = this.n; this.stats.rebuilds++;
    this.colKey = NaN; this.lastPh = NaN;
  }

  /** Once per frame, after the sway offsets of the frame are known. */
  frame(dt: number, sim: TreeSim, e: BlossomEnv) {
    const t0 = performance.now(), mesh = this.mesh, ph = season.phase, st = this.stats;
    if (e.formId !== this.formId) { this.setForm(e.formId); this.key = ''; }
    const on = season.active && e.amount > 0 && this.form !== null && ph < BLOSSOM_END;
    if (!on) {
      if (mesh.visible) { mesh.visible = false; mesh.count = 0; this.key = ''; st.drawn = st.open = st.falling = 0; }
      return;
    }
    const f = this.form!;
    const key = `${sim.topology}|${Math.round(sim.time * 2)}|${sim.nodes.length}|${e.amount}|${this.formId}`;
    if (key !== this.key || sim.time < this.simT) { this.key = key; this.rebuild(sim, e); }
    this.simT = sim.time;
    const n = this.n, rec = this.rec, D = e.D, ND = this.node;
    const a = mesh.instanceMatrix.array as Float32Array;
    // Sizes move with the year: all matrices are rewritten when the phase moved 0.0005 (or jumped). In between only the
    // translations follow the sway, like `Leaves.sway`; on Low every second frame (the sway itself is updated that often).
    // Colours (view- and light-dependent) are repainted with a full pass once a second.
    const ck = Math.round(e.night * 20) + Math.floor(performance.now() / 1000) * 100;
    const full = !(Math.abs(ph - this.lastPh) < 0.0005) || season.jumped || ck !== this.colKey;
    this.tick++;
    if (!full) {
      if (!e.low || (this.tick & 1)) {
        const SC = this.sc;
        for (let i = 0, o = 0, q = 12; i < n; i++, o += R, q += 16) {
          const s = SC[i];
          const d = ND[i] * 3, an = rec[o + 15] * s;
          if (s === 0 || d + 2 >= D.length) continue;
          a[q] = rec[o] - rec[o + 6] * an + D[d]; a[q + 1] = rec[o + 1] - rec[o + 7] * an + D[d + 1]; a[q + 2] = rec[o + 2] - rec[o + 8] * an + D[d + 2];
        }
        const M = mesh.instanceMatrix;
        M.clearUpdateRanges(); M.addUpdateRange(0, n * 16); M.needsUpdate = true;
      }
      this.petals(dt, e, f, n, this.nf, st.open);
      st.lastMs = performance.now() - t0; st.sumMs += st.lastMs; st.frames++;
      if (st.lastMs > st.maxMs) st.maxMs = st.lastMs;
      return;
    }
    this.lastPh = ph;
    const paintCol = true;
    this.colKey = ck;
    const col = mesh.instanceColor!.array as Float32Array, dim = 0.74 * (1 - 0.5 * e.night);
    // Lights as the Lambert shader of the card will see them.
    const S = e.sun, Hm = e.hemi, si = S.intensity, hi = Hm.intensity;
    let lx = S.position.x - S.target.position.x, ly = S.position.y - S.target.position.y, lz = S.position.z - S.target.position.z;
    const ll = Math.hypot(lx, ly, lz) || 1; lx /= ll; ly /= ll; lz /= ll;
    const sr = S.color.r * si, sg = S.color.g * si, sb = S.color.b * si;
    const kr = Hm.color.r * hi, kg = Hm.color.g * hi, kb = Hm.color.b * hi, gr = Hm.groundColor.r * hi, gg = Hm.groundColor.g * hi, gb = Hm.groundColor.b * hi;
    // Wanted light: the hemisphere half-way, pulled 60 % to neutral (a blossom in shade is not sky blue), plus the sun.
    const hl = 0.15 * (kr + gr) + 0.3 * (kg + gg) + 0.05 * (kb + gb);
    const wr = 0.6 * hl + 0.2 * (kr + gr), wg = 0.6 * hl + 0.2 * (kg + gg), wb = 0.6 * hl + 0.2 * (kb + gb);
    const camX = e.cam.x, camY = e.cam.y, camZ = e.cam.z;
    let drawn = 0, open = 0, nf = 0;
    for (let i = 0, o = 0, q = 0; i < n; i++, o += R, q += 16) {
      const tOpen = rec[o + 12], tFall = rec[o + 13], s = blossomScale(ph, tOpen, tFall);
      this.sc[i] = s;
      if (s === 0) { if (a[q + 15] !== 0) { for (let j = 0; j < 16; j++) a[q + j] = 0; } continue; }
      drawn++;
      if (ph >= tFall) this.falling[nf++] = i; else if (ph >= tOpen + OPENING) open++;
      const d = ND[i] * 3, ok = d + 2 < D.length, an = rec[o + 15] * s;
      a[q] = rec[o + 3] * s; a[q + 1] = rec[o + 4] * s; a[q + 2] = rec[o + 5] * s; a[q + 3] = 0;
      a[q + 4] = rec[o + 6] * s; a[q + 5] = rec[o + 7] * s; a[q + 6] = rec[o + 8] * s; a[q + 7] = 0;
      a[q + 8] = rec[o + 9] * s; a[q + 9] = rec[o + 10] * s; a[q + 10] = rec[o + 11] * s; a[q + 11] = 0;
      a[q + 12] = rec[o] - rec[o + 6] * an + (ok ? D[d] : 0);
      a[q + 13] = rec[o + 1] - rec[o + 7] * an + (ok ? D[d + 1] : 0);
      a[q + 14] = rec[o + 2] - rec[o + 8] * an + (ok ? D[d + 2] : 0);
      a[q + 15] = 1;
      if (paintCol) {
        // Bud tint while closed, the painted colours once open, a little duller while it sheds.
        const k = sm(tOpen - 0.004, tOpen + OPENING, ph), g = dim * rec[o + 14] * (1 - 0.2 * sm(tFall, tFall + SHED, ph)), b = f.bud;
        // The face the camera sees: what Lambert adds there, and what it should get (sun term softened: no black backs).
        const il = 1 / (Math.hypot(rec[o + 9], rec[o + 10], rec[o + 11]) || 1);
        let nx = rec[o + 9] * il, ny = rec[o + 10] * il, nz = rec[o + 11] * il;
        if (nx * (camX - rec[o]) + ny * (camY - rec[o + 1]) + nz * (camZ - rec[o + 2]) < 0) { nx = -nx; ny = -ny; nz = -nz; }
        const ndl = Math.max(0, nx * lx + ny * ly + nz * lz), hw = 0.5 + 0.5 * ny, want = 0.24 + 0.4 * ndl + 0.14 * hw;
        const cr = Math.min(6, (wr + sr * want) / (gr + (kr - gr) * hw + sr * ndl + 1e-4));
        const cg = Math.min(6, (wg + sg * want) / (gg + (kg - gg) * hw + sg * ndl + 1e-4));
        const cb = Math.min(6, (wb + sb * want) / (gb + (kb - gb) * hw + sb * ndl + 1e-4));
        col[i * 3] = g * cr * (b[0] + (1 - b[0]) * k); col[i * 3 + 1] = g * cg * (b[1] + (1 - b[1]) * k); col[i * 3 + 2] = g * cb * (b[2] + (1 - b[2]) * k);
      }
    }
    mesh.count = n; mesh.visible = drawn > 0;
    const M = mesh.instanceMatrix;
    M.clearUpdateRanges(); M.addUpdateRange(0, n * 16); M.needsUpdate = true;
    if (paintCol) { const C = mesh.instanceColor!; C.clearUpdateRanges(); C.addUpdateRange(0, n * 3); C.needsUpdate = true; }
    st.drawn = drawn; st.open = open; st.falling = this.nf = nf;
    this.petals(dt, e, f, n, nf, open);
    st.lastMs = performance.now() - t0;
    st.sumMs += st.lastMs; st.frames++;
    if (st.lastMs > st.maxMs) st.maxMs = st.lastMs;
  }

  /** Petal fall: shedding clusters (and, sparsely, open ones in a gust) let petals go into the falling-leaf system. */
  private petals(dt: number, e: BlossomEnv, f: BlossomForm, n: number, nf: number, open: number) {
    const fall = e.fall, rec = this.rec, ND = this.node, st = this.stats, a = this.mesh.instanceMatrix.array as Float32Array;
    if (fall && f.fall && !season.jumped && nf + open > 0) {
      const w = e.wind, cxz = ND[nf > 0 ? this.falling[0] : 0] >= 0 ? rec : rec;
      const g0 = w.base > 1e-3 ? w.gust(cxz[0], cxz[2]) / w.base : 0, g3 = g0 * g0 * g0;
      const rate = Math.min(1.5, e.amount) * (e.low ? 40 : 90) * (Math.min(1, nf / 120) + 0.03 * Math.min(1, open / 400) * (1 + 6 * g3)) * (0.45 + 1.5 * g3 + 2.5 * e.violence);
      this.acc = Math.min(MAX_EMIT, this.acc + rate * dt);
      const free = Math.max(0, (fall.stats.airCap || 0) - fall.counts.air);
      let k = 0;
      while (this.acc >= 1 && k < MAX_EMIT && k < free) {
        this.acc -= 1;
        let i = -1;
        if (nf > 0) i = this.falling[Math.floor(this.rnd() * nf)];
        else for (let t = 0; t < 4 && i < 0; t++) { const c = Math.floor(this.rnd() * n); if (a[c * 16 + 15] !== 0) i = c; }
        if (i < 0) continue;
        // A petal: random pose, a few centimetres, somewhere in the cluster.
        const q = k * 16, s = 0.075 + 0.05 * this.rnd();
        let ax = this.rnd() - 0.5, ay = this.rnd() - 0.5, az = this.rnd() - 0.5;
        const al = Math.hypot(ax, ay, az) || 1; ax /= al; ay /= al; az /= al;
        let bx = ay, by = -ax, bz = 0;
        if (Math.abs(az) > 0.95) { bx = 1; by = 0; bz = -ax / az; }
        const bl = Math.hypot(bx, by, bz) || 1; bx /= bl; by /= bl; bz /= bl;
        pm[q] = (by * az - bz * ay) * s; pm[q + 1] = (bz * ax - bx * az) * s; pm[q + 2] = (bx * ay - by * ax) * s; pm[q + 3] = 0;
        pm[q + 4] = bx * s; pm[q + 5] = by * s; pm[q + 6] = bz * s; pm[q + 7] = 0;
        pm[q + 8] = ax * s; pm[q + 9] = ay * s; pm[q + 10] = az * s; pm[q + 11] = 0;
        pm[q + 12] = a[i * 16 + 12] + (this.rnd() - 0.5) * 0.3; pm[q + 13] = a[i * 16 + 13] + (this.rnd() - 0.5) * 0.3; pm[q + 14] = a[i * 16 + 14] + (this.rnd() - 0.5) * 0.3; pm[q + 15] = 1;
        const v = (0.85 + 0.3 * this.rnd()) * (1 - 0.5 * e.night);
        pc[k * 3] = this.petal.r * v; pc[k * 3 + 1] = this.petal.g * v; pc[k * 3 + 2] = this.petal.b * v;
        k++;
      }
      if (k > 0) { fall.adoptRaw(pm, pc, k, e.violence); st.petals += k; }
    }
  }
}

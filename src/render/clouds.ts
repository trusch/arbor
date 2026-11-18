import * as THREE from 'three';
import { ATLAS_W, ATLAS_H, BASE, CH, COLS, CW, DECK_S, HEAPS, ROWS, SCUD0, paintClouds, type CloudMap } from './cloudpaint';

/**
 * Clouds by type, phone-safe (PowerVR rule): every material is a clone of the canopy-shadow decal `MeshBasicMaterial`
 * (P-DECAL, like `celestial.ts` and `rain.ts`) with only `map`, `color`, `opacity` and depth state changed, so no shader
 * program is added and the sky shader is untouched. Three draws at most:
 *  - `tower`: one camera-facing quad on the upwind side, a painted cumulonimbus with a bright rim, rising with the storm.
 *  - `deck`: one horizontal plane above the camera with a tileable painted layer (stratus / nimbostratus), scrolled
 *    through `texture.offset`; opacity and darkness follow `weather.cloud`.
 *  - `heaps`: ONE mesh whose geometry is a batch of upright quads rewritten on the CPU each frame (cumulus,
 *    stratocumulus, rain scud, high wisps), uv into a painted atlas. Slots live on a virtual layer that drifts with the
 *    wind and wraps around the camera; cover changes by clouds growing and shrinking, slot by slot.
 *
 * Depth and perspective: like the celestial planes the meshes are pushed to the far plane with `gl.depthRange(1, 1)`,
 * so terrain, far trees and the crown hide them. Unlike them they sit far enough for the cloned material's scene fog
 * to act: the layer height is `LAYER / fog.density`, so a cloud near the horizon is the same fraction fogged whatever
 * the haze, which pales and flattens the far ones. Everything except the drift offset and the eased amounts is
 * derived from the inputs each frame.
 */

const DEG = Math.PI / 180;
const smooth = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};
function hash2(x: number, y: number) {
  const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return s - Math.floor(s);
}

/** Empty (transparent) map of the final size; `Clouds.setMaps` swaps the painted bytes in. Not uploaded while hidden. */
function dataTex(W: number, H: number, cs: string, repeat: boolean) {
  const t = new THREE.DataTexture(new Uint8Array(W * H * 4), W, H, THREE.RGBAFormat);
  t.colorSpace = cs as THREE.ColorSpace;
  t.generateMipmaps = true;
  t.minFilter = THREE.LinearMipmapLinearFilter;
  t.magFilter = THREE.LinearFilter;
  if (repeat) t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
}

/** Layer height above the camera x fog density (see the header): fog fraction 1 - exp(-(LAYER / sin(elevation))^2). */
const LAYER = 0.05, HEAP_LAYER = 0.032;
/** Half side of the square of slots around the camera, and of the deck plane, in layer heights. */
const BOX = 10, DECK = 30;
const GRID = 16, SLOTS = GRID * GRID, PARTS = 3;
/**
 * The sky as a dome: a cloud at ground distance r (layer heights) is drawn `dome(r)` layer heights above the camera.
 * It falls to the horizon at `R_HOR` and well under it by `R_OUT`, where slots are dropped, so a cloud enters and
 * leaves the picture over the horizon at its full size and is never scaled in or out.
 */
const R_HOR = 7.6, R_OUT = 9.6;
const dome = (r: number) => 1 - (r / R_HOR) * (r / R_HOR) * (r / R_HOR) - 1.5 * smooth(R_HOR, R_OUT, r);
/** Drift in layer heights per m/s of cloud speed, and the speed of the layer (heights / s) while a change of weather is on its way in. */
const DRIFT = 0.008, TRANSIT = 0.5;
/** Deck: seconds to close once the bank has arrived, seconds to open; share of slots that must already carry the new weather. */
const DECK_GATE = 0.55, BANK = 0.85;
/**
 * The deck is a bank with an edge: the plane's downwind edge comes in from `-DECK_E` deck heights upwind (behind the
 * hills) to `+DECK_E` at `DECK_V` heights / s, and it leaves by its upwind edge travelling the same way. `EDGE_N`
 * flat shreds ride on the edge so it is torn, not a ruled line.
 */
const DECK_E = 9, DECK_V = 0.5, EDGE_N = 12;
/** Deck plane: tiles across and along the wind, tile size and length in deck heights, and where its leading edge rests once closed (then it drifts, wrapping by one tile). */
const TILES = 9, TILES_U = 5, TILE = (2 * DECK) / TILES, DECK_L = TILES_U * TILE, DECK_REST = 12;
/** Largest angular width (rad) of a cloud at its closest approach: a limit on the size of clouds on high routes, fixed at entry. */
const MAX_ANG = 0.34;
/** Flash glow under the deck: map size, half side of the plane and its ground distance from the camera toward the strike (deck heights), share of the flash left on the whole deck. */
const GLOW_S = 128, GLOW_R = 8, GLOW_D = 3.4, DECK_FLASH = 0.12;
/** Seconds of opacity fade-in once the painted maps have arrived. */
const FADE_S = 1.5;
/** Night heap colour as a share of the live fog colour (plus the share a full moon adds); scud colour as a share of the deck colour, and its opacity. */
const NIGHT_BODY = 0.16, NIGHT_MOON = 0.12, SCUD_TONE = 0.8, SCUD_NIGHT = 0.6, SCUD_OPACITY = 0.5;
/** Low sun: share of the sun's light taken out of the body mix, and the gain of the sunlit side drawn over it. */
const LOW_SPLIT = 0.75, LOW_GAIN = 0.85;
/** Target share of slots shown, size factor and darkness per cloud type. */
const TYPES: Record<string, [number, number, number]> = {
  none: [0.07, 0.6, 0], cumulus: [0.55, 1.1, 0], stratocumulus: [0.95, 1.45, 0.12], stratus: [0, 1.2, 0.35],
  nimbostratus: [0.3, 1.3, 1], cumulonimbus: [0.8, 1.5, 0.55], fog: [0, 0.7, 0.1],
};

export interface CloudEnv {
  sunDir: THREE.Vector3; sunH: number; night: number; sunColor: THREE.Color; moonLight: number;
  /** weather.cloud (0..1), weather.cloudType, a running storm sequence, weather.flash, wind direction and cloudSpeed in m/s. */
  cloud: number; type: string; storm: boolean; flash: number; /** weather.bolt.u (-1..1 across the view). */ boltU?: number; dirX: number; dirZ: number; speed: number;
  fogDensity: number; lowQ: boolean;
  /** Live scene fog colour (after `Stage.applyWeather`): the night grade's own sky / horizon tone; and the moon's direction. */
  fogColor: THREE.Color; moonDir: THREE.Vector3;
}

export class Clouds {
  group = new THREE.Group();
  heaps: THREE.Mesh;
  deck: THREE.Mesh;
  tower: THREE.Mesh;
  /** The heaps' geometry again with the `lit` map: the side facing a low sun, in the sun's colour (hidden otherwise). */
  heapsLit: THREE.Mesh;
  /** Mean JS cost per frame = sumMs / frames; quads = cumulus quads this frame; amount / size = eased type targets. */
  stats = { paintMs: 0, frames: 0, sumMs: 0, maxMs: 0, quads: 0, amount: 0, size: 1, dark: 0, deck: 0, tower: 0, blocker: 0, glow: 0 };
  /** Script hook: when set, every drawn cloud writes [slot, generation, world x, y, z of its base centre, width, height] here (`probeN` entries). */
  probe: Float32Array | null = null;
  probeN = 0;
  private pos: THREE.BufferAttribute;
  private uv: THREE.BufferAttribute;
  private deckTex: THREE.DataTexture;
  private atlas: THREE.DataTexture;
  private litTex: THREE.DataTexture;
  /** Painted maps are in (`setMaps`); until then nothing is drawn and nothing is uploaded. */
  ready = false;
  /** Opacity ramp after the maps arrive (`FADE_S`), so clouds never pop in; `amount = -1` (scripts) snaps it to 1. */
  private fade = 0;
  private amount = -1;
  private dark = 0;
  /** Per slot, set when the slot enters at the upwind edge (the documented state besides the drift): generation, shown, kind (0 heap, 1 scud), size factor, last along-wind position. */
  private gen = new Uint16Array(SLOTS);
  private show = new Uint8Array(SLOTS);
  private kindOf = new Uint8Array(SLOTS);
  private sz = new Float32Array(SLOTS);
  private pu = new Float32Array(SLOTS);
  private boost = 0;
  /** Deck texture offset (the same drift, kept apart because it wraps at one tile). */
  private du = 0;
  private dv = 0;
  private deckK = 0;
  /** Deck bank: 0 none, 1 arriving / closed (covers upwind of `deckE`), 2 leaving (covers downwind of `deckE`). */
  private deckMode = 0;
  private edgeTex: THREE.DataTexture;
  /** The torn edges of the deck: one tile deep, on the plane's downwind and upwind side. */
  edgeLead: THREE.Mesh;
  edgeTrail: THREE.Mesh;
  private deckE = DECK_E;
  /** Lightning under the closed deck: one plane just under it around the strike (radial falloff x the deck's own structure in its pixels). */
  glow: THREE.Mesh;
  private glowTex: THREE.DataTexture;
  private litPos: THREE.BufferAttribute;
  private litUv: THREE.BufferAttribute;
  private cnt = new Uint8Array(SLOTS * PARTS);
  private stormK = 0;
  private litOn = false;
  /** Drift of the layer in layer heights (wraps at 2 BOX), and the weather clock for the slow breathing. */
  private ox = 0;
  private t = 0;
  private lit = new THREE.Color();
  private shade = new THREE.Color();
  private tmp = new THREE.Color();
  private white = new THREE.Color();
  private fwd = new THREE.Vector3();

  constructor(decal: THREE.MeshBasicMaterial) {
    const cs = decal.map?.colorSpace ?? THREE.SRGBColorSpace;
    const atlas = this.atlas = dataTex(ATLAS_W, ATLAS_H, cs, false);
    this.deckTex = dataTex(DECK_S, DECK_S, cs, true);
    this.litTex = dataTex(ATLAS_W, ATLAS_H, cs, false);
    this.deckTex.repeat.set(TILES_U, TILES);
    this.edgeTex = dataTex(2 * DECK_S, DECK_S, cs, true);
    this.edgeTex.wrapS = THREE.ClampToEdgeWrapping;
    this.edgeTex.repeat.set(1, TILES);
    this.group.visible = false;
    // The GTAO g-buffer pass must not see these planes (its override material would draw solid quads).
    const hidden = new THREE.MeshBasicMaterial({ visible: false });
    (hidden as unknown as { allowOverride: boolean }).allowOverride = false;
    const mk = (geo: THREE.BufferGeometry, map: THREE.Texture, order: number) => {
      const m = decal.clone();
      m.map = map;
      m.color.setRGB(1, 1, 1);
      m.opacity = 1;
      m.blending = THREE.NormalBlending;
      m.depthWrite = false;
      const mesh = new THREE.Mesh(geo, m);
      mesh.renderOrder = order;
      mesh.visible = false;
      mesh.frustumCulled = false;
      mesh.userData.gbufferMaterial = hidden;
      // Drawn at the far plane: GL state only, restored right after the draw call (same as `celestial.ts`).
      mesh.onBeforeRender = (r) => r.getContext().depthRange(1, 1);
      mesh.onAfterRender = (r) => r.getContext().depthRange(0, 1);
      this.group.add(mesh);
      return mesh;
    };
    // After the sun glow (3), before fireflies (4), bolt (5) and rain (6+): clouds cover the sun, rain covers clouds.
    const tg = new THREE.PlaneGeometry(1, 1);
    const tuv = tg.getAttribute('uv') as THREE.BufferAttribute;
    for (let i = 0; i < 4; i++) tuv.setXY(i, 0.5 + 0.5 * tuv.getX(i), 0.5 * tuv.getY(i));
    this.tower = mk(tg, atlas, 3.2);
    const dg = new THREE.PlaneGeometry(1, 1);
    dg.rotateX(Math.PI / 2);
    this.deck = mk(dg, this.deckTex, 3.4);
    const eg = (u0: number) => { const g = dg.clone(), a = g.getAttribute('uv') as THREE.BufferAttribute; for (let i = 0; i < 4; i++) a.setX(i, u0 + 0.5 * a.getX(i)); return g; };
    this.edgeLead = mk(eg(0.5), this.edgeTex, 3.41);
    this.edgeTrail = mk(eg(0), this.edgeTex, 3.42);
    this.edgeTrail.material = this.edgeLead.material;
    this.glowTex = dataTex(GLOW_S, GLOW_S, cs, false);
    this.glow = mk(dg, this.glowTex, 3.45);
    // Batched quads: position / normal / uv / index, like a PlaneGeometry (same attributes, same program).
    const N = SLOTS * PARTS, g = new THREE.BufferGeometry();
    this.pos = new THREE.BufferAttribute(new Float32Array(N * 12), 3);
    this.uv = new THREE.BufferAttribute(new Float32Array(N * 8), 2);
    this.pos.setUsage(THREE.DynamicDrawUsage); this.uv.setUsage(THREE.DynamicDrawUsage);
    const nrm = new Float32Array(N * 12), idx = new Uint16Array(N * 6);
    for (let q = 0; q < N; q++) {
      for (let v = 0; v < 4; v++) nrm[q * 12 + v * 3 + 2] = 1;
      idx.set([q * 4, q * 4 + 2, q * 4 + 1, q * 4 + 2, q * 4 + 3, q * 4 + 1], q * 6);
    }
    g.setAttribute('position', this.pos);
    g.setAttribute('normal', new THREE.BufferAttribute(nrm, 3));
    g.setAttribute('uv', this.uv);
    g.setIndex(new THREE.BufferAttribute(idx, 1));
    this.heaps = mk(g, atlas, 3.6);
    (this.heaps.material as THREE.MeshBasicMaterial).side = decal.side;
    // The lit layer has its own batch (same attributes): in a flash the clouds near the strike are in it up to three times.
    const NL = N * 2, g2 = new THREE.BufferGeometry();
    this.litPos = new THREE.BufferAttribute(new Float32Array(NL * 12), 3);
    this.litUv = new THREE.BufferAttribute(new Float32Array(NL * 8), 2);
    this.litPos.setUsage(THREE.DynamicDrawUsage); this.litUv.setUsage(THREE.DynamicDrawUsage);
    const nrm2 = new Float32Array(NL * 12), idx2 = new Uint16Array(NL * 6);
    for (let q = 0; q < NL; q++) {
      for (let v = 0; v < 4; v++) nrm2[q * 12 + v * 3 + 2] = 1;
      idx2.set([q * 4, q * 4 + 2, q * 4 + 1, q * 4 + 2, q * 4 + 3, q * 4 + 1], q * 6);
    }
    g2.setAttribute('position', this.litPos);
    g2.setAttribute('normal', new THREE.BufferAttribute(nrm2, 3));
    g2.setAttribute('uv', this.litUv);
    g2.setIndex(new THREE.BufferAttribute(idx2, 1));
    this.heapsLit = mk(g2, this.litTex, 3.62);
    (this.heapsLit.material as THREE.MeshBasicMaterial).side = decal.side;
  }

  /**
   * Paints the maps without blocking the page start: in a Web Worker (the bytes come back as transferred buffers);
   * where a worker cannot be started the painting runs on the main thread a few seconds after the start instead.
   */
  paint() {
    const t0 = performance.now();
    const local = () => setTimeout(() => { if (!this.ready) { const m = paintClouds(); this.setMaps(m.atlas, m.deck, m.lit, t0, m.edge); } }, 4000);
    try {
      const w = new Worker(new URL('./cloudpaint.worker.ts', import.meta.url), { type: 'module' });
      w.onmessage = (e: MessageEvent<{ atlas: CloudMap; deck: CloudMap; lit: CloudMap; edge: CloudMap }>) => { this.setMaps(e.data.atlas, e.data.deck, e.data.lit, t0, e.data.edge); w.terminate(); };
      w.onerror = () => { w.terminate(); local(); };
      w.postMessage(0);
    } catch { local(); }
  }

  setMaps(atlas: CloudMap, deck: CloudMap, lit: CloudMap, t0 = performance.now(), edge?: CloudMap) {
    if (edge) { (this.edgeTex.image as { data: Uint8Array }).data = edge.d; this.edgeTex.needsUpdate = true; }
    (this.litTex.image as { data: Uint8Array }).data = lit.d;
    this.litTex.needsUpdate = true;
    (this.atlas.image as { data: Uint8Array }).data = atlas.d;
    (this.deckTex.image as { data: Uint8Array }).data = deck.d;
    this.atlas.needsUpdate = this.deckTex.needsUpdate = true;
    // Glow map: soft disc whose alpha and tone carry the deck tile's structure (three tiles across), so the lit region shows the cloud.
    {
      const D = deck.d, G = GLOW_S, o = new Uint8Array(G * G * 4), lum = (k: number) => (0.3 * D[k] + 0.55 * D[k + 1] + 0.15 * D[k + 2]) * D[k + 3] / 255;
      let lo = 255, hi = 0;
      for (let k = 0; k < D.length; k += 4) { const l = lum(k); if (l < lo) lo = l; if (l > hi) hi = l; }
      const flat = hi - lo < 6;
      for (let y = 0; y < G; y++) for (let x = 0; x < G; x++) {
        const dx = (x + 0.5) / G * 2 - 1, dy = (y + 0.5) / G * 2 - 1, f0 = Math.max(0, 1 - Math.hypot(dx, dy)), f = f0 * f0 * (3 - 2 * f0);
        const sx = Math.floor(x * 3 * DECK_S / G) % DECK_S, sy = Math.floor(y * 3 * DECK_S / G) % DECK_S;
        let st = flat ? 0.5 + 0.5 * Math.sin(dx * 9 + 3 * Math.sin(dy * 7)) * Math.sin(dy * 11 + 2 * Math.sin(dx * 5)) : (lum((sy * DECK_S + sx) * 4) - lo) / (hi - lo);
        st = st * st * (3 - 2 * st);
        const k = (y * G + x) * 4;
        o[k] = 190 + 65 * st; o[k + 1] = 200 + 55 * st; o[k + 2] = 255; o[k + 3] = 255 * f * (0.3 + 0.7 * st) * (0.55 + 0.45 * f);
      }
      (this.glowTex.image as { data: Uint8Array }).data = o; this.glowTex.needsUpdate = true;
    }
    this.ready = true;
    this.stats.paintMs = performance.now() - t0;
    performance.measure('clouds maps ready', { start: t0 });
  }

  /** One quad: centre of its base line (world), half width along the level vector (rx, rz), height along the up vector (ux, uy, uz), atlas cell, mirrored. */
  private quad(q: number, cx: number, cy: number, cz: number, rx: number, rz: number, ux: number, uy: number, uz: number, hw: number, hh: number, cell: number, flip: boolean) {
    const P = this.pos.array as Float32Array, U = this.uv.array as Float32Array, o = q * 12, u = q * 8;
    // The painted base line sits BASE up the cell: sink the quad so the base is at the given point.
    const bx = cx - ux * hh * BASE, by = cy - uy * hh * BASE, bz = cz - uz * hh * BASE, tx = bx + ux * hh, ty = by + uy * hh, tz = bz + uz * hh;
    P[o] = tx - rx * hw; P[o + 1] = ty; P[o + 2] = tz - rz * hw;
    P[o + 3] = tx + rx * hw; P[o + 4] = ty; P[o + 5] = tz + rz * hw;
    P[o + 6] = bx - rx * hw; P[o + 7] = by; P[o + 8] = bz - rz * hw;
    P[o + 9] = bx + rx * hw; P[o + 10] = by; P[o + 11] = bz + rz * hw;
    const u0 = (cell % COLS) / COLS, v1 = 1 - Math.floor(cell / COLS) / ROWS, v0 = v1 - 1 / ROWS, ua = flip ? u0 + 1 / COLS : u0, ub = flip ? u0 : u0 + 1 / COLS;
    U[u] = ua; U[u + 1] = v1; U[u + 2] = ub; U[u + 3] = v1; U[u + 4] = ua; U[u + 5] = v0; U[u + 6] = ub; U[u + 7] = v0;
  }

  /** What slot `i` should carry in the weather of this frame: [shown, kind]. Under a deck the sky is a bank of heaps with the type's share of scud. */
  private want(i: number, share: number, under: boolean): number {
    const rank = hash2(i + 0.5, this.gen[i] * 1.37 + 3.7);
    if (under) return rank < share ? 3 : rank < BANK ? 1 : 0;
    return rank < share ? 1 : 0;
  }

  /** Once per frame, right before `render` and after `Stage.applyWeather` (it reads the live fog density). */
  frame(cam: THREE.PerspectiveCamera, E: CloudEnv, dt: number) {
    this.group.visible = this.ready;
    if (!this.ready) return;
    const t0 = performance.now(), S = this.stats;
    this.t += dt;
    // Scripts snap with `amount = -1` (then the fade is over too); the first frames after the maps arrive fade in.
    this.fade = this.amount < 0 && this.fade > 0 ? 1 : Math.min(1, this.fade + Math.min(dt, 0.1) / FADE_S + 1e-3);
    const fade = this.fade * this.fade * (3 - 2 * this.fade);
    const c = E.cloud, h = E.sunH;
    const T = TYPES[E.type] ?? TYPES.none;
    // Snap (first frame, scripts, `weather.snap()` callers that set `amount = -1`, a hidden-tab gap): the sky is
    // repopulated at once for the weather of this frame. Otherwise nothing here eases a cloud's size.
    const snap = this.amount < 0 || dt > 1, k = snap ? 1 : 1 - Math.exp(-dt * 0.45);
    this.amount = T[0];
    this.dark += (T[2] - this.dark) * k;
    this.stormK += ((E.storm ? 1 : 0) - this.stormK) * (snap ? 1 : 1 - Math.exp(-dt * 0.12));
    const HD = Math.min(160, LAYER / Math.max(1e-5, E.fogDensity)), H = Math.min(100, HEAP_LAYER / Math.max(1e-5, E.fogDensity));
    // Drift: metres per second over a layer taken to be about 1100 m up.
    const L = 2 * BOX, dOp = smooth(0.34, 0.47, c), under = dOp > 0.5;
    // Slots still carrying the old weather: while there are any, the layer runs faster (the change is carried in on the wind).
    let mis = 0;
    for (let i = 0; i < SLOTS; i++) {
      const w = this.want(i, T[0], under);
      if (snap) { this.gen[i] = (this.gen[i] + 1) & 0xffff; const w2 = this.want(i, T[0], under); this.show[i] = w2 & 1; this.kindOf[i] = w2 >> 1; this.sz[i] = T[1]; }
      else if ((w & 1) !== this.show[i] || (this.show[i] === 1 && (w >> 1) !== this.kindOf[i])) mis++;
    }
    const pending = mis / SLOTS;
    this.boost = snap ? 0 : this.boost + ((pending > 0.03 ? 1 : 0) - this.boost) * (1 - Math.exp(-dt * 0.35));
    const own = E.speed * DRIFT, adv = (own + (Math.max(own, TRANSIT) - own) * this.boost) * Math.min(dt, 1), tr = 9 / (2 * DECK);
    this.ox = (this.ox + adv) % L;
    this.du = (((this.du - adv * tr * (HEAP_LAYER / LAYER)) % 1) + 1) % 1;
    // The deck closes over the bank once it has arrived, and opens before the bank moves on.
    // The deck bank: its edge comes in from upwind once the heap bank has arrived, and it leaves downwind edge last.
    // It always travels with the wind; a change of mind waits until the edge is through.
    const advD = adv * (HEAP_LAYER / LAYER);
    if (snap) { this.deckMode = under ? 1 : 0; this.deckE = DECK_REST; this.deckK = dOp; }
    else if (!this.deckMode) { if (under && pending < 1 - DECK_GATE) { this.deckMode = 1; this.deckE = -DECK_E; this.deckK = dOp; } }
    else if (under && this.deckE <= DECK_REST + TILE) {
      // Arriving, then resting overhead: it drifts on with the layer and steps back by one tile far downwind (same picture).
      this.deckE += this.deckE < DECK_REST ? Math.max(DECK_V * Math.min(dt, 1), advD) : advD;
      if (this.deckE >= DECK_REST + TILE) this.deckE -= TILE;
      this.deckK += (dOp - this.deckK) * (1 - Math.exp(-dt * 0.3));
    } else {
      // Leaving (also a bank that came in while the weather changed its mind): on with the wind until its upwind edge is gone.
      this.deckE += Math.max(DECK_V * Math.min(dt, 1), advD);
      if (this.deckE - DECK_L > DECK_E) this.deckMode = 0;
    }
    const dCov = this.deckMode ? smooth(-DECK_E, DECK_E * 0.6, this.deckE) * (1 - smooth(-DECK_E * 0.6, DECK_E, this.deckE - DECK_L)) : 0;

    // ---- light: lit colour (sun, warm when low), shade colour (sky light), both down to a moonlit grey at night ----
    const day = smooth(-0.1, 0.12, h), sunUp = smooth(-0.06, 0.1, h);
    // Night exposure is higher: keep night clouds faint.
    const nightL = (0.008 + 0.028 * E.moonLight) * (1 - day);
    this.lit.copy(E.sunColor).multiplyScalar(1.9 * sunUp * (0.55 + 0.45 * smooth(0, 0.35, h)));
    this.shade.setRGB(0.5, 0.58, 0.72).multiplyScalar(1.15 * day);
    // The painted shade is in the texture; the material colour is one mix of both lights. Under a deck the heaps grey.
    const mixLit = 0.5 * (1 - 0.8 * c);
    const flash = E.flash * 1.6;

    // ---- deck ----
    const deckK = this.deckMode ? Math.max(0.6, this.deckK) : 0, dOpS = deckK * deckK * (3 - 2 * deckK);
    const dl = Math.hypot(E.dirX, E.dirZ) || 1, wx = E.dirX / dl, wz = E.dirZ / dl, camY = cam.position.y;
    // Along-wind position of the plane's centre: the covered side is upwind of the edge while arriving, downwind while leaving.
    const dC = (this.deckE - DECK_L / 2) * HD;
    const dk = this.deck, dm = dk.material as THREE.MeshBasicMaterial;
    dk.visible = dOpS > 0.01;
    S.deck = dOpS;
    if (dk.visible) {
      dk.position.set(cam.position.x + wx * dC, cam.position.y + HD, cam.position.z + wz * dC);
      dk.rotation.set(0, Math.atan2(-wz, wx), 0);
      dk.scale.set(DECK_L * HD, 1, 2 * DECK * HD);
      // Scrolled with the same drift (texture v runs along world z after the rotation; 9 tiles over 2 DECK heights).

      // Mid grey for stratus, dark grey-blue for rain cloud and the storm; warm cast from a low sun.
      const g = 0.86 - 0.56 * smooth(0.5, 0.95, c);
      this.tmp.copy(this.shade).lerp(this.lit, 0.3).multiplyScalar(g);
      dm.color.setRGB(this.tmp.r + nightL + flash * DECK_FLASH, this.tmp.g + nightL * 1.1 + flash * DECK_FLASH, this.tmp.b + nightL * 1.3 + flash * DECK_FLASH * 1.2);
      dm.opacity = dOpS * fade;
      const em = this.edgeLead.material as THREE.MeshBasicMaterial;
      em.color.copy(dm.color); em.opacity = dm.opacity;
      for (const [e, c] of [[this.edgeLead, this.deckE + TILE / 2], [this.edgeTrail, this.deckE - DECK_L - TILE / 2]] as [THREE.Mesh, number][]) {
        e.position.set(cam.position.x + wx * c * HD, cam.position.y + HD, cam.position.z + wz * c * HD);
        e.rotation.copy(dk.rotation); e.scale.set(TILE * HD, 1, 2 * DECK * HD);
      }
    }
    this.edgeLead.visible = dk.visible && this.deckE < DECK_REST - 1;
    this.edgeTrail.visible = dk.visible && this.deckE - DECK_L > -DECK_REST;
    // The flash under the deck: a bright region around the strike that falls off across the sky (opacity follows the flash).
    cam.getWorldDirection(this.fwd);
    const gYaw = Math.atan2(this.fwd.x, this.fwd.z) + (E.boltU ?? 0) * Math.atan(Math.tan((cam.fov * Math.PI) / 360) * cam.aspect) * 0.8;
    const gw = this.glow, gm = gw.material as THREE.MeshBasicMaterial, gO = Math.min(1, E.flash * 1.5) * dOpS * dCov * fade;
    gw.visible = dk.visible && gO > 0.02;
    S.glow = gw.visible ? gO : 0;
    if (gw.visible) {
      gw.position.set(cam.position.x + Math.sin(gYaw) * GLOW_D * HD, cam.position.y + HD * 0.992, cam.position.z + Math.cos(gYaw) * GLOW_D * HD);
      gw.rotation.set(0, gYaw, 0);
      gw.scale.set(2 * GLOW_R * HD, 1, 2 * GLOW_R * HD);
      gm.color.setRGB(1.5, 1.55, 1.7); gm.opacity = gO;
    }

    // ---- storm tower: comes up over the upwind horizon at a fixed size and advances; the deck closes over it ----
    const tw = this.tower, tm = tw.material as THREE.MeshBasicMaterial;
    const rise = this.stormK * smooth(0.0, 0.3, c);
    tw.visible = rise > 0.004;
    S.tower = rise;
    // Sheet lightning inside the tower between strikes: short double flickers from the weather clock (no state).
    let sheet = 0;
    if (tw.visible && E.storm) {
      const kk = Math.floor(this.t / 2.7), ph = this.t - kk * 2.7 - 0.3 - 1.9 * hash2(kk, 5.3);
      if (hash2(kk, 1.9) > 0.35) sheet = Math.exp(-(ph * ph) / 0.004) + 0.6 * Math.exp(-((ph - 0.19) * (ph - 0.19)) / 0.003);
    }
    if (tw.visible) {
      tm.opacity = fade;
      const rr = 10 - 5.5 * rise, R = rr * HD, wdt = 8.4 * HD, hgt = 4.8 * HD;
      const by = cam.position.y - 0.05 * R - hgt * 1.1 * smooth(6.5, 10, rr);
      tw.position.set(cam.position.x - E.dirX * R, by + hgt * 0.5 - hgt * 0.08, cam.position.z - E.dirZ * R);
      tw.scale.set(wdt, hgt, 1);
      tw.rotation.set(0, Math.atan2(E.dirX, E.dirZ), 0);
      this.tmp.copy(this.shade).lerp(this.lit, 0.6);
      // A strike on the tower's side lights it fully, one elsewhere much less.
      cam.getWorldDirection(this.fwd);
      const ty = Math.atan2(this.fwd.x, this.fwd.z) + (E.boltU ?? 0) * Math.atan(Math.tan((cam.fov * Math.PI) / 360) * cam.aspect) * 0.8;
      const fl = flash * (0.2 + 0.8 * smooth(0.2, 0.9, -(wx * Math.sin(ty) + wz * Math.cos(ty)))) + 0.5 * sheet * (0.35 + 0.65 * (1 - day));
      tm.color.setRGB(this.tmp.r + nightL * 1.5 + fl, this.tmp.g + nightL * 1.6 + fl, this.tmp.b + nightL * 1.9 + fl * 1.15);
    }

    // ---- heaps ----
    const hm = this.heaps.material as THREE.MeshBasicMaterial;
    const dark = Math.max(this.dark, 0.75 * smooth(0.3, 0.9, c));
    // Open sky: day light as before, plus the night body. A cloud at night is a dark shape against the sky: its colour
    // is a share of the live fog colour (the horizon tone of the night grade, which `moonLight` lifts and the storm
    // darkens), a little greyer than the sky, brighter only with the moon. No moon: nearly black, it shows by hiding stars.
    // Low sun: the flat mix splits in two. The body goes toward the cool sky-lit shade (far side and base), and the
    // side facing the sun is drawn on top from the `lit` map in the sun's colour. `low` is exactly 0 from sun
    // elevation sine 0.34 up, so the day picture is the single mix as before.
    const low = smooth(0.34, 0.1, h) * sunUp;
    // High sun: a cloud is white (the sun's warm cast is taken out; the shade in the texture is blue-grey).
    const ll = 0.3 * this.lit.r + 0.55 * this.lit.g + 0.15 * this.lit.b, wk = 0.9 * (1 - low);
    this.white.setRGB(this.lit.r + (ll - this.lit.r) * wk, this.lit.g + (ll - this.lit.g) * wk, this.lit.b + (ll * 1.04 - this.lit.b) * wk);
    this.tmp.copy(this.shade).lerp(this.white, mixLit * (1 - LOW_SPLIT * low)).multiplyScalar(1 - 0.8 * dark);
    const F = E.fogColor, fl = 0.3 * F.r + 0.5 * F.g + 0.2 * F.b, nk = (NIGHT_BODY + NIGHT_MOON * E.moonLight) * (1 - day);
    let r = this.tmp.r + nk * (F.r + 0.4 * (fl - F.r)), g = this.tmp.g + nk * (F.g + 0.4 * (fl - F.g)), b = this.tmp.b + nk * (F.b + 0.4 * (fl - F.b));
    // Under a deck the heaps are scud: the deck's own colour a little darker (never lighter than what is behind them,
    // day or night, by construction) and half transparent, so they are soft shapes in the layer, not cut-outs.
    const scud = dk.visible ? dOpS * dCov : 0, tone = SCUD_TONE + (SCUD_NIGHT - SCUD_TONE) * (1 - day);
    r += (dm.color.r * tone - r) * scud; g += (dm.color.g * tone - g) * scud; b += (dm.color.b * tone - b) * scud;
    hm.opacity = fade * (1 - (1 - SCUD_OPACITY) * scud);
    hm.color.setRGB(r + flash * 0.1 * (1 - scud), g + flash * 0.1 * (1 - scud), b + flash * 0.13 * (1 - scud));
    // The `lit` map again: the sun's side at low sun, and in a lightning flash the billow tops and flanks of every cloud
    // (the structure shows for the frames of the flash; the body colour above takes a smaller share).
    const lm = this.heapsLit.material as THREE.MeshBasicMaterial, fo = Math.min(1, E.flash * 1.3);
    // Moonlight: the same layer, faint and pale, on the moon's side.
    const moonK = E.moonLight * (1 - day) * (h < -0.04 ? 1 : 0), lo = Math.max(low * (1 - scud) * (1 - 0.8 * c), 0.55 * moonK * (1 - scud));
    this.litOn = lo > 0.01 || fo > 0.01;
    // In a flash the layer holds only the clouds near the strike (up to three times over), so its opacity is the flash's.
    const flashing = fo > 0.01;
    lm.opacity = fade * (flashing ? Math.min(0.75, 0.25 + 0.6 * fo) : Math.min(1, lo * 1.1));
    if (flashing) lm.color.setRGB(0.8 + 0.5 * fo, 0.85 + 0.5 * fo, 1 + 0.5 * fo);
    else if (moonK > 0) lm.color.setRGB(F.r, F.g, F.b).multiplyScalar(0.9).lerp(this.tmp.copy(this.lit).multiplyScalar(LOW_GAIN * (1 - 0.8 * dark)), low);
    else lm.color.copy(this.lit).multiplyScalar(LOW_GAIN * (1 - 0.8 * dark));
    // Where the strike is: the bolt plane's azimuth (`rain.ts`: camera heading + u x 0.8 of the half field of view).
    cam.getWorldDirection(this.fwd);
    const bYaw = Math.atan2(this.fwd.x, this.fwd.z) + (E.boltU ?? 0) * Math.atan(Math.tan((cam.fov * Math.PI) / 360) * cam.aspect) * 0.8, bx = Math.sin(bYaw), bz = Math.cos(bYaw);
    // The painted light side faces the sun, at night the moon.
    const Ld = h < -0.04 && E.moonLight > 0 ? E.moonDir : E.sunDir;
    const sx = Ld.x, sz = Ld.z;
    let n = 0, pn = 0;
    for (let i = 0; i < SLOTS; i++) {
      // Lattice in the wind's frame: u along the wind (drifting, wrapping far under the horizon), v across.
      const gu = ((i % GRID) + 0.1 + 0.8 * hash2(i, 3.7)) / GRID;
      const u = ((gu * L + this.ox) % L + L) % L - BOX;
      // Entering at the upwind edge: the slot becomes a new cloud of the weather of this moment.
      if (u < this.pu[i] - 1 && !snap) {
        this.gen[i] = (this.gen[i] + 1) & 0xffff;
        const w = this.want(i, T[0], under);
        this.show[i] = w & 1; this.kindOf[i] = w >> 1; this.sz[i] = T[1];
      }
      this.pu[i] = u;
      if (!this.show[i]) continue;
      const gn = this.gen[i], h2 = hash2(i + 0.3, gn + 9.1), h3 = hash2(i + 0.7, gn * 1.7 + 17.3), h4 = hash2(i + 0.1, gn * 2.3 + 23.9);
      let v = ((Math.floor(i / GRID) + 0.1 + 0.8 * h2) / GRID) * L - BOX;
      // Nothing passes straight overhead (a card there would spin).
      if (Math.abs(v) < 1) v = v < 0 ? -1 : 1;
      const xr = u * wx - v * wz, zr = u * wz + v * wx, r = Math.hypot(xr, zr);
      if (r > R_OUT) continue;
      const isScud = this.kindOf[i] === 1;
      // Size is the cloud's own (small puffs to broad banks), fixed for its life; it only breathes a little.
      const br = 1 + 0.04 * Math.sin(this.t * (0.11 + 0.1 * h3) + h4 * 6.28), bh = 1 + 0.05 * Math.sin(this.t * (0.09 + 0.08 * h4) + h3 * 6.28);
      // A cloud on a high route is limited in size by how near it will pass (known from its row, so from entry on).
      const near = Math.hypot(v, dome(Math.abs(v)));
      const big = h3 * Math.sqrt(h3), w = H * Math.min((0.5 + 1.75 * big) * this.sz[i], MAX_ANG * near) * br;
      // Flatter toward the horizon (seen more from the side, through more air).
      const flat = 0.62 + 0.38 * smooth(R_HOR, 2.5, r);
      const hh = w * (CH / CW) * 1.25 * flat * bh;
      const x = xr * H, z = zr * H, y = H * dome(r) * (1 - 0.04 * h4);
      // Facing the camera: level across, and leaning back with elevation so a high cloud is not seen edge-on.
      const rx = -zr / r, rz = xr / r, dd = Math.hypot(x, y, z), el = Math.max(0, y) / dd, cu = Math.sqrt(1 - el * el);
      const ux = -(xr / r) * el, uz = -(zr / r) * el, uy = cu;
      // Painted light comes from the left of the sprite: mirror it when the sun is to the right of this cloud.
      const flip = rx * sx + rz * sz > 0;
      const parts = isScud ? 1 + (h4 > 0.5 ? 1 : 0) : 1 + (big > 0.22 ? 1 : 0) + (big > 0.55 ? 1 : 0);
      if (this.probe && pn < this.probe.length / 7) this.probe.set([i, gn, cam.position.x + x, camY + y, cam.position.z + z, w, hh], 7 * pn++);
      // Copies in the flash layer: by the angle between the cloud and the strike, and nearer clouds more.
      const cb = (xr * bx + zr * bz) / r, copies = !flashing ? 1 : isScud ? 0 : cb > 0.9 ? 3 : cb > 0.6 ? 2 : cb > 0.1 && r < 6 ? 1 : 0;
      for (let j = 0; j < parts; j++) {
        this.cnt[n] = copies;
        const a = hash2(i * 3 + j + 0.2, gn * 3.1 + 41.3), b = hash2(i * 3 + j + 0.6, gn * 1.3 + 57.9);
        // A cloud is put together from one to three painted heaps side by side on one base line: no two are the same.
        const off = j === 0 ? 0 : (j === 1 ? -1 : 1) * w * (0.24 + 0.2 * a), ws = j === 0 ? 1 : 0.55 + 0.35 * b;
        const cell = isScud ? SCUD0 + (a > 0.5 ? 1 : 0) : big < 0.2 ? Math.floor(a * 5) : 2 + Math.floor(a * (HEAPS - 2));
        this.quad(n++, cam.position.x + x + rx * off, camY + y, cam.position.z + z + rz * off, rx, rz, ux, uy, uz, w * ws * (isScud ? 0.75 : 0.5), (isScud ? hh * 0.8 : hh) * (j === 0 ? 1 : 0.6 + 0.4 * b), cell, isScud ? b > 0.5 : flip);
      }
    }
    // Torn shreds lying flat on the deck's edge while it crosses the sky.
    for (const sgn of [1, -1]) {
      const eu = sgn > 0 ? this.deckE + TILE * 0.5 : this.deckE - DECK_L - TILE * 0.5;
      if (!dk.visible || Math.abs(eu) > DECK_E + 2) continue;
      for (let j = 0; j < EDGE_N && n < SLOTS * PARTS; j++) {
        const a = hash2(j + 0.4, 7.7), b = hash2(j + 0.9, 3.1), vv = (j - (EDGE_N - 1) / 2) * 2.6 + (a - 0.5), uu = eu + sgn * (0.5 * b - 0.9);
        const ex = (uu * wx - vv * wz) * HD, ez = (uu * wz + vv * wx) * HD;
        this.cnt[n] = 0;
        // Level card: width across the wind, "up" along it, out from the deck.
        this.quad(n++, cam.position.x + ex, camY + HD * 0.985, cam.position.z + ez, -wz, wx, wx * sgn, 0, wz * sgn, HD * (2.2 + 1.2 * a), HD * (2.6 + 1.4 * b), SCUD0 + (j & 1), a > 0.5);
      }
    }
    // The lit layer's own batch.
    let m = 0;
    if (this.litOn) {
      const P = this.pos.array as Float32Array, U = this.uv.array as Float32Array, P2 = this.litPos.array as Float32Array, U2 = this.litUv.array as Float32Array, cap = P2.length / 12;
      for (let q = 0; q < n; q++) for (let c2 = this.cnt[q]; c2 > 0 && m < cap; c2--, m++) { P2.set(P.subarray(q * 12, q * 12 + 12), m * 12); U2.set(U.subarray(q * 8, q * 8 + 8), m * 8); }
      if (m > 0) {
        this.heapsLit.geometry.setDrawRange(0, m * 6);
        this.litPos.clearUpdateRanges(); this.litPos.addUpdateRange(0, m * 12); this.litPos.needsUpdate = true;
        this.litUv.clearUpdateRanges(); this.litUv.addUpdateRange(0, m * 8); this.litUv.needsUpdate = true;
      }
    }
    S.blocker = 0; this.probeN = pn;
    S.quads = n; S.amount = this.amount; S.size = T[1]; S.dark = dark; S.deck = dOpS;
    this.heaps.visible = n > 0;
    this.heapsLit.visible = m > 0 && this.litOn;
    if (n > 0) {
      this.heaps.geometry.setDrawRange(0, n * 6);
      this.pos.clearUpdateRanges(); this.pos.addUpdateRange(0, n * 12); this.pos.needsUpdate = true;
      this.uv.clearUpdateRanges(); this.uv.addUpdateRange(0, n * 8); this.uv.needsUpdate = true;
    }
    const ms = performance.now() - t0;
    S.frames++; S.sumMs += ms; if (ms > S.maxMs) S.maxMs = ms;
  }
}

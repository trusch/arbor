import * as THREE from 'three';
import { ATLAS_W, ATLAS_H, BASE, CH, CW, DECK_S, ROWS, paintClouds, type CloudMap } from './cloudpaint';

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
const GRID = 12, SLOTS = GRID * GRID;
/** Seconds of opacity fade-in once the painted maps have arrived. */
const FADE_S = 1.5;
/** Night heap colour as a share of the live fog colour (plus the share a full moon adds); scud colour as a share of the deck colour, and its opacity. */
const NIGHT_BODY = 0.16, NIGHT_MOON = 0.12, SCUD_TONE = 0.8, SCUD_NIGHT = 0.6, SCUD_OPACITY = 0.5;
/** Low sun: share of the sun's light taken out of the body mix, and the gain of the sunlit side drawn over it. */
const LOW_SPLIT = 0.75, LOW_GAIN = 0.85;
/** Target share of slots shown, size factor and darkness per cloud type. */
const TYPES: Record<string, [number, number, number]> = {
  none: [0.07, 0.55, 0], cumulus: [0.5, 1, 0], stratocumulus: [0.95, 1.45, 0.12], stratus: [0, 1.2, 0.35],
  nimbostratus: [0.3, 1.3, 1], cumulonimbus: [0.8, 1.5, 0.55], fog: [0, 0.7, 0.1],
};

export interface CloudEnv {
  sunDir: THREE.Vector3; sunH: number; night: number; sunColor: THREE.Color; moonLight: number;
  /** weather.cloud (0..1), weather.cloudType, a running storm sequence, weather.flash, wind direction and cloudSpeed in m/s. */
  cloud: number; type: string; storm: boolean; flash: number; dirX: number; dirZ: number; speed: number;
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
  stats = { paintMs: 0, frames: 0, sumMs: 0, maxMs: 0, quads: 0, amount: 0, size: 1, dark: 0, deck: 0, tower: 0, blocker: 0 };
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
  private size = 1;
  private dark = 0;
  private stormK = 0;
  private litOn = false;
  /** Drift of the layer in layer heights (wraps at 2 BOX), and the weather clock for the slow breathing. */
  private ox = 0;
  private oz = 0;
  private t = 0;
  private lit = new THREE.Color();
  private shade = new THREE.Color();
  private tmp = new THREE.Color();

  constructor(decal: THREE.MeshBasicMaterial) {
    const cs = decal.map?.colorSpace ?? THREE.SRGBColorSpace;
    const atlas = this.atlas = dataTex(ATLAS_W, ATLAS_H, cs, false);
    this.deckTex = dataTex(DECK_S, DECK_S, cs, true);
    this.litTex = dataTex(ATLAS_W, ATLAS_H, cs, false);
    this.deckTex.repeat.set(9, 9);
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
    for (let i = 0; i < 4; i++) tuv.setXY(i, 0.5 + 0.5 * tuv.getX(i), (ROWS - 2 + tuv.getY(i)) / ROWS);
    this.tower = mk(tg, atlas, 3.2);
    const dg = new THREE.PlaneGeometry(1, 1);
    dg.rotateX(Math.PI / 2);
    this.deck = mk(dg, this.deckTex, 3.4);
    // Batched quads: position / normal / uv / index, like a PlaneGeometry (same attributes, same program).
    const N = SLOTS + 1, g = new THREE.BufferGeometry();
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
    this.heapsLit = mk(g, this.litTex, 3.62);
    (this.heapsLit.material as THREE.MeshBasicMaterial).side = decal.side;
  }

  /**
   * Paints the maps without blocking the page start: in a Web Worker (the bytes come back as transferred buffers);
   * where a worker cannot be started the painting runs on the main thread a few seconds after the start instead.
   */
  paint() {
    const t0 = performance.now();
    const local = () => setTimeout(() => { if (!this.ready) { const m = paintClouds(); this.setMaps(m.atlas, m.deck, m.lit, t0); } }, 4000);
    try {
      const w = new Worker(new URL('./cloudpaint.worker.ts', import.meta.url), { type: 'module' });
      w.onmessage = (e: MessageEvent<{ atlas: CloudMap; deck: CloudMap; lit: CloudMap }>) => { this.setMaps(e.data.atlas, e.data.deck, e.data.lit, t0); w.terminate(); };
      w.onerror = () => { w.terminate(); local(); };
      w.postMessage(0);
    } catch { local(); }
  }

  setMaps(atlas: CloudMap, deck: CloudMap, lit: CloudMap, t0 = performance.now()) {
    (this.litTex.image as { data: Uint8Array }).data = lit.d;
    this.litTex.needsUpdate = true;
    (this.atlas.image as { data: Uint8Array }).data = atlas.d;
    (this.deckTex.image as { data: Uint8Array }).data = deck.d;
    this.atlas.needsUpdate = this.deckTex.needsUpdate = true;
    this.ready = true;
    this.stats.paintMs = performance.now() - t0;
    performance.measure('clouds maps ready', { start: t0 });
  }

  /** One upright quad: centre of its base (camera-relative x, z; world y), half width along (rx, rz), height, atlas cell, mirrored. */
  private quad(q: number, cx: number, cy: number, cz: number, rx: number, rz: number, hw: number, hh: number, cell: number, flip: boolean) {
    const P = this.pos.array as Float32Array, U = this.uv.array as Float32Array, o = q * 12, u = q * 8;
    // The painted base line sits BASE up the cell: sink the quad so the base is at cy.
    const y0 = cy - hh * BASE, y1 = y0 + hh;
    P[o] = cx - rx * hw; P[o + 1] = y1; P[o + 2] = cz - rz * hw;
    P[o + 3] = cx + rx * hw; P[o + 4] = y1; P[o + 5] = cz + rz * hw;
    P[o + 6] = cx - rx * hw; P[o + 7] = y0; P[o + 8] = cz - rz * hw;
    P[o + 9] = cx + rx * hw; P[o + 10] = y0; P[o + 11] = cz + rz * hw;
    const u0 = (cell & 1) * 0.5, v1 = 1 - (cell >> 1) / ROWS, v0 = v1 - 1 / ROWS, ua = flip ? u0 + 0.5 : u0, ub = flip ? u0 : u0 + 0.5;
    U[u] = ua; U[u + 1] = v1; U[u + 2] = ub; U[u + 3] = v1; U[u + 4] = ua; U[u + 5] = v0; U[u + 6] = ub; U[u + 7] = v0;
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
    // Type targets ease (clouds grow and shrink over a few seconds); the first frame and a hidden-tab gap snap.
    const k = this.amount < 0 || dt > 1 ? 1 : 1 - Math.exp(-dt * 0.45);
    if (this.amount < 0) this.amount = 0;
    this.amount += (T[0] - this.amount) * k;
    this.size += (T[1] - this.size) * k;
    this.dark += (T[2] - this.dark) * k;
    this.stormK += ((E.storm ? 1 : 0) - this.stormK) * (k === 1 ? 1 : 1 - Math.exp(-dt * 0.8));
    const HD = Math.min(160, LAYER / Math.max(1e-5, E.fogDensity)), H = Math.min(100, HEAP_LAYER / Math.max(1e-5, E.fogDensity));
    // Drift: metres per second over a layer taken to be about 1100 m up.
    const sp = (E.speed / 1100) * dt, L = 2 * BOX;
    this.ox = (this.ox + E.dirX * sp) % L; this.oz = (this.oz + E.dirZ * sp) % L;

    // ---- light: lit colour (sun, warm when low), shade colour (sky light), both down to a moonlit grey at night ----
    const day = smooth(-0.1, 0.12, h), sunUp = smooth(-0.06, 0.1, h);
    // Night exposure is higher: keep night clouds faint.
    const nightL = (0.008 + 0.028 * E.moonLight) * (1 - day);
    this.lit.copy(E.sunColor).multiplyScalar(1.9 * sunUp * (0.55 + 0.45 * smooth(0, 0.35, h)));
    this.shade.setRGB(0.5, 0.58, 0.72).multiplyScalar(1.15 * day);
    // The painted shade is in the texture; the material colour is one mix of both lights. Under a deck the heaps grey.
    const mixLit = 0.72 * (1 - 0.8 * c);
    const flash = E.flash * 1.6;

    // ---- deck ----
    const dOp = smooth(0.34, 0.47, c);
    const dk = this.deck, dm = dk.material as THREE.MeshBasicMaterial;
    dk.visible = dOp > 0.01;
    S.deck = dOp;
    if (dk.visible) {
      dk.position.set(cam.position.x, cam.position.y + HD, cam.position.z);
      dk.scale.set(2 * DECK * HD, 1, 2 * DECK * HD);
      // Scroll with the same drift (texture v runs along world z after the rotation; 9 tiles over 2 DECK heights).
      const r = 9 / (2 * DECK);
      this.deckTex.offset.set((((-this.ox * r) % 1) + 1) % 1, (((-this.oz * r) % 1) + 1) % 1);
      // Mid grey for stratus, dark grey-blue for rain cloud and the storm; warm cast from a low sun.
      const g = 0.86 - 0.56 * smooth(0.5, 0.95, c);
      this.tmp.copy(this.shade).lerp(this.lit, 0.3).multiplyScalar(g);
      dm.color.setRGB(this.tmp.r + nightL + flash * 0.5, this.tmp.g + nightL * 1.1 + flash * 0.52, this.tmp.b + nightL * 1.3 + flash * 0.6);
      dm.opacity = dOp * fade;
    }

    // ---- storm tower: rises on the upwind side, then the deck closes over it ----
    const tw = this.tower, tm = tw.material as THREE.MeshBasicMaterial;
    const rise = this.stormK * smooth(0.0, 0.3, c);
    tw.visible = rise > 0.01;
    S.tower = rise;
    if (tw.visible) {
      tm.opacity = fade;
      const R = 6 * HD, top = (4 + 38 * rise) * DEG, wdt = 1.7 * R, hgt = R * (Math.tan(top) + 0.4) / 0.86;
      tw.position.set(cam.position.x - E.dirX * R, cam.position.y - 0.4 * R + hgt * 0.5 - hgt * 0.08, cam.position.z - E.dirZ * R);
      tw.scale.set(wdt, hgt, 1);
      tw.rotation.set(0, Math.atan2(E.dirX, E.dirZ), 0);
      this.tmp.copy(this.shade).lerp(this.lit, 0.6);
      tm.color.setRGB(this.tmp.r + nightL * 1.5 + flash, this.tmp.g + nightL * 1.6 + flash, this.tmp.b + nightL * 1.9 + flash * 1.1);
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
    this.tmp.copy(this.shade).lerp(this.lit, mixLit * (1 - LOW_SPLIT * low)).multiplyScalar(1 - 0.8 * dark);
    const F = E.fogColor, fl = 0.3 * F.r + 0.5 * F.g + 0.2 * F.b, nk = (NIGHT_BODY + NIGHT_MOON * E.moonLight) * (1 - day);
    let r = this.tmp.r + nk * (F.r + 0.4 * (fl - F.r)), g = this.tmp.g + nk * (F.g + 0.4 * (fl - F.g)), b = this.tmp.b + nk * (F.b + 0.4 * (fl - F.b));
    // Under a deck the heaps are scud: the deck's own colour a little darker (never lighter than what is behind them,
    // day or night, by construction) and half transparent, so they are soft shapes in the layer, not cut-outs.
    const scud = dk.visible ? dOp : 0, tone = SCUD_TONE + (SCUD_NIGHT - SCUD_TONE) * (1 - day);
    r += (dm.color.r * tone - r) * scud; g += (dm.color.g * tone - g) * scud; b += (dm.color.b * tone - b) * scud;
    hm.opacity = fade * (1 - (1 - SCUD_OPACITY) * scud);
    hm.color.setRGB(r + flash * 0.3 * (1 - scud), g + flash * 0.3 * (1 - scud), b + flash * 0.35 * (1 - scud));
    const lm = this.heapsLit.material as THREE.MeshBasicMaterial, lo = low * (1 - scud) * (1 - 0.8 * c);
    this.litOn = lo > 0.01;
    lm.opacity = fade * Math.min(1, lo * 1.1);
    lm.color.copy(this.lit).multiplyScalar(LOW_GAIN * (1 - 0.8 * dark));
    // The painted light side faces the sun, at night the moon.
    const Ld = h < -0.04 && E.moonLight > 0 ? E.moonDir : E.sunDir;
    const sx = Ld.x, sz = Ld.z;
    let n = 0;
    const amount = this.amount, size = this.size;
    // Heap shape → scud shape as the deck closes: the heaps shrink away, the shreds grow in (no shape pop).
    const isScud = scud > 0.5, swap = smooth(0, 0.7, Math.abs(scud - 0.5) * 2);
    for (let i = 0; i < SLOTS; i++) {
      const h1 = hash2(i, 3.7), h2 = hash2(i, 9.1), h3 = hash2(i, 17.3), h4 = hash2(i, 23.9);
      // Jittered lattice, drifting and wrapping around the camera.
      const gx = ((i % GRID) + 0.1 + 0.8 * h1) / GRID, gz = (Math.floor(i / GRID) + 0.1 + 0.8 * h2) / GRID;
      let x = ((gx * L + this.ox) % L + L) % L - BOX, z = ((gz * L + this.oz) % L + L) % L - BOX;
      // A slot is shown when its rank is under the amount; it grows over a band of 0.14, so cover changes cloud by cloud.
      const rank = (i * 0.618034) % 1;
      let s = smooth(rank - 0.07, rank + 0.07, amount * 1.07) * smooth(0, 0.04, amount) * swap;
      // Shrinks to nothing at the wrap edge.
      s *= smooth(BOX, BOX - 2.5, Math.max(Math.abs(x), Math.abs(z)));
      if (s < 0.02) continue;
      const r = Math.hypot(x, z);
      // Nearly overhead an upright card would be seen from below: none there (the app camera never looks that high).
      s *= smooth(1.2, 2.2, r);
      if (s < 0.02) continue;
      x *= H; z *= H;
      // Slow change of shape: width and height breathe out of step.
      const br = 1 + 0.1 * Math.sin(this.t * (0.11 + 0.1 * h3) + h4 * 6.28), bh = 1 + 0.12 * Math.sin(this.t * (0.09 + 0.08 * h4) + h3 * 6.28);
      const w = H * (0.85 + 1.0 * h3) * size * s * br;
      // Flatter toward the horizon (seen more from the side, through more air).
      const flat = 0.62 + 0.38 * smooth(9, 2.5, r);
      const hh = w * (CH / CW) * 1.25 * flat * bh * (0.75 + 0.25 * s);
      const rx = -z / (r * H), rz = x / (r * H);
      // Painted light comes from the left of the sprite: mirror it when the sun is to the right of this cloud.
      const flip = rx * sx + rz * sz > 0;
      this.quad(n++, cam.position.x + x, cam.position.y + H * (1 - 0.1 * h4), cam.position.z + z, rx, rz, w * (isScud ? 0.75 : 0.5), isScud ? hh * 0.8 : hh, isScud ? 4 + (i & 1) : i % 3, isScud ? h3 > 0.5 : flip);
    }
    // Sun blocker: one heap that forms in front of the sun as the model's passing-cloud dimming comes on, and drifts
    // across it; only while the sun is up and the deck is open.
    const blk = smooth(0.03, 0.22, c) * (1 - dOp) * smooth(0.02, 0.12, h) * smooth(0, 0.05, amount);
    S.blocker = blk;
    if (blk > 0.02) {
      const bx = E.sunDir.x, bz = E.sunDir.z, hl = Math.hypot(bx, bz) || 1, ax = bx / hl, az = bz / hl, R = 5 * H;
      const rx = -az, rz = ax, along = rx * E.dirX + rz * E.dirZ;
      const w = R * 0.42 * (0.5 + 0.5 * blk) * Math.max(1, size * 0.85), hh = w * 0.62;
      const slide = (0.5 - blk) * 0.35 * R * (along >= 0 ? -1 : 1);
      const cy = cam.position.y + (R * E.sunDir.y) / hl - hh * 0.3;
      this.quad(n++, cam.position.x + ax * R + rx * slide, cy, cam.position.z + az * R + rz * slide, rx, rz, w * 0.5, hh, 1, false);
    }
    S.quads = n; S.amount = amount; S.size = size; S.dark = dark;
    this.heaps.visible = n > 0;
    this.heapsLit.visible = n > 0 && this.litOn;
    if (n > 0) {
      this.heaps.geometry.setDrawRange(0, n * 6);
      this.pos.clearUpdateRanges(); this.pos.addUpdateRange(0, n * 12); this.pos.needsUpdate = true;
      this.uv.clearUpdateRanges(); this.uv.addUpdateRange(0, n * 8); this.uv.needsUpdate = true;
    }
    const ms = performance.now() - t0;
    S.frames++; S.sumMs += ms; if (ms > S.maxMs) S.maxMs = ms;
  }
}

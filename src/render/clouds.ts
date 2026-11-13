import * as THREE from 'three';

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
function vnoise(x: number, y: number, wrap = 0) {
  const xi = Math.floor(x), yi = Math.floor(y), fx = x - xi, fy = y - yi;
  const u = fx * fx * (3 - 2 * fx), v = fy * fy * (3 - 2 * fy);
  const w = (a: number) => (wrap ? ((a % wrap) + wrap) % wrap : a);
  const x0 = w(xi), x1 = w(xi + 1), y0 = w(yi), y1 = w(yi + 1);
  return (hash2(x0, y0) * (1 - u) + hash2(x1, y0) * u) * (1 - v) + (hash2(x0, y1) * (1 - u) + hash2(x1, y1) * u) * v;
}
/** 4 octaves; `wrap` = period of the first octave in cells (0 = none). */
function fbm(x: number, y: number, wrap = 0) {
  let s = 0, a = 0.5;
  for (let o = 0; o < 4; o++) { s += a * vnoise(x, y, wrap); x *= 2; y *= 2; wrap *= 2; a *= 0.5; }
  return s / 0.9375;
}

/** Atlas: 2 x 2 cells of CW x CH. Cells 0..2 = cumulus heaps (light from the upper left), cell 3 = storm tower. */
const CW = 256, CH = 128;
const BASE = 0.2; // flat base line, as a fraction of the cell height from the bottom

function paintAtlas() {
  const W = CW * 2, H = CH * 2, d = new Uint8Array(W * H * 4);
  for (let cell = 0; cell < 4; cell++) {
    const ox = (cell & 1) * CW, oy = (cell >> 1) * CH, tower = cell === 3;
    // Blobs: x, y (0..1 in the cell, y up), radius (in cell heights).
    const blobs: [number, number, number][] = [];
    let s = 11 + cell * 7.3;
    const rnd = () => { s = (s * 16807) % 2147483647; return (s % 100000) / 100000; };
    for (let i = 0; i < 40; i++) rnd();
    if (tower) {
      // A wide dark body, a rising column, an anvil spreading at the top.
      for (let i = 0; i < 14; i++) blobs.push([0.12 + 0.76 * (i / 13), 0.2 + 0.1 * rnd(), 0.22 + 0.08 * rnd()]);
      for (let i = 0; i < 9; i++) blobs.push([0.5 + 0.12 * (rnd() - 0.5) - 0.05 * (i / 8), 0.3 + 0.42 * (i / 8), 0.2 - 0.05 * (i / 8) + 0.05 * rnd()]);
      for (let i = 0; i < 11; i++) blobs.push([0.2 + 0.62 * (i / 10), 0.76 + 0.04 * rnd(), 0.1 + 0.05 * rnd()]);
    } else {
      const n = 9 + cell * 2, wide = 0.26 + 0.05 * cell;
      for (let i = 0; i < n; i++) {
        const u = (i + 0.5) / n, x = 0.5 + (u - 0.5) * 2 * wide + 0.05 * (rnd() - 0.5);
        // Tallest in the middle, low shoulders: a heap.
        const hgt = (1 - Math.pow(Math.abs(u - 0.5) * 2, 1.7)) * (0.3 + 0.2 * rnd()) + 0.06;
        blobs.push([x, BASE + 0.1 + hgt * 0.5, 0.15 + hgt * 0.42]);
        if (rnd() > 0.4) blobs.push([x + 0.06 * (rnd() - 0.5), BASE + 0.14 + hgt, 0.09 + 0.1 * rnd()]);
      }
    }
    const asp = CW / CH;
    for (let j = 0; j < CH; j++) for (let i = 0; i < CW; i++) {
      const x = (i + 0.5) / CW, y = 1 - (j + 0.5) / CH;
      // Billowy edge: the sample point is displaced by noise before the blob test.
      const nx = fbm(x * 9 + cell * 5, y * 5), ny = fbm(x * 9 + 31, y * 5 + cell * 3), fine = fbm(x * 30, y * 15 + cell);
      const px = x + 0.035 * (nx - 0.5), py = y + 0.07 * (ny - 0.5);
      let den = 0;
      for (const [bx, by, br] of blobs) {
        const dx = (px - bx) * asp, dy = py - by, q = 1 - Math.sqrt(dx * dx + dy * dy) / br;
        if (q > 0) den += q * q * (3 - 2 * q) * 1.4;
      }
      den += 0.6 * (fine - 0.5) * (1 - smooth(0.8, 2, den));
      let a = smooth(0.33, 0.63, den);
      // Flat base (cumulus) / ragged foot (tower); nothing touches the cell border (mips of neighbours stay clean).
      const baseY = tower ? 0.08 : BASE + 0.025 * (nx - 0.5);
      a *= smooth(baseY - 0.012, baseY + (tower ? 0.1 : 0.03), y);
      a *= smooth(0, 0.04, x) * smooth(1, 0.96, x) * smooth(1, 0.95, y);
      // Shade: bright where the heap is thin toward the upper left (the lit side), grey-blue toward the base and the
      // lower right, darker in the creases between billows.
      const up = Math.min(1, Math.max(0, (y - baseY) / (tower ? 0.8 : 0.5)));
      const edge = 1 - smooth(0.4, tower ? 2.4 : 1.5, den), bil = fbm(x * 16 + cell * 3, y * 9 + 5);
      let b: number;
      if (tower) {
        // Dark body, bright rim along the upper outline, a little structure inside.
        b = 0.2 + 0.12 * up + 0.16 * (bil - 0.5) + 0.8 * edge * edge * smooth(0.2, 0.6, up);
      } else {
        const side = (0.5 - x) * 0.5 + (up - 0.5) * 0.7;
        b = 0.8 + 0.2 * smooth(-0.3, 0.2, side + 0.5 * (nx - 0.5)) + 0.06 * edge - 0.34 * (1 - smooth(0.0, 0.45, up)) + 0.3 * (bil - 0.5) + 0.08 * (fine - 0.5);
      }
      b = Math.min(1, Math.max(0.08, b));
      const o = ((oy + j) * W + ox + i) * 4;
      // sRGB bytes: white tops, grey-blue shade.
      d[o] = 255 * b * (0.84 + 0.16 * b);
      d[o + 1] = 255 * b * (0.9 + 0.1 * b);
      d[o + 2] = 255 * b;
      d[o + 3] = 255 * a;
    }
  }
  return { d, W, H };
}

/** Tileable layer for the deck: soft rolls in grey, alpha never far below 1 (a ceiling, not separate clouds). */
function paintDeck() {
  const S = 256, d = new Uint8Array(S * S * 4);
  for (let j = 0; j < S; j++) for (let i = 0; i < S; i++) {
    const x = i / S, y = j / S;
    const wv = fbm(x * 4 + 3 * fbm(x * 4 + 9, y * 4, 4), y * 4 + 7, 4), fine = fbm(x * 16, y * 16, 16);
    const v = 0.62 * wv + 0.38 * fine, b = 0.72 + 0.28 * smooth(0.3, 0.75, v);
    const o = (j * S + i) * 4;
    d[o] = 255 * b * 0.95; d[o + 1] = 255 * b * 0.975; d[o + 2] = 255 * b;
    d[o + 3] = 255 * (0.8 + 0.2 * smooth(0.25, 0.6, v));
  }
  return { d, W: S, H: S };
}

function dataTex(p: { d: Uint8Array; W: number; H: number }, cs: string, repeat: boolean) {
  // Painted top row first; a data texture's first row is v = 0: reverse the rows here.
  const f = new Uint8Array(p.d.length), row = p.W * 4;
  for (let j = 0; j < p.H; j++) f.set(p.d.subarray(j * row, (j + 1) * row), (p.H - 1 - j) * row);
  const t = new THREE.DataTexture(f, p.W, p.H, THREE.RGBAFormat);
  t.colorSpace = cs as THREE.ColorSpace;
  t.generateMipmaps = true;
  t.minFilter = THREE.LinearMipmapLinearFilter;
  t.magFilter = THREE.LinearFilter;
  if (repeat) t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.needsUpdate = true;
  return t;
}

/** Layer height above the camera x fog density (see the header): fog fraction 1 - exp(-(LAYER / sin(elevation))^2). */
const LAYER = 0.05, HEAP_LAYER = 0.032;
/** Half side of the square of slots around the camera, and of the deck plane, in layer heights. */
const BOX = 10, DECK = 30;
const GRID = 12, SLOTS = GRID * GRID;
/** Target share of slots shown, size factor and darkness per cloud type. */
const TYPES: Record<string, [number, number, number]> = {
  none: [0.07, 0.55, 0], cumulus: [0.5, 1, 0], stratocumulus: [0.95, 1.45, 0.12], stratus: [0, 1.2, 0.35],
  nimbostratus: [0.5, 1.1, 0.72], cumulonimbus: [0.8, 1.5, 0.55], fog: [0.1, 0.7, 0.1],
};

export interface CloudEnv {
  sunDir: THREE.Vector3; sunH: number; night: number; sunColor: THREE.Color; moonLight: number;
  /** weather.cloud (0..1), weather.cloudType, a running storm sequence, weather.flash, wind direction and cloudSpeed in m/s. */
  cloud: number; type: string; storm: boolean; flash: number; dirX: number; dirZ: number; speed: number;
  fogDensity: number; lowQ: boolean;
}

export class Clouds {
  group = new THREE.Group();
  heaps: THREE.Mesh;
  deck: THREE.Mesh;
  tower: THREE.Mesh;
  /** Mean JS cost per frame = sumMs / frames; quads = cumulus quads this frame; amount / size = eased type targets. */
  stats = { frames: 0, sumMs: 0, maxMs: 0, quads: 0, amount: 0, size: 1, dark: 0, deck: 0, tower: 0, blocker: 0 };
  private pos: THREE.BufferAttribute;
  private uv: THREE.BufferAttribute;
  private deckTex: THREE.Texture;
  private amount = -1;
  private size = 1;
  private dark = 0;
  private stormK = 0;
  /** Drift of the layer in layer heights (wraps at 2 BOX), and the weather clock for the slow breathing. */
  private ox = 0;
  private oz = 0;
  private t = 0;
  private lit = new THREE.Color();
  private shade = new THREE.Color();
  private tmp = new THREE.Color();

  constructor(decal: THREE.MeshBasicMaterial) {
    const cs = decal.map?.colorSpace ?? THREE.SRGBColorSpace;
    const atlas = dataTex(paintAtlas(), cs, false);
    this.deckTex = dataTex(paintDeck(), cs, true);
    this.deckTex.repeat.set(9, 9);
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
    const u0 = (cell & 1) * 0.5, v1 = 1 - (cell >> 1) * 0.5, v0 = v1 - 0.5, ua = flip ? u0 + 0.5 : u0, ub = flip ? u0 : u0 + 0.5;
    U[u] = ua; U[u + 1] = v1; U[u + 2] = ub; U[u + 3] = v1; U[u + 4] = ua; U[u + 5] = v0; U[u + 6] = ub; U[u + 7] = v0;
  }

  /** Once per frame, right before `render` and after `Stage.applyWeather` (it reads the live fog density). */
  frame(cam: THREE.PerspectiveCamera, E: CloudEnv, dt: number) {
    const t0 = performance.now(), S = this.stats;
    this.t += dt;
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
    const nightL = (0.012 + 0.05 * E.moonLight) * (1 - day);
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
      const g = 0.86 - 0.52 * smooth(0.5, 1, c);
      this.tmp.copy(this.shade).lerp(this.lit, 0.3).multiplyScalar(g);
      dm.color.setRGB(this.tmp.r + nightL + flash * 0.5, this.tmp.g + nightL * 1.1 + flash * 0.52, this.tmp.b + nightL * 1.3 + flash * 0.6);
      dm.opacity = dOp;
    }

    // ---- storm tower: rises on the upwind side, then the deck closes over it ----
    const tw = this.tower, tm = tw.material as THREE.MeshBasicMaterial;
    const rise = this.stormK * smooth(0.0, 0.3, c);
    tw.visible = rise > 0.01;
    S.tower = rise;
    if (tw.visible) {
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
    this.tmp.copy(this.shade).lerp(this.lit, mixLit).multiplyScalar(1 - 0.72 * dark);
    hm.color.setRGB(this.tmp.r + nightL + flash * 0.3, this.tmp.g + nightL * 1.1 + flash * 0.3, this.tmp.b + nightL * 1.3 + flash * 0.35);
    const sx = E.sunDir.x, sz = E.sunDir.z;
    let n = 0;
    const amount = this.amount, size = this.size;
    for (let i = 0; i < SLOTS; i++) {
      const h1 = hash2(i, 3.7), h2 = hash2(i, 9.1), h3 = hash2(i, 17.3), h4 = hash2(i, 23.9);
      // Jittered lattice, drifting and wrapping around the camera.
      const gx = ((i % GRID) + 0.1 + 0.8 * h1) / GRID, gz = (Math.floor(i / GRID) + 0.1 + 0.8 * h2) / GRID;
      let x = ((gx * L + this.ox) % L + L) % L - BOX, z = ((gz * L + this.oz) % L + L) % L - BOX;
      // A slot is shown when its rank is under the amount; it grows over a band of 0.14, so cover changes cloud by cloud.
      const rank = (i * 0.618034) % 1;
      let s = smooth(rank - 0.07, rank + 0.07, amount * 1.07);
      // Shrinks to nothing at the wrap edge.
      s *= smooth(BOX, BOX - 2.5, Math.max(Math.abs(x), Math.abs(z)));
      if (s < 0.02) continue;
      const r = Math.hypot(x, z);
      if (r < 0.6) continue;
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
      this.quad(n++, cam.position.x + x, cam.position.y + H * (1 - 0.1 * h4), cam.position.z + z, rx, rz, w * 0.5, hh, i % 3, flip);
    }
    // Sun blocker: one heap that forms in front of the sun as the model's passing-cloud dimming comes on, and drifts
    // across it; only while the sun is up and the deck is open.
    const blk = smooth(0.03, 0.22, c) * (1 - dOp) * smooth(0.02, 0.12, h);
    S.blocker = blk;
    if (blk > 0.02) {
      const hl = Math.hypot(sx, sz) || 1, ax = sx / hl, az = sz / hl, R = 5 * H;
      const rx = -az, rz = ax, along = rx * E.dirX + rz * E.dirZ;
      const w = R * 0.42 * (0.5 + 0.5 * blk) * Math.max(1, size * 0.85), hh = w * 0.62;
      const slide = (0.5 - blk) * 0.35 * R * (along >= 0 ? -1 : 1);
      const cy = cam.position.y + (R * E.sunDir.y) / hl - hh * 0.3;
      this.quad(n++, cam.position.x + ax * R + rx * slide, cy, cam.position.z + az * R + rz * slide, rx, rz, w * 0.5, hh, 1, false);
    }
    S.quads = n; S.amount = amount; S.size = size; S.dark = dark;
    this.heaps.visible = n > 0;
    if (n > 0) {
      this.heaps.geometry.setDrawRange(0, n * 6);
      this.pos.clearUpdateRanges(); this.pos.addUpdateRange(0, n * 12); this.pos.needsUpdate = true;
      this.uv.clearUpdateRanges(); this.uv.addUpdateRange(0, n * 8); this.uv.needsUpdate = true;
    }
    const ms = performance.now() - t0;
    S.frames++; S.sumMs += ms; if (ms > S.maxMs) S.maxMs = ms;
  }
}

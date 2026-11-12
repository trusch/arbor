import * as THREE from 'three';
import type { TreeSim } from '../sim/tree';
import { Rng } from '../sim/rng';
import { wind } from '../wind';
import { cleanLeafTexture, NIGHT_DESAT, NIGHT_GREY } from './leaves';
import { makeTuftTexture, makeFlowerTexture, makeTreeTexture, makeBareTreeTexture, type FlowerKind } from './textures';
import { season } from '../season';
import { landSeason, landKey, bloom, treeSeason, type LandSeason, type TreeSeason } from './landseason';
import { plantScenery } from './backdrop';

/**
 * Living meadow (audit WP3): grass tufts and wildflowers around the tree, rippling in travelling gusts.
 *
 * PowerVR rule (audit 3.1): every mesh here is a P-LEAF object. Its material is a clone of the live safe leaf material
 * with only `map` swapped, the geometry has position/normal/uv only, the mesh is an InstancedMesh with instanceColor,
 * castShadow = receiveShadow = false. So the phone compiles no new program (smoke asserts the program count).
 * Motion is CPU-only and uploads nothing: tufts are sorted into PHASES meshes by their distance along the wind, and each
 * mesh's object matrix is a shear (x += kx·y, z += kz·y) from `wind.gust` at its phase, which bends tips and keeps roots.
 * Lighting comes from the Lambert shader with up normals (same as the ground); the instance colour carries the tint
 * variation and the canopy shade (march through the sim light grid toward the sun), rebaked a few patches per frame.
 */
const PHASES = 24; // 8 bands x 3 interleaved groups along the wind
const R_DISC = 14, R_FAR = 26;
/** Shade field resolution and half extent (m); ms of bake work per frame. */
const SG = 112, SE = R_FAR + 1, FRAME_BUDGET_MS = 1;
const GRASS_MAX = 26000, FLOWER_MAX = 800;
/** Far meadow (backdrop): larger, sparser tufts and flower clumps from R_NEAR_FAR out to R_BACK, where they have shrunk
 *  into the ground. All of it lies inside the flat radius of the terrain (`R_FLAT` in backdrop.ts), so y = 0 holds. */
/** Instance colour gain of the backdrop trees (tuned in screenshots against the oak and the ground). */
const SCENE_GAIN = [0.62, 0.6, 0.8];
const R_BACK = 64, FAR_GRASS = 4, FAR_GRASS_MAX = 20000, FAR_FLOWER_MAX = 900;
const KINDS: FlowerKind[] = ['daisy', 'buttercup', 'poppy', 'clover'];
/** Floats per instance: x, z, rot, width, height, hashA, hashB, r. */
const STRIDE = 8;

/** Mean linear RGB of the opaque texels of a canvas map (the night grade works on instance colour x this). */
function mapMean(map: THREE.Texture): number[] {
  const img = map.image as HTMLCanvasElement, d = img.getContext('2d')!.getImageData(0, 0, img.width, img.height).data;
  let r = 0, g = 0, b = 0, n = 0;
  for (let i = 0; i < d.length; i += 16) if (d[i + 3] >= 128) { r += d[i]; g += d[i + 1]; b += d[i + 2]; n++; }
  const c = new THREE.Color(0.5, 0.6, 0.4);
  if (n) c.setRGB(r / n / 255, g / n / 255, b / n / 255, THREE.SRGBColorSpace);
  return [Math.max(0.02, c.r), Math.max(0.02, c.g), Math.max(0.02, c.b)];
}
/** Moonlit dim per kind on top of the shared desaturation (grass, flowers, scenery trees), tuned in night screenshots against the crown. */
const NIGHT_DIM = { grass: 1.1, flower: 0.7, scenery: 0.9 };
/** Seasonal grass targets as linear RGB of unit luminance x a luminance gain: spring flush, autumn straw, winter straw-grey-green. */
const unitLum = (hex: number, gain: number) => { const c = new THREE.Color(hex), l = (0.3 * c.r + 0.59 * c.g + 0.11 * c.b) / gain; return [c.r / l, c.g / l, c.b / l]; };
const G_FRESH = unitLum(0x7cc23c, 1.18), G_STRAW = unitLum(0xd8c070, 1.45), G_WINTER = unitLum(0x9a9870, 0.9);
/** Bloom order of the species in KINDS (see `bloom`). */
const BLOOM_K = [0, 0.5, 2, 1];
/** Instance colour of the bare winter crowns (their map is already grey-brown). */
const BARE_GAIN = [0.95, 0.88, 0.7];

export interface MeadowLight {
  /** Toward the key light, world space, normalised. */
  sunDir: THREE.Vector3;
  /** Key colour x intensity and hemisphere sky colour x intensity (linear). */
  sunCol: THREE.Color;
  hemi: THREE.Color;
  night: number;
  /** Ground tint (params.sky.groundHue / groundTint). */
  tintHue: number;
  tint: number;
  /** Fraction of the full instance set to draw (Low 0.3, High 1; halved when the pixel ratio stepped down). */
  frac: number;
}

interface Patch {
  mesh: THREE.InstancedMesh;
  data: Float32Array;
  n: number;
  flower: boolean;
  /** Far-meadow patch: no crown shade, rim colours. */
  far: boolean;
  /** Trees and bushes of the backdrop: static (no wind shear), always all drawn, slot 7 holds the ground height. */
  scenery: boolean;
  /** Phase slot whose shear this patch uses. */
  phase: number;
  /** Scenery: the bare winter crowns (same instances as the leafed patch three slots before). */
  bare: boolean;
  /** Flower species index in KINDS, -1 otherwise. */
  kind: number;
  /** Instances shown by the last bake and the sum of their instance colours (reports, smoke). */
  shown: number;
  sum: number[];
}

/** 3 crossed cards, each with a reversed-winding back copy (FrontSide shows both faces); normals straight up. 12 tris. */
function crossCardGeometry(): THREE.BufferGeometry {
  const P: number[] = [], N: number[] = [], U: number[] = [];
  for (let k = 0; k < 3; k++) {
    const a = (k / 3) * Math.PI, cx = Math.cos(a) * 0.5, cz = Math.sin(a) * 0.5;
    const v = [[-cx, 0, -cz, 0, 0], [cx, 0, cz, 1, 0], [cx, 1, cz, 1, 1], [-cx, 1, -cz, 0, 1]];
    for (const idx of [[0, 1, 2], [0, 2, 3], [0, 2, 1], [0, 3, 2]]) for (const i of idx) {
      P.push(v[i][0], v[i][1], v[i][2]); N.push(0, 1, 0); U.push(v[i][3], v[i][4]);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(P, 3));
  g.setAttribute('normal', new THREE.Float32BufferAttribute(N, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(U, 2));
  return g;
}

const hash2 = (x: number, z: number) => { const s = Math.sin(x * 127.1 + z * 311.7) * 43758.5453; return s - Math.floor(s); };
/** Smooth value noise 0..1. */
function vnoise(x: number, z: number) {
  const ix = Math.floor(x), iz = Math.floor(z), fx = x - ix, fz = z - iz;
  const ux = fx * fx * (3 - 2 * fx), uz = fz * fz * (3 - 2 * fz);
  const a = hash2(ix, iz), b = hash2(ix + 1, iz), c = hash2(ix, iz + 1), d = hash2(ix + 1, iz + 1);
  return a + (b - a) * ux + (c - a) * uz + (a - b - c + d) * ux * uz;
}
const smooth = (a: number, b: number, v: number) => { const t = Math.min(1, Math.max(0, (v - a) / (b - a))); return t * t * (3 - 2 * t); };

export class Meadow {
  /** Add this to the scene (a group, so code that sweeps the scene's direct InstancedMesh children leaves it alone). */
  readonly group = new THREE.Group();
  private patches: Patch[] = [];
  private kx = new Float32Array(PHASES);
  private kz = new Float32Array(PHASES);
  private phaseD = new Float32Array(PHASES);
  private dirty: number[] = [];
  private key = '';
  private seasonKey = -1;
  private LS: LandSeason = { fresh: 0, straw: 0, winter: 0, height: 1 };
  private TS: TreeSeason = { leaf: 1, bare: false, pale: 0, turn: 0, dry: 0, shade: 0, brown: false };
  private trunkKey = '';
  /** Far-meadow and scenery patches depend on the light only, not on the crown shade or the trunk: they are large
   *  (thousands of instances each), so they are rebaked only when the light key changes. */
  private neverBaked = true;
  private nearPatches() { const out: number[] = []; this.patches.forEach((p, i) => { if (!p.far) out.push(i); }); return out; }
  private lightKeyT = -1e9;
  private lightVersion = -1;
  private L: MeadowLight | null = null;
  /** Shade field: transmission straight up and toward the sun on a SG² grid over ±SE m, blurred; tufts sample it bilinearly. */
  private shUp = new Float32Array(SG * SG).fill(1);
  private shSun = new Float32Array(SG * SG).fill(1);
  private bkUp = new Float32Array(SG * SG);
  private bkSun = new Float32Array(SG * SG);
  private shTmp = new Float32Array(SG * SG);
  private shKey = '';
  /** Row being filled in the back buffers; -1 = idle. The sun direction of the fill in flight is in fillSun. */
  private fillRow = -1;
  private fillSun = [0, 1, 0];
  private fillCol = -1;
  private blurStage = 0;
  /** Cell rectangle of the fill in flight: i0, i1, row0, row1 (inclusive). */
  private rect = [0, -1, 0, -1];
  private col = new THREE.Color();
  private tintCol = new THREE.Color();
  /** Drawn instance counts (for reports and tests). */
  counts = { grass: 0, flowers: 0, meshes: 0 };
  /** Bake timings (ms): last patch, max patch, patches baked, longest per-frame slice (shade rows or patches). */
  stats = { lastMs: 0, maxMs: 0, bakes: 0, sliceMaxMs: 0, sumMs: 0, seasonRebakes: 0 };

  /** `leafMaterial`: the live leaf material. When it is the safe Lambert/basic one it is cloned (same program). */
  constructor(leafMaterial: THREE.Material, seed = 7, far = true) {
    const safe = (leafMaterial as THREE.MeshLambertMaterial).isMeshLambertMaterial || (leafMaterial as THREE.MeshBasicMaterial).isMeshBasicMaterial;
    const material = (map: THREE.Texture, preserve = false) => {
      const tex = cleanLeafTexture(map, preserve);
      let m: THREE.MeshLambertMaterial;
      if (safe) m = leafMaterial.clone() as THREE.MeshLambertMaterial;
      // Full leaf path (desktop): no live safe material exists, so build the same configuration (safe leaf V0).
      else m = new THREE.MeshLambertMaterial({ side: THREE.FrontSide, map: tex, alphaTest: 0.5 });
      m.map = tex;
      m.userData.mean = mapMean(map);
      // GTAO g-buffer material with the alpha cut-out (High only; never compiled on Low). See Post.
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
      return { m, gb };
    };
    const geo = crossCardGeometry();
    const rng = new Rng(seed);
    const half = R_DISC + 1, slot = (2 * half) / PHASES;
    for (let p = 0; p < PHASES; p++) this.phaseD[p] = -half + (p + 0.5) * slot;
    const phaseOf = (x: number, z: number) => Math.min(PHASES - 1, Math.max(0, Math.floor((wind.along(x, z) + half + rng.range(-0.5, 0.5)) / slot)));
    const lists: number[][] = [];
    const push = (li: number, x: number, z: number, w: number, h: number) => {
      (lists[li] ??= []).push(x, z, rng.next() * Math.PI, w, h, rng.next(), rng.next(), Math.hypot(x, z));
    };

    // Grass: 30 % in a core that thickens toward the tree (density exp(-r / 6)), 70 % spread evenly over the whole disc so
    // the foreground of a portrait frame is as covered as the middle; both thin out between R_DISC and R_FAR.
    for (let i = 0; i < GRASS_MAX; i++) {
      let r: number;
      if (rng.next() < 0.3) do r = -6 * Math.log(Math.max(1e-9, rng.next() * rng.next())); while (r > R_FAR);
      else do r = R_FAR * Math.sqrt(rng.next()); while (rng.next() > 1 - 0.9 * smooth(R_DISC + 2, R_FAR, r));
      const a = rng.next() * Math.PI * 2, x = Math.cos(a) * r, z = Math.sin(a) * r;
      const tall = rng.next() < 0.16;
      // Far tufts are larger so coverage holds where the density drops.
      // Past the disc they shrink away again, so the meadow has no edge: it thins and sinks into the ground texture.
      const edge = 1 - 0.65 * smooth(R_DISC + 4, R_FAR + 1, r);
      const far = (1 + Math.min(r, R_DISC) / 11) * edge;
      const w = rng.range(0.26, 0.5) * far, h = (tall ? rng.range(0.34, 0.5) : rng.range(0.13, 0.3)) * (1 + r / 22) * edge;
      const ph = r > R_DISC ? Math.floor(rng.next() * PHASES) : phaseOf(x, z);
      push(ph, x, z, w, h);
    }
    // Flowers: clusters; 2 patches per species, split by gust phase so each follows a nearby grass patch.
    KINDS.forEach((_, s) => {
      let left = Math.round(FLOWER_MAX * [1, 1, 0.45, 0.8][s]); // poppies are the rare accent
      while (left > 0) {
        const cr = 1.6 + 11 * Math.sqrt(rng.next()), ca = rng.next() * Math.PI * 2;
        const cxp = Math.cos(ca) * cr, czp = Math.sin(ca) * cr, spread = rng.range(0.35, 1.3);
        const n = Math.min(left, 5 + Math.floor(rng.next() * rng.next() * 40));
        for (let i = 0; i < n; i++) {
          const x = cxp + (rng.next() + rng.next() - 1) * spread * 1.4, z = czp + (rng.next() + rng.next() - 1) * spread * 1.4;
          const h = rng.range(0.2, 0.38) * (s === 3 ? 0.7 : 1) * (1 + Math.hypot(x, z) / 28);
          push(PHASES + s * 2 + (phaseOf(x, z) % 6 < 3 ? 0 : 1), x, z, h * 0.8, h);
        }
        left -= n;
      }
    });
    // Far meadow: its own rng, so the near placement is the same with and without it. Density falls off about
    // exponentially from the edge of the near disc, clump width grows with distance to hold the coverage at a glancing
    // angle, and the last 16 m shrink into the ground like the near rim does.
    const NEAR = PHASES + KINDS.length * 2;
    if (far) {
      const r2 = new Rng(seed + 101);
      const put = (li: number, x: number, z: number, w: number, h: number) => {
        (lists[li] ??= []).push(x, z, r2.next() * Math.PI, w, h, r2.next(), r2.next(), Math.hypot(x, z));
      };
      for (let i = 0; i < FAR_GRASS_MAX; i++) {
        let r: number;
        do r = 13 + (R_BACK - 13) * r2.next(); while (r2.next() > (r / 30) * Math.exp(-(r - 13) / 12) * smooth(12, 20, r) * 2.2);
        const a = r2.next() * Math.PI * 2, edge = 1 - 0.8 * smooth(R_BACK - 18, R_BACK, r);
        const tall = r2.next() < 0.2, grow = 1 + (r - 13) / 16;
        put(NEAR + (i % FAR_GRASS), Math.cos(a) * r, Math.sin(a) * r, r2.range(0.6, 1.1) * grow * (0.5 + 0.5 * edge), (tall ? r2.range(0.4, 0.6) : r2.range(0.2, 0.36)) * (1 + r / 45) * edge);
      }
      // Flower clumps as specks of colour: daisies, buttercups, a few poppies.
      for (let s = 0; s < 3; s++) {
        let left = Math.round(FAR_FLOWER_MAX * [0.45, 0.4, 0.15][s]);
        while (left > 0) {
          const cr = 13 + 40 * Math.pow(r2.next(), 1.5), ca = r2.next() * Math.PI * 2, spread = r2.range(1, 3.5);
          const n = Math.min(left, 4 + Math.floor(r2.next() * r2.next() * 30));
          for (let i = 0; i < n; i++) {
            const x = Math.cos(ca) * cr + (r2.next() + r2.next() - 1) * spread * 1.6, z = Math.sin(ca) * cr + (r2.next() + r2.next() - 1) * spread;
            const h = r2.range(0.3, 0.46) * (1 + Math.hypot(x, z) / 40);
            put(NEAR + FAR_GRASS + s, x, z, h * 1.1, h);
          }
          left -= n;
        }
      }
    }
    const SCN = NEAR + FAR_GRASS + 3;
    if (far) for (const p of plantScenery()) (lists[SCN + (p.bush ? 2 : p.hash < 0.5 ? 0 : 1)] ??= []).push(p.x, p.z, p.hash * Math.PI, p.w, p.h, p.hash, (p.hash * 7.31) % 1, p.y);
    const tuft = [material(makeTuftTexture(5)), material(makeTuftTexture(9))];
    const sceneMat = far ? [material(makeTreeTexture(3, false)), material(makeTreeTexture(8, false)), material(makeTreeTexture(5, true)),
      material(makeBareTreeTexture(3, false), true), material(makeBareTreeTexture(8, false), true), material(makeBareTreeTexture(5, true), true)] : [];
    // Bare winter crowns: the same instances again on the bare maps (drawn only while a tree is out of leaf).
    if (far) for (let k = 0; k < 3; k++) lists[SCN + 3 + k] = lists[SCN + k] ?? [];
    const flowerMat = KINDS.map((k) => material(makeFlowerTexture(k)));
    for (let li = 0; li < NEAR + (far ? FAR_GRASS + 9 : 0); li++) {
      const data = new Float32Array(lists[li] ?? []);
      const n = data.length / STRIDE;
      const scenery = li >= SCN, isFar = li >= NEAR, flower = scenery ? false : isFar ? li >= NEAR + FAR_GRASS : li >= PHASES;
      const mm = scenery ? sceneMat[li - SCN] : isFar ? (flower ? flowerMat[li - NEAR - FAR_GRASS] : tuft[li % 2]) : flower ? flowerMat[(li - PHASES) >> 1] : tuft[li % 2];
      const mesh = new THREE.InstancedMesh(geo, mm.m, Math.max(1, n));
      mesh.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(Math.max(1, n) * 3), 3);
      mesh.castShadow = false;
      mesh.receiveShadow = false;
      mesh.frustumCulled = false;
      mesh.matrixAutoUpdate = false;
      mesh.userData.gbufferMaterial = mm.gb;
      mesh.count = 0;
      this.group.add(mesh);
      // Flower patches copy the shear of a mid-field grass phase with the same fast-ripple phase.
      this.patches.push({ mesh, data, n, flower, far: isFar, scenery, phase: isFar ? ((li - NEAR) * 5 + 2) % PHASES : flower ? ((li - PHASES) % 2 ? 16 : 13) : li,
        bare: li >= SCN + 3, shown: 0, sum: [0, 0, 0], kind: !flower ? -1 : isFar ? li - NEAR - FAR_GRASS : (li - PHASES) >> 1 });
    }
    this.counts.meshes = this.patches.length;
    this.bushMat = far ? sceneMat[2].m : null;
    this.bushBare = far ? sceneMat[5].m : null;
  }
  private bushMat: THREE.Material | null = null;
  private bushBare: THREE.Material | null = null;

  /** Shown instances and mean instance colour per kind as of the last bakes (season reports and the smoke gate). */
  probe() {
    const acc = () => ({ n: 0, rgb: [0, 0, 0] });
    const o = { tufts: acc(), flowers: acc(), trees: acc(), bare: acc() };
    for (const p of this.patches) {
      const a = p.bare ? o.bare : p.scenery ? o.trees : p.flower ? o.flowers : o.tufts;
      a.n += p.shown; for (let k = 0; k < 3; k++) a.rgb[k] += p.sum[k];
    }
    for (const a of Object.values(o)) a.rgb = a.rgb.map((v) => +(v / Math.max(1, a.n)).toFixed(4));
    return o;
  }

  /** Per frame: shear every patch from the wind (no buffer uploads), then rebake a couple of patches if lighting changed. */
  frame(sim: TreeSim, L: MeadowLight, time: number) {
    const amp = 0.95;
    for (let p = 0; p < PHASES; p++) {
      const d = this.phaseD[p];
      const g = wind.gustAlong(d);
      // Flutter: small faster wobble along and across the wind, scaled by strength, different per phase.
      const fl = wind.base * 0.1;
      const along = g * amp + fl * Math.sin(wind.t * 3.1 + p * 2.4);
      const across = fl * 0.8 * Math.sin(wind.t * 2.3 + p * 1.7);
      this.kx[p] = wind.dirX * along - wind.dirZ * across;
      this.kz[p] = wind.dirZ * along + wind.dirX * across;
    }
    for (const pt of this.patches) {
      if (pt.scenery) continue;
      const e = pt.mesh.matrix.elements;
      e[4] = this.kx[pt.phase]; e[6] = this.kz[pt.phase];
      pt.mesh.matrixWorldNeedsUpdate = true;
    }
    // Rebake triggers: sun direction/brightness, night, tint, trunk radius, draw fraction; light grid at most every 3 s.
    if (sim.lightVersion !== this.lightVersion && time - this.lightKeyT > 3) { this.lightVersion = sim.lightVersion; this.lightKeyT = time; }
    const s = L.sunDir, lum = (c: THREE.Color) => (c.r + c.g + c.b).toFixed(1);
    const shKey = `${s.x.toFixed(2)},${s.y.toFixed(2)},${s.z.toFixed(2)}|${this.lightVersion}`;
    const key = `${lum(L.sunCol)}|${lum(L.hemi)}|${L.night.toFixed(1)}${L.night > 0 ? 'n' : 'd'}${L.night < 1 ? '' : 'N'}|${L.tint.toFixed(2)},${L.tintHue.toFixed(2)}|${L.frac}`;
    const trunkKey = (sim.nodes[0]?.radius ?? 0).toFixed(2);
    this.L = L;
    if (shKey !== this.shKey && this.fillRow < 0) {
      this.shKey = shKey;
      this.fillSun = [s.x, Math.max(0.08, s.y), s.z];
      this.beginFill(sim);
    }
    if (key !== this.key) {
      this.key = key; this.trunkKey = trunkKey;
      this.dirty = this.patches.map((_, i) => i);
    } else if (trunkKey !== this.trunkKey) {
      this.trunkKey = trunkKey;
      this.dirty = this.nearPatches();
    }
    // Season: the year phase in LAND_STEPS steps (constant through summer and with seasons off). Merged into the pending
    // list, not replacing it, so the patches at the end of the list are not starved while the year runs fast.
    const sk = landKey(season.phase);
    if (sk !== this.seasonKey) {
      this.seasonKey = sk; this.stats.seasonRebakes++;
      if (this.dirty.length < this.patches.length) this.dirty = [...new Set([...this.dirty, ...this.patches.map((_, i) => i)])];
    }
    // Time-sliced: shade field rows first (patches wait for it, so a tuft is never baked twice for one change), then
    // patches, both inside one small budget per frame.
    const t0 = performance.now();
    if (this.fillRow >= 0) this.fillShade(sim, t0 + FRAME_BUDGET_MS);
    else while (this.dirty.length) { this.bake(sim, this.dirty.shift()!); if (performance.now() - t0 > FRAME_BUDGET_MS) break; }
    const ms = performance.now() - t0;
    if (ms > this.stats.sliceMaxMs) this.stats.sliceMaxMs = ms;
  }

  /** Bake every pending patch now (screenshots, fastForward). */
  bakeAll(sim: TreeSim) {
    if (this.fillRow >= 0) this.fillShade(sim, Infinity);
    while (this.dirty.length) this.bake(sim, this.dirty.shift()!);
  }

  /** Start a shade fill: only the cells the crown can shade (light-grid footprint swept away from the sun) are marched. */
  private beginFill(sim: TreeSim) {
    const G = sim.lightGrid, R = this.rect, k = SG / (2 * SE);
    this.bkUp.fill(1); this.bkSun.fill(1);
    if (!G) { R[0] = R[2] = 0; R[1] = R[3] = -1; this.fillRow = 0; return; }
    const [sx, sy, sz] = this.fillSun, len = (G.ny * G.cell + Math.max(0, G.oy)) / sy;
    const ax = G.ox, bx = G.ox + G.nx * G.cell, az = G.oz, bz = G.oz + G.nz * G.cell;
    const c = (v: number) => Math.min(SG - 1, Math.max(0, Math.floor((v + SE) * k)));
    R[0] = c(Math.min(ax, ax - sx * len) - 1.5); R[1] = c(Math.max(bx, bx - sx * len) + 1.5);
    R[2] = c(Math.min(az, az - sz * len) - 1.5); R[3] = c(Math.max(bz, bz - sz * len) + 1.5);
    this.fillRow = R[2];
  }

  /** March rows of the shade field into the back buffers until `deadline`, then blur one field per call into the live
   *  field (stages, so no slice does everything); the last stage dirties every patch. */
  private fillShade(sim: TreeSim, deadline: number) {
    const [sx, sy, sz] = this.fillSun, cell = (2 * SE) / SG;
    const [i0, i1, r0, r1] = this.rect;
    while (this.fillRow <= r1) {
      const z = -SE + (this.fillRow + 0.5) * cell, o = this.fillRow * SG;
      for (let i = this.fillCol < 0 ? i0 : this.fillCol; i <= i1; i++) {
        const x = -SE + (i + 0.5) * cell;
        this.bkUp[o + i] = this.transmit(sim, x, z, 0, 1, 0);
        this.bkSun[o + i] = this.transmit(sim, x, z, sx, sy, sz);
        if ((i & 7) === 7 && i < i1 && performance.now() > deadline) { this.fillCol = i + 1; return; }
      }
      this.fillCol = -1;
      this.fillRow++;
      if (performance.now() > deadline) return;
    }
    // Binomial 1-4-6-4-1 blur per axis: the voxel steps of the light grid become a gradient about 1 m wide.
    const T = this.shTmp, hi = SG - 1;
    const a0 = Math.max(0, i0 - 2), a1 = Math.min(hi, i1 + 2), b0 = Math.max(0, r0 - 2), b1 = Math.min(hi, r1 + 2);
    for (; this.blurStage < 2; this.blurStage++) {
      if (this.blurStage === 1 && performance.now() > deadline) return;
      const src = this.blurStage ? this.bkSun : this.bkUp, dst = this.blurStage ? this.shSun : this.shUp;
      dst.fill(1); T.fill(1);
      for (let zr = r0; zr <= r1; zr++) for (let i = a0, o = zr * SG; i <= a1; i++) {
        const l1 = i > 0 ? i - 1 : 0, l2 = i > 1 ? i - 2 : 0, h1 = i < hi ? i + 1 : hi, h2 = i < hi - 1 ? i + 2 : hi;
        T[o + i] = (src[o + l2] + src[o + h2] + 4 * (src[o + l1] + src[o + h1]) + 6 * src[o + i]) / 16;
      }
      for (let zr = b0; zr <= b1; zr++) {
        const l1 = (zr > 0 ? zr - 1 : 0) * SG, l2 = (zr > 1 ? zr - 2 : 0) * SG, h1 = (zr < hi ? zr + 1 : hi) * SG, h2 = (zr < hi - 1 ? zr + 2 : hi) * SG, o = zr * SG;
        for (let i = a0; i <= a1; i++) dst[o + i] = (T[l2 + i] + T[h2 + i] + 4 * (T[l1 + i] + T[h1 + i]) + 6 * T[o + i]) / 16;
      }
    }
    this.blurStage = 0;
    this.fillRow = -1;
    // Keep patches still waiting from a light change (the far ones are not in `nearPatches`; dropping them left far tufts in stale colours).
    this.dirty = this.neverBaked ? this.patches.map((_, i) => i) : [...new Set([...this.dirty, ...this.nearPatches()])];
  }

  /** Bilinear sample of a shade field at a ground point. */
  private shade(F: Float32Array, x: number, z: number): number {
    const k = SG / (2 * SE);
    const fx = Math.min(SG - 1.001, Math.max(0, (x + SE) * k - 0.5)), fz = Math.min(SG - 1.001, Math.max(0, (z + SE) * k - 0.5));
    const ix = fx | 0, iz = fz | 0, ax = fx - ix, az = fz - iz, o = iz * SG + ix;
    const a = F[o] + (F[o + 1] - F[o]) * ax, b = F[o + SG] + (F[o + SG + 1] - F[o + SG]) * ax;
    return a + (b - a) * az;
  }

  /** exp(-k x leaf density) from a ground point toward (dx, dy, dz) through the sim light grid. */
  private transmit(sim: TreeSim, x: number, z: number, dx: number, dy: number, dz: number): number {
    const G = sim.lightGrid;
    if (!G) return 1;
    const { dens, nx, ny, nz, cell } = G;
    let px = (x - G.ox) / cell, py = (0.05 - G.oy) / cell, pz = (z - G.oz) / cell;
    // Jump to the grid box (slab test), then march one cell per step.
    let t0 = 0, t1 = 1e9;
    for (let ax = 0; ax < 3; ax++) {
      const p = ax === 0 ? px : ax === 1 ? py : pz, d = ax === 0 ? dx : ax === 1 ? dy : dz, n = ax === 0 ? nx : ax === 1 ? ny : nz;
      if (Math.abs(d) < 1e-6) { if (p < 0 || p >= n) return 1; continue; }
      const a = -p / d, b = (n - p) / d;
      t0 = Math.max(t0, Math.min(a, b)); t1 = Math.min(t1, Math.max(a, b));
    }
    if (t1 <= t0) return 1;
    px += dx * (t0 + 0.01); py += dy * (t0 + 0.01); pz += dz * (t0 + 0.01);
    let acc = 0;
    for (let i = 0; i < 96; i++) {
      const ix = Math.floor(px), iy = Math.floor(py), iz = Math.floor(pz);
      if (ix < 0 || iy < 0 || iz < 0 || ix >= nx || iy >= ny || iz >= nz) break;
      acc += dens[(iy * nz + iz) * nx + ix];
      px += dx; py += dy; pz += dz;
    }
    return Math.exp(-0.05 * acc);
  }

  private bake(sim: TreeSim, pi: number) {
    const L = this.L;
    if (!L) return;
    const t0 = performance.now();
    const pt = this.patches[pi], { data, mesh } = pt;
    const n = pt.scenery ? pt.n : Math.min(pt.n, Math.ceil(pt.n * L.frac));
    const M = mesh.instanceMatrix.array as Float32Array, C = mesh.instanceColor!.array as Float32Array;
    const n0 = sim.nodes[0], tx = n0?.wx ?? 0, tz = n0?.wz ?? 0, tR = Math.max(0.03, n0?.radius ?? 0.05);
    const sun = L.sunCol, hemi = L.hemi, ly = Math.max(0, L.sunDir.y);
    const tc = this.tintCol.setHSL(L.tintHue, 0.55, 0.4);
    const open = 1 - L.night; // flowers close at night
    // Night grade (exactly off by day): the drawn colour (instance x map mean) loses chroma to the cool grey of the leaf bake.
    const ng = L.night, mmn = (mesh.material as THREE.Material).userData.mean as number[], nS = NIGHT_DESAT * ng;
    const nK = 1 + ((pt.scenery ? NIGHT_DIM.scenery : pt.flower ? NIGHT_DIM.flower : NIGHT_DIM.grass) - 1) * ng;
    // Season (pure function of the year phase; exactly the summer values in summer and with seasons off).
    const ph = season.phase, LS = landSeason(ph, this.LS), TS = this.TS, seasonal = landKey(ph) !== -1;
    const blm = pt.flower ? bloom(ph, BLOOM_K[pt.kind] ?? 0) : 1;
    let shown = 0, sr = 0, sg = 0, sb = 0;
    const grade = (j: number) => {
      const r = C[j] * mmn[0], g = C[j + 1] * mmn[1], b = C[j + 2] * mmn[2], Lm = 0.3 * r + 0.59 * g + 0.11 * b;
      C[j] = ((r + (Lm * NIGHT_GREY[0] - r) * nS) * nK) / mmn[0]; C[j + 1] = ((g + (Lm * NIGHT_GREY[1] - g) * nS) * nK) / mmn[1]; C[j + 2] = ((b + (Lm * NIGHT_GREY[2] - b) * nS) * nK) / mmn[2];
    };
    for (let i = 0; i < n; i++) {
      const o = i * STRIDE, x = data[o], z = data[o + 1], rot = data[o + 2], hA = data[o + 5], hB = data[o + 6];
      let w = data[o + 3], h = data[o + 4];
      const rt = Math.hypot(x - tx, z - tz);
      if (seasonal && !pt.scenery && !pt.flower) h *= LS.height;
      if (pt.scenery) treeSeason(ph, hA, hB, vnoise(x / 130 + 2.2, z / 130 - 4.1), pt.mesh.material === this.bushMat || pt.mesh.material === this.bushBare, TS);
      // Crown shade: straight up decides how the plant grows, toward the sun decides how it is lit right now.
      // Both come from the blurred shade field, so neighbouring tufts get neighbouring values (a gradient, not squares).
      const up = pt.far ? 1 : this.shade(this.shUp, x, z);
      const ts = pt.far ? 1 : (0.38 + 0.34 * L.night) + (0.62 - 0.34 * L.night) * this.shade(this.shSun, x, z); // floor: the decal shadow is not black either
      let show = rt > tR * 1.3 + 0.02;
      if (pt.scenery) { show = pt.bare ? TS.bare : TS.leaf > 0; if (!pt.bare) { w *= TS.leaf; h *= TS.leaf; } }
      else if (pt.flower) {
        if (up < 0.55 + 0.3 * hA || rt < tR * 3 + 0.5) show = false; // no flowers in deep shade or against the trunk
        if (blm < 1 && (hB * 17.3) % 1 >= blm) show = false; // not in bloom at this time of year
        h *= 1 - 0.2 * L.night;
      } else {
        // Shorter and sparser under the crown; the ring right at the trunk stays, it hides the trunk/ground line.
        const near = rt < tR * 2.2 + 0.25;
        if (!near && hA > 0.4 + 0.6 * up) show = false;
        h *= near ? 0.8 + 0.5 * hB : 0.55 + 0.45 * up;
        if (near) w *= 0.75;
      }
      const c = Math.cos(rot), s = Math.sin(rot), q = i * 16;
      if (!show) w = h = 0;
      M[q] = c * w; M[q + 1] = 0; M[q + 2] = -s * w; M[q + 3] = 0;
      M[q + 4] = (hB - 0.5) * 0.3 * h; M[q + 5] = h; M[q + 6] = (hA - 0.5) * 0.3 * h; M[q + 7] = 0; // slight static lean per tuft
      M[q + 8] = s * w; M[q + 9] = 0; M[q + 10] = c * w; M[q + 11] = 0;
      M[q + 12] = x; M[q + 13] = (pt.scenery ? data[o + 7] : 0) - 0.03 * h; M[q + 14] = z; M[q + 15] = 1;
      // Colour: tint variation (macro drifts of lush / dry, per-tuft jitter) x shade.
      const col = this.col;
      if (pt.bare) col.setRGB(BARE_GAIN[0], BARE_GAIN[1], BARE_GAIN[2]).multiplyScalar(0.72 + 0.4 * hA);
      else if (pt.scenery) {
        col.setRGB(SCENE_GAIN[0], SCENE_GAIN[1], SCENE_GAIN[2]).multiplyScalar(0.7 + 0.5 * hA).multiply(this.tintCol.setRGB(1 + 0.25 * (hB - 0.5), 1, 1 - 0.3 * (hB - 0.5)));
        if (TS.pale > 0) { col.r *= 1 + 0.5 * TS.pale; col.g *= 1 + 0.3 * TS.pale; col.b *= 1 - 0.3 * TS.pale; }
        if (TS.turn > 0) {
          // Autumn: the drawn colour (instance x map mean) goes to this tree's own shade (russet .. orange .. yellow, a share dull brown), then dries.
          const dr = col.r * mmn[0], dg = col.g * mmn[1], db = col.b * mmn[2], lm = 0.3 * dr + 0.59 * dg + 0.11 * db, u = TS.shade;
          const a = this.tintCol.setHSL(TS.brown ? 0.075 + 0.03 * u : 0.04 + 0.105 * u, (TS.brown ? 0.38 : 0.55 + 0.3 * u) * (1 - 0.4 * TS.dry), 0.5, THREE.SRGBColorSpace);
          const k = (lm * (TS.brown ? 0.95 : 1.25 + 1.2 * u) * (1 - 0.25 * TS.dry)) / (0.3 * a.r + 0.59 * a.g + 0.11 * a.b), c = TS.turn;
          col.r = (dr + (a.r * k - dr) * c) / mmn[0]; col.g = (dg + (a.g * k - dg) * c) / mmn[1]; col.b = (db + (a.b * k - db) * c) / mmn[2];
        }
      }
      else if (pt.flower) col.setRGB(1, 0.94, 1.1).multiplyScalar((0.62 + 0.16 * hB) * (0.6 + 0.4 * open));
      else {
        const macro = vnoise(x * 0.23 + 3.1, z * 0.23 - 1.7), fine = vnoise(x * 1.3, z * 1.3);
        // Toward the rim the tufts stand alone on the ground texture: less straw and a little darker there, so they read as grass, not clumps.
        const rim = pt.scenery ? 1 : smooth(9, 22, data[o + 7]);
        const dry = smooth(0.5, 0.8, macro * 0.7 + fine * 0.2 + hB * 0.25) * (1 - 0.7 * rim);
        const v = (0.72 + 0.34 * hA + 0.14 * (fine - 0.5)) * (1 - 0.16 * rim);
        // Channel gains measured against the ground in screenshots (the ground also gets sky fill from the env map).
        col.setRGB(v * (0.95 + 0.45 * dry), v * (0.66 + 0.1 * dry), v * (1.7 - 0.5 * dry));
        if (seasonal) {
          // Grass through the year on the drawn colour (instance x map mean): spring flush, straw in autumn (each tuft to its own degree), dull in winter.
          const dr = col.r * mmn[0], dg = col.g * mmn[1], db = col.b * mmn[2], lm = 0.3 * dr + 0.59 * dg + 0.11 * db;
          const wf = 0.65 * LS.fresh, ws = Math.min(0.92, LS.straw * (0.45 + 0.75 * hB)), ww = LS.winter * (0.7 + 0.25 * hA), k0 = Math.max(0, 1 - wf - ws - ww);
          col.r = (dr * k0 + lm * (wf * G_FRESH[0] + ws * G_STRAW[0] + ww * G_WINTER[0])) / mmn[0];
          col.g = (dg * k0 + lm * (wf * G_FRESH[1] + ws * G_STRAW[1] + ww * G_WINTER[1])) / mmn[1];
          col.b = (db * k0 + lm * (wf * G_FRESH[2] + ws * G_STRAW[2] + ww * G_WINTER[2])) / mmn[2];
        }
        if (L.tint > 0) { const lumc = (col.r * 0.3 + col.g * 0.59 + col.b * 0.11) * 2.0; col.r += (tc.r * lumc - col.r) * L.tint; col.g += (tc.g * lumc - col.g) * L.tint; col.b += (tc.b * lumc - col.b) * L.tint; }
        // Contact darkening at the trunk, like the ground shader.
        col.multiplyScalar(0.72 + 0.28 * smooth(tR * 0.6, tR * 7, rt));
      }
      // E_wanted / E_lambert: blades stand upright, so a low sun still lights them (the up normal alone would not).
      const amb = 0.78 + 0.22 * Math.min(up, ts);
      const side = ly + 0.4 * (1 - ly) * (1 - ly);
      const f = (hc: number, sc: number) => Math.min(4, (hc * amb + sc * side * ts + 1e-4) / (hc + sc * ly + 1e-4));
      // Backdrop trees are lit like a crown, not like blades: the low-sun lift is capped so they never outshine the oak.
      if (pt.scenery) { const k = Math.min(1.5, f(hemi.g, sun.g)); C[i * 3] = col.r * k; C[i * 3 + 1] = col.g * k; C[i * 3 + 2] = col.b * k; if (ng > 0) grade(i * 3); if (show) { shown++; sr += C[i * 3]; sg += C[i * 3 + 1]; sb += C[i * 3 + 2]; } continue; }
      C[i * 3] = col.r * f(hemi.r, sun.r); C[i * 3 + 1] = col.g * f(hemi.g, sun.g); C[i * 3 + 2] = col.b * f(hemi.b, sun.b);
      if (ng > 0) grade(i * 3);
      if (show) { shown++; sr += C[i * 3]; sg += C[i * 3 + 1]; sb += C[i * 3 + 2]; }
    }
    pt.shown = shown; pt.sum[0] = sr; pt.sum[1] = sg; pt.sum[2] = sb;
    if (pt.bare) mesh.visible = shown > 0;
    if (pt.far) this.neverBaked = false;
    mesh.count = n;
    mesh.instanceMatrix.needsUpdate = true;
    mesh.instanceColor!.needsUpdate = true;
    let g = 0, fl = 0;
    for (const p of this.patches) if (p.flower) fl += p.mesh.count; else g += p.mesh.count;
    this.counts.grass = g; this.counts.flowers = fl;
    const ms = performance.now() - t0;
    this.stats.sumMs += ms; this.stats.lastMs = ms; this.stats.maxMs = Math.max(this.stats.maxMs, ms); this.stats.bakes++;
  }
}

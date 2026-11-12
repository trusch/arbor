import * as THREE from 'three';
import type { TreeSim } from '../sim/tree';
import type { ArborParams } from '../params';

/** Slightly cupped, bent leaf blade: base at origin, tip along +Y, face toward +Z. */
function leafGeometry(): THREE.BufferGeometry {
  const g = new THREE.PlaneGeometry(0.6, 1, 2, 4);
  g.translate(0, 0.62, 0); // blade starts past a short petiole gap
  const p = g.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), y = p.getY(i);
    p.setZ(i, x * x * 0.6 - y * y * 0.18);
  }
  g.computeVertexNormals();
  return g;
}

/** Same blade with a reversed-winding back copy (flipped normals) so FrontSide renders both faces without gl_FrontFacing. */
function doubledLeafGeometry(vertexColors = false): THREE.BufferGeometry {
  const g = leafGeometry().toNonIndexed();
  const pos = g.attributes.position.array as Float32Array, nor = g.attributes.normal.array as Float32Array, uv = g.attributes.uv.array as Float32Array;
  const n = pos.length / 3;
  const P = new Float32Array(n * 6), N = new Float32Array(n * 6), U = new Float32Array(n * 4);
  P.set(pos); N.set(nor); U.set(uv);
  for (let t = 0; t < n; t += 3) for (let k = 0; k < 3; k++) {
    const src = t + [0, 2, 1][k], dst = n + t + k;
    for (let c = 0; c < 3; c++) { P[dst * 3 + c] = pos[src * 3 + c]; N[dst * 3 + c] = -nor[src * 3 + c]; }
    U[dst * 2] = uv[src * 2]; U[dst * 2 + 1] = uv[src * 2 + 1];
  }
  const out = new THREE.BufferGeometry();
  out.setAttribute('position', new THREE.BufferAttribute(P, 3));
  out.setAttribute('normal', new THREE.BufferAttribute(N, 3));
  out.setAttribute('uv', new THREE.BufferAttribute(U, 2));
  if (vertexColors) {
    // Lighter toward the tip, back face darker (only for the vertexColors ladder variant).
    const C = new Float32Array(n * 6);
    for (let i = 0; i < 2 * n; i++) { const k = (0.85 + 0.25 * U[i * 2 + 1]) * (i < n ? 1 : 0.85); C[i * 3] = k; C[i * 3 + 1] = k; C[i * 3 + 2] = k * 0.96; }
    out.setAttribute('color', new THREE.BufferAttribute(C, 3));
  }
  g.dispose();
  return out;
}

/**
 * Alpha-tested leaf map without ghost cards. The canvas source is premultiplied, so every transparent texel reads back as
 * RGB 0 and box-filtered mips darken the rim; low mips also average the alpha to ~0.5 over the whole card, which then
 * passes alphaTest 0.5 as a dark rectangle. Here: alpha is exactly 0 outside the leaf, RGB is dilated with the leaf
 * colour into the transparent area, and every mip level is built by hand with its alpha re-thresholded at 0.5, so a
 * texel is either leaf (alpha 1) or nothing (alpha 0) at every distance. Same shader features as the canvas map.
 */
export function cleanLeafTexture(src: THREE.Texture): THREE.Texture {
  const img = src.image as HTMLCanvasElement;
  const S = img.width;
  const d = img.getContext('2d')!.getImageData(0, 0, S, S).data;
  // Mean leaf colour (unpremultiplied by getImageData) for the dilation fill.
  let r = 0, g = 0, b = 0, n = 0;
  for (let i = 0; i < d.length; i += 4) if (d[i + 3] >= 128) { r += d[i]; g += d[i + 1]; b += d[i + 2]; n++; }
  const fill = [r / n, g / n, b / n];
  let lvl = new Float32Array(S * S * 4);
  for (let i = 0; i < S * S; i++) {
    const a = d[i * 4 + 3] / 255;
    for (let c = 0; c < 3; c++) lvl[i * 4 + c] = a >= 0.5 ? d[i * 4 + c] : fill[c];
    lvl[i * 4 + 3] = a >= 0.5 ? 1 : 0;
  }
  const toBytes = (f: Float32Array) => {
    const u = new Uint8Array(f.length);
    for (let i = 0; i < f.length; i += 4) { u[i] = f[i]; u[i + 1] = f[i + 1]; u[i + 2] = f[i + 2]; u[i + 3] = f[i + 3] >= 0.5 ? 255 : 0; }
    return u;
  };
  const mipmaps: { data: Uint8Array; width: number; height: number }[] = [{ data: toBytes(lvl), width: S, height: S }];
  for (let w = S >> 1; w >= 1; w >>= 1) {
    const prev = lvl, pw = w * 2;
    lvl = new Float32Array(w * w * 4);
    for (let y = 0; y < w; y++) for (let x = 0; x < w; x++) for (let c = 0; c < 4; c++) {
      const at = (xx: number, yy: number) => prev[(yy * pw + xx) * 4 + c];
      lvl[(y * w + x) * 4 + c] = (at(2 * x, 2 * y) + at(2 * x + 1, 2 * y) + at(2 * x, 2 * y + 1) + at(2 * x + 1, 2 * y + 1)) / 4;
    }
    mipmaps.push({ data: toBytes(lvl), width: w, height: w });
  }
  const t = new THREE.DataTexture(mipmaps[0].data, S, S, THREE.RGBAFormat);
  t.mipmaps = mipmaps as unknown as THREE.DataTexture['mipmaps'];
  t.generateMipmaps = false;
  t.minFilter = THREE.LinearMipmapLinearFilter;
  t.magFilter = THREE.LinearFilter;
  t.flipY = src.flipY;
  t.colorSpace = src.colorSpace;
  t.anisotropy = 1;
  t.needsUpdate = true;
  return t;
}

/**
 * Leaf-shaped polygon for the safe/basic path: no texture, no alpha test, crisp silhouette.
 * Midrib along +Y (base at origin after the petiole gap), 5 stations per side, halves folded up along the midrib
 * so they shade differently. Front and reversed-winding back copy (FrontSide renders both faces, no gl_FrontFacing).
 * Vertex colours: lighter midrib, darker base, so the instance colour reads as a leaf rather than a flat chip.
 */
function polyLeafGeometry(withUv: boolean, vertexColors: boolean): THREE.BufferGeometry {
  const ys = [0, 0.2, 0.45, 0.72, 1];
  const ws = [0, 0.27, 0.3, 0.2, 0]; // half-width: broadest a bit below the middle, pointed tip
  const fold = 0.38, bend = 0.18, y0 = 0.12;
  const pt = (x: number, t: number) => [x, y0 + t, Math.abs(x) * fold - t * t * bend] as const;
  const shade = (x: number, t: number) => (x === 0 ? 1.12 : 0.92) * (0.82 + 0.18 * Math.min(1, t * 2.2));
  const P: number[] = [], C: number[] = [];
  const tri = (a: [number, number], b: [number, number], c: [number, number]) => {
    for (const [x, t] of [a, b, c]) { P.push(...pt(x, t)); const k = shade(x, t); C.push(k, k, k * 0.96); }
  };
  for (const sg of [1, -1]) for (let i = 0; i < ys.length - 1; i++) {
    const m0: [number, number] = [0, ys[i]], m1: [number, number] = [0, ys[i + 1]];
    const e0: [number, number] = [sg * ws[i], ys[i]], e1: [number, number] = [sg * ws[i + 1], ys[i + 1]];
    // CCW seen from +Z for the right half; mirrored half swaps winding.
    const T = (a: [number, number], b: [number, number], c: [number, number]) => (sg > 0 ? tri(a, b, c) : tri(a, c, b));
    if (ws[i] > 0) T(m0, e0, e1);
    if (ws[i + 1] > 0) T(m0, e1, m1);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(P, 3));
  g.computeVertexNormals(); // non-indexed → flat per-triangle normals: the fold shades each half differently
  const pos = g.attributes.position.array as Float32Array, nor = g.attributes.normal.array as Float32Array;
  const n = pos.length / 3;
  const P2 = new Float32Array(n * 6), N2 = new Float32Array(n * 6), C2 = new Float32Array(n * 6), U2 = new Float32Array(n * 4);
  P2.set(pos); N2.set(nor); C2.set(C);
  for (let i = 0; i < n; i++) { U2[i * 2] = pos[i * 3] + 0.5; U2[i * 2 + 1] = pos[i * 3 + 1] - y0; }
  for (let t = 0; t < n; t += 3) for (let k = 0; k < 3; k++) {
    const src = t + [0, 2, 1][k], dst = n + t + k;
    for (let c = 0; c < 3; c++) { P2[dst * 3 + c] = pos[src * 3 + c]; N2[dst * 3 + c] = -nor[src * 3 + c]; C2[dst * 3 + c] = C[src * 3 + c] * 0.85; }
    U2[dst * 2] = U2[src * 2]; U2[dst * 2 + 1] = U2[src * 2 + 1];
  }
  const out = new THREE.BufferGeometry();
  out.setAttribute('position', new THREE.BufferAttribute(P2, 3));
  out.setAttribute('normal', new THREE.BufferAttribute(N2, 3));
  if (vertexColors) out.setAttribute('color', new THREE.BufferAttribute(C2, 3));
  if (withUv) out.setAttribute('uv', new THREE.BufferAttribute(U2, 2));
  g.dispose();
  return out;
}

/**
 * Leaf render mode. 'full': MeshStandardMaterial + onBeforeCompile (translucency, glow, GPU wind), DoubleSide, casts shadows.
 * 'safe': MeshLambertMaterial on a leaf-shaped polygon (no texture, no alpha), vertex + instance colours, small emissive
 *   sky fill, FrontSide on doubled geometry, no shadows, no wind, no shader patching (for PowerVR/mobile).
 * 'basic': MeshBasicMaterial (unlit), otherwise as 'safe'. shadow=false turns leaf shadow cast/receive off on any shader.
 */
export interface LeafMode { shader: 'full' | 'safe' | 'basic'; shadow: boolean; variant?: number }

/**
 * Safe/basic leaf variants, ordered as a ladder from the known-good PowerVR path (V0) toward the richer polygon leaf (V4).
 * Each step adds one shader/attribute feature so a context loss pins the feature that kills a driver.
 *   geo 'quad' = alpha-tested card (doubled, uv); 'poly' = leaf-shaped polygon (doubled).
 *   map 'leaf' = leaf canvas texture + alphaTest 0.5; 'white' = 1x1 white texture + alphaTest 0.5; null = no map, no uv.
 */
export interface LeafVariant { name: string; geo: 'quad' | 'poly'; map: 'leaf' | 'white' | null; vertexColors: boolean; emissive: boolean }
export const LEAF_VARIANTS: readonly LeafVariant[] = [
  { name: 'V0 quad+leafmap+alphaTest', geo: 'quad', map: 'leaf', vertexColors: false, emissive: false },
  { name: 'V1 V0+emissive', geo: 'quad', map: 'leaf', vertexColors: false, emissive: true },
  { name: 'V2 V0+vertexColors', geo: 'quad', map: 'leaf', vertexColors: true, emissive: false },
  { name: 'V3 poly+uv+whitemap+alphaTest', geo: 'poly', map: 'white', vertexColors: false, emissive: false },
  { name: 'V4 poly+vertexColors+emissive, no map', geo: 'poly', map: null, vertexColors: true, emissive: true },
];

/** ?leafmap=raw: the old canvas map with GPU mips (ghost-card repro). */
const diagRawLeafMap = typeof location !== 'undefined' && new URLSearchParams(location.search).get('leafmap') === 'raw';

const GROW_TIME = 3; // seconds for a leaf to unfold
const LEAF_D = 9; // floats per instance placement record (see `Leaves.place`)

/** Instanced leaves attached to young segments, with vertex-shader wind sway. */
export class Leaves {
  mesh!: THREE.InstancedMesh;
  private material: THREE.Material;
  /** Full path only: GTAO g-buffer material with the leaf alpha cut-out (`userData.gbufferMaterial`, see Post). */
  private gbufferMaterial: THREE.Material | null = null;
  readonly mode: LeafMode;
  /** Active safe/basic ladder variant (null on the full path). */
  variant: LeafVariant | null = null;
  private uniforms = {
    uTime: { value: 0 },
    uWind: { value: 1 },
    uSunDirV: { value: new THREE.Vector3(0, 1, 0) },
    uSunCol: { value: new THREE.Color(1, 1, 1) },
    uGlow: { value: new THREE.Color(0, 0, 0) },
  };
  private capacity = 0;
  /** Scene lighting for the CPU bake (set by `setLighting` before `update`). */
  private lit = {
    cam: new THREE.Vector3(0, 2, 8), sun: new THREE.Vector3(0, 1, 0), sunCol: new THREE.Color(1, 1, 1),
    sky: new THREE.Color(0.5, 0.6, 0.8), ground: new THREE.Color(0.1, 0.1, 0.05),
  };
  /** Mean linear colour of the leaf map: instance colours are divided by it so the albedo is what the bake says. */
  private mapMean = new THREE.Color(0.7, 0.78, 0.6);
  /** Per-voxel sun transmittance (march through the light grid toward the sun), cached by grid version + sun dir. */
  private sunT: Float32Array | null = null;
  private sunTKey = '';
  /** Max drawn leaves (0 = unlimited); Low caps it for the phone budget. */
  maxInstances = 0;
  private rankScale = 1;
  private m = new THREE.Matrix4();
  /** Resumable leaf pass (see `beginPass` / `stepPass`): cursor, instances written, candidates seen, input snapshot, back buffers. */
  passOpen = false;
  private passLi = 0;
  private passEnd = 0;
  private passN = 0;
  private passCand = 0;
  private passTime = 0;
  private passRs = 1;
  private passT: Float32Array | null = null;
  private backC = new Float32Array(0);
  private scratch = new Float32Array(16);
  private followAt = 0;
  /**
   * Per-instance placement record (LEAF_D floats: t, cos/sin around, cos/sin tilt, cos/sin roll, base size, born) and
   * node id. `back*` is written by the open pass, `front*` describes the drawn instances in the order of the uploaded
   * colour buffer; they are swapped when a pass completes. `follow` re-places the front set from the live nodes.
   */
  private backD = new Float32Array(0);
  private backNode = new Int32Array(0);
  private frontD = new Float32Array(0);
  private frontNode = new Int32Array(0);
  /** False until a pass has completed on the current tree (front records would point into a discarded node list). */
  private followOk = false;
  /** Wall time of the last `follow` (ms) and its maximum. */
  followMs = 0;
  followMaxMs = 0;
  follows = 0;
  /** Completed passes, and the wall time of the last one summed over its slices (ms). */
  passes = 0;
  passMs = 0;
  private passAcc = 0;
  private lastN = 0;
  private col = new THREE.Color();
  private pos = new THREE.Vector3();

  constructor(map: THREE.Texture, mode: LeafMode = { shader: 'full', shadow: true }, capacity = 1024) {
    this.mode = mode;
    this.mapMean.copy(mapMeanColor(map));
    if (mode.shader !== 'full') {
      const v = this.variant = LEAF_VARIANTS[mode.variant ?? 0] ?? LEAF_VARIANTS[0];
      let tex: THREE.Texture | null = null;
      if (v.map === 'leaf') {
        tex = diagRawLeafMap ? map : cleanLeafTexture(map);
        if (diagRawLeafMap) { map.anisotropy = 1; map.generateMipmaps = true; map.minFilter = THREE.LinearMipmapLinearFilter; }
      } else if (v.map === 'white') {
        tex = new THREE.DataTexture(new Uint8Array([255, 255, 255, 255]), 1, 1);
        tex.needsUpdate = true;
      }
      const o: THREE.MeshLambertMaterialParameters = { side: THREE.FrontSide };
      if (tex) { o.map = tex; o.alphaTest = 0.5; }
      if (v.vertexColors) o.vertexColors = true;
      this.material = mode.shader === 'basic' ? new THREE.MeshBasicMaterial(o as THREE.MeshBasicMaterialParameters)
        : new THREE.MeshLambertMaterial(v.emissive ? { ...o, emissive: new THREE.Color(0.05, 0.075, 0.025) } : o);
      this.mesh = this.makeMesh(capacity);
      return;
    }
    const mat = new THREE.MeshStandardMaterial({
      map,
      alphaTest: 0.5,
      side: THREE.DoubleSide,
      roughness: 0.62,
      metalness: 0,
      // Sky reflections at noon turned the foliage blue-grey; keep env specular low.
      envMapIntensity: 0.3,
    });
    this.material = mat;
    const u = this.uniforms;
    mat.onBeforeCompile = (sh) => {
      sh.uniforms.uTime = u.uTime;
      sh.uniforms.uWind = u.uWind;
      sh.uniforms.uSunDirV = u.uSunDirV;
      sh.uniforms.uSunCol = u.uSunCol;
      sh.uniforms.uGlow = u.uGlow;
      sh.fragmentShader = sh.fragmentShader
        .replace('#include <common>', '#include <common>\nuniform vec3 uSunDirV;\nuniform vec3 uSunCol;\nuniform vec3 uGlow;')
        .replace(
          '#include <emissivemap_fragment>',
          `#include <emissivemap_fragment>
          {
            // Bioluminescence: glowing veins along the midrib and brighter rims toward the tip.
            float mid = 1.0 - smoothstep(0.0, 0.16, abs(vMapUv.x - 0.5));
            float tip = smoothstep(0.35, 1.0, vMapUv.y);
            totalEmissiveRadiance += uGlow * (0.25 + 0.9 * mid + 0.6 * tip);
          }`,
        )
        .replace(
          '#include <lights_fragment_end>',
          `#include <lights_fragment_end>
          {
            // Leaf translucency: light through the blade from behind, strongest looking into the sun.
            vec3 Vd = normalize(vViewPosition);
            float back = max(0.0, -dot(normal, uSunDirV));
            float into = pow(max(0.0, dot(-Vd, uSunDirV)), 5.0);
            vec3 tcol = diffuseColor.rgb * vec3(1.15, 1.2, 0.55);
            reflectedLight.indirectDiffuse += tcol * uSunCol * (0.45 * back + 1.6 * into);
          }`,
        );
      sh.vertexShader = sh.vertexShader
        .replace('#include <common>', '#include <common>\nuniform float uTime;\nuniform float uWind;')
        .replace(
          '#include <begin_vertex>',
          `#include <begin_vertex>
          vec3 ip = vec3(instanceMatrix[3]);
          float ph = dot(ip, vec3(1.7, 0.9, 1.3));
          float sway = uWind * position.y;
          transformed.z += sin(uTime * 2.3 + ph) * 0.12 * sway;
          transformed.x += sin(uTime * 1.7 + ph * 1.3) * 0.06 * sway;`,
        );
    };
    // GTAO g-buffer material: normals + the same alpha cut-out (see Post), so AO sees the leaf shape, not the quad.
    const gb = new THREE.MeshNormalMaterial({ side: THREE.DoubleSide, blending: THREE.NoBlending });
    gb.allowOverride = false;
    gb.onBeforeCompile = (sh) => {
      sh.uniforms.leafMap = { value: map };
      sh.vertexShader = sh.vertexShader
        .replace('#include <common>', '#include <common>\nvarying vec2 vLeafUv;')
        .replace('#include <begin_vertex>', '#include <begin_vertex>\nvLeafUv = uv;');
      sh.fragmentShader = sh.fragmentShader
        .replace('void main() {', 'uniform sampler2D leafMap;\nvarying vec2 vLeafUv;\nvoid main() {')
        .replace('#include <clipping_planes_fragment>', '#include <clipping_planes_fragment>\nif (texture2D(leafMap, vLeafUv).a < 0.5) discard;');
    };
    this.gbufferMaterial = gb;
    this.mesh = this.makeMesh(capacity);
  }

  private makeMesh(cap: number) {
    const v = this.variant;
    const geo = this.mesh ? this.mesh.geometry : !v ? leafGeometry()
      : v.geo === 'quad' ? doubledLeafGeometry(v.vertexColors) : polyLeafGeometry(v.map !== null, v.vertexColors);
    const m = new THREE.InstancedMesh(geo, this.material, cap);
    m.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    m.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(cap * 3), 3).setUsage(THREE.DynamicDrawUsage);
    const old = this.mesh;
    m.castShadow = this.mode.shadow;
    m.receiveShadow = this.mode.shadow;
    m.frustumCulled = false;
    if (this.gbufferMaterial) m.userData.gbufferMaterial = this.gbufferMaterial;
    m.count = 0;
    if (old) {
      // Capacity grew: carry the drawn instances over so the crown does not blink until the next pass completes.
      (m.instanceMatrix.array as Float32Array).set(old.instanceMatrix.array as Float32Array);
      (m.instanceColor.array as Float32Array).set(old.instanceColor!.array as Float32Array);
      m.count = old.count;
    }
    this.capacity = cap;
    if (this.backC.length < cap * 3) {
      this.backC = new Float32Array(cap * 3);
      this.backD = new Float32Array(cap * LEAF_D); this.backNode = new Int32Array(cap);
      const fd = new Float32Array(cap * LEAF_D), fn = new Int32Array(cap);
      fd.set(this.frontD); fn.set(this.frontNode);
      this.frontD = fd; this.frontNode = fn;
    }
    return m;
  }

  tick(time: number) {
    this.uniforms.uTime.value = time;
  }

  /** dir points toward the light in world space. */
  setSun(dir: THREE.Vector3, col: THREE.Color, intensity: number, view: THREE.Matrix4) {
    this.uniforms.uSunDirV.value.copy(dir).transformDirection(view);
    this.uniforms.uSunCol.value.copy(col).multiplyScalar(intensity * 0.35);
  }

  /**
   * Lighting for the CPU leaf bake: camera position, direction toward the key light as the shadow-casting light sees it,
   * key colour × intensity, hemisphere sky/ground × intensity (all linear).
   */
  setLighting(cam: THREE.Vector3, sunDir: THREE.Vector3, sunCol: THREE.Color, sky: THREE.Color, ground: THREE.Color) {
    const L = this.lit;
    L.cam.copy(cam); L.sun.copy(sunDir).normalize(); L.sunCol.copy(sunCol); L.sky.copy(sky); L.ground.copy(ground);
  }

  /** Sun transmittance per light-grid voxel: exp(-k · leafy density) marched from the voxel toward the sun. */
  private sunTransmittance(sim: TreeSim): Float32Array | null {
    const G = sim.lightGrid;
    if (!G) return null;
    const L = this.lit.sun;
    const key = `${sim.lightVersion}|${L.x.toFixed(2)},${L.y.toFixed(2)},${L.z.toFixed(2)}`;
    if (key === this.sunTKey && this.sunT) return this.sunT;
    this.sunTKey = key;
    const { dens, nx, ny, nz } = G;
    const T = this.sunT && this.sunT.length === dens.length ? this.sunT : new Float32Array(dens.length);
    const k = 0.05, sx = L.x, sy = Math.max(0.05, L.y), sz = L.z;
    for (let y = 0; y < ny; y++) for (let z = 0; z < nz; z++) for (let x = 0; x < nx; x++) {
      const c = (y * nz + z) * nx + x;
      let acc = dens[c] * 0.5, px = x + 0.5, py = y + 0.5, pz = z + 0.5;
      for (let i = 0; i < 64; i++) {
        px += sx; py += sy; pz += sz;
        const ix = Math.floor(px), iy = Math.floor(py), iz = Math.floor(pz);
        if (ix < 0 || iy < 0 || iz < 0 || ix >= nx || iy >= ny || iz >= nz) break;
        acc += dens[(iy * nz + iz) * nx + ix];
      }
      T[c] = Math.exp(-k * acc);
    }
    return (this.sunT = T);
  }

  /** Emissive glow colour (already scaled by strength and night factor). */
  setGlow(c: THREE.Color, day = 1) {
    this.uniforms.uGlow.value.copy(c);
    // Safe path: emissive = faint daylight sky fill through the blades (fake translucency) + bioluminescence.
    const m = this.material as THREE.MeshLambertMaterial;
    if (m.isMeshLambertMaterial && this.variant?.emissive) m.emissive.setRGB(0.05 * day, 0.075 * day, 0.022 * day).add(c);
  }

  /** Whole pass in one call (first frame, fast-forward, scripts). Returns a replacement mesh when capacity grew. */
  update(sim: TreeSim, p: ArborParams, time: number): THREE.InstancedMesh | null {
    const repl = this.beginPass(sim, time);
    this.stepPass(sim, p, Infinity);
    return repl;
  }

  /**
   * Open a leaf pass: snapshot its inputs (lighting was set by `setLighting`, sim time, leaf count, rank thinning, sun
   * transmittance) and reset the cursor. An open pass is restarted. Returns a replacement mesh when capacity grew
   * (caller swaps it in the scene); the mesh is created at its final capacity, so this is a fallback.
   */
  beginPass(sim: TreeSim, time: number): THREE.InstancedMesh | null {
    this.uniforms.uTime.value = time;
    let replaced: THREE.InstancedMesh | null = null;
    // Grow only when the last pass came within 10% of the capacity (a pass never writes past it); a capped mesh (Low)
    // never needs more than its cap.
    if (this.lastN > this.capacity * 0.9 && sim.leaves.length * 2 > this.capacity && (this.maxInstances <= 0 || this.capacity < this.maxInstances)) {
      const old = this.mesh;
      this.mesh = this.makeMesh(Math.max(sim.leaves.length * 3, this.capacity * 2));
      old.dispose();
      replaced = this.mesh;
    }
    this.passT = this.variant ? this.sunTransmittance(sim) : null;
    this.passLi = 0; this.passEnd = sim.leaves.length; this.passN = 0; this.passCand = 0;
    this.passTime = sim.time; this.passRs = this.rankScale;
    this.passAcc = 0;
    this.passOpen = true;
    return replaced;
  }

  /** Drop an open pass without touching the drawn instances (tree was reset). */
  abortPass() { this.passOpen = false; this.followOk = false; }

  /**
   * Place instances [from, to) of a record set from the live node transforms into `out` (16 floats each, starting at
   * `o`). The only code that turns a leaf record into a matrix: the pass uses it for the bake normal/position and
   * `follow` for the drawn matrices, so the two cannot disagree.
   */
  private place(D: Float32Array, ND: Int32Array, from: number, to: number, sim: TreeSim, p: ArborParams, cx: number, cy: number, cz: number, out: Float32Array, o: number) {
    const nodes = sim.nodes, lp = p.leaves, now = sim.time;
    const H = Math.max(2, sim.bboxMax[1]);
    const sh = lp.shape, kx = sh >= 0 ? 1 - 0.7 * sh : 1 - 0.6 * sh, ky = sh >= 0 ? 1 + 0.9 * sh : 1 + 0.15 * sh;
    const f0 = lp.maxBranchRadius * 0.7, f1 = lp.maxBranchRadius, l0 = 0.9 * H, l1 = 2.6 * H;
    let last = -1, ok = false;
    let dx = 0, dy = 1, dz = 0, rx = 1, rz = 0, bx = 0, by = 0, bz = 0, px = 0, py = 0, pz = 0, ex = 0, ey = 0, ez = 0, rad = 0, fade = 1;
    for (let i = from; i < to; i++, o += 16) {
      const id = ND[i];
      if (id !== last) {
        last = id;
        const nd = nodes[id], pn = nd && nodes[nd.parent];
        ok = !!pn;
        if (pn) {
          dx = nd.wdx; dy = nd.wdy; dz = nd.wdz; rad = nd.radius;
          // Radial frame around the branch (ry = 0).
          if (Math.abs(dy) < 0.9) { const rl = Math.hypot(dz, dx) || 1; rx = -dz / rl; rz = dx / rl; } else { rx = 1; rz = 0; }
          bx = dy * rz; by = dz * rx - dx * rz; bz = -dy * rx;
          px = pn.wx; py = pn.wy; pz = pn.wz; ex = nd.wx - px; ey = nd.wy - py; ez = nd.wz - pz;
          fade = 1 - smooth(f0, f1, rad);
        }
      }
      if (!ok) continue;
      const k = i * LEAF_D;
      const t = D[k], ca = D[k + 1], sa = D[k + 2], ct = D[k + 3], st = D[k + 4], cr = D[k + 5], sr = D[k + 6];
      // Position along the segment, offset to the bark surface.
      const ox = rx * ca + bx * sa, oy = by * sa, oz = rz * ca + bz * sa;
      const x = px + ex * t + ox * rad, y = py + ey * t + oy * rad, z = pz + ez * t + oz * rad;
      // Leaf axis: outward, tilted toward the branch tip, drooping slightly.
      let ayx = ox * ct + dx * st, ayy = oy * ct + dy * st - 0.25, ayz = oz * ct + dz * st;
      let il = 1 / (Math.sqrt(ayx * ayx + ayy * ayy + ayz * ayz) || 1);
      ayx *= il; ayy *= il; ayz *= il;
      // Face toward the sky as much as possible (ax = up × ay), then roll about the leaf axis.
      let axx = ayz, axz = -ayx;
      const al = axx * axx + axz * axz;
      if (al < 1e-6) { axx = 1; axz = 0; } else { il = 1 / Math.sqrt(al); axx *= il; axz *= il; }
      let azx = -axz * ayy, azy = axz * ayx - axx * ayz, azz = axx * ayy;
      il = 1 / (Math.sqrt(azx * azx + azy * azy + azz * azz) || 1);
      azx *= il; azy *= il; azz *= il;
      const rxx = axx * cr - azx * sr, rxy = -azy * sr, rxz = axz * cr - azz * sr;
      const rzx = axx * sr + azx * cr, rzy = azy * cr, rzz = axz * sr + azz * cr;
      // Size: unfolding, fade on thickening wood, distance LOD (up to 1.5x far from the camera so the silhouette fills).
      const ddx = x - cx, ddy = y - cy, ddz = z - cz;
      const s = D[k + 7] * smooth(0, GROW_TIME, now - D[k + 8]) * fade * (1 + 0.5 * smooth(l0, l1, Math.sqrt(ddx * ddx + ddy * ddy + ddz * ddz)));
      const sx = s * kx, sy = s * ky;
      out[o] = rxx * sx; out[o + 1] = rxy * sx; out[o + 2] = rxz * sx; out[o + 3] = 0;
      out[o + 4] = ayx * sy; out[o + 5] = ayy * sy; out[o + 6] = ayz * sy; out[o + 7] = 0;
      out[o + 8] = rzx * s; out[o + 9] = rzy * s; out[o + 10] = rzz * s; out[o + 11] = 0;
      out[o + 12] = x; out[o + 13] = y; out[o + 14] = z; out[o + 15] = 1;
    }
  }

  /**
   * Re-place every drawn instance on its node's current transform and upload the matrices (colours stay those of the
   * last completed pass; same instance order). Cheap enough to run on every branch rebuild. `cam` drives the size LOD.
   */
  follow(sim: TreeSim, p: ArborParams, cam: THREE.Vector3, budgetMs = Infinity): boolean {
    const n = this.mesh.count;
    if (!this.followOk || n === 0) return false;
    const t0 = performance.now();
    const M = this.mesh.instanceMatrix, arr = M.array as Float32Array;
    M.clearUpdateRanges();
    // Round-robin in chunks of 1024 instances until the budget is spent (a whole sweep when it fits); only the
    // touched ranges are uploaded. Leaves so move in small staggered steps, never the whole crown at once.
    let at = this.followAt >= n ? 0 : this.followAt, left = n;
    while (left > 0) {
      const to = Math.min(n, at + 1024);
      this.place(this.frontD, this.frontNode, at, to, sim, p, cam.x, cam.y, cam.z, arr, at * 16);
      M.addUpdateRange(at * 16, (to - at) * 16);
      left -= to - at;
      at = to >= n ? 0 : to;
      if (performance.now() - t0 >= budgetMs) break;
    }
    this.followAt = at;
    M.needsUpdate = true;
    this.followMs = performance.now() - t0;
    if (this.followMs > this.followMaxMs) this.followMaxMs = this.followMs;
    this.follows++;
    return true;
  }

  /**
   * Run the open pass for at most `budgetMs` (checked every 256 sim leaves) into the back buffers. When the last leaf
   * is done the back buffers are copied into the instance attributes and uploaded once. Returns true when the pass
   * completed in this call.
   */
  stepPass(sim: TreeSim, p: ArborParams, budgetMs: number, cam: THREE.Vector3 = this.lit.cam): boolean {
    if (!this.passOpen) return false;
    const t0 = performance.now();
    const lp = p.leaves;
    const nodes = sim.nodes;
    const carr = this.backC;
    const D = this.backD, ND = this.backNode, e = this.scratch;
    // Safe (Lambert, no leaf shadows, no translucency): the instance colour carries the whole bake. Full path: the shader
    // does sun, shadows and translucency, so only albedo × sky occlusion is baked.
    const bakeAll = !!this.variant;
    const T = this.passT;
    const G = sim.lightGrid;
    const Lt = this.lit, L = Lt.sun, mm = this.mapMean;
    const rs = this.passRs, now = this.passTime;
    let n = this.passN;
    let cand = this.passCand;
    const cap = this.capacity;
    const camX = Lt.cam.x, camY = Lt.cam.y, camZ = Lt.cam.z;
    const end = Math.min(this.passEnd, sim.leaves.length);
    let li = this.passLi;
    for (; li < end; li++) {
      if ((li & 255) === 255 && performance.now() - t0 >= budgetMs) break;
      const lf = sim.leaves[li];
      if (lf.rank * 4 >= lp.density) continue;
      const nd = nodes[lf.node];
      if (!nd || sim.chains[nd.chain].pruned) continue;
      // No leaf chains on hanging twigs (steeply down-pointing segments read as strands under the crown).
      if (nd.wdy < -0.75) continue;
      // Outer-shell fill: sunlit-shell clumps get up to one extra leaf per sim leaf (8 → ~13 per node), the shaded
      // interior stays sparse. Copies come from a per-leaf hash (render-only; the sim rng and tree shapes are untouched).
      hs = (li * 2246822519 + lf.node * 3266489917 + 374761393) >>> 0;
      const shell = smooth(0.06, 0.4, nd.light); // light is mostly 0..0.4 in a grown crown
      const copies = hr() < 0.85 * shell ? 2 : 1;
      for (let cp = 0; cp < copies; cp++) {
      const rank = cp === 0 ? lf.rank : (lf.rank + hr()) % 1;
      cand++;
      if (rank * 4 >= lp.density * rs || n >= cap) continue;
      const fade = 1 - smooth(lp.maxBranchRadius * 0.7, lp.maxBranchRadius, nd.radius);
      const grow = smooth(0, GROW_TIME, now - lf.born);
      const size = lp.size * lf.size * (cp === 0 ? 1 : 0.8 + 0.25 * hr());
      if (size * grow * fade < 1e-4) continue;
      const t = cp === 0 ? lf.t : 0.45 + 0.55 * hr();
      const around = cp === 0 ? lf.around : lf.around + 1.9 + 0.8 * hr();
      const tilt = cp === 0 ? lf.tilt : 0.3 + 0.7 * hr();
      const roll = cp === 0 ? lf.roll : (hr() - 0.5) * 1.4;
      const k = n * LEAF_D;
      D[k] = t; D[k + 1] = Math.cos(around); D[k + 2] = Math.sin(around); D[k + 3] = Math.cos(tilt); D[k + 4] = Math.sin(tilt);
      D[k + 5] = Math.cos(roll); D[k + 6] = Math.sin(roll); D[k + 7] = size; D[k + 8] = lf.born;
      ND[n] = lf.node;
      // Matrix for the bake only (normal, position); the drawn matrices come from `follow` when the pass completes.
      this.place(D, ND, n, n + 1, sim, p, camX, camY, camZ, e, 0);
      this.pos.set(e[12], e[13], e[14]);
      // Albedo: per-leaf hue/value spread, young leaves lighter and yellower (sRGB HSL → linear).
      const young = 1 - smooth(2, 14, now - lf.born);
      const fresh = Math.max(young, 1 - smooth(10, 50, now - lf.born)) * 0.6 + young * 0.4;
      if (!bakeAll) {
        // Full path: deep natural greens (the shader adds sun, shadows and translucency glow on top). Effective albedo =
        // instance colour × map; normalise by the map mean to the pale reference map the albedo was tuned against, so
        // the painted texture adds detail without brightening. Dark interior via the light grid.
        const ao = 0.45 + 0.55 * Math.min(1, nd.light * 1.4);
        this.col.setHSL(
          lp.hue + (lf.tint - 0.5) * 0.06 - young * 0.05,
          Math.min(1, lp.saturation * (0.8 + lf.tint * 0.35) + young * 0.12),
          Math.min(0.85, (0.19 + lf.tint * 0.1 + young * 0.1) * ao * lp.lightness),
          THREE.SRGBColorSpace,
        );
        this.col.r *= REF_MAP_MEAN.r / mm.r; this.col.g *= REF_MAP_MEAN.g / mm.g; this.col.b *= REF_MAP_MEAN.b / mm.b;
        carr[n * 3] = this.col.r; carr[n * 3 + 1] = this.col.g; carr[n * 3 + 2] = this.col.b;
        n++;
        continue;
      }
      this.col.setHSL(
        lp.hue + (lf.tint - 0.5) * 0.07 - fresh * 0.05,
        Math.min(1, lp.saturation * (0.85 + lf.tint * 0.35) + fresh * 0.12),
        Math.min(0.85, (0.3 + lf.tint * 0.12 + fresh * 0.12) * lp.lightness),
        THREE.SRGBColorSpace,
      );
      // Sky occlusion from the light grid: bright outer shell → dark (green, never black) interior.
      const occ = 0.42 + 0.78 * smooth(0.15, 0.85, nd.light);
      let kr: number, kg: number, kb: number;
      if (!bakeAll) {
        const k = 0.5 + 0.5 * occ;
        kr = kg = kb = k;
      } else {
        // Leaf normal (blade +Z of the instance basis) and the face the camera sees.
        const il = 1 / (Math.hypot(e[8], e[9], e[10]) || 1);
        let nx = e[8] * il, ny = e[9] * il, nz = e[10] * il;
        let vx = Lt.cam.x - this.pos.x, vy = Lt.cam.y - this.pos.y, vz = Lt.cam.z - this.pos.z;
        const vl = 1 / (Math.hypot(vx, vy, vz) || 1);
        vx *= vl; vy *= vl; vz *= vl;
        if (nx * vx + ny * vy + nz * vz < 0) { nx = -nx; ny = -ny; nz = -nz; }
        // Sun visibility: grid transmittance toward the sun, softened by the outer-shell factor.
        let vis = 0.35 + 0.65 * occ;
        if (T && G) {
          const gx = Math.floor((this.pos.x - G.ox) / G.cell), gy = Math.floor((this.pos.y - G.oy) / G.cell), gz = Math.floor((this.pos.z - G.oz) / G.cell);
          if (gx >= 0 && gy >= 0 && gz >= 0 && gx < G.nx && gy < G.ny && gz < G.nz) vis = Math.min(1, T[(gy * G.nz + gz) * G.nx + gx] * (0.75 + 0.5 * occ));
          else vis = 1;
        }
        // Per-leaf dapple so the sunlit shell doesn't read as one flat sheet.
        vis *= 0.7 + 0.3 * lf.tint;
        const ndl = nx * L.x + ny * L.y + nz * L.z;
        const hw = 0.5 * ny + 0.5;
        // Lambert will apply: E_l = hemi(n) + sun · max(0, n·L). We want: E_w = hemi(n) · occ + sun · |n·L| · vis + glow.
        const into = Math.max(0, -(vx * L.x + vy * L.y + vz * L.z)); // sun behind the leaf as seen from the camera
        const glow = (0.15 * (ndl < 0 ? 1 : 0.3) + 0.55 * into * into) * vis;
        const sd = Math.abs(ndl) * vis;
        kr = bakeCh(Lt.sky.r, Lt.ground.r, Lt.sunCol.r, 1.0, mm.r, hw, ndl, occ, sd, glow);
        kg = bakeCh(Lt.sky.g, Lt.ground.g, Lt.sunCol.g, 1.15, mm.g, hw, ndl, occ, sd, glow);
        kb = bakeCh(Lt.sky.b, Lt.ground.b, Lt.sunCol.b, 0.35, mm.b, hw, ndl, occ, sd, glow);
      }
      if (!bakeAll) { kr /= mm.r; kg /= mm.g; kb /= mm.b; }
      this.col.r *= kr; this.col.g *= kg; this.col.b *= kb;
      carr[n * 3] = this.col.r; carr[n * 3 + 1] = this.col.g; carr[n * 3 + 2] = this.col.b;
      n++;
      }
    }
    this.passLi = li; this.passN = n; this.passCand = cand;
    this.passAcc += performance.now() - t0;
    if (li < end) return false;
    this.passOpen = false;
    this.passes++;
    const C = this.mesh.instanceColor!;
    // Swap the record sets together with the colours, then place the new set on the nodes as they are now (the pass
    // ran over many frames, so matrices computed during it would be stale and uneven).
    this.backD = this.frontD; this.frontD = D;
    this.backNode = this.frontNode; this.frontNode = ND;
    this.followOk = true;
    (C.array as Float32Array).set(n * 3 === carr.length ? carr : carr.subarray(0, n * 3));
    this.mesh.count = n;
    this.lastN = n;
    // Phone budget: thin by rank (whole clumps stay, sparser everywhere) so the next pass draws ≤ maxInstances.
    this.rankScale = this.maxInstances > 0 && cand > this.maxInstances ? this.maxInstances / cand : 1;
    this.follow(sim, p, cam);
    C.clearUpdateRanges();
    C.addUpdateRange(0, n * 3);
    C.needsUpdate = true;
    this.passMs = this.passAcc;
    return true;
  }
}

/** Per-leaf hash state for the render-only shell copies (module level: no closure per leaf). */
let hs = 0;
function hr() { hs ^= hs << 13; hs >>>= 0; hs ^= hs >>> 17; hs ^= hs << 5; hs >>>= 0; return hs / 4294967296; }

/** One colour channel of the safe-path bake: wanted irradiance over what the Lambert shader will add, over the map mean. */
function bakeCh(sky: number, gr: number, sun: number, tint: number, i: number, hw: number, ndl: number, occ: number, sd: number, glow: number) {
  const hemi = gr + (sky - gr) * hw;
  const El = hemi + sun * Math.max(0, ndl);
  const Ew = hemi * occ + sun * (sd + glow * tint);
  return Math.min(8, Ew / Math.max(0.02, El)) / i;
}

/** Mean linear colour of the pale pre-painted leaf map the full-path albedo was tuned against. */
const REF_MAP_MEAN = new THREE.Color(0.7, 0.78, 0.6);

function smooth(a: number, b: number, x: number) {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a || 1e-6)));
  return t * t * (3 - 2 * t);
}

/** Mean linear RGB of the opaque texels of a canvas-backed leaf map (fallback: pale green). */
function mapMeanColor(map: THREE.Texture): THREE.Color {
  const out = new THREE.Color(0.7, 0.78, 0.6);
  const img = map.image as HTMLCanvasElement | undefined;
  const ctx = img && typeof img.getContext === 'function' ? img.getContext('2d') : null;
  if (!ctx) return out;
  const d = ctx.getImageData(0, 0, img!.width, img!.height).data;
  let r = 0, g = 0, b = 0, n = 0;
  for (let i = 0; i < d.length; i += 16) if (d[i + 3] >= 128) { r += d[i]; g += d[i + 1]; b += d[i + 2]; n++; }
  if (!n) return out;
  return out.setRGB(r / n / 255, g / n / 255, b / n / 255, THREE.SRGBColorSpace);
}

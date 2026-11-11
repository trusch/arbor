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

/** Instanced leaves attached to young segments, with vertex-shader wind sway. */
export class Leaves {
  mesh!: THREE.InstancedMesh;
  private material: THREE.Material;
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
  private q = new THREE.Quaternion();
  private col = new THREE.Color();
  private ax = new THREE.Vector3();
  private ay = new THREE.Vector3();
  private az = new THREE.Vector3();
  private basis = new THREE.Matrix4();
  private scl = new THREE.Vector3();
  private pos = new THREE.Vector3();

  constructor(map: THREE.Texture, mode: LeafMode = { shader: 'full', shadow: true }) {
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
      this.mesh = this.makeMesh(1024);
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
    this.mesh = this.makeMesh(1024);
  }

  private makeMesh(cap: number) {
    const v = this.variant;
    const geo = this.mesh ? this.mesh.geometry : !v ? leafGeometry()
      : v.geo === 'quad' ? doubledLeafGeometry(v.vertexColors) : polyLeafGeometry(v.map !== null, v.vertexColors);
    const m = new THREE.InstancedMesh(geo, this.material, cap);
    m.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    m.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(cap * 3), 3).setUsage(THREE.DynamicDrawUsage);
    m.castShadow = this.mode.shadow;
    m.receiveShadow = this.mode.shadow;
    m.frustumCulled = false;
    m.count = 0;
    this.capacity = cap;
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

  /** Returns a replacement mesh when capacity grew (caller swaps it in the scene). */
  update(sim: TreeSim, p: ArborParams, time: number): THREE.InstancedMesh | null {
    this.uniforms.uTime.value = time;
    let replaced: THREE.InstancedMesh | null = null;
    if (sim.leaves.length > this.capacity) {
      const old = this.mesh;
      this.mesh = this.makeMesh(Math.max(sim.leaves.length * 2, this.capacity * 2));
      old.dispose();
      replaced = this.mesh;
    }
    const lp = p.leaves;
    const nodes = sim.nodes;
    const arr = this.mesh.instanceMatrix.array as Float32Array;
    const carr = this.mesh.instanceColor!.array as Float32Array;
    // Safe (Lambert, no leaf shadows, no translucency): the instance colour carries the whole bake. Full path: the shader
    // does sun, shadows and translucency, so only albedo × sky occlusion is baked.
    const bakeAll = !!this.variant;
    const T = bakeAll ? this.sunTransmittance(sim) : null;
    const G = sim.lightGrid;
    const Lt = this.lit, L = Lt.sun, mm = this.mapMean;
    const rs = this.rankScale;
    let n = 0;
    let cand = 0;
    for (const lf of sim.leaves) {
      if (lf.rank * 4 >= lp.density) continue;
      cand++;
      if (lf.rank * 4 >= lp.density * rs) continue;
      const nd = nodes[lf.node];
      if (sim.chains[nd.chain].pruned) continue;
      const fade = 1 - smooth(lp.maxBranchRadius * 0.7, lp.maxBranchRadius, nd.radius);
      const grow = smooth(0, GROW_TIME, sim.time - lf.born);
      const s = lp.size * lf.size * grow * fade;
      if (s < 1e-4) continue;
      // No leaf chains on hanging twigs (steeply down-pointing segments read as strands under the crown).
      if (nd.wdy < -0.75) continue;
      const pn = nodes[nd.parent];
      // Position along segment, offset to bark surface.
      const t = lf.t;
      const dx = nd.wdx, dy = nd.wdy, dz = nd.wdz;
      // Radial direction around the branch.
      let rx = Math.abs(dy) < 0.9 ? -dz : 1, ry = 0, rz = Math.abs(dy) < 0.9 ? dx : 0;
      const rl = Math.hypot(rx, ry, rz) || 1;
      rx /= rl; rz /= rl;
      const bx = dy * rz - dz * ry, by = dz * rx - dx * rz, bz = dx * ry - dy * rx;
      const c = Math.cos(lf.around), sn = Math.sin(lf.around);
      const ox = rx * c + bx * sn, oy = ry * c + by * sn, oz = rz * c + bz * sn;
      this.pos.set(
        pn.wx + (nd.wx - pn.wx) * t + ox * nd.radius,
        pn.wy + (nd.wy - pn.wy) * t + oy * nd.radius,
        pn.wz + (nd.wz - pn.wz) * t + oz * nd.radius,
      );
      // Leaf axis: outward, tilted toward the branch tip, drooping slightly.
      this.ay.set(ox * Math.cos(lf.tilt) + dx * Math.sin(lf.tilt), oy * Math.cos(lf.tilt) + dy * Math.sin(lf.tilt) - 0.25, oz * Math.cos(lf.tilt) + dz * Math.sin(lf.tilt)).normalize();
      // Face toward the sky as much as possible, with a random roll.
      this.ax.set(0, 1, 0).cross(this.ay);
      if (this.ax.lengthSq() < 1e-6) this.ax.set(1, 0, 0);
      this.ax.normalize();
      this.az.crossVectors(this.ax, this.ay).normalize();
      this.basis.makeBasis(this.ax, this.ay, this.az);
      this.q.setFromRotationMatrix(this.basis);
      this.q.multiply(new THREE.Quaternion().setFromAxisAngle(this.ay.set(0, 1, 0), lf.roll));
      // Blade shape: >0 long and narrow, <0 broad fan.
      const sh = lp.shape;
      this.scl.set(s * (sh >= 0 ? 1 - 0.7 * sh : 1 - 0.6 * sh), s * (sh >= 0 ? 1 + 0.9 * sh : 1 + 0.15 * sh), s);
      this.m.compose(this.pos, this.q, this.scl);
      this.m.toArray(arr, n * 16);
      // Albedo: per-leaf hue/value spread, young leaves lighter and yellower (sRGB HSL → linear).
      const young = 1 - smooth(2, 14, sim.time - lf.born);
      const fresh = Math.max(young, 1 - smooth(10, 50, sim.time - lf.born)) * 0.6 + young * 0.4;
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
        const e = this.m.elements, il = 1 / (Math.hypot(e[8], e[9], e[10]) || 1);
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
        const ch = (sky: number, gr: number, sun: number, tint: number, i: number) => {
          const hemi = gr + (sky - gr) * hw;
          const El = hemi + sun * Math.max(0, ndl);
          const Ew = hemi * occ + sun * (sd + glow * tint);
          return Math.min(8, Ew / Math.max(0.02, El)) / i;
        };
        kr = ch(Lt.sky.r, Lt.ground.r, Lt.sunCol.r, 1.0, mm.r);
        kg = ch(Lt.sky.g, Lt.ground.g, Lt.sunCol.g, 1.15, mm.g);
        kb = ch(Lt.sky.b, Lt.ground.b, Lt.sunCol.b, 0.35, mm.b);
      }
      if (!bakeAll) { kr /= mm.r; kg /= mm.g; kb /= mm.b; }
      this.col.r *= kr; this.col.g *= kg; this.col.b *= kb;
      carr[n * 3] = this.col.r; carr[n * 3 + 1] = this.col.g; carr[n * 3 + 2] = this.col.b;
      n++;
    }
    this.mesh.count = n;
    // Phone budget: thin by rank (whole clumps stay, sparser everywhere) so the next rebuild draws ≤ maxInstances.
    this.rankScale = this.maxInstances > 0 && cand > this.maxInstances ? this.maxInstances / cand : 1;
    this.mesh.instanceMatrix.clearUpdateRanges();
    this.mesh.instanceMatrix.addUpdateRange(0, n * 16);
    this.mesh.instanceMatrix.needsUpdate = true;
    this.mesh.instanceColor!.clearUpdateRanges();
    this.mesh.instanceColor!.addUpdateRange(0, n * 3);
    this.mesh.instanceColor!.needsUpdate = true;
    return replaced;
  }
}

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

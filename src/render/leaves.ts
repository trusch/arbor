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

/**
 * Leaf-shaped polygon for the safe/basic path: no texture, no alpha test, crisp silhouette.
 * Midrib along +Y (base at origin after the petiole gap), 5 stations per side, halves folded up along the midrib
 * so they shade differently. Front and reversed-winding back copy (FrontSide renders both faces, no gl_FrontFacing).
 * Vertex colours: lighter midrib, darker base, so the instance colour reads as a leaf rather than a flat chip.
 */
function polyLeafGeometry(): THREE.BufferGeometry {
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
  const P2 = new Float32Array(n * 6), N2 = new Float32Array(n * 6), C2 = new Float32Array(n * 6);
  P2.set(pos); N2.set(nor); C2.set(C);
  for (let t = 0; t < n; t += 3) for (let k = 0; k < 3; k++) {
    const src = t + [0, 2, 1][k], dst = n + t + k;
    for (let c = 0; c < 3; c++) { P2[dst * 3 + c] = pos[src * 3 + c]; N2[dst * 3 + c] = -nor[src * 3 + c]; C2[dst * 3 + c] = C[src * 3 + c] * 0.85; }
  }
  const out = new THREE.BufferGeometry();
  out.setAttribute('position', new THREE.BufferAttribute(P2, 3));
  out.setAttribute('normal', new THREE.BufferAttribute(N2, 3));
  out.setAttribute('color', new THREE.BufferAttribute(C2, 3));
  g.dispose();
  return out;
}

/**
 * Leaf render mode. 'full': MeshStandardMaterial + onBeforeCompile (translucency, glow, GPU wind), DoubleSide, casts shadows.
 * 'safe': MeshLambertMaterial on a leaf-shaped polygon (no texture, no alpha), vertex + instance colours, small emissive
 *   sky fill, FrontSide on doubled geometry, no shadows, no wind, no shader patching (for PowerVR/mobile).
 * 'basic': MeshBasicMaterial (unlit), otherwise as 'safe'. shadow=false turns leaf shadow cast/receive off on any shader.
 */
export interface LeafMode { shader: 'full' | 'safe' | 'basic'; shadow: boolean }

const GROW_TIME = 3; // seconds for a leaf to unfold

/** Instanced leaves attached to young segments, with vertex-shader wind sway. */
export class Leaves {
  mesh!: THREE.InstancedMesh;
  private material: THREE.Material;
  readonly mode: LeafMode;
  private uniforms = {
    uTime: { value: 0 },
    uWind: { value: 1 },
    uSunDirV: { value: new THREE.Vector3(0, 1, 0) },
    uSunCol: { value: new THREE.Color(1, 1, 1) },
    uGlow: { value: new THREE.Color(0, 0, 0) },
  };
  private capacity = 0;
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
    if (mode.shader !== 'full') {
      // No map/alpha: the polygon is the silhouette (alpha-tested cards showed grey ghost quads on PowerVR).
      const o = { vertexColors: true, side: THREE.FrontSide };
      this.material = mode.shader === 'basic' ? new THREE.MeshBasicMaterial(o)
        : new THREE.MeshLambertMaterial({ ...o, emissive: new THREE.Color(0.05, 0.075, 0.025) });
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
    const geo = this.mesh ? this.mesh.geometry : this.mode.shader === 'full' ? leafGeometry() : polyLeafGeometry();
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

  /** Emissive glow colour (already scaled by strength and night factor). */
  setGlow(c: THREE.Color, day = 1) {
    this.uniforms.uGlow.value.copy(c);
    // Safe path: emissive = faint daylight sky fill through the blades (fake translucency) + bioluminescence.
    const m = this.material as THREE.MeshLambertMaterial;
    if (m.isMeshLambertMaterial) m.emissive.setRGB(0.05 * day, 0.075 * day, 0.022 * day).add(c);
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
    const safe = this.mode.shader !== 'full';
    let n = 0;
    for (const lf of sim.leaves) {
      if (lf.rank * 4 >= lp.density) continue;
      const nd = nodes[lf.node];
      if (sim.chains[nd.chain].pruned) continue;
      const fade = 1 - smooth(lp.maxBranchRadius * 0.7, lp.maxBranchRadius, nd.radius);
      const grow = smooth(0, GROW_TIME, sim.time - lf.born);
      const s = lp.size * lf.size * grow * fade;
      if (s < 1e-4) continue;
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
      // Deep green, darker inside the crown (light grid), young leaves lighter and yellower.
      const young = 1 - smooth(2, 14, sim.time - lf.born);
      const ao = 0.45 + 0.55 * Math.min(1, nd.light * 1.4);
      if (safe) {
        // Safe path has no translucency/env term: brighter, wider spread (young yellow-green, older deeper).
        const fresh = Math.max(young, 1 - smooth(10, 50, sim.time - lf.born)) * 0.6 + young * 0.4;
        this.col.setHSL(
          lp.hue + (lf.tint - 0.5) * 0.06 - fresh * 0.045,
          Math.min(1, lp.saturation * (0.9 + lf.tint * 0.3) + fresh * 0.1),
          Math.min(0.9, (0.27 + lf.tint * 0.1 + fresh * 0.1) * (0.6 + 0.4 * ao) * lp.lightness),
          THREE.SRGBColorSpace,
        );
      } else this.col.setHSL(
        lp.hue + (lf.tint - 0.5) * 0.045 - young * 0.05,
        lp.saturation * (0.85 + lf.tint * 0.3) + young * 0.12,
        Math.min(0.9, (0.2 + lf.tint * 0.09 + young * 0.1) * ao * lp.lightness),
        THREE.SRGBColorSpace,
      );
      carr[n * 3] = this.col.r; carr[n * 3 + 1] = this.col.g; carr[n * 3 + 2] = this.col.b;
      n++;
    }
    this.mesh.count = n;
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

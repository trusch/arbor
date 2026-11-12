import * as THREE from 'three';
import { terrainHeight } from './backdrop';

/**
 * Sun glow, moon and star detail, phone-safe (PowerVR rule): every material here is a clone of the canopy-shadow decal
 * `MeshBasicMaterial` (P-DECAL, like `rain.ts`) with only `map`, `color`, `opacity`, blending and depth state changed,
 * so no shader program is added. Camera-facing planes: an additive sun glow (plus a depth-free glare on Low), the moon (a painted map whose
 * pixels are redrawn when the phase moves) and an additive moon halo. Stars keep their `PointsMaterial`; twinkle,
 * colour, horizon and moon-glare dimming are written into the existing colour attribute.
 *
 * Depth: the clones keep `fog: true`, so the planes sit a few metres from the camera (fog there is < 0.1 %) and are
 * pushed to the far plane with `gl.depthRange(1, 1)` around their own draw call. Terrain, far trees and the crown then
 * hide them like any object at infinity, which is what lets the glow show through gaps in the leaves.
 */

const DEG = Math.PI / 180;
/** Synodic month in days: the phase advances 1 / MONTH per day of the day cycle. */
export const MOON_MONTH = 29.53;
/** Angular radius of the drawn moon in radians (0.6 degrees: about 2.3x the real one, so the markings survive on a phone). */
const MOON_R = 0.6 * DEG;

const smooth = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

/**
 * Moon direction. The moon trails the sun by `phase` of a day (0 = new, with the sun; 0.25 = first quarter, due south
 * at sunset; 0.5 = full, opposite the sun) and its declination runs opposite to the sun's toward full moon (a summer
 * full moon rides low). Same local frame and yaw as `sunDirection`.
 */
export function moonDirection(hour: number, latDeg: number, yawDeg: number, phase: number, out = new THREE.Vector3()) {
  const lat = latDeg * DEG, dec = 18 * DEG * Math.cos(phase * Math.PI * 2);
  const H = ((hour - 24 * phase - 12) / 24) * Math.PI * 2;
  const x = -Math.cos(dec) * Math.sin(H);
  const y = Math.sin(lat) * Math.sin(dec) + Math.cos(lat) * Math.cos(dec) * Math.cos(H);
  const z = Math.sin(lat) * Math.cos(dec) * Math.cos(H) - Math.cos(lat) * Math.sin(dec);
  const a = yawDeg * DEG, c = Math.cos(a), s = Math.sin(a);
  return out.set(x * c + z * s, y, -x * s + z * c).normalize();
}

/** Lit fraction of the disc, 0 (new) to 1 (full). */
export const moonIllum = (phase: number) => (1 - Math.cos(phase * Math.PI * 2)) / 2;

function hash2(x: number, y: number) {
  const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return s - Math.floor(s);
}
function vnoise(x: number, y: number) {
  const xi = Math.floor(x), yi = Math.floor(y), fx = x - xi, fy = y - yi;
  const u = fx * fx * (3 - 2 * fx), v = fy * fy * (3 - 2 * fy);
  return (hash2(xi, yi) * (1 - u) + hash2(xi + 1, yi) * u) * (1 - v) + (hash2(xi, yi + 1) * (1 - u) + hash2(xi + 1, yi + 1) * u) * v;
}

/** Soft radial glow: tight inner bloom, a medium skirt and a wide faint veil, fading to exactly 0 at the rim. */
function glowCanvas() {
  const S = 256, c = document.createElement('canvas');
  c.width = c.height = S;
  const g = c.getContext('2d')!, img = g.createImageData(S, S), d = img.data;
  for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {
    const r = Math.hypot(x + 0.5 - S / 2, y + 0.5 - S / 2) / (S / 2), e = Math.max(0, 1 - r * r);
    const f = (0.55 * Math.exp(-(r * r) / 0.0036) + 0.3 * Math.exp(-r / 0.12) + 0.15 * Math.exp(-r / 0.35)) * e * e;
    const i = (y * S + x) * 4;
    d[i] = d[i + 1] = d[i + 2] = 255;
    // Dither: the wide veil spans few 8-bit steps and would band on a dark sky.
    d[i + 3] = Math.max(0, Math.min(255, Math.round(f * 255 + hash2(x, y) - 0.5)));
  }
  g.putImageData(img, 0, 0);
  return c;
}

const MS = 128;
// Maria (dark basalt plains) as soft blobs: x right, y up on the disc, radius, darkness. Rough near-side layout.
const MARIA: [number, number, number, number][] = [
  [-0.3, 0.42, 0.3, 0.5], [0.12, 0.38, 0.19, 0.45], [0.36, 0.14, 0.22, 0.48], [0.6, 0.3, 0.11, 0.5], [0.5, -0.1, 0.17, 0.4],
  [-0.56, 0.1, 0.34, 0.42], [-0.3, -0.28, 0.2, 0.38], [-0.08, -0.38, 0.17, 0.34], [-0.52, -0.38, 0.12, 0.36], [0.24, -0.02, 0.13, 0.3],
];
// Bright young craters: x, y, radius, gain (Tycho, Copernicus, Kepler, Aristarchus).
const CRATERS: [number, number, number, number][] = [[-0.08, -0.68, 0.05, 0.5], [-0.3, 0.14, 0.04, 0.35], [-0.58, 0.12, 0.03, 0.3], [-0.66, 0.4, 0.03, 0.4]];

/** Surface brightness of the full disc (0..1 per pixel, −1 outside), computed once. */
function moonAlbedo() {
  const a = new Float32Array(MS * MS);
  for (let j = 0; j < MS; j++) for (let i = 0; i < MS; i++) {
    const x = ((i + 0.5) / MS) * 2 - 1, y = 1 - ((j + 0.5) / MS) * 2, r = Math.hypot(x, y) / 0.94;
    if (r > 1.03) { a[j * MS + i] = -1; continue; }
    const wx = x + 0.09 * (vnoise(x * 4 + 3, y * 4) - 0.5), wy = y + 0.09 * (vnoise(x * 4, y * 4 + 7) - 0.5);
    let dark = 0;
    for (const [mx, my, mr, md] of MARIA) dark = Math.max(dark, md * (1 - smooth(mr * 0.55, mr * 1.15, Math.hypot(wx - mx, wy - my))));
    let v = 0.86 - dark + 0.1 * (vnoise(x * 9, y * 9) - 0.5) + 0.07 * (vnoise(x * 23, y * 23) - 0.5);
    for (const [cx, cy, cr, cg] of CRATERS) {
      const dd = Math.hypot(x - cx, y - cy);
      v += cg * Math.exp(-(dd * dd) / (cr * cr)) + cg * 0.25 * Math.exp(-dd / (cr * 5)) * (0.5 + 0.5 * vnoise(Math.atan2(y - cy, x - cx) * 9, 3));
    }
    // Slight limb darkening.
    a[j * MS + i] = Math.max(0.05, Math.min(1, v * (0.82 + 0.18 * Math.sqrt(Math.max(0, 1 - r * r)))));
  }
  return a;
}

export class Celestial {
  group = new THREE.Group();
  sunGlow: THREE.Mesh;
  sunGlare: THREE.Mesh;
  moon: THREE.Mesh;
  moonHalo: THREE.Mesh;
  /** Mean JS cost per frame = sumMs / frames; moonBakes = phase repaints of the moon map. */
  stats = { frames: 0, sumMs: 0, maxMs: 0, moonBakes: 0, phase: -1 };
  private moonCanvas = document.createElement('canvas');
  private moonTex: THREE.CanvasTexture;
  private moonImg: ImageData;
  private albedo = moonAlbedo();
  private bakedPhase = -1;
  private starBase: Float32Array;
  private starPhase: Float32Array;
  private starRate: Float32Array;
  private starCol: THREE.BufferAttribute;
  private starPos: THREE.BufferAttribute;
  private t = 0;
  private tick = 0;
  private vx = new THREE.Vector3();
  private vy = new THREE.Vector3();
  private vz = new THREE.Vector3();
  private basis = new THREE.Matrix4();
  private warm = new THREE.Color(1.0, 0.62, 0.3);
  private cool = new THREE.Color(0.88, 0.93, 1.0);
  private col = new THREE.Color();

  /** decal: the canopy-shadow material (program donor). stars: the existing starfield (its colour attribute is rewritten). */
  constructor(decal: THREE.MeshBasicMaterial, private stars: THREE.Points) {
    const tex = (cv: HTMLCanvasElement) => {
      const t = new THREE.CanvasTexture(cv);
      t.colorSpace = decal.map?.colorSpace ?? THREE.SRGBColorSpace;
      return t;
    };
    // The GTAO g-buffer pass must not see these planes (its override material would draw solid quads).
    const hidden = new THREE.MeshBasicMaterial({ visible: false });
    (hidden as unknown as { allowOverride: boolean }).allowOverride = false;
    const geo = new THREE.PlaneGeometry(1, 1);
    const glow = tex(glowCanvas());
    this.moonCanvas.width = this.moonCanvas.height = MS;
    this.moonImg = this.moonCanvas.getContext('2d')!.createImageData(MS, MS);
    this.moonTex = tex(this.moonCanvas);
    const plane = (map: THREE.Texture, order: number) => {
      const m = decal.clone();
      m.map = map;
      m.color.setRGB(1, 1, 1);
      m.blending = THREE.AdditiveBlending;
      m.depthWrite = false;
      const mesh = new THREE.Mesh(geo, m);
      mesh.renderOrder = order;
      mesh.visible = false;
      mesh.userData.gbufferMaterial = hidden;
      // Drawn at the far plane (see the header): GL state only, restored right after the draw call.
      mesh.onBeforeRender = (r) => r.getContext().depthRange(1, 1);
      mesh.onAfterRender = (r) => r.getContext().depthRange(0, 1);
      this.group.add(mesh);
      return mesh;
    };
    this.moonHalo = plane(glow, 1);
    this.moon = plane(this.moonTex, 2);
    this.sunGlow = plane(glow, 3);
    this.sunGlare = plane(glow, 9);
    (this.sunGlare.material as THREE.MeshBasicMaterial).depthTest = false;

    // Stars: a wider spread of brightness and colour temperature (data only; same attribute, same material).
    const g = stars.geometry;
    this.starPos = g.getAttribute('position') as THREE.BufferAttribute;
    this.starCol = g.getAttribute('color') as THREE.BufferAttribute;
    const n = this.starCol.count;
    this.starBase = new Float32Array(n * 3);
    this.starPhase = new Float32Array(n);
    this.starRate = new Float32Array(n);
    for (let i = 0; i < n; i++) {
      const h1 = hash2(i, 1.5), h2 = hash2(i, 7.25), h3 = hash2(i, 13.75);
      const old = this.starCol.array as Float32Array;
      // Fewer stars toward the horizon (extinction): baked, the starfield turns about the vertical axis.
      const y = this.starPos.getY(i) / 4000, b = old[i * 3 + 1] / 0.92 * (h1 > 0.985 ? 1.8 : 1) * (0.25 + 0.75 * smooth(0.0, 0.25, y));
      // Colour temperature: mostly white, some orange giants, some blue-white.
      const warm = h2 < 0.18 ? 1 : 0, blue = h2 > 0.7 ? 1 : 0, s = 0.25 + 0.75 * h3;
      this.starBase[i * 3] = b * (1 + 0.12 * warm * s - 0.22 * blue * s);
      this.starBase[i * 3 + 1] = b * (1 - 0.22 * warm * s - 0.08 * blue * s);
      this.starBase[i * 3 + 2] = b * (1 - 0.5 * warm * s + 0.15 * blue * s);
      this.starPhase[i] = h1 * 6.283;
      this.starRate[i] = 2.5 + 7 * h3;
    }
  }

  /** Repaint the moon map for a phase (0 new, 0.5 full): lit limb at +u while waxing, −u while waning; earthshine on the dark part. */
  private bakeMoon(phase: number) {
    const d = this.moonImg.data, A = this.albedo, c = Math.cos(phase * Math.PI * 2), waxing = phase < 0.5;
    const earth = 0.13 * (1 - moonIllum(phase)) + 0.04;
    for (let j = 0; j < MS; j++) for (let i = 0; i < MS; i++) {
      const o = (j * MS + i) * 4, a = A[j * MS + i];
      if (a < 0) { d[o] = d[o + 1] = d[o + 2] = 0; d[o + 3] = 0; continue; }
      const x = (((i + 0.5) / MS) * 2 - 1) / 0.94, y = (1 - ((j + 0.5) / MS) * 2) / 0.94, r = Math.hypot(x, y);
      const edge = Math.sqrt(Math.max(0, 1 - y * y));
      // Signed distance past the terminator toward the lit limb, in disc radii.
      const s = waxing ? x - c * edge : -c * edge - x;
      const lit = smooth(-0.03, 0.2, s) * (0.75 + 0.25 * Math.min(1, s * 1.5 + 0.3));
      const v = a * lit, e = earth * (0.5 + 0.5 * a);
      // sRGB bytes; the lit surface is slightly warm grey, earthshine blue-grey.
      d[o] = Math.min(255, 255 * Math.sqrt(v * v + e * e * 0.55));
      d[o + 1] = Math.min(255, 255 * Math.sqrt(v * v * 0.96 + e * e * 0.7));
      d[o + 2] = Math.min(255, 255 * Math.sqrt(v * v * 0.88 + e * e));
      d[o + 3] = 255 * (1 - smooth(0.97, 1.03, r));
    }
    this.moonCanvas.getContext('2d')!.putImageData(this.moonImg, 0, 0);
    this.moonTex.needsUpdate = true;
    this.bakedPhase = phase;
    this.stats.moonBakes++;
    this.stats.phase = phase;
  }

  private place(mesh: THREE.Mesh, cam: THREE.PerspectiveCamera, dir: THREE.Vector3, dist: number, angR: number) {
    mesh.position.copy(cam.position).addScaledVector(dir, dist);
    const s = 2 * dist * Math.tan(angR);
    mesh.scale.set(s, s, 1);
  }

  /**
   * Once per frame, right before `render` and after `Stage.applyWeather`. Every value is derived from the calm inputs
   * each frame and multiplied by (1 − cloud): nothing accumulates.
   * A: the atmosphere (sunDir, moonDir, sunH, night, sunColor, moonPhase). fogDensity: the live `FogExp2` density.
   */
  frame(cam: THREE.PerspectiveCamera, A: { sunDir: THREE.Vector3; moonDir: THREE.Vector3; sunH: number; night: number; sunColor: THREE.Color; moonPhase: number }, cloud: number, fogDensity: number, dt: number, lowQ: boolean) {
    const t0 = performance.now();
    this.t += dt;
    const clear = 1 - cloud;
    // Near enough that fog (which the cloned program keeps) stays under 0.1 %.
    const dist = Math.max(1, Math.min(30, 0.03 / Math.max(1e-5, fogDensity)));

    // ---- sun glow: small and white at noon, wide and warm toward the horizon, lingers as afterglow ----
    const h = A.sunH, low = 1 - smooth(0.0, 0.4, h), sunVis = smooth(-0.13, 0.0, h) * clear;
    const sg = this.sunGlow, sm = sg.material as THREE.MeshBasicMaterial;
    sg.visible = sunVis > 0.004;
    if (sg.visible) {
      this.place(sg, cam, A.sunDir, dist, (7 + 17 * low) * DEG);
      sg.lookAt(cam.position);
      const gain = (0.12 + 1.1 * low) * sunVis * (h < 0 ? 0.55 + 0.45 * smooth(-0.13, 0, h) : 1);
      sm.color.copy(A.sunColor).multiplyScalar(gain);
    }
    // Veiling glare (Low only; High has bloom): a small glow that ignores depth, so a low sun behind the crown bleeds
    // through and over the gaps. Off once the terrain hides the sun.
    let gv = lowQ ? 0.3 * low * smooth(0.0, 0.06, h) * clear : 0;
    if (gv > 0.004) {
      // Terrain horizon toward the sun (24 samples of the analytic height field): no glare once a ridge hides it.
      const hl = Math.hypot(A.sunDir.x, A.sunDir.z) || 1, ax = A.sunDir.x / hl, az = A.sunDir.z / hl;
      let hz = 0;
      for (let i = 0, d = 70; i < 24; i++, d *= 1.17) hz = Math.max(hz, (terrainHeight(cam.position.x + ax * d, cam.position.z + az * d) - cam.position.y) / d);
      gv *= smooth(hz, hz + 0.035, h / hl);
    }
    const gl = this.sunGlare;
    gl.visible = gv > 0.004;
    if (gl.visible) {
      this.place(gl, cam, A.sunDir, dist, 8 * DEG);
      gl.lookAt(cam.position);
      (gl.material as THREE.MeshBasicMaterial).color.copy(A.sunColor).multiplyScalar(gv);
    }

    // ---- moon ----
    const md = A.moonDir, ph = A.moonPhase, illum = moonIllum(ph);
    const up = smooth(-0.03, 0.03, md.y) * clear, lowM = 1 - smooth(0.0, 0.3, md.y);
    const mo = this.moon, mm = mo.material as THREE.MeshBasicMaterial;
    mo.visible = up > 0.004;
    if (mo.visible) {
      const q = Math.round(ph * 96) / 96;
      if (q !== this.bakedPhase) this.bakeMoon(q);
      // Looks larger near the horizon (the moon illusion, painted in: 25 %).
      this.place(mo, cam, md, dist, MOON_R * (1 + 0.25 * lowM));
      // Bright limb toward the sun: texture +u points at the sun while waxing, away from it while waning.
      const z = this.vz.copy(md).negate(), x = this.vx.copy(A.sunDir).addScaledVector(md, -A.sunDir.dot(md));
      if (x.lengthSq() < 1e-6) x.set(0, 1, 0).cross(z);
      x.normalize().multiplyScalar(ph < 0.5 ? 1 : -1);
      this.vy.crossVectors(z, x);
      mo.quaternion.setFromRotationMatrix(this.basis.makeBasis(x, this.vy, z));
      // Pale by day, bright at night; warm and dimmer through the thick air at the horizon.
      const night = A.night, k = (0.3 + 0.7 * night) * (1 - 0.45 * lowM);
      this.col.copy(this.cool).lerp(this.warm, lowM * lowM);
      mm.color.copy(this.col).multiplyScalar(0.72 * k);
      mm.opacity = up;
      const ha = this.moonHalo, hm = ha.material as THREE.MeshBasicMaterial;
      const hg = up * night * illum * (0.06 + 0.08 * lowM);
      ha.visible = hg > 0.003;
      if (ha.visible) {
        this.place(ha, cam, md, dist, (7 + 5 * lowM) * DEG);
        ha.lookAt(cam.position);
        hm.color.copy(this.col).multiplyScalar(hg);
      }
    } else this.moonHalo.visible = false;

    // ---- stars: twinkle (stronger low in the sky) and glare around a bright moon ----
    if (this.stars.visible) {
      const out = this.starCol.array as Float32Array, B = this.starBase, P = this.starPos.array as Float32Array, n = this.starPhase.length;
      // Moon direction in the starfield's own (rotated) frame.
      const ry = this.stars.rotation.y, cr = Math.cos(ry), sr = Math.sin(ry);
      const mx = (md.x * cr - md.z * sr) / 4000, my = md.y / 4000, mz = (md.x * sr + md.z * cr) / 4000;
      const glare = up * illum * 0.9, t = this.t;
      // A quarter of the stars per frame (each star at a quarter of the frame rate): one ranged upload.
      const q = this.tick++ & 3, i0 = Math.floor((n * q) / 4), i1 = Math.floor((n * (q + 1)) / 4);
      for (let i = i0, j = i0 * 3; i < i1; i++, j += 3) {
        const y = P[j + 1] / 4000;
        let f = 1 + (0.1 + 0.32 * (1 - y)) * Math.sin(this.starPhase[i] + t * this.starRate[i]);
        if (glare > 0.01) {
          const c = P[j] * mx + P[j + 1] * my + P[j + 2] * mz;
          if (c > 0.6) f *= 1 - glare * (c - 0.6) * (c - 0.6) * 6.25;
        }
        out[j] = B[j] * f; out[j + 1] = B[j + 1] * f; out[j + 2] = B[j + 2] * f;
      }
      this.starCol.clearUpdateRanges();
      this.starCol.addUpdateRange(i0 * 3, (i1 - i0) * 3);
      this.starCol.needsUpdate = true;
    }
    const ms = performance.now() - t0;
    this.stats.frames++; this.stats.sumMs += ms; if (ms > this.stats.maxMs) this.stats.maxMs = ms;
  }
}

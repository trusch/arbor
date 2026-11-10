import * as THREE from 'three';
import { Sky } from 'three/addons/objects/Sky.js';
import { tel } from '../tel';
import type { ArborParams } from '../params';

const smooth = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};
const lerpC = (a: THREE.Color, b: THREE.Color, t: number) => a.clone().lerp(b, t);

/** Sun direction from hour of day + latitude (declination fixed at early summer); yaw rotates the whole arc. */
export function sunDirection(hour: number, latDeg: number, yawDeg: number, out = new THREE.Vector3()) {
  const lat = (latDeg * Math.PI) / 180, dec = (18 * Math.PI) / 180;
  const H = ((hour - 12) / 24) * Math.PI * 2;
  // Local frame: x = east, y = up, z = south.
  const x = -Math.cos(dec) * Math.sin(H);
  const y = Math.sin(lat) * Math.sin(dec) + Math.cos(lat) * Math.cos(dec) * Math.cos(H);
  const z = Math.sin(lat) * Math.cos(dec) * Math.cos(H) - Math.cos(lat) * Math.sin(dec);
  out.set(x, y, z).normalize();
  return out.applyAxisAngle(new THREE.Vector3(0, 1, 0), (yawDeg * Math.PI) / 180);
}

/**
 * Physical sky (Preetham via three Sky), starfield + moon, light rig, fog colour and
 * PMREM environment. `update` drives everything from params.sky.
 */
function patchSky(sky: Sky, u: Record<string, THREE.IUniform>) {
  const m = sky.material;
  Object.assign(m.uniforms, u);
  m.fragmentShader = m.fragmentShader
    .replace(
      'void main() {',
      `uniform vec3 fogCol; uniform float skyGain; uniform float horizonK; uniform vec3 skyTintCol; uniform float skyTint;
uniform vec3 disc1Dir; uniform vec3 disc1Col; uniform vec3 disc2Dir; uniform vec3 disc2Col; uniform float discSize; uniform float discOn;
vec3 tintSky(vec3 c) {
  float L = dot(c, vec3(0.3, 0.59, 0.11));
  return mix(c, skyTintCol * L * 2.2, skyTint);
}
vec3 disc(vec3 d, vec3 dir, vec3 col) {
  float c = dot(d, dir);
  float r = discSize * 0.012;
  float core = smoothstep(cos(r), cos(r * 0.8), c);
  float halo = pow(max(c, 0.0), 900.0 / discSize) * 0.35;
  return col * (core * 6.0 + halo);
}
void main() {`,
    )
    .replace(
      'gl_FragColor = vec4( texColor, 1.0 );',
      'float hb = exp(-max(direction.y, 0.0) * horizonK);\n\t\t\tvec3 sc = min(mix(tintSky(texColor * skyGain), fogCol, hb), vec3(1.8));\n\t\t\tsc += discOn * (disc(direction, disc1Dir, disc1Col) + disc(direction, disc2Dir, disc2Col));\n\t\t\tgl_FragColor = vec4( sc, 1.0 );',
    );
}

export class Atmosphere {
  sky = new Sky();
  stars: THREE.Points;
  moon: THREE.Mesh;
  sunDir = new THREE.Vector3(0, 1, 0);
  moonDir = new THREE.Vector3();
  /** 0 = full day, 1 = deep night. */
  night = 0;
  /** Sun elevation, sine (−1..1). */
  sunH = 1;
  fogColor = new THREE.Color();
  /** Key light: sun by day, moon by night. */
  keyDir = new THREE.Vector3();
  keyColor = new THREE.Color();
  keyIntensity = 1;
  /** Shared horizon-blend uniforms: the sky melts into the fog colour at the horizon (no band). */
  skyUniforms = { fogCol: { value: new THREE.Color() }, skyGain: { value: 1 }, horizonK: { value: 9 }, skyTintCol: { value: new THREE.Color() }, skyTint: { value: 0 }, disc1Dir: { value: new THREE.Vector3() }, disc1Col: { value: new THREE.Color() }, disc2Dir: { value: new THREE.Vector3() }, disc2Col: { value: new THREE.Color() }, discSize: { value: 1 }, discOn: { value: 1 } };
  sun2Dir = new THREE.Vector3();
  sun2Color = new THREE.Color();
  sun2Intensity = 0;
  private envScene = new THREE.Scene();
  private envSky = new Sky();
  private envStarsCol = new THREE.Color();
  private pmrem: THREE.PMREMGenerator;
  private envRT: THREE.WebGLRenderTarget | null = null;
  private lastEnvDir = new THREE.Vector3(9, 9, 9);
  private envAge = 1e9;
  /** ?sky=basic (diagnostics): no Preetham sky, no PMREM bakes; scene background is the fog colour. */
  basic = false;
  /** PMREM bakes so far (telemetry). */
  bakes = 0;

  constructor(private renderer: THREE.WebGLRenderer, private scene: THREE.Scene) {
    this.sky.scale.setScalar(4500);
    patchSky(this.sky, this.skyUniforms);
    patchSky(this.envSky, { ...this.skyUniforms, discOn: { value: 0 } });
    this.sky.material.uniforms.cloudCoverage.value = 0.35;
    this.sky.material.uniforms.cloudDensity.value = 0.35;
    scene.add(this.sky);
    this.envSky.scale.setScalar(4500);
    this.envSky.material.uniforms.showSunDisc.value = 0;
    this.envScene.add(this.envSky);
    this.pmrem = new THREE.PMREMGenerator(renderer);

    // Stars: points on a big sphere, size/brightness jitter, plus a faint milky-way band.
    const N = 4500, pos = new Float32Array(N * 3), col = new Float32Array(N * 3);
    let s = 7;
    const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);
    const band = new THREE.Vector3(0.3, 0.55, 0.78).normalize();
    for (let i = 0; i < N; i++) {
      let v: THREE.Vector3;
      if (i < N * 0.45) {
        // Milky way: concentrate near the great circle orthogonal to `band`.
        v = new THREE.Vector3(rnd() * 2 - 1, rnd() * 2 - 1, rnd() * 2 - 1).normalize();
        v.addScaledVector(band, -v.dot(band) * (0.85 + rnd() * 0.15)).normalize();
      } else {
        const u = rnd() * 2 - 1, a = rnd() * Math.PI * 2;
        v = new THREE.Vector3(Math.sqrt(1 - u * u) * Math.cos(a), u, Math.sqrt(1 - u * u) * Math.sin(a));
      }
      pos.set([v.x * 4000, v.y * 4000, v.z * 4000], i * 3);
      const b = Math.pow(rnd(), 3.5) * 2.2 + 0.15;
      const t = rnd();
      col.set([b * (0.85 + 0.15 * t), b * 0.92, b * (1.1 - 0.2 * t)], i * 3);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    g.setAttribute('color', new THREE.BufferAttribute(col, 3));
    this.stars = new THREE.Points(
      g,
      new THREE.PointsMaterial({ size: 1.6, sizeAttenuation: false, vertexColors: true, transparent: true, depthWrite: false, fog: false, blending: THREE.AdditiveBlending }),
    );
    this.stars.frustumCulled = false;
    this.stars.renderOrder = -1;
    scene.add(this.stars);

    this.moon = new THREE.Mesh(
      new THREE.SphereGeometry(70, 24, 16),
      new THREE.MeshBasicMaterial({ color: new THREE.Color(2.2, 2.3, 2.5), fog: false, transparent: true }),
    );
    scene.add(this.moon);

  }

  update(p: ArborParams, dt: number, camPos: THREE.Vector3) {
    const k = p.sky;
    sunDirection(k.timeOfDay, k.latitude, k.sunYaw, this.sunDir);
    // Moon roughly opposite the sun, tilted so it rides higher.
    sunDirection((k.timeOfDay + 12) % 24, k.latitude - 15, k.sunYaw + 20, this.moonDir);
    const h = (this.sunH = this.sunDir.y);
    const night = (this.night = 1 - smooth(-0.16, 0.02, h));

    const u = this.sky.material.uniforms;
    // Hazy & warm near the horizon, clear at noon.
    const low = 1 - smooth(0.0, 0.45, h);
    u.turbidity.value = 2.5 + 6 * low;
    u.rayleigh.value = 1.2 + 1.8 * low;
    u.mieCoefficient.value = 0.004 + 0.008 * low;
    u.mieDirectionalG.value = 0.8;
    u.sunPosition.value.copy(this.sunDir);
    u.time.value += dt;
    this.sky.position.copy(camPos);
    this.stars.position.copy(camPos);
    const starA = smooth(0.0, -0.18, h) * k.stars;
    (this.stars.material as THREE.PointsMaterial).opacity = starA;
    this.stars.visible = starA > 0.01;
    this.stars.rotation.y = k.timeOfDay * 0.06;
    this.moon.position.copy(camPos).addScaledVector(this.moonDir, 3800);
    (this.moon.material as THREE.MeshBasicMaterial).opacity = smooth(-0.15, 0.1, this.moonDir.y) * (0.25 + 0.75 * night);
    this.moon.visible = this.moonDir.y > -0.05;

    // Key light colour by sun height: white noon → gold → deep orange → off.
    const noon = new THREE.Color(1.0, 0.96, 0.9);
    const gold = new THREE.Color(1.0, 0.72, 0.42);
    const ember = new THREE.Color(1.0, 0.42, 0.18);
    const sunCol = h > 0.25 ? lerpC(gold, noon, smooth(0.25, 0.6, h)) : lerpC(ember, gold, smooth(0.0, 0.25, h));
    if (k.sunTint > 0) sunCol.lerp(new THREE.Color().setHSL(k.sunHue, 0.85, 0.6), Math.min(1, k.sunTint));
    const sunI = 3.2 * smooth(-0.04, 0.12, h) * (0.55 + 0.45 * smooth(0.1, 0.6, h));
    const moonI = 0.35 * night * smooth(0.0, 0.2, this.moonDir.y);
    if (sunI >= moonI * 1.5 || h > -0.02) {
      this.keyDir.copy(this.sunDir);
      this.keyColor.copy(sunCol);
      this.keyIntensity = sunI;
    } else {
      this.keyDir.copy(this.moonDir);
      this.keyColor.setRGB(0.62, 0.74, 1.0);
      this.keyIntensity = moonI;
    }

    // Fog/aerial-perspective colour = sky near the horizon, toward the view.
    const dayFog = new THREE.Color(0.7, 0.79, 0.9);
    const duskFog = new THREE.Color(0.93, 0.62, 0.42);
    const blueHour = new THREE.Color(0.12, 0.15, 0.29);
    const nightFog = new THREE.Color(0.018, 0.026, 0.05);
    if (h > 0.02) this.fogColor.copy(lerpC(duskFog, dayFog, smooth(0.02, 0.35, h)));
    else this.fogColor.copy(h > -0.1 ? lerpC(blueHour, duskFog, smooth(-0.1, 0.02, h)) : lerpC(nightFog, blueHour, smooth(-0.22, -0.1, h)));

    const tint = new THREE.Color().setHSL(k.skyHue, 0.6, 0.5);
    if (k.skyTint > 0) {
      const L = this.fogColor.r * 0.3 + this.fogColor.g * 0.59 + this.fogColor.b * 0.11;
      this.fogColor.lerp(tint.clone().multiplyScalar(L * 2.2), Math.min(1, k.skyTint));
    }
    this.skyUniforms.fogCol.value.copy(this.fogColor);
    this.skyUniforms.skyTintCol.value.copy(tint);
    this.skyUniforms.skyTint.value = k.skyTint;

    // Sun discs drawn in the sky shader (HDR core; bloom gives the halo). Companion star sits off in yaw, a bit lower.
    const sunVis = smooth(-0.06, 0.02, h);
    this.skyUniforms.disc1Dir.value.copy(this.sunDir);
    this.skyUniforms.disc1Col.value.copy(sunCol).multiplyScalar(sunVis * (0.6 + 0.6 * smooth(0.0, 0.5, h)));
    this.skyUniforms.discSize.value = k.sunSize;
    sunDirection(k.timeOfDay - 1.2, k.latitude + 8, k.sunYaw + k.sun2Yaw, this.sun2Dir);
    const h2 = this.sun2Dir.y;
    this.sun2Color.setHSL(k.sun2Hue, 0.8, 0.62);
    const vis2 = smooth(-0.04, 0.06, h2) * Math.min(1, k.sun2 * 2);
    this.sun2Intensity = k.sun2 * 1.8 * vis2;
    this.skyUniforms.disc2Dir.value.copy(this.sun2Dir);
    this.skyUniforms.disc2Col.value.copy(this.sun2Color).multiplyScalar(vis2 * 0.8);
    // Preetham radiance grows strongly with sun height; normalise so noon doesn't blow out.
    this.skyUniforms.skyGain.value = k.skyGain * (0.3 + 0.15 * (1 - smooth(0.03, 0.55, h)));

    // Environment map: regenerate on significant sun change or every few seconds.
    this.envAge += dt;
    // Low quality (phones): at most one PMREM bake every 3 s, so a fast day cycle doesn't churn GPU memory.
    const minAge = k.quality === 'Low' ? 3 : 0;
    const moved = this.lastEnvDir.distanceTo(this.sunDir);
    if (!this.basic && this.envAge >= minAge && (moved > 0.03 || (this.envAge > 4 && moved > 0.002))) {
      this.regenEnv();
    }
  }

  private regenEnv() {
    const s = this.envSky.material.uniforms, d = this.sky.material.uniforms;
    for (const key of ['turbidity', 'rayleigh', 'mieCoefficient', 'mieDirectionalG'] as const) s[key].value = d[key].value;
    s.sunPosition.value.copy(this.sunDir);
    // Night: the Preetham sky goes black; give the env a faint blue floor so moonlit scenes still read.
    const n = this.night;
    this.envScene.background = n > 0.02 ? this.envStarsCol.setRGB(0.012 * n, 0.018 * n, 0.04 * n) : null;
    this.envSky.visible = this.sunH > -0.2;
    // Alien skies: tint the env-map background via the patched shader uniforms (shared).
    tel.phase('pmrem bake');
    const rt = this.pmrem.fromScene(this.envScene, 0, 1, 2000);
    tel.phase('pmrem done');
    this.bakes++;
    this.envRT?.dispose();
    this.envRT = rt;
    this.scene.environment = rt.texture;
    this.lastEnvDir.copy(this.sunDir);
    this.envAge = 0;
  }
}


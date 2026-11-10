import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import type { ArborParams } from '../params';
import type { TreeSim } from '../sim/tree';
import { makeGrassTexture } from './textures';
import { Atmosphere } from './atmosphere';
import { Post } from './post';

/** Renderer, camera, light rig, atmosphere, ground, post; sun shadow + camera framing track the tree. */
export class Stage {
  renderer: THREE.WebGLRenderer;
  scene = new THREE.Scene();
  camera: THREE.PerspectiveCamera;
  controls: OrbitControls;
  sun: THREE.DirectionalLight;
  hemi: THREE.HemisphereLight;
  atmo: Atmosphere;
  post: Post;
  private fog: THREE.FogExp2;
  private groundU = { trunk: { value: new THREE.Vector3(0, 0, 0.1) } };
  private center = new THREE.Vector3(0, 1, 0);
  private dist = 6;
  private sunUv = new THREE.Vector3();

  constructor(container: HTMLElement) {
    const r = (this.renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true }));
    r.setPixelRatio(Math.min(2, window.devicePixelRatio));
    r.setSize(window.innerWidth, window.innerHeight);
    r.toneMapping = THREE.ACESFilmicToneMapping;
    r.outputColorSpace = THREE.SRGBColorSpace;
    r.shadowMap.enabled = true;
    r.shadowMap.type = THREE.PCFShadowMap;
    container.appendChild(r.domElement);

    this.camera = new THREE.PerspectiveCamera(36, window.innerWidth / window.innerHeight, 0.05, 9000);
    this.camera.position.set(6, 2.5, 8);
    this.controls = new OrbitControls(this.camera, r.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.06;
    this.controls.autoRotateSpeed = 0.35;
    this.controls.maxPolarAngle = Math.PI * 0.495;

    this.fog = new THREE.FogExp2(0xb8c7d6, 0.006);
    this.scene.fog = this.fog;
    this.atmo = new Atmosphere(r, this.scene);

    this.hemi = new THREE.HemisphereLight(0xcfe3ff, 0x4a5236, 0.5);
    this.scene.add(this.hemi);
    this.sun = new THREE.DirectionalLight(0xfff1dc, 2.6);
    this.sun.castShadow = true;
    this.sun.shadow.mapSize.set(2048, 2048);
    this.sun.shadow.bias = -0.0003;
    this.sun.shadow.normalBias = 0.025;
    this.sun.shadow.radius = 5;
    this.scene.add(this.sun, this.sun.target);

    this.scene.add(this.makeGround(), this.makeHills());
    this.post = new Post(r, this.scene, this.camera);

    window.addEventListener('resize', () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      r.setSize(window.innerWidth, window.innerHeight);
      this.post.setSize(window.innerWidth, window.innerHeight);
    });
  }

  /** Meadow: grass texture at two incommensurate scales + world-space macro variation (no visible tiling), contact darkening at the trunk, fades into fog. */
  private makeGround() {
    const mat = new THREE.MeshStandardMaterial({ map: makeGrassTexture(), roughness: 0.96, color: 0xdcdcb4 });
    const gu = this.groundU;
    mat.onBeforeCompile = (sh) => {
      sh.uniforms.uTrunk = gu.trunk;
      sh.vertexShader = sh.vertexShader
        .replace('#include <common>', '#include <common>\nvarying vec2 vGW;')
        .replace('#include <begin_vertex>', '#include <begin_vertex>\nvGW = (modelMatrix * vec4(transformed, 1.0)).xz;');
      sh.fragmentShader = sh.fragmentShader
        .replace('#include <common>', '#include <common>\nvarying vec2 vGW;\nuniform vec3 uTrunk;')
        .replace(
          '#include <map_fragment>',
          `{
            vec2 p = vGW;
            vec3 a = texture2D(map, p * 0.37).rgb;
            vec3 b = texture2D(map, mat2(0.8, -0.6, 0.6, 0.8) * p * 0.061 + 0.37).rgb;
            float m1 = texture2D(map, p * 0.0071 + 0.21).g;
            float m2 = texture2D(map, mat2(0.6, 0.8, -0.8, 0.6) * p * 0.0019).g;
            float macro = smoothstep(0.25, 0.55, m1 * 0.6 + m2 * 0.6);
            vec3 g = mix(a, b, 0.45);
            float lum = dot(g, vec3(0.3, 0.59, 0.11));
            g = mix(vec3(lum), g, 0.72);
            vec3 dry = vec3(0.62, 0.58, 0.38) * lum * 2.2;
            g = mix(g, dry, 0.35 * macro);
            g *= 0.85 + 0.3 * m2;
            float rt = length(p - uTrunk.xy);
            g *= mix(0.35, 1.0, smoothstep(uTrunk.z * 0.6, uTrunk.z * 7.0, rt));
            diffuseColor.rgb *= g;
          }`,
        );
    };
    const ground = new THREE.Mesh(new THREE.CircleGeometry(3000, 96).rotateX(-Math.PI / 2), mat);
    ground.receiveShadow = true;
    return ground;
  }

  /** Low distant hill silhouette ring; fog turns it into soft layered atmosphere. */
  private makeHills() {
    const g = new THREE.CylinderGeometry(900, 900, 1, 256, 1, true);
    const pos = g.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i), z = pos.getZ(i), y = pos.getY(i);
      const a = Math.atan2(z, x);
      const h = 18 + 30 * (0.5 + 0.5 * Math.sin(a * 3 + 1.3)) * (0.6 + 0.4 * Math.sin(a * 7.1)) + 8 * Math.sin(a * 17.3) + 4 * Math.sin(a * 41);
      pos.setY(i, y > 0 ? Math.max(4, h) : -2);
    }
    g.computeVertexNormals();
    return new THREE.Mesh(g, new THREE.MeshStandardMaterial({ color: 0x3e4a34, roughness: 1, side: THREE.BackSide }));
  }

  /** Per-frame: advance clock, atmosphere, lights, shadow frustum, camera. snap=true jumps instead of easing. */
  frame(sim: TreeSim, p: ArborParams, dt: number, snap = false) {
    const k = p.sky;
    if (k.cycle && k.dayLength > 0) k.timeOfDay = (k.timeOfDay + (dt * 24) / k.dayLength) % 24;
    this.atmo.update(p, snap ? 0 : dt, this.camera.position);
    const A = this.atmo;
    const night = A.night;
    this.fog.color.copy(A.fogColor);
    this.fog.density = k.fog * 0.004;

    const mn = sim.bboxMin, mx = sim.bboxMax;
    const c = new THREE.Vector3((mn[0] + mx[0]) / 2, (mn[1] + mx[1]) / 2, (mn[2] + mx[2]) / 2);
    const ext = Math.max(1.6, Math.hypot(mx[0] - mn[0], mx[1] - mn[1], mx[2] - mn[2]) / 2);
    const trunkR = sim.nodes.length ? Math.max(0.03, sim.nodes[0].radius ?? 0.05) : 0.05;
    this.groundU.trunk.value.set(sim.nodes[0]?.wx ?? 0, sim.nodes[0]?.wz ?? 0, trunkR);

    // Key light. Keep the shadow caster above ~8° so shadows don't streak to infinity.
    const dir = A.keyDir.clone();
    if (dir.y < 0.14) dir.setY(0.14).normalize();
    this.sun.color.copy(A.keyColor);
    this.sun.intensity = A.keyIntensity;
    this.sun.shadow.radius = night > 0.5 ? 9 : 4 + 4 * (1 - Math.min(1, A.sunH * 2));
    this.sun.position.copy(c).addScaledVector(dir, ext * 4);
    this.sun.target.position.copy(c);
    const cam = this.sun.shadow.camera;
    // Snap the fitted frustum size to 0.5m steps so it doesn't breathe (shimmer) while the tree grows.
    const e = Math.ceil(ext * 1.35 * 2) / 2;
    cam.left = -e; cam.right = e; cam.top = e; cam.bottom = -e;
    cam.near = 0.1; cam.far = ext * 8;
    cam.updateProjectionMatrix();

    // Ambient: hemisphere tinted from the sky, plus PMREM env (scene.environment) scaled by time of day.
    const day = 1 - night;
    this.hemi.color.copy(A.fogColor).lerp(new THREE.Color(0.55, 0.7, 1.0), 0.4);
    this.hemi.groundColor.setRGB(0.22, 0.2, 0.12).multiplyScalar(0.3 + 0.7 * day);
    this.hemi.intensity = 0.15 + 0.35 * day;
    this.scene.environmentIntensity = 0.25 + 0.3 * day;
    this.renderer.toneMappingExposure = k.exposure * (1 + 1.6 * night);

    // Post: god rays from the sun screen position at low sun, grade warmth by time of day.
    const P = this.post;
    const sp = this.sunUv.copy(this.camera.position).addScaledVector(A.sunDir, 1000).project(this.camera);
    const facing = A.sunDir.dot(this.camera.getWorldDirection(new THREE.Vector3()));
    const low = 1 - Math.min(1, Math.max(0, (A.sunH - 0.05) / 0.4));
    P.rays.uniforms.sunUv.value.set(sp.x * 0.5 + 0.5, sp.y * 0.5 + 0.5);
    P.rays.uniforms.strength.value = k.godRays * Math.max(0, facing) * low * (A.sunH > -0.02 ? 1 : 0) * 0.5;
    P.rays.uniforms.tint.value.copy(A.keyColor);
    P.grade.uniforms.time.value = performance.now() / 1000;
    P.grade.uniforms.vignette.value = 0.38;
    P.grade.uniforms.grain.value = 0.03;
    P.grade.uniforms.saturation.value = 1.04 + 0.1 * day;

    this.controls.autoRotate = p.camera.autoRotate;
    if (p.camera.autoFrame) {
      const kk = snap ? 1 : 1 - Math.exp(-dt * 1.2);
      const fov = (this.camera.fov * Math.PI) / 180;
      const want = Math.max(2.5, (ext / Math.sin(fov / 2)) * 0.78);
      const target = new THREE.Vector3(c.x, Math.max(0.6, c.y * 0.86), c.z);
      this.center.lerp(target, kk);
      this.dist += (want - this.dist) * kk;
      const off = this.camera.position.clone().sub(this.controls.target);
      off.setLength(this.dist);
      if (snap) off.y = this.dist * 0.08;
      this.controls.target.copy(this.center);
      this.camera.position.copy(this.center).add(off);
    }
    this.controls.update(dt);
  }

  render(p: ArborParams) {
    if (p.sky.quality === 'High') {
      this.post.composer.render();
    } else {
      this.renderer.render(this.scene, this.camera);
    }
  }
}

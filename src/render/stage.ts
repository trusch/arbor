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
  /** Created on first High-quality frame, so Low (mobile) never allocates the post render targets. */
  private _post: Post | null = null;
  get post(): Post {
    if (!this._post) {
      this._post = new Post(this.renderer, this.scene, this.camera);
      this._post.setSize(window.innerWidth, window.innerHeight);
    }
    return this._post;
  }
  /** Quality the renderer is currently configured for (pixel ratio + shadow map size). */
  private quality = '';
  /** True between webglcontextlost and the reload on webglcontextrestored. */
  contextLost = false;
  fog: THREE.FogExp2;
  private groundU = { trunk: { value: new THREE.Vector3(0, 0, 0.1) }, tint: { value: new THREE.Vector4(0, 0, 0, 0) } };
  /** Companion-star fill light (no shadows). */
  sun2: THREE.DirectionalLight;
  /** Seconds since the last user camera interaction (cinema resumes after IDLE). */
  idle = 1e9;
  private cineT = 0;
  private cineYaw = 0;
  private cineOn = false;
  private center = new THREE.Vector3(0, 1, 0);
  private dist = 6;
  private sunUv = new THREE.Vector3();

  constructor(container: HTMLElement, opts: { antialias?: boolean; shadows?: boolean; onContextLost?: () => boolean } = {}) {
    const r = (this.renderer = new THREE.WebGLRenderer({ antialias: opts.antialias ?? true, powerPreference: 'high-performance' }));
    r.setPixelRatio(1);
    r.setSize(window.innerWidth, window.innerHeight);
    r.toneMapping = THREE.ACESFilmicToneMapping;
    r.outputColorSpace = THREE.SRGBColorSpace;
    r.shadowMap.enabled = opts.shadows ?? true;
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
    this.sun.castShadow = opts.shadows ?? true;
    this.sun.shadow.mapSize.set(2048, 2048);
    this.sun.shadow.bias = -0.0003;
    this.sun.shadow.normalBias = 0.025;
    this.sun.shadow.radius = 5;
    this.scene.add(this.sun, this.sun.target);
    this.sun2 = new THREE.DirectionalLight(0xffffff, 0);
    this.scene.add(this.sun2, this.sun2.target);
    this.controls.addEventListener('start', () => (this.idle = 0));

    this.scene.add(this.makeGround(), this.makeHills());

    window.addEventListener('resize', () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      r.setSize(window.innerWidth, window.innerHeight);
      this._post?.setSize(window.innerWidth, window.innerHeight);
    });

    let reload = true;
    // GPU reset / mobile tab eviction: keep the page alive, tell the user, reload once the context returns.
    r.domElement.addEventListener('webglcontextlost', (e) => {
      e.preventDefault();
      this.contextLost = true;
      reload = opts.onContextLost?.() ?? true;
      if (reload) showNotice('Graphics context lost (GPU reset or memory pressure). Reloading in safe mode when it comes back…');
    });
    r.domElement.addEventListener('webglcontextrestored', () => { if (reload) location.reload(); });
  }

  /** Pixel ratio and shadow map size per quality: High caps DPR at 1.5 and uses a 2048 shadow map, Low uses DPR 1 and 1024. */
  private applyQuality(q: string) {
    if (q === this.quality) return;
    this.quality = q;
    const high = q === 'High';
    this.renderer.setPixelRatio(Math.min(high ? 1.5 : 1, window.devicePixelRatio || 1));
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    if (this._post) {
      this._post.composer.setPixelRatio(this.renderer.getPixelRatio());
      this._post.setSize(window.innerWidth, window.innerHeight);
    }
    const ms = high ? 2048 : 1024;
    if (this.sun.shadow.mapSize.x !== ms) {
      this.sun.shadow.mapSize.set(ms, ms);
      this.sun.shadow.map?.dispose();
      this.sun.shadow.map = null;
    }
  }

  /** Meadow: grass texture at two incommensurate scales + world-space macro variation (no visible tiling), contact darkening at the trunk, fades into fog. */
  private makeGround() {
    const mat = new THREE.MeshStandardMaterial({ map: makeGrassTexture(), roughness: 0.96, color: 0xdcdcb4 });
    const gu = this.groundU;
    mat.onBeforeCompile = (sh) => {
      sh.uniforms.uTrunk = gu.trunk;
      sh.uniforms.uTint = gu.tint;
      sh.vertexShader = sh.vertexShader
        .replace('#include <common>', '#include <common>\nvarying vec2 vGW;')
        .replace('#include <begin_vertex>', '#include <begin_vertex>\nvGW = (modelMatrix * vec4(transformed, 1.0)).xz;');
      sh.fragmentShader = sh.fragmentShader
        .replace('#include <common>', '#include <common>\nvarying vec2 vGW;\nuniform vec3 uTrunk;\nuniform vec4 uTint;')
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
            g = mix(g, uTint.rgb * dot(g, vec3(0.3, 0.59, 0.11)) * 2.4, uTint.a);
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
    // Fit: the crown's horizontal circle (radius rxz, any orbit yaw) to the horizontal FOV, its half-height to the
    // vertical FOV (from the near side of the circle). In portrait (aspect < 1) the horizontal FOV is the narrow one,
    // so this keeps the whole crown in view on phones; the sphere fit (ext) is a lower bound so the camera is never
    // inside the crown. +0.35 m covers leaves that stick out past the node bbox.
    const vf = (this.camera.fov * Math.PI) / 360;
    const hf = Math.atan(Math.tan(vf) * this.camera.aspect);
    const rxz = Math.hypot(mx[0] - mn[0], mx[2] - mn[2]) / 2 + 0.35;
    const hh = (mx[1] - mn[1]) / 2 + 0.35;
    const fit = this.camera.aspect < 1
      ? Math.max(rxz / Math.sin(hf), hh / Math.tan(vf) + rxz, ext * 1.25) * 1.1
      : (ext / Math.sin(Math.min(vf, hf))) * 1.06; // landscape: bounding sphere to the narrower FOV
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
    this.sun2.color.copy(A.sun2Color);
    this.sun2.intensity = A.sun2Intensity;
    this.sun2.position.copy(c).addScaledVector(A.sun2Dir, ext * 4);
    this.sun2.target.position.copy(c);
    if (k.groundTint > 0) {
      const gc = new THREE.Color().setHSL(k.groundHue, 0.55, 0.4);
      this.groundU.tint.value.set(gc.r, gc.g, gc.b, Math.min(1, k.groundTint));
    } else this.groundU.tint.value.w = 0;
    const cam = this.sun.shadow.camera;
    // Tight fit: the tree bbox (+ leaf margin) projected into light space, so the 1024 Low map spends its texels on
    // the tree (a loose square made branch shadows staircase across the trunk on phones). Snapped to 0.25 m steps so
    // it doesn't breathe (shimmer) while the tree grows.
    const lz = dir.clone(), lx = new THREE.Vector3(0, 1, 0).cross(lz);
    if (lx.lengthSq() < 1e-6) lx.set(1, 0, 0);
    lx.normalize();
    const ly = lz.clone().cross(lx);
    let ex = 0, ey = 0;
    for (let i = 0; i < 8; i++) {
      const d = new THREE.Vector3(i & 1 ? mx[0] : mn[0], i & 2 ? mx[1] : Math.min(0, mn[1]), i & 4 ? mx[2] : mn[2]).sub(c);
      ex = Math.max(ex, Math.abs(d.dot(lx))); ey = Math.max(ey, Math.abs(d.dot(ly)));
    }
    const low = k.quality !== 'High';
    const e = Math.ceil(ext * 1.35 * 2) / 2; // High keeps the loose square fit
    const sx = low ? Math.ceil((ex + 0.6) * 4) / 4 : e, sy = low ? Math.ceil((ey + 0.6) * 4) / 4 : e;
    cam.left = -sx; cam.right = sx; cam.top = sy; cam.bottom = -sy;
    cam.near = 0.1; cam.far = ext * 8;
    cam.updateProjectionMatrix();
    // Low (1024 map) needs more bias against acne on the thin branches; High keeps its values.
    this.sun.shadow.normalBias = low ? 0.045 : 0.025;
    this.sun.shadow.bias = low ? -0.0006 : -0.0003;

    // Ambient: hemisphere tinted from the sky, plus PMREM env (scene.environment) scaled by time of day.
    const day = 1 - night;
    this.hemi.color.copy(A.fogColor).lerp(new THREE.Color(0.55, 0.7, 1.0), 0.4);
    this.hemi.groundColor.setRGB(0.22, 0.2, 0.12).multiplyScalar(0.3 + 0.7 * day);
    this.hemi.intensity = 0.15 + 0.35 * day;
    this.scene.environmentIntensity = 0.25 + 0.3 * day;
    this.renderer.toneMappingExposure = k.exposure * (1 + 1.6 * night);

    // Post: god rays from the sun screen position at low sun, grade warmth by time of day.
    // Only touch post uniforms on High: the getter would otherwise allocate the post RTs on Low.
    const P = k.quality === 'High' ? this.post : null;
    if (P) {
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
    }

    this.idle += dt;
    const cine = p.camera.cinema && this.idle > 10;
    if (cine && !this.cineOn) {
      // Resume from the current view: no jump.
      const off = this.camera.position.clone().sub(this.controls.target);
      this.cineYaw = Math.atan2(off.x, off.z);
      p.camera.autoFrame = true;
    }
    this.cineOn = cine;
    this.controls.autoRotate = p.camera.autoRotate && !cine;
    if (cine) {
      // Cinematic dolly: slow orbit, breathing height, occasional slow push-ins; always frames the tree.
      this.cineT += dt;
      const t = this.cineT;
      this.cineYaw += dt * (0.045 + 0.02 * Math.sin(t * 0.031));
      const want = Math.max(2.5, fit);
      const push = Math.pow(0.5 + 0.5 * Math.sin(t * 0.021 - 1.2), 3); // rare, slow
      // Push-ins may crop the crown edges a little on landscape (detail shots), never into the crown: in portrait
      // they stay shallow and the distance never drops below the crown sphere plus a margin.
      const depth = this.camera.aspect < 1 ? 0.1 : 0.3;
      const dist = Math.max(ext * 1.35, want * (1.02 - depth * push + 0.03 * Math.sin(t * 0.07)));
      const elev = 0.06 + 0.1 * (0.5 + 0.5 * Math.sin(t * 0.043 + 0.7)) + 0.08 * push;
      const kk = snap ? 1 : 1 - Math.exp(-dt * (dist > this.dist ? 2.5 : 0.8));
      const target = new THREE.Vector3(c.x, Math.max(0.6, c.y * (0.97 + 0.06 * push)), c.z);
      this.center.lerp(target, kk);
      this.dist += (dist - this.dist) * kk;
      const ce = Math.cos(elev);
      this.controls.target.copy(this.center);
      this.camera.position.set(
        this.center.x + Math.sin(this.cineYaw) * ce * this.dist,
        Math.max(0.35, this.center.y + Math.sin(elev) * this.dist - this.center.y * 0.35),
        this.center.z + Math.cos(this.cineYaw) * ce * this.dist,
      );
    } else if (p.camera.autoFrame) {
      const want = Math.max(2.5, fit);
      // Pull back faster than we push in so a growing crown never outruns the frame.
      const kk = snap ? 1 : 1 - Math.exp(-dt * (want > this.dist ? 2.5 : 1.0));
      const target = new THREE.Vector3(c.x, Math.max(0.6, c.y), c.z);
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
    if (this.contextLost) return;
    this.applyQuality(p.sky.quality);
    if (p.sky.quality === 'High') {
      this.post.composer.render();
    } else {
      this.renderer.render(this.scene, this.camera);
    }
  }
}

/** Fixed banner for fatal/runtime problems (context loss, frame errors). */
export function showNotice(text: string) {
  let el = document.getElementById('notice');
  if (!el) {
    el = document.createElement('div');
    el.id = 'notice';
    el.style.cssText = 'position:fixed;left:50%;top:16px;transform:translateX(-50%);max-width:80vw;padding:8px 14px;border-radius:6px;background:#000b;color:#fff;font:13px/1.4 ui-sans-serif,system-ui,sans-serif;z-index:10;pointer-events:none';
    document.body.appendChild(el);
  }
  el.textContent = text;
}

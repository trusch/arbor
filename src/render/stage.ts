import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import type { ArborParams } from '../params';
import type { TreeSim } from '../sim/tree';
import { makeGrassTexture } from './textures';
import { Atmosphere } from './atmosphere';
import { Post } from './post';
import { makeTerrainGeometry } from './backdrop';
import { tel } from '../tel';
import { season } from '../season';
import { groundSeason } from './landseason';

/** Seconds the camera takes to ease from a hand-set view back into the automatic camera. */
const EASE_S = 3;

/** Renderer, camera, light rig, atmosphere, ground, post; sun shadow + camera framing track the tree. */
/** Linear ground colour factor with the backdrop on (the old 0xdcdcb4 is 0.72, 0.72, 0.46). */
const GROUND_GAIN = [0.76, 0.9, 0.4];
/** Haze with the backdrop on: the land now has depth to several hundred metres, so the calm fog is thinner (9 % at 250 m, 30 % at 500 m, 76 % at 1000 m). */
const HAZE = 0.3;

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
  /** False with ?backdrop=0 (old level disc, hill ring and fog density). */
  private backdrop = true;
  private groundU = { trunk: { value: new THREE.Vector3(0, 0, 0.1) }, tint: { value: new THREE.Vector4(0, 0, 0, 0) } };
  /** Companion-star fill light (no shadows). */
  sun2: THREE.DirectionalLight;
  /** True once the user has orbited or zoomed by hand. While set, nothing automatic (cinema, auto-rotate,
   *  auto-frame) writes the camera; only `autoCamera()` clears it. */
  manual = false;
  /** Ease back into the automatic camera: seconds since `autoCamera()`, and the hand-set view it started from. */
  private easeT = 1e9;
  private easePos = new THREE.Vector3();
  private easeTgt = new THREE.Vector3();
  private prevCinema = true;
  private prevAutoFrame = true;
  private cineT = 0;
  private cineYaw = 0;
  private cineOn = false;
  private center = new THREE.Vector3(0, 1, 0);
  private dist = 6;
  private sunUv = new THREE.Vector3();

  constructor(container: HTMLElement, opts: { antialias?: boolean; shadows?: boolean; backdrop?: boolean; onContextLost?: () => boolean } = {}) {
    const r = (this.renderer = new THREE.WebGLRenderer({ antialias: opts.antialias ?? true, powerPreference: 'high-performance', alpha: false }));
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

    this.backdrop = opts.backdrop ?? true;
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

    this.scene.add(this.makeGround(opts.backdrop ?? true), this.makeHills(opts.backdrop ?? true));

    window.addEventListener('resize', () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      r.setSize(window.innerWidth, window.innerHeight);
      this._post?.setSize(window.innerWidth, window.innerHeight);
    });

    document.addEventListener('visibilitychange', () => (this.dprHiddenSeen = true));

    let reload = true;
    // GPU reset / mobile tab eviction: keep the page alive, tell the user, reload once the context returns.
    // A loss while the tab is hidden (background eviction, another tab's GPU reset) is only logged: it does not
    // count toward the crash guard or change modes; the page reloads as-is once it is visible again.
    r.domElement.addEventListener('webglcontextlost', (e) => {
      e.preventDefault();
      this.contextLost = true;
      if (document.visibilityState === 'hidden') {
        tel.log('ctx_loss_hidden', {});
        reload = true;
        return;
      }
      reload = opts.onContextLost?.() ?? true;
      if (reload) showNotice('Graphics context lost (GPU reset or memory pressure). Reloading in safe mode when it comes back…');
    });
    r.domElement.addEventListener('webglcontextrestored', () => {
      if (!reload) return;
      if (document.visibilityState !== 'hidden') { location.reload(); return; }
      document.addEventListener('visibilitychange', () => { if (document.visibilityState !== 'hidden') location.reload(); });
    });
  }

  /** Pixel ratio and shadow map size per quality: start DPR min(dpr, High 1.5 / Low 2) then adaptive (`adaptDpr`); shadow map High 2048, Low 1024. */
  private applyQuality(q: string) {
    if (q === this.quality) return;
    this.quality = q;
    const high = q === 'High';
    const pin = Number(new URLSearchParams(location.search).get('dpr'));
    this.dprPinned = Number.isFinite(pin) && pin > 0;
    this.dprStart = this.dprPinned ? Math.min(pin, 4) : Math.min(high ? 1.5 : 2, window.devicePixelRatio || 1);
    this.setDpr(this.dprStart);
    this.dprWinStart = -1;
    this.dprGoodSince = -1;
    const ms = high ? 2048 : 1024;
    if (this.sun.shadow.mapSize.x !== ms) {
      this.sun.shadow.mapSize.set(ms, ms);
      this.sun.shadow.map?.dispose();
      this.sun.shadow.map = null;
    }
  }

  /** Adaptive pixel ratio: start value per quality (Low ≤ 2, High ≤ 1.5), ?dpr=N pins it. */
  private dprStart = 1;
  private dprPinned = false;
  private dprWinStart = -1;
  private dprWinFrames = 0;
  /** rAF intervals (ms) of the current window; the decision uses their median, so CPU stalls do not count as GPU load. */
  private dprIv = new Float32Array(1024);
  private dprLastFrame = 0;
  private dprGoodSince = -1;
  private dprLastDown = -1e9;
  private dprT0 = -1;
  private dprHiddenSeen = false;
  static readonly DPR_STEPS = [2, 1.75, 1.5, 1.25, 1];

  private setDpr(v: number) {
    this.renderer.setPixelRatio(v);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    if (this._post) {
      this._post.composer.setPixelRatio(v);
      this._post.setSize(window.innerWidth, window.innerHeight);
    }
  }

  /** Called once per rendered frame. 3 s windows (first 3 s and hidden/stalled windows ignored): median frame interval
   *  > 25 ms steps down, < 17.5 ms for 10 s steps up (never above the start value, not within 30 s of a step-down). */
  private adaptDpr(now: number) {
    if (this.dprPinned) return;
    if (this.dprT0 < 0) this.dprT0 = now;
    // A gap > 2 s means rAF was paused (hidden tab, bfcache) or a hitch such as a fast-forward: drop the window.
    const iv = now - this.dprLastFrame;
    const stalled = this.dprHiddenSeen || iv > 2000;
    this.dprHiddenSeen = false;
    this.dprLastFrame = now;
    if (now - this.dprT0 < 3000 || document.visibilityState === 'hidden' || stalled || this.dprWinStart < 0) {
      this.dprWinStart = now;
      this.dprWinFrames = 0;
      if (stalled || document.visibilityState === 'hidden') this.dprGoodSince = -1;
      return;
    }
    if (this.dprWinFrames < this.dprIv.length) this.dprIv[this.dprWinFrames] = iv;
    this.dprWinFrames++;
    const span = now - this.dprWinStart;
    if (span < 3000) return;
    const fps = (this.dprWinFrames * 1000) / span;
    const nIv = Math.min(this.dprWinFrames, this.dprIv.length);
    const median = this.dprIv.subarray(0, nIv).sort()[nIv >> 1];
    this.dprWinStart = now;
    this.dprWinFrames = 0;
    const cur = this.renderer.getPixelRatio();
    const steps = Stage.DPR_STEPS.filter((s) => s <= this.dprStart + 1e-6);
    if (!steps.length || steps[0] < this.dprStart - 1e-6) steps.unshift(this.dprStart);
    let next = cur;
    if (median > 25) {
      next = steps.find((s) => s < cur - 1e-6) ?? cur;
      this.dprGoodSince = -1;
      if (next !== cur) this.dprLastDown = now;
    } else if (median < 17.5) {
      if (this.dprGoodSince < 0) this.dprGoodSince = now - span;
      if (now - this.dprGoodSince >= 10000 && now - this.dprLastDown >= 30000) {
        const up = [...steps].reverse().find((s) => s > cur + 1e-6);
        if (up !== undefined) next = up;
        this.dprGoodSince = -1;
      }
    } else {
      this.dprGoodSince = -1;
    }
    if (next !== cur) {
      this.setDpr(next);
      tel.log('dpr_change', { from: cur, to: next, fps: +fps.toFixed(1), medianMs: +median.toFixed(1), quality: this.quality });
    }
  }

  /** Meadow: grass texture at two incommensurate scales + world-space macro variation (no visible tiling), contact darkening at the trunk, fades into fog. */
  private groundMat: THREE.MeshStandardMaterial | null = null;
  private groundBase = new THREE.Color();
  private groundK = [1, 1, 1];
  private makeGround(backdrop: boolean) {
    const mat = new THREE.MeshStandardMaterial({ map: makeGrassTexture(backdrop), roughness: 0.96, color: 0xdcdcb4 });
    // Backdrop: the ground carries the far meadow on its own, so its colour is lifted to the mean of the lit tufts
    // (uniform only; same program). ?backdrop=0 keeps the old darker value.
    if (backdrop) mat.color.setRGB(GROUND_GAIN[0], GROUND_GAIN[1], GROUND_GAIN[2]);
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
    // Backdrop: rolling terrain (flat within R_FLAT of the tree) instead of the level disc; same material, same attributes.
    const ground = new THREE.Mesh(backdrop ? makeTerrainGeometry() : new THREE.CircleGeometry(3000, 96).rotateX(-Math.PI / 2), mat);
    ground.receiveShadow = true;
    this.groundMat = mat; this.groundBase = mat.color.clone();
    return ground;
  }

  /** Low distant hill silhouette ring; fog turns it into soft layered atmosphere. */
  private makeHills(backdrop: boolean) {
    // Backdrop: the terrain carries the ridges and the meadow draws the trees; the ring (and its program) is gone.
    if (backdrop) return new THREE.Group();
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

  /** The user has set the view by hand: the automatic camera stays off until `autoCamera()`. */
  takeControl() {
    this.manual = true;
    this.easeT = 1e9;
  }

  /** Hand the camera back to cinema / auto-rotate / auto-frame, easing from the current view over `EASE_S`. */
  autoCamera() {
    if (!this.manual) return;
    this.manual = false;
    this.easeT = 0;
    this.easePos.copy(this.camera.position);
    this.easeTgt.copy(this.controls.target);
    this.center.copy(this.controls.target);
    this.dist = this.camera.position.distanceTo(this.controls.target);
    this.cineOn = false;
  }

  /** Per-frame: advance clock, atmosphere, lights, shadow frustum, camera. snap=true jumps instead of easing. */
  frame(sim: TreeSim, p: ArborParams, dt: number, snap = false) {
    const k = p.sky;
    if (k.cycle && k.dayLength > 0) k.timeOfDay = (k.timeOfDay + (dt * 24) / k.dayLength) % 24;
    this.atmo.update(p, snap ? 0 : dt, this.camera.position);
    const A = this.atmo;
    const night = A.night;
    this.fog.color.copy(A.fogColor);
    this.fog.density = k.fog * 0.004 * (this.backdrop ? HAZE : 1);

    const mn = sim.bboxMin, mx = sim.bboxMax;
    const c = new THREE.Vector3((mn[0] + mx[0]) / 2, (mn[1] + mx[1]) / 2, (mn[2] + mx[2]) / 2);
    const ext = Math.max(1.6, Math.hypot(mx[0] - mn[0], mx[1] - mn[1], mx[2] - mn[2]) / 2);
    // Fit: the crown's horizontal circle (radius rxz, any orbit yaw) to the horizontal FOV, its half-height to the
    // vertical FOV (from the near side of the circle). In portrait (aspect < 1) the horizontal FOV is the narrow one,
    // so this keeps the whole crown in view on phones; the sphere fit (ext) is a lower bound so the camera is never
    // inside the crown. +0.35 m covers leaves that stick out past the node bbox.
    const vf = (this.camera.fov * Math.PI) / 360;
    const hf = Math.atan(Math.tan(vf) * this.camera.aspect);
    // Seedling: the camera comes close (about 1.1 m from a 10 cm plant) and looks down from above the grass; the
    // lower bounds below ease into the grown-tree values (identical from about 2.7 m of tree on).
    const hd = Math.hypot(mx[0] - mn[0], mx[1] - mn[1], mx[2] - mn[2]) / 2;
    const extCam = Math.max(0.4, Math.min(hd + 0.25, ext));
    const leafM = Math.min(0.35, Math.max(0.12, 0.12 + 0.2 * mx[1]));
    const rxz = Math.hypot(mx[0] - mn[0], mx[2] - mn[2]) / 2 + leafM;
    const hh = (mx[1] - mn[1]) / 2 + leafM;
    const fit = this.camera.aspect < 1
      ? Math.max(rxz / Math.sin(hf), hh / Math.tan(vf) + rxz, extCam * 1.25) * 1.1
      : (extCam / Math.sin(Math.min(vf, hf))) * 1.06; // landscape: bounding sphere to the narrower FOV
    const MIN_DIST = 1.1, lowY = Math.min(0.6, Math.max(0.15, mx[1] * 0.6));
    // Extra camera height while close to a small plant (0 from 2.6 m distance on), so the meadow does not hide it.
    const lift = (d: number) => 0.8 * Math.min(1, Math.max(0, (2.6 - d) / 1.2));
    const trunkR = sim.nodes.length ? Math.max(0.03, sim.nodes[0].radius ?? 0.05) : 0.05;
    this.groundU.trunk.value.set(sim.nodes[0]?.wx ?? 0, sim.nodes[0]?.wz ?? 0, trunkR);

    // Key light. Keep the shadow caster above ~8° so shadows don't streak to infinity.
    const dir = A.keyDir.clone();
    if (dir.y < 0.14) dir.setY(0.14).normalize();
    this.sun.color.copy(A.keyColor);
    this.sun.intensity = A.keyIntensity;
    this.sun.shadow.radius = 4 + 4 * (1 - Math.min(1, Math.max(0, A.sunH) * 2)) + night; // moonlight: softest
    this.sun.position.copy(c).addScaledVector(dir, ext * 4);
    this.sun.target.position.copy(c);
    this.sun2.color.copy(A.sun2Color);
    this.sun2.intensity = A.sun2Intensity;
    this.sun2.position.copy(c).addScaledVector(A.sun2Dir, ext * 4);
    this.sun2.target.position.copy(c);
    // Ground through the year: colour uniform only, summer colour x a pure function of the year phase (1, 1, 1 in summer).
    if (this.groundMat) { const gk = groundSeason(season.phase, this.groundK), b = this.groundBase; this.groundMat.color.setRGB(b.r * gk[0], b.g * gk[1], b.b * gk[2]); }
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
    // Night ambient follows the moon: 0.1 starlit, 0.19 under a full moon (it was a flat 0.15).
    this.hemi.intensity = 0.15 + 0.35 * day + night * (0.09 * A.moonLight - 0.05 * (1 - A.moonLight));
    this.scene.environmentIntensity = 0.25 + 0.3 * day;
    this.renderer.toneMappingExposure = k.exposure * (1 + 1.6 * night);
    this.applyWeather(night);

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

    // Switching cinema or auto-frame on in the panel is the user asking for the automatic camera.
    if (this.manual && ((p.camera.cinema && !this.prevCinema) || (p.camera.autoFrame && !this.prevAutoFrame))) this.autoCamera();
    this.prevCinema = p.camera.cinema;
    this.prevAutoFrame = p.camera.autoFrame;
    const auto = !this.manual;
    const cine = p.camera.cinema && auto;
    if (cine && !this.cineOn) {
      // Resume from the current view: no jump.
      const off = this.camera.position.clone().sub(this.controls.target);
      this.cineYaw = Math.atan2(off.x, off.z);
      p.camera.autoFrame = true;
    }
    this.cineOn = cine;
    this.controls.autoRotate = p.camera.autoRotate && !cine && auto;
    if (cine) {
      // Cinematic dolly: slow orbit, breathing height, occasional slow push-ins; always frames the tree.
      this.cineT += dt;
      const t = this.cineT;
      this.cineYaw += dt * (0.045 + 0.02 * Math.sin(t * 0.031));
      const want = Math.max(MIN_DIST, fit);
      const push = Math.pow(0.5 + 0.5 * Math.sin(t * 0.021 - 1.2), 3); // rare, slow
      // Push-ins may crop the crown edges a little on landscape (detail shots), never into the crown: in portrait
      // they stay shallow and the distance never drops below the crown sphere plus a margin.
      const depth = this.camera.aspect < 1 ? 0.1 : 0.3;
      const dist = Math.max(extCam * 1.35, want * (1.02 - depth * push + 0.03 * Math.sin(t * 0.07)));
      const elev = 0.06 + 0.1 * (0.5 + 0.5 * Math.sin(t * 0.043 + 0.7)) + 0.08 * push;
      const kk = snap ? 1 : 1 - Math.exp(-dt * (dist > this.dist ? 2.5 : 0.8));
      const target = new THREE.Vector3(c.x, Math.max(lowY, c.y * (0.97 + 0.06 * push)), c.z);
      this.center.lerp(target, kk);
      this.dist += (dist - this.dist) * kk;
      const ce = Math.cos(elev);
      this.controls.target.copy(this.center);
      this.camera.position.set(
        this.center.x + Math.sin(this.cineYaw) * ce * this.dist,
        Math.max(0.35 + lift(this.dist), this.center.y + Math.sin(elev) * this.dist - this.center.y * 0.35),
        this.center.z + Math.cos(this.cineYaw) * ce * this.dist,
      );
    } else if (p.camera.autoFrame && auto) {
      const want = Math.max(MIN_DIST, fit);
      // Pull back faster than we push in so a growing crown never outruns the frame.
      const kk = snap ? 1 : 1 - Math.exp(-dt * (want > this.dist ? 2.5 : 1.0));
      const target = new THREE.Vector3(c.x, Math.max(lowY, c.y), c.z);
      this.center.lerp(target, kk);
      this.dist += (want - this.dist) * kk;
      const off = this.camera.position.clone().sub(this.controls.target);
      off.setLength(this.dist);
      if (snap) off.y = this.dist * 0.08;
      const up = lift(this.dist) - this.center.y;
      if (off.y < up) { off.y = up; off.setLength(this.dist); }
      this.controls.target.copy(this.center);
      this.camera.position.copy(this.center).add(off);
    }
    if (auto && this.easeT < EASE_S) {
      // Blend from the hand-set view into the automatic pose: smoothstep weight, exact at the end (no jump).
      this.easeT = snap ? EASE_S : this.easeT + dt;
      const x = Math.min(1, this.easeT / EASE_S), w = x * x * (3 - 2 * x);
      this.camera.position.lerpVectors(this.easePos, this.camera.position, w);
      this.controls.target.lerpVectors(this.easeTgt, this.controls.target, w);
    }
    this.controls.update(dt);
  }

  /** Storm inputs, written by `main.ts` from `src/weather.ts` each frame: cloud 0..1, flash 0..1. */
  wx = { cloud: 0, flash: 0 };
  private wxCool = new THREE.Color(0.5, 0.57, 0.68);
  private wxFog = new THREE.Color();
  private wxFlash = new THREE.Color(0.72, 0.82, 1.0);
  private wxGrey = new THREE.Color(0.4, 0.44, 0.51);
  /**
   * Storm look as uniform/intensity changes on top of the values `frame` just computed (so calm returns exactly):
   * heavier darker cloud, sun x 0.22 and cooler, cool hemisphere, denser greyer fog, darker sky.
   */
  private wxFlashGain = 1;
  private applyWeather(night: number) {
    this.wxFlashGain = 1 / (1 + 1.6 * night);
    const c = this.wx.cloud, su = this.atmo.sky.material.uniforms, U = this.atmo.skyUniforms;
    su.cloudCoverage.value = 0.35 + 0.6 * c;
    su.cloudDensity.value = 0.35 + 0.6 * c;
    if (c <= 0) return;
    const fc = this.fog.color, L = fc.r * 0.3 + fc.g * 0.59 + fc.b * 0.11;
    // Storm haze: grey-blue at the fog's own luminance, darkened (less at night, where it is already dark).
    this.wxFog.copy(this.wxCool).multiplyScalar(L * (0.4 + 0.4 * night) / 0.57);
    fc.lerp(this.wxFog, 0.85 * c);
    U.fogCol.value.copy(fc);
    U.skyGain.value *= 1 - 0.72 * c;
    // Overcast: the blue drains out of the sky (tint toward grey at its own luminance) and the sun disc disappears.
    const t0 = U.skyTint.value, t1 = Math.max(t0, 0.9 * c);
    if (t1 > 0) U.skyTintCol.value.lerp(this.wxGrey, 1 - t0 / t1);
    U.skyTint.value = t1;
    // Stars go behind the cloud deck (opacity is rewritten by the atmosphere every frame).
    const stars = this.atmo.stars, sm = stars.material as THREE.PointsMaterial;
    sm.opacity *= 1 - c;
    stars.visible = sm.opacity > 0.01;
    U.disc1Col.value.multiplyScalar(1 - c);
    U.disc2Col.value.multiplyScalar(1 - c);
    this.fog.density *= 1 + 1.2 * c;
    this.sun.intensity *= 1 - 0.78 * c;
    this.sun.color.lerp(this.wxCool, 0.7 * c);
    this.hemi.color.lerp(this.wxCool, 0.75 * c);
    this.hemi.groundColor.multiplyScalar(1 - 0.35 * c);
    this.hemi.intensity *= 1 - 0.3 * c;
    this.scene.environmentIntensity *= 1 - 0.55 * c;
  }
  /** Lightning flash for this frame only (call after everything that bakes from the lights, before `render`). */
  applyFlash() {
    const f = this.wx.flash;
    if (f <= 0) return;
    const U = this.atmo.skyUniforms;
    // Night exposure is 2.6x: scale the flash so it lands at the same screen brightness as by day.
    const e = this.wxFlashGain;
    this.sun.intensity += 2.2 * f * e;
    this.sun.color.lerp(this.wxFlash, 0.85 * f);
    this.hemi.intensity += 1.1 * f * e;
    this.hemi.color.lerp(this.wxFlash, 0.85 * f);
    this.hemi.groundColor.lerp(this.wxFlash, 0.35 * f);
    U.skyGain.value = U.skyGain.value * (1 + 1.5 * f) + 0.12 * f * e;
    this.fog.color.lerp(this.wxFlash, 0.2 * f).multiplyScalar(1 + 0.5 * f).addScalar(0.1 * f * e);
    U.fogCol.value.copy(this.fog.color);
    this.scene.environmentIntensity *= 1 + 0.6 * f;
  }

  render(p: ArborParams) {
    if (this.contextLost) return;
    this.applyQuality(p.sky.quality);
    this.adaptDpr(performance.now());
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

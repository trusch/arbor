import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import type { ArborParams } from '../params';
import type { TreeSim } from '../sim/tree';
import { makeGrassTexture } from './textures';

/** Renderer, camera, lights, sky, ground; sun shadow + camera framing track the tree. */
export class Stage {
  renderer: THREE.WebGLRenderer;
  scene = new THREE.Scene();
  camera: THREE.PerspectiveCamera;
  controls: OrbitControls;
  sun: THREE.DirectionalLight;
  hemi: THREE.HemisphereLight;
  private center = new THREE.Vector3(0, 1, 0);
  private dist = 6;

  constructor(container: HTMLElement) {
    const r = (this.renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true }));
    r.setPixelRatio(Math.min(2, window.devicePixelRatio));
    r.setSize(window.innerWidth, window.innerHeight);
    r.toneMapping = THREE.ACESFilmicToneMapping;
    r.toneMappingExposure = 1.0;
    r.outputColorSpace = THREE.SRGBColorSpace;
    r.shadowMap.enabled = true;
    r.shadowMap.type = THREE.PCFShadowMap;
    container.appendChild(r.domElement);

    this.camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 0.05, 2000);
    this.camera.position.set(6, 2.5, 8);
    this.controls = new OrbitControls(this.camera, r.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.06;
    this.controls.autoRotateSpeed = 0.35;
    this.controls.maxPolarAngle = Math.PI * 0.495;

    const fogColor = new THREE.Color(0xb8c7d6);
    this.scene.fog = new THREE.Fog(fogColor, 40, 260);
    this.scene.add(this.makeSky());

    this.hemi = new THREE.HemisphereLight(0xcfe3ff, 0x4a5a32, 0.9);
    this.scene.add(this.hemi);
    this.sun = new THREE.DirectionalLight(0xfff1dc, 2.6);
    this.sun.castShadow = true;
    this.sun.shadow.mapSize.set(2048, 2048);
    this.sun.shadow.bias = -0.0004;
    this.sun.shadow.normalBias = 0.02;
    this.sun.shadow.radius = 4;
    this.scene.add(this.sun, this.sun.target);

    const grass = makeGrassTexture();
    grass.repeat.set(60, 60);
    const ground = new THREE.Mesh(
      new THREE.CircleGeometry(300, 64).rotateX(-Math.PI / 2),
      new THREE.MeshStandardMaterial({ map: grass, roughness: 0.95, color: 0xd8e0c8 }),
    );
    ground.receiveShadow = true;
    this.scene.add(ground);

    window.addEventListener('resize', () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      r.setSize(window.innerWidth, window.innerHeight);
    });
  }

  private makeSky() {
    const geo = new THREE.SphereGeometry(900, 32, 16);
    const mat = new THREE.ShaderMaterial({
      side: THREE.BackSide,
      depthWrite: false,
      fog: false,
      uniforms: { top: { value: new THREE.Color(0x5d8fc9) }, horizon: { value: new THREE.Color(0xc9d6e2) } },
      vertexShader: 'varying vec3 vP; void main(){ vP = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
      fragmentShader:
        'uniform vec3 top; uniform vec3 horizon; varying vec3 vP; void main(){ float h = clamp(normalize(vP).y, 0.0, 1.0); gl_FragColor = vec4(mix(horizon, top, pow(h, 0.55)), 1.0); }',
    });
    return new THREE.Mesh(geo, mat);
  }

  /** Track tree bounds: sun shadow frustum + optional camera auto-framing. snap=true jumps instead of easing. */
  frame(sim: TreeSim, p: ArborParams, dt: number, snap = false) {
    const mn = sim.bboxMin, mx = sim.bboxMax;
    const c = new THREE.Vector3((mn[0] + mx[0]) / 2, (mn[1] + mx[1]) / 2, (mn[2] + mx[2]) / 2);
    const ext = Math.max(1.2, Math.hypot(mx[0] - mn[0], mx[1] - mn[1], mx[2] - mn[2]) / 2);

    const az = (p.light.azimuth * Math.PI) / 180, el = (p.light.elevation * Math.PI) / 180;
    const dir = new THREE.Vector3(Math.cos(el) * Math.cos(az), Math.sin(el), Math.cos(el) * Math.sin(az));
    this.sun.position.copy(c).addScaledVector(dir, ext * 4);
    this.sun.target.position.copy(c);
    const cam = this.sun.shadow.camera;
    const e = ext * 1.4;
    cam.left = -e; cam.right = e; cam.top = e; cam.bottom = -e;
    cam.near = 0.1; cam.far = ext * 8;
    cam.updateProjectionMatrix();

    this.controls.autoRotate = p.camera.autoRotate;
    if (p.camera.autoFrame) {
      const k = snap ? 1 : 1 - Math.exp(-dt * 1.2);
      const fov = (this.camera.fov * Math.PI) / 180;
      const want = Math.max(2.5, (ext / Math.sin(fov / 2)) * 0.95);
      const target = new THREE.Vector3(c.x, Math.max(0.6, c.y * 0.92), c.z);
      this.center.lerp(target, k);
      this.dist += (want - this.dist) * k;
      const off = this.camera.position.clone().sub(this.controls.target);
      off.setLength(this.dist);
      if (snap) off.y = this.dist * 0.18;
      this.controls.target.copy(this.center);
      this.camera.position.copy(this.center).add(off);
    }
    this.controls.update(dt);
  }
}

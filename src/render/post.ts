import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { GTAOPass } from 'three/addons/postprocessing/GTAOPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

/** Screen-space crepuscular rays: radial blur of bright (sky) pixels toward the sun, added on top. HDR, pre-tonemap. */
const GodRaysShader = {
  uniforms: {
    tDiffuse: { value: null },
    sunUv: { value: new THREE.Vector2(0.5, 0.5) },
    strength: { value: 0 },
    tint: { value: new THREE.Color(1, 0.8, 0.6) },
    aspect: { value: 1 },
  },
  vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
  fragmentShader: /* glsl */ `
    uniform sampler2D tDiffuse; uniform vec2 sunUv; uniform float strength; uniform vec3 tint; uniform float aspect;
    varying vec2 vUv;
    float bright(vec2 uv){ vec3 c = texture2D(tDiffuse, uv).rgb; float l = dot(c, vec3(0.3,0.59,0.11)); return smoothstep(0.9, 3.0, l); }
    void main(){
      vec4 base = texture2D(tDiffuse, vUv);
      if (strength <= 0.0) { gl_FragColor = base; return; }
      vec2 d = (sunUv - vUv);
      float dist = length(d * vec2(aspect, 1.0));
      vec2 stepv = d / 40.0;
      vec2 uv = vUv;
      float acc = 0.0, w = 1.0;
      float jit = fract(sin(dot(vUv, vec2(12.9898,78.233))) * 43758.5453);
      uv += stepv * jit;
      for (int i = 0; i < 40; i++) { float sd = length((uv - sunUv) * vec2(aspect, 1.0)); acc += bright(uv) * exp(-sd * 9.0) * w; w *= 0.965; uv += stepv; }
      acc /= 40.0;
      float fall = exp(-dist * 2.2);
      gl_FragColor = vec4(base.rgb + tint * acc * strength * fall, base.a);
    }`,
};

/** Display-space grade: split-tone (warm highs / cool shadows), saturation, vignette, film grain. */
const GradeShader = {
  uniforms: {
    tDiffuse: { value: null },
    time: { value: 0 },
    vignette: { value: 0.35 },
    grain: { value: 0.035 },
    warm: { value: new THREE.Color(1.04, 1.0, 0.93) },
    cool: { value: new THREE.Color(0.92, 0.98, 1.06) },
    saturation: { value: 1.05 },
  },
  vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
  fragmentShader: /* glsl */ `
    uniform sampler2D tDiffuse; uniform float time, vignette, grain, saturation; uniform vec3 warm, cool;
    varying vec2 vUv;
    float h(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7)) + time * 61.0) * 43758.5453); }
    void main(){
      vec3 c = texture2D(tDiffuse, vUv).rgb;
      float l = dot(c, vec3(0.2126,0.7152,0.0722));
      c *= mix(cool, warm, smoothstep(0.1, 0.75, l));
      c = mix(vec3(l), c, saturation);
      vec2 q = vUv - 0.5;
      c *= 1.0 - vignette * smoothstep(0.25, 0.85, dot(q, q) * 2.2);
      c += (h(vUv * 1000.0) - 0.5) * grain * (1.0 - 0.6 * l);
      gl_FragColor = vec4(clamp(c, 0.0, 1.0), 1.0);
    }`,
};

export class Post {
  composer: EffectComposer;
  gtao: GTAOPass;
  bloom: UnrealBloomPass;
  rays: ShaderPass;
  grade: ShaderPass;

  constructor(renderer: THREE.WebGLRenderer, scene: THREE.Scene, camera: THREE.PerspectiveCamera) {
    const w = window.innerWidth, h = window.innerHeight;
    const rt = new THREE.WebGLRenderTarget(w, h, { type: THREE.HalfFloatType, samples: 4 });
    const c = (this.composer = new EffectComposer(renderer, rt));
    c.addPass(new RenderPass(scene, camera));
    this.gtao = new GTAOPass(scene, camera, w, h);
    this.gtao.blendIntensity = 0.75;
    this.gtao.updateGtaoMaterial({ radius: 0.6, distanceExponent: 1.5, thickness: 1.5, scale: 1, samples: 12 });
    this.gtao.updatePdMaterial({ lumaPhi: 10, depthPhi: 2, normalPhi: 3, radius: 6, rings: 2, samples: 12 });
    c.addPass(this.gtao);
    // scene.overrideMaterial (MeshNormalMaterial) ignores map/alphaTest, so alpha-tested cards (leaves) would write their
    // whole quad into the AO depth/normal buffer and show as hatched rectangles. Objects can supply their own g-buffer
    // material in `userData.gbufferMaterial` (allowOverride = false); it is swapped in for the g-buffer render only.
    const g = this.gtao as unknown as { _renderOverride: (...a: unknown[]) => void };
    const orig = g._renderOverride.bind(g);
    g._renderOverride = (...a: unknown[]) => {
      const swapped: [THREE.Mesh, THREE.Material | THREE.Material[]][] = [];
      scene.traverseVisible((o) => {
        const m = o as THREE.Mesh, gm = o.userData.gbufferMaterial as THREE.Material | undefined;
        if (m.isMesh && gm) { swapped.push([m, m.material]); m.material = gm; }
      });
      try { orig(...a); } finally { for (const [m, mat] of swapped) m.material = mat; }
    };
    this.rays = new ShaderPass(GodRaysShader);
    c.addPass(this.rays);
    this.bloom = new UnrealBloomPass(new THREE.Vector2(w, h), 0.2, 0.4, 2.5);
    c.addPass(this.bloom);
    c.addPass(new OutputPass());
    this.grade = new ShaderPass(GradeShader);
    c.addPass(this.grade);
  }

  setSize(w: number, h: number) {
    this.composer.setSize(w, h);
    this.rays.uniforms.aspect.value = w / h;
  }
}

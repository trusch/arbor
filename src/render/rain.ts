import * as THREE from 'three';
import type { Weather } from '../weather';
import type { Wind } from '../wind';

/**
 * Rain sheets and the lightning bolt (audit 3.5 "Rain", "Lightning and thunder"), phone-safe: every material is a
 * clone of the canopy-shadow decal `MeshBasicMaterial` (P-DECAL) with only `map`, `color`, `opacity` and blending
 * state changed, so no new shader program is compiled. Rain = 3 camera-facing planes at different depths with a
 * painted streak sheet scrolled through `texture.offset` and tilted by the wind: 3 draw calls, zero uploads per frame.
 * Bolt = one plane with one of 3 pre-painted bolt textures, additive, drawn only while `weather.bolt.on`.
 */
const LAYERS = [
  // distance m, tile size m, fall speed m/s, opacity
  { d: 14, tile: 9, speed: 9, alpha: 0.5 },
  { d: 5, tile: 3.6, speed: 10, alpha: 0.42 },
  { d: 1.6, tile: 1.5, speed: 11, alpha: 0.3 },
];
const BOLT_DIST = 150, BOLT_H = 95;

function mulberry(seed: number) {
  return () => { seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}

/** Streak sheet: thin vertical motion-blurred drops on transparent, tiling in both axes. */
function streakTexture(seed: number, n: number, len: number, width: number) {
  const W = 256, H = 512, c = document.createElement('canvas');
  c.width = W; c.height = H;
  const g = c.getContext('2d')!, r = mulberry(seed);
  g.lineCap = 'round';
  for (let i = 0; i < n; i++) {
    const x = r() * W, y = r() * H, l = len * (0.5 + r()), a = 0.25 + 0.6 * r();
    for (const oy of [-H, 0, H]) {
      const gr = g.createLinearGradient(0, y + oy, 0, y + oy + l);
      gr.addColorStop(0, 'rgba(255,255,255,0)');
      gr.addColorStop(0.7, `rgba(255,255,255,${a})`);
      gr.addColorStop(1, 'rgba(255,255,255,0)');
      g.strokeStyle = gr;
      g.lineWidth = width * (0.6 + 0.8 * r());
      g.beginPath(); g.moveTo(x, y + oy); g.lineTo(x, y + oy + l); g.stroke();
    }
  }
  return c;
}

/** One jagged cloud-to-ground channel with a few fading side branches and a soft glow. */
function boltTexture(seed: number) {
  const W = 256, H = 512, c = document.createElement('canvas');
  c.width = W; c.height = H;
  const g = c.getContext('2d')!, r = mulberry(seed);
  const path = (x: number, y: number, yEnd: number, drift: number, w: number, a: number, depth: number) => {
    const pts: [number, number][] = [[x, y]];
    while (y < yEnd) {
      y += 8 + r() * 22;
      x += (r() - 0.5) * 34 + drift;
      x = Math.max(20, Math.min(W - 20, x));
      pts.push([x, y]);
      if (depth < 2 && r() < 0.16) path(x, y, Math.min(yEnd, y + 60 + r() * 150), (r() - 0.5) * 16, w * 0.45, a * 0.6, depth + 1);
    }
    for (const [lw, al, blur] of [[w * 7, 0.1 * a, 10], [w * 2.6, 0.35 * a, 4], [w, a, 0]] as const) {
      g.strokeStyle = `rgba(255,255,255,${al})`;
      g.lineWidth = lw; g.lineJoin = 'round'; g.lineCap = 'round';
      g.shadowColor = 'rgba(255,255,255,0.8)'; g.shadowBlur = blur;
      g.beginPath();
      pts.forEach(([px, py], i) => (i ? g.lineTo(px, py) : g.moveTo(px, py)));
      g.stroke();
    }
  };
  path(W / 2 + (r() - 0.5) * 60, 0, H - 2, 0, 2.6, 1, 0);
  return c;
}

export class Rain {
  group = new THREE.Group();
  sheets: THREE.Mesh[] = [];
  bolt: THREE.Mesh;
  private boltMaps: THREE.Texture[] = [];
  private fwd = new THREE.Vector3();
  private right = new THREE.Vector3();
  private rot = new THREE.Quaternion();
  private zAxis = new THREE.Vector3(0, 0, 1);

  /** decal: the canopy-shadow material (program donor). gbuffer: give the planes an invisible GTAO material (High). */
  constructor(decal: THREE.MeshBasicMaterial) {
    const tex = (cv: HTMLCanvasElement, wrap: boolean) => {
      const t = new THREE.CanvasTexture(cv);
      t.colorSpace = decal.map?.colorSpace ?? THREE.SRGBColorSpace;
      if (wrap) t.wrapS = t.wrapT = THREE.RepeatWrapping;
      return t;
    };
    // The GTAO g-buffer pass must not see these planes (its override material would draw solid quads).
    const hidden = new THREE.MeshBasicMaterial({ visible: false });
    (hidden as unknown as { allowOverride: boolean }).allowOverride = false;
    const geo = new THREE.PlaneGeometry(1, 1);
    LAYERS.forEach((L, i) => {
      const m = decal.clone();
      m.map = tex(streakTexture(11 + i * 7, i === 0 ? 150 : i === 1 ? 70 : 26, i === 0 ? 46 : i === 1 ? 80 : 130, i === 0 ? 1.1 : i === 1 ? 1.5 : 2.2), true);
      m.color.setRGB(1, 1, 1);
      const mesh = new THREE.Mesh(geo, m);
      mesh.renderOrder = 6 + i;
      mesh.frustumCulled = false;
      mesh.visible = false;
      mesh.userData.gbufferMaterial = hidden;
      this.sheets.push(mesh);
      this.group.add(mesh);
    });
    for (let i = 0; i < 3; i++) this.boltMaps.push(tex(boltTexture(101 + i * 13), false));
    const bm = decal.clone();
    bm.map = this.boltMaps[0];
    bm.blending = THREE.AdditiveBlending;
    this.bolt = new THREE.Mesh(geo, bm);
    this.bolt.renderOrder = 5;
    this.bolt.frustumCulled = false;
    this.bolt.visible = false;
    this.bolt.userData.gbufferMaterial = hidden;
    this.group.add(this.bolt);
  }

  /**
   * light: scene brightness for the streaks (about 1 at noon, small at night). layers: how many sheets to draw
   * (2 when the adaptive pixel ratio has stepped down: fill-rate relief).
   */
  frame(camera: THREE.PerspectiveCamera, W: Weather, wind: Wind, dt: number, light: number, layers = 3) {
    const rain = W.rain, show = rain > 0.01;
    camera.getWorldDirection(this.fwd);
    this.right.set(1, 0, 0).applyQuaternion(camera.quaternion);
    if (show) {
      const tanV = Math.tan((camera.fov * Math.PI) / 360);
      // Slant: lateral wind speed against fall speed, as seen from the camera.
      const lateral = (wind.dirX * this.right.x + wind.dirZ * this.right.z) * wind.base;
      const slant = Math.max(-0.75, Math.min(0.75, Math.atan(lateral * 0.95)));
      this.rot.setFromAxisAngle(this.zAxis, slant);
      const b = light * (1 + 5 * W.flash);
      for (let i = 0; i < this.sheets.length; i++) {
        const mesh = this.sheets[i], L = LAYERS[i], m = mesh.material as THREE.MeshBasicMaterial;
        mesh.visible = i >= this.sheets.length - layers;
        if (!mesh.visible) continue;
        // Square big enough to cover the frustum at this depth under any slant.
        const size = 2 * L.d * tanV * Math.hypot(1, camera.aspect) * 1.08;
        mesh.position.copy(camera.position).addScaledVector(this.fwd, L.d);
        mesh.quaternion.copy(camera.quaternion).multiply(this.rot);
        mesh.scale.set(size, size, 1);
        const t = m.map!;
        t.repeat.set(size / L.tile, size / (L.tile * 2));
        t.offset.y = (t.offset.y + (dt * L.speed * (1 + 0.5 * wind.base)) / (L.tile * 2)) % 1;
        t.offset.x = (t.offset.x + dt * 0.05 * (i + 1)) % 1;
        m.color.setRGB(0.72 * b, 0.78 * b, 0.88 * b);
        m.opacity = L.alpha * rain;
      }
    } else for (const s of this.sheets) s.visible = false;

    const B = W.bolt;
    this.bolt.visible = B.on;
    if (B.on) {
      const m = this.bolt.material as THREE.MeshBasicMaterial;
      m.map = this.boltMaps[B.variant % 3];
      // Inside the horizontal field of view, far enough to stand behind the tree, near enough to survive the storm fog.
      const yaw = Math.atan2(this.fwd.x, this.fwd.z) + B.u * Math.atan(Math.tan((camera.fov * Math.PI) / 360) * camera.aspect) * 0.8;
      this.bolt.position.set(camera.position.x + Math.sin(yaw) * BOLT_DIST, BOLT_H / 2 - 2, camera.position.z + Math.cos(yaw) * BOLT_DIST);
      this.bolt.rotation.set(0, yaw + Math.PI, 0);
      this.bolt.scale.set(BOLT_H * 0.5, BOLT_H, 1);
      const k = 0.5 + 0.5 * W.flash;
      m.color.setRGB(14 * k, 15 * k, 18 * k);
      m.opacity = 1;
    }
  }
}

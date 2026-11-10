import * as THREE from 'three';
import { defaultParams, applyQueryOverrides } from './params';
import { TreeSim } from './sim/tree';
import { Stage } from './render/stage';
import { BranchMesh } from './render/branchMesh';
import { Leaves } from './render/leaves';
import { makeBarkTextures, makeLeafTexture } from './render/textures';
import { buildGui } from './ui';
import { Automation } from './automation';
import { PRESETS, presetParams } from './presets';
import { envelopeDims } from './sim/envelope';

const query = new URLSearchParams(location.search);
const params = defaultParams();
const automation = new Automation(params);
let presetName = query.get('preset') ?? 'Oak meadow';
/** Copy a preset into the live params object in place (GUI controllers stay bound) and load its journey. */
function loadPreset(name: string) {
  presetName = name;
  const src = presetParams(name) as unknown as Record<string, Record<string, unknown>>;
  const dst = params as unknown as Record<string, Record<string, unknown>>;
  for (const g of Object.keys(src)) if (g !== 'seed' && g !== 'camera' && g !== 'time') Object.assign(dst[g], src[g]);
  automation.drift = {};
  automation.journey = (PRESETS[name]?.journey ?? []).map((k) => ({ t: k.t, values: { ...k.values } }));
}
loadPreset(presetName);
applyQueryOverrides(params, location.search);

const stage = new Stage(document.body);
const sim = new TreeSim(params);
const branches = new BranchMesh(makeBarkTextures());
const leaves = new Leaves(makeLeafTexture());
stage.scene.add(branches.mesh, leaves.mesh);

const MAX_STEP = 1 / 20;
/** Crown envelope the attractors were sampled for; automation re-samples when it drifts (e.g. gravity journey). */
let envKey = '';
const envSig = () => { const e = envelopeDims(params); return [e.radius, e.height, e.base, params.crown.shape].map((v) => v.toFixed(1)).join(); };
function advance(simSeconds: number) {
  let left = simSeconds;
  while (left > 1e-6) {
    const d = Math.min(MAX_STEP, left);
    automation.apply(sim.time);
    const k = envSig();
    if (k !== envKey) { if (envKey && sim.time > 0) sim.rebuildAttractors(); envKey = k; }
    sim.step(d);
    left -= d;
  }
}
function regrow() {
  automation.apply(0);
  envKey = envSig();
  sim.reset();
}

let meshAge = Infinity;
let leavesDirty = true;
let lastTopo = -1;
/** Branch tubes are rebuilt on the CPU; throttle to ~8 Hz (immediately on topology change when paused-ish). */
function redraw(time: number, dt: number) {
  meshAge += dt;
  const growing = !params.time.paused && params.time.speed > 0;
  if (meshAge >= (growing ? 0.12 : 0.25) || (!growing && sim.topology !== lastTopo)) {
    branches.update(sim, params.thickness.rootFlare);
    leavesDirty = true;
    meshAge = 0;
    lastTopo = sim.topology;
  }
  if (!leavesDirty) { leaves.tick(time); return; }
  leavesDirty = false;
  const repl = leaves.update(sim, params, time);
  if (repl) {
    stage.scene.children.filter((o) => o instanceof THREE.InstancedMesh).forEach((o) => stage.scene.remove(o));
    stage.scene.add(repl);
  }
}

if (query.get('nogui') !== '1') {
  buildGui(params, automation, {
    regrow,
    newSeed: () => {
      params.seed.seed = Math.floor(Math.random() * 999999);
      regrow();
    },
    crownChanged: () => sim.rebuildAttractors(),
    preset: (name) => { loadPreset(name); regrow(); },
    presetNames: Object.keys(PRESETS),
    currentPreset: () => presetName,
    simTime: () => sim.time,
  });
}
stage.controls.addEventListener('start', () => (params.camera.autoFrame = false));

// Watch mode: H hides all UI; a small age/time overlay fades in on activity and out when idle.
const overlay = document.getElementById('overlay')!;
let uiHidden = query.get('hideui') === '1';
let activity = 0;
const applyUi = () => document.body.classList.toggle('watch', uiHidden);
applyUi();
addEventListener('keydown', (e) => {
  if (e.key === 'h' || e.key === 'H') { uiHidden = !uiHidden; applyUi(); activity = 0; }
  if (e.key === 'c' || e.key === 'C') { params.camera.cinema = !params.camera.cinema; stage.idle = 1e9; }
});
addEventListener('pointermove', () => (activity = 0));
const glow = new THREE.Color();

const hud = document.getElementById('hud')!;
let last = performance.now();
let elapsed = 0;
let frames = 0, fpsT = 0, fps = 0;
function loop(now: number) {
  const dt = Math.min(0.1, (now - last) / 1000);
  last = now;
  elapsed += dt;
  if (!params.time.paused && params.time.speed > 0) advance(dt * params.time.speed);
  else sim.updateStructure(0);
  stage.frame(sim, params, dt);
  redraw(elapsed, dt);
  activity += dt;
  overlay.style.opacity = String(Math.max(0, Math.min(1, 1 - (activity - 4) / 2)) * 0.85);
  const lp = params.leaves;
  glow.setHSL(lp.glowHue, 0.9, 0.55).multiplyScalar(lp.glow * (0.12 + 0.88 * stage.atmo.night));
  leaves.setGlow(glow);
  leaves.setSun(stage.atmo.keyDir, stage.atmo.keyColor, stage.atmo.keyIntensity, stage.camera.matrixWorldInverse);
  stage.render(params);
  frames++;
  fpsT += dt;
  if (fpsT > 0.5) {
    fps = frames / fpsT;
    frames = 0;
    fpsT = 0;
    const hr = params.sky.timeOfDay, hh = Math.floor(hr), mm = Math.floor((hr - hh) * 60);
    overlay.textContent = `${presetName} · age ${sim.time.toFixed(0)} s · ${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
    hud.textContent = `t ${sim.time.toFixed(1)}s  nodes ${sim.nodes.length}  leaves ${leaves.mesh.count}  free attractors ${sim.attractorCount}  ${fps.toFixed(0)} fps`;
  }
  requestAnimationFrame(loop);
}

regrow();
const ff = Number(query.get('t') ?? 0);
if (ff > 0) advance(ff);
sim.updateStructure(0);
stage.frame(sim, params, 0, true);
requestAnimationFrame(loop);

/** Automation / test hook. */
(window as unknown as { __arbor: unknown }).__arbor = {
  params,
  automation,
  loadPreset: (n: string) => { loadPreset(n); regrow(); },
  sim,
  stage,
  fastForward(seconds: number) {
    advance(seconds);
    sim.updateStructure(0);
    stage.frame(sim, params, 0, true);
    meshAge = Infinity;
    redraw(elapsed, 0);
    stage.render(params);
    return { nodes: sim.nodes.length, leaves: sim.leaves.length, time: sim.time };
  },
};

import * as THREE from 'three';
import { defaultParams, applyQueryOverrides } from './params';
import { TreeSim } from './sim/tree';
import { Stage, showNotice } from './render/stage';
import { BranchMesh } from './render/branchMesh';
import { Leaves } from './render/leaves';
import { makeBarkTextures, makeLeafTexture } from './render/textures';
import { buildGui } from './ui';
import { Automation } from './automation';
import { PRESETS, presetParams } from './presets';
import { envelopeDims } from './sim/envelope';
import { tel, diagSwitches } from './tel';

const query = new URLSearchParams(location.search);
const params = defaultParams();
const automation = new Automation(params);
let presetName = query.get('preset') ?? 'Oak meadow';
/** Node cap for low-end devices; re-applied after every preset load. */
let nodeBudget = Infinity;
/** Copy a preset into the live params object in place (GUI controllers stay bound) and load its journey. */
function loadPreset(name: string) {
  presetName = name;
  const src = presetParams(name) as unknown as Record<string, Record<string, unknown>>;
  const dst = params as unknown as Record<string, Record<string, unknown>>;
  for (const g of Object.keys(src)) if (g !== 'seed' && g !== 'camera' && g !== 'time') Object.assign(dst[g], src[g]);
  params.growth.maxNodes = Math.min(params.growth.maxNodes, nodeBudget);
  automation.drift = {};
  automation.journey = (PRESETS[name]?.journey ?? []).map((k) => ({ t: k.t, values: { ...k.values } }));
}
loadPreset(presetName);
applyQueryOverrides(params, location.search);
// Phones / weak GPUs default to Low (no post RTs, DPR 1, 1024 shadow map); ?quality=High overrides.
const lowEnd = lowEndDevice();
if (!query.has('quality') && !query.has('sky.quality') && lowEnd) params.sky.quality = 'Low';
// Phones also get a smaller growth budget (fewer segments → fewer tube vertices and leaves); ?maxNodes= overrides.
if (lowEnd && !query.has('maxNodes') && !query.has('growth.maxNodes')) params.growth.maxNodes = Math.min(params.growth.maxNodes, (nodeBudget = 7000));
// Diagnostics bisect switches (?safe=1, ?shadows=0, ?leaves=0, ?sky=basic, ?grow=0, ?antialias=0, ?rebuildHz=N); see diag.html.
const diag = diagSwitches(query);
if (diag.safe && !query.has('quality')) params.sky.quality = 'Low';
if (!diag.grow) params.time.paused = true; // combine with ?t=N for a static grown tree
function lowEndDevice() {
  const uad = (navigator as Navigator & { userAgentData?: { mobile?: boolean } }).userAgentData;
  if (uad?.mobile) return true;
  if (/Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent)) return true;
  if (navigator.maxTouchPoints > 1 && Math.min(screen.width, screen.height) < 900) return true; // iPadOS reports as Mac
  if ((navigator as Navigator & { deviceMemory?: number }).deviceMemory !== undefined && (navigator as Navigator & { deviceMemory?: number }).deviceMemory! < 4) return true;
  return false;
}

tel.phase('init stage');
const stage = new Stage(document.body, { antialias: diag.antialias, shadows: diag.shadows });
if (diag.skyBasic) {
  stage.atmo.basic = true;
  stage.atmo.sky.visible = false;
  stage.scene.background = stage.fog.color;
}
tel.phase('init sim');
const sim = new TreeSim(params);
tel.phase('init textures');
const branches = new BranchMesh(makeBarkTextures());
const leaves = new Leaves(makeLeafTexture());
stage.scene.add(branches.mesh);
if (diag.leaves) stage.scene.add(leaves.mesh);

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
let rebuilds = 0;
/** Branch tubes are rebuilt on the CPU; throttle to ~8 Hz (immediately on topology change when paused-ish). */
function redraw(time: number, dt: number) {
  meshAge += dt;
  const growing = !params.time.paused && params.time.speed > 0;
  const period = diag.rebuildHz > 0 ? 1 / diag.rebuildHz : growing ? 0.12 : 0.25;
  if (meshAge >= period || (!growing && sim.topology !== lastTopo)) {
    tel.phase('geometry rebuild');
    branches.update(sim, params.thickness.rootFlare);
    rebuilds++;
    leavesDirty = true;
    meshAge = 0;
    lastTopo = sim.topology;
  }
  if (!diag.leaves) return;
  if (!leavesDirty) { leaves.tick(time); return; }
  leavesDirty = false;
  tel.phase('leaves rebuild');
  const repl = leaves.update(sim, params, time);
  if (repl) {
    tel.log('leaves_realloc', { capacity: repl.instanceMatrix.count, leaves: sim.leaves.length });
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
// Capture phase: lil-gui stops keydown propagation on its controllers, so H/C would die after any GUI click.
addEventListener('keydown', (e) => {
  const el = e.target as HTMLElement | null;
  if (el && (el.tagName === 'INPUT' && (el as HTMLInputElement).type !== 'checkbox' || el.tagName === 'TEXTAREA' || el.isContentEditable)) return;
  if (e.ctrlKey || e.metaKey || e.altKey) return;
  if (e.key === 'h' || e.key === 'H') { uiHidden = !uiHidden; applyUi(); activity = 0; }
  if (e.key === 'c' || e.key === 'C') { params.camera.cinema = !params.camera.cinema; stage.idle = 1e9; }
}, true);
addEventListener('pointermove', () => (activity = 0));
const glow = new THREE.Color();

const hud = document.getElementById('hud')!;
let last = performance.now();
let elapsed = 0;
let frames = 0, fpsT = 0, fps = 0;
let frameErrors = 0;
let frameCount = 0;
function loop(now: number) {
  requestAnimationFrame(loop);
  try {
    frame(now);
  } catch (e) {
    // Never let one bad frame stop the loop forever; report the first few.
    if (frameErrors++ < 3) console.error('arbor frame error', e); // telemetry.js forwards console.error
    if (frameErrors === 1) showNotice(`Render error: ${(e as Error)?.message ?? e} (still running)`);
  }
}
function frame(now: number) {
  const dt = Math.min(0.1, (now - last) / 1000);
  last = now;
  elapsed += dt;
  frameCount++;
  tel.phase('sim step', true);
  if (!params.time.paused && params.time.speed > 0) advance(dt * params.time.speed);
  else sim.updateStructure(0);
  tel.phase('stage frame', true);
  stage.frame(sim, params, dt);
  redraw(elapsed, dt);
  activity += dt;
  overlay.style.opacity = String(Math.max(0, Math.min(1, 1 - (activity - 4) / 2)) * 0.85);
  const lp = params.leaves;
  glow.setHSL(lp.glowHue, 0.9, 0.55).multiplyScalar(lp.glow * (0.12 + 0.88 * stage.atmo.night));
  leaves.setGlow(glow);
  leaves.setSun(stage.atmo.keyDir, stage.atmo.keyColor, stage.atmo.keyIntensity, stage.camera.matrixWorldInverse);
  tel.phase('render', true);
  stage.render(params);
  tel.phase('idle', true);
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
}

tel.phase('init regrow');
regrow();
const ff = Number(query.get('t') ?? 0);
if (ff > 0) { tel.phase('init fast-forward'); advance(ff); }
sim.updateStructure(0);
tel.phase('init first frame');
stage.frame(sim, params, 0, true);
tel.setStats(() => {
  const r = stage.renderer;
  return {
    frames: frameCount, fps: +fps.toFixed(1), simT: +sim.time.toFixed(2), nodes: sim.nodes.length, leaves: sim.leaves.length,
    leafInst: leaves.mesh.count, leafCap: leaves.mesh.instanceMatrix.count, rebuilds, bakes: stage.atmo.bakes, frameErrors, contextLost: stage.contextLost, quality: params.sky.quality,
    gpuMem: { ...r.info.memory }, calls: r.info.render.calls, tris: r.info.render.triangles, programs: r.info.programs?.length,
    drawBuf: [r.domElement.width, r.domElement.height],
  };
});
{
  const r = stage.renderer;
  tel.info({
    gl: tel.glInfo(r.getContext()), quality: params.sky.quality, lowEnd, maxNodes: params.growth.maxNodes, preset: presetName,
    pixelRatio: r.getPixelRatio(), shadowMap: stage.sun.shadow.mapSize.x, diag,
  });
}
requestAnimationFrame(loop);

/** Automation / test hook. */
(window as unknown as { __arbor: unknown }).__arbor = {
  params,
  automation,
  loadPreset: (n: string) => { loadPreset(n); regrow(); },
  sim,
  stage,
  frameErrors: () => frameErrors,
  fastForward(seconds: number) {
    advance(seconds);
    sim.updateStructure(0);
    stage.frame(sim, params, 0, true);
    meshAge = Infinity;
    redraw(elapsed, 0);
    stage.render(params);
    return { nodes: sim.nodes.length, leaves: sim.leaves.length, time: sim.time, height: +sim.bboxMax[1].toFixed(2), width: +Math.max(sim.bboxMax[0] - sim.bboxMin[0], sim.bboxMax[2] - sim.bboxMin[2]).toFixed(2) };
  },
};

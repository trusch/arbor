import * as THREE from 'three';
import { defaultParams, applyQueryOverrides } from './params';
import { TreeSim } from './sim/tree';
import { Stage, showNotice } from './render/stage';
import { BranchMesh } from './render/branchMesh';
import { Leaves, LEAF_VARIANTS, type LeafMode } from './render/leaves';
import { CanopyShadow } from './render/canopyShadow';
import { makeBarkTextures, makeLeafTexture } from './render/textures';
import { buildGui } from './ui';
import { Automation } from './automation';
import { PRESETS, presetParams } from './presets';
import { envelopeDims } from './sim/envelope';
import { tel, diagSwitches } from './tel';

const query = new URLSearchParams(location.search);
// Old builds auto-marked leaf variants BAD per GPU and ran a variant ladder; both produced false positives
// (a background tab's context loss marked V0 bad) and crashing variants reset the GPU. Drop their keys.
try {
  for (let i = localStorage.length - 1; i >= 0; i--) {
    const k = localStorage.key(i);
    if (k && (k.startsWith('arbor.leafBad.') || k === 'arbor.ladder')) localStorage.removeItem(k);
  }
} catch { /* private mode */ }
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
// Crash-loop guard: count context losses in this tab. After one, the next load uses safe leaves and no shadows.
const CTX_KEY = 'arbor.ctxLost';
const ctxLosses = (() => { try { return Number(sessionStorage.getItem(CTX_KEY)) || 0; } catch { return 0; } })();
if (ctxLosses > 0 && !query.has('shadows')) diag.shadows = false;
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
let stageOrNull: Stage | null = null;
try {
  stageOrNull = new Stage(document.body, { antialias: diag.antialias, shadows: diag.shadows, onContextLost: contextLost });
} catch (e) {
  // Chrome blocks WebGL for the site after a GPU reset: "Error creating WebGL context."
  tel.log('webgl_create_failed', { msg: String((e as Error)?.message ?? e) });
  showNoWebglPage();
}
if (!stageOrNull) await new Promise<never>(() => { /* stop here: nothing to render with */ });
const stage = stageOrNull!;
function showNoWebglPage() {
  const el = document.createElement('div');
  el.id = 'nowebgl';
  el.style.cssText = 'position:fixed;inset:0;z-index:30;background:#1c2126;color:#e8ecef;padding:24px;font:17px/1.55 ui-sans-serif,system-ui,sans-serif;overflow:auto';
  el.innerHTML = '<h2 style="margin:0 0 10px;font-size:20px">3D graphics are blocked</h2>'
    + '<p>Your browser has temporarily blocked 3D graphics for this page after a graphics reset. '
    + 'Fully close Chrome (swipe it away from recent apps) and open the page again.</p>';
  document.body.appendChild(el);
}
/** Record the loss; reload into safe mode on restore the first time, stop reloading and show safe-mode links on the second. */
function contextLost(): boolean {
  let n = ctxLosses + 1;
  try { n = (Number(sessionStorage.getItem(CTX_KEY)) || 0) + 1; sessionStorage.setItem(CTX_KEY, String(n)); } catch { /* private mode */ }
  tel.log('ctx_loss_count', { n });
  if (n < 2) return true;
  showLossPage();
  return false;
}
function showLossPage() {
  const el = document.createElement('div');
  el.id = 'ctxlost';
  el.style.cssText = 'position:fixed;inset:0;z-index:20;background:#1c2126;color:#e8ecef;padding:20px;font:16px/1.5 ui-sans-serif,system-ui,sans-serif;overflow:auto';
  const link = (q: string, t: string) => `<a href="./${q}" style="display:block;margin:8px 0;padding:12px;border-radius:7px;background:#2c343b;color:#fff;text-decoration:none">${t}</a>`;
  el.innerHTML = '<h2 style="margin:0 0 8px;font-size:19px">The graphics driver crashed twice</h2>'
    + '<p>This page stopped reloading itself so it does not loop. Try one of these:</p>'
    + link('?leafsafe=1&shadows=0', 'Safe leaves, no shadows')
    + link('?leafshader=basic&shadows=0', 'Unlit leaves, no shadows')
    + link('?leaves=0', 'No leaves')
    + link('?safe=1', 'Full safe mode')
    + link('diag.html', 'Diagnostics page')
    + '<p style="color:#a9b3bb;font-size:13px">Closing this tab resets the crash counter.</p>';
  document.body.appendChild(el);
}
if (diag.skyBasic) {
  stage.atmo.basic = true;
  stage.atmo.sky.visible = false;
  stage.scene.background = stage.fog.color;
}
tel.phase('init sim');
const sim = new TreeSim(params);
tel.phase('init textures');
const branches = new BranchMesh(makeBarkTextures());
const leafMode = pickLeafMode();
const leaves = new Leaves(makeLeafTexture(), leafMode);
/** Safe leaves on PowerVR/Imagination GPUs (first leaf draw hung the driver → context loss), on mobile Low and after a context loss. */
function pickLeafMode(): LeafMode {
  const gpu = gpuRenderer(stage.renderer.getContext());
  const reason = diag.leafSafe !== null ? (diag.leafSafe ? 'forced' : '')
    : /PowerVR|Imagination/i.test(gpu) ? 'powervr'
    : lowEnd && params.sky.quality === 'Low' ? 'mobile-low'
    : ctxLosses > 0 ? 'context-lost-before' : '';
  const shader = diag.leafShader ?? (reason ? 'safe' : 'full');
  const shadow = diag.leafShadow ?? (shader === 'full' && diag.shadows);
  // V0 is the hard default (known-good on PowerVR). ?leafvariant=N is a manual dev override; V1–V4 may crash the GPU.
  const q = query.get('leafvariant');
  const forced = q !== null && /^\d+$/.test(q) && Number(q) < LEAF_VARIANTS.length;
  const variant = forced ? Number(q) : 0, why = forced ? 'forced' : 'default';
  const mode: LeafMode = { shader, shadow, variant: shader === 'full' ? undefined : variant };
  tel.log('leaf_mode', { ...mode, variantName: shader === 'full' ? null : LEAF_VARIANTS[variant].name, variantWhy: why, reason, gpu, ctxLosses });
  return mode;
}
function gpuRenderer(gl: WebGLRenderingContext | WebGL2RenderingContext) {
  try {
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    return String(gl.getParameter(ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER) ?? '');
  } catch { return ''; }
}
stage.scene.add(branches.mesh);
if (diag.leaves) stage.scene.add(leaves.mesh);
/** CPU canopy shadow decal wherever leaves cannot cast shadow-map shadows (safe path); branches then stop casting. */
const canopy = new CanopyShadow();
stage.scene.add(canopy.mesh);
const sunDirTmp = new THREE.Vector3();
const hemiSky = new THREE.Color(), hemiGround = new THREE.Color(), sunLin = new THREE.Color();

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
let leafBakeD = 1, leafBakeT = -1e9;
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
  // Leaf distance LOD + view-dependent bake: rebake when the camera distance to the crown changed by > 25% (≤ 1/s).
  const camD = stage.camera.position.distanceTo(stage.controls.target);
  if (!leavesDirty && time - leafBakeT > 1 && Math.abs(camD / leafBakeD - 1) > 0.25) leavesDirty = true;
  if (!leavesDirty) { leaves.tick(time); return; }
  leavesDirty = false;
  leafBakeD = camD; leafBakeT = time;
  tel.phase('leaves rebuild');
  const S = stage.sun, H = stage.hemi;
  sunDirTmp.copy(S.position).sub(S.target.position).normalize();
  leaves.setLighting(stage.camera.position, sunDirTmp, sunLin.copy(S.color).multiplyScalar(S.intensity),
    hemiSky.copy(H.color).multiplyScalar(H.intensity), hemiGround.copy(H.groundColor).multiplyScalar(H.intensity));
  leaves.maxInstances = params.sky.quality === 'Low' ? 32000 : 0;
  const decal = !leaves.mesh.castShadow && S.castShadow;
  branches.mesh.castShadow = !decal;
  if (decal) {
    tel.phase('canopy shadow');
    canopy.update(sim, sunDirTmp, Math.min(1, S.intensity / 1.5) * (0.35 + 0.35 * Math.min(1, Math.max(0, (sunDirTmp.y - 0.1) / 0.5))), time, params.time.paused || params.time.speed <= 0 ? 0.5 : 2);
    tel.phase('leaves rebuild');
  } else canopy.mesh.visible = false;
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
// Only a real orbit/zoom stops auto-framing: a tap (e.g. to collapse the GUI) used to freeze the camera at the
// sapling distance, and the crown then grew around it.
{
  const el = stage.renderer.domElement;
  let down: { x: number; y: number } | null = null;
  el.addEventListener('pointerdown', (e) => (down = { x: e.clientX, y: e.clientY }));
  el.addEventListener('pointerup', () => (down = null));
  el.addEventListener('pointercancel', () => (down = null));
  el.addEventListener('pointermove', (e) => {
    if (down && Math.hypot(e.clientX - down.x, e.clientY - down.y) > 8) params.camera.autoFrame = false;
  });
  el.addEventListener('wheel', () => (params.camera.autoFrame = false), { passive: true });
}

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
// Debug HUD line: hidden by default, ?hud=1 or D shows it.
let hudOn = query.get('hud') === '1';
const applyHud = () => document.body.classList.toggle('hud', hudOn);
applyHud();
addEventListener('keydown', (e) => {
  if (e.ctrlKey || e.metaKey || e.altKey || (e.target as HTMLElement | null)?.tagName === 'INPUT') return;
  if (e.key === 'd' || e.key === 'D') { hudOn = !hudOn; applyHud(); }
}, true);
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
  leaves.setGlow(glow, 1 - stage.atmo.night);
  leaves.setSun(stage.atmo.keyDir, stage.atmo.keyColor, stage.atmo.keyIntensity, stage.camera.matrixWorldInverse);
  // Without the High grade/bloom the bark reads pale grey: warm it on Low.
  (branches.mesh.material as THREE.MeshStandardMaterial).color.setHex(params.sky.quality === 'High' ? 0xffffff : 0xb08a6a);
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
    drawBuf: [r.domElement.width, r.domElement.height], pixelRatio: r.getPixelRatio(),
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
  leaves,
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

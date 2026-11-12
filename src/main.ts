import * as THREE from 'three';
import { defaultParams, applyQueryOverrides, paramsVersion, bumpParams, paramsSignature } from './params';
import { TreeSim } from './sim/tree';
import { Stage, showNotice } from './render/stage';
import { BranchMesh } from './render/branchMesh';
import { Leaves, LEAF_VARIANTS, type LeafMode } from './render/leaves';
import { CanopyShadow } from './render/canopyShadow';
import { makeBarkTextures, makeLeafTexture, leafForm } from './render/textures';
import { buildPanel } from './ui';
import { Automation } from './automation';
import { PRESETS, presetParams } from './presets';
import { envelopeDims } from './sim/envelope';
import { tel, diagSwitches } from './tel';
import { Meadow, type MeadowLight } from './render/meadow';
import { wind } from './wind';
import { weather, type WeatherEvent } from './weather';
import { season } from './season';
import { Rain } from './render/rain';
import { Celestial } from './render/celestial';
import { Debris } from './render/debris';
import { Sway } from './render/sway';
import { LeafFall } from './render/leaffall';

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
  for (const g of Object.keys(src)) if (g !== 'seed' && g !== 'camera' && g !== 'time' && g !== 'weather' && g !== 'season') Object.assign(dst[g], src[g]);
  params.growth.maxNodes = Math.min(params.growth.maxNodes, nodeBudget);
  bumpParams();
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
  stageOrNull = new Stage(document.body, { antialias: diag.antialias, backdrop: diag.backdrop, shadows: diag.shadows, onContextLost: contextLost });
} catch (e) {
  // Chrome blocks WebGL for the site after a GPU reset: "Error creating WebGL context."
  tel.log('webgl_create_failed', { msg: String((e as Error)?.message ?? e) });
  showNoWebglPage();
}
if (!stageOrNull) await new Promise<never>(() => { /* stop here: nothing to render with */ });
const stage = stageOrNull!;
// A hand-set view survives the context-loss reload (saved in `contextLost`).
const CAM_KEY = 'arbor.cam';
try {
  const v = JSON.parse(sessionStorage.getItem(CAM_KEY) ?? 'null') as number[] | null;
  sessionStorage.removeItem(CAM_KEY);
  if (Array.isArray(v) && v.length === 6 && v.every(Number.isFinite)) {
    stage.camera.position.set(v[0], v[1], v[2]);
    stage.controls.target.set(v[3], v[4], v[5]);
    stage.takeControl();
  }
} catch { /* private mode */ }
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
  try { if (stageOrNull?.manual) sessionStorage.setItem('arbor.cam', JSON.stringify([...stageOrNull.camera.position.toArray(), ...stageOrNull.controls.target.toArray()])); } catch { /* private mode */ }
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
// Final capacity up front (Low is capped at 32k drawn leaves): no InstancedMesh re-creation while the tree grows.
const leaves = new Leaves(makeLeafTexture(params.leaves.form), leafMode, params.sky.quality === 'Low' ? 32000 : 48000);
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
/** Living meadow (WP3): P-LEAF clones of the live leaf material; ?meadow=0 or the Meadow switch turns it off. */
const meadow = diag.meadow ? new Meadow(leaves.mesh.material as THREE.Material, 7, diag.backdrop) : null;
if (meadow) stage.scene.add(meadow.group);
const meadowLight: MeadowLight = { sunDir: new THREE.Vector3(0, 1, 0), sunCol: new THREE.Color(), hemi: new THREE.Color(), night: 0, tintHue: 0, tint: 0, frac: 1 };
/** Weather (WP9): state machine -> stage storm look + wind; rain sheets and bolt are P-DECAL clones of the canopy decal. */
const rain = diag.rain ? new Rain(canopy.mesh.material as THREE.MeshBasicMaterial) : null;
if (rain) stage.scene.add(rain.group);
/** Sun glow, moon, star detail: P-DECAL clones like the rain (`?celestial=0` turns the planes and star detail off). */
const celestial = query.get('celestial') !== '0' ? new Celestial(canopy.mesh.material as THREE.MeshBasicMaterial, stage.atmo.stars) : null;
if (celestial) stage.scene.add(celestial.group);
{
  const qw = query.get('weather');
  if (qw === 'storm' || qw === 'calm' || qw === 'auto') params.weather.event = qw;
  if (qw === 'storm') weather.snapStorm();
}
let bakedCloud = 0, decalSeen = false;
/** Before `stage.frame`: advance the weather and hand its scalars to the stage. */
function weatherFrame(dt: number) {
  tel.phase('weather', true);
  weather.update(dt, params.weather.event as WeatherEvent, params.weather.lightning);
  stage.wx.cloud = weather.cloud;
  stage.wx.flash = weather.flash;
  // The safe leaf path bakes the light into instance colours: rebake as the storm light moves (and once when it settles).
  if (Math.abs(weather.cloud - bakedCloud) > 0.06 || (weather.cloud !== bakedCloud && (weather.cloud === 0 || weather.cloud === 1))) { bakedCloud = weather.cloud; leavesDirty = true; }
}
/** Just before `stage.render`: flash on the lights (after all bakes read them), decal fade under overcast, rain planes. */
function weatherRender(dt: number) {
  tel.phase('weather', true);
  stage.applyFlash();
  (canopy.mesh.material as THREE.MeshBasicMaterial).opacity = 1 - 0.65 * weather.cloud;
  celestial?.frame(stage.camera, stage.atmo, weather.cloud, stage.fog.density, dt, params.sky.quality === 'Low');
  if (!rain) return;
  const night = stage.atmo.night, low = params.sky.quality === 'Low';
  // PowerVR rule: on Low the rain/bolt planes only draw once the canopy decal (their program donor) has been drawn,
  // so the storm can never be the first to compile that program.
  if (canopy.mesh.visible) decalSeen = true;
  rain.group.visible = !low || decalSeen;
  if (!rain.group.visible) return;
  rain.frame(stage.camera, weather, wind, dt, 0.5 * (1 - night) + 0.05, night, low && stage.renderer.getPixelRatio() < 1.5 && window.devicePixelRatio >= 1.5 ? 2 : 3);
}
function meadowFrame(dt: number) {
  wind.update(dt, params.sky.wind, stage.atmo.night, weather.wind);
  if (!meadow) return;
  meadow.group.visible = params.sky.meadow;
  if (!params.sky.meadow) return;
  tel.phase('meadow', true);
  const S = stage.sun, H = stage.hemi, L = meadowLight;
  L.sunDir.copy(S.position).sub(S.target.position).normalize();
  L.sunCol.copy(S.color).multiplyScalar(S.intensity);
  L.hemi.copy(H.color).multiplyScalar(H.intensity);
  L.night = stage.atmo.night; L.tintHue = params.sky.groundHue; L.tint = Math.min(1, params.sky.groundTint);
  // 11.7k tufts on Low, 26k on High; half when the adaptive pixel ratio has stepped down (overdraw relief).
  const low = params.sky.quality === 'Low';
  L.frac = low ? (stage.renderer.getPixelRatio() < 1.5 && window.devicePixelRatio >= 1.5 ? 0.22 : 0.45) : 1;
  meadow.frame(sim, L, elapsed);
}
/** Breakage (WP10): broken limbs and twigs. Shares the live bark and leaf material instances (PowerVR rule); ?breakage=0. */
const debris = new Debris(branches.mesh.material as THREE.Material, leaves);
stage.scene.add(debris.group);
let debrisSimT = 0;
/** Before `redraw`: a break on a paused tree still needs its structure pass. */
function breakagePre(_dt: number) {
  // The rule runs on real time (wind is real time), also on a paused tree; it does nothing while wind.base <= 0.6.
  if (diag.breakage && params.breakage.enabled) {
    tel.phase('wind load', true);
    sim.windLoad(_dt, wind, params.breakage.strength);
  }
  if (sim.breaks.length && (params.time.paused || params.time.speed <= 0)) sim.updateStructure(0);
}
/** After `redraw` (the branch mesh has dropped the limb, the leaf follow is done): hand the limb over to the debris. */
function breakagePost(dt: number) {
  if (sim.time < debrisSimT) debris.clear(); // tree was reset
  debrisSimT = sim.time;
  if (sim.breaks.length) {
    tel.phase('debris spawn');
    for (const ev of sim.breaks) {
      if (diag.leaves) debris.spawn(sim, ev, wind);
      tel.log('limb_break', { root: ev.root, nodes: ev.nodeIds.length, leaves: ev.leaves, r: +ev.radius.toFixed(3), t: +ev.time.toFixed(1), ms: +debris.stats.lastBuildMs.toFixed(1) });
    }
    sim.breaks.length = 0;
    // The live leaf set changed: restart the pass (an open one still holds the detached leaves).
    leavesDirty = true; leafRestart = true;
  }
  debris.barkShadow = branches.mesh.castShadow;
  debris.frame(dt, wind);
}
/** Falling leaves and litter (`leaffall.ts`): live leaf geometry + material instance (PowerVR rule); ?leaffall=0. */
const leafFall = diag.leaffall && diag.leaves ? new LeafFall(leaves) : null;
if (leafFall) {
  stage.scene.add(leafFall.group);
  debris.leafSink = (m, c, n) => leafFall.adopt(m, c, n, weather.violence);
}
let leafFallSimT = 0;
/** After `breakagePost` (twig leaves are handed over there). */
function leafFallFrame(dt: number) {
  if (!leafFall) return;
  if (sim.time < leafFallSimT) leafFall.clear(); // tree was reset
  leafFallSimT = sim.time;
  leafFall.group.visible = params.leaffall.enabled;
  if (!params.leaffall.enabled) return;
  tel.phase('leaf fall', true);
  const low = params.sky.quality === 'Low', n = stage.atmo.night;
  // Autumn drop: leaves `Leaves.follow` saw pass their fall date this frame fly on through the one falling-leaf system.
  const dq = leaves.drops;
  if (dq.n > 0) {
    const free = Math.max(0, (leafFall.stats.airCap || 0) - leafFall.counts.air);
    leafFall.adopt(dq.m, dq.c, Math.min(dq.n, free), weather.violence);
    dq.n = 0;
  }
  {
    // Share of the falling crown leaves that get a flying copy, so the air count peaks near its cap at the height of
    // the drop instead of sitting on it all autumn (the rest just leave the crown); gusts and storms bring more at once.
    const g = wind.base > 1e-3 ? wind.gust((sim.bboxMin[0] + sim.bboxMax[0]) / 2, (sim.bboxMin[2] + sim.bboxMax[2]) / 2) / wind.base : 0;
    leaves.dropChance = season.active ? Math.min(1, ((leafFall.stats.airCap || 110) / 1600) * params.leaffall.rate * (0.35 + 1.3 * g * g * g + 3 * weather.violence)) : 0;
  }
  leafFall.frame(dt, wind, {
    keep: season.litterKeep,
    violence: weather.violence, dusk: 4 * n * (1 - n), simLeaves: sim.leaves.length, min: sim.bboxMin, max: sim.bboxMax, low,
    scale: low && stage.renderer.getPixelRatio() < 1.5 && window.devicePixelRatio >= 1.5 ? 0.5 : 1,
    rate: params.leaffall.rate, litter: params.leaffall.litter,
  });
}
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
  invalidate();
}

/** Leaf work per frame while a pass is open (ms); the pass is uploaded when its last slice ends. */
const LEAF_BUDGET_MS = 3;
/** Leaf follow work per branch rebuild (ms): a whole sweep when it fits, else round-robin chunks. */
const LEAF_FOLLOW_MS = 2.5;
let branchAge = Infinity, branchTime = -1, branchTopo = -1, branchPV = -1;
let leavesDirty = true;
let leafPhase = -1;
let leafRestart = false;
let leafBakeD = 1, leafBakeT = -1e9, leafSimTime = -1, leafLightV = -1, leafSunKey = NaN, leafPV = -1, leafQuality = '';
const leafBakeDir = new THREE.Vector3(), camDirTmp = new THREE.Vector3();
let seenTopo = -1, topoChangedAt = 0;
let structPV = -1, paramsSig = NaN;
let rebuilds = 0;
let swayLeafMs = 0;
/** Wind sway (render-side offsets from the rest pose; ?sway=0). */
const sway = new Sway();
/** Tree was reset: rebuild everything on the next frame, drop an open leaf pass, re-run the paused structure pass. */
function invalidate() {
  branchTime = -1; leavesDirty = true; structPV = -1;
  leaves?.abortPass();
}
/**
 * Scheduling. Branch tubes: rebuilt every frame on High and every second frame on Low, only when sim time, topology or
 * params moved (a paused tree does nothing). Leaves: their own slower cadence, only when an input changed (see below),
 * run as a pass of at most LEAF_BUDGET_MS per frame. `force` rebuilds both now and completes the leaf pass.
 */
function redraw(time: number, dt: number, force = false) {
  branchAge += dt;
  let branchMoved = false;
  const pv = paramsVersion();
  const low = params.sky.quality === 'Low';
  if (sim.topology !== seenTopo) { seenTopo = sim.topology; topoChangedAt = time; }
  const branchDue = diag.rebuildHz > 0 ? branchAge >= 1 / diag.rebuildHz : !low || (frameCount & 1) === 0;
  // Wind sway: new offsets whenever the branch mesh may rebuild; a moving (or just settled) pose forces the rebuild.
  let swayMoved = false;
  if (force || branchDue) { tel.phase('sway', true); swayMoved = sway.update(sim, wind, diag.sway ? params.sway.amount : 0); }
  // The tree itself changed (rest pose): full rebuild. Wind pose on top, both qualities: the cheap per-ring translation
  // (`applyOffsets`: positions only, no frames/normals/uvs/index); a full rebuild per frame cost +8 ms JS on desktop High
  // and +13 ms at 4x throttle on the phone path.
  const treeMoved = sim.time !== branchTime || sim.topology !== branchTopo || pv !== branchPV;
  if (!force && branchDue && swayMoved && !treeMoved && branches.applyOffsets(sway.D)) {
    branchMoved = true;
  } else if (force || (branchDue && (swayMoved || treeMoved))) {
    tel.phase('geometry rebuild');
    branches.update(sim, params.thickness.rootFlare);
    if (sway.live) branches.applyOffsets(sway.D);
    rebuilds++;
    branchAge = 0; branchTime = sim.time; branchTopo = sim.topology; branchPV = pv;
    branchMoved = true;
  }
  if (!diag.leaves) return;
  leaves.tick(time);
  // Leaf form (`params.leaves.form`: picker, preset load, ?form=): new pixels in the live leaf map, the card stretch
  // re-placed at once, colours (they divide by the map mean) by a restarted pass. Data only, see `Leaves.setForm`.
  let formPlaced = false;
  if (params.leaves.form !== leaves.formId) {
    params.leaves.form = leafForm(params.leaves.form).id;
    if (params.leaves.form !== leaves.formId) {
      tel.phase('leaf form');
      leaves.setForm(makeLeafTexture(params.leaves.form));
      formPlaced = leaves.follow(sim, params, stage.camera.position, Infinity, 0);
      leavesDirty = true; leafRestart = true;
    }
  }
  // Seasons: leaf colours and the instance set follow the year phase (a pass per 0.004 of the year, or at once after
  // a jump: scrub, hold, on/off), sizes are re-placed by `follow` (at once after a jump).
  if (season.jumped) {
    formPlaced = leaves.follow(sim, params, stage.camera.position, Infinity, 0) || formPlaced;
    leavesDirty = true; leafPhase = season.phase;
  } else if (season.active && Math.abs(season.phase - leafPhase) > 0.004) { leavesDirty = true; leafPhase = season.phase; }
  const S = stage.sun, H = stage.hemi;
  sunDirTmp.copy(S.position).sub(S.target.position).normalize();
  // Leaf pass inputs. Growth: every 0.12 s (diag rebuildHz overrides), 1 s once topology is stable for 5 s. Light grid,
  // sun direction (2 decimals, as the transmittance cache keys it), params and quality: at once. Camera (≤ 1/s):
  // distance changed > 25% (size LOD), or on the safe path the view direction turned > 12° (its bake is view-dependent).
  const sunKey = Math.round(sunDirTmp.x * 100) * 1e6 + Math.round(sunDirTmp.y * 100) * 1e3 + Math.round(sunDirTmp.z * 100);
  const camD = stage.camera.position.distanceTo(stage.controls.target);
  const since = time - leafBakeT;
  if (!leavesDirty) {
    const period = diag.rebuildHz > 0 ? 1 / diag.rebuildHz : time - topoChangedAt > 5 ? 0.4 : 0.12;
    if (sim.time !== leafSimTime && since >= period) leavesDirty = true;
    else if (sim.lightVersion !== leafLightV || sunKey !== leafSunKey || pv !== leafPV || params.sky.quality !== leafQuality) leavesDirty = true;
    else if (since > 1) {
      if (Math.abs(camD / leafBakeD - 1) > 0.25) leavesDirty = true;
      else if (leaves.variant && camDirTmp.copy(stage.camera.position).sub(stage.controls.target).normalize().dot(leafBakeDir) < 0.978) leavesDirty = true;
    }
  }
  if (force) leavesDirty = true;
  if (leavesDirty && (force || leafRestart || !leaves.passOpen)) {
    leavesDirty = false; leafRestart = false;
    leafBakeD = camD; leafBakeT = time; leafSimTime = sim.time; leafLightV = sim.lightVersion; leafSunKey = sunKey; leafPV = pv; leafQuality = params.sky.quality;
    leafBakeDir.copy(stage.camera.position).sub(stage.controls.target).normalize();
    tel.phase('leaves rebuild');
    leaves.setLighting(stage.camera.position, sunDirTmp, sunLin.copy(S.color).multiplyScalar(S.intensity),
      hemiSky.copy(H.color).multiplyScalar(H.intensity), hemiGround.copy(H.groundColor).multiplyScalar(H.intensity));
    leaves.maxInstances = low ? 32000 : 0;
    const decal = !leaves.mesh.castShadow && S.castShadow;
    branches.mesh.castShadow = !decal;
    if (decal) {
      tel.phase('canopy shadow');
      canopy.update(sim, sunDirTmp, Math.min(1, S.intensity * 6) * Math.min(1, 0.4 + S.intensity / 2.5) * (0.3 + 0.25 * Math.min(1, Math.max(0, (sunDirTmp.y - 0.1) / 0.6))), time, params.time.paused || params.time.speed <= 0 ? 0.5 : 2);
      tel.phase('leaves rebuild');
    } else canopy.mesh.visible = false;
    const repl = leaves.beginPass(sim, time);
    if (repl) {
      tel.log('leaves_realloc', { capacity: repl.instanceMatrix.count, leaves: sim.leaves.length });
      stage.scene.children.filter((o) => o instanceof THREE.InstancedMesh).forEach((o) => stage.scene.remove(o));
      stage.scene.add(repl);
    }
  }
  // Low: the pass slice and the branch rebuild + leaf follow take alternate frames.
  let placed = false;
  if (leaves.passOpen && (force || leaves.passes === 0 || !low || !branchMoved)) {
    tel.phase('leaves rebuild', true);
    placed = leaves.stepPass(sim, params, force || leaves.passes === 0 ? Infinity : LEAF_BUDGET_MS, stage.camera.position);
  }
  // Leaves ride their branches: whenever the branch mesh was rebuilt, every drawn leaf is re-placed on its node.
  if (branchMoved && !placed) {
    tel.phase('leaves follow', true);
    leaves.follow(sim, params, stage.camera.position, LEAF_FOLLOW_MS);
  }
  // Sway rides on top: follow / the pass write rest translations, this adds the twig offsets (wood and leaves of one frame agree).
  if (swayMoved || (sway.live && (branchMoved || placed || formPlaced))) {
    tel.phase('leaves sway', true);
    const t0 = performance.now();
    leaves.sway(sway.D, sway.P);
    swayLeafMs = performance.now() - t0;
  }
}

if (query.get('nogui') !== '1') {
  const qp = query.get('panel');
  buildPanel(params, automation, {
    // A new tree (regrow, new seed, preset) returns to the automatic camera: the old view no longer fits.
    regrow: () => { regrow(); stage.autoCamera(); },
    newSeed: () => {
      params.seed.seed = Math.floor(Math.random() * 999999);
      regrow();
      stage.autoCamera();
    },
    cameraManual: () => stage.manual,
    autoCamera: () => stage.autoCamera(),
    crownChanged: () => sim.rebuildAttractors(),
    preset: (name) => { loadPreset(name); regrow(); stage.autoCamera(); },
    presetNames: Object.keys(PRESETS),
    currentPreset: () => presetName,
    simTime: () => sim.time,
    stormNow: () => { if (params.weather.event === 'calm') automation.userSet('weather.event', 'auto'); weather.trigger(); },
    weatherPhase: () => weather.phase,
    // Fully grown: the node budget is used up, or no tip is alive any more (crown space is filled).
    growth: () => ({ nodes: sim.nodes.length, age: sim.time, grown: sim.time > 1 && (sim.nodes.length >= params.growth.maxNodes || !sim.chains.some((c) => c.alive)) }),
  }, { open: qp === 'open' ? true : qp === 'closed' ? false : undefined, tab: query.get('tab') ?? undefined });
}
// Only a real orbit/zoom takes the camera (`stage.manual`; it stays the user's until they ask for the automatic camera): a tap (e.g. to collapse the GUI) used to freeze the camera at the
// sapling distance, and the crown then grew around it.
{
  const el = stage.renderer.domElement;
  let down: { x: number; y: number } | null = null;
  el.addEventListener('pointerdown', (e) => (down = { x: e.clientX, y: e.clientY }));
  el.addEventListener('pointerup', () => (down = null));
  el.addEventListener('pointercancel', () => (down = null));
  el.addEventListener('pointermove', (e) => {
    if (down && Math.hypot(e.clientX - down.x, e.clientY - down.y) > 8) stage.takeControl();
  });
  el.addEventListener('wheel', () => stage.takeControl(), { passive: true });
}

// Watch mode: H hides all UI; a small age/time overlay fades in on activity and out when idle.
const overlay = document.getElementById('overlay')!;
let uiHidden = query.get('hideui') === '1';
let activity = 0;
const applyUi = () => document.body.classList.toggle('watch', uiHidden);
applyUi();
/** Keys H/C/D stay live on sliders, switches and buttons; only real text entry swallows them. */
function typing(el: HTMLElement | null) {
  if (!el) return false;
  if (el.tagName === 'TEXTAREA' || el.tagName === 'SELECT' || el.isContentEditable) return true;
  return el.tagName === 'INPUT' && !['range', 'checkbox', 'color', 'button'].includes((el as HTMLInputElement).type);
}
// Capture phase: lil-gui stops keydown propagation on its controllers, so H/C would die after any GUI click.
addEventListener('keydown', (e) => {
  const el = e.target as HTMLElement | null;
  if (typing(el)) return;
  if (e.ctrlKey || e.metaKey || e.altKey) return;
  if (e.key === 'h' || e.key === 'H') { uiHidden = !uiHidden; applyUi(); activity = 0; }
  // C: back to the automatic camera from a hand-set view, else toggle the cinema camera.
  if (e.key === 'c' || e.key === 'C') { if (stage.manual) { params.camera.cinema = true; stage.autoCamera(); } else params.camera.cinema = !params.camera.cinema; }
}, true);
addEventListener('pointermove', () => (activity = 0));
// Debug HUD line: hidden by default, ?hud=1 or D shows it.
let hudOn = query.get('hud') === '1';
const applyHud = () => document.body.classList.toggle('hud', hudOn);
applyHud();
addEventListener('keydown', (e) => {
  if (e.ctrlKey || e.metaKey || e.altKey || typing(e.target as HTMLElement | null)) return;
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
  // Safety net for writers that bypass Automation (scripts, new code): any tree/leaf param change bumps the version.
  const sig = paramsSignature(params);
  if (sig !== paramsSig) { paramsSig = sig; bumpParams(); }
  if (!params.time.paused && params.time.speed > 0) advance(dt * params.time.speed);
  else if (paramsVersion() !== structPV) sim.updateStructure(0); // paused: only after a params edit
  structPV = paramsVersion();
  season.update(sim.time, params.season);
  weatherFrame(dt);
  tel.phase('stage frame', true);
  stage.frame(sim, params, dt);
  breakagePre(dt);
  redraw(elapsed, dt);
  meadowFrame(dt);
  breakagePost(dt);
  leafFallFrame(dt);
  activity += dt;
  overlay.style.opacity = String(Math.max(0, Math.min(1, 1 - (activity - 4) / 2)) * 0.85);
  const lp = params.leaves;
  glow.setHSL(lp.glowHue, 0.9, 0.55).multiplyScalar(lp.glow * (0.12 + 0.88 * stage.atmo.night));
  leaves.setGlow(glow, 1 - stage.atmo.night);
  leaves.setSun(stage.atmo.keyDir, stage.atmo.keyColor, stage.atmo.keyIntensity, stage.camera.matrixWorldInverse);
  // Without the High grade/bloom the bark reads pale grey: warm it on Low.
  (branches.mesh.material as THREE.MeshStandardMaterial).color.setHex(params.sky.quality === 'High' ? 0xffffff : 0xb08a6a);
  weatherRender(dt);
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
    overlay.textContent = `${presetName} · ${params.season.on ? `${season.name}, year ${season.year}` : `age ${sim.time.toFixed(0)} s`} · ${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
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
    leafInst: leaves.mesh.count, leafCap: leaves.mesh.instanceMatrix.count, rebuilds, leafPasses: leaves.passes, leafPassMs: +leaves.passMs.toFixed(1), leafFollows: leaves.follows, leafFollowMs: +leaves.followMs.toFixed(2), leafFollowMaxMs: +leaves.followMaxMs.toFixed(2), bakes: stage.atmo.bakes, frameErrors, contextLost: stage.contextLost, quality: params.sky.quality,
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
  loadPreset: (n: string) => { loadPreset(n); regrow(); stage.autoCamera(); },
  sim,
  leaves,
  canopy,
  meadow,
  wind,
  weather,
  rain,
  sky: celestial,
  debris,
  sway,
  swayStats: () => ({ live: sway.live, maxOffset: sway.maxOffset, maxNode: sway.maxNode, nodeMs: sway.lastMs, leafMs: swayLeafMs }),
  leafFall,
  season,
  stage,
  frameErrors: () => frameErrors,
  fastForward(seconds: number) {
    advance(seconds);
    // Juvenile shoots shed during a skip are long gone: do not spawn their leaves now.
    if (seconds > 1) sim.breaks = sim.breaks.filter((e) => !e.shed);
    sim.updateStructure(0);
    stage.frame(sim, params, 0, true);
    redraw(elapsed, 0, true);
    meadowFrame(0);
    meadow?.bakeAll(sim);
    stage.render(params);
    return { nodes: sim.nodes.length, leaves: sim.leaves.length, time: sim.time, height: +sim.bboxMax[1].toFixed(2), width: +Math.max(sim.bboxMax[0] - sim.bboxMin[0], sim.bboxMax[2] - sim.bboxMin[2]).toFixed(2) };
  },
};

/** Breakage dev hooks (WP10): `__arbor.breakLimb(id?)` snaps the given node's limb or a random order-1 limb, `breakTwig()` a small twig. */
{
  const pick = (twig: boolean, big = false): number => {
    const cand: number[] = [];
    let best = -1, bestLen = 0;
    for (const ch of sim.chains) {
      if (ch.pruned || ch.nodes.length < 4) continue;
      const base = sim.nodes[ch.nodes[1]];
      if (twig ? ch.order >= 2 && ch.nodes.length <= 10 && base.subLen < 3 : ch.order === 1 && base.subLen > 4) {
        cand.push(ch.nodes[1]);
        if (base.subLen > bestLen) { bestLen = base.subLen; best = ch.nodes[1]; }
      }
    }
    return big ? best : cand.length ? cand[Math.floor(Math.random() * cand.length)] : -1;
  };
  Object.assign((window as unknown as { __arbor: object }).__arbor, {
    /** Break at a node id, the biggest order-1 limb ('big') or a random order-1 limb (no argument). Returns the event. */
    breakLimb: (id?: number | 'big') => sim.breakAt(typeof id === 'number' ? id : pick(false, id === 'big')),
    breakTwig: () => sim.breakAt(pick(true)),
    /** Calibration: load ratios u at a fixed gust (default 1) as a sorted array, with percentiles. */
    loadRatios: (gust = 1, sigma = params.breakage.strength) => {
      const u: number[] = [], big: { id: number; u: number; len: number }[] = [];
      sim.loadRatios(wind, sigma, (id, v, len) => { u.push(v); big.push({ id, u: +v.toFixed(3), len: +len.toFixed(1) }); }, gust);
      u.sort((a, b) => a - b);
      const q = (p: number) => +(u[Math.min(u.length - 1, Math.floor(p * u.length))] ?? 0).toFixed(4);
      return { n: u.length, p50: q(0.5), p90: q(0.9), p95: q(0.95), p97: q(0.97), p98: q(0.98), p99: q(0.99), max: q(1), top: big.sort((a, b) => b.u - a.u).slice(0, 8) };
    },
    /** Calibration: run the rule for `seconds` of synthetic wind time at `base` (no rendering); returns break counts. */
    stormTest: (seconds: number, base: number, sigma = params.breakage.strength) => {
      const keepT = wind.t, keepB = wind.base, tw0 = sim.loadStats.twigs, li0 = sim.loadStats.limbs;
      const ev: { t: number; nodes: number; leaves: number }[] = [];
      let maxU = 0;
      for (let t = 0; t < seconds; t += 0.25) {
        wind.t = keepT + t; wind.base = base;
        const e = sim.windLoad(0.25, wind, sigma);
        if (sim.loadStats.max > maxU) maxU = sim.loadStats.max;
        if (e) ev.push({ t, nodes: e.nodeIds.length, leaves: e.leaves });
      }
      wind.t = keepT; wind.base = keepB;
      return { twigs: sim.loadStats.twigs - tw0, limbs: sim.loadStats.limbs - li0, maxU: +maxU.toFixed(3), events: ev };
    },
  });
}

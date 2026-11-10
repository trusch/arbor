import * as THREE from 'three';
import { defaultParams, applyQueryOverrides } from './params';
import { TreeSim } from './sim/tree';
import { Stage } from './render/stage';
import { BranchMesh } from './render/branchMesh';
import { Leaves } from './render/leaves';
import { makeBarkTextures, makeLeafTexture } from './render/textures';
import { buildGui } from './ui';

const params = defaultParams();
applyQueryOverrides(params, location.search);
const query = new URLSearchParams(location.search);

const stage = new Stage(document.body);
const sim = new TreeSim(params);
const branches = new BranchMesh(makeBarkTextures());
const leaves = new Leaves(makeLeafTexture());
stage.scene.add(branches.mesh, leaves.mesh);

const MAX_STEP = 1 / 20;
function advance(simSeconds: number) {
  let left = simSeconds;
  while (left > 1e-6) {
    const d = Math.min(MAX_STEP, left);
    sim.step(d);
    left -= d;
  }
}

function redraw(time: number) {
  branches.update(sim);
  const repl = leaves.update(sim, params, time);
  if (repl) {
    stage.scene.children.filter((o) => o instanceof THREE.InstancedMesh).forEach((o) => stage.scene.remove(o));
    stage.scene.add(repl);
  }
}

if (query.get('nogui') !== '1') {
  buildGui(params, {
    regrow: () => sim.reset(),
    newSeed: () => {
      params.seed.seed = Math.floor(Math.random() * 999999);
      sim.reset();
    },
    crownChanged: () => sim.rebuildAttractors(),
  });
}
stage.controls.addEventListener('start', () => (params.camera.autoFrame = false));

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
  redraw(elapsed);
  stage.render(params);
  frames++;
  fpsT += dt;
  if (fpsT > 0.5) {
    fps = frames / fpsT;
    frames = 0;
    fpsT = 0;
    hud.textContent = `t ${sim.time.toFixed(1)}s  nodes ${sim.nodes.length}  leaves ${leaves.mesh.count}  free attractors ${sim.attractorCount}  ${fps.toFixed(0)} fps`;
  }
  requestAnimationFrame(loop);
}

const ff = Number(query.get('t') ?? 0);
if (ff > 0) advance(ff);
sim.updateStructure(0);
stage.frame(sim, params, 0, true);
requestAnimationFrame(loop);

/** Automation / test hook. */
(window as unknown as { __arbor: unknown }).__arbor = {
  params,
  sim,
  stage,
  fastForward(seconds: number) {
    advance(seconds);
    sim.updateStructure(0);
    stage.frame(sim, params, 0, true);
    redraw(elapsed);
    stage.render(params);
    return { nodes: sim.nodes.length, leaves: sim.leaves.length, time: sim.time };
  },
};

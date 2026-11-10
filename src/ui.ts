import GUI from 'lil-gui';
import type { ArborParams } from './params';
import { type Automation, numericPaths } from './automation';

export interface UiActions {
  regrow(): void;
  newSeed(): void;
  crownChanged(): void;
  preset(name: string): void;
  presetNames: string[];
  currentPreset(): string;
  simTime(): number;
}

export function buildGui(p: ArborParams, auto: Automation, a: UiActions): GUI {
  const gui = new GUI({ title: 'Arbor  (H hides UI, C cinema)' });
  const ps = { preset: a.currentPreset() };
  gui.add(ps, 'preset', a.presetNames).name('Preset (regrows)').onChange((n: string) => {
    a.preset(n);
    gui.controllersRecursive().forEach((c) => c.updateDisplay());
    refreshAuto();
  });

  // Automation: journey keyframes + per-param drift.
  const au = gui.addFolder('Automation');
  const js = { info: '', add: () => { auto.addKeyframe(a.simTime()); refreshAuto(); }, clear: () => { auto.clearJourney(); refreshAuto(); } };
  au.add(auto, 'journeyOn').name('journey on');
  au.add(js, 'add').name('Add keyframe (now)');
  au.add(js, 'clear').name('Clear journey');
  const infoC = au.add(js, 'info').name('keyframes').disable();
  const paths = numericPaths(p);
  const sel = { param: 'growth.gravity' };
  const dproxy = {
    get on() { return auto.drift[sel.param]?.on ?? false; },
    set on(v: boolean) { const d = auto.drift[sel.param]; auto.setDrift(sel.param, v, d?.rate ?? 0.03, d?.range ?? 0.3); refreshAuto(); },
    get rate() { return auto.drift[sel.param]?.rate ?? 0.03; },
    set rate(v: number) { const d = auto.drift[sel.param]; auto.setDrift(sel.param, d?.on ?? false, v, d?.range ?? 0.3); },
    get range() { return auto.drift[sel.param]?.range ?? 0.3; },
    set range(v: number) { const d = auto.drift[sel.param]; auto.setDrift(sel.param, d?.on ?? false, d?.rate ?? 0.03, v); },
    active: '',
  };
  const df = au.addFolder('Drift');
  df.add(sel, 'param', paths).onChange(() => df.controllers.forEach((c) => c.updateDisplay()));
  df.add(dproxy, 'on').name('drift this param');
  df.add(dproxy, 'rate', 0.002, 0.3, 0.001).name('rate (Hz, sim)');
  df.add(dproxy, 'range', 0, 1.5, 0.01).name('range (± rel.)');
  const actC = df.add(dproxy, 'active').name('drifting').disable();
  function refreshAuto() {
    js.info = auto.journey.map((k) => k.t.toFixed(0) + 's').join(', ') || 'none';
    infoC.updateDisplay();
    dproxy.active = Object.entries(auto.drift).filter(([, d]) => d.on).map(([k]) => k.split('.')[1]).join(', ') || 'none';
    actC.updateDisplay();
    df.controllers.forEach((c) => c.updateDisplay());
  }
  refreshAuto();

  const t = gui.addFolder('Time');
  t.add(p.time, 'speed', 0, 20, 0.05);
  t.add(p.time, 'paused');

  const g = gui.addFolder('Growth');
  g.add(p.growth, 'gravity', 0, 3, 0.01).listen();
  g.add(p.growth, 'phototropism', 0, 2, 0.01);
  g.add(p.growth, 'gravitropism', -1, 2, 0.01);
  g.add(p.growth, 'attraction', 0, 3, 0.01);
  g.add(p.growth, 'straightness', 0, 5, 0.01);
  g.add(p.growth, 'wander', 0, 2, 0.01);
  g.add(p.growth, 'maxTurn', 2, 90, 0.5);
  g.add(p.growth, 'scaffoldBranching', 0, 1.5, 0.01);
  g.add(p.growth, 'selfPrune', 0, 0.8, 0.01);
  g.add(p.growth, 'branchAngle', 5, 110, 0.5);
  g.add(p.growth, 'phyllotaxis', 0, 360, 0.5);
  g.add(p.growth, 'apicalDominance', 0, 1, 0.01);
  g.add(p.growth, 'branchingProbability', 0, 2, 0.01);
  g.add(p.growth, 'segmentLength', 0.05, 0.6, 0.01);
  g.add(p.growth, 'growthRate', 0.1, 5, 0.01);
  g.add(p.growth, 'vigorDecay', 0.4, 1, 0.01);
  g.add(p.growth, 'maxOrder', 1, 10, 1);
  g.add(p.growth, 'weeping', 0, 3, 0.01).listen();
  g.add(p.growth, 'torsion', -20, 20, 0.1).listen();
  g.add(p.growth, 'sag', 0, 5, 0.01);
  g.add(p.growth, 'maxNodes', 1000, 60000, 500);

  const c = gui.addFolder('Crown');
  c.add(p.crown, 'shape', 0, 2, 0.01).name('shape (ell/cone/vase)').onFinishChange(a.crownChanged);
  c.add(p.crown, 'radius', 0.5, 10, 0.1).onFinishChange(a.crownChanged);
  c.add(p.crown, 'height', 0.5, 15, 0.1).onFinishChange(a.crownChanged);
  c.add(p.crown, 'base', 0, 8, 0.1).onFinishChange(a.crownChanged);
  c.add(p.crown, 'bole', 0, 6, 0.05).name('clear bole (m)');
  c.add(p.crown, 'attractors', 200, 20000, 100).onFinishChange(a.crownChanged);

  const th = gui.addFolder('Thickness');
  th.add(p.thickness, 'exponent', 1.5, 3.5, 0.01);
  th.add(p.thickness, 'twigRadius', 0.003, 0.04, 0.001);
  th.add(p.thickness, 'thickeningRate', 0.05, 5, 0.01);
  th.add(p.thickness, 'rootFlare', 0, 3, 0.01);

  const l = gui.addFolder('Leaves');
  l.add(p.leaves, 'size', 0, 0.6, 0.005);
  l.add(p.leaves, 'density', 0, 4, 0.05);
  l.add(p.leaves, 'hue', 0, 1, 0.005).listen();
  l.add(p.leaves, 'saturation', 0, 1, 0.01);
  l.add(p.leaves, 'maxBranchRadius', 0.005, 0.2, 0.001);
  l.add(p.leaves, 'shape', -1, 1, 0.01).name('shape (fan/narrow)');
  l.add(p.leaves, 'lightness', 0.3, 2, 0.01);
  l.add(p.leaves, 'glow', 0, 3, 0.01).name('glow (biolum.)');
  l.add(p.leaves, 'glowHue', 0, 1, 0.005);

  const li = gui.addFolder('Growth light (phototropism)');
  li.add(p.light, 'azimuth', 0, 360, 1);
  li.add(p.light, 'elevation', 5, 89, 1);

  const sk = gui.addFolder('Sky & look');
  sk.add(p.sky, 'timeOfDay', 0, 24, 0.01).listen();
  sk.add(p.sky, 'cycle').name('day/night cycle');
  sk.add(p.sky, 'dayLength', 10, 1800, 1).name('day length (s)');
  sk.add(p.sky, 'latitude', 0, 75, 0.5);
  sk.add(p.sky, 'sunYaw', 0, 360, 1);
  sk.add(p.sky, 'exposure', 0.1, 3, 0.01);
  sk.add(p.sky, 'skyGain', 0.1, 3, 0.01);
  sk.add(p.sky, 'fog', 0, 5, 0.01);
  sk.add(p.sky, 'stars', 0, 2, 0.01);
  sk.add(p.sky, 'godRays', 0, 3, 0.01);
  sk.add(p.sky, 'skyHue', 0, 1, 0.005).name('sky hue shift');
  sk.add(p.sky, 'skySat', 0, 2, 0.01).name('sky saturation');
  sk.add(p.sky, 'sunHue', 0, 1, 0.005);
  sk.add(p.sky, 'sunTint', 0, 1, 0.01);
  sk.add(p.sky, 'sun2', 0, 2, 0.01).name('2nd star');
  sk.add(p.sky, 'sun2Hue', 0, 1, 0.005);
  sk.add(p.sky, 'sun2Yaw', 0, 360, 1);
  sk.add(p.sky, 'sunSize', 0, 4, 0.01);
  sk.add(p.sky, 'groundHue', 0, 1, 0.005);
  sk.add(p.sky, 'groundTint', 0, 1, 0.01);
  sk.add(p.sky, 'quality', ['High', 'Low']);

  const cam = gui.addFolder('Camera');
  cam.add(p.camera, 'autoFrame').listen();
  cam.add(p.camera, 'autoRotate');
  cam.add(p.camera, 'cinema').name('cinema (idle 10 s)').listen();

  const s = gui.addFolder('Seed');
  s.add(p.seed, 'seed', 0, 999999, 1).listen();
  s.add({ regrow: a.regrow }, 'regrow').name('Regrow');
  s.add({ seed: a.newSeed }, 'seed').name('New seed + regrow');
  return gui;
}

import GUI from 'lil-gui';
import type { ArborParams } from './params';

export interface UiActions {
  regrow(): void;
  newSeed(): void;
  crownChanged(): void;
}

export function buildGui(p: ArborParams, a: UiActions): GUI {
  const gui = new GUI({ title: 'Arbor' });
  const t = gui.addFolder('Time');
  t.add(p.time, 'speed', 0, 20, 0.05);
  t.add(p.time, 'paused');

  const g = gui.addFolder('Growth');
  g.add(p.growth, 'gravity', 0, 3, 0.01);
  g.add(p.growth, 'phototropism', 0, 2, 0.01);
  g.add(p.growth, 'gravitropism', -1, 2, 0.01);
  g.add(p.growth, 'attraction', 0, 3, 0.01);
  g.add(p.growth, 'straightness', 0, 5, 0.01);
  g.add(p.growth, 'wander', 0, 2, 0.01);
  g.add(p.growth, 'branchAngle', 5, 110, 0.5);
  g.add(p.growth, 'phyllotaxis', 0, 360, 0.5);
  g.add(p.growth, 'apicalDominance', 0, 1, 0.01);
  g.add(p.growth, 'branchingProbability', 0, 2, 0.01);
  g.add(p.growth, 'segmentLength', 0.05, 0.6, 0.01);
  g.add(p.growth, 'growthRate', 0.1, 5, 0.01);
  g.add(p.growth, 'vigorDecay', 0.4, 1, 0.01);
  g.add(p.growth, 'maxOrder', 1, 10, 1);
  g.add(p.growth, 'sag', 0, 5, 0.01);
  g.add(p.growth, 'maxNodes', 1000, 60000, 500);

  const c = gui.addFolder('Crown');
  c.add(p.crown, 'shape', 0, 2, 0.01).name('shape (ell/cone/vase)').onFinishChange(a.crownChanged);
  c.add(p.crown, 'radius', 0.5, 10, 0.1).onFinishChange(a.crownChanged);
  c.add(p.crown, 'height', 0.5, 15, 0.1).onFinishChange(a.crownChanged);
  c.add(p.crown, 'base', 0, 8, 0.1).onFinishChange(a.crownChanged);
  c.add(p.crown, 'attractors', 200, 20000, 100).onFinishChange(a.crownChanged);

  const th = gui.addFolder('Thickness');
  th.add(p.thickness, 'exponent', 1.5, 3.5, 0.01);
  th.add(p.thickness, 'twigRadius', 0.003, 0.04, 0.001);
  th.add(p.thickness, 'thickeningRate', 0.05, 5, 0.01);

  const l = gui.addFolder('Leaves');
  l.add(p.leaves, 'size', 0, 0.6, 0.005);
  l.add(p.leaves, 'density', 0, 4, 0.05);
  l.add(p.leaves, 'hue', 0, 1, 0.005);
  l.add(p.leaves, 'saturation', 0, 1, 0.01);
  l.add(p.leaves, 'maxBranchRadius', 0.005, 0.2, 0.001);

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
  sk.add(p.sky, 'quality', ['High', 'Low']);

  const cam = gui.addFolder('Camera');
  cam.add(p.camera, 'autoFrame').listen();
  cam.add(p.camera, 'autoRotate');

  const s = gui.addFolder('Seed');
  s.add(p.seed, 'seed', 0, 999999, 1).listen();
  s.add({ regrow: a.regrow }, 'regrow').name('Regrow');
  s.add({ seed: a.newSeed }, 'seed').name('New seed + regrow');
  return gui;
}

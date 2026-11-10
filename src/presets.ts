import { defaultParams, type ArborParams } from './params';
import type { Snapshot } from './automation';

type Partial2<T> = { [G in keyof T]?: Partial<T[G]> };

export interface Preset {
  /** Overrides on top of defaultParams(). */
  params: Partial2<ArborParams>;
  /** Optional journey: keyframes at sim seconds with partial snapshots ("group.field" keys). */
  journey?: { t: number; values: Snapshot }[];
}

export const PRESETS: Record<string, Preset> = {
  'Oak meadow': { params: {} },
  'Windswept cypress': {
    params: {
      growth: { branchAngle: 22, gravitropism: 0.9, apicalDominance: 0.8, scaffoldBranching: 0.9, vigorDecay: 0.72, straightness: 2.2, wander: 0.2, maxTurn: 9, phototropism: 0.1 },
      crown: { shape: 1, radius: 1.5, height: 10, base: 0.9, bole: 0.5 },
      leaves: { size: 0.17, density: 3.4, hue: 0.33, saturation: 0.38, shape: 0.85, lightness: 0.8 },
      light: { azimuth: 80, elevation: 40 },
      sky: { timeOfDay: 17.2, latitude: 40 },
    },
  },
  'Weeping willow': {
    params: {
      growth: { weeping: 1.6, branchAngle: 48, gravitropism: 0.25, straightness: 1.3, maxTurn: 16, sag: 2.2, vigorDecay: 0.86, wander: 0.25 },
      crown: { shape: 2, radius: 4.6, height: 6, base: 2.2, bole: 1.8 },
      leaves: { size: 0.22, density: 3.2, hue: 0.22, saturation: 0.5, shape: 0.9, lightness: 1.15 },
      sky: { timeOfDay: 9.0 },
    },
  },
  'Low-gravity alien': {
    params: {
      growth: { gravity: 0.2, torsion: 7, gravitropism: 0.6, wander: 0.9, maxTurn: 18, straightness: 1.2, branchAngle: 64, vigorDecay: 0.9, segmentLength: 0.3, sag: 0.4, scaffoldBranching: 0.7, selfPrune: 0.12 },
      crown: { shape: 2, radius: 5.5, height: 11, base: 3.5, bole: 2.5, attractors: 3000 },
      thickness: { exponent: 2.6, twigRadius: 0.006, rootFlare: 2.4 },
      leaves: { size: 0.55, density: 1.2, hue: 0.47, saturation: 0.55, shape: -0.6, lightness: 1.2, glow: 0.15, glowHue: 0.48 },
      sky: { timeOfDay: 16.5, skyHue: 0.82, skySat: 1.3, sunHue: 0.6, sunTint: 0.45, sun2: 0.5, sun2Hue: 0.95, sun2Yaw: 110, sunSize: 1.8, groundHue: 0.75, groundTint: 0.55 },
    },
  },
  'Crimson world': {
    params: {
      growth: { gravity: 0.7, torsion: -4, branchAngle: 70, gravitropism: 0.15, wander: 0.55, maxTurn: 20, straightness: 1.1, vigorDecay: 0.86, scaffoldBranching: 1.0, phototropism: 0.6 },
      crown: { shape: 2, radius: 6, height: 5.5, base: 2.8, bole: 2.2 },
      thickness: { exponent: 2.2, rootFlare: 2.2 },
      leaves: { size: 0.34, density: 2.4, hue: 0.96, saturation: 0.75, shape: -0.3, lightness: 1.0 },
      sky: { timeOfDay: 17.8, skyHue: 0.42, skySat: 1.25, sunHue: 0.02, sunTint: 0.6, sun2: 0.8, sun2Hue: 0.5, sun2Yaw: 200, sunSize: 2.4, groundHue: 0.88, groundTint: 0.6 },
    },
  },
  'Bioluminescent night': {
    params: {
      growth: { gravity: 0.6, torsion: 3, branchAngle: 55, weeping: 0.7, wander: 0.5, maxTurn: 16, vigorDecay: 0.86 },
      crown: { shape: 0.4, radius: 4.5, height: 7, base: 2.6, bole: 2 },
      leaves: { size: 0.3, density: 2.4, hue: 0.52, saturation: 0.6, shape: 0.4, lightness: 0.8, glow: 1.6, glowHue: 0.5 },
      sky: { timeOfDay: 23.3, stars: 1.8, skyHue: 0.05, groundHue: 0.6, groundTint: 0.5 },
    },
  },
  'Heavy world': {
    params: {
      growth: { gravity: 3, gravitropism: 0.3, branchAngle: 75, sag: 0.45, straightness: 1.4, maxTurn: 12, vigorDecay: 0.85, scaffoldBranching: 1.1, segmentLength: 0.18 },
      crown: { shape: 2, radius: 6.5, height: 3.2, base: 1.0, bole: 0.8 },
      thickness: { exponent: 1.6, twigRadius: 0.011, rootFlare: 3 },
      leaves: { size: 0.3, density: 2.8, hue: 0.2, saturation: 0.55, shape: -0.4, lightness: 0.85 },
      sky: { timeOfDay: 15, skyHue: 0.1, skySat: 0.7, sunHue: 0.1, sunTint: 0.35, fog: 2.2, groundHue: 0.15, groundTint: 0.3 },
    },
  },
  'Journey: Earth → alien': {
    params: { sky: { timeOfDay: 16.8 } },
    journey: [
      { t: 0, values: { 'growth.gravity': 1, 'growth.torsion': 0, 'growth.wander': 0.3, 'leaves.hue': 0.29, 'leaves.size': 0.26, 'leaves.shape': 0, 'leaves.saturation': 0.42, 'sky.skyHue': 0, 'sky.sunTint': 0, 'sky.sun2': 0, 'sky.groundTint': 0, 'sky.groundHue': 0.85, 'growth.branchAngle': 42 } },
      { t: 25, values: { 'growth.gravity': 1, 'growth.torsion': 0, 'growth.wander': 0.3, 'leaves.hue': 0.29, 'leaves.size': 0.26, 'leaves.shape': 0, 'leaves.saturation': 0.42, 'sky.skyHue': 0, 'sky.sunTint': 0, 'sky.sun2': 0, 'sky.groundTint': 0, 'sky.groundHue': 0.85, 'growth.branchAngle': 42 } },
      { t: 75, values: { 'growth.gravity': 0.2, 'growth.torsion': 8, 'growth.wander': 0.9, 'leaves.hue': 0.86, 'leaves.size': 0.45, 'leaves.shape': -0.5, 'leaves.saturation': 0.7, 'sky.skyHue': 0.45, 'sky.sunTint': 0.5, 'sky.sun2': 0.6, 'sky.groundTint': 0.5, 'sky.groundHue': 0.85, 'growth.branchAngle': 65 } },
    ],
  },
};

export function presetParams(name: string): ArborParams {
  const p = defaultParams();
  const pr = PRESETS[name] ?? PRESETS['Oak meadow'];
  const groups = p as unknown as Record<string, Record<string, unknown>>;
  for (const [g, vals] of Object.entries(pr.params)) Object.assign(groups[g], vals);
  return p;
}

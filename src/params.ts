/**
 * Single typed parameter object. Every field is read live by the simulation
 * and renderer each frame, so it can be driven by UI or by automation.
 */
export interface ArborParams {
  time: {
    /** Simulation seconds per real second. */
    speed: number;
    paused: boolean;
  };
  growth: {
    /** Gravity in g (1 = earth). Scales gravitropism and branch sag. */
    gravity: number;
    /** Pull of growing tips toward the sun direction. */
    phototropism: number;
    /** Negative gravitropism: upward tendency, scaled by gravity. */
    gravitropism: number;
    /** Pull toward unoccupied crown space (space colonization). */
    attraction: number;
    /** Tendency to keep the current direction. */
    straightness: number;
    /** Correlated low-frequency wander (slowly drifting per-branch bias). */
    wander: number;
    /** Max direction change per segment, degrees (kills curling). */
    maxTurn: number;
    /** Bud break multiplier for buds on the trunk (fewer, bigger scaffold limbs). */
    scaffoldBranching: number;
    /** Light level (0..1) below which shaded side twigs self-prune; 0 disables. */
    selfPrune: number;
    /** Lateral bud angle from the parent axis, degrees. */
    branchAngle: number;
    /** Phyllotaxis rotation between successive buds, degrees. */
    phyllotaxis: number;
    /** 0..1: lateral buds near an active tip are suppressed. */
    apicalDominance: number;
    /** Bud break probability per second (unsuppressed). */
    branchingProbability: number;
    /** Segment length in metres. */
    segmentLength: number;
    /** Segments per second for the leader at vigor 1. */
    growthRate: number;
    /** Vigor multiplier per branch order. */
    vigorDecay: number;
    maxOrder: number;
    /** Twig (order >= 2) downward tropism ∝ gravity: weeping/pendulous habit. */
    weeping: number;
    /** Spiral twist of the growth direction about vertical per segment, degrees (alternates sign per order). */
    torsion: number;
    /** Branch sag stiffness multiplier. */
    sag: number;
    maxNodes: number;
  };
  crown: {
    /** 0 ellipsoid, 1 cone, 2 vase/umbrella (continuous blend). */
    shape: number;
    radius: number;
    height: number;
    /** Height of crown base above ground. */
    base: number;
    /** Clear bole: no trunk buds break below this height (m). */
    bole: number;
    attractors: number;
  };
  thickness: {
    /** Pipe model exponent n: r^n = sum(child r^n). */
    exponent: number;
    twigRadius: number;
    /** Approach rate of radii toward the pipe-model target (1/s). */
    thickeningRate: number;
    /** Root flare / buttress strength at the trunk base. */
    rootFlare: number;
  };
  leaves: {
    size: number;
    /** Leaves per node, 0..4. */
    density: number;
    hue: number;
    saturation: number;
    /** Leaves drop from branches thicker than this (m). */
    maxBranchRadius: number;
    /** Blade shape: 0 round/broad, 1 long narrow (willow/needle), <0 fan/wide. */
    shape: number;
    /** Lightness multiplier. */
    lightness: number;
    /** Emissive glow strength (bioluminescence), scaled up at night. */
    glow: number;
    /** Glow hue 0..1. */
    glowHue: number;
  };
  light: {
    azimuth: number;
    elevation: number;
  };
  /** Day/night cycle, atmosphere and render quality. */
  sky: {
    /** Hour of day 0..24. */
    timeOfDay: number;
    /** Advance timeOfDay automatically. */
    cycle: boolean;
    /** Real seconds per full day. */
    dayLength: number;
    /** Latitude in degrees; sets the height of the sun arc. */
    latitude: number;
    /** Rotates the sun arc around the vertical axis, degrees. */
    sunYaw: number;
    exposure: number;
    skyGain: number;
    /** Wind strength 0..1 (single wind source `src/wind.ts`; halves at night). */
    wind: number;
    /** Grass tufts and wildflowers around the tree. */
    meadow: boolean;
    /** Fog / aerial perspective density multiplier. */
    fog: number;
    stars: number;
    godRays: number;
    /** Sky/fog tint hue 0..1 (alien skies). */
    skyHue: number;
    /** Sky/fog tint amount 0..1. */
    skyTint: number;
    /** Key light hue tint 0..1 and amount 0..1 (alien star colour). */
    sunHue: number;
    sunTint: number;
    /** Second (companion) star: fill light intensity, hue, and yaw offset in degrees. */
    sun2: number;
    sun2Hue: number;
    sun2Yaw: number;
    /** Sun disc sprite size multiplier. */
    sunSize: number;
    /** Ground grass tint hue 0..1 and amount. */
    groundHue: number;
    groundTint: number;
    quality: 'High' | 'Low';
  };
  /** Wind motion of limbs and leaves (`src/render/sway.ts`). Own group so it merges cleanly. */
  sway: {
    /** Motion amount: 0 = rigid tree, 1 = default. */
    amount: number;
  };
  /** Wind breakage (WP10). Own group so it merges cleanly next to `weather`. */
  breakage: {
    /** Limbs and twigs can snap in storm-strength wind. */
    enabled: boolean;
    /** Wood strength sigma in `S = sigma * r^3`; calibrated at the 99th percentile of the load ratio (see CLAUDE.md "Breakage"). */
    strength: number;
  };
  camera: {
    autoFrame: boolean;
    autoRotate: boolean;
    /** Cinematic orbit/dolly; pauses on user input, resumes after idle. */
    cinema: boolean;
  };
  seed: {
    seed: number;
  };
  /** Falling leaves and litter (`src/render/leaffall.ts`). Own group; read live. */
  leaffall: {
    enabled: boolean;
    /** Multiplier on how often leaves let go (calm and storm). */
    rate: number;
    /** Multiplier on the litter cap (0 = landed leaves vanish). */
    litter: number;
  };
  /** Weather (`src/weather.ts`): 'auto' = storms on a slow random schedule, 'calm' = never, 'storm' = held storm. */
  weather: {
    event: 'auto' | 'calm' | 'storm';
    /** Lightning flashes and bolts (off = none at all: photosensitivity). */
    lightning: boolean;
  };
}

export function defaultParams(): ArborParams {
  return {
    time: { speed: 1, paused: false },
    growth: {
      gravity: 1,
      phototropism: 0.25,
      gravitropism: 0.35,
      attraction: 1.0,
      straightness: 1.6,
      wander: 0.3,
      maxTurn: 13,
      scaffoldBranching: 0.4,
      selfPrune: 0.22,
      branchAngle: 42,
      phyllotaxis: 137.5,
      apicalDominance: 0.5,
      branchingProbability: 0.22,
      segmentLength: 0.22,
      growthRate: 1.6,
      vigorDecay: 0.82,
      maxOrder: 6,
      weeping: 0,
      torsion: 0,
      sag: 1,
      maxNodes: 14000,
    },
    crown: { shape: 0, radius: 3.6, height: 6.5, base: 2.4, bole: 1.7, attractors: 4000 },
    thickness: { exponent: 1.9, twigRadius: 0.0075, thickeningRate: 0.6, rootFlare: 1.4 },
    leaves: { size: 0.145, density: 3.4, hue: 0.27, saturation: 0.55, maxBranchRadius: 0.03, shape: 0, lightness: 1, glow: 0, glowHue: 0.5 },
    light: { azimuth: 35, elevation: 50 },
    sky: { timeOfDay: 17.6, cycle: false, dayLength: 240, latitude: 48, sunYaw: 311, exposure: 0.9, skyGain: 1, wind: 0.35, meadow: true, fog: 1, stars: 1, godRays: 1, skyHue: 0.6, skyTint: 0, sunHue: 0.08, sunTint: 0, sun2: 0, sun2Hue: 0.55, sun2Yaw: 140, sunSize: 1, groundHue: 0.25, groundTint: 0, quality: 'High' },
    leaffall: { enabled: true, rate: 1, litter: 1 },
    weather: { event: 'auto', lightning: true },
    sway: { amount: 1 },
    breakage: { enabled: true, strength: 1 },
    camera: { autoFrame: true, autoRotate: true, cinema: true },
    seed: { seed: 1 },
  };
}

/**
 * Bumps whenever a tree or leaf parameter changes (`Automation.userSet` / `apply` / `setDrift`, preset load, and the
 * `paramsSignature` safety net in `main.ts`). Renderers rebuild on a paused tree only when this moved.
 */
let paramsVer = 0;
export const paramsVersion = () => paramsVer;
export const bumpParams = () => ++paramsVer;

/** Allocation-free signature of every param outside sky/camera/time (those have their own dirty sources). */
export function paramsSignature(p: ArborParams): number {
  const groups = p as unknown as Record<string, Record<string, unknown>>;
  let sig = 0, i = 1;
  for (const g in groups) {
    if (g === 'sky' || g === 'camera' || g === 'time' || g === 'weather' || g === 'leaffall') continue;
    const grp = groups[g];
    for (const f in grp) {
      const v = grp[f];
      sig += (typeof v === 'number' ? v : typeof v === 'boolean' ? +v : String(v).length) * (i++ * 0.6180339887 % 1 + 0.5);
    }
  }
  return sig;
}

/** Apply ?key=value overrides (key = field name, searched in all groups, or group.field). */
export function applyQueryOverrides(p: ArborParams, search: string): void {
  const q = new URLSearchParams(search);
  q.forEach((value, key) => {
    const groups = p as unknown as Record<string, Record<string, unknown>>;
    let [g, f] = key.includes('.') ? key.split('.') : [undefined, key];
    for (const gn of Object.keys(groups)) {
      if (g && gn !== g) continue;
      const grp = groups[gn];
      if (f in grp) {
        const cur = grp[f];
        if (typeof cur === 'number') {
          const n = Number(value);
          if (Number.isFinite(n)) grp[f] = n; // ignore junk like ?t=abc instead of feeding NaN into the sim
        } else grp[f] = typeof cur === 'boolean' ? value === 'true' || value === '1' : value;
        return;
      }
    }
  });
}

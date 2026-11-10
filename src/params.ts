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
    /** Random wander per segment. */
    wander: number;
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
    attractors: number;
  };
  thickness: {
    /** Pipe model exponent n: r^n = sum(child r^n). */
    exponent: number;
    twigRadius: number;
    /** Approach rate of radii toward the pipe-model target (1/s). */
    thickeningRate: number;
  };
  leaves: {
    size: number;
    /** Leaves per node, 0..4. */
    density: number;
    hue: number;
    saturation: number;
    /** Leaves drop from branches thicker than this (m). */
    maxBranchRadius: number;
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
    /** Fog / aerial perspective density multiplier. */
    fog: number;
    stars: number;
    godRays: number;
    quality: 'High' | 'Low';
  };
  camera: {
    autoFrame: boolean;
    autoRotate: boolean;
  };
  seed: {
    seed: number;
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
      wander: 0.25,
      branchAngle: 42,
      phyllotaxis: 137.5,
      apicalDominance: 0.5,
      branchingProbability: 0.22,
      segmentLength: 0.22,
      growthRate: 1.6,
      vigorDecay: 0.82,
      maxOrder: 6,
      sag: 1,
      maxNodes: 14000,
    },
    crown: { shape: 0, radius: 3.6, height: 6.5, base: 2.4, attractors: 4000 },
    thickness: { exponent: 2.3, twigRadius: 0.012, thickeningRate: 0.6 },
    leaves: { size: 0.16, density: 2, hue: 0.27, saturation: 0.55, maxBranchRadius: 0.035 },
    light: { azimuth: 35, elevation: 50 },
    sky: { timeOfDay: 17.6, cycle: false, dayLength: 240, latitude: 48, sunYaw: 200, exposure: 0.9, skyGain: 1, fog: 1, stars: 1, godRays: 1, quality: 'High' },
    camera: { autoFrame: true, autoRotate: true },
    seed: { seed: 1 },
  };
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
        grp[f] = typeof cur === 'boolean' ? value === 'true' || value === '1' : typeof cur === 'number' ? Number(value) : value;
        return;
      }
    }
  });
}

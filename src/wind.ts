/**
 * The single wind source (audit 3.2). No three import: sim, renderers and sound can all read it.
 * `gust(x, z)` is a travelling wave along `dir`, so gusts visibly cross the meadow; every moving element samples it.
 * `main.ts` calls `update` once per frame; strength halves at night.
 */
export class Wind {
  /** Unit direction the wind blows toward, in the xz plane. */
  dirX = 0.906;
  dirZ = 0.423;
  /** Effective strength 0..1 this frame (param `sky.wind`, halved at night). */
  base = 0.35;
  /** Wind clock in seconds (advances with real time, not sim time). */
  t = 0;

  setDirection(yawRad: number) {
    this.dirX = Math.cos(yawRad);
    this.dirZ = Math.sin(yawRad);
  }

  /** Storm share 0..1 of the current strength (`Weather.wind`): 0 = the calm setting alone, 1 = gale. */
  storm = 0;

  /**
   * strength = param `sky.wind`; night 0..1; storm = `Weather.wind` 0..1. A storm lifts the base toward `STORM_BASE`
   * (it never lowers a windier setting), is not calmed by night, and runs the gust clock faster (gustier).
   */
  update(dt: number, strength: number, night = 0, storm = 0) {
    this.storm = storm;
    this.t += dt * (1 + 1.6 * storm);
    const calm = Math.max(0, strength) * (1 - 0.5 * night);
    this.base = calm + (Math.max(calm, Wind.STORM_BASE) - calm) * storm;
  }
  static readonly STORM_BASE = 1.0;
  /** Wind speed in m/s for a strength value (0.35 calm = about 4 m/s, 1.0 storm = about 22 m/s gusts). */
  static speed(strength: number) { return 2 + 20 * strength * strength; }

  /** Wind speed in m/s at a world position right now (gust included). */
  speedAt(x: number, z: number) { return Wind.speed(this.gust(x, z)); }
  /** Horizontal wind velocity in m/s at a world position: out = [vx, vz]. */
  velocityAt(x: number, z: number, out: [number, number] = [0, 0]) {
    const v = this.speedAt(x, z);
    out[0] = this.dirX * v; out[1] = this.dirZ * v;
    return out;
  }

  /** Distance of a point along the wind direction (the phase coordinate of the gust wave). */
  along(x: number, z: number) {
    return this.dirX * x + this.dirZ * z;
  }

  /** Gust strength 0..base at a world position: slow swell x faster ripple, both travelling downwind. */
  gust(x: number, z: number, t = this.t): number {
    return this.gustAlong(this.dirX * x + this.dirZ * z, t);
  }

  /** Same as `gust` for a point given by its distance along the wind. */
  gustAlong(d: number, t = this.t): number {
    return this.base * (0.6 + 0.4 * Math.sin(0.21 * t - 0.5 * d)) * (0.75 + 0.25 * Math.sin(1.3 * t - 0.9 * d + 1.7));
  }
}

/** Shared instance. */
export const wind = new Wind();

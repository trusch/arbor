/**
 * Weather state machine (audit 3.5 "Weather state"). No three import: sim, wind, renderers and sound can all read it.
 * calm -> breeze -> front -> rain -> clearing -> calm, on a slow random schedule or forced by `params.weather.event`.
 * Outputs are scalars 0..1 that eased toward the phase targets; all are exactly 0 in settled calm, so every consumer
 * that computes `calmValue (op) f(scalar)` each frame returns to the calm look without drift.
 */
export type WeatherEvent = 'auto' | 'calm' | 'storm';
export type WeatherPhase = 'calm' | 'breeze' | 'front' | 'rain' | 'clearing';

/** Phase targets [wind, cloud, rain] and duration range in seconds. */
const PHASES: Record<WeatherPhase, { wind: number; cloud: number; rain: number; min: number; max: number; next: WeatherPhase }> = {
  calm: { wind: 0, cloud: 0, rain: 0, min: 0, max: 0, next: 'breeze' },
  breeze: { wind: 0.4, cloud: 0.45, rain: 0, min: 10, max: 16, next: 'front' },
  front: { wind: 0.85, cloud: 1, rain: 0.12, min: 9, max: 14, next: 'rain' },
  rain: { wind: 1, cloud: 1, rain: 1, min: 40, max: 75, next: 'clearing' },
  clearing: { wind: 0.25, cloud: 0.3, rain: 0, min: 16, max: 22, next: 'calm' },
};

export interface Bolt {
  /** True while the bolt channel is drawn (about 3 frames per pulse). */
  on: boolean;
  /** Which pre-painted bolt (0..2). */
  variant: number;
  /** Screen-relative azimuth -1..1 (renderers place it inside the view). */
  u: number;
  /** Distance in metres (thunder delay = dist / 343). */
  dist: number;
}

export class Weather {
  phase: WeatherPhase = 'calm';
  /** Seconds in the current phase / its planned length. */
  phaseT = 0;
  phaseLen = 0;
  /** Storm wind 0..1 (0 = the calm `sky.wind` setting alone, 1 = full gale). Leads the rain. */
  wind = 0;
  /** Cloud cover 0..1 over the calm sky: drives sky darkening, dim cool light, fog. */
  cloud = 0;
  /** Rain amount 0..1. */
  rain = 0;
  /** Lightning flash 0..1 this frame (0 when lightning is off). */
  flash = 0;
  bolt: Bolt = { on: false, variant: 0, u: 0, dist: 500 };
  /** Strikes so far; `onStrike(dist)` fires once per strike (thunder hook). */
  strikes = 0;
  onStrike: ((dist: number) => void) | null = null;
  /** Dev/test hook: hold a full flash with a visible bolt (ignored when lightning is off). */
  holdFlash = false;
  /** Seconds until the next automatic storm (event 'auto'). */
  nextStorm = 240 + Math.random() * 420;
  private pulses: number[] = [];
  private strikeAge = 1e9;
  private nextStrike = 3;
  private wasForced = false;

  /** One scalar for "how violent is it right now", 0 calm .. 1 full storm (wind-led; what breakage should read). */
  get violence() { return this.wind; }
  get storming() { return this.phase !== 'calm' || this.wind > 0 || this.cloud > 0 || this.rain > 0; }

  /** Start a full storm sequence now (the "Storm now" button). */
  trigger() { if (this.phase === 'calm' || this.phase === 'clearing') this.enter('breeze'); }
  /** Jump straight into the settled storm (tests, `?weather=storm`). */
  snapStorm() { this.enter('rain'); this.wind = this.cloud = this.rain = 1; }
  /** Force one lightning strike now. */
  strike() {
    this.strikeAge = 0;
    const n = 1 + Math.floor(Math.random() * 3);
    this.pulses = [0];
    for (let i = 1; i < n; i++) this.pulses.push(this.pulses[i - 1] + 0.09 + Math.random() * 0.13);
    this.bolt.variant = Math.floor(Math.random() * 3);
    this.bolt.u = Math.random() * 2 - 1;
    this.bolt.dist = 300 + Math.random() * 500;
    this.strikes++;
    this.onStrike?.(this.bolt.dist);
  }

  private enter(ph: WeatherPhase) {
    const P = PHASES[ph];
    this.phase = ph;
    this.phaseT = 0;
    this.phaseLen = P.min + Math.random() * (P.max - P.min);
    if (ph === 'rain') this.nextStrike = 2 + Math.random() * 4;
  }

  update(dt: number, event: WeatherEvent, lightning: boolean) {
    const forced = event === 'storm';
    if (forced && this.phase === 'calm') this.enter('breeze');
    if (event === 'calm' || (this.wasForced && !forced)) { if (this.phase !== 'calm' && this.phase !== 'clearing') this.enter('clearing'); }
    this.wasForced = forced;
    if (this.phase === 'calm') {
      if (event === 'auto' && (this.nextStorm -= dt) <= 0) this.enter('breeze');
    } else {
      this.phaseT += dt;
      // A forced storm stays in the rain phase.
      if (this.phaseT >= this.phaseLen && !(forced && this.phase === 'rain')) {
        this.enter(PHASES[this.phase].next);
        if ((this.phase as WeatherPhase) === 'calm') this.nextStorm = 240 + Math.random() * 420;
      }
    }
    const P = PHASES[this.phase];
    const ease = (v: number, target: number, tau: number) => {
      const n = v + (target - v) * (1 - Math.exp(-dt / tau));
      return Math.abs(n - target) < 0.002 ? target : n;
    };
    this.wind = ease(this.wind, P.wind, 3.5);
    this.cloud = ease(this.cloud, P.cloud, 5);
    this.rain = ease(this.rain, P.rain, 3);

    // Lightning: strikes at least 4 s apart, only in heavy rain; 1 to 3 pulses of about 3 frames each.
    this.strikeAge += dt;
    if (lightning && this.phase === 'rain' && this.rain > 0.6 && (this.nextStrike -= dt) <= 0) {
      this.strike();
      this.nextStrike = 5 + Math.random() * 10;
    }
    let f = 0, on = false;
    if (lightning) {
      for (const p of this.pulses) {
        const a = this.strikeAge - p;
        if (a < 0) continue;
        if (a < 0.06) on = true;
        f = Math.max(f, a < 0.05 ? 1 : Math.exp(-(a - 0.05) / 0.07));
      }
      if (f < 0.01) f = 0;
      if (this.holdFlash) { f = 1; on = true; }
    }
    this.flash = f;
    this.bolt.on = on;
  }
}

/** Shared instance. */
export const weather = new Weather();

/**
 * Weather state machine (audit 3.5 "Weather state"). No three import: sim, wind, renderers and sound can all read it.
 * calm -> breeze -> front -> rain -> clearing -> calm, on a slow random schedule or forced by `params.weather.event`.
 * Outputs are scalars 0..1 that eased toward the phase targets; all are exactly 0 in settled calm, so every consumer
 * that computes `calmValue (op) f(scalar)` each frame returns to the calm look without drift.
 */
export type WeatherEvent = 'auto' | 'calm' | 'storm';
/**
 * Kinds of weather (the ambient layer). Under event 'auto' a scheduler walks through them with odds that depend on the
 * season; `params.weather.kind` holds one by hand. 'storm' is the thunderstorm sequence below (phases breeze .. clearing).
 * Each kind is a set of targets the ambient scalars ease toward; the outputs are max(storm sequence, ambient), so with
 * event 'calm' or 'storm' (ambient targets all 0, breeze 1) the model is exactly the storm machine alone.
 */
export type WeatherKind = 'clear' | 'fair' | 'cloudy' | 'overcast' | 'drizzle' | 'shower' | 'rain' | 'storm' | 'windy' | 'mist';
export type CloudType = 'none' | 'cumulus' | 'stratocumulus' | 'stratus' | 'nimbostratus' | 'cumulonimbus' | 'fog';
interface KindDef {
  label: string;
  /** Dark cloud deck 0..1 (the storm-look scalar) and the amplitude of its slow in-and-out (sun behind passing clouds). */
  cloud: number; flutter: number;
  rain: number;
  /** Storm share of the wind 0..1, and the factor on the calm wind setting (below 1 = stiller than the setting). */
  wind: number; breeze: number;
  /** 0..1: fewer clouds than the calm sky. */
  clear: number;
  /** 0..1: haze / mist (fog density and pale fog colour). */
  haze: number;
  /** Duration range in seconds. */
  min: number; max: number;
  /** For the cloud renderer: type and base height in metres. */
  type: CloudType; base: number;
  /** Relative odds in spring, summer, autumn, winter. */
  odds: [number, number, number, number];
}
export const KINDS: Record<WeatherKind, KindDef> = {
  clear: { label: 'Clear', cloud: 0, flutter: 0, rain: 0, wind: 0, breeze: 0.5, clear: 1, haze: 0, min: 14, max: 24, type: 'none', base: 0, odds: [2, 3, 1.5, 1.5] },
  fair: { label: 'Fair', cloud: 0, flutter: 0.14, rain: 0, wind: 0, breeze: 1, clear: 0, haze: 0, min: 12, max: 20, type: 'cumulus', base: 1500, odds: [2, 2.5, 1.5, 1] },
  cloudy: { label: 'Sun and clouds', cloud: 0.16, flutter: 0.3, rain: 0, wind: 0, breeze: 1.25, clear: 0, haze: 0, min: 16, max: 26, type: 'stratocumulus', base: 1200, odds: [3, 2.5, 2, 1.5] },
  overcast: { label: 'Overcast', cloud: 0.5, flutter: 0.06, rain: 0, wind: 0, breeze: 0.9, clear: 0, haze: 0.12, min: 14, max: 22, type: 'stratus', base: 700, odds: [1.5, 0.7, 2.5, 3] },
  drizzle: { label: 'Drizzle', cloud: 0.58, flutter: 0, rain: 0.2, wind: 0, breeze: 0.5, clear: 0, haze: 0.3, min: 16, max: 26, type: 'stratus', base: 400, odds: [1.2, 0.4, 2, 2] },
  shower: { label: 'Shower', cloud: 0.7, flutter: 0, rain: 0.62, wind: 0.22, breeze: 1.2, clear: 0, haze: 0.1, min: 10, max: 16, type: 'cumulonimbus', base: 900, odds: [2.5, 1.5, 1, 0.6] },
  rain: { label: 'Rain', cloud: 0.84, flutter: 0, rain: 0.5, wind: 0.15, breeze: 1, clear: 0, haze: 0.25, min: 22, max: 34, type: 'nimbostratus', base: 500, odds: [1, 0.6, 2, 1.5] },
  storm: { label: 'Thunderstorm', cloud: 0, flutter: 0, rain: 0, wind: 0, breeze: 1, clear: 0, haze: 0, min: 0, max: 0, type: 'cumulonimbus', base: 600, odds: [0.5, 1.6, 0.4, 0.1] },
  windy: { label: 'Windy', cloud: 0.06, flutter: 0.14, rain: 0, wind: 0.42, breeze: 1.5, clear: 0.3, haze: 0, min: 16, max: 26, type: 'cumulus', base: 1300, odds: [1.2, 0.5, 2, 1.5] },
  mist: { label: 'Mist', cloud: 0.14, flutter: 0, rain: 0, wind: 0, breeze: 0.15, clear: 0, haze: 1, min: 14, max: 22, type: 'fog', base: 0, odds: [1.5, 0.5, 3, 2] },
};
const WET: WeatherKind[] = ['drizzle', 'shower', 'rain', 'storm'];
/** Longest dry spell / longest time without a thunderstorm the scheduler allows (seconds; a year is 300 s by default). */
export const MAX_DRY = 60, MAX_NO_STORM = 235;
/** What the weather needs to know about the world (all optional: without it the year stays at midsummer noon). */
export interface WeatherEnv {
  /** Kind held by hand ('auto' or missing = the scheduler decides). */
  kind?: string;
  /** Year phase 0..1 (`season.phase`), hour 0..24, effective wind strength 0..1 (`wind.base`). */
  phase?: number; hour?: number; wind?: number;
}
/**
 * Air temperature in degrees C for a temperate meadow: a pure function of the year phase (0 = bud break; warmest at
 * 0.42, i.e. a few weeks after midsummer), the hour (warmest at 15:00, coldest at 03:00), cloud cover (flattens the
 * daily swing: cool clear nights, mild cloudy ones, dull cool afternoons), rain (evaporative cooling, the drop when a
 * front arrives) and wind above the calm setting.
 */
export function temperature(phase: number, hour: number, cloud: number, rain: number, wind: number): number {
  const mean = 10.5 + 9.5 * Math.cos((phase - 0.42) * 2 * Math.PI);
  const daylight = 0.5 - 0.5 * Math.cos((phase - 0.875) * 2 * Math.PI);
  const swing = (4.5 + 3.5 * daylight) * (1 - 0.65 * cloud);
  return mean + swing * Math.cos(((hour - 15) / 24) * 2 * Math.PI) - 3.5 * rain - 1.2 * cloud - 2.5 * Math.max(0, wind - 0.35);
}
/** Wind strength (`wind.base`) in words, Beaufort-like steps. */
export function windWord(base: number): string {
  return base < 0.07 ? 'Calm' : base < 0.2 ? 'Light air' : base < 0.42 ? 'Light breeze' : base < 0.56 ? 'Breeze' : base < 0.72 ? 'Fresh wind' : base < 0.9 ? 'Strong wind' : 'Gale';
}
/** Compass point the wind comes from (north = -z, east = +x), for a direction it blows toward. */
export function windFrom(dirX: number, dirZ: number): string {
  const a = (Math.atan2(-dirX, dirZ) * 180) / Math.PI;
  return ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'][((Math.round(a / 45) % 8) + 8) % 8];
}
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

  // ---- Ambient layer (kinds of weather) -----------------------------------------------------------------------------
  /** The ambient kind (what the scheduler or the hand pick is showing); `kind` is what a viewer would call it now. */
  amb: WeatherKind = 'fair';
  kindT = 0;
  kindLen = 6 + Math.random() * 6;
  /** Fewer clouds than the calm sky 0..1, haze 0..1, factor on the calm wind setting (1 in calm). */
  clear = 0;
  haze = 0;
  breeze = 1;
  /** Air temperature in degrees C (see `temperature`). */
  temp = 15;
  /** Seconds since rain last fell / since the last thunderstorm, and counters (tests, measurements). */
  sinceRain = 0;
  sinceStorm = 60 + Math.random() * 60;
  /** Weather clock (seconds). */
  t = Math.random() * 1000;
  /** Test hook: replaces Math.random in the scheduler. */
  rnd: () => number = Math.random;
  private sw = 0; private sc = 0; private sr = 0;
  private aw = 0; private ac = 0; private ar = 0;
  private quick = false;
  private wasWet = false;
  private held = '';

  /** What the weather is right now, as one kind (a running storm sequence wins over the ambient kind). */
  get kind(): WeatherKind { return this.phase !== 'calm' && this.phase !== 'clearing' ? 'storm' : this.amb; }
  get label(): string { return this.phase === 'clearing' ? 'Clearing up' : KINDS[this.kind].label; }
  /** True when what falls is snow (below about freezing). Nothing draws snow yet: the hook for a snow package. */
  get snow(): boolean { return this.rain > 0 && this.temp <= 0.5; }
  get precip(): 'none' | 'rain' | 'snow' { return this.rain <= 0 ? 'none' : this.snow ? 'snow' : 'rain'; }
  /** Total cloud cover 0..1 as a viewer would estimate it (calm sky = 0.35). */
  get cover(): number { return Math.min(1, 0.35 + 0.65 * this.cloud - 0.27 * this.clear * (1 - this.cloud)); }
  /** For the cloud renderer: type, base height in metres, drift speed in m/s (from the wind strength). */
  get cloudType(): CloudType { return this.kind === 'storm' ? 'cumulonimbus' : KINDS[this.amb].type; }
  get cloudBase(): number { return KINDS[this.kind].base; }
  cloudSpeed(windBase: number): number { return 3 + 28 * windBase; }

  /** Jump the ambient layer to its settled values (shots, `?weather.kind=`). */
  snap(kind?: WeatherKind) {
    if (kind && KINDS[kind] && kind !== 'storm') { this.amb = kind; this.kindT = 0; }
    const K = KINDS[this.amb];
    this.aw = K.wind; this.ac = K.cloud + K.flutter * 0.5; this.ar = K.rain; this.clear = K.clear; this.haze = K.haze; this.breeze = K.breeze;
    this.mix();
  }
  private mix() {
    this.wind = Math.max(this.sw, this.aw);
    this.cloud = Math.max(this.sc, this.ac);
    this.rain = Math.max(this.sr, this.ar);
  }
  private setKind(k: WeatherKind) {
    const K = KINDS[k];
    this.wasWet = WET.includes(this.amb);
    this.amb = k; this.kindT = 0;
    this.kindLen = K.min + this.rnd() * (K.max - K.min);
  }
  /** Odds of a kind now: the season mix of its four numbers; mist only forms in the early morning. */
  odds(k: WeatherKind, phase: number, hour: number): number {
    const o = KINDS[k].odds;
    const w = (c: number) => Math.max(0, 1 - Math.min(Math.abs(phase - c), 1 - Math.abs(phase - c)) * 4);
    let v = o[0] * w(0.125) + o[1] * w(0.375) + o[2] * w(0.64) + o[3] * w(0.89);
    if (k === 'mist') v *= hour >= 4.5 && hour <= 8.5 ? 4 : 0;
    return v;
  }
  /** Next kind: weighted by season, never the same twice, rain at least every MAX_DRY s, thunder every MAX_NO_STORM s. */
  private pick(phase: number, hour: number) {
    let pool = (Object.keys(KINDS) as WeatherKind[]).filter((k) => k !== this.amb);
    if (this.sinceStorm > MAX_NO_STORM) pool = ['storm'];
    else if (this.sinceRain > MAX_DRY) pool = pool.filter((k) => WET.includes(k));
    // After rain the sun comes back more often than not.
    else if (WET.includes(this.amb) && this.rnd() < 0.7) pool = pool.filter((k) => k === 'clear' || k === 'fair' || k === 'cloudy');
    const ws = pool.map((k) => this.odds(k, phase, hour) + 1e-4);
    let r = this.rnd() * ws.reduce((a, b) => a + b, 0), k = pool[pool.length - 1];
    for (let i = 0; i < pool.length; i++) if ((r -= ws[i]) <= 0) { k = pool[i]; break; }
    if (k === 'storm') { this.wasWet = WET.includes(this.amb); this.amb = 'fair'; this.kindT = 0; this.kindLen = 8 + this.rnd() * 8; this.quick = true; this.enter('breeze'); }
    else this.setKind(k);
  }

  /** One scalar for "how violent is it right now", 0 calm .. 1 full storm (wind-led; what breakage should read). */
  get violence() { return Math.max(this.sw, 0.5 * this.aw); }
  get storming() { return this.phase !== 'calm' || this.wind > 0 || this.cloud > 0 || this.rain > 0; }

  /** Start a full storm sequence now (the "Storm now" button). */
  trigger() { if (this.phase === 'calm' || this.phase === 'clearing') this.enter('breeze'); }
  /** Jump straight into the settled storm (tests, `?weather=storm`). */
  snapStorm() { this.enter('rain'); this.sw = this.sc = this.sr = 1; this.mix(); }
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
    // A storm the scheduler started is shorter than one asked for by hand (it has to fit a 300 s year).
    this.phaseLen = (P.min + Math.random() * (P.max - P.min)) * (this.quick ? (ph === 'rain' ? 0.45 : 0.65) : 1);
    if (ph === 'rain') this.nextStrike = 2 + Math.random() * 4;
  }

  update(dt: number, event: WeatherEvent, lightning: boolean, env: WeatherEnv = {}) {
    const pickK = event === 'auto' && env.kind && env.kind !== 'auto' && KINDS[env.kind as WeatherKind] ? (env.kind as WeatherKind) : null;
    const forced = event === 'storm' || pickK === 'storm';
    const phase = env.phase ?? 0.375, hour = env.hour ?? 12;
    this.t += dt;
    if (forced && this.phase === 'calm') this.enter('breeze');
    if (event === 'calm' || (this.wasForced && !forced)) { if (this.phase !== 'calm' && this.phase !== 'clearing') this.enter('clearing'); }
    this.wasForced = forced;
    if (this.phase === 'calm') {
      // Ambient kinds: held by hand, or scheduled (only while no storm sequence runs).
      if (pickK && pickK !== 'storm') { if (this.amb !== pickK) this.setKind(pickK); }
      else if (event === 'auto' && !forced) {
        this.kindT += dt;
        if (this.amb === 'mist' && hour > 9.5) this.kindT = this.kindLen;
        if (this.kindT >= this.kindLen || this.held) this.pick(phase, hour);
      }
      this.held = pickK ?? '';
    } else {
      this.phaseT += dt;
      // A forced storm stays in the rain phase.
      if (this.phaseT >= this.phaseLen && !(forced && this.phase === 'rain')) {
        this.enter(PHASES[this.phase].next);
        if ((this.phase as WeatherPhase) === 'calm') { this.nextStorm = 240 + Math.random() * 420; this.quick = false; }
      }
    }
    if (this.phase === 'rain') this.sinceStorm = 0; else this.sinceStorm += dt;
    const P = PHASES[this.phase];
    const ease = (v: number, target: number, tau: number) => {
      const n = v + (target - v) * (1 - Math.exp(-dt / tau));
      return Math.abs(n - target) < 0.002 ? target : n;
    };
    this.sw = ease(this.sw, P.wind, 3.5);
    this.sc = ease(this.sc, P.cloud, 5);
    this.sr = ease(this.sr, P.rain, 3);
    // Ambient targets: all 0 (breeze 1) unless the weather runs on its own; a storm sequence owns the sky while it runs.
    const amb = event === 'auto' && !forced && this.phase === 'calm';
    const K = KINDS[amb ? this.amb : 'storm'];
    // Passing clouds: a slow, irregular in-and-out of the sun (a pure function of the weather clock).
    const pass = 0.5 + 0.5 * Math.sin(0.33 * this.t + 1.4 * Math.sin(0.117 * this.t));
    // The breeze also wanders over minutes (calm spells, breezy spells) around the kind's own level.
    const wander = amb ? 1 + 0.35 * Math.sin(0.021 * this.t + 2 * Math.sin(0.0077 * this.t)) : 1;
    this.aw = ease(this.aw, K.wind, 4);
    // Sun breaking through after rain is quick; cloud building up is slow.
    this.ac = ease(this.ac, K.cloud + K.flutter * pass, this.wasWet && this.ac > K.cloud + K.flutter ? 2.6 : 5);
    this.ar = ease(this.ar, K.rain, 3);
    this.clear = ease(this.clear, K.clear, 6);
    this.haze = ease(this.haze, K.haze, 7);
    this.breeze = ease(this.breeze, K.breeze * wander, 6);
    this.mix();
    if (this.rain > 0.05) this.sinceRain = 0; else this.sinceRain += dt;
    this.temp = temperature(phase, hour, this.cloud, this.rain, env.wind ?? 0.35);

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

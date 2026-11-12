/**
 * Seasons: the year clock and everything a leaf needs to know about the time of year. No three import (like
 * `weather.ts` / `wind.ts`), one shared instance `season`, updated once per frame in `main.ts` before anything reads it.
 *
 * Rule: every seasonal quantity is a pure function of `season.phase` (0..1 through the year, 0 = bud break in spring),
 * never accumulated, so scrubbing to a date gives the same picture as waiting for it.
 *
 * The year runs on sim time (`phase = frac(simTime / yearLength + offset)`), so the growth-speed control scales it and
 * a paused tree holds its date. `params.season.date` is the scrub slider: a hand-set value moves `offset`; while
 * `hold` is set the phase is the date and the clock resumes from there on release.
 */
export interface SeasonParams {
  /** Seasons on/off. Off = the tree looks as in midsummer all year. */
  on: boolean;
  /** Length of a year in seconds of sim time (300 = 5 minutes at 1x growth speed). */
  yearLength: number;
  /** Date 0..1 (written back every frame; a different value written by the user scrubs the year). */
  date: number;
  /** Hold this date. */
  hold: boolean;
}

const sm = (a: number, b: number, x: number) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a || 1e-6))); return t * t * (3 - 2 * t); };
const frac = (x: number) => x - Math.floor(x);

/** Year phases: spring 0, summer 0.25, autumn 0.5, winter 0.78 (the crown is bare from about 0.8). */
export const SUMMER = 0.25, AUTUMN = 0.5, WINTER = 0.78;
/** Seasons-off date (midsummer). */
const MIDSUMMER = 0.375;
/** A year-phase step larger than this in one frame is a jump (scrub, hold change): no leaves are launched, all are re-placed. */
const JUMP = 0.004;

export function seasonName(phase: number): string {
  const part = (a: number, b: number) => ['Early', 'Mid', 'Late'][Math.min(2, Math.floor(((phase - a) / (b - a)) * 3))];
  if (phase < SUMMER) return `${part(0, SUMMER)} spring`;
  if (phase < AUTUMN) return `${part(SUMMER, AUTUMN)} summer`;
  if (phase < WINTER) return `${part(AUTUMN, WINTER)} autumn`;
  return `${part(WINTER, 1)} winter`;
}

export class Season {
  /** False when seasons are off: every consumer shows its summer state. */
  active = false;
  /** Year phase 0..1, 0 = start of spring. */
  phase = MIDSUMMER;
  /** Years since the tree was planted (1 = first year). */
  year = 1;
  name = 'Mid summer';
  /** Derived 0..1 signals for later packages (blossom, meadow, snow, seasonal weather). Each peaks mid-season. */
  spring = 0; summer = 1; autumn = 0; winter = 0;
  /** Share of a deciduous crown in leaf (0 bare .. 1 full). */
  leafOn = 1;
  /** Day length / sun height signal: 0 at midwinter, 1 at midsummer. Nothing reads it yet. */
  daylight = 1;
  /** Share of the autumn litter still lying: 1 until winter, fading to 0 before spring. */
  litterKeep = 1;
  /** Sim time at which this year's spring began (leaves born after it grew this season and skip the flush). */
  springTime = -1e9;
  /** True in a frame whose phase moved by a jump (scrub, switching seasons on/off). */
  jumped = false;
  /** Phase advance of this frame (0 on a jump). */
  dPhase = 0;
  private offset = 0;
  private wrote = NaN;
  private wasActive = false;

  update(simTime: number, p: SeasonParams): void {
    const len = Math.max(10, p.yearLength);
    const raw = simTime / len;
    const prev = this.phase;
    if (!p.on) {
      this.phase = MIDSUMMER; this.year = 1 + Math.floor(raw + this.offset);
    } else {
      if (!Number.isFinite(p.date)) p.date = 0;
      // A date nobody but the user wrote (slider, script, ?season.date=): the year continues from there.
      if (p.hold || p.date !== this.wrote) this.offset = Math.max(0, Math.floor(raw + this.offset + 1e-9)) + frac(p.date) - raw;
      const y = raw + this.offset;
      this.phase = p.hold ? frac(p.date) : frac(y);
      this.year = 1 + Math.max(0, Math.floor(y + 1e-9));
      if (!p.hold) p.date = this.phase;
      this.wrote = p.date;
    }
    this.active = p.on;
    let d = this.phase - prev;
    if (d < -0.5) d += 1;
    this.jumped = this.active !== this.wasActive || d < 0 || d > JUMP;
    this.dPhase = this.jumped ? 0 : d;
    this.wasActive = this.active;
    const ph = this.phase;
    this.springTime = this.active ? simTime - ph * len : -1e9;
    this.name = seasonName(ph);
    this.spring = sm(0, 0.06, ph) * (1 - sm(0.2, 0.3, ph));
    this.summer = sm(0.2, 0.3, ph) * (1 - sm(0.47, 0.56, ph));
    this.autumn = sm(0.47, 0.56, ph) * (1 - sm(0.74, 0.82, ph));
    this.winter = ph < 0.5 ? 1 - sm(0, 0.06, ph) : sm(0.74, 0.82, ph);
    this.leafOn = this.active ? sm(T_ON, T_ON + ON_SPREAD + FLUSH, ph) * (1 - sm(0.56, 0.79, ph)) : 1;
    this.daylight = 0.5 - 0.5 * Math.cos((ph - 0.875) * 2 * Math.PI);
    this.litterKeep = this.active ? (ph >= WINTER ? 1 - sm(WINTER + 0.04, 0.99, ph) : ph < 0.03 ? 0 : 1) : 1;
  }
}

export const season = new Season();

// ---- Leaves -------------------------------------------------------------------------------------------------------

/** Bud break starts here and is spread over ON_SPREAD per leaf; a leaf unfolds over FLUSH. */
const T_ON = 0.018, ON_SPREAD = 0.055, FLUSH = 0.05;
/** A leaf turns over TURN of the year. */
const TURN = 0.06;
/** Leaves whose date is within this much of the year phase are re-placed even on wood at rest. */
export const LEAF_EPS = 0.012;

export interface LeafSeason {
  /** Loses its leaves (false = keeps them; with a palette it only changes colour). */
  drop: boolean;
  /** Autumn palette: hue range (sRGB HSL), saturation, lightness gain over the summer leaf, share of leaves that go dull brown. null = evergreen. */
  pal: { h0: number; h1: number; s: number; l: number; brown: number } | null;
}

/** Per leaf form (`LEAF_FORMS` ids). Unknown ids behave like the oak. */
const FORM_SEASON: Record<string, LeafSeason> = {
  oak: { drop: true, pal: { h0: 0.05, h1: 0.11, s: 0.7, l: 1.15, brown: 0.35 } },
  maple: { drop: true, pal: { h0: 0.0, h1: 0.075, s: 0.88, l: 1.3, brown: 0.06 } },
  birch: { drop: true, pal: { h0: 0.125, h1: 0.155, s: 0.9, l: 1.7, brown: 0.05 } },
  ginkgo: { drop: true, pal: { h0: 0.135, h1: 0.152, s: 0.95, l: 1.8, brown: 0 } },
  willow: { drop: true, pal: { h0: 0.135, h1: 0.175, s: 0.55, l: 1.75, brown: 0.1 } },
  round: { drop: true, pal: { h0: 0.05, h1: 0.14, s: 0.78, l: 1.4, brown: 0.2 } },
  // Conifer: evergreen.
  spray: { drop: false, pal: null },
  // Alien forms: the frond turns violet and sheds, the ring flushes gold for the cold months and keeps its leaves,
  // the glowing spiral has no seasons.
  frond: { drop: true, pal: { h0: 0.72, h1: 0.84, s: 0.7, l: 1.25, brown: 0 } },
  ring: { drop: false, pal: { h0: 0.1, h1: 0.15, s: 0.9, l: 1.5, brown: 0 } },
  spiral: { drop: false, pal: null },
};
export const leafSeason = (form: string): LeafSeason => FORM_SEASON[form] ?? FORM_SEASON.oak;

/** Bud-break date of a leaf (u = its own hash 0..1). */
export const leafOnDate = (u: number) => T_ON + ON_SPREAD * u;
/**
 * Date a leaf starts to turn: the top and the sun-exposed outside of the crown first (`exposure` 0..1), the interior
 * last, each leaf with its own offset.
 */
export const leafTurnDate = (exposure: number, u: number) => 0.485 + 0.125 * (1 - exposure) + 0.06 * u;
/** Date the leaf lets go. */
export const leafFallDate = (turn: number, u: number) => turn + 0.05 + 0.075 * u;

/**
 * Size factor of a leaf at year phase `ph`: 0 before bud break and after its fall, unfolding in between.
 * `thisYear` = the leaf grew after this year's spring began (it has its own unfolding and no bud to wait in).
 */
export function leafSeasonScale(ph: number, tOn: number, tFall: number, thisYear: boolean): number {
  if (ph >= tFall) return 0;
  if (thisYear) return 1;
  if (ph <= tOn) return 0;
  return 0.12 + 0.88 * sm(tOn, tOn + FLUSH, ph);
}

const out3 = [0, 0, 0];
/**
 * Seasonal leaf colour: takes the summer colour (sRGB HSL) and returns the colour at year phase `ph` in a shared
 * array [h, s, l]. Spring: pale yellow-green, darkening over about a month. Autumn: the hue travels from green through
 * yellow-green to the leaf's own shade of the palette (`shade` 0..1; `dull` 0..1 picks the brown share), mottled by
 * the per-leaf dates rather than switched; a turned leaf dries duller until it falls. `lift` scales the autumn
 * lightness (the full leaf path keeps a much darker summer albedo than the safe path, which would turn russet into black).
 */
export function leafSeasonColour(ph: number, fs: LeafSeason, tOn: number, tTurn: number, tFall: number, thisYear: boolean, shade: number, dull: number, h: number, s: number, l: number, lift = 1): number[] {
  if (!thisYear) {
    const pale = 1 - sm(tOn + 0.03, tOn + 0.2, ph);
    if (pale > 0) { h -= 0.045 * pale; s = Math.min(1, s + 0.1 * pale); l *= 1 + 0.32 * pale; }
  }
  const P = fs.pal;
  if (P && ph > tTurn) {
    let c = sm(tTurn, tTurn + TURN, ph);
    // Forms that keep their leaves turn back to their summer colour before spring.
    if (!fs.drop) c *= 1 - sm(0.9, 0.995, ph);
    const brown = dull < P.brown;
    let th = brown ? 0.07 + 0.03 * shade : P.h0 + (P.h1 - P.h0) * shade;
    const ts = brown ? 0.42 : P.s * (0.85 + 0.3 * dull), tl = l * lift * (brown ? 0.8 : P.l * (0.85 + 0.3 * shade));
    // Shortest way round the hue circle (green to red goes through yellow).
    let dh = th - h; if (dh > 0.5) dh -= 1; else if (dh < -0.5) dh += 1;
    th = h + dh;
    // Hue leads, saturation and lightness follow: the half-turned leaf is a yellowish green, not a grey mix.
    const ch = sm(0, 0.75, c), cl = sm(0.15, 1, c);
    h = h + (th - h) * ch; s = s + (ts - s) * cl; l = l + (tl - l) * cl;
    if (fs.drop) {
      // Drying on the twig after it has turned: duller, a little darker.
      const dry = sm(tTurn + TURN, tFall + 0.02, ph) * 0.45;
      s *= 1 - 0.45 * dry; l *= 1 - 0.3 * dry;
    }
  }
  out3[0] = h - Math.floor(h); out3[1] = Math.min(1, Math.max(0, s)); out3[2] = l;
  return out3;
}

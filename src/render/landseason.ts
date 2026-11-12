/**
 * The landscape through the year: grass, wildflowers, ground and the far trees / hedgerows / woods. No three import.
 * Everything is a pure function of the year phase (`season.phase`; seasons off = midsummer), like the oak's leaves:
 * scrubbing to a date gives the same picture as waiting for it. Every function is exactly its summer value for
 * phases in [LAND_FLAT0, LAND_FLAT1] (which contains the seasons-off date 0.375), so the summer picture is unchanged
 * and nothing is rebaked for the season there.
 */
const sm = (a: number, b: number, x: number) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
const fr = (x: number) => x - Math.floor(x);

export const LAND_FLAT0 = 0.305, LAND_FLAT1 = 0.465;
/** Steps per year of the season-driven meadow rebake (300 s year at 1x: one rebake every 1.5 s outside summer). */
export const LAND_STEPS = 200;
/** Rebake key of a phase: constant through summer, else the phase in LAND_STEPS steps. */
export const landKey = (ph: number) => (ph >= LAND_FLAT0 && ph <= LAND_FLAT1 ? -1 : Math.round(ph * LAND_STEPS));

export interface LandSeason {
  /** Spring flush of the grass (fresh light green), 0..1. */
  fresh: number;
  /** Autumn yellowing toward straw, 0..1. */
  straw: number;
  /** Winter: dull straw-grey-green, 0..1. */
  winter: number;
  /** Grass height factor (short in winter, growing through spring). */
  height: number;
}
export function landSeason(ph: number, out: LandSeason): LandSeason {
  out.fresh = sm(0.015, 0.09, ph) * (1 - sm(0.2, 0.3, ph));
  out.straw = sm(0.47, 0.66, ph) * (1 - sm(0.76, 0.86, ph));
  out.winter = ph < 0.5 ? 1 - sm(0.015, 0.1, ph) : sm(0.74, 0.86, ph);
  const grow = ph < 0.5 ? sm(0.02, 0.2, ph) : 1 - sm(0.7, 0.86, ph);
  out.height = 0.5 + 0.5 * grow;
  return out;
}
/** Share of a wildflower species in bloom. `k`: 0 daisy (first), 0.5 buttercup, 1 clover, 2 poppy (high summer). None from mid-autumn to spring. */
export const bloom = (ph: number, k: number) => sm(0.035 + 0.03 * k, 0.17 + 0.045 * k, ph) * (1 - sm(0.47 + 0.02 * k, 0.6 + 0.02 * k, ph));

/** Colour factor of the ground material (multiplies its summer colour), written into `out` [r, g, b]. */
export function groundSeason(ph: number, out: number[]): number[] {
  const L = landSeason(ph, tmp), f = L.fresh, s = L.straw, w = L.winter;
  out[0] = (1 + 0.12 * f + 1.05 * s + 0.75 * w) * (1 - 0.2 * w);
  out[1] = (1 + 0.12 * f + 0.1 * s - 0.1 * w) * (1 - 0.2 * w);
  out[2] = (1 - 0.25 * f - 0.3 * s + 0.2 * w) * (1 - 0.2 * w);
  return out;
}
const tmp: LandSeason = { fresh: 0, straw: 0, winter: 0, height: 1 };

export interface TreeSeason {
  /** Size factor of the leafed crown card (0 = not drawn). */
  leaf: number;
  /** The bare crown card is drawn. */
  bare: boolean;
  /** Spring flush 0..1 (pale yellow-green). */
  pale: number;
  /** Autumn turn 0..1 and drying on the twig 0..1. */
  turn: number;
  dry: number;
  /** Autumn shade 0..1 (russet .. yellow) and whether this tree goes dull brown. */
  shade: number;
  brown: boolean;
}
/**
 * A far tree or bush at year phase `ph`. `hA`, `hB` = its two hashes, `g` = a smooth 0..1 noise at its place (stands
 * flush and turn roughly together), `bush` = hedgerow / shrub. Dates sit around the oak's own (leaf bud break 0.018..0.073,
 * turn 0.485..0.67, bare by 0.8): flush 0.02..0.10, turn 0.485..0.635, bare 0.565..0.785, so the oak is neither the
 * first nor the last. About one tree in nine is an evergreen (more inside conifer stands): summer state all year.
 */
export function treeSeason(ph: number, hA: number, hB: number, g: number, bush: boolean, out: TreeSeason): TreeSeason {
  const u3 = fr(hA * 13.7 + hB * 5.3), u4 = fr(hA * 91.7 + hB * 3.9);
  out.shade = fr(hB * 7.31 + hA * 3.1); out.brown = fr(hA * 57.3) < 0.22;
  if (u4 < (bush ? 0.05 : 0.07 + 0.5 * sm(0.66, 0.8, g))) { out.leaf = 1; out.bare = false; out.pale = out.turn = out.dry = 0; return out; }
  const tOn = 0.02 + 0.05 * hB + 0.03 * g, tTurn = 0.485 + 0.1 * u3 + 0.05 * g, tFall = tTurn + 0.08 + 0.07 * hA;
  out.leaf = ph >= tFall || ph <= tOn ? 0 : (0.72 + 0.28 * sm(tOn, tOn + 0.05, ph)) * (1 - 0.18 * sm(tFall - 0.03, tFall, ph));
  out.bare = ph < tOn + 0.05 || ph > tFall - 0.04;
  out.pale = 1 - sm(tOn + 0.03, tOn + 0.2, ph);
  out.turn = sm(tTurn, tTurn + 0.06, ph);
  out.dry = sm(tTurn + 0.06, tFall, ph);
  return out;
}

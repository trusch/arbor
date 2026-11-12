import type { ArborParams } from './params';

/**
 * Parameter automation over the tree's life. Two layers, applied every frame
 * before the sim steps:
 *  - Journey: keyframes (sim time → partial param snapshot), interpolated with
 *    smoothstep between neighbours (held constant outside the keyed range).
 *  - Drift: per-param smooth low-frequency noise around a base value.
 * Drift is applied on top of the journey value (or on top of the base value
 * captured when drift was enabled).
 *
 * Param paths are "group.field" for numeric fields of ArborParams.
 */

export type Snapshot = Record<string, number>;
export interface Keyframe { t: number; values: Snapshot }
export interface DriftCfg { on: boolean; rate: number; range: number; base: number; phase: number }

/** Groups/fields excluded from automation (structural / non-continuous). */
const EXCLUDE = new Set(['seed.seed', 'growth.maxNodes', 'growth.maxOrder', 'crown.attractors', 'time.speed', 'sky.dayLength']);

export function numericPaths(p: ArborParams): string[] {
  const out: string[] = [];
  const groups = p as unknown as Record<string, Record<string, unknown>>;
  for (const g of Object.keys(groups)) {
    for (const f of Object.keys(groups[g])) {
      const k = `${g}.${f}`;
      if (typeof groups[g][f] === 'number' && !EXCLUDE.has(k)) out.push(k);
    }
  }
  return out;
}

export function getPath(p: ArborParams, k: string): number {
  const [g, f] = k.split('.');
  return (p as unknown as Record<string, Record<string, number>>)[g][f];
}
export function setPath(p: ArborParams, k: string, v: number) {
  const [g, f] = k.split('.');
  (p as unknown as Record<string, Record<string, number>>)[g][f] = v;
}

const smooth = (x: number) => x * x * (3 - 2 * x);

/** 1D value noise from a few incommensurate sines: smooth, bounded to ~[-1, 1]. */
function noise1(t: number, ph: number) {
  return (Math.sin(t * 1.0 + ph) * 0.5 + Math.sin(t * 0.537 + ph * 2.3) * 0.3 + Math.sin(t * 0.231 + ph * 4.1) * 0.2);
}

export class Automation {
  journey: Keyframe[] = [];
  journeyOn = true;
  drift: Record<string, DriftCfg> = {};
  /** Hue-like params wrap; everything else is clamped to >= 0 where the base is >= 0. */
  private wrap = new Set(['leaves.hue', 'leaves.glowHue', 'sky.skyHue', 'sky.sunHue', 'sky.sun2Hue', 'sky.groundHue']);

  constructor(private p: ArborParams) {}

  addKeyframe(t: number, paths = numericPaths(this.p)) {
    const values: Snapshot = {};
    for (const k of paths) values[k] = getPath(this.p, k);
    this.journey = this.journey.filter((kf) => Math.abs(kf.t - t) > 0.25);
    this.journey.push({ t, values });
    this.journey.sort((a, b) => a.t - b.t);
  }

  clearJourney() { this.journey = []; }

  setDrift(k: string, on: boolean, rate = 0.05, range = 0.3) {
    const d = this.drift[k] ?? (this.drift[k] = { on: false, rate, range, base: getPath(this.p, k), phase: Math.random() * 100 });
    if (on && !d.on) d.base = getPath(this.p, k);
    if (!on && d.on) setPath(this.p, k, d.base);
    d.on = on;
    d.rate = rate;
    d.range = range;
  }

  /**
   * A value set by hand wins: write it, drop the path from every journey keyframe and stop its drift
   * (without snapping back to the old drift base). Works for any "group.field", numeric or not.
   */
  userSet(k: string, v: number | boolean | string) {
    const [g, f] = k.split('.');
    (this.p as unknown as Record<string, Record<string, unknown>>)[g][f] = v;
    for (const kf of this.journey) delete kf.values[k];
    this.journey = this.journey.filter((kf) => Object.keys(kf.values).length > 0);
    const d = this.drift[k];
    if (d) { d.on = false; d.base = typeof v === 'number' ? v : d.base; }
  }

  /** True while journey or drift is writing this path every step. */
  drives(k: string): 'drift' | 'journey' | null {
    if (this.drift[k]?.on) return 'drift';
    if (this.journeyOn && this.journey.filter((kf) => k in kf.values).length >= 2) return 'journey';
    return null;
  }

  /** Journey value for path k at sim time t, or undefined if the journey does not key it. */
  private journeyValue(k: string, t: number): number | undefined {
    const kfs = this.journey.filter((kf) => k in kf.values);
    if (!this.journeyOn || kfs.length < 2) return kfs.length === 1 && this.journeyOn ? undefined : undefined;
    if (t <= kfs[0].t) return kfs[0].values[k];
    for (let i = 0; i < kfs.length - 1; i++) {
      const a = kfs[i], b = kfs[i + 1];
      if (t <= b.t) {
        const x = smooth((t - a.t) / Math.max(1e-6, b.t - a.t));
        return a.values[k] + (b.values[k] - a.values[k]) * x;
      }
    }
    return kfs[kfs.length - 1].values[k];
  }

  /** Apply journey + drift for sim time t (sim seconds). */
  apply(t: number) {
    const keyed = new Set<string>();
    if (this.journeyOn && this.journey.length >= 2) for (const kf of this.journey) for (const k of Object.keys(kf.values)) keyed.add(k);
    for (const k of keyed) {
      const v = this.journeyValue(k, t);
      if (v !== undefined) setPath(this.p, k, v);
    }
    for (const [k, d] of Object.entries(this.drift)) {
      if (!d.on) continue;
      const base = keyed.has(k) ? getPath(this.p, k) : d.base;
      // range is relative to |base| (absolute for hues / near-zero bases).
      const span = this.wrap.has(k) || Math.abs(base) < 0.05 ? d.range : Math.abs(base) * d.range;
      let v = base + span * noise1(t * d.rate * 2 * Math.PI, d.phase);
      if (this.wrap.has(k)) v = ((v % 1) + 1) % 1;
      else if (base >= 0) v = Math.max(0, v);
      setPath(this.p, k, v);
    }
  }
}

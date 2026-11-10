// Self-bisecting leaf variant ladder (see LEAF_VARIANTS in render/leaves.ts).
// Bad variants (a context loss while they were active) persist in localStorage per GPU string.
// ?leafvariant=N forces a variant; ?ladder=1 walks V4 → V0, 20 s of leaf rendering each, reloading after a loss.
import { LEAF_VARIANTS } from './render/leaves';
import { tel } from './tel';

/** Highest variant allowed by default on PowerVR (raise once the ladder proves the next one GOOD on the phone). */
export const LEAF_SAFE_LEVEL = 0;
const LADDER_S = 20;
const badKey = (gpu: string) => 'arbor.leafBad.' + gpu;
const LADDER_KEY = 'arbor.ladder';

interface LadderState { gpu: string; idx: number; results: Record<number, 'GOOD' | 'BAD'> }

function load<T>(k: string, d: T): T { try { const s = localStorage.getItem(k); return s ? (JSON.parse(s) as T) : d; } catch { return d; } }
function save(k: string, v: unknown) { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* private mode */ } }

export function badVariants(gpu: string): number[] { return load<number[]>(badKey(gpu), []); }
function markBad(gpu: string, v: number) { const b = badVariants(gpu); if (!b.includes(v)) save(badKey(gpu), [...b, v]); }

/** Ladder run active (?ladder=1 starts a fresh one; it continues across its own reloads until done). */
export function ladderState(query: URLSearchParams, gpu: string): LadderState | null {
  if (query.get('ladder') !== '1') return null;
  let st = load<LadderState | null>(LADDER_KEY, null);
  if (!st || st.gpu !== gpu || query.get('ladderfresh') !== '0') {
    st = { gpu, idx: LEAF_VARIANTS.length - 1, results: {} };
    save(LADDER_KEY, st);
    // Strip the fresh-start marker so the run's own reloads continue instead of restarting.
    const u = new URL(location.href); u.searchParams.set('ladderfresh', '0'); history.replaceState(null, '', u);
  }
  return st;
}

/** Variant to use and why. */
export function pickVariant(query: URLSearchParams, gpu: string, ladder: LadderState | null): { variant: number; why: string } {
  const max = LEAF_VARIANTS.length - 1;
  if (ladder) return { variant: Math.max(0, Math.min(max, ladder.idx)), why: 'ladder' };
  const q = query.get('leafvariant');
  if (q !== null && /^\d+$/.test(q) && Number(q) <= max) return { variant: Number(q), why: 'forced' };
  const bad = badVariants(gpu);
  for (let v = Math.min(LEAF_SAFE_LEVEL, max); v >= 0; v--) if (!bad.includes(v)) return { variant: v, why: 'best-not-bad' };
  return { variant: 0, why: 'all-bad-fallback' };
}

/** Context loss while a variant was active: mark it BAD; in a ladder run advance and reload right away. Returns true if handled. */
export function onLeafContextLoss(gpu: string, variant: number, ladder: LadderState | null): boolean {
  markBad(gpu, variant);
  tel.log('leaf_variant_result', { variant, name: LEAF_VARIANTS[variant].name, result: 'BAD', gpu, ladder: !!ladder });
  if (!ladder) return false;
  ladder.results[variant] = 'BAD';
  ladder.idx = variant - 1;
  save(LADDER_KEY, ladder);
  setTimeout(() => location.reload(), 300);
  return true;
}

/** Per frame in a ladder run: after LADDER_S of leaf rendering mark GOOD and move on. */
export function ladderTick(ladder: LadderState, variant: number, dt: number, leavesDrawn: boolean, show: (s: string) => void) {
  const st = ladder as LadderState & { t?: number };
  if (ladder.idx < 0) return;
  if (leavesDrawn) st.t = (st.t ?? 0) + dt;
  const t = st.t ?? 0;
  show(`Leaf ladder: ${LEAF_VARIANTS[variant].name}  ${Math.min(LADDER_S, t).toFixed(0)}/${LADDER_S} s  `
    + `results ${JSON.stringify(ladder.results)}`);
  if (t < LADDER_S) return;
  ladder.results[variant] = 'GOOD';
  tel.log('leaf_variant_result', { variant, name: LEAF_VARIANTS[variant].name, result: 'GOOD', gpu: ladder.gpu, ladder: true });
  ladder.idx = variant - 1;
  delete st.t;
  save(LADDER_KEY, ladder);
  if (ladder.idx >= 0) location.reload();
  else {
    tel.log('leaf_ladder_done', { gpu: ladder.gpu, results: ladder.results, bad: badVariants(ladder.gpu) });
    show(`Leaf ladder done: ${JSON.stringify(ladder.results)}. You can close this tab.`);
  }
}

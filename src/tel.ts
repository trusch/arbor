/** Thin typed wrapper over the classic telemetry script (public/telemetry.js); no-ops when it is absent. */
type Tel = {
  log(type: string, data?: Record<string, unknown>): void;
  phase(name: string, frequent?: boolean): void;
  setStats(fn: () => Record<string, unknown>): void;
  info(o: Record<string, unknown>): void;
  glInfo?(gl: WebGLRenderingContext | WebGL2RenderingContext): Record<string, unknown>;
};
const g = globalThis as unknown as { __tel?: Tel };
export const tel = {
  log: (type: string, data?: Record<string, unknown>) => g.__tel?.log(type, data),
  /** Mark the step about to run. Non-frequent phases are persisted immediately (survive a hard tab kill). */
  phase: (name: string, frequent = false) => g.__tel?.phase(name, frequent),
  setStats: (fn: () => Record<string, unknown>) => g.__tel?.setStats(fn),
  info: (o: Record<string, unknown>) => g.__tel?.info(o),
  glInfo: (gl: WebGLRenderingContext | WebGL2RenderingContext) => g.__tel?.glInfo?.(gl) ?? {},
};

/** Bisect switches from the query string (see diag.html). ?safe=1 turns everything off. */
export function diagSwitches(q: URLSearchParams) {
  const safe = q.get('safe') === '1';
  const off = (k: string) => safe || q.get(k) === '0';
  const hz = Number(q.get('rebuildHz'));
  return {
    safe,
    shadows: !off('shadows'),
    leaves: !off('leaves'),
    skyBasic: safe || q.get('sky') === 'basic',
    grow: !off('grow'),
    antialias: !off('antialias'),
    /** Branch-mesh rebuild rate while growing (default ~8 Hz). */
    rebuildHz: Number.isFinite(hz) && hz > 0 ? hz : 0,
  };
}
export type DiagSwitches = ReturnType<typeof diagSwitches>;

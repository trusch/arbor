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
    /** ?meadow=0: no grass tufts / wildflowers (WP3). */
    meadow: !off('meadow'),
    /** ?rain=0: no rain sheets and no lightning bolt plane (storm light, sky and wind stay). */
    rain: !off('rain'),
    /** ?breakage=0: no wind breakage (limbs never snap; dev hooks still work). */
    breakage: !off('breakage'),
    /** ?sway=0: wood and leaves do not move with the wind (rest pose). */
    sway: !off('sway'),
    /** ?leaffall=0: no falling leaves and no leaf litter. */
    leaffall: !off('leaffall'),
    /** ?backdrop=0: the old background (level ground disc, single hill ring, meadow ending at 26 m). */
    backdrop: !off('backdrop'),
    skyBasic: safe || q.get('sky') === 'basic',
    grow: !off('grow'),
    antialias: !off('antialias'),
    /** Safe leaf path: true/false when forced by ?leafsafe=1/0, null = auto (PowerVR, mobile Low, previous context loss). */
    leafSafe: safe || q.get('leafsafe') === '1' ? true : q.get('leafsafe') === '0' ? false : null,
    /** ?leafshadow=0: leaves neither cast nor receive shadows (any shader). null = mode default. */
    leafShadow: q.get('leafshadow') === '0' ? false : q.get('leafshadow') === '1' ? true : null,
    /** ?leafshader=basic|safe|full forces the leaf shader. */
    leafShader: (['basic', 'safe', 'full'] as const).find((k) => q.get('leafshader') === k) ?? null,
    /** Branch-mesh rebuild rate while growing (default ~8 Hz). */
    rebuildHz: Number.isFinite(hz) && hz > 0 ? hz : 0,
  };
}
export type DiagSwitches = ReturnType<typeof diagSwitches>;

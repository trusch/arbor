/**
 * Info overlay ("almanac"): one always-on instrument. A strip of three parts (day dial + clock, year ring + season and year,
 * weather = `#wx`), a quieter tree line under it, and a card of numbers that a tap on the strip opens. DOM and CSS only:
 * the SVGs are built once and only attributes / text change, at the 2 Hz of the status tick. No canvas reads, no WebGL.
 * Modes (More tab, `localStorage['arbor.hud']`): full (strip + tree line), compact (strip only), off.
 */
import './hud.css';

export type HudMode = 'full' | 'compact' | 'off';
export interface HudState {
  /** Hour 0..24, sunrise and sunset hours, sun elevation (sin), moon elevation (sin), moon phase 0..1 (0 new, 0.5 full). */
  hour: number; rise: number; set: number; sunH: number; moonH: number; moonPhase: number;
  /** Seasons on, year phase 0..1 (0 = start of spring; spring / summer / autumn / winter start at `marks`), season name, year. */
  seasons: boolean; phase: number; marks: [number, number, number]; season: string; year: number; yearLength: number;
  /** Tree: name, sim seconds, height / crown width / trunk girth in m, twigs, leaves, share of the crown in leaf, limbs lost. */
  name: string; age: number; height: number; width: number; girth: number; nodes: number; leaves: number; leafOn: number; limbs: number;
  /** Growth over years (`sim.years` > 0): true between two growing seasons, while more growth is to come. */
  resting?: boolean;
  grown: boolean; paused: boolean; speed: number; blossom: boolean; evergreen: boolean;
  /** Day cycle running; wind in m/s. */
  cycle: boolean; windMs: number;
}

const KEY = 'arbor.hud', KEY_OPEN = 'arbor.hud.open';
const store = (k: string, v?: string) => { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch { /* private mode */ } return null; };
let mode: HudMode = (['full', 'compact', 'off'] as const).find((m) => m === store(KEY)) ?? 'full';
const applyMode = () => { document.body.classList.toggle('hud-off', mode === 'off'); document.body.classList.toggle('hud-compact', mode === 'compact'); };
export const hudMode = () => mode;
export function setHudMode(m: HudMode) { mode = m; store(KEY, m); applyMode(); }

const hm = (h: number) => { const t = ((Math.round(h * 60) % 1440) + 1440) % 1440; return `${String(Math.floor(t / 60)).padStart(2, '0')}:${String(t % 60).padStart(2, '0')}`; };
export function dayPart(hour: number, rise: number, set: number): string {
  if (hour < rise - 0.9 || hour > set + 0.9) return 'Night';
  if (hour < rise + 0.6) return 'Dawn';
  if (hour > set - 0.6) return 'Dusk';
  if (hour < 11.25) return 'Morning';
  if (hour < 13) return 'Midday';
  if (hour < set - 2.2) return 'Afternoon';
  return 'Evening';
}
export function moonName(p: number): string {
  return ['New moon', 'Waxing crescent', 'First quarter', 'Waxing gibbous', 'Full moon', 'Waning gibbous', 'Last quarter', 'Waning crescent'][Math.round((((p % 1) + 1) % 1) * 8) % 8];
}
/** The lit part of a moon disc of radius r around (0, 0): 0 new, 0.25 first quarter (lit on the right), 0.5 full. */
export function moonPath(p: number, r: number): string {
  const rx = (Math.abs(Math.cos(2 * Math.PI * p)) * r).toFixed(2), wax = p < 0.5, gib = p > 0.25 && p < 0.75;
  return `M0 ${-r}A${r} ${r} 0 0 ${wax ? 1 : 0} 0 ${r}A${rx} ${r} 0 0 ${wax === gib ? 1 : 0} 0 ${-r}Z`;
}
/** What the tree is doing right now, in a short phrase. */
export function doing(s: HudState): string {
  const still = s.grown || !!s.resting;
  if (!s.seasons) return still ? 'holding its crown' : s.paused ? 'waiting' : s.age < 12 ? 'a seedling reaching up' : 'putting on wood';
  const ph = s.phase, [su, au, wi] = s.marks;
  if (s.evergreen) return ph >= wi ? 'evergreen, resting' : ph < su ? 'new shoots' : still ? 'holding its crown' : 'putting on wood';
  if (ph >= wi || (ph > au && s.leafOn < 0.03)) return 'dormant';
  if (ph < 0.02) return 'buds swelling';
  if (s.blossom && ph > 0.025 && ph < 0.1) return 'in bloom';
  if (ph < su && s.leafOn < 0.97) return 'leaves unfolding';
  if (ph < au - 0.03) return still ? 'in full leaf' : s.age < 12 ? 'a seedling reaching up' : 'in full leaf, putting on wood';
  if (s.leafOn > 0.9) return 'leaves turning';
  return 'leaves falling';
}
export function treeState(s: HudState): string {
  if (s.grown) return 'fully grown';
  if (s.paused || s.speed <= 0) return 'paused';
  if (s.seasons && !s.evergreen && (s.phase >= s.marks[2] || (s.phase > s.marks[1] && s.leafOn < 0.03))) return 'resting for winter';
  // Growth over years: between two growing seasons the wood is at rest (also an evergreen's).
  if (s.resting) return s.seasons && s.phase < s.marks[1] - 0.03 && s.phase > 0.02 ? 'resting until spring' : 'resting for winter';
  return 'growing';
}
const num = (v: number, d = 1) => (v >= 100 ? v.toFixed(0) : v.toFixed(d));
const len = (m: number) => (m < 1 ? `${Math.round(m * 100)} cm` : `${num(m)} m`);
function age(s: HudState): string {
  if (!s.seasons) return `${s.age.toFixed(0)} s`;
  const y = s.age / Math.max(10, s.yearLength);
  if (y < 1) return `${Math.max(1, Math.round(y * 12))} mo`;
  // From the first birthday on: whole years and months ("2 years 4 months"), as one says a tree's age.
  const mo = Math.floor(y * 12 + 1e-6), yy = Math.floor(mo / 12), m = mo % 12;
  return `${yy} ${yy === 1 ? 'year' : 'years'}${m ? ` ${m} ${m === 1 ? 'month' : 'months'}` : ''}`;
}

const CARD: [string, string][] = [['doing', 'Right now'], ['girth', 'Trunk girth'], ['crown', 'Crown width'], ['twigs', 'Twigs'], ['leaves', 'Leaves'], ['limbs', 'Limbs lost to storms'],
  ['lived', 'Lived'], ['moon', 'Moon'], ['sun', 'Sunrise / sunset'], ['wind', 'Wind']];

/** Builds the overlay around the existing `#wx` element (which keeps its id and children). Returns the 2 Hz update. */
export function mountHud(wx: HTMLElement): (s: HudState) => void {
  const root = document.createElement('div');
  root.id = 'arbor-hud'; root.className = 'hud';
  root.innerHTML = `<button type="button" id="arbor-hud-strip" class="hud-strip" aria-expanded="false" aria-controls="arbor-hud-card" title="Show or hide more numbers">
<span class="hud-seg hud-day"><svg class="hud-dial" viewBox="0 0 48 30" aria-hidden="true">
<path class="hud-sky" d="M5 23A19 19 0 0 1 43 23Z"/><path class="hud-arc" d="M5 23A19 19 0 0 1 43 23"/>
<path class="hud-tick" d="M24 4v3M10.6 9.6l1.8 1.8M37.400 9.600l-1.800 1.800"/>
<rect class="hud-ground" x="1" y="23" width="46" height="6" rx="2"/><path class="hud-horizon" d="M1 23H47"/>
<g class="hud-sun"><circle r="4.2"/><path d="M0 -6.800v-1.800M-5.900 -3.400l-1.500 -.9M5.900 -3.400l1.500 -.9M-6.800 0h-1.800M6.800 0h1.800"/></g>
<g class="hud-moon"><circle r="4.200"/><path/></g></svg>
<span class="hud-txt"><b class="hud-clock"></b><i class="hud-part"></i></span></span>
<span class="hud-seg hud-year"><svg class="hud-ring" viewBox="0 0 32 32" aria-hidden="true">
<g fill="none" stroke-width="5" transform="rotate(-90 16 16)"><circle class="hud-q" cx="16" cy="16" r="11" pathLength="1"/><circle class="hud-q" cx="16" cy="16" r="11" pathLength="1"/><circle class="hud-q" cx="16" cy="16" r="11" pathLength="1"/><circle class="hud-q" cx="16" cy="16" r="11" pathLength="1"/></g>
<g class="hud-mark"><path d="M16 1.500v9"/><circle cx="16" cy="5" r="3.400"/></g></svg>
<span class="hud-txt"><b class="hud-season"></b><i class="hud-yr"></i></span></span>
<span class="hud-seg hud-wx"></span></button>
<div class="hud-tree" id="arbor-hud-tree"></div>
<dl class="hud-card" id="arbor-hud-card" hidden>${CARD.map(([k, l]) => `<div><dt>${l}</dt><dd data-k="${k}"></dd></div>`).join('')}</dl>`;
  root.id = 'arbor-hud';
  const q = <T extends Element>(s: string) => root.querySelector(s) as T;
  const strip = q<HTMLButtonElement>('.hud-strip'), card = q<HTMLElement>('.hud-card'), tree = q<HTMLElement>('.hud-tree');
  // `#wx` moves into the strip: two lines (sky / temperature and wind), same children as before.
  q<HTMLElement>('.hud-wx').append(wx);
  document.body.append(root);
  const body = document.createElement('span'); body.id = 'arbor-hud-body'; body.hidden = true; root.append(body); // machine-readable copy (dataset) for scripts
  const sun = q<SVGGElement>('.hud-sun'), moon = q<SVGGElement>('.hud-moon'), moonLit = moon.querySelector('path')!, dial = q<SVGElement>('.hud-dial');
  const mark = q<SVGGElement>('.hud-mark'), quarters = [...root.querySelectorAll<SVGCircleElement>('.hud-q')];
  const cells: Record<string, HTMLElement> = {};
  for (const dd of root.querySelectorAll<HTMLElement>('dd')) cells[dd.dataset.k!] = dd;
  const txt = { clock: q<HTMLElement>('.hud-clock'), part: q<HTMLElement>('.hud-part'), season: q<HTMLElement>('.hud-season'), yr: q<HTMLElement>('.hud-yr') };
  /** Writes only on change: an unchanged frame touches no DOM. */
  const last: Record<string, string> = {};
  const put = (k: string, v: string, f: (v: string) => void) => { if (last[k] !== v) { last[k] = v; f(v); } };
  const text = (k: string, el: HTMLElement, v: string) => put(k, v, (x) => (el.textContent = x));

  let open = store(KEY_OPEN) === '1';
  const applyOpen = () => { strip.setAttribute('aria-expanded', String(open)); card.hidden = !open; root.classList.toggle('open', open); };
  strip.addEventListener('click', () => { open = !open; store(KEY_OPEN, open ? '1' : '0'); applyOpen(); });
  applyOpen(); applyMode();
  // The camera buttons sit right under the instrument: its height is published once per size change (no per-frame layout read).
  new ResizeObserver(() => document.documentElement.style.setProperty('--hud-h', `${root.offsetHeight}px`)).observe(root);

  // Days and nights lived: sunrises and sunsets the tree has seen (a hand-moved clock does not count).
  let days = 0, nights = 0, prevHour = NaN, prevAge = 0, marksKey = '';
  return (s) => {
    if (s.age < prevAge) { days = 0; nights = 0; }
    if (s.cycle && !s.paused && s.age > prevAge && Number.isFinite(prevHour)) {
      const d = (s.hour - prevHour + 24) % 24;
      if (d > 0 && d < 1.5) { if ((s.rise - prevHour + 24) % 24 < d) days++; if ((s.set - prevHour + 24) % 24 < d) nights++; }
    }
    prevHour = s.hour; prevAge = s.age;
    // ---- day dial: the sun runs along the arc from sunrise (left) to sunset (right), and under the horizon at night.
    const dayLen = s.set - s.rise, isDay = s.hour >= s.rise && s.hour <= s.set;
    const f = isDay ? (s.hour - s.rise) / dayLen : ((s.hour - s.set + 24) % 24) / (24 - dayLen);
    const a = Math.PI * f, sx = isDay ? 24 - 19 * Math.cos(a) : 24 + 19 * Math.cos(a), sy = isDay ? 23 - 19 * Math.sin(a) : 23 + 4.5 * Math.sin(a);
    put('sun', `translate(${sx.toFixed(1)} ${sy.toFixed(1)})`, (v) => sun.setAttribute('transform', v));
    // The moon trails the sun by its phase: same arc, its own hour.
    const mh = (s.hour - s.moonPhase * 24 + 48) % 24, mUp = s.moonH > 0 && mh >= s.rise && mh <= s.set && s.sunH < 0.05;
    const ma = (Math.PI * (mh - s.rise)) / dayLen;
    put('moon', mUp ? `translate(${(24 - 19 * Math.cos(ma)).toFixed(1)} ${(23 - 19 * Math.sin(ma)).toFixed(1)})` : '', (v) => { moon.style.display = v ? '' : 'none'; if (v) moon.setAttribute('transform', v); });
    put('lit', moonPath(s.moonPhase, 4.2), (v) => moonLit.setAttribute('d', v));
    const sky = s.sunH > 0.12 ? 'day' : s.sunH > -0.16 ? 'twilight' : 'night';
    put('sky', sky, (v) => (dial.dataset.sky = v));
    const part = dayPart(s.hour, s.rise, s.set);
    text('clock', txt.clock, hm(s.hour)); text('part', txt.part, part);
    // ---- year ring: four season arcs (spring starts at the top, clockwise) and a marker at today's date.
    const mk = s.marks.join();
    if (mk !== marksKey) {
      marksKey = mk;
      const b = [0, ...s.marks, 1];
      quarters.forEach((c, i) => { c.setAttribute('stroke-dasharray', `${(b[i + 1] - b[i] - 0.012).toFixed(3)} 1`); c.setAttribute('stroke-dashoffset', (-b[i] - 0.006).toFixed(3)); c.dataset.s = String(i); });
    }
    put('mark', `rotate(${(s.phase * 360).toFixed(1)} 16 16)`, (v) => mark.setAttribute('transform', v));
    put('seasons', String(s.seasons), (v) => root.classList.toggle('no-seasons', v === 'false'));
    text('season', txt.season, s.seasons ? s.season : 'Endless summer'); text('yr', txt.yr, s.seasons ? `Year ${s.year}` : `Age ${s.age.toFixed(0)} s`);
    // ---- tree line and card
    const state = treeState(s), sp = s.speed !== 1 && !s.paused && s.speed > 0 ? ` · ${+s.speed.toFixed(2)}x` : '';
    text('tree', tree, `${s.name} · ${age(s)} · ${len(s.height)} · ${state}${sp}`);
    put('state', state, (v) => (tree.dataset.state = v));
    const what = doing(s);
    if (open) {
      text('doing', cells.doing, what); text('girth', cells.girth, len(s.girth)); text('crown', cells.crown, len(s.width));
      text('twigs', cells.twigs, s.nodes.toLocaleString('en')); text('leaves', cells.leaves, s.leaves.toLocaleString('en')); text('limbs', cells.limbs, String(s.limbs));
      text('lived', cells.lived, s.cycle || days + nights ? `${days} ${days === 1 ? 'day' : 'days'}, ${nights} ${nights === 1 ? 'night' : 'nights'}` : 'clock stopped');
      text('moonc', cells.moon, moonName(s.moonPhase)); text('sunc', cells.sun, `${hm(s.rise)} / ${hm(s.set)}`); text('wind', cells.wind, `${s.windMs.toFixed(1)} m/s`);
    }
    const label = `${hm(s.hour)}, ${part.toLowerCase()}. ${s.seasons ? `${s.season}, year ${s.year}` : 'Seasons off'}. ${wx.getAttribute('aria-label') ?? ''}`;
    put('aria', label, (v) => strip.setAttribute('aria-label', v));
    const D = body.dataset;
    D.clock = hm(s.hour); D.part = part; D.sky = sky; D.body = isDay ? 'sun' : mUp ? 'moon' : 'none'; D.sunX = sx.toFixed(1); D.sunY = sy.toFixed(1); D.season = s.season; D.year = String(s.year);
    D.phase = s.phase.toFixed(3); D.moon = moonName(s.moonPhase); D.state = state; D.doing = what; D.days = String(days); D.nights = String(nights);
  };
}

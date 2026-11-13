/**
 * Start screen: a randomised but plausible tree proposal, shown over the live scene before anything grows.
 * DOM + CSS only (no shader, material or render pass; no backdrop-filter). See CLAUDE.md "Start screen".
 */
import './start.css';
import { defaultParams, applyQueryOverrides, type ArborParams } from './params';
import type { Automation } from './automation';
import { PRESETS } from './presets';
import { LEAF_FORMS, leafForm, leafFormCanvas } from './render/textures';

/** Query keys that say nothing about the tree (link decorations): the start screen still shows. */
const JUNK = /^(utm_|fbclid$|gclid$|ref$|source$|start$|roll$)/;

/** Show the screen on a plain visit; any other query key (a deep link, a script) or `?start=0` goes straight to growing. `?start=1` forces it. */
export function wantsStartScreen(q: URLSearchParams): boolean {
  const s = q.get('start');
  if (s === '0') return false;
  if (s === '1') return true;
  for (const k of q.keys()) if (!JUNK.test(k)) return false;
  return true;
}

export interface Proposal {
  name: string;
  /** Earth kinds: the habit word; the title follows the chosen leaf form ("Broad maple"). */
  adj?: string;
  blurb: string;
  alien: boolean;
  /** "group.field" → value, on top of `defaultParams()`. */
  values: Record<string, number | string>;
}

type Rng = () => number;
function mulberry(a: number): Rng {
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Tree groups a proposal owns (reset to defaults before its values are written), and the sky fields it may set. */
const TREE_GROUPS = ['growth', 'crown', 'thickness', 'leaves', 'light'] as const;
const SKY_FIELDS = ['timeOfDay', 'latitude', 'fog', 'stars', 'skyHue', 'skyTint', 'sunHue', 'sunTint', 'sun2', 'sun2Hue', 'sun2Yaw', 'sunSize', 'groundHue', 'groundTint'];

interface Kind {
  w: number;
  alien?: boolean;
  make(r: (lo: number, hi: number) => number, pick: <T>(a: T[]) => T): { name: string; adj?: string; blurb: string; v: Record<string, number | string> };
}
const flat = (name: string): Record<string, number | string> => {
  const out: Record<string, number | string> = {};
  for (const [g, vals] of Object.entries(PRESETS[name].params)) for (const [f, v] of Object.entries(vals as Record<string, number | string>)) out[`${g}.${f}`] = v;
  return out;
};
const FORM_NAME: Record<string, string> = { oak: 'oak', maple: 'maple', round: 'linden', birch: 'birch', ginkgo: 'ginkgo', willow: 'willow', spray: 'cypress' };

/**
 * The kinds a roll draws from. Earth kinds (80 %) jitter around the oak default and the cypress / willow presets inside
 * ranges those presets already span; alien kinds (20 %) are the four world presets with a small jitter.
 */
const KINDS: Kind[] = [
  { w: 22, make: (r, pick) => {
    const form = pick(['oak', 'oak', 'oak', 'maple', 'round']);
    return { adj: 'Broad', name: `Broad ${FORM_NAME[form]}`, blurb: 'A full, rounded crown on a sturdy trunk.', v: {
      'crown.shape': r(0, 0.3), 'crown.height': r(5.6, 7.4), 'crown.radius': r(3.2, 4.3), 'crown.base': r(2.1, 2.7), 'crown.bole': r(1.4, 1.9),
      'growth.branchAngle': r(38, 50), 'growth.wander': r(0.25, 0.4),
      'leaves.form': form, 'leaves.hue': r(0.24, 0.31), 'leaves.saturation': r(0.46, 0.6), 'leaves.lightness': r(0.92, 1.08), 'leaves.size': r(0.145, 0.165),
    } };
  } },
  { w: 14, make: (r, pick) => {
    const form = pick(['birch', 'birch', 'ginkgo']);
    return { adj: 'Slender', name: `Slender ${FORM_NAME[form]}`, blurb: 'Tall and airy, with a light, narrow crown.', v: {
      'crown.shape': r(0, 0.35), 'crown.height': r(7.4, 9.2), 'crown.radius': r(2.3, 2.9), 'crown.base': r(2.4, 3.1), 'crown.bole': r(1.9, 2.5),
      'growth.branchAngle': r(30, 40), 'growth.apicalDominance': r(0.58, 0.7), 'growth.weeping': r(0.15, 0.45), 'growth.straightness': r(1.6, 2),
      'leaves.form': form, 'leaves.hue': r(0.24, 0.3), 'leaves.saturation': r(0.48, 0.6), 'leaves.lightness': r(1.04, 1.18), 'leaves.size': r(0.14, 0.16),
    } };
  } },
  { w: 13, make: (r) => ({ name: 'Weeping willow', blurb: 'Long shoots that hang down in curtains.', v: {
    ...flat('Weeping willow'),
    'growth.weeping': r(1.25, 1.7), 'growth.sag': r(1.8, 2.4), 'crown.radius': r(4, 5), 'crown.height': r(5.4, 6.6), 'crown.base': r(2, 2.5),
    'leaves.hue': r(0.2, 0.26), 'leaves.saturation': r(0.45, 0.56), 'leaves.lightness': r(1.05, 1.2),
  } }) },
  { w: 12, make: (r) => ({ name: 'Columnar cypress', blurb: 'A dark, narrow spire reaching straight up.', v: {
    ...flat('Windswept cypress'),
    'crown.radius': r(1.35, 1.9), 'crown.height': r(8.8, 10.8), 'crown.base': r(0.8, 1.2), 'growth.branchAngle': r(20, 27),
    'leaves.hue': r(0.3, 0.36), 'leaves.saturation': r(0.33, 0.42), 'leaves.lightness': r(0.76, 0.9),
  } }) },
  { w: 11, make: (r, pick) => {
    const form = pick(['maple', 'round', 'ginkgo', 'oak']);
    return { adj: 'Spreading', name: `Spreading ${FORM_NAME[form]}`, blurb: 'A wide parasol of a crown over a clear trunk.', v: {
      'crown.shape': r(1.5, 2), 'crown.height': r(4.4, 5.4), 'crown.radius': r(4.7, 5.7), 'crown.base': r(2.6, 3.2), 'crown.bole': r(2, 2.5),
      'growth.branchAngle': r(54, 66), 'growth.scaffoldBranching': r(0.6, 0.9), 'growth.vigorDecay': r(0.83, 0.86), 'thickness.rootFlare': r(1.6, 2.2),
      'leaves.form': form, 'leaves.hue': r(0.22, 0.3), 'leaves.saturation': r(0.48, 0.6), 'leaves.lightness': r(0.95, 1.1), 'leaves.size': r(0.15, 0.18),
    } };
  } },
  { w: 8, make: (r, pick) => {
    const form = pick(['ginkgo', 'maple', 'birch']);
    return { adj: 'Young', name: `Young ${FORM_NAME[form]}`, blurb: 'A neat cone that tapers to a point.', v: {
      'crown.shape': r(0.7, 1), 'crown.height': r(7, 8.8), 'crown.radius': r(2.7, 3.4), 'crown.base': r(1.6, 2.2), 'crown.bole': r(1.1, 1.6),
      'growth.branchAngle': r(40, 52), 'growth.apicalDominance': r(0.6, 0.75),
      'leaves.form': form, 'leaves.hue': r(0.2, 0.27), 'leaves.saturation': r(0.5, 0.62), 'leaves.lightness': r(1.02, 1.15), 'leaves.size': r(0.145, 0.165),
    } };
  } },
  { w: 5, alien: true, make: (r) => ({ name: 'Low-gravity alien', blurb: 'A tall spiral with giant fronds, under two suns.', v: {
    ...flat('Low-gravity alien'), 'growth.gravity': r(0.15, 0.3), 'growth.torsion': r(10, 16), 'crown.height': r(10.5, 12.5), 'leaves.hue': r(0.42, 0.52),
  } }) },
  { w: 5, alien: true, make: (r) => ({ name: 'Crimson world', blurb: 'A red, twisting umbrella under a teal sky.', v: {
    ...flat('Crimson world'), 'growth.torsion': r(-14, -8), 'crown.radius': r(5.6, 6.8), 'leaves.hue': r(0.92, 1.0), 'leaves.saturation': r(0.7, 0.85),
  } }) },
  { w: 5, alien: true, make: (r) => ({ name: 'Bioluminescent night', blurb: 'Glowing spirals under a field of stars.', v: {
    ...flat('Bioluminescent night'), 'growth.weeping': r(0.5, 0.8), 'crown.radius': r(4, 5), 'leaves.hue': r(0.46, 0.58), 'leaves.glow': r(0.38, 0.52), 'leaves.glowHue': r(0.44, 0.58),
  } }) },
  { w: 5, alien: true, make: (r) => ({ name: 'Heavy world', blurb: 'Squat and wide, pressed down by three times the gravity.', v: {
    ...flat('Heavy world'), 'growth.gravity': r(2.4, 3.2), 'crown.radius': r(5.6, 6.8), 'crown.height': r(3, 3.8), 'leaves.hue': r(0.17, 0.24),
  } }) },
];

/** Draw one proposal. `rollSeed` makes it reproducible (`?roll=N`). */
export function rollProposal(rollSeed = Math.floor(Math.random() * 2 ** 31)): Proposal {
  const rng = mulberry(rollSeed);
  const r = (lo: number, hi: number) => +(lo + rng() * (hi - lo)).toFixed(3);
  const pick = <T,>(a: T[]): T => a[Math.floor(rng() * a.length)];
  let x = rng() * KINDS.reduce((s, k) => s + k.w, 0);
  const kind = KINDS.find((k) => (x -= k.w) < 0) ?? KINDS[0];
  const made = kind.make(r, pick);
  const v = made.v;
  // Hour: earth trees start between morning and golden hour; the worlds keep their own (one of them is a night scene).
  if (!kind.alien) v['sky.timeOfDay'] = r(8.5, 17.8);
  v['seed.seed'] = Math.floor(rng() * 999999);
  return { name: made.name, adj: made.adj, blurb: made.blurb, alien: !!kind.alien, values: v };
}

/** Write a proposal into the live params: owned groups back to defaults, then its values, all through `userSet`. */
export function applyProposal(p: ArborParams, auto: Automation, pr: Proposal) {
  const def = defaultParams() as unknown as Record<string, Record<string, number | string | boolean>>;
  const cur = p as unknown as Record<string, Record<string, unknown>>;
  const want: Record<string, number | string | boolean> = {};
  for (const g of TREE_GROUPS) for (const f of Object.keys(def[g])) if (`${g}.${f}` !== 'growth.maxNodes') want[`${g}.${f}`] = def[g][f];
  for (const f of SKY_FIELDS) want[`sky.${f}`] = def.sky[f];
  Object.assign(want, pr.values);
  auto.journey = [];
  auto.drift = {};
  for (const [k, v] of Object.entries(want)) {
    const [g, f] = k.split('.');
    if (cur[g][f] !== v) auto.userSet(k, v);
  }
  // Explicit query values still win (e.g. `?start=1&timeOfDay=0`).
  applyQueryOverrides(p, location.search);
}

export interface StartActions {
  /** Called with every new proposal (first one included) after it is applied; resets the tree to its seed. */
  proposed(pr: Proposal): void;
  /** The visitor pressed the primary action; `name` is the title shown. */
  begin(name: string): void;
}

function h<K extends keyof HTMLElementTagNameMap>(tag: K, attrs: Record<string, string | number> = {}, ...kids: (Node | string)[]): HTMLElementTagNameMap[K] {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) { if (k === 'class') el.className = String(v); else if (k === 'text') el.textContent = String(v); else el.setAttribute(k, String(v)); }
  el.append(...kids);
  return el;
}

const SLIDERS: { key: string; label: string; min: number; max: number; step: number; cls?: string; fmt(v: number, p: ArborParams): string }[] = [
  { key: 'crown.height', label: 'Height', min: 3, max: 12.5, step: 0.1, fmt: (v, p) => `${(v + p.crown.base).toFixed(0)} m` },
  { key: 'crown.radius', label: 'Width', min: 1.3, max: 7, step: 0.1, fmt: (v) => `${(2 * v).toFixed(0)} m` },
  { key: 'growth.weeping', label: 'Droop', min: 0, max: 1.7, step: 0.05, fmt: (v) => (v < 0.2 ? 'upright' : v < 0.7 ? 'arching' : v < 1.2 ? 'hanging' : 'weeping') },
  { key: 'leaves.hue', label: 'Leaf colour', min: 0, max: 1, step: 0.005, cls: 'as-hue', fmt: () => '' },
];

/**
 * Build the screen (hidden). `open(rollSeed?)` draws a proposal, applies it and shows the screen; the primary button
 * calls `begin` and the screen fades out. Every control writes through `Automation.userSet`.
 */
export function buildStartScreen(p: ArborParams, auto: Automation, a: StartActions) {
  let current: Proposal | null = null;
  const get = (k: string) => { const [g, f] = k.split('.'); return (p as unknown as Record<string, Record<string, number | string>>)[g][f]; };
  const title = h('h1', { id: 'arbor-start-name', class: 'as-name' });
  const blurb = h('p', { class: 'as-blurb', id: 'arbor-start-blurb' });
  const facts = h('p', { class: 'as-facts', id: 'arbor-start-facts' });
  const syncers: (() => void)[] = [];
  const sync = () => { for (const s of syncers) s(); };
  // The browser restores remembered form values after a reload (the thumbs then show the previous visit's tree).
  window.addEventListener('pageshow', () => setTimeout(sync, 0));

  // Leaf pictures: fixed-size canvases (no layout jump), painted in idle slices like the panel's picker.
  const forms = h('div', { class: 'as-forms', role: 'group', 'aria-label': 'Leaf shape' });
  const formBtns: HTMLButtonElement[] = [];
  LEAF_FORMS.forEach((f, i) => {
    const cv = h('canvas', { width: 112, height: 112, 'aria-hidden': 'true' });
    const b = h('button', { type: 'button', class: 'as-form', 'data-form': f.id, 'aria-pressed': 'false' }, cv, h('span', { text: f.name }));
    b.addEventListener('click', () => { auto.userSet('leaves.form', f.id); sync(); });
    formBtns.push(b);
    forms.append(b);
    setTimeout(() => {
      const src = leafFormCanvas(f.id, f.paint ? 192 : 512), g = cv.getContext('2d')!;
      const hgt = 104 * Math.min(1, 1 / f.aspect), w = hgt * f.aspect;
      g.imageSmoothingQuality = 'high';
      g.drawImage(src, (112 - w) / 2, (112 - hgt) / 2, w, hgt);
    }, 30 + i * 25);
  });
  syncers.push(() => {
    const cur = leafForm(String(get('leaves.form'))).id;
    for (const b of formBtns) {
      const on = b.dataset.form === cur;
      b.setAttribute('aria-pressed', String(on));
      if (on && forms.scrollWidth > forms.clientWidth) forms.scrollTo({ left: b.offsetLeft - (forms.clientWidth - b.offsetWidth) / 2 });
    }
  });

  const rows = SLIDERS.map((d) => {
    const id = `arbor-start-${d.key.replace('.', '-')}`;
    const input = h('input', { type: 'range', id, autocomplete: 'off', min: d.min, max: d.max, step: d.step, 'data-start-param': d.key, class: d.cls ?? '' });
    const val = h('span', { class: 'as-val' });
    input.addEventListener('input', () => { auto.userSet(d.key, Number(input.value)); sync(); });
    syncers.push(() => {
      const v = Number(get(d.key));
      input.value = String(v);
      val.textContent = d.fmt(v, p);
      input.style.setProperty('--fill', `${(100 * (Math.min(d.max, Math.max(d.min, v)) - d.min)) / (d.max - d.min)}%`);
      if (d.cls) input.style.setProperty('--thumb', `hsl(${(v * 360).toFixed(0)} ${(Number(get('leaves.saturation')) * 100).toFixed(0)}% 45%)`);
    });
    return h('div', { class: 'as-row' }, h('label', { for: id, text: d.label }), input, val);
  });
  syncers.push(() => {
    const f = leafForm(String(get('leaves.form')));
    const hr = p.sky.timeOfDay, when = hr < 5 || hr > 21 ? 'night' : hr < 11 ? 'morning' : hr < 15 ? 'midday' : hr < 19 ? 'afternoon' : 'dusk';
    facts.textContent = `${f.name} leaves · ${(p.crown.height + p.crown.base).toFixed(0)} m tall, ${(2 * p.crown.radius).toFixed(0)} m wide · ${when}`;
    if (current?.adj) title.textContent = `${current.adj} ${FORM_NAME[f.id] ?? `${f.name.toLowerCase()} tree`}`;
  });

  const reroll = h('button', { type: 'button', class: 'as-btn', id: 'arbor-start-reroll', 'aria-label': 'Suggest another tree' });
  reroll.innerHTML = '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="4" width="16" height="16" rx="3.5"/><circle cx="9" cy="9" r="1" fill="currentColor"/><circle cx="15" cy="15" r="1" fill="currentColor"/><circle cx="15" cy="9" r="1" fill="currentColor"/><circle cx="9" cy="15" r="1" fill="currentColor"/></svg><span>Another</span>';
  const go = h('button', { type: 'button', class: 'as-btn as-go', id: 'arbor-start-go', text: 'Plant this tree' });
  const card = h('div', { class: 'as-card' },
    h('div', { class: 'as-eyebrow', text: 'Your tree' }), title, blurb, facts, forms, h('div', { class: 'as-rows' }, ...rows),
    h('div', { class: 'as-actions' }, reroll, go),
    h('p', { class: 'as-foot', text: 'It grows from a seed through days, weather and seasons. Everything else is in Controls.' }));
  const root = h('div', { id: 'arbor-start', class: 'as-root', role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'arbor-start-name', 'aria-describedby': 'arbor-start-blurb', hidden: '' },
    h('div', { class: 'as-brand' }, h('span', { class: 'as-word', text: 'Arbor' }), h('span', { class: 'as-tag', text: 'Watch a tree grow' })), card);
  document.body.append(root);

  const propose = (rollSeed?: number) => {
    current = rollProposal(rollSeed);
    applyProposal(p, auto, current);
    title.textContent = current.name;
    blurb.textContent = current.blurb;
    root.classList.toggle('alien', current.alien);
    a.proposed(current);
    sync();
  };
  let rolls = 0;
  reroll.addEventListener('click', () => {
    propose();
    // Restart the small swap animation.
    card.classList.remove('swap'); void card.offsetWidth; card.classList.add('swap');
    reroll.style.setProperty('--turn', `${++rolls * 180}deg`);
  });
  let leaveTimer = 0;
  go.addEventListener('click', () => {
    if (root.classList.contains('leaving')) return;
    a.begin(title.textContent ?? '');
    root.classList.add('leaving');
    document.body.classList.remove('starting');
    leaveTimer = window.setTimeout(() => { root.hidden = true; root.classList.remove('leaving'); }, 700);
    (document.getElementById('arbor-panel-open') as HTMLElement | null)?.focus({ preventScroll: true });
  });
  // Keep Tab inside the dialog while it is open.
  root.addEventListener('keydown', (e) => {
    if (e.key !== 'Tab') return;
    const f = [...root.querySelectorAll<HTMLElement>('button, input')];
    const first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });

  return {
    /** Draw a proposal and show the screen. */
    open(rollSeed?: number) {
      clearTimeout(leaveTimer);
      propose(rollSeed);
      root.classList.remove('leaving');
      root.hidden = false;
      document.body.classList.add('starting');
      // Keyboard: Enter starts at once. Touch devices get no focus ring on arrival.
      if (matchMedia('(hover: hover)').matches) go.focus({ preventScroll: true });
    },
    get isOpen() { return !root.hidden && !root.classList.contains('leaving'); },
    get proposal() { return current; },
  };
}

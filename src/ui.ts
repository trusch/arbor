import './ui.css';
import type { ArborParams } from './params';
import { type Automation, numericPaths } from './automation';

export interface UiActions {
  regrow(): void;
  newSeed(): void;
  crownChanged(): void;
  preset(name: string): void;
  presetNames: string[];
  currentPreset(): string;
  simTime(): number;
  /** Tree state for the status line. */
  growth(): { nodes: number; age: number; grown: boolean };
}

type Kids = (Node | string | null | undefined | false)[];
function h<K extends keyof HTMLElementTagNameMap>(tag: K, attrs: Record<string, string | number | boolean> = {}, ...kids: Kids): HTMLElementTagNameMap[K] {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === 'class') el.className = String(v);
    else if (k === 'text') el.textContent = String(v);
    else if (v === true) el.setAttribute(k, '');
    else if (v !== false) el.setAttribute(k, String(v));
  }
  for (const c of kids) if (c) el.append(c);
  return el;
}
const svg = (d: string) => `<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;
const ICON = {
  sliders: svg('<path d="M4 7h10M18 7h2M4 17h4M12 17h8"/><circle cx="16" cy="7" r="2"/><circle cx="10" cy="17" r="2"/>'),
  down: svg('<path d="M6 9l6 6 6-6"/>'),
  pause: svg('<path d="M8 5v14M16 5v14"/>'),
  play: svg('<path d="M8 5l11 7-11 7z" fill="currentColor"/>'),
};

function hslHex(hh: number, s: number, l: number): string {
  hh = ((hh % 1) + 1) % 1;
  const f = (n: number) => {
    const k = (n + hh * 12) % 12;
    const c = l - s * Math.min(l, 1 - l) * Math.max(-1, Math.min(k - 3, 9 - k, 1));
    return Math.round(255 * c).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}
function hexHsl(hex: string): [number, number, number] {
  const r = parseInt(hex.slice(1, 3), 16) / 255, g = parseInt(hex.slice(3, 5), 16) / 255, b = parseInt(hex.slice(5, 7), 16) / 255;
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2, d = mx - mn;
  if (d < 1e-6) return [0, 0, l];
  const s = d / (1 - Math.abs(2 * l - 1));
  const hh = mx === r ? ((g - b) / d + 6) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return [hh / 6, Math.min(1, s), l];
}

interface SliderDef {
  key: string;
  name: string;
  help: string;
  min: number;
  max: number;
  step?: number;
  /** Logarithmic slider between min and max. */
  log?: boolean;
  /** 'new' = shapes new growth only, 'now' = visible at once. */
  when?: 'new' | 'now';
  drift?: boolean;
  fmt?: (v: number) => string;
  crown?: boolean;
  big?: boolean;
}

const TREE: SliderDef[] = [
  { key: 'growth.gravity', name: 'Gravity', help: 'How heavy the world is. Low: tall and airy. High: squat, with sagging branches.', min: 0, max: 3, step: 0.01 },
  { key: 'growth.phototropism', name: 'Reach for light', help: 'How strongly branch tips bend towards the sun.', min: 0, max: 2, step: 0.01 },
  { key: 'growth.branchingProbability', name: 'Branchiness', help: 'How often new side branches sprout. More gives a denser tree.', min: 0.02, max: 1, step: 0.01 },
  { key: 'growth.branchAngle', name: 'Branch angle', help: 'How far side branches spread from their parent. Small: upright. Large: wide.', min: 10, max: 100, step: 1, fmt: (v) => `${v.toFixed(0)}°` },
  { key: 'growth.torsion', name: 'Twist', help: 'Spirals the branches as they grow. Middle is no twist.', min: -20, max: 20, step: 0.5 },
  { key: 'growth.weeping', name: 'Droop', help: 'Makes the twigs hang down, like a weeping willow.', min: 0, max: 3, step: 0.01 },
  { key: 'growth.wander', name: 'Wildness', help: 'How much branches meander instead of growing straight.', min: 0, max: 2, step: 0.01 },
  { key: 'crown.radius', name: 'Crown width', help: 'How wide the tree top may spread.', min: 0.5, max: 10, step: 0.1, crown: true, fmt: (v) => `${v.toFixed(1)} m` },
  { key: 'crown.height', name: 'Crown height', help: 'How tall the tree top may become.', min: 0.5, max: 15, step: 0.1, crown: true, fmt: (v) => `${v.toFixed(1)} m` },
  { key: 'crown.shape', name: 'Crown shape', help: 'Left: round. Middle: pointed like a fir. Right: wide like an umbrella.', min: 0, max: 2, step: 0.01, crown: true, fmt: (v) => (v < 0.5 ? 'round' : v < 1.5 ? 'pointed' : 'umbrella') },
  { key: 'leaves.size', name: 'Leaf size', help: 'How big each leaf is.', min: 0.03, max: 2.5, log: true, when: 'now', fmt: (v) => `${(v * 100).toFixed(0)} cm` },
  { key: 'leaves.density', name: 'Leaf amount', help: 'How many leaves sit on each twig.', min: 0, max: 4, step: 0.05, when: 'now' },
];

const SKY: SliderDef[] = [
  { key: 'sky.timeOfDay', name: 'Time of day', help: 'Moves the sun. Try sunrise, noon, sunset or night.', min: 0, max: 24, step: 0.05, when: 'now', fmt: (v) => { const hh = Math.floor(v) % 24, mm = Math.floor((v - Math.floor(v)) * 60); return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`; } },
  { key: 'sky.dayLength', name: 'Length of a day', help: 'How long a full day and night takes when the cycle is on.', min: 10, max: 1800, log: true, when: 'now', fmt: (v) => (v < 90 ? `${v.toFixed(0)} s` : `${(v / 60).toFixed(v < 600 ? 1 : 0)} min`) },
  { key: 'sky.wind', name: 'Wind', help: 'How hard the wind blows across the meadow. Calmer at night.', min: 0, max: 1, step: 0.01, when: 'now', fmt: (v) => (v < 0.05 ? 'still' : v < 0.3 ? 'light' : v < 0.6 ? 'breezy' : 'windy') },
];

/** Everything else, raw, for the Advanced tab: [group title, [field, min, max, step][]]. */
const ADVANCED: [string, string, [string, number, number, number][]][] = [
  ['Growth (raw)', 'growth', [['gravity', 0, 3, 0.01], ['phototropism', 0, 2, 0.01], ['gravitropism', -1, 2, 0.01], ['attraction', 0, 3, 0.01], ['straightness', 0, 5, 0.01], ['wander', 0, 2, 0.01], ['maxTurn', 2, 90, 0.5], ['scaffoldBranching', 0, 1.5, 0.01], ['selfPrune', 0, 0.8, 0.01], ['branchAngle', 5, 110, 0.5], ['phyllotaxis', 0, 360, 0.5], ['apicalDominance', 0, 1, 0.01], ['branchingProbability', 0, 2, 0.01], ['segmentLength', 0.05, 0.6, 0.01], ['growthRate', 0.1, 5, 0.01], ['vigorDecay', 0.4, 1, 0.01], ['maxOrder', 1, 10, 1], ['weeping', 0, 3, 0.01], ['torsion', -20, 20, 0.1], ['sag', 0, 5, 0.01], ['maxNodes', 1000, 60000, 500]]],
  ['Crown (raw)', 'crown', [['shape', 0, 2, 0.01], ['radius', 0.5, 10, 0.1], ['height', 0.5, 15, 0.1], ['base', 0, 8, 0.1], ['bole', 0, 6, 0.05], ['attractors', 200, 20000, 100]]],
  ['Thickness', 'thickness', [['exponent', 1.5, 3.5, 0.01], ['twigRadius', 0.003, 0.04, 0.001], ['thickeningRate', 0.05, 5, 0.01], ['rootFlare', 0, 3, 0.01]]],
  ['Leaves (raw)', 'leaves', [['size', 0, 2.5, 0.005], ['density', 0, 4, 0.05], ['hue', 0, 1, 0.005], ['saturation', 0, 1, 0.01], ['maxBranchRadius', 0.005, 0.2, 0.001], ['shape', -1, 1, 0.01], ['lightness', 0.3, 2, 0.01], ['glow', 0, 3, 0.01], ['glowHue', 0, 1, 0.005]]],
  ['Growth light', 'light', [['azimuth', 0, 360, 1], ['elevation', 5, 89, 1]]],
  ['Sky and look (raw)', 'sky', [['timeOfDay', 0, 24, 0.01], ['dayLength', 10, 1800, 1], ['latitude', 0, 75, 0.5], ['sunYaw', 0, 360, 1], ['exposure', 0.1, 3, 0.01], ['skyGain', 0.1, 3, 0.01], ['fog', 0, 5, 0.01], ['stars', 0, 2, 0.01], ['godRays', 0, 3, 0.01], ['skyHue', 0, 1, 0.005], ['skyTint', 0, 1, 0.01], ['sunHue', 0, 1, 0.005], ['sunTint', 0, 1, 0.01], ['sun2', 0, 2, 0.01], ['sun2Hue', 0, 1, 0.005], ['sun2Yaw', 0, 360, 1], ['sunSize', 0, 4, 0.01], ['groundHue', 0, 1, 0.005], ['groundTint', 0, 1, 0.01]]],
  ['Time and seed', '', []],
];

let uid = 0;

export function buildPanel(p: ArborParams, auto: Automation, a: UiActions, opts: { open?: boolean; tab?: string } = {}) {
  const groups = p as unknown as Record<string, Record<string, number | boolean | string>>;
  const get = (k: string) => { const [g, f] = k.split('.'); return groups[g][f]; };
  const num = (k: string) => get(k) as number;
  const syncers: (() => void)[] = [];
  let dragging: Element | null = null;
  const refresh = () => { for (const s of syncers) s(); };
  const set = (k: string, v: number | boolean | string) => { auto.userSet(k, v); if (k.startsWith('crown.')) crownDirty = true; };
  let crownDirty = false;
  const commitCrown = () => { if (crownDirty) { crownDirty = false; a.crownChanged(); } };

  const trackDrag = (el: HTMLElement) => {
    el.addEventListener('pointerdown', () => (dragging = el));
    for (const ev of ['pointerup', 'pointercancel', 'change', 'blur']) el.addEventListener(ev, () => { if (dragging === el) dragging = null; });
  };

  function slider(d: SliderDef): HTMLElement {
    const id = `ap-${uid++}`;
    const step = d.step ?? 0.01;
    const fmt = d.fmt ?? ((v: number) => v.toFixed(step >= 1 ? 0 : step >= 0.1 ? 1 : 2));
    const toPos = (v: number) => (d.log ? (1000 * Math.log(Math.max(d.min, Math.min(d.max, v)) / d.min)) / Math.log(d.max / d.min) : v);
    const fromPos = (x: number) => (d.log ? d.min * Math.pow(d.max / d.min, x / 1000) : x);
    const input = h('input', { type: 'range', id, min: d.log ? 0 : d.min, max: d.log ? 1000 : d.max, step: d.log ? 1 : step, 'data-param': d.key, 'aria-describedby': `${id}-h` });
    const out = h('output', { for: id, class: 'ap-val' });
    const drift = d.drift ? h('button', { type: 'button', class: 'ap-drift', 'aria-pressed': 'false', 'data-drift': d.key, 'aria-label': `Let ${d.name} drift on its own`, title: 'Let it drift: the value slowly wanders on its own', text: 'Drift' }) : null;
    const tag = d.when ? h('span', { class: `ap-tag ${d.when}`, text: d.when === 'new' ? 'new growth' : 'instant' }) : null;
    const row = h('div', { class: `ap-row${d.big ? ' big' : ''}` },
      h('div', { class: 'ap-head' }, h('label', { for: id, text: d.name }), tag, out),
      h('div', { class: 'ap-line' }, input, drift),
      h('p', { class: 'ap-help', id: `${id}-h`, text: d.help }));
    trackDrag(input);
    input.addEventListener('input', () => { set(d.key, fromPos(Number(input.value))); sync(); });
    input.addEventListener('change', commitCrown);
    drift?.addEventListener('click', () => { const on = !(auto.drift[d.key]?.on ?? false); auto.setDrift(d.key, on, 0.03, 0.3); refresh(); });
    const sync = () => {
      const v = num(d.key);
      if (dragging !== input) input.value = String(toPos(v));
      out.textContent = fmt(v);
      const drv = auto.drives(d.key);
      drift?.setAttribute('aria-pressed', String(drv === 'drift'));
      row.classList.toggle('driven', drv !== null);
      out.title = drv === 'journey' ? 'Changing over time (journey). Move the slider to take over.' : '';
    };
    syncers.push(sync);
    return row;
  }

  function toggle(key: string, name: string, help: string): HTMLElement {
    const id = `ap-${uid++}`;
    const input = h('input', { type: 'checkbox', id, role: 'switch', 'data-param': key });
    input.addEventListener('change', () => { set(key, input.checked); refresh(); });
    syncers.push(() => (input.checked = get(key) as boolean));
    return h('div', { class: 'ap-row ap-switch' }, h('label', { for: id }, h('span', { class: 'ap-sw-name', text: name }), help ? h('span', { class: 'ap-help', text: help }) : null), input);
  }

  interface ColourDef { name: string; help: string; id: string; get(): string; set(hh: number, s: number, l: number): void; swatches: { label: string; hsl: [number, number, number]; show?: string }[] }
  function colour(d: ColourDef): HTMLElement {
    const id = `ap-${uid++}`;
    const input = h('input', { type: 'color', id, 'data-colour': d.id, 'aria-describedby': `${id}-h` });
    trackDrag(input);
    input.addEventListener('input', () => { d.set(...hexHsl(input.value)); syncers.forEach((s) => s !== sync && s()); });
    const sw = h('div', { class: 'ap-swatches', role: 'group', 'aria-label': `${d.name} suggestions` });
    for (const s of d.swatches) {
      const b = h('button', { type: 'button', class: `ap-swatch${s.show ? '' : ' none'}`, 'aria-label': `${d.name}: ${s.label}`, title: s.label });
      if (s.show) b.style.setProperty('--c', s.show);
      b.addEventListener('click', () => { d.set(...s.hsl); refresh(); });
      sw.append(b);
    }
    const sync = () => { if (dragging !== input) input.value = d.get(); };
    syncers.push(sync);
    return h('div', { class: 'ap-row ap-colour' },
      h('div', { class: 'ap-head' }, h('label', { for: id, text: d.name }), input),
      sw, h('p', { class: 'ap-help', id: `${id}-h`, text: d.help }));
  }
  const HUES: [string, number][] = [['red', 0.0], ['orange', 0.08], ['yellow', 0.15], ['green', 0.33], ['teal', 0.48], ['blue', 0.6], ['violet', 0.76], ['pink', 0.9]];
  const tint = (name: string, help: string, id: string, hueK: string, amtK: string, amount: number): ColourDef => ({
    name, help, id,
    get: () => hslHex(num(hueK), Math.min(1, num(amtK)), 0.55),
    set: (hh, s) => { if (s > 0.02) set(hueK, hh); set(amtK, s); },
    swatches: [{ label: 'natural (no tint)', hsl: [0, 0, 0.55] }, ...HUES.slice(0, 6).map(([label, hh]) => ({ label, hsl: [hh, amount, 0.55] as [number, number, number], show: hslHex(hh, 0.7, 0.55) }))],
  });
  const leafSw = (label: string, hh: number, s: number, lt: number) => ({ label, hsl: [hh, s, 0.36 * lt] as [number, number, number], show: hslHex(hh, s, 0.36 * lt) });

  // ---- shell ----
  const root = h('aside', { class: 'arbor-ui ap-panel', id: 'arbor-panel', 'aria-label': 'Tree controls' });
  const opener = h('button', { type: 'button', class: 'arbor-ui ap-open', id: 'arbor-panel-open', 'aria-controls': 'arbor-panel', 'aria-expanded': 'false' });
  opener.innerHTML = `${ICON.sliders}<span>Controls</span>`;
  const status = h('div', { class: 'ap-status', role: 'status', 'aria-live': 'polite' });
  const stState = h('strong', { id: 'arbor-state' }), stSub = h('span', {});
  status.append(stState, stSub);
  const pauseBtn = h('button', { type: 'button', class: 'ap-icon', id: 'arbor-pause' });
  const closeBtn = h('button', { type: 'button', class: 'ap-icon', id: 'arbor-panel-close', 'aria-label': 'Hide controls', title: 'Hide controls' });
  closeBtn.innerHTML = ICON.down;
  pauseBtn.addEventListener('click', () => { p.time.paused = !p.time.paused; refresh(); });
  const grownBar = h('div', { class: 'ap-grown', hidden: true }, h('span', { text: 'This tree is fully grown. Shape changes show on a new tree.' }));
  const grownBtn = h('button', { type: 'button', class: 'ap-btn primary', text: 'Plant a new tree' });
  grownBtn.addEventListener('click', () => { a.newSeed(); refresh(); });
  grownBar.append(grownBtn);

  const setOpen = (open: boolean, focus = false) => {
    root.classList.toggle('open', open);
    opener.classList.toggle('hidden', open);
    opener.setAttribute('aria-expanded', String(open));
    document.body.classList.toggle('panel-open', open);
    if (open) refresh();
    if (focus) (open ? closeBtn : opener).focus();
  };
  opener.addEventListener('click', () => setOpen(true, true));
  closeBtn.addEventListener('click', () => setOpen(false, true));
  root.addEventListener('keydown', (e) => { if (e.key === 'Escape') setOpen(false, true); });

  // ---- tabs ----
  const tabs: { id: string; label: string; body: HTMLElement; btn: HTMLButtonElement }[] = [];
  const tablist = h('div', { class: 'ap-tabs', role: 'tablist', 'aria-label': 'Control groups' });
  const bodies = h('div', { class: 'ap-body' });
  const selectTab = (id: string) => {
    for (const t of tabs) {
      const on = t.id === id;
      t.btn.setAttribute('aria-selected', String(on));
      t.btn.tabIndex = on ? 0 : -1;
      t.body.hidden = !on;
    }
    bodies.scrollTop = 0;
  };
  const tab = (id: string, label: string, ...kids: Kids) => {
    const btn = h('button', { type: 'button', role: 'tab', id: `ap-tab-${id}`, 'data-tab': id, 'aria-controls': `ap-pane-${id}`, text: label });
    const body = h('div', { class: 'ap-pane', role: 'tabpanel', id: `ap-pane-${id}`, 'aria-labelledby': `ap-tab-${id}` }, ...kids);
    btn.addEventListener('click', () => selectTab(id));
    tablist.append(btn);
    bodies.append(body);
    tabs.push({ id, label, body, btn });
  };
  tablist.addEventListener('keydown', (e) => {
    const i = tabs.findIndex((t) => t.btn === document.activeElement);
    if (i < 0 || (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft')) return;
    const n = tabs[(i + (e.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length];
    selectTab(n.id);
    n.btn.focus();
  });
  const note = (text: string) => h('p', { class: 'ap-note', text });
  const btn = (text: string, fn: () => void, cls = '', id = '') => {
    const b = h('button', { type: 'button', class: `ap-btn ${cls}`, text });
    if (id) b.id = id;
    b.addEventListener('click', () => { fn(); refresh(); });
    return b;
  };

  // ---- Grow ----
  const chips = h('div', { class: 'ap-chips', role: 'group', 'aria-label': 'Choose a tree' });
  for (const n of a.presetNames) {
    const c = h('button', { type: 'button', class: 'ap-chip', 'data-preset': n, 'aria-pressed': 'false', text: n.replace(/^Journey: /, '') });
    c.addEventListener('click', () => { a.preset(n); refresh(); });
    chips.append(c);
  }
  syncers.push(() => chips.querySelectorAll('button').forEach((c) => c.setAttribute('aria-pressed', String((c as HTMLElement).dataset.preset === a.currentPreset()))));
  tab('grow', 'Grow',
    slider({ key: 'time.speed', name: 'Growth speed', help: 'How fast time passes for the tree. Works at once, while the tree is still growing.', min: 0.25, max: 20, log: true, big: true, fmt: (v) => `${v >= 10 ? v.toFixed(0) : v >= 1 ? v.toFixed(1) : v.toFixed(2)}x` }),
    h('div', { class: 'ap-actions' }, btn('Plant a new tree', a.newSeed, 'primary', 'arbor-new'), btn('Regrow this one', a.regrow, '', 'arbor-regrow')),
    note('A new tree grows differently with the same settings. Regrow replays this exact tree from a seedling.'),
    h('h3', { text: 'Choose a tree' }), chips,
    note('Picking a tree loads its shape, colours and sky, and starts growing from a seedling.'));

  // ---- Shape ----
  tab('shape', 'Shape',
    note('Shape controls steer how the tree grows from now on. Branches that already exist keep their form, so plant a new tree to see the full effect. Drift lets a value wander slowly on its own.'),
    ...TREE.map((d) => slider({ when: 'new', drift: true, ...d })));

  // ---- Colours ----
  const rnd = (lo: number, hi: number) => lo + Math.random() * (hi - lo);
  const surprise = () => {
    // One base hue; sky and sun sit at a harmonic offset (complementary, triadic or analogous), ground stays near the leaves.
    const base = Math.random(), off = [0.5, 0.33, 0.67, 0.08, 0.92][Math.floor(Math.random() * 5)];
    set('leaves.hue', base); set('leaves.saturation', rnd(0.5, 0.85)); set('leaves.lightness', rnd(0.9, 1.35));
    set('sky.skyHue', (base + off) % 1); set('sky.skyTint', rnd(0.3, 0.65));
    set('sky.sunHue', (base + off + 0.08) % 1); set('sky.sunTint', rnd(0.2, 0.5));
    set('sky.groundHue', (base + rnd(-0.06, 0.06) + 1) % 1); set('sky.groundTint', rnd(0.3, 0.6));
    set('leaves.glowHue', (base + 0.5) % 1); set('leaves.glow', Math.random() < 0.35 ? rnd(0.2, 0.5) : 0);
  };
  const natural = () => {
    set('leaves.hue', 0.27); set('leaves.saturation', 0.55); set('leaves.lightness', 1); set('leaves.glow', 0);
    set('sky.skyTint', 0); set('sky.sunTint', 0); set('sky.groundTint', 0);
  };
  tab('colours', 'Colours',
    h('div', { class: 'ap-actions' }, btn('Surprise me', surprise, 'primary', 'arbor-surprise'), btn('Natural colours', natural, '', 'arbor-natural')),
    note('Colours change at once, on the tree you are watching. Tap the round colour button for any colour, or pick a suggestion.'),
    colour({ name: 'Leaf colour', help: 'The colour of the leaves.', id: 'leaf',
      get: () => hslHex(num('leaves.hue'), num('leaves.saturation'), Math.min(0.8, 0.36 * num('leaves.lightness'))),
      set: (hh, s, l) => { if (s > 0.02) set('leaves.hue', hh); set('leaves.saturation', s); set('leaves.lightness', Math.max(0.3, Math.min(2, l / 0.36))); },
      swatches: [leafSw('summer green', 0.27, 0.55, 1), leafSw('spring lime', 0.2, 0.65, 1.25), leafSw('autumn gold', 0.12, 0.8, 1.3), leafSw('autumn orange', 0.06, 0.8, 1.2), leafSw('red', 0.98, 0.75, 1), leafSw('blossom pink', 0.92, 0.6, 1.6), leafSw('violet', 0.76, 0.5, 1.1), leafSw('teal', 0.48, 0.55, 1.1)] }),
    slider({ key: 'leaves.glow', name: 'Leaf glow at night', help: 'Leaves light up in the dark. Set the time of day to night to see it best.', min: 0, max: 1.5, step: 0.01, when: 'now' }),
    colour({ name: 'Glow colour', help: 'The colour of the night glow.', id: 'glow',
      get: () => hslHex(num('leaves.glowHue'), 0.9, 0.55), set: (hh, s) => { if (s > 0.02) set('leaves.glowHue', hh); },
      swatches: HUES.map(([label, hh]) => ({ label, hsl: [hh, 0.9, 0.55] as [number, number, number], show: hslHex(hh, 0.9, 0.55) })) }),
    colour(tint('Sky tint', 'Tints the sky and the haze. Grey or the first dot means a natural sky.', 'sky', 'sky.skyHue', 'sky.skyTint', 0.55)),
    colour(tint('Sun colour', 'The colour of the sunlight on the tree and the ground.', 'sun', 'sky.sunHue', 'sky.sunTint', 0.5)),
    colour(tint('Ground tint', 'Tints the grass.', 'ground', 'sky.groundHue', 'sky.groundTint', 0.55)));

  // ---- Sky ----
  tab('sky', 'Sky',
    slider(SKY[0]),
    toggle('sky.cycle', 'Day and night cycle', 'Let the sun move on its own.'),
    slider(SKY[1]),
    slider(SKY[2]),
    toggle('sky.meadow', 'Meadow', 'Grass tufts and wildflowers around the tree.'));

  // ---- Advanced ----
  const raw = (key: string, name: string, min: number, max: number, step: number): HTMLElement => {
    const id = `ap-${uid++}`;
    const r = h('input', { type: 'range', id, min, max, step, 'data-raw': key });
    const n = h('input', { type: 'number', min, max, step, 'aria-label': `${name} value`, 'data-rawnum': key });
    trackDrag(r);
    const write = (v: number) => { if (Number.isFinite(v)) { set(key, v); refresh(); } };
    r.addEventListener('input', () => write(Number(r.value)));
    r.addEventListener('change', commitCrown);
    n.addEventListener('change', () => { write(Number(n.value)); commitCrown(); });
    syncers.push(() => {
      if (!pane?.open) return;
      const v = num(key);
      if (dragging !== r) r.value = String(v);
      if (document.activeElement !== n) n.value = String(+v.toFixed(4));
    });
    let pane: HTMLDetailsElement | undefined;
    queueMicrotask(() => (pane = r.closest('details') as HTMLDetailsElement));
    return h('div', { class: 'ap-raw' }, h('label', { for: id, text: name }), r, n);
  };
  const check = (label: string, getV: () => boolean, setV: (v: boolean) => void, id = '') => {
    const cid = id || `ap-${uid++}`;
    const c = h('input', { type: 'checkbox', id: cid });
    c.addEventListener('change', () => { setV(c.checked); refresh(); });
    syncers.push(() => (c.checked = getV()));
    return h('div', { class: 'ap-raw check' }, h('label', { for: cid, text: label }), c);
  };
  const fold = (title: string, ...kids: Kids) => { const d = h('details', { class: 'ap-fold' }, h('summary', { text: title }), ...kids); d.addEventListener('toggle', refresh); return d; };

  const jInfo = h('output', { id: 'arbor-journey-info', class: 'ap-info' });
  const dInfo = h('output', { id: 'arbor-drift-info', class: 'ap-info' });
  const dSel = h('select', { id: 'arbor-drift-param', 'aria-label': 'Value to drift' });
  for (const k of numericPaths(p)) dSel.append(h('option', { value: k, text: k }));
  dSel.value = 'growth.gravity';
  const dcur = () => auto.drift[dSel.value];
  const dRate = h('input', { type: 'range', min: 0.002, max: 0.3, step: 0.001, id: 'arbor-drift-rate' });
  const dRange = h('input', { type: 'range', min: 0, max: 1.5, step: 0.01, id: 'arbor-drift-range' });
  const dPush = () => auto.setDrift(dSel.value, dcur()?.on ?? false, Number(dRate.value), Number(dRange.value));
  dRate.addEventListener('input', dPush);
  dRange.addEventListener('input', dPush);
  dSel.addEventListener('change', refresh);
  syncers.push(() => {
    jInfo.textContent = `Keyframes: ${auto.journey.map((k) => `${k.t.toFixed(0)} s`).join(', ') || 'none'}`;
    dInfo.textContent = `Drifting: ${Object.entries(auto.drift).filter(([, d]) => d.on).map(([k]) => k.split('.')[1]).join(', ') || 'none'}`;
    if (dragging !== dRate) dRate.value = String(dcur()?.rate ?? 0.03);
    if (dragging !== dRange) dRange.value = String(dcur()?.range ?? 0.3);
  });
  trackDrag(dRate); trackDrag(dRange);
  const quality = h('select', { id: 'arbor-quality' }, h('option', { value: 'High', text: 'High' }), h('option', { value: 'Low', text: 'Low' }));
  quality.addEventListener('change', () => set('sky.quality', quality.value));
  syncers.push(() => (quality.value = p.sky.quality));

  tab('more', 'More',
    note('Everything else, with its technical name. Nothing here is needed for everyday play.'),
    fold('Changes over time (journey)',
      note('A journey remembers all values at two or more moments of the tree\'s life and blends between them as it grows. A value you move by hand leaves the journey.'),
      check('Journey on', () => auto.journeyOn, (v) => (auto.journeyOn = v), 'arbor-journey-on'),
      h('div', { class: 'ap-actions' }, btn('Add keyframe (now)', () => auto.addKeyframe(a.simTime()), '', 'arbor-add-keyframe'), btn('Clear journey', () => auto.clearJourney(), '', 'arbor-clear-journey')),
      jInfo),
    fold('Drift (any value)',
      h('div', { class: 'ap-raw' }, h('label', { for: 'arbor-drift-param', text: 'value' }), dSel),
      check('Drift this value', () => dcur()?.on ?? false, (v) => auto.setDrift(dSel.value, v, Number(dRate.value), Number(dRange.value)), 'arbor-drift-on'),
      h('div', { class: 'ap-raw' }, h('label', { for: 'arbor-drift-rate', text: 'rate' }), dRate),
      h('div', { class: 'ap-raw' }, h('label', { for: 'arbor-drift-range', text: 'range' }), dRange),
      dInfo),
    ...ADVANCED.filter(([, g]) => g).map(([title, g, rows]) => fold(title, ...rows.map(([f, mn, mx, st]) => raw(`${g}.${f}`, f, mn, mx, st)))),
    fold('Camera and quality',
      check('Auto-frame the tree', () => p.camera.autoFrame, (v) => (p.camera.autoFrame = v)),
      check('Auto-rotate', () => p.camera.autoRotate, (v) => (p.camera.autoRotate = v)),
      check('Cinema camera (key C)', () => p.camera.cinema, (v) => (p.camera.cinema = v)),
      h('div', { class: 'ap-raw' }, h('label', { for: 'arbor-quality', text: 'quality' }), quality),
      raw('seed.seed', 'seed', 0, 999999, 1),
      raw('time.speed', 'speed', 0, 20, 0.05),
      note('Keys: H hides all controls, C toggles the cinema camera, D shows a debug line.')));

  // ---- status ----
  syncers.push(() => {
    const g = a.growth();
    const state = g.grown ? 'Fully grown' : p.time.paused || p.time.speed <= 0 ? 'Paused' : 'Growing';
    if (stState.textContent !== state) stState.textContent = state;
    stSub.textContent = `${g.nodes.toLocaleString('en')} twigs · age ${g.age.toFixed(0)} s`;
    grownBar.hidden = !g.grown;
    root.classList.toggle('grown', g.grown);
    const paused = p.time.paused;
    if (pauseBtn.dataset.p !== String(paused)) {
      pauseBtn.dataset.p = String(paused);
      pauseBtn.innerHTML = paused ? ICON.play : ICON.pause;
      pauseBtn.setAttribute('aria-label', paused ? 'Resume growth' : 'Pause growth');
      pauseBtn.title = paused ? 'Resume growth' : 'Pause growth';
    }
  });

  root.append(h('header', { class: 'ap-top' }, status, pauseBtn, closeBtn), tablist, grownBar, bodies);
  document.body.append(opener, root);
  selectTab(tabs.some((t) => t.id === opts.tab) ? opts.tab! : 'grow');
  setOpen(opts.open ?? !matchMedia('(max-width: 700px)').matches);
  refresh();
  // Live values (drift, journey, day cycle, status) while the panel is open.
  setInterval(() => { if (root.classList.contains('open') && !document.hidden) refresh(); }, 400);
  return { refresh, setOpen };
}

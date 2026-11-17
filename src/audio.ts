/**
 * Soundscape (no three import). Everything is procedural Web Audio and is driven by the simulation's own signals:
 * `main.ts` hands a `SoundEnv` to `audio.frame` once per frame while sound is on, `weather.onStrike` calls
 * `audio.strike`, a `BreakEvent` calls `audio.limb`. Nothing here has a clock of its own: sparse sounds (rain drops,
 * bird phrases) are drawn per frame from rates that are functions of the env.
 *
 * Cost rule: no AudioContext, buffer or per-frame work exists until the user turns sound on (`audio.setOn(true)` from
 * a gesture). `Soundscape` takes any `BaseAudioContext`, so the same graph renders offline to a WAV (`audio.render`).
 */
import { Wind } from './wind';
import './audio.css';

export interface SoundEnv {
  /** `wind.gust` at the tree, and `wind.base`, 0..1. */
  gust: number;
  base: number;
  /** Unit wind direction (xz). */
  windX: number; windZ: number;
  rain: number;
  /** `Atmosphere.night` 0..1 and the hour 0..24. */
  night: number;
  hour: number;
  /** Season phase 0..1 (0.375 with seasons off) and share of the crown in leaf. */
  phase: number;
  leafOn: number;
  /** Leaves the tree carries (sim count) and its height in m. */
  leaves: number;
  height: number;
  /** Crown centre and radius in m. */
  cx: number; cy: number; cz: number; crownR: number;
  /** Listener: camera position and its horizontal right vector. */
  camX: number; camY: number; camZ: number; rightX: number; rightZ: number;
  /** Perched birds (world positions); wildlife amount 0..1.5; degrees C. */
  birds: { x: number; y: number; z: number }[];
  wildlife: number;
  temp: number;
  /** World is paused: fade to silence. */
  quiet: boolean;
  volume: number;
}

const sm = (a: number, b: number, x: number) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
const clamp = (x: number, a: number, b: number) => Math.min(b, Math.max(a, x));
const rnd = (a: number, b: number) => a + Math.random() * (b - a);

/** AudioParam with a cached target, so an unchanged value costs no automation event. */
class P {
  last = NaN;
  constructor(readonly p: AudioParam, readonly ctx: BaseAudioContext, readonly tc = 0.09) {}
  set(v: number, tc = this.tc) {
    if (Math.abs(v - this.last) <= 1e-4 + 1e-3 * Math.abs(this.last)) return;
    this.last = v;
    this.p.setTargetAtTime(v, this.ctx.currentTime, tc);
  }
}

interface Bus { g: GainNode; an: AnalyserNode; level: P }
const BUSES = ['wind', 'rustle', 'rain', 'thunder', 'birds', 'night', 'events'] as const;
export type BusName = (typeof BUSES)[number];

/** Bird song templates: a phrase is a list of notes [f0, f1, duration, gap after], frequencies in Hz. */
type Note = [number, number, number, number];
const SPECIES: { winter: boolean; gain: number; phrase: () => Note[] }[] = [
  // Two-note see-saw (tit-like), 3 to 5 pairs.
  { winter: true, gain: 0.8, phrase: () => { const hi = rnd(3900, 4500), lo = hi * rnd(0.72, 0.8), n = 3 + Math.floor(Math.random() * 3), d = rnd(0.09, 0.13), out: Note[] = []; for (let i = 0; i < n; i++) out.push([hi, hi * 0.97, d, 0.03], [lo, lo * 0.98, d * 1.15, 0.06]); return out; } },
  // Mellow warble (thrush-like): slow glides between 1.7 and 3.3 kHz, a pause, then a higher flourish.
  { winter: false, gain: 1, phrase: () => { const out: Note[] = [], n = 4 + Math.floor(Math.random() * 4); let f = rnd(1900, 2700); for (let i = 0; i < n; i++) { const g = clamp(f * rnd(0.78, 1.32), 1700, 3400); out.push([f, g, rnd(0.11, 0.26), rnd(0.03, 0.1)]); f = clamp(g * rnd(0.85, 1.2), 1700, 3300); } if (Math.random() < 0.6) { out[out.length - 1][3] = 0.16; const t = rnd(4200, 5600); for (let i = 0; i < 3; i++) out.push([t, t * rnd(0.8, 1.25), 0.05, 0.03]); } return out; } },
  // Falling chips (finch / sparrow-like), irregular.
  { winter: true, gain: 0.7, phrase: () => { const out: Note[] = [], n = 2 + Math.floor(Math.random() * 4), f = rnd(4600, 6200); for (let i = 0; i < n; i++) out.push([f * rnd(0.95, 1.05), f * rnd(0.55, 0.68), rnd(0.045, 0.07), rnd(0.07, 0.32)]); return out; } },
  // Fast trill that accelerates and falls (wren / chaffinch-like).
  { winter: false, gain: 0.75, phrase: () => { const out: Note[] = [], n = 9 + Math.floor(Math.random() * 8); let f = rnd(4200, 5200), d = 0.07; for (let i = 0; i < n; i++) { out.push([f * 1.12, f * 0.9, d, d * 0.45]); f *= 0.985; d *= 0.95; } out.push([f * 0.8, f * 1.1, 0.12, 0]); return out; } },
  // Soft two-tone coo, low (dove-like); carries on small speakers only faintly.
  { winter: false, gain: 1.1, phrase: () => { const f = rnd(620, 760); return [[f, f * 1.04, 0.32, 0.12], [f * 1.02, f * 0.94, 0.5, 0.25], [f, f * 0.92, 0.42, 0]]; } },
];

export class Soundscape {
  readonly master: GainNode;
  readonly out: AnalyserNode;
  private readonly amb: GainNode;
  private readonly bus = {} as Record<BusName, Bus>;
  private readonly masterP: P;
  private white: AudioBuffer; private pink: AudioBuffer; private brown: AudioBuffer;
  private harm: PeriodicWave;
  // Per-frame parameters.
  private p: Record<string, P> = {};
  private pan: Record<string, P> = {};
  // Slow random walks (Ornstein-Uhlenbeck), so steady weather never sounds like a held note.
  private ou = [0, 0, 0, 0, 0];
  private crickets: { stop: () => void; g: P[]; rate: AudioParam[]; pan: P[]; pos: number[][] } | null = null;
  private cricketIdle = 0;
  /** Distant singers: fixed place and species each, so a voice comes from one spot. */
  private far = Array.from({ length: 6 }, (_, i) => ({ az: rnd(0, 6.283), d: rnd(35, 110), sp: i % SPECIES.length, busy: 0 }));
  private perch = [{ sp: 1, busy: 0 }, { sp: 0, busy: 0 }];
  /** Last derived values, for the debug readout. */
  readonly drive: Record<string, number> = {};
  private sp = { treeGain: 1, treePan: 0, encl: 0, rx: 1, rz: 0, cx: 0, cy: 0, cz: 0 };

  constructor(readonly ctx: BaseAudioContext, dest: AudioNode) {
    const c = ctx;
    this.white = this.noise(3.7, 0); this.pink = this.noise(5.3, 1); this.brown = this.noise(6.1, 2);
    this.harm = c.createPeriodicWave(new Float32Array([0, 0, 0, 0]), new Float32Array([0, 1, 0.16, 0.05]));
    // master -> limiter -> soft clip (hard guarantee |x| < 1) -> out
    this.master = c.createGain(); this.master.gain.value = 0;
    this.masterP = new P(this.master.gain, c, 0.2);
    const lim = c.createDynamicsCompressor();
    lim.threshold.value = -10; lim.knee.value = 8; lim.ratio.value = 12; lim.attack.value = 0.004; lim.release.value = 0.3;
    const clip = c.createWaveShaper(), curve = new Float32Array(1025);
    for (let i = 0; i < 1025; i++) { const x = (i - 512) / 512; curve[i] = Math.tanh(1.25 * x) / Math.tanh(1.25) * 0.97; }
    clip.curve = curve;
    this.out = c.createAnalyser(); this.out.fftSize = 2048;
    this.master.connect(lim).connect(clip).connect(this.out); clip.connect(dest);
    // Thunder ducks everything else.
    this.amb = c.createGain(); this.amb.connect(this.master);
    for (const n of BUSES) {
      const g = c.createGain(), an = c.createAnalyser(); an.fftSize = 2048;
      g.gain.value = n === 'thunder' || n === 'events' || n === 'birds' ? 1 : 0;
      g.connect(an); g.connect(n === 'thunder' ? this.master : this.amb);
      this.bus[n] = { g, an, level: new P(g.gain, c, 0.12) };
    }
    this.buildWind(); this.buildRustle(); this.buildRain();
  }

  private noise(seconds: number, kind: 0 | 1 | 2) {
    const n = Math.floor(seconds * this.ctx.sampleRate), buf = this.ctx.createBuffer(1, n, this.ctx.sampleRate), d = buf.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, br = 0;
    for (let i = 0; i < n; i++) {
      const w = Math.random() * 2 - 1;
      if (kind === 0) d[i] = w * 0.5;
      else if (kind === 1) { b0 = 0.99765 * b0 + w * 0.099046; b1 = 0.963 * b1 + w * 0.2965164; b2 = 0.57 * b2 + w * 1.0526913; d[i] = (b0 + b1 + b2 + w * 0.1848) * 0.11; }
      else { br = (br + 0.02 * w) / 1.02; d[i] = br * 3.2; }
    }
    // Cross-fade the loop seam (20 ms) so the loop point cannot click.
    const f = Math.floor(0.02 * this.ctx.sampleRate);
    for (let i = 0; i < f; i++) { const k = i / f; d[n - f + i] = d[n - f + i] * (1 - k) + d[i] * k; }
    return buf;
  }
  private loop(buf: AudioBuffer, rate = 1) {
    const s = this.ctx.createBufferSource(); s.buffer = buf; s.loop = true; s.playbackRate.value = rate;
    s.start(0, Math.random() * buf.duration * 0.9);
    return s;
  }
  private filt(type: BiquadFilterType, f: number, q = 0.7) { const b = this.ctx.createBiquadFilter(); b.type = type; b.frequency.value = f; b.Q.value = q; return b; }
  private gain(v = 0) { const g = this.ctx.createGain(); g.gain.value = v; return g; }
  private panner(v = 0) { const s = this.ctx.createStereoPanner(); s.pan.value = v; return s; }
  private reg(name: string, p: AudioParam, tc?: number) { return (this.p[name] = new P(p, this.ctx, tc)); }
  /** Slow irregular amplitude modulation: noise played 250x slower, low-passed, added to a gain. */
  private flutter(target: AudioParam, hz: number, depth: number) {
    const s = this.loop(this.white, 0.004), lp = this.filt('lowpass', hz, 0.5), g = this.gain(depth);
    s.connect(lp).connect(g).connect(target);
    return g;
  }

  private buildWind() {
    const B = this.bus.wind.g, pan = this.panner();
    this.pan.wind = new P(pan.pan, this.ctx, 0.3);
    pan.connect(B);
    // Low body (air moving past the ear) and a mid "whoosh" whose colour follows the gust.
    const lo = this.filt('lowpass', 300, 0.4), gl = this.gain(); this.loop(this.brown).connect(lo).connect(gl).connect(pan);
    const mid = this.filt('bandpass', 600, 0.55), gm = this.gain(); this.loop(this.pink, 0.9).connect(mid).connect(gm).connect(pan);
    this.reg('windLoF', lo.frequency, 0.25); this.reg('windLo', gl.gain); this.reg('windMidF', mid.frequency, 0.25); this.reg('windMid', gm.gain);
    this.flutter(gm.gain, 5, 0.25);
    // Bare-crown whistle: two narrow resonances that slide with the gust.
    for (const k of [0, 1]) {
      const bp = this.filt('bandpass', 900, k ? 16 : 22), g = this.gain();
      this.loop(this.white, k ? 0.8 : 1).connect(bp).connect(g).connect(this.bus.rustle.g ? this.treeIn() : pan);
      this.reg('whF' + k, bp.frequency, 0.35); this.reg('wh' + k, g.gain, 0.15);
    }
  }
  private treeNode: StereoPannerNode | null = null;
  /** Everything that sounds at the tree goes through one panner + distance gain. */
  private treeIn() {
    if (!this.treeNode) {
      const pan = this.panner(), g = this.gain(1);
      this.treeNode = pan; pan.connect(g).connect(this.bus.rustle.g);
      this.pan.tree = new P(pan.pan, this.ctx, 0.15); this.reg('treeGain', g.gain, 0.15);
    }
    return this.treeNode;
  }
  private buildRustle() {
    const T = this.treeIn();
    // Leaf hiss: high band, shimmer from two flutters at different speeds; a lower "sough" of the whole crown.
    const hp = this.filt('highpass', 1700, 0.5), bp = this.filt('bandpass', 4500, 0.7), g = this.gain(), sh = this.gain(0.75);
    this.loop(this.white).connect(hp).connect(bp).connect(sh).connect(g).connect(T);
    this.flutter(sh.gain, 9, 1.6); this.flutter(sh.gain, 2.2, 1.2);
    this.reg('rusF', bp.frequency, 0.2); this.reg('rus', g.gain, 0.07);
    const b2 = this.filt('bandpass', 1100, 0.6), g2 = this.gain();
    this.loop(this.pink, 1.1).connect(b2).connect(g2).connect(T);
    this.flutter(g2.gain, 1.5, 0.2);
    this.reg('sough', g2.gain, 0.12); this.reg('soughF', b2.frequency, 0.25);
  }
  private buildRain() {
    const B = this.bus.rain.g;
    // Open rain on grass: two decorrelated wide bands left and right; soft (grass swallows the highs).
    const lp = this.filt('lowpass', 6500, 0.5); lp.connect(B); this.reg('rainLp', lp.frequency, 0.3);
    for (const side of [-1, 1]) {
      const hp = this.filt('highpass', 700, 0.5), g = this.gain(), pan = this.panner(side * 0.65);
      this.loop(this.pink, side > 0 ? 1 : 0.93).connect(hp).connect(g).connect(pan).connect(lp);
      this.reg('rainOpen' + side, g.gain, 0.25);
      this.flutter(g.gain, 0.7, 0.06);
    }
    // Downpour body.
    const bb = this.filt('bandpass', 380, 0.5), gb = this.gain(); this.loop(this.brown, 1.2).connect(bb).connect(gb).connect(lp); this.reg('rainBody', gb.gain, 0.3);
    // Rain on leaves: brighter, patters; sits at the tree.
    const hp = this.filt('highpass', 2200, 0.6), pk = this.filt('peaking', 5200, 1), g = this.gain(), sh = this.gain(0.7), gt = this.gain(1);
    pk.gain.value = 7;
    this.loop(this.white, 1.07).connect(hp).connect(pk).connect(sh).connect(g).connect(gt).connect(B);
    this.flutter(sh.gain, 24, 2.2);
    this.reg('rainLeaf', g.gain, 0.25);
    const pan = this.panner(); gt.disconnect(); gt.connect(pan).connect(B);
    this.pan.leafRain = new P(pan.pan, this.ctx, 0.15);
  }

  /** One short filtered noise burst (drop, snap). */
  private burst(dest: AudioNode, t: number, dur: number, f: number, q: number, amp: number, pan: number, buf = this.white, type: BiquadFilterType = 'bandpass') {
    const c = this.ctx, s = c.createBufferSource(), b = this.filt(type, f, q), g = this.gain(), p = this.panner(clamp(pan, -1, 1));
    s.buffer = buf;
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(amp, t + Math.min(0.004, dur * 0.3)); g.gain.exponentialRampToValueAtTime(Math.max(1e-4, amp * 0.001), t + dur); g.gain.linearRampToValueAtTime(0, t + dur + 0.01);
    s.connect(b).connect(g).connect(p).connect(dest);
    s.start(t, Math.random() * (buf.duration - dur - 0.1), dur + 0.03);
    s.onended = () => p.disconnect();
  }
  private tone(dest: AudioNode, t: number, f0: number, f1: number, dur: number, amp: number, pan: number) {
    const c = this.ctx, o = c.createOscillator(), g = this.gain(), p = this.panner(clamp(pan, -1, 1));
    o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(f1, t + dur);
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(amp, t + 0.006); g.gain.exponentialRampToValueAtTime(Math.max(1e-4, amp * 0.002), t + dur); g.gain.linearRampToValueAtTime(0, t + dur + 0.02);
    o.connect(g).connect(p).connect(dest); o.start(t); o.stop(t + dur + 0.05);
    o.onended = () => p.disconnect();
  }

  /** Stereo position and distance gain of a world point for the current listener. */
  private place(x: number, y: number, z: number, ref = 14) {
    const s = this.sp, dx = x - s.cx, dy = y - s.cy, dz = z - s.cz, dh = Math.hypot(dx, dz), d = Math.hypot(dh, dy);
    return { pan: dh > 0.01 ? ((dx * s.rx + dz * s.rz) / dh) * 0.75 * (dh / (dh + 3)) : 0, gain: Math.pow(ref / (d + ref * 0.45), 0.6), d };
  }

  /** Per frame: derive every layer from the env. */
  update(e: SoundEnv, dt: number) {
    const s = this.sp, D = this.drive;
    for (let i = 0; i < this.ou.length; i++) { const k = [0.5, 0.8, 0.3, 1.2, 0.15][i]; this.ou[i] += (-this.ou[i] * k + (Math.random() * 2 - 1) * 1.7 * Math.sqrt(k)) * Math.min(0.1, dt); this.ou[i] = clamp(this.ou[i], -1, 1); }
    const [o0, o1, o2, o3, o4] = this.ou;
    s.cx = e.camX; s.cy = e.camY; s.cz = e.camZ; s.rx = e.rightX; s.rz = e.rightZ;
    this.masterP.set(e.quiet ? 0 : e.volume * 0.9, e.quiet ? 0.18 : 0.3);
    // Listener and tree.
    const tp = this.place(e.cx, e.cy, e.cz), dh = Math.hypot(e.camX - e.cx, e.camZ - e.cz);
    const foliage = sm(0, 1, Math.pow(clamp(e.leaves / 22000, 0, 1), 0.5)) * e.leafOn; // seedling ~0, grown crown 1
    const wood = sm(1.5, 8, e.height), bare = wood * (1 - sm(0.05, 0.5, e.leafOn * clamp(e.leaves / 4000, 0, 1)));
    const encl = (1 - sm(0.55 * e.crownR, 1.25 * e.crownR + 0.5, dh)) * (e.camY < e.cy + e.crownR ? 1 : 0) * foliage;
    s.treeGain = tp.gain; s.treePan = tp.pan; s.encl = encl;
    this.pan.tree.set(tp.pan); this.p.treeGain.set(tp.gain * (1 + 0.5 * encl));
    const g = clamp(e.gust, 0, 1.2), sheltered = 1 - 0.35 * encl;
    // Wind: level from the gust passing the tree; colour brightens with it; slightly from upwind.
    const wl = (0.012 + 0.5 * Math.pow(g, 1.8)) * (1 + 0.25 * o0) * sheltered;
    this.p.windLo.set(wl * 0.9); this.p.windLoF.set(140 + 520 * g + 60 * o1);
    this.p.windMid.set(wl * (0.25 + 0.9 * g)); this.p.windMidF.set(380 + 1300 * g * (1 + 0.2 * o1));
    this.pan.wind.set(clamp(-(e.windX * e.rightX + e.windZ * e.rightZ) * 0.3, -1, 1));
    this.bus.wind.level.set(1);
    // Bare crown: thin whistle through the twigs, only in a real wind.
    const wh = bare * Math.pow(sm(0.3, 1, g), 2) * 0.16;
    this.p.wh0.set(wh * (1 + 0.5 * o3)); this.p.whF0.set(820 + 900 * g + 140 * o2);
    this.p.wh1.set(wh * 0.6 * (1 - 0.5 * o3)); this.p.whF1.set(1450 + 1300 * g + 200 * o4);
    // Leaves: rustle follows the gust steeply and scales with the foliage; dry autumn leaves are brighter.
    const dry = sm(0.45, 0.62, e.phase) * (1 - sm(0.8, 0.9, e.phase));
    const rus = foliage * (0.006 + 0.62 * Math.pow(g, 2.2)) * (1 + 0.3 * o3);
    this.p.rus.set(rus); this.p.rusF.set(3600 + 2600 * g + 1500 * dry + 300 * o2);
    this.p.sough.set(foliage * 0.5 * Math.pow(g, 1.6) * (1 + 0.2 * o0)); this.p.soughF.set(800 + 700 * g);
    this.bus.rustle.level.set(1);
    // Rain: open rain from first drops to downpour, leaf patter at the tree, muffled under the crown.
    const r = clamp(e.rain, 0, 1), rl = Math.pow(r, 0.75);
    const open = 0.4 * rl * (1 - 0.45 * encl) * (1 + 0.1 * o1);
    this.p['rainOpen-1'].set(open * (1 + 0.12 * o2)); this.p.rainOpen1.set(open * (1 - 0.12 * o2));
    this.p.rainBody.set(0.5 * r * r * (1 - 0.3 * encl)); this.p.rainLp.set(6500 - 3800 * encl + 2500 * r);
    this.p.rainLeaf.set(0.42 * rl * foliage * tp.gain * (1 + 1.2 * encl)); this.pan.leafRain.set(tp.pan * (1 - encl));
    this.bus.rain.level.set(1);
    // Single drops: what you hear before the hiss closes; big leaf drips under the crown.
    const now = this.ctx.currentTime;
    const dropRate = r > 0.004 ? 5 + 22 * sm(0, 0.35, r) : 0;
    for (let n = 0; n < 3 && Math.random() < dropRate * dt / 3 * 3; n++) {
      const leafy = Math.random() < 0.25 + 0.6 * encl && foliage > 0.1;
      if (leafy) this.burst(this.bus.rain.g, now + rnd(0, 0.03), rnd(0.02, 0.05), rnd(900, 2400), 4, rnd(0.05, 0.16) * (0.4 + encl) * tp.gain, tp.pan + rnd(-0.5, 0.5) * (0.3 + encl));
      else this.burst(this.bus.rain.g, now + rnd(0, 0.03), rnd(0.008, 0.02), rnd(2500, 7500), 3, rnd(0.02, 0.09) * (1 - 0.6 * r), rnd(-0.9, 0.9));
    }
    // Birds.
    const dawn = Math.exp(-(((e.hour - 6) / 1.3) ** 2)), dusk = Math.exp(-(((e.hour - 19.3) / 1.0) ** 2));
    const day = Math.max(1 - sm(0.25, 0.55, e.night), 0.85 * dawn * (e.hour < 7 ? 1 : 0));
    const seasonF = 0.22 + 0.98 * sm(-0.02, 0.07, e.phase) * (1 - sm(0.42, 0.72, e.phase)) + 0.25 * sm(0.93, 1, e.phase);
    const winter = e.phase > 0.68 && e.phase < 0.95;
    const act = day * (0.3 + 1.5 * dawn + 0.45 * dusk) * (1 - sm(0.015, 0.2, r)) * (1 - sm(0.5, 0.85, e.base)) * seasonF * Math.min(1.5, e.wildlife);
    D.birdAct = act;
    if (act > 0.005) {
      if (Math.random() < 0.34 * act * dt * this.far.length / 2.2) {
        const v = this.far[Math.floor(Math.random() * this.far.length)];
        if (now > v.busy && (!winter || SPECIES[v.sp].winter)) {
          const x = e.cx + Math.cos(v.az) * v.d, z = e.cz + Math.sin(v.az) * v.d, pl = this.place(x, 3, z, 20);
          v.busy = now + this.sing(v.sp, now + 0.02, 0.05 * pl.gain * rnd(0.6, 1), pl.pan, 3000 + 9000 * pl.gain) + rnd(1.5, 5);
        }
      }
      for (let i = 0; i < e.birds.length && i < 2; i++) {
        const v = this.perch[i], b = e.birds[i];
        if (now > v.busy && Math.random() < 0.5 * Math.min(1, act + 0.3) * dt) {
          const pl = this.place(b.x, b.y, b.z, 12);
          v.busy = now + this.sing(v.sp, now + 0.02, 0.11 * pl.gain, pl.pan, 14000) + rnd(1.2, 4);
        }
      }
    }
    // Night: crickets in the warm seasons, dry and not too windy; slower when it is cold.
    const warm = sm(0.1, 0.2, e.phase) * (1 - sm(0.5, 0.6, e.phase)) * sm(6, 13, e.temp);
    const cr = sm(0.3, 0.75, e.night) * warm * (1 - sm(0.02, 0.2, r)) * (1 - sm(0.45, 0.8, e.base)) * Math.min(1, e.wildlife + 0.4 * (e.wildlife > 0 ? 1 : 0));
    D.crickets = cr;
    if (cr > 0.003) {
      this.cricketIdle = 0;
      const C = (this.crickets ??= this.buildCrickets());
      for (let i = 0; i < C.g.length; i++) {
        const pl = this.place(e.cx + C.pos[i][0], 0.2, e.cz + C.pos[i][1], 10);
        C.g[i].set(cr * 0.05 * pl.gain * (0.7 + 0.3 * this.ou[i % 5])); C.pan[i].set(pl.pan);
        C.rate[i].setTargetAtTime(C.pos[i][2] * clamp(0.55 + (e.temp - 8) / 22, 0.5, 1.25), now, 0.5);
      }
      this.bus.night.level.set(1);
    } else if (this.crickets && (this.cricketIdle += dt) > 3) { this.crickets.stop(); this.crickets = null; this.bus.night.level.set(0); }
    else if (this.crickets) for (const gp of this.crickets.g) gp.set(0);
    D.foliage = foliage; D.bare = bare; D.encl = encl; D.gust = g; D.rain = r; D.treeGain = tp.gain; D.treePan = tp.pan; D.rustle = rus; D.windLvl = wl; D.whistle = wh;
  }

  /** One phrase on a single oscillator; returns its length in s. */
  private sing(sp: number, t0: number, amp: number, pan: number, lpHz: number) {
    const c = this.ctx, S = SPECIES[sp], notes = S.phrase(), o = c.createOscillator(), g = this.gain(), lp = this.filt('lowpass', lpHz, 0.5), p = this.panner(clamp(pan, -1, 1));
    o.setPeriodicWave(this.harm);
    let t = t0; const a = amp * S.gain;
    o.frequency.setValueAtTime(notes[0][0], t0);
    for (const [f0, f1, d, gap] of notes) {
      const k = rnd(0.75, 1);
      o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(f1, t + d);
      g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(a * k, t + Math.min(0.012, d * 0.3)); g.gain.setValueAtTime(a * k, t + d * 0.6); g.gain.linearRampToValueAtTime(0, t + d);
      t += d + gap;
    }
    o.connect(g).connect(lp).connect(p).connect(this.bus.birds.g);
    o.start(t0); o.stop(t + 0.05); o.onended = () => p.disconnect();
    this.drive.birdPhrases = (this.drive.birdPhrases ?? 0) + 1;
    return t - t0;
  }

  private buildCrickets() {
    const c = this.ctx, osc: OscillatorNode[] = [], g: P[] = [], rate: AudioParam[] = [], pan: P[] = [], pos: number[][] = [], outs: AudioNode[] = [];
    const gate = new Float32Array(257), pulse = new Float32Array(257);
    for (let i = 0; i < 257; i++) { const x = (i - 128) / 128; gate[i] = sm(0.1, 0.45, x); pulse[i] = Math.max(0, x) ** 2; }
    for (let i = 0; i < 4; i++) {
      const car = c.createOscillator(), pg = this.gain(0), bg = this.gain(0), vg = this.gain(0), pn = this.panner();
      car.frequency.value = rnd(3800, 4900);
      const pr = c.createOscillator(), ps = c.createWaveShaper(); pr.frequency.value = rnd(26, 38); ps.curve = pulse; pr.connect(ps).connect(pg.gain);
      const br = c.createOscillator(), bs = c.createWaveShaper(), r0 = rnd(1.4, 2.6); br.frequency.value = r0; bs.curve = gate; br.connect(bs).connect(bg.gain);
      car.connect(pg).connect(bg).connect(vg).connect(pn).connect(this.bus.night.g);
      for (const o of [car, pr, br]) { o.start(); osc.push(o); }
      const az = rnd(0, 6.283), d = rnd(6, 26);
      g.push(new P(vg.gain, c, 0.4)); pan.push(new P(pn.pan, c, 0.2)); rate.push(br.frequency); pos.push([Math.cos(az) * d, Math.sin(az) * d, r0]); outs.push(pn);
    }
    return { g, rate, pan, pos, stop: () => { for (const o of osc) o.stop(); for (const n of outs) n.disconnect(); } };
  }

  /** Thunder for a strike `dist` metres away: arrives dist / 343 s later; crack when close, long roll when far. */
  strike(dist: number, pan = 0) {
    const c = this.ctx, B = this.bus.thunder.g, t0 = c.currentTime + dist / 343, near = clamp(1 - (dist - 300) / 500, 0, 1);
    const lvl = 0.55 + 0.45 * near, D = 5 + 6 * (1 - near) + rnd(0, 2), pn = this.panner(clamp(pan, -1, 1) * 0.5);
    pn.connect(B);
    const env = (peaks: number, sharp: number, len: number) => {
      // Sum of swells under a decaying envelope; starts and ends at 0.
      const N = 160, a = new Float32Array(N), sw = Array.from({ length: peaks }, (_, i) => ({ t: i === 0 ? 0.02 + 0.05 * (1 - near) : rnd(0.05, 0.8), w: rnd(0.03, 0.12) / sharp, a: i === 0 ? 1 : rnd(0.35, 0.9) }));
      for (let i = 1; i < N - 1; i++) { const u = i / (N - 1); let v = 0; for (const s of sw) v += s.a * Math.exp(-(((u - s.t) / s.w) ** 2)) * Math.exp(-2.2 * s.t); a[i] = Math.min(1.2, v + 0.25 * Math.exp(-4 * u) * sm(0, 0.04, u)) * (1 - sm(0.8, 1, u)); }
      const g = this.gain(0); g.gain.setValueCurveAtTime(a, t0, len); return g;
    };
    const play = (buf: AudioBuffer, rate: number, node: AudioNode, len: number) => { const s = c.createBufferSource(); s.buffer = buf; s.loop = true; s.playbackRate.value = rate; s.connect(node); s.start(t0 - 0.01, Math.random() * buf.duration * 0.8); s.stop(t0 + len + 0.1); return s; };
    // Deep roll, a mid rumble that small speakers can reproduce, and the tearing crack of a close strike.
    const lo = this.filt('lowpass', 110 + 110 * near, 0.6), gLo = env(5 + Math.floor(rnd(0, 5)), 1, D), aLo = this.gain(1.5 * lvl);
    play(this.brown, rnd(0.55, 0.9), lo, D).onended = () => pn.disconnect(); lo.connect(gLo).connect(aLo).connect(pn);
    const mid = this.filt('bandpass', 330, 0.45), gMid = env(4 + Math.floor(rnd(0, 4)), 1.3, D * 0.8), aMid = this.gain(0.75 * lvl);
    play(this.pink, rnd(0.5, 0.8), mid, D * 0.8); mid.connect(gMid).connect(aMid).connect(pn);
    if (near > 0.2) {
      const hp = this.filt('highpass', 900, 0.5), lp = this.filt('lowpass', 3000 + 5000 * near, 0.5), gC = env(3, 5, 1.1), aC = this.gain(0.9 * near * near);
      play(this.white, 1, hp, 1.1); hp.connect(lp).connect(gC).connect(aC).connect(pn);
    }
    // Duck the rest under the clap, back over about 4 s.
    this.amb.gain.setTargetAtTime(0.5 - 0.15 * near, t0, 0.06); this.amb.gain.setTargetAtTime(1, t0 + 0.9 + 0.5 * D * 0.3, 1.3);
    this.drive.strikes = (this.drive.strikes ?? 0) + 1; this.drive.lastThunderAt = t0; this.drive.lastThunderLen = D;
    return { at: t0, len: D };
  }

  /** A limb or twig breaking at a world point: crack(s), then the thud and leaf swish when it lands. size 0..1. */
  limb(size: number, x: number, y: number, z: number, leaves = 0) {
    const B = this.bus.events.g, pl = this.place(x, y, z, 14), now = this.ctx.currentTime + 0.02, a = pl.gain * (0.25 + 0.75 * size);
    const snaps = size < 0.15 ? 1 : 2 + Math.floor(rnd(0, 3)); let t = now;
    for (let i = 0; i < snaps; i++) {
      this.burst(B, t, rnd(0.02, 0.05) * (1 + size), rnd(1500, 3600) * (1 - 0.4 * size), 1.6, a * rnd(0.5, 0.9), pl.pan);
      this.tone(B, t, rnd(300, 620) * (1 - 0.4 * size), rnd(180, 260), 0.07 + 0.08 * size, a * 0.45, pl.pan);
      t += rnd(0.03, 0.12);
    }
    if (size >= 0.15) {
      this.burst(B, t, 0.3, 2600, 0.5, a * 0.3, pl.pan, this.white, 'highpass'); // splinter tail
      const fall = 0.45 + 0.13 * Math.sqrt(Math.max(0.5, y)) * 2.2;
      this.tone(B, now + fall, 95, 44, 0.32, a * 0.9, pl.pan);
      this.burst(B, now + fall, 0.22, 320, 0.6, a * 0.9, pl.pan, this.brown, 'lowpass');
      if (leaves > 20) this.burst(B, now + fall - 0.05, 0.7, 3200, 0.6, a * 0.28 * Math.min(1, leaves / 600), pl.pan);
    }
    this.drive.breaks = (this.drive.breaks ?? 0) + 1;
  }

  private buf = new Float32Array(2048);
  private rms(an: AnalyserNode) { an.getFloatTimeDomainData(this.buf); let s = 0, pk = 0; for (const v of this.buf) { s += v * v; if (Math.abs(v) > pk) pk = Math.abs(v); } return { rms: Math.sqrt(s / this.buf.length), peak: pk }; }
  /** Per-bus gain and a 43 ms RMS / peak (debug readout). */
  levels() {
    const o: Record<string, { rms: number; peak: number; gain?: number }> = { master: this.rms(this.out) };
    for (const n of BUSES) o[n] = { ...this.rms(this.bus[n].an), gain: this.bus[n].g.gain.value };
    return { t: this.ctx.currentTime, masterGain: this.master.gain.value, duck: this.amb.gain.value, bus: o, drive: { ...this.drive } };
  }
}

const KEY_ON = 'arbor.sound', KEY_VOL = 'arbor.volume';
const ICON_ON = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9.500h3.500L12 5.500v13l-4.500-4H4z"/><path d="M15.500 9a4.200 4.200 0 0 1 0 6M18 6.500a7.800 7.800 0 0 1 0 11"/></svg>';
const ICON_OFF = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9.500h3.500L12 5.500v13l-4.500-4H4z"/><path d="M16 9.500l5 5M21 9.500l-5 5"/></svg>';

/** The app's one audio instance: preference, context life cycle, speaker button. */
class ArborAudio {
  /** Sound is running (context exists and the per-frame update is live). */
  on = false;
  /** The user's choice (remembered); `on` follows it at the next gesture. */
  wanted = false;
  ctx: AudioContext | null = null;
  scape: Soundscape | null = null;
  stats = { frames: 0, sumMs: 0, maxMs: 0 };
  private btn: HTMLButtonElement | null = null;
  private armed = false;

  constructor() {
    try { this.wanted = localStorage.getItem(KEY_ON) === '1'; } catch { /* private mode */ }
  }
  storedVolume(def: number) { try { const v = Number(localStorage.getItem(KEY_VOL) ?? NaN); return Number.isFinite(v) ? clamp(v, 0, 1) : def; } catch { return def; } }
  private vol = NaN;
  private saveVolume(v: number) { if (v === this.vol) return; this.vol = v; try { localStorage.setItem(KEY_VOL, String(v)); } catch { /* private mode */ } }

  /** Speaker button (DOM only, no audio). A remembered "on" starts at the first gesture: browsers allow nothing earlier. */
  mount() {
    const b = (this.btn = document.createElement('button'));
    b.type = 'button'; b.id = 'arbor-sound';
    b.addEventListener('click', (ev) => { ev.stopPropagation(); this.setOn(!this.wanted); });
    document.body.appendChild(b);
    this.paint();
    if (this.wanted) this.arm();
    document.addEventListener('visibilitychange', () => this.sync());
  }
  private arm() {
    if (this.armed) return;
    this.armed = true;
    const go = () => { removeEventListener('pointerup', go, true); removeEventListener('keydown', go, true); this.armed = false; if (this.wanted && !this.on) this.setOn(true); };
    addEventListener('pointerup', go, true); addEventListener('keydown', go, true);
  }
  private paint() {
    const b = this.btn; if (!b) return;
    b.innerHTML = (this.wanted ? ICON_ON : ICON_OFF) + `<span>${this.wanted ? 'Sound on' : 'Sound off'}</span>`;
    b.setAttribute('aria-pressed', String(this.wanted));
    b.title = b.ariaLabel = this.wanted ? 'Sound on (tap to mute)' : 'Turn sound on';
  }
  /** Must be called from a user gesture when turning on. */
  setOn(v: boolean) {
    this.wanted = v;
    try { localStorage.setItem(KEY_ON, v ? '1' : '0'); } catch { /* private mode */ }
    this.paint();
    if (v) {
      if (!this.ctx) {
        const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
        if (!AC) return;
        try {
          this.ctx = new AC({ latencyHint: 'playback' });
          this.scape = new Soundscape(this.ctx, this.ctx.destination);
          // A context the browser suspends or interrupts (call, other app) comes back at the next chance.
          this.ctx.addEventListener('statechange', () => { if (this.on && this.ctx?.state !== 'running' && document.visibilityState === 'visible') this.arm(); });
        } catch (e) { console.warn('arbor audio unavailable', e); this.ctx = null; this.scape = null; return; }
      }
      this.on = true;
      this.sync();
    } else if (this.ctx && this.scape) {
      // Fade out, then suspend: no per-frame work and no audio thread work while off.
      this.on = false;
      const c = this.ctx, g = this.scape.master.gain;
      g.cancelScheduledValues(c.currentTime); g.setTargetAtTime(0, c.currentTime, 0.05);
      setTimeout(() => { if (!this.on) void c.suspend(); }, 300);
    }
  }
  /** Hidden tab: suspend. Visible and on: resume. */
  private sync() {
    const c = this.ctx; if (!c) return;
    if (document.visibilityState === 'hidden') { if (c.state === 'running') void c.suspend(); }
    else if (this.on && c.state !== 'running') void c.resume().catch(() => this.arm());
  }
  /** Once per frame from `main.ts`, only while `on`. */
  frame(e: SoundEnv, dt: number) {
    if (!this.on || !this.scape || this.ctx!.state !== 'running') return;
    const t0 = performance.now();
    this.saveVolume(e.volume);
    this.scape.update(e, dt);
    const ms = performance.now() - t0;
    this.stats.frames++; this.stats.sumMs += ms; if (ms > this.stats.maxMs) this.stats.maxMs = ms;
  }
  strike(dist: number, pan = 0) { if (this.on && this.scape && this.ctx!.state === 'running') this.scape.strike(dist, pan); }
  limb(size: number, x: number, y: number, z: number, leaves = 0) { if (this.on && this.scape && this.ctx!.state === 'running') this.scape.limb(size, x, y, z, leaves); }
  /** Debug readout: null before the first gesture (nothing exists). */
  levels() { return this.scape ? { on: this.on, state: this.ctx!.state, ...this.scape.levels(), updMs: this.stats.frames ? this.stats.sumMs / this.stats.frames : 0, updMaxMs: this.stats.maxMs, frames: this.stats.frames } : null; }

  /**
   * Offline render of a scripted scene to a 16-bit stereo WAV (base64). `keys` = env values at times (linear between
   * keys; numbers only), `events` = strikes and limb breaks. The gust comes from a private `Wind` run on the keys' wind.
   */
  async render(seconds: number, keys: { t: number; env: Partial<SoundEnv> & { wind?: number; storm?: number } }[], events: { t: number; strike?: number; limb?: number }[] = [], sampleRate = 44100) {
    const oc = new OfflineAudioContext(2, Math.ceil(seconds * sampleRate), sampleRate), sc = new Soundscape(oc, oc.destination), w = new Wind();
    const base: SoundEnv & { wind: number; storm: number } = { gust: 0, base: 0, windX: w.dirX, windZ: w.dirZ, rain: 0, night: 0, hour: 12, phase: 0.3, leafOn: 1, leaves: 30000, height: 9, cx: 0, cy: 5.5, cz: 0, crownR: 5, camX: 4, camY: 2, camZ: 22, rightX: 1, rightZ: 0, birds: [{ x: 2, y: 6, z: 1 }], wildlife: 1, temp: 18, quiet: false, volume: 0.8, wind: 0.35, storm: 0 };
    const STEP = 1 / 30, ev = [...events].sort((a, b) => a.t - b.t);
    let ei = 0;
    const at = (t: number) => {
      const e = { ...base } as Record<string, unknown>;
      let a = keys[0], b = keys[0];
      for (const k of keys) { if (k.t <= t) a = b = k; else { b = k; break; } }
      const u = b.t > a.t ? (t - a.t) / (b.t - a.t) : 0;
      for (const k of keys) { if (k.t > a.t) break; Object.assign(e, k.env); } // carry earlier keys forward
      for (const f in b.env) { const x = (e as Record<string, unknown>)[f], y = (b.env as Record<string, unknown>)[f]; if (typeof x === 'number' && typeof y === 'number') e[f] = x + (y - x) * u; }
      return e as unknown as SoundEnv & { wind: number; storm: number };
    };
    const step = (t: number) => {
      const e = at(t);
      w.update(STEP, e.wind, e.night, e.storm);
      e.base = w.base; e.gust = w.gust(e.cx, e.cz);
      sc.update(e, STEP);
      while (ei < ev.length && ev[ei].t <= t) { const x = ev[ei++]; if (x.strike) sc.strike(x.strike, 0.3); if (x.limb) sc.limb(x.limb, 2, 5, 1, 400); }
    };
    step(0);
    for (let t = STEP; t < seconds; t += STEP) void oc.suspend(t).then(() => { step(t); void oc.resume(); });
    const buf = await oc.startRendering(), L = buf.getChannelData(0), R = buf.getChannelData(1), n = L.length;
    const dv = new DataView(new ArrayBuffer(44 + n * 4)), str = (o: number, s: string) => { for (let i = 0; i < s.length; i++) dv.setUint8(o + i, s.charCodeAt(i)); };
    str(0, 'RIFF'); dv.setUint32(4, 36 + n * 4, true); str(8, 'WAVEfmt '); dv.setUint32(16, 16, true); dv.setUint16(20, 1, true); dv.setUint16(22, 2, true);
    dv.setUint32(24, sampleRate, true); dv.setUint32(28, sampleRate * 4, true); dv.setUint16(32, 4, true); dv.setUint16(34, 16, true); str(36, 'data'); dv.setUint32(40, n * 4, true);
    let peak = 0, sq = 0;
    for (let i = 0; i < n; i++) { const l = clamp(L[i], -1, 1), r = clamp(R[i], -1, 1); peak = Math.max(peak, Math.abs(L[i]), Math.abs(R[i])); sq += l * l + r * r; dv.setInt16(44 + i * 4, l * 32767, true); dv.setInt16(46 + i * 4, r * 32767, true); }
    const bytes = new Uint8Array(dv.buffer); let bin = '';
    for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
    return { wav: btoa(bin), seconds: n / sampleRate, peak, rms: Math.sqrt(sq / (2 * n)) };
  }
}

export const audio = new ArborAudio();

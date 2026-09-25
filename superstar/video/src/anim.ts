import {interpolate} from 'remotion';
import {EASE} from './theme';

type Ease = (t: number) => number;

/** 0→1 progress of a tween starting at `start` lasting `dur` frames. */
export const ramp = (f: number, start: number, dur: number, ease: Ease = EASE.out) =>
  interpolate(f, [start, start + dur], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease});

/** in→hold→out envelope (0..1). */
export const env = (f: number, a: number, inDur: number, b: number, outDur: number, ei: Ease = EASE.out, eo: Ease = EASE.in) =>
  Math.min(ramp(f, a, inDur, ei), 1 - ramp(f, b, outDur, eo));

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
export const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
export const mapr = (v: number, a: number, b: number, c: number, d: number) => c + ((v - a) / (b - a)) * (d - c);

/** Damped spring settle: 0→1 with a single overshoot, deterministic. */
export const settle = (f: number, start: number, dur: number, overshoot = 0.12) => {
  const t = clamp01((f - start) / dur);
  if (t <= 0) return 0;
  const k = 1 - Math.pow(1 - t, 3);
  return k + Math.sin(t * Math.PI) * overshoot * (1 - t);
};

/** Critically-damped-ish spring 0→1 (physically flavoured, deterministic). */
export const spring01 = (f: number, start: number, freq = 2.2, damp = 5.5, fps = 60) => {
  const t = (f - start) / fps;
  if (t <= 0) return 0;
  return 1 - Math.exp(-damp * t) * Math.cos(freq * Math.PI * 2 * t * 0.5);
};

/** Deterministic PRNG (mulberry32). */
export const rng = (seed: number) => {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

/** Smooth value noise 1D, deterministic. */
export const noise1 = (x: number, seed = 1) => {
  const h = (n: number) => {
    const s = Math.sin(n * 127.1 + seed * 311.7) * 43758.5453;
    return s - Math.floor(s);
  };
  const i = Math.floor(x);
  const fr = x - i;
  const u = fr * fr * (3 - 2 * fr);
  return lerp(h(i), h(i + 1), u) * 2 - 1;
};

/** Camera shake offset from an impulse at `at` (decays). */
export const shake = (f: number, at: number, amp: number, decay = 14, seed = 3) => {
  const t = f - at;
  if (t < 0 || t > decay * 5) return {x: 0, y: 0};
  const k = amp * Math.exp(-t / decay);
  return {x: noise1(t * 0.9, seed) * k, y: noise1(t * 0.9, seed + 7) * k};
};

export const fmtUSD = (v: number, dp = 0) =>
  '$' + v.toLocaleString('en-US', {minimumFractionDigits: dp, maximumFractionDigits: dp});
export const fmtInt = (v: number) => Math.round(v).toLocaleString('en-US');

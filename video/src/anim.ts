import {interpolate} from 'remotion';
import {EASE} from './theme';

type Ease = (t: number) => number;

/** 0→1 progress of a tween starting at `start` lasting `dur` frames. */
export const ramp = (f: number, start: number, dur: number, ease: Ease = EASE.out) =>
  interpolate(f, [start, start + dur], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: ease,
  });

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

/** Damped spring settle: 0→1 with a single overshoot, deterministic. */
export const settle = (f: number, start: number, dur: number, overshoot = 0.12) => {
  const t = clamp01((f - start) / dur);
  if (t <= 0) return 0;
  const k = 1 - Math.pow(1 - t, 3);
  return k + Math.sin(t * Math.PI) * overshoot * (1 - t);
};

/** Damped oscillation (for the tie swing): starts at amp, decays to 0. */
export const swing = (f: number, start: number, amp: number, periodFrames: number, decayFrames: number) => {
  const t = f - start;
  if (t < 0) return amp;
  return amp * Math.cos((t / periodFrames) * Math.PI * 2) * Math.exp(-t / decayFrames);
};

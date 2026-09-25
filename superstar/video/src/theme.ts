import {Easing} from 'remotion';

// ============================================================
// Deploy design system tokens (deploy-diagrams / design-system.md).
// The ONLY place colours, fonts and motion constants live.
//  - One accent hue: indigo. Everything else is grey.
//  - No gradient grounds, no decorative glows, no green/red.
//  - Geist Mono = labels/UI/numbers, Season Serif
//    = statement numerals + verdict words, Season Sans = body.
// ============================================================

export const C = {
  // accent (indigo) — the only chromatic colour
  brand: '#474DEF', // strongest accent moment
  accent: '#5B61E0', // cores, pulses, active strokes
  muted: '#4B4FB0', // quieter accent fills
  soft: '#8487D6', // secondary lines
  light: '#A6ABFF', // highlights, small text on dark
  lighter: '#C4C7FF',
  deep: '#33367A', // verdict serif text on light
  deep2: '#383C8A',
  deep3: '#2A2C66',
  // dark grounds + panels
  bg: '#08080E',
  bg2: '#0B0B14',
  bg3: '#0D0D14',
  panel: '#101019',
  panel2: '#12121D',
  panel3: '#171725',
  // text on light
  text: '#0B0B14', // ink
  t1: '#4B4C66',
  t2: '#6E6E84',
  t3: '#8A8BA3',
  t4: '#9A9AAB',
  faint: '#B0B1C6',
  faint2: '#B7B8C8',
  // light surfaces + borders
  white: '#FFFFFF',
  surf: '#F6F6FB',
  surf2: '#F1F1FA',
  surf3: '#F7F7FC',
  border: '#E8E8F1',
  border2: '#ECECF4',
  border3: '#E6E7F2',
  // neutral marks (inactive)
  grey: '#C6C7D4',
  grey2: '#C7C8DE',
  grey3: '#DBDCE6',
  // hairlines on dark
  lineDark: 'rgba(166,171,255,.14)',
  lineDark2: 'rgba(255,255,255,.08)',
} as const;

// translucent accent helpers (sanctioned in the system)
export const A = (alpha: number) => `rgba(91,97,224,${alpha})`; // accent
export const AM = (alpha: number) => `rgba(75,79,176,${alpha})`; // accent muted
export const AL = (alpha: number) => `rgba(166,171,255,${alpha})`; // accent light
export const G = (alpha: number) => `rgba(138,139,163,${alpha})`; // grey t3

export const FONT = {
  mono: '"Geist Mono", "Geistmono", ui-monospace, Menlo, monospace',
  serif: '"Season Serif", "Seasonserif", Georgia, serif',
  sans: '"Season Sans", "Inter", system-ui, sans-serif',
} as const;

export const W = 1080;
export const H = 1920;
export const FPS = 60;

// Safe area for 9:16 platforms (keep critical content inside)
export const SAFE = {top: 250, bottom: 1600, left: 72, right: 1008} as const;

// Viewport card (the canonical Deploy surface), scaled ×2 for 1080-wide film
export const CARD = {
  radius: 44,
  border: `2px solid ${C.border}`,
  shadow: '0 80px 180px -120px rgba(70,70,130,.55)',
} as const;

// Music grid: 120 BPM → beat = 30 f, bar = 120 f @ 60 fps
export const BEAT = 30;
export const BAR = 120;

export const EASE = {
  sys: Easing.bezier(0.3, 0.7, 0.2, 1), // the system curve cubic-bezier(.3,.7,.2,1)
  out: Easing.bezier(0.16, 1, 0.3, 1), // expo-out arrivals
  in: Easing.bezier(0.7, 0, 0.84, 0), // expo-in exits
  inOut: Easing.bezier(0.87, 0, 0.13, 1), // expo-in-out moves
  soft: Easing.bezier(0.33, 1, 0.68, 1), // cubic-out
  cubic: Easing.bezier(0.65, 0, 0.35, 1), // cubic-in-out
} as const;

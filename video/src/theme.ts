import {Easing} from 'remotion';

// ============================================================
// Editorial Brutalist tokens — mirrored 1:1 from
// assets/brand/shadcn-editorial.html. The ONLY place colours,
// fonts and the grid are defined. No other hexes in the film.
// ============================================================

export const C = {
  black: '#000000',
  white: '#FFFFFF',
  lime: '#E9FEA3',
  yellow: '#FBFD78',
  lilac: '#CB9FD2',
  blue: '#4C49F3',
  greyBg: '#E2E2E2',
  greyBlock: '#CFCFCF',
  mutedDark: '#9A9A9A', // secondary text on black
  mutedLight: '#555555', // secondary text on light accents
  label: '#6B6B6B', // field labels on white
  ink: '#1F2430', // logo ink (wordmark letters on light grounds only)
  // hairlines (the kit's --border / --border-strong)
  border: 'rgba(0,0,0,.20)',
  borderStrong: 'rgba(0,0,0,.42)',
  borderOnDark: 'rgba(255,255,255,.14)',
} as const;

export const FONT = {
  sans: '"Manrope", "Inter", "Helvetica Neue", Arial, sans-serif',
  mono: '"JetBrains Mono", ui-monospace, Menlo, monospace',
} as const;

// Kit weights: --fw-light 200 · --fw-mid 300 · --fw-semi 500 · --fw-bold 600
export const FW = {light: 200, mid: 300, semi: 500, bold: 600} as const;

export const W = 1920;
export const H = 1080;
export const FPS = 60;

// Deck canvas is 720×405 pt → 1 pt = 2.6667 px at 1080p.
export const PT = W / 720;
export const pt = (v: number) => v * PT;

export const GRID = {
  marginL: pt(63), // 168
  marginR: W - pt(63), // 1752
  chipX: pt(57), // 152
  chipY: pt(45), // 120
  footerBottom: pt(375),
  footerTop: pt(17),
  hair: 2, // 0.75pt hairline at 1080p
  radius: 30, // kit --radius 11px scaled for film (≈ 14pt card radius)
} as const;

// Music grid: 120 BPM → beat = 30f, bar = 120f @ 60fps
export const BEAT = 30;
export const BAR = 120;

// Easing vocabulary (brief §5)
export const EASE = {
  out: Easing.bezier(0.16, 1, 0.3, 1), // expo-out: arrivals
  in: Easing.bezier(0.7, 0, 0.84, 0), // expo-in: exits
  inOut: Easing.bezier(0.87, 0, 0.13, 1), // expo-in-out: moves
  kit: Easing.bezier(0.2, 0.7, 0.2, 1), // the kit's own transition curve
  soft: Easing.bezier(0.33, 1, 0.68, 1), // cubic-out
} as const;

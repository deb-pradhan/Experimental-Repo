import {Easing} from 'remotion';

// ============================================================
// Deploy colour system (docs/02-color-system.md, client-supplied).
// The ONLY place colours, fonts and motion constants live.
//  - 60-30-10: ~60% Soft Black or White, ~30% Blue Glow, ~10% Turquoise/Gray.
//  - Turquoise = one emphasised element per composition, never a surface.
//  - No opacity tints of brand colours: ramp steps only. The single approved
//    opacity is the rgba(255,255,255,0.1) frosted-glass card on dark.
//  - No green/red for long/short: Blue Glow (active) vs Gray (inactive) + label.
// Type: Season Sans (headlines/body), Season Serif (numerals, accent words),
//       Geist Mono (status headers, labels, data).
// ============================================================

export const BLACK = {100: '#F2F2F2', 200: '#D6D6D6', 300: '#B8B8B8', 400: '#8F8F8F', 500: '#131313', 600: '#101010', 700: '#0C0C0C', 800: '#080808', 900: '#040404', 1000: '#000000'} as const;
export const BLUE = {100: '#EEF0FF', 200: '#D9DDFF', 300: '#B8BEFF', 400: '#7E86F5', 500: '#474DEF', 600: '#3E44D1', 700: '#3338B0', 800: '#272C8C', 900: '#1D2166', 1000: '#141842'} as const;
export const WHITE = {100: '#FFFFFF', 200: '#FAFAFA', 300: '#F5F5F7', 400: '#EFEFF2', 500: '#FFFFFF', 600: '#E6E6EA', 700: '#CFCFD6', 800: '#B8B8C2', 900: '#9F9FA9', 1000: '#868692'} as const;
export const GRAY = {100: '#FFFFFF', 200: '#FBFBFF', 300: '#F6F6FF', 400: '#E9E9F2', 500: '#F6F6FF', 600: '#D2D2DD', 700: '#B2B2BF', 800: '#8F8F9C', 900: '#6B6B78', 1000: '#484855'} as const;
export const TURQ = {100: '#ECFFFF', 200: '#C8FFFF', 300: '#9AFFFF', 400: '#4EF2F2', 500: '#00E2E2', 600: '#00C6C6', 700: '#00A3A3', 800: '#007D7D', 900: '#005757', 1000: '#003333'} as const;

export const C = {
  // anchors
  softBlack: BLACK[500], // primary dark surface / primary text on light
  blue: BLUE[500], // Blue Glow — the brand carrier
  white: WHITE[100],
  gray: GRAY[300], // soft brand-tinted surface
  turq: TURQ[500], // accent only
  black: BLACK[1000],
  // text on light
  ink: BLACK[500],
  mute: GRAY[900], // primary muted text
  mute2: GRAY[800], // secondary text on gray
  mute3: GRAY[700], // tertiary text
  // surfaces + lines on light
  card: WHITE[100], // card on gray section
  cardGray: GRAY[400], // card on gray section (tinted)
  line: GRAY[600], // border on gray section
  hair: WHITE[600], // light hairline border on white
  // text + lines on dark
  onDark: WHITE[100],
  onDarkMute: BLACK[400], // muted text on dark
  onDarkMute2: BLACK[300],
  frost: 'rgba(255,255,255,0.1)', // the one approved opacity: frosted-glass card / hairline on dark
  // blue ramp shortcuts
  b100: BLUE[100], b200: BLUE[200], b300: BLUE[300], b400: BLUE[400], b600: BLUE[600], b700: BLUE[700], b800: BLUE[800], b900: BLUE[900], b1000: BLUE[1000],
} as const;

export const FONT = {
  mono: '"Geist Mono", "Geistmono", ui-monospace, Menlo, monospace',
  serif: '"Season Serif", "Seasonserif", Georgia, serif',
  sans: '"Season Sans", "Seasonsans", "Inter", system-ui, sans-serif',
} as const;

export const W = 1080;
export const H = 1920;
export const FPS = 60;

// Safe area for 9:16 platforms (keep critical content inside)
export const SAFE = {top: 250, bottom: 1600, left: 72, right: 1008} as const;

// Viewport card (Deploy surface), scaled for a 1080-wide film.
// Shadow is a soft neutral drop shadow (not a coloured glow).
export const CARD = {
  radius: 44,
  border: `2px solid ${GRAY[600]}`,
  shadow: '0 60px 140px -90px rgba(19,19,19,.35)',
} as const;

// Music grid: 120 BPM → beat = 30 f, bar = 120 f @ 60 fps
export const BEAT = 30;
export const BAR = 120;

export const EASE = {
  sys: Easing.bezier(0.3, 0.7, 0.2, 1), // system curve cubic-bezier(.3,.7,.2,1)
  out: Easing.bezier(0.16, 1, 0.3, 1), // expo-out arrivals
  in: Easing.bezier(0.7, 0, 0.84, 0), // expo-in exits
  inOut: Easing.bezier(0.87, 0, 0.13, 1), // expo-in-out moves
  soft: Easing.bezier(0.33, 1, 0.68, 1), // cubic-out
  cubic: Easing.bezier(0.65, 0, 0.35, 1), // cubic-in-out
} as const;

/** Linear mix between two ramp hexes (for animated transitions between two approved steps). */
export const mixHex = (a: string, b: string, t: number) => {
  const pa = parseInt(a.slice(1), 16), pb = parseInt(b.slice(1), 16);
  const ch = (s: number) => Math.round(((pa >> s) & 255) * (1 - t) + ((pb >> s) & 255) * t);
  return `rgb(${ch(16)},${ch(8)},${ch(0)})`;
};

// ============================================================
// Single source of truth for timing. 60 fps · 120 BPM (beat 30 f, bar 120 f).
// Scenes cut on the score's bar lines (take A, delayed 0.02 s so its downbeats
// sit exactly on film 26.00 s + 2k). See docs/01-director-treatment.md.
// Every scene component works in LOCAL frames (0 = scene start).
// ============================================================

export const FPS = 60;

export type SceneId = 'S01' | 'S02' | 'S03' | 'S04' | 'S05' | 'S06' | 'S07' | 'S08' | 'S09' | 'S10' | 'S11' | 'S12' | 'S13';

export const SCENES: Record<SceneId, {from: number; to: number; ground: 'dark' | 'gray' | 'blue' | 'white'; name: string}> = {
  S01: {from: 0, to: 480, ground: 'dark', name: 'Cold open · candle canyon'},
  S02: {from: 480, to: 930, ground: 'dark', name: 'Whipsaw · 3D BTC candles + liquidations'},
  S03: {from: 930, to: 1320, ground: 'dark', name: 'Both sides wrecked · freeze · collapse'},
  S04: {from: 1320, to: 1560, ground: 'gray', name: 'Reveal · Superstar core'},
  S05: {from: 1560, to: 2040, ground: 'gray', name: 'Every four hours · the loop'}, // Blue Glow panel painted in-scene (floods in, contracts out)
  S06: {from: 2040, to: 2520, ground: 'gray', name: '01 Read the last four hours'},
  S07: {from: 2520, to: 3000, ground: 'gray', name: '02 Build a picture · signal bus'},
  S08: {from: 3000, to: 3480, ground: 'gray', name: '03 Argue both sides → 04 Choose'},
  S09: {from: 3480, to: 3930, ground: 'gray', name: '04 Choose · nothing is a valid move'}, // Blue Glow panel painted in-scene
  S10: {from: 3930, to: 4560, ground: 'gray', name: 'Risk first · three rules · trailing stop'},
  S11: {from: 4560, to: 5040, ground: 'gray', name: 'Proof · simulated backtest'},
  S12: {from: 5040, to: 5400, ground: 'blue', name: 'Where it runs · Hyperliquid · USDC'},
  S13: {from: 5400, to: 5940, ground: 'white', name: 'End card · Deploy lockup'},
};

export const DURATION = 5940; // 99.0 s
export const dur = (id: SceneId) => SCENES[id].to - SCENES[id].from;

// Score: take A with a 4-bar repeat (src 41.98–49.98 s) inserted at src 49.98 s, delayed by 0.02 s.
export const MUSIC = {delay: 0.02, repeatSrc: [41.98, 49.98], insertAt: 49.98} as const;

// Voiceover: lines + every word at its FILM time (seconds). Built by tools/vo_plan.py.
import VO_JSON from './data/vo.json';
export type VOWord = [number, number, string];
export type VOLine = {id: string; text: string; start: number; end: number; words: VOWord[]};
export const VO = VO_JSON as {source: string; lines: VOLine[]};
/** Film frame of a VO line start. */
export const voF = (id: string) => Math.round(VO.lines.find((l) => l.id === id)!.start * FPS);
/** Film frame of the n-th word (0-based) in a line whose text matches `needle` (case-insensitive). */
export const wordF = (id: string, needle: string, nth = 0) => {
  const l = VO.lines.find((x) => x.id === id)!;
  const hits = l.words.filter((w) => w[2].toLowerCase().replace(/[^a-z0-9]/g, '').startsWith(needle.toLowerCase()));
  const w = hits[nth] ?? l.words[0];
  return Math.round(w[0] * FPS);
};
/** Convert a film frame to a scene-local frame. */
export const local = (id: SceneId, filmFrame: number) => filmFrame - SCENES[id].from;

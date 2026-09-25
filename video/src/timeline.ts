// ============================================================
// Single source of truth for timing. 60 fps · 120 BPM.
// 1 beat = 30 f · 1 bar = 120 f. Scenes cut on bar lines
// (S7→S8 cuts on the half-bar to give the logo room).
// tools/mix_audio.py reads the exported cue sheet (cues.json).
// ============================================================

export const SCENES = {
  s1: {from: 0, to: 240}, // The pile (3D)
  s2: {from: 240, to: 480}, // The filter (3D)
  s3: {from: 480, to: 720}, // The read: tie, chaos → list (3D → 2D)
  s4: {from: 720, to: 960}, // Ranked on merit (UI, white)
  s5: {from: 960, to: 1200}, // Interviewed for real (UI, lime)
  s6: {from: 1200, to: 1440}, // Shortlist (black, bleeding cards)
  s7: {from: 1440, to: 1620}, // Climax (blue)
  s8: {from: 1620, to: 1800}, // End card (white, logo)
} as const;

export const DURATION = 1800;

// Key picture events (global frames) that sound and VO sync to.
export const EV = {
  s1Line1: 36, // "One role."
  s1Counter: 100, // "312 applications." counter starts
  landFirst: 20,
  landLast: 225,
  s2ChipIn: 262,
  scanStart: 276,
  scanEnd: 372,
  s2Super: 300, // "Most are never read."
  s3TieStart: 500,
  s3TieLand: 530, // tock
  s3ReadWave: 534, // cards return, "Every application, read."
  s3ListStart: 600,
  s3VoidClose: 664,
  s4Count: 764, // scores count up
  s4Sort: 850, // FLIP re-sort
  s4Invite: 912, // top 3 → Invited
  s5Wipe: 944,
  s5Rec: 990,
  s5Switch: 1010,
  s5Meters: 1040,
  s6Wipe: 1184,
  s6Cards: [1212, 1242, 1272, 1302],
  s6Call: 1322, // "You make the call."
  s6Toast: 1350,
  s7Grow: 1400, // blue card grows into the ground
  s7Words: [1446, 1498, 1524],
  s8Reveal: 1612, // blue curtain lifts
  s8Glyphs: 1622,
  s8TieDrop: 1640,
  s8TieLand: 1660,
  s8Rule: 1684,
  s8Tagline: 1700,
  s8Footer: 1716,
} as const;

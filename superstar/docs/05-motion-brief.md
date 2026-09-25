# 05 — Motion brief (for every scene builder)

Read first: `01-director-treatment.md`, `02-color-system.md` (strict), `04-script.md`. The quality bar is a top-agency
portfolio piece: every frame is designed, motion is physical and purposeful, nothing sits static for more than ~0.5 s.

## Project
- Remotion project: `superstar/video` (1080×1920, 60 fps). Fonts load in `src/fonts.ts`.
- Scene files: `src/scenes/SNN.tsx`, each exports `SNN: React.FC` (no props), `T` (timing constants, LOCAL frames) and
  `CUES` (SFX cue list, see below). A scene renders inside a `<Sequence>` on its own ground colour
  (`SCENES[id].ground` in `src/timeline.ts`: gray `#F6F6FF` / blue `#474DEF` / white / dark `#131313`). Don't paint a ground unless
  your scene needs a transition of it.
- Shared, **read-only for scene builders** (ask the Director for changes): `theme.ts`, `anim.ts`, `timeline.ts`, `Film.tsx`,
  `Root.tsx`, `components/ui.tsx`, `components/Star.tsx`, `components/Token.tsx`, `data/*`. You may add new helper files
  named `components/<SceneId>_*.tsx`.
- Data: `import M from '../data/market.json'` (live BTC data: `M.btc.h4`, `M.btc.h1_48`, `M.btc.last4h`, `M.last4hReadings`,
  `M.liquidations`), `import {BACKTEST} from '../data/backtest'` (simulated backtest arrays).
- VO sync: `import {VO, voF, wordF, local} from '../timeline'`. `local('S07', wordF('L12','leverage'))` gives the LOCAL frame
  where the narrator says "leverage". Key animations must land on the words.
- Render QA stills fast: `cd superstar/video && node qa/stills.mjs S07 <outDir> 0,60,120,240,360,479 0.5 3` → PNGs + a
  labelled contact sheet (`<outDir>/S07_sheet.png`). Look at them (Read tool) and fix what you see. Check at least 10
  timestamps per scene, including the first and last frames, every VO sync point, and mid-transition frames.
- `npx tsc --noEmit` must pass.

## Design law (non-negotiable)
- Colours only from `theme.ts` ramps (BLUE, GRAY, WHITE, BLACK, TURQ, `C`). **No opacity tints of brand colours** to
  invent shades (use ramp steps; `mixHex` to animate between two ramp steps). The only approved static opacity is
  `C.frost` (white 10%) on dark. Animated opacity for entrances/exits is allowed but prefer masks, moves and scale.
- **60-30-10:** Gray/White ≈ 60% of the frame, **Blue Glow ≈ 30%** (make it carry real area: filled panels, chart areas,
  big numerals, the core, active states), Turquoise ≤ 10% and **exactly one** turquoise element per scene.
- No green/red. Long/up = Blue Glow, short/down = Gray ramp (700–900) + the label. No gradients, no glows, no drop-shadow
  colours other than the neutral card shadow in `CARD.shadow`.
- Approved pairings only: white text on Blue Glow or Soft Black; `#131313`/black text on white/Gray; black text on Turquoise.
  Never turquoise text on blue, blue text on turquoise, white on turquoise.
- Type: Season Sans (headlines 500 weight, tracking −0.02em), Season Serif (numerals, accent words — in Blue Glow on light),
  Geist Mono (lowercase status headers `superstar · review`, uppercase micro-labels with .14–.18em tracking, data).
  Minimum sizes at 1080 wide: mono labels ≥ 22 px, body ≥ 36 px, headlines 64–140 px, hero numerals up to 220 px.
- Safe area: keep text within x 72–1008, y 250–1600 (platform UI covers the edges).
- Token logos only via `<Token id="btc|usdc|hyperliquid|hyperliquid-mono|eth|sol" />` (official library SVGs). Never draw a logo.
- Every performance number carries a visible "Simulated backtest" label while on screen.

## Motion law
- Easing from `EASE` (`sys` = the house curve `cubic-bezier(.3,.7,.2,1)`, `out` expo for arrivals, `in` for exits,
  `inOut` for moves). Springs with one overshoot via `settle()`. Draw-ons 1.2–1.6 s. Count-ups easeOutCubic.
- Stagger siblings (3–6 frames). Masked word reveals (`Reveal` in ui.tsx) for type. Subtle continuous camera drift
  (scale 1.00→1.03 or 10–20 px translate across a scene) so frames never feel frozen.
- Deterministic only: `useCurrentFrame()`-driven. No CSS animations/transitions, no `Math.random` (use `rng()` from anim.ts).
- Entrance within the first ~20 frames, exit in the last ~16 frames (unless a match cut is specified).
- Budget: plain SVG/DOM; avoid thousands of DOM nodes (use one SVG `<path>` or canvas for dense marks).

## SFX cues (the user's priority: sound must feel attached to the motion)
Export `CUES: {at: number; kind: string; note?: string}[]` with LOCAL frames at the moment the motion *lands* (transient),
not when it starts. Kinds: `whoosh` (big move) · `swipe` (small move) · `card_in` · `card_out` · `slide` · `tick` (single
UI tick) · `tick_train` (count-up; add `note: 'dur=<frames>'`) · `blip` (data point lights) · `pop` (dot/node appears) ·
`ping` (pulse arrives at core) · `lock` (decision/latch) · `click` · `ratchet` (stop steps up) · `draw` (line draw start;
`note: 'dur=<frames>'`) · `type` (mono text typing; `note: 'dur=<frames>'`) · `scan` (sweep) · `impact_soft` · `shimmer`.
Be generous and precise: every visible action that deserves a sound gets a cue.

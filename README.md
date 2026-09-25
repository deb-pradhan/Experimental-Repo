# HireHouse — Launch Film

A 30-second, 16:9 (1920×1080, 60 fps) product launch film for **HireHouse**, built entirely in code:
a 2D + 3D motion stack (Remotion + React Three Fiber / three.js), an ElevenLabs soundtrack
(voiceover, music, SFX) and an ffmpeg mix, strictly on the Editorial Brutalist shadcn design system.

**Final film:** `deliverables/hirehouse-launch-film.mp4`

## The idea — noise to merit

Hiring is a pile. HireHouse turns it into a decision. The two halves of the stack carry the two halves of the story:

| | Stack | Story |
|---|---|---|
| Chaos | **3D** — 312 CVs fall into a pile, a keyword filter drops most of them into the dark | the status quo |
| Order | **2D** — flat, left-anchored, the shadcn kit | read → ranked on merit → interviewed → shortlisted → you decide |

The hero move is the pile **flattening into a ranked list**: the camera settles to a pixel-matched
frontal view, every card flips edge-on into a list row, and the black void contracts into the product
window, where the DOM table takes over on the exact pixels the 3D rows left. The **tie** from the logo
is the through-line: it drops into the pile to read every application, and in the last second it drops
into its slot in the wordmark.

| # | Scene | Time | Ground | Stack |
|---|---|---|---|---|
| S1 | The pile — "One role. 312 applications." | 0–4 s | black | 3D |
| S2 | The keyword filter — "Most are never read." | 4–8 s | black | 3D |
| S3 | The tie · "Every application, read." · pile → list | 8–12 s | black → white | 3D → 2D |
| S4 | "Ranked on merit, not keywords." (live FLIP re-sort) | 12–16 s | white | 2D UI |
| S5 | "Interviewed for real." (video interview, anti-cheat, meters) | 16–20 s | lime | 2D UI |
| S6 | "A shortlist, not a pile." / "You make the call." | 20–24 s | black | 2D bleed |
| S7 | "Hiring, decided on merit." | 24–27 s | **blue** (once) | 2D kinetic |
| S8 | Official tagline lockup, tie drops into the wordmark | 27–30 s | white | logo |

## Repository

```
docs/                     director's brief, treatment + beat sheet, locked script (claim-mapped)
assets/brand/             design system (shadcn-editorial.html), logo system (hirehouse-tie-logo.html),
                          baked SVGs (svg/), source PNGs
audio/                    ElevenLabs sources (src/), final mix + stems (mix/), audio README
tools/                    audio_analyze.py (VO split, tempo/beat grid), mix_audio.py (ffmpeg mix + loudness)
video/                    Remotion project
  src/theme.ts            design tokens (the only place colours/type/grid live)
  src/timeline.ts         every scene boundary and sync point (60 fps, 120 BPM: beat 30 f, bar 120 f)
  src/three/              the 3D act: deterministic pile model, instanced card shader, textures
  src/scenes/             ActOne (S1–S3), ActTwo (S4–S5), ActThree (S6–S7), EndCard (S8)
  src/brand/logo-data.ts  official outlined logo paths (per glyph + tie), extracted from the logo file
deliverables/             the final MP4
```

## Build

```bash
cd video && npm install
npx remotion render src/index.ts HireHouseLaunch out/hirehouse-launch.mp4   # full film
npx remotion still  src/index.ts HireHouseLaunch out/f.png --frame=1790     # any frame
python3 ../tools/mix_audio.py && cp ../audio/mix/hirehouse_mix.wav public/audio/   # rebuild the mix
```

The 3D renders on CPU (SwiftShader via ANGLE); `remotion.config.ts` points at the container's headless Chromium.

## Rules we held to

- Closed palette, no shadows/gradients/tints; 3D is unlit and flat so it obeys the same law.
- Manrope + JetBrains Mono only; sentence headlines with full stops; no em dashes on screen.
- Blue as a full ground exactly once (the climax). Left-anchored; bleed on purpose.
- Logo from the official outlined SVGs only (never re-set in live type); ink `#1F2430`; the tie is the only colour event.
- Copy only states existing HireHouse features and the core idea — every line maps to an approved claim (`docs/03-script.md §5`).

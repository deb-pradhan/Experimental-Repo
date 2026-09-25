# 02 — Deploy colour system (official, supplied by the client)

Supersedes the diagram palette in the deploy-diagrams skill. `video/src/theme.ts` mirrors this file 1:1.

## Anchors
| Token | Hex | Role |
|---|---|---|
| brand/soft-black | #131313 | Primary dark surface, primary text on light |
| brand/blue-glow | #474DEF | Primary brand colour. Hero fills, CTAs, brand moments |
| brand/white | #FFFFFF | Primary light surface, text on dark |
| brand/gray | #F6F6FF | Soft off-white surface, subtle separation (cool blue cast, never #F6F6F6) |
| accent/bright-turquoise | #00E2E2 | Accent only: one emphasised element per composition, never a surface |

**60-30-10 per composition:** ~60% Soft Black or White (dominant surface), ~30% Blue Glow (brand carrier), ~10% Turquoise or Gray (accent). Turquoise never above 10% of the frame.

## Ramps (100 lightest → 1000 darkest; 500 = canonical)
- **Soft Black:** 100 #F2F2F2 · 200 #D6D6D6 · 300 #B8B8B8 · 400 #8F8F8F · 500 #131313 · 600 #101010 · 700 #0C0C0C · 800 #080808 · 900 #040404 · 1000 #000000
- **Blue Glow (Ultramarine):** 100 #EEF0FF · 200 #D9DDFF · 300 #B8BEFF · 400 #7E86F5 · 500 #474DEF · 600 #3E44D1 · 700 #3338B0 · 800 #272C8C · 900 #1D2166 · 1000 #141842
- **White:** 100 #FFFFFF · 200 #FAFAFA · 300 #F5F5F7 · 400 #EFEFF2 · 500 #FFFFFF · 600 #E6E6EA · 700 #CFCFD6 · 800 #B8B8C2 · 900 #9F9FA9 · 1000 #868692
- **Gray (cool spine):** 100 #FFFFFF · 200 #FBFBFF · 300 #F6F6FF · 400 #E9E9F2 · 500 #F6F6FF · 600 #D2D2DD · 700 #B2B2BF · 800 #8F8F9C · 900 #6B6B78 · 1000 #484855
- **Turquoise:** 100 #ECFFFF · 200 #C8FFFF · 300 #9AFFFF · 400 #4EF2F2 · 500 #00E2E2 · 600 #00C6C6 · 700 #00A3A3 · 800 #007D7D · 900 #005757 · 1000 #003333

## Approved hero pairings (background → text)
#131313 → #FFFFFF · #474DEF → #FFFFFF · #FFFFFF → #000000/#131313 · #F6F6FF → #000000 · #00E2E2 → #000000 (accent moment only)

**Forbidden:** turquoise text on Blue Glow · Blue Glow text on turquoise · white text on turquoise · Soft Black on Blue Glow at body sizes.

## Rules
1. Blue Glow is the brand. When in doubt, use it.
2. Turquoise is a spice: a single emphasised element per composition (a callout, a data point, a live dot).
3. Never tint brand colours with opacity to make new shades; use the ramp. The only approved opacity is the
   rgba(255,255,255,0.1) frosted-glass card on dark.
4. Keep the #F6F6FF cool cast; never substitute a neutral grey.

## Film application
- Act I (the market) on Soft Black #131313 with Blue Glow ramp candles; hairlines/cards on dark use the frosted-glass white 10%.
- The light world on Gray #F6F6FF / White cards; text #131313; muted text Gray 900/800.
- Blue Glow carries ~30% of every frame: full-bleed Blue Glow grounds (white type) for the brand moments,
  Blue Glow fills for active states, the equity line, the core.
- Turquoise marks exactly one thing per scene: the live dot, the decision, the key number.
- Charts use the Blue ramp (400/300/800) and the Gray ramp for inactive/neutral series. No green/red.
- AI plates are graded by luminance onto ramp steps (dark plate: #131313 → #1D2166 → #474DEF → #B8BEFF;
  light plate: #F6F6FF ground, star on #272C8C → #474DEF → #7E86F5).

# HireHouse — Launch Film · Director's Brief

**Deliverable:** 30-second product launch film for the HireHouse portfolio page.
**Format:** 16:9 · 1920×1080 · 60 fps · H.264 + AAC stereo · ≤ 30.0 s.
**Stack:** Remotion 4 (2D, React) + React Three Fiber / three.js (3D), ElevenLabs (VO, music, SFX), ffmpeg (mix + master).

---

## 1. What we are selling

HireHouse is a merit-first hiring marketplace. Every application is **read**, **ranked on merit**
(not keyword matching), candidates are **interviewed for real** in a structured video round with
integrity checks, and the company receives a **shortlist**. A human makes the final call.
Positioning line (from the official tagline lockup): **"Hiring, decided on merit."**

Audience for this cut: portfolio visitors. People who hire and people who want to be hired.
They should leave knowing one thing: *HireHouse replaces the pile with a decision.*

## 2. The idea — "Noise to merit"

Hiring today is a pile. Hundreds of CVs, a keyword filter, silence. HireHouse turns that noise into
order and hands a human a real decision.

We tell it with the stack itself:

| Register | Stack | Means |
|---|---|---|
| **Chaos** | 3D — a volume of hundreds of CVs, depth, gravity, falling | the pile, the filter, the noise |
| **Order** | 2D — flat, left-anchored, hairlines, the shadcn kit | read, ranked, interviewed, shortlisted |

The film's hero move is the moment the 3D pile **collapses into a flat ranked list**: the camera
settles perpendicular, depth dies, and the cards *become* the rows of the product table. Chaos
literally flattens into order. That transition is the whole pitch in one shot.

### The through-line: the tie
The logo replaces the **i** with a necktie (knot over blade, tittle over stem). The **i** is the
individual. The tie is our protagonist: it drops into the pile, it marks the person who earned it,
and in the last second it drops into its slot in the wordmark. Brand mark, narrative device and
end-card payoff are the same object.

## 3. Design law (non-negotiable — from `assets/brand/shadcn-editorial.html`)

- **Palette is closed.** `#000` `#FFF` lime `#E9FEA3` yellow `#FBFD78` lilac `#CB9FD2`
  blue `#4C49F3` grey `#E2E2E2` grey-block `#CFCFCF` muted `#9A9A9A` `#555` `#6B6B6B`.
  Logo ink `#1F2430`. Nothing else. No tints.
- **No shadows, no gradients, no glows, no bevels.** Flat surfaces. Overlays separate with a
  0.75px hairline ring. 3D is rendered **unlit and flat** (MeshBasicMaterial) so it obeys the same law.
- **Type:** Manrope (200 light for size, 300 body, 600 for bold display) + JetBrains Mono for data.
  Enormous headlines, tight negative tracking, sentences with terminal punctuation. No em dashes on screen.
- **Blue is the single emphasis** and appears as a full ground **exactly once** — the climax.
- **Left-anchored, asymmetric.** Bleed on purpose: bars run off the left, cards off the bottom.
- **Black carries chrome** (UI frames, toasts, command). Accents fire hardest against black.
- **Logo:** use the outlined SVGs from `assets/brand/hirehouse-tie-logo.html` only. Never re-set
  the wordmark in live text. Ink `#1F2430` on light, pure white on dark. The tie is the only
  colour event in the mark. Never outline it, never gradient it.
- **Voice:** plain-spoken, confident, a little blunt. No AI-filler (seamless, unlock, elevate,
  empower, journey, effortless, leverage, streamline, robust, cutting-edge, supercharge, harness).
- **No fabricated facts.** No invented statistics or claims. UI numbers are illustrative product
  states (an applicant count, a score in a mock table), never marketing claims.

### 3.1 Approved claims (client rule: nothing outside existing features + the core idea)

VO, supers and UI copy may only rest on these. Every line in the script maps to one of them.

| # | Claim |
|---|---|
| 1 | Every application is read. No keyword gate. |
| 2 | Candidates are ranked on merit: skills and fit, not keywords. |
| 3 | A structured video interview, with integrity (anti-cheat) checks. |
| 4 | The company receives a shortlist of interview-verified candidates. |
| 5 | A human makes the final call. |
| 6 | Core idea / tagline: **"Hiring, decided on merit."** |
| 7 | Brand name; end-card meta only: hirehouse.xyz · UAE · India · free for companies, free to apply. |
| P | *Problem framing* (the pile, keyword filters, unread applications): the status quo, not a claim. |

**Banned:** speed or time promises, "AI-powered"/"algorithm"/"automated", guarantees, outcomes
("hire the best"), statistics, pricing, Fast Track, testimonials, any feature not listed above.
UI microcopy uses only the kit's existing product vocabulary (Applicants, Roles, Stage, Fit, Score,
Invited, Anti-cheat monitoring, Interview invite sent, Send invite).

## 4. Canvas mapping

The system is specified on a 720×405 pt canvas. We render at 1920×1080, so **1 pt = 2.6667 px**.

| Token | pt | px @1080p |
|---|---|---|
| Left margin | 63 | 168 |
| Chip origin | 57, 45 | 152, 120 |
| Chip height | 27 | 72 |
| Footer y (bottom / top) | 375 / 17 | 1000 / 45 |
| Card radius | 14 | 37 |
| Hairline | 0.75 | 2 |

## 5. Motion principles

1. **Everything moves on the grid.** 120 BPM → 1 beat = 30 frames, 1 bar = 120 frames at 60 fps.
   Scene cuts land on bar lines; key hits land on beats.
2. **Expo-out for arrivals, expo-in for exits** (`cubic-bezier(.16,1,.3,1)` / `(.7,0,.84,0)`);
   springs only for UI micro-interactions (toast, switch, button press).
3. **Masks, not fades.** Type enters from behind line masks; surfaces wipe; fades only for 3D fog-outs.
4. **Nothing floats.** Every element either arrives, holds with intent, or leaves. No idle wobble.
5. **One idea per shot**, readable in under two seconds.
6. **Sound is picture.** Every major motion event has an owned sound (whoosh, tick, click, hit).

## 6. Crew

| Role | Owner | Output |
|---|---|---|
| Director | Lead agent | Brief, treatment, beat sheet, final cut, QA sign-off |
| Script Writer | Sub-agent | VO + on-screen supers locked to the beat sheet (`docs/03-script.md`) |
| Sound & Audio | Sub-agent | Music bed, SFX library, VO takes via ElevenLabs (`audio/`) |
| Motion Design | Lead agent | Remotion + R3F build (`video/`), 3D pile, UI choreography, logo resolve |
| QA / Art Direction review | Sub-agent | Frame-by-frame check against the design law |

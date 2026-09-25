# 01 — Director's treatment: Superstar launch film

**Format** 1080 × 1920 (9:16), 60 fps, 97 s · **Stack** Remotion (2D) + three.js / R3F (3D) + two Kling 3 Pro hero plates (graded to palette) · **Sound** ElevenLabs score, VO and SFX palette + tuned synth micro-SFX, ffmpeg mix.

## The idea: both sides

The market right now doesn't trend. It whipsaws, and it punishes whoever picked one side.
Superstar is the answer the product already states in its own hero line: **an intelligent agent, trading both sides for you**,
and, just as important, sitting out when neither side is clear ("Nothing is a valid move").

The film is built on one visual law: **dark = the market, light = Deploy.**
Act I lives in a Soft Black void of 3D candles and liquidations. The moment Superstar arrives we cut, on the score's impact,
into Deploy's own world: Gray and white surfaces, viewport cards, mono status headers and Blue Glow. We never go back to the dark.

## Look (Deploy design system, held strictly — colours per `02-color-system.md`)

- **Colour:** Soft Black `#131313` and White / Gray `#F6F6FF` as the dominant surfaces (~60%), **Blue Glow `#474DEF`
  carries ~30% of every frame** (full-bleed Blue Glow grounds for brand moments, active states, the equity line, the core),
  Turquoise `#00E2E2` marks exactly one element per scene (~10% max). Ramp steps only, never opacity tints
  (sole exception: the white-10% frosted-glass card on dark). No green/red for long/short: Blue Glow = active,
  Gray = inactive, plus the label.
- **Type:** Season Sans (headlines, body), Season Serif (statement numerals, accent words in Blue Glow),
  Geist Mono (lowercase status headers `superstar · signal bus`, uppercase micro-labels, data).
- **Surfaces:** Gray `#F6F6FF` ground, white viewport cards (2 px Gray 600 border, 44 px radius, soft neutral shadow),
  mono status header with a live turquoise dot.
- **Token logos** are drawn only from icon libraries (cryptocurrency-icons CC0, @web3icons MIT); their own brand
  colours are the one sanctioned exception to the palette.
- **AI plates** are graded by luminance onto ramp steps so every pixel lands on the palette.
- **Motion:** smooth, deliberate, physical. Draw-ons 1.2–1.6 s on `cubic-bezier(.3,.7,.2,1)`, masked word reveals,
  springs with one overshoot, count-ups on easeOutCubic. Cuts land on bar lines of the 120 BPM score.

## Structure (cut to score take A, 120 BPM, downbeats on 25.98 + 2k s)

| # | Film time | Music | Scene | Ground | Stack |
|---|---|---|---|---|---|
| S1 | 0–8 s | quiet tension, tick | Cold open: candle canyon hero plate; BTC 4H line draws; first VO line | dark | AI plate + 2D |
| S2 | 8–15.5 s | sparse → pressure | Whipsaw: real BTC 4H candles in 3D, liquidation particles shed off both sides; market facts slam in | dark | 3D + 2D |
| S3 | 15.5–22 s | build → breath | Both sides wrecked: longs liquidated, shorts squeezed; freeze-frame; everything collapses to one point | dark | 3D + 2D |
| S4 | 22–26 s | **impact 22.0** + riser | Reveal: iris opens into the light world; Superstar core assembles (hero plate 2); "trading *both sides for you*" | light | AI plate + 2D |
| S5 | 26–34 s | groove enters | The loop: 4-hour clock ring, 6 reviews a day; "Every four hours, one decision." | light | 2D (+3D ring) |
| S6 | 34–42 s | groove | 01 Read the last four hours: hourly prints −3h −2h −1h now stack into the card | light | 2D |
| S7 | 42–50 s | groove + layer | 02 Build a picture: 18 signals in 6 groups flow as pulses into the agent core | light | 2D signal bus |
| S8 | 50–58 s | groove (bar extension) | 03 Argue both sides: bull vs bear cards, each with a hard invalidation line on the chart | light | 2D |
| S9 | 58–65 s | **breakdown** | 04 Choose: LONG / SHORT / NO TRADE cycles; lands on no trade; 2,298 dots, 1,350 go quiet. "Nothing is a valid move." | light | 3D dot field |
| S10 | 65–74 s | rebuild | Risk first: three rules that don't bend; trailing stop ratchets up, never down | light | 2D |
| S11 | 74–84 s | **peak** | Proof (simulated backtest): BTC path vs equity $100k → $271,465, +171.46%, max DD 13.6%, both sides profitable | light | 2D chart |
| S12 | 84–88 s | peak | Where it runs: spot · perps · HIP-3 on Hyperliquid (the USDC beat was cut in review) | light | 2D |
| S13 | 88–97 s | final hit + tail | End card: Deploy mark extrudes in 3D then settles flat; wordmark builds glyph by glyph from the official SVG; disclaimer | light | 3D → 2D logo |

Music edit: take A is used as generated except one 8 s (4-bar) repeat of its groove (source 41.98–49.98 s) inserted at 49.98 s,
which pushes the breakdown to film 58 s. The last big hit is designed in SFX (sub + logo sting) at 90 s.

## Sound (the user's priority)

Every motion event in `video/src/timeline.ts` is a named cue in the SFX spotting sheet. Families:
- **Camera and space:** whooshes for moves, reverse swells into cuts, sub drops on impacts, a tape-stop on the freeze.
- **Data:** tuned blips (C# root/fifth, matched to the score) on pulses arriving at the core, soft ticks on count-ups,
  grain cascades on the dot field, a sus-chord "lock" when a decision lands.
- **Mechanics:** ratchet clicks on each trailing-stop step, card slides, latch clicks on pills.
- Transients are aligned to the frame the motion peaks, not the frame it starts. VO sits on top, the score ducks
  under it, SFX stay crisp but never louder than the voice. Master: −14 LUFS, −1 dBTP.

## Claims discipline

Only facts from the docs and landing page (see `00-product-and-brand.md`). Every performance number carries
"Simulated backtest" on screen while visible. The end card carries the landing page's disclaimer, "Not investment advice"
and "May not be available in all jurisdictions". No returns promised; losses acknowledged; the agent is autonomous
(no user approving trades).

# 11 · Prompt library (verbatim)

Every prompt used to make the film, copied exactly from the session. Reuse them as templates: swap the product, data, dates and brand tokens, and keep the structure.

| Section | Model / tool |
|---|---|
| [Agent briefs](#agent-briefs) | Claude subagents (Agent tool) |
| [Mid-flight directives](#mid-flight-directives) | SendMessage to running agents |
| [Music](#music) | ElevenLabs `eleven_music_v2` |
| [Narration](#narration) | ElevenLabs `eleven_multilingual_v2` |
| [Hero plates](#hero-plates) | Kling 3 Pro (via the ElevenLabs creative flow) |
| [Sound effects](#sound-effects) | ElevenLabs `eleven_text_to_sound_v2` |
| [Templates](#templates-for-the-next-film) | Fill-in-the-blanks versions |

> Note: the agent briefs were written before some later decisions. For example, the SFX brief says D minor, but the score measured C#; and the film lengths say 90–99 s. The final values are in the other playbook files.

## Agent briefs

### Brand & docs researcher

````text
You are the brand & product researcher for a launch film about Deploy Finance's "Superstar" agent. Gather everything the Director needs about the product and brand. Use WebFetch (load via ToolSearch "select:WebFetch,WebSearch") and curl via Bash (HTTPS proxy is preconfigured; if curl fails TLS use --cacert /root/.ccr/ca-bundle.crt).

1. Fetch these docs pages and capture their content faithfully (claims, numbers, wording):
   - https://docs.deploy.finance/products/agents/superstar/risks
   - https://docs.deploy.finance/products/agents/superstar/who-is-it-for
   - https://docs.deploy.finance/products/agents/execution
   - https://docs.deploy.finance/products/agents/superstar/dynamic-builder-fees
   - https://docs.deploy.finance/products/agents/how-to-choose
   - any Superstar FAQ page you find linked
2. Brand: fetch https://deploy.finance/ (and try curl for raw HTML). Find: the logo (SVG inline or linked file — download SVG/PNG logo files and favicon into /home/user/Experimental-Repo/superstar/assets/brand/ ), the wordmark, fonts used (look at CSS: font-family names and font file URLs such as Geist Mono, a serif like "Season"/"Seasonserif", Inter), brand colors in CSS (look for #474DEF indigo and others), taglines, hero copy, and any product imagery or UI screenshots of agents. Try the Webflow CSS file linked in the HTML to extract @font-face URLs and colors; download woff2 font files for Geist Mono / Season serif / Inter if they're publicly served (save to superstar/assets/fonts/). If Season serif can't be downloaded, note it (Fraunces from Google Fonts is the stand-in).
3. Also check https://deploy.finance/blogs for any Superstar/Super Perps launch post and capture key messaging.

Write your findings to /home/user/Experimental-Repo/superstar/docs/00-product-and-brand.md with sections: Product facts (verbatim quotes with URLs), Risks & compliance language we must respect, Brand (logo files saved + paths, fonts found + paths, colors, taglines, tone of voice). Create directories as needed. Do not commit anything to git.

Reply with a concise summary: key claims, compliance must-dos, logo/font files saved (paths), and the brand tagline/voice.
````

### Quant Analyst: market regime brief

````text
You are the QUANT ANALYST on a creative crew making a 90-second, 9:16 launch film for Deploy Finance's "Superstar" agent (an autonomous directional trading agent on Hyperliquid). Today is 2026-09-25. Your job: gauge the CURRENT crypto market with real data and write the market narrative about VOLATILITY that the film will be built on. The Director and Script Writer will turn your findings into on-screen numbers, charts and voiceover lines, so accuracy and chart-ready data both matter.

## Product context (from docs.deploy.finance, the only claims we can make)
- Superstar (formerly Super Perps): autonomous directional agent. Trades spot, perps, and HIP-3 markets on Hyperliquid; goes long, short, or stays flat; takes outcome-market positions only when there's a clear winner. USDC in, USDC out, non-custodial, sub-second finality.
- Runs every 4 hours. Loop: 1) Read the last four hours (hourly prints at -3h,-2h,-1h,now) 2) Synthesize a picture (composite state: price, OI quadrant, order-book lean, liquidation clusters, funding/volume trends) 3) Argue both sides (bull + bear thesis with hard invalidation levels) 4) Choose a direction (direction, probability, entry plan, invalidation, add conditions).
- Inputs: price 1h close + 1h high; OI 1h close + delta; realized & indicative funding; long/short liquidation pools + 1h realized liqs; buy/sell volume, bid/ask ratio (0-2%), daily CVD; whale-retail delta, true retail positioning, top-trader positioning.
- Risk: loss limit set before entry, never widened; size set mechanically from the loss limit; stops trail up only; no revenge trades. Keeps ~60-70% of balance working, multiple strategies at once.
- Backtest (SIMULATED, BTC, price went ~$104k -> ~$124k -> ~$63k): $100k -> $271,465 (+171.46%), 688 filled trades, 52.3% of resolved trades profitable, max drawdown 13.6%, 1,350 of 2,298 reviews ended in NO trade, both directions profitable (shorts carried the back half), $1.27 back per $1 lost, 366 winners vs 322 losers. Min balance $10,000 USDC.

## Tools
Hyblock MCP tools are deferred: load them with ToolSearch first, e.g. query "select:mcp__Hyblock__hyblock_catalog,mcp__Hyblock__hyblock_klines,mcp__Hyblock__hyblock_funding_rate,mcp__Hyblock__hyblock_open_interest,mcp__Hyblock__hyblock_liquidation,mcp__Hyblock__hyblock_bvol,mcp__Hyblock__hyblock_dvol" and similar (also: hyblock_open_interest_delta, hyblock_liquidation_levels, hyblock_cumulative_liq_level, hyblock_whale_retail_delta, hyblock_true_retail_long_short, hyblock_top_trader_positions, hyblock_net_long_short, hyblock_volume_delta, hyblock_anchored_cvd, hyblock_bid_ask_ratio, hyblock_market_imbalance_index, hyblock_trader_sentiment_gap). Call hyblock_catalog first to learn coin/exchange ids. A working call: hyblock_klines {coin:"btc", exchange:"binance_perp_stable", timeframe:"1d", limit:5, sort:"desc"} returned BTC closing ~84,370 on the latest daily (timestamps are unix SECONDS). If a tool errors, adjust params (limit must be one of 5,10,20,50,100,500,1000) and move on. You may also use WebSearch for macro/narrative context (e.g., what's driving crypto this month), but numbers in the film must come from Hyblock data you pulled. Python3 with numpy is installed for calculations.

## What to gather (BTC primarily; ETH, SOL, HYPE as supporting)
1. Price: BTC daily klines for ~365 days and 4h klines for last ~60 days; 1h for last ~7 days. ATH in the window, drawdown from ATH, 30d/90d range, recent big candles.
2. Volatility: realized vol (annualized, from daily and 4h returns) for 7d/30d/90d; implied vol indices (bvol / dvol) if available; biggest daily moves in last 30/90 days; count of days with |move| > 3% and > 5%; intraday range stats. Is vol expanding or compressing? Regime classification (trend vs chop/range, high-vol vs low-vol). Whipsaw evidence: e.g., count of 4h reversals, times price crossed its 20-period mean.
3. Leverage & positioning: open interest level and changes (30d), funding rates (current and recent flips between positive/negative), long/short liquidation totals over last 30 days and the largest liquidation days, liquidation clusters above/below current price, whale vs retail delta, retail long/short ratio, top-trader positioning.
4. Order flow: CVD trend, bid/ask ratio lean.

## Deliverables (write files; create dirs if missing)
A) /home/user/Experimental-Repo/superstar/data/market.json — chart-ready, compact JSON:
   { "asOf": ISO timestamp, "btc": { "price", "ath", "athDate", "drawdownFromAth", "rv7d","rv30d","rv90d", "impliedVol"(if any), "daily365": [[unixSec, close],...], "h4_60d": [[unixSec, o,h,l,c],...], "h1_7d": [[unixSec,o,h,l,c],...], "bigMoves": [...], ... }, "funding": {...series + current, flips count}, "oi": {...series}, "liquidations": {"longs30d","shorts30d","series":[...], "biggestDay": ...,"clusters": {...}}, "positioning": {...}, "eth"/"sol"/"hype": {price, rv30d, drawdown} }
   Keep series lengths as specified (downsampling fine) so the file stays < 1.5 MB.
B) /home/user/Experimental-Repo/superstar/docs/01-quant-brief.md — a sharp market memo:
   - Snapshot table of key numbers (with the exact source tool + timestamp for each).
   - "The regime": what kind of market this is, in plain words, backed by numbers (e.g., violent two-way chop, liquidation cascades both directions, funding flipping, whales vs retail diverging...). Be honest — don't force a narrative the data doesn't support.
   - "The narrative on volatility": the story traders are living right now (use WebSearch for current macro/crypto headlines context if helpful, cite sources).
   - "Why this regime favors Superstar": map each regime property to a specific Superstar feature (two-sided: long AND short; stays flat 1,350/2,298 reviews = discipline in chop; pre-set loss limits & trailing stops for liquidation cascades; reads OI/funding/liquidations/whale-retail every 4h, i.e. exactly the data that's moving this market; backtest spanned a +19% rally and a -49% slide and finished positive through both halves).
   - 8-12 "film-ready facts": one-line, punchy, numerically exact statements we could put on screen (e.g., "$X B in longs liquidated in 30 days"), each with its source. Flag which are strongest.
   - 3 alternative one-sentence narrative hooks for the film's opening line.
   Also note any caveats (data gaps, exchange-specific numbers).

Compliance: never present backtest numbers as live results; never promise returns. Keep all claims factual.

When done, reply with: the 10 most important numbers, the regime in 2 sentences, your recommended narrative hook, and the paths of the files you wrote.
````

### SFX Designer: build sound palette

````text
You are the SFX DESIGNER on a creative crew making a 98-second, 9:16 premium launch film for Deploy Finance's "Superstar" autonomous trading agent. The user asked for PEAK attention to SFX: every sound must be crisp, clean, pleasant to the ears ("want to hear it again and again"), and relatable to the motion on screen. Think Apple keynote / Stripe / Linear launch-film sound design: tactile, precise, musical, never harsh, never cheesy, no cartoon sounds, no laser "pew", no video-game coins.

Your job right now: build the SFX PALETTE (library) and a precise analysis catalog. The Director will spot the sounds to frame-exact motion events afterwards (you may be asked to do the spotting later too).

## Musical context
The score is 120 BPM in D minor (minimal cinematic electronic). Any tonal SFX must be tuned to D minor (D F G A C, and E as passing): prefer D, A, F, C. Frame rate 60 fps; one beat = 0.5 s.

## Visual vocabulary of the film (what the sounds must "feel like")
- Act I (dark, 3D): a camera flying through a canyon of 3D Bitcoin candlesticks; candles slam up/down; liquidation particles burst off wicks like sparks; big serif numbers slam onto screen; a price line whips; a hard freeze-frame stop.
- Reveal: particles converge into a glowing indigo agent core that snaps into shape; the word "Superstar" lands.
- The loop (light UI cards): a 4-hour clock ring ticks and sweeps; hourly candles stack in; five data streams (price, leverage, liquidations, order flow, whales vs retail) flow as pulses along lines into the core; bull and bear thesis cards slide in and face off, invalidation lines snap on a chart; a LONG / SHORT / FLAT selector cycles and locks.
- Discipline: a grid of 2,298 dots where 1,350 go quiet (grey) in a cascading wave — near silence in the music; a trailing stop line ratchets up step by step (never down).
- Proof: an equity curve draws on and a big number counts up $100,000 → $271,465; percentage +171.46% lands.
- End: logo mark assembles, wordmark glyphs build in, final hit.

## Deliverables
Write everything under /home/user/Experimental-Repo/superstar/audio/ (create dirs):
1. audio/src/sfx/ — the palette. Two sources:
   (a) ElevenLabs Sound Effects v2 (MCP). Load tools with ToolSearch, e.g. "select:mcp__ElevenLabs__creative_generate_in_flow,mcp__ElevenLabs__creative_get_flow_run_status,mcp__ElevenLabs__creative_add_flow_node,mcp__ElevenLabs__creative_update_node,mcp__ElevenLabs__creative_run_flow_nodes,mcp__ElevenLabs__creative_get_flow,mcp__ElevenLabs__creative_get_model_schema,mcp__ElevenLabs__creative_get_model_guide". Read the model guide for eleven_text_to_sound_v2 first. Use the existing flow_id "N395ArjNXOWqzKvleUeT" (do NOT create a new flow). The sfx node supports duration_seconds (0.5–30) and prompt_influence (0–1) — set them via creative_update_node model_parameters where it matters (short one-shots should be short, e.g. 0.6–1.5 s, prompt_influence ~0.5–0.7), then run. Use generations_count 2 for important sounds so there is a choice. Poll creative_get_flow_run_status until done, then download each generated audio URL with curl (HTTPS proxy is preconfigured; if TLS fails use --cacert /root/.ccr/ca-bundle.crt) into audio/src/sfx/ with descriptive names (e.g. el_whoosh_short_a.mp3). Never re-run a generation just to retry a failed download.
       Suggested ElevenLabs palette (adapt the wording; describe the SOUND, clean studio quality, no reverb wash unless noted):
       - whoosh_short (fast airy pass-by, 0.6 s), whoosh_long (smooth deep cinematic swoosh, 1.5 s), whoosh_reverse_swell (reverse suck-in into a hit, 1.5 s)
       - sub_impact (deep clean cinematic sub boom, tight, 1.5–2 s), impact_hit_big (trailer-style but tasteful hit with short tail, 2 s)
       - riser_tension (rising filtered noise + tonal riser, 3–4 s), riser_short (1.5 s)
       - glitch_stutter (digital data glitch, short, clean), data_crackle_burst (tiny electric spark crackles, like liquidations popping, 1 s)
       - candle_slam (heavy deep mechanical thud with a click, 0.6 s), mechanical_click_heavy (camera-shutter-like precise snap)
       - ui_tick_soft (tiny soft wooden/glass tick), ui_click_crisp (premium UI click), ui_toggle_lock (satisfying latch/lock-in click), ui_pop_soft (soft bubble pop)
       - clock_tick (precise watch tick), clock_sweep (soft mechanical sweep), freeze_stop (tape-stop / time-freeze stop, 1 s)
       - data_flow_shimmer (soft digital shimmer for streams flowing, 2–3 s), energy_core_form (warm synthetic energy gathering and snapping into shape, 2.5 s)
       - card_slide (soft felt/paper-on-glass slide, 0.7 s), swipe_air_soft
       - logo_sting (elegant short tonal shimmer + soft hit for a fintech logo, 2.5 s)
       - heartbeat_low (single deep soft pulse) for the near-silent "no trade" moment
   (b) Synthesized micro-SFX in Python (numpy/scipy/soundfile are installed; imageio_ffmpeg provides an ffmpeg binary via imageio_ffmpeg.get_ffmpeg_exe()). Write tools/sfx_synth.py that renders 48 kHz stereo 24-bit WAVs into audio/src/sfx/synth/ so they are sample-exact and TUNED:
       - blip_{D5,F5,A5,C6,D6}: soft sine+triangle blips with a 1–2 ms attack transient, ~120–200 ms exponential decay, gentle low-pass (~9 kHz), slight stereo detune; pleasant, glassy, like premium UI.
       - tick_hi / tick_lo: tiny clicks (filtered noise burst 2–4 ms + short resonant body), for count-ups and clock ticks; very soft on the ears.
       - pop_{A4,D5}: rounded pops for dots appearing (pitch drop 5–10%, 80 ms).
       - pulse_ping_D: soft pinging "data arrives at core" sound (sine at D, bell-ish, 400 ms tail).
       - countup_train_2s: a 2-second accelerating-then-decelerating tick train (easeOutCubic spacing), for number count-ups; plus the same as 1.3 s.
       - dotwave_1350: a 3.0 s cascading stream of very soft grains (hundreds of tiny ticks with random micro-pitch, density following a wave), for the dot grid going grey.
       - ratchet_step: a crisp mechanical "click-clack" step for the trailing stop moving up (make 3 slight variations).
       - lock_chord_Dm: a quick soft 3-note Dm arpeggio "confirm" (D-F-A, 40 ms apart), for the LONG/SHORT/FLAT selection lock.
       - sub_drop_D: a clean sine sub-drop D2→D1 over 700 ms with soft saturation, for impacts.
       Keep everything free of clipping (peak ≤ −1 dBFS), no DC offset, 5 ms fade-out, no harsh 2–5 kHz spikes (you can check with an FFT).
2. audio/src/sfx/catalog.json — for EVERY file (EL and synth): {file, source, prompt_or_recipe, duration_s, onset_s (time of the main transient/peak from the file start — detect it with an envelope follower), peak_dbfs, rms_dbfs, spectral_centroid_hz, character (one line), best_use}. Mark your recommended pick when there are A/B takes, and flag rejects (e.g. harsh, noisy, wrong).
3. audio/SFX-PALETTE.md — a short human-readable table of the palette with recommended uses per film moment, and the loudness/EQ notes a mixer needs (e.g. "high-pass at 120 Hz when layered with the music", "sits at −18 dB under VO").

Write any helper scripts to /home/user/Experimental-Repo/superstar/tools/. Don't touch other directories, and don't commit to git. When finished, reply with: the list of files, your top picks per category, anything that failed, and total ElevenLabs generations used.
````

### Motion Designer B: scenes S06–S08

````text
You are a star MOTION DESIGNER on a creative crew making a 99-second 9:16 launch film for Deploy Finance's "Superstar" autonomous trading agent. The Director (me) has built the Remotion project, design system and timeline. You build three scenes of the film: **S06, S07, S08**, in `/home/user/Experimental-Repo/superstar/video/src/scenes/`. They're currently placeholders.

First read: `/home/user/Experimental-Repo/superstar/docs/05-motion-brief.md` (rules, tools, QA workflow — follow it exactly), then `02-color-system.md`, `01-director-treatment.md`, `04-script.md` in the same docs folder, and skim `video/src/theme.ts`, `video/src/components/ui.tsx` (Card, MonoHead, MonoFoot, Micro, Pill, Reveal, StepHeader, ChoiceRow, PulseDot), `video/src/components/Star.tsx` (Star3D, StarGlyph), `video/src/timeline.ts`, `video/src/data/market.json` keys. For diagram recipes (signal bus, pulses along paths, draw-on, agent core) also read the skill at `/root/.claude/skills/synced/f8c9a339-203d-4c79-85f2-93b0b52f85fb_8c3c0fc5-8f6f-459c-8b71-02572167925c/deploy-diagrams/references/animation-cookbook.md` — but use the colour tokens from theme.ts, not the skill's palette. Ground for all three scenes is Gray `#F6F6FF` (painted by the Film).

The light world is Deploy's product UI world: white viewport cards (2 px Gray-600 border, 44 px radius, `CARD.shadow`), lowercase mono status headers with the live turquoise dot (MonoHead), Blue Glow carrying ~30% of the frame. This is the "how it works" section of the film; the narrator explains one step per scene. The loop steps share `StepHeader` (numeral + title at top: 250).

## S06 · "01 · Read the last four hours" — film 34.0–42.0 s, 480 local frames
VO line L11 "It reads the last four hours, hour by hour." film 34.40–37.48 (local ≈ 24–209). Use `wordF('L11', ...)` for "reads", "last", "four", "hours", and the second "hour" (nth) for sync.
Design: StepHeader n="01" title="Read the last four hours". Below it a big viewport Card (MonoHead left `superstar · review 21:00 utc`, right `btc-perp · 4 × 1h`). Inside: four columns labelled `−3h  −2h  −1h  now` (Geist Mono). Each column fills hour by hour (staggered, synced to the words): a real 1-hour BTC candle from `M.btc.last4h` ([t,o,h,l,c], oldest→newest) drawn large and precise (up = Blue Glow body, down = Gray 800 body, wick lines; shared price scale across the four with a right-edge mono price axis), then its readings type in beneath it from `M.last4hReadings` (same four hours, oldest→newest): price close, OI (`oi_close_usd` as `$25.56B`), liq long/short (`liq_long_usd`/`liq_short_usd` compact like `$249K / $866K`), funding (`funding_agg` 4 dp), whale–retail delta, retail long %. A thin Blue Glow scan bar sweeps across columns as each fills. The `now` column is the scene's single turquoise element (turquoise dot/label). Continuous subtle camera drift. Exit (last ~16 frames): card slides up/out so S07 can enter. Cue every candle landing (pop), every reading typing (type), the scan (scan).

## S07 · "02 · Build a picture" (signal bus) — film 42.0–50.0 s, 480 frames
VO line L12 "Weighs eighteen market signals: leverage, liquidations, order flow, whales against retail." film 42.20–48.20 (local ≈ 12–372). Sync group highlights to the words `18`, `leverage`, `liquidations`, `order`, `wails`/`whales` (Whisper spells it "wails"), `retail`.
Design: StepHeader n="02" title="Build a picture". A signal-bus viewport Card (MonoHead `superstar · signal bus`, right `18 inputs · 1 decision`). 18 input chips in 5 clusters (the docs' lenses): Price context (Price 1h close, 1h high) · Positioning & leverage (OI 1h close, OI Δ 1h, Realized funding, Indicative funding) · Forced buying & selling (Long liq pool, Short liq pool, Long liqs 1h, Short liqs 1h) · Order flow (Buy vol 1h, Sell vol 1h, Bid/ask 0–2%, Daily CVD) · Whales vs retail (Whale–retail Δ, Global retail L/S, True retail L/S, Top trader L/S). Chips pop in fast with a counter ticking 0→18 (Season Serif numeral). SVG paths draw from each chip and converge on the agent core in the lower middle (use `Star3D` at ~260 px, slowly rotating, or `StarGlyph` if 3D is too heavy — keep it on Blue Glow ramp). Pulses (small Blue Glow dots with the sanctioned tiny blur) flow along the paths into the core; each cluster lights (Blue Glow chip fill, white text) exactly when the narrator names it. When pulses arrive the core "breathes". Final beat (~local 380–460): the core emits one output line down to a small "picture" panel: a 2×2 OI-quadrant (price ↑/↓ × OI ↑/↓) with a dot in the current quadrant (price ↓ OI ↓ from the data) plus mono `composite state · 4 lenses agree? 2 of 5` or similar honest wording. Single turquoise element: the current-quadrant dot. Exit up/out.

## S08 · "03 · Argue both sides" → "04 · Choose" — film 50.0–58.0 s, 480 frames
VO L13 "Argues the bull case, and the bear case, each with the exact level that proves it wrong." film 50.20–55.06 (local 12–304): `bull` ≈ local 39, `bear` ≈ local 100, "exact level… proves it wrong" ≈ local 200–304. VO L14 "Then it chooses. Long. Short. Or nothing at all." starts 55.40 (local 324): `chooses` 56.10 (local 366), **`Long.` 57.19 (local 431)**; "Short." lands at 58.18 which is already in S09 (the Director's scene).
Design: StepHeader n="03" title="Argue both sides" which swaps (masked out/in) to n="04" title="Choose" at local ≈ 330. Two cards facing off: BULL CASE (top) and BEAR CASE (bottom), each with a Season Serif title, two short mono/Season-Sans bullet points and an invalidation level in large mono: bull "Invalid below $82,835" (the 48h low), bear "Invalid above $85,277" (the 48h high) — these come from `M.btc.h1_48`; mark the whole exhibit `illustrative review` in small mono (it's an example, not a real trade). Between them a chart of the last 48 hourly candles (`M.btc.h1_48`) with the two dashed invalidation lines snapping on in sync with "exact level that proves it wrong", each labelled. A tug-of-war probability bar (Blue Glow bull side vs Gray bear side) wobbles around 50/50 while they argue. From "Then it chooses" (local 324): the cards and chart compress/fold away and the shared **`ChoiceRow`** (from ui.tsx, default y) takes centre stage — it MUST end the scene exactly as `<ChoiceRow active={[1,0,0]} />` (LONG active), rest geometry, from local ≥ 440 to 479, because S09 match-cuts from it on the same pixels (the ground flips to Blue Glow on the cut). Animate the highlight landing on LONG at "Long." (local 431) with a spring. Single turquoise element: keep the scene's turquoise to one small thing (e.g. the MonoHead live dot) — do NOT use turquoise on the ChoiceRow in S08.

## Deliverables
- The three scene files (+ any `components/S06_*.tsx` helpers), each exporting `SNN`, `T`, `CUES` (be generous and precise with cues — the sound designer spots SFX from them).
- QA: render contact sheets for each scene at ≥10 timestamps (use `<scratchpad>/scratchpad/qa/` as outDir), inspect them, fix overlaps/clipping/illegible text/empty frames/off-palette colours, and iterate until each frame is portfolio-grade. `npx tsc --noEmit` must pass.
- Don't edit shared files; don't commit to git. If you truly need a shared change, describe it in your final report.
- Final report: what you built per scene (2–3 lines each), the paths of your final contact sheets, and any issues or shared-file requests.
````

### Motion Designer C: scenes S10–S12

````text
You are a star MOTION DESIGNER on a creative crew making a 99-second 9:16 launch film for Deploy Finance's "Superstar" autonomous trading agent. The Director (me) has built the Remotion project, design system and timeline. You build three scenes: **S10, S11, S12**, in `/home/user/Experimental-Repo/superstar/video/src/scenes/` (currently placeholders). Another designer is building S06–S08 in parallel; don't touch their files.

First read: `/home/user/Experimental-Repo/superstar/docs/05-motion-brief.md` (rules, tools, QA workflow — follow it exactly), then `02-color-system.md`, `01-director-treatment.md`, `04-script.md`, and `00-product-and-brand.md` §1.4 and §1.6 (risk rules and backtest facts) in the same docs folder; skim `video/src/theme.ts`, `video/src/components/ui.tsx` (Card, MonoHead, MonoFoot, Micro, Pill, Reveal, StepHeader), `video/src/components/Token.tsx`, `video/src/timeline.ts`, `video/src/data/backtest.ts`. For chart/draw-on recipes also read `/root/.claude/skills/synced/f8c9a339-203d-4c79-85f2-93b0b52f85fb_8c3c0fc5-8f6f-459c-8b71-02572167925c/deploy-diagrams/references/animation-cookbook.md` (use theme.ts colours, not the skill's palette). You can look at the brand's own static diagrams for reference in `/home/user/Experimental-Repo/superstar/assets/brand/product-imagery/` (three rules, trailing stop, equity curve, P&L by side) — reinterpret them as premium motion, don't copy their colours.

## S10 · Risk first · three rules · trailing stop — film 65.5–76.0 s, 630 local frames, ground Gray
VO: the tail of L15 "…of 2,298 reviews." ends at film 66.97 (local ≈ 88) — enter gently under it. L16 "Risk comes first. The loss limit is set before entry, and never widened." film 67.20–72.29 (local 102–407): `risk` ≈ 107, `loss limit` ≈ 206, `entry` ≈ 280, `never widened` ≈ 330–400. L17 "Size follows the limit. The stop only moves to protect." film 72.60–76.44 (local 426–656; it runs 0.44 s past your scene end into S11): `size` ≈ 438, `stop` ≈ 556, `protect` ≈ 610+. Use `wordF`/`local` from timeline.ts for exact frames.
Design: headline "Risk first." (Season Sans) + "Then the trade." (Season Serif, Blue Glow) — the landing page's own line — landing on "Risk comes first". Then the three rules, each a card with a Season Serif numeral 01/02/03 (landing: "Three rules that don't bend"): 01 **Loss limit set before entry** — visual: an entry line and a hard loss-limit line lock into place; a "widen" attempt pulls at it and it snaps back (latch) on "never widened". 02 **Size follows the limit** — the formula `Loss limit ÷ Stop distance = Position size` builds term by term (mono), with a position-size bar solving itself. 03 **Stops only move to protect** — a price line climbs while a stepped trailing-stop line ratchets up behind it, step by step, never down (each step = a `ratchet` cue); on a pullback the stop holds. The trailing-stop chart should be the dominant final image (it's on screen for "The stop only moves to protect") and should end in a state S11 can grow out of (e.g. the chart card persists at the same place, or you end with a clean exit at local 614–629). Blue Glow ≈ 30% of the frame (filled rule numerals/panels, the price line/area). One turquoise element (e.g. the stop's latest step marker).

## S11 · Proof · simulated backtest — film 76.0–84.0 s, 480 frames, ground Gray (music at its peak)
VO: L17 finishes "…to protect" until local ≈ 26. L18 "Backtested as Bitcoin rose to one hundred and twenty-four thousand, and fell to sixty-three," film 76.80–81.32 (local 48–319): `Bitcoin` ≈ 93, `124` ≈ 143, "fell to sixty-three" ≈ 240–319. L19 "it finished positive through both halves." film 81.60–83.34 (local 336–440): `finished` ≈ 353, `both` ≈ 412, `halves` ≈ 426.
Design: a big viewport Card (MonoHead `superstar · backtest`, right `simulated · btc · jun '25 – jul '26`). Chart from `BACKTEST.btcIndexed` (BTC, Gray ramp line, with callouts `$104k` → `$124k` → `$63k` appearing as the narrator says them — the BTC path's shape is up then down) and `BACKTEST.equityK` (Superstar equity, Blue Glow line + ramp-stepped area fill; the area fill fading to the ground is the one allowed chart gradient, optional) drawing on month by month in sync. A dashed "halfway" marker splits the period into two halves; on "both halves" both halves tick/confirm. The hero numbers: `$271,465` count-up (Season Serif, huge) and `+171.46%` (the scene's single turquoise element OR Blue Glow — choose one turquoise element only), landing on "finished positive". Stat row: `Max drawdown 13.6%` · `688 trades` · `Shorts +$130,427` · `Longs +$41,038` (both directions profitable is the story). Also show honestly that there were down months (the monthly P&L bars in BACKTEST.monthlyPnlK can appear small along the bottom: positive = Blue Glow, negative = Gray 700). A persistent mono label `Simulated backtest · not live trading` must be visible the entire scene. Exit clean by local 479.

## S12 · Where it runs — film 84.0–90.0 s, 360 frames, ground **Blue Glow** (white type; approved pairing)
VO L20 "Spot, perps, and HIP-3, on Hyperliquid." film 84.20–87.83 (local 12–229): `Spot` 12, `perps` ≈ 68, `hip3` ≈ 121, `Hyperliquid` ≈ 189. L21 "USDC in. USDC out." film 88.00–90.55 (local 240–393; runs past your end at 360): `USDC in` 242, `USDC out` ≈ 332.
Design: kinetic typography on Blue Glow: "Spot." "Perps." "HIP-3." land one by one on the words (Season Sans 500, white, big, masked rises, stacked left-aligned), then "on Hyperliquid" with the official Hyperliquid mark via `<Token id="hyperliquid-mono" />` (white mono mark — pairs with Blue Glow) — never draw a logo yourself. Then "USDC in. USDC out." with the official USDC mark `<Token id="usdc" />` flowing into and out of a white card/wallet shape (white surface + Soft Black text is an approved pairing) — "in" on the first USDC, "out" on the second. A mono footer line: `non-custodial settlement · sub-second finality · $10,000 USDC minimum`. One turquoise element max (it's optional here; Turquoise must never be text on Blue Glow — only a non-text dot/marker). Clear the frame in the last ~20 frames (S13, a white end card, follows).

## Deliverables
- The three scene files (+ any `components/S10_*.tsx` helpers), each exporting `SNN`, `T`, `CUES` (generous, precise SFX cues — `ratchet`, `count`/`tick_train`, `draw`, `lock`, `pop`, `whoosh`, etc.; the sound designer spots SFX from them).
- QA: contact sheets at ≥10 timestamps per scene into `<scratchpad>/scratchpad/qa/`, inspect them, fix overlaps/clipping/illegible text/empty frames/off-palette colours, iterate until portfolio-grade. `npx tsc --noEmit` must pass.
- Don't edit shared files; don't commit to git. If you need a shared change, describe it in your final report.
- Final report: what you built per scene (2–3 lines each), paths of your final contact sheets, and any issues or shared-file requests.
````

## Mid-flight directives

Messages sent to running agents, e.g. the client's "less text" note and colour-system updates.

**→ agent `a31658a3c0251d580`**

````text
Key change from the Director: the chosen score (120 BPM, beat phase ~0.48 s) has its tonal centre on C#, NOT D minor. Retune every tonal synth SFX to C#: use only root / fifth / octave / second so they're consonant whether the harmony reads major or minor — C#4, G#4, C#5, D#5, G#5, C#6 (MIDI 61, 68, 73, 75, 80, 85). Avoid D, A, F and E naturals. Rename accordingly, e.g. blip_Cs5, blip_Gs5, blip_Cs6, blip_Ds5, pop_Gs4, pop_Cs5, pulse_ping_Cs, sub_drop_Cs (C#2→C#1), and replace lock_chord_Dm with lock_chord_Cs5 (C#-G#-C# sus arpeggio). If you've already rendered D-tuned files, re-render and delete the D versions. For ElevenLabs tonal prompts (logo_sting, energy_core_form) you can ask for "in C sharp" but it's not guaranteed; note detected pitch in the catalog. Everything else in the brief stands.
````

**→ agent `a6e1bfd1e040f181a`**

````text
You were interrupted before writing your deliverables. Please resume and finish now: write /home/user/Experimental-Repo/superstar/data/market.json and /home/user/Experimental-Repo/superstar/docs/03-quant-brief.md (note: the filename changed from 01- to 03-quant-brief.md; 00/01/02 are taken). Reuse any data you already pulled; re-pull from Hyblock only what's missing. Two additions the film needs: (1) the latest 4 hourly BTC prints (1h klines: open/high/low/close for the last 4 closed hours) plus, where available, the matching hourly OI, funding, liquidations (long/short), buy/sell volume and whale-retail delta readings for those same 4 hours, in market.json under "last4h"; (2) the 30-day long vs short liquidation totals and the single biggest liquidation hour/day, under "liquidations". Keep the reply short: top 10 numbers, regime in 2 sentences, recommended hook, file paths.
````

**→ agent `a31658a3c0251d580`**

````text
You were interrupted before producing files. Please resume the SFX palette brief and finish it (audio/src/sfx/, audio/src/sfx/synth/, audio/src/sfx/catalog.json, audio/SFX-PALETTE.md). Remember the key change: tonal synth SFX in C# (root/fifth/octave/second: C#4, G#4, C#5, D#5, G#5, C#6), no D-minor files. Use the existing ElevenLabs flow N395ArjNXOWqzKvleUeT. Two additions: (a) the film's picture now has a dark Act I (3D candles, liquidations, freeze-frame, a collapse to one point, then a hard cut into a bright world on a big impact at 22.0 s) and a light Act II of UI cards; (b) add three extra ElevenLabs sounds: "iris_open" (a clean airy bright opening swell, 1.2 s), "star_lock" (a satisfying crystalline-mechanical click-lock with a short tonal ring, 0.8 s), and "tape_stop" if not already in your list. Reply briefly when done: files, top picks, failures, credits used.
````

**→ agent `a82b160f1f817711c`**

````text
Director's note from the USER (applies to S06, S07, S08 now): "Let's not have too much text to read on screen. It should be a highly visual motion animation video." Cut on-screen text hard: no bullet points or sentences inside cards; keep only the step header (numeral + 2–4 word title), key numbers, and 1–3-word labels. Let visuals carry meaning: S06 = candles + a few big readings (price, OI, liq) not a data table; S07 = chips as short 1–2-word tags or icons + pulses into the core (the 18 inputs can be dots/short tags, not full names), quadrant panel with 2-word label max; S08 = BULL/BEAR cards reduced to a word + its invalidation price, chart + dashed lines + tug bar do the talking, drop the bullet text. Mono meta lines: at most one per scene. Keep every motion idea — just trade text for visuals. Re-QA with contact sheets after the cut.
````

**→ agent `ac0d0d31db3cb373b`**

````text
Director's note from the USER (applies to S10, S11, S12 now): "Let's not have too much text to read on screen. It should be a highly visual motion animation video." Cut on-screen text hard: no sentences or bullet text in cards; keep headline words (≤4 words), key numbers and 1–3-word labels only. S10: "Risk first." + the three rules as numerals with 2–3-word labels max; the formula can be icons/short terms (e.g. "Limit ÷ Stop = Size"), let the latch/ratchet visuals carry it. S11: keep the chart, $271,465 / +171.46%, and at most 3 short stats; one tiny "Simulated backtest" label (required). S12: the kinetic words + logos are fine, but drop the long mono footer to at most "$10,000 USDC minimum" or remove it. Keep all motion ideas — trade text for visuals. Re-QA with contact sheets after the cut.
````

## Music

Model `eleven_music_v2`, node type `music`, `generations_count: 3`. Take A chosen.

````text
Instrumental minimal cinematic electronic score in D minor at a steady 120 BPM, crisp modern production like a premium tech keynote film. Opens tense and sparse with a deep sub-bass pulse, a ticking clock hi-hat and dark filtered synth, then grows urgent and restless with glitchy syncopated percussion and gritty bass stabs until an abrupt full stop at about 20 seconds. After a breath of silence, a wide warm analog synth chord swells with a deep impact, and settles into a steady, propulsive, confident minimal techno groove with a clean pulsing arpeggio that adds a new layer every eight seconds. Around 62 seconds it breaks down to almost nothing, a soft sustained pad and a faint tick, then rebuilds with a rising pulse into a full, uplifting, confident peak groove from 78 to 90 seconds, ending on one big final hit at about 91 seconds followed by a long decaying ambient tail. No vocals.
````

## Narration

Model `eleven_multilingual_v2`. The same full script was generated with 3 voices × 2 takes: `e70vjI59gG5dZUD6cZTQ`, `oHB9Xhox1bqMl1Tvkmel`, and **`dDFwUy1jwGLD1X8PGYKg` (Signal – Deep Contemplative Narrator, chosen)**. The ellipses (…) produce the breaths.

````text
This market doesn't trend… It whipsaws… Ninety-one direction changes in a month.

Five hundred and forty-two million dollars of longs, liquidated… Six hundred and sixteen million of shorts.

Pick one side, and this market makes you pay… Unless you can trade both.

Meet Superstar… An intelligent agent, trading both sides for you.

Every four hours, it takes a fresh read of the market… and makes one decision.

It reads the last four hours, hour by hour.

Weighs eighteen market signals: leverage, liquidations, order flow, whales against retail.

Argues the bull case, and the bear case… each with the exact level that proves it wrong.

Then it chooses. Long… Short… Or nothing at all.

In the backtest, it sat out one thousand, three hundred and fifty… of two thousand, two hundred and ninety-eight reviews.

Risk comes first. The loss limit is set before entry, and never widened. Size follows the limit. The stop only moves to protect.

Backtested as Bitcoin rose to one hundred and twenty-four thousand, and fell to sixty-three… it finished positive through both halves.

Spot, perps, and hip three, on Hyperliquid. U-S-D-C in… U-S-D-C out.

Superstar… Now live on Deploy.
````

**Pickup** (4 takes, same voice, after the count was corrected from 91 to 89):

````text
This market doesn't trend… It whipsaws… Eighty-nine direction changes in a month.
````

## Hero plates

Kling 3 Pro, 9:16, 1080p, `generate_audio: false`. Only P1 and P3 were generated.

### P1 · candle canyon (dark), used in S01 (generated at 8 s)

Parameters: `{"duration_secs": 10, "aspect_ratio": "9:16", "resolution": "1080p", "generate_audio": false, "negative_prompt": "text, letters, numbers, logos, watermark, neon, rainbow colors, green, red, orange, lens flare, bloom, glow, people, hands, warped geometry, flicker, morphing"}`

````text
Abstract cinematic 3D render in a pitch-black void. Long rows of tall, slender, matte indigo-blue and dark graphite rectangular pillars shaped like financial candlesticks, each with a thin vertical wick above and below, form a deep canyon that recedes into darkness. The pillars sharply shoot up and drop down in height at different moments, like a violently whipsawing market, then briefly hold. The camera performs a slow, steady low dolly forward down the middle of the canyon, slightly tilted up, shallow depth of field, anamorphic lens feel. A soft overhead studio key light draws crisp edge highlights along the matte surfaces while the background stays pure black. Minimal, precise, premium tech keynote aesthetic, photoreal materials, subtle film grain, slow and controlled motion.
````

### P2 · shattering candle (dark), not generated

Parameters: `{"duration_secs": 5, "aspect_ratio": "9:16", "resolution": "1080p", "generate_audio": false, "negative_prompt": "text, letters, numbers, logos, watermark, neon, rainbow colors, green, red, orange, fire, explosion flames, lens flare, bloom, glow, people, flicker, morphing"}`

````text
Extreme macro slow-motion shot in a pitch-black void. A single tall, slender matte indigo-blue candlestick pillar with a thin wick stands in the center of frame. Suddenly it fractures from the top down and bursts into thousands of tiny sharp indigo and dark graphite shards that scatter outward and fall downward through the frame, spinning and catching crisp specular highlights, then drift out of frame leaving darkness. The camera holds steady at eye level with a very slow push-in, macro lens, shallow depth of field with the falling shards drifting in and out of focus. Hard overhead studio key light, pure black background. Minimal, precise, premium tech keynote aesthetic, photoreal materials, subtle film grain.
````

### P3 · core assembly (light), used in S04

Parameters: `{"duration_secs": 6, "aspect_ratio": "9:16", "resolution": "1080p", "generate_audio": false, "negative_prompt": "text, letters, numbers, logos, watermark, neon, rainbow colors, green, red, orange, gold, lens flare, bloom, glow, sparkles, people, hands, dark background, warped geometry, flicker, morphing"}`

````text
Premium 3D product render on a soft, seamless lavender-white studio background. Hundreds of small matte indigo-blue ceramic shards and tiny spheres float in from every edge of the frame and converge toward the center, where they click together into one precise faceted geometric star-shaped polyhedron, a stellated crystal core with crisp sharp edges in deep indigo, which locks into shape with a subtle settle and then rotates slowly and calmly. The camera holds centered, then performs a very slow push-in with shallow depth of field. Soft diffused studio lighting from above, gentle contact shadows, clean highlights on the facets, the background stays evenly lavender-white. Minimal, precise, calm, premium fintech keynote aesthetic, photoreal materials, subtle film grain.
````

## Sound effects

### Batch 1: cinematic set (`eleven_text_to_sound_v2`, 2 takes each)

| Prompt | Parameters |
|---|---|
| Fast clean airy whoosh pass-by, crisp and short, smooth air movement, no reverb tail | `{"duration_seconds": 0.8, "prompt_influence": 0.6}` |
| Smooth deep swoosh with soft low-end body, slow and elegant air movement, clean | `{"duration_seconds": 1.6, "prompt_influence": 0.6}` |
| Reverse airy swell rising into a sudden stop, suck-in effect, clean and smooth | `{"duration_seconds": 1.6, "prompt_influence": 0.6}` |
| Deep clean sub impact hit, tight punchy transient, short dark tail, no distortion | `{"duration_seconds": 2.5, "prompt_influence": 0.7}` |
| Soft muted low thump, gentle deep knock, short and clean | `{"duration_seconds": 1, "prompt_influence": 0.6}` |
| Bright airy opening swell, glassy shimmer blooming outward, clean and uplifting | `{"duration_seconds": 1.6, "prompt_influence": 0.6}` |
| Many small ceramic beads pulled together by a magnet, soft rising clatter converging, clean | `{"duration_seconds": 2, "prompt_influence": 0.5}` |
| Satisfying crystalline click-lock with a short bright glassy ring, precise and clean | `{"duration_seconds": 0.9, "prompt_influence": 0.7}` |
| Soft felt sliding on glass, smooth short slide into place, subtle and clean | `{"duration_seconds": 0.7, "prompt_influence": 0.6}` |
| Elegant short logo sting, soft deep hit with a warm glassy tonal shimmer in C sharp, restrained | `{"duration_seconds": 2.8, "prompt_influence": 0.6}` |
| Tiny dry electric spark crackles, small sharp pops, close-mic, clean | `{"duration_seconds": 1, "prompt_influence": 0.6}` |
| Low tension riser, filtered noise and tonal sweep rising steadily, clean, ends abruptly | `{"duration_seconds": 4, "prompt_influence": 0.6}` |

### Batch 2: UI and mechanical set (2 takes each)

| Prompt |
|---|
| Premium minimal interface click, single crisp soft tap of a small plastic button, clean, dry, close-mic |
| Punchy short low impact thump with a crisp snap transient, solid weight landing, tight, dry, no tail |
| Quick thin air whip swish, fast rising whoosh of a thin cable slicing air, crisp, dry, no crack |
| Satisfying mechanical latch clicking firmly into place, precise lock-in click, solid and clean, close-mic, dry |
| Single deep soft heartbeat pulse, low muffled thump, clean, silence after |
| Single precise wristwatch tick, tiny crisp mechanical tick, close-mic, dry |
| Soft digital shimmer, gentle glittering high electronic sparkle flowing smoothly, airy and delicate, clean |
| Soft rounded bubble pop, single gentle clean pop, short |
| Soft smooth mechanical rotating sweep, gentle fine gear whir turning once, quiet and clean, close-mic |
| Tape stop effect, electronic tone slowing down and pitching down to a sudden halt, clean |


Prompting pattern that worked: **[size/character] + [material/source] + [action] + [texture] + "clean, dry, close-mic, no reverb tail"**. Use `prompt_influence` 0.6–0.7 for precise one-shots and 0.5 for textures. Set short durations for one-shots (0.5–1 s).

## Templates for the next film

### Quant brief (template)
````text
You are the QUANT ANALYST on a creative crew making a <LEN>-second, <ASPECT> launch film for <PRODUCT>.
Today is <DATE>. Gauge the CURRENT market with real data and write the narrative about <THEME> the film will be built on.
Product context (only claims we can make): <bullet facts from docs, with numbers>.
Tools: <MCP tools, how to load them, a known-good call, gotchas (units, limits)>.
Gather: 1) price series <windows>, 2) volatility <metrics>, 3) leverage & positioning <metrics>, 4) order flow.
Counting rules: closed candles only, state windows and venue for every number, flat candles ignored for direction counts.
Deliverables: A) data/market.json <shape>, B) docs/quant-brief.md with snapshot table (value + source + timestamp),
"The regime", "The narrative", "Why this regime favours <PRODUCT>" (map property → feature), film-ready facts, opening hooks, caveats.
Reply with: the 5 strongest numbers and the one-sentence regime.
````

### Scene brief (template)
````text
You are a MOTION DESIGNER on a crew making a <LEN>-second 9:16 film. You build scenes <IDS> in <PATH>.
First read: docs/05-motion-brief.md (follow exactly), 02-color-system.md, 01-director-treatment.md, 04-script.md; skim theme.ts, ui.tsx, Star.tsx, timeline.ts, data keys.
Files you own: scenes/<IDS>.tsx and components/<ID>_*.tsx. Everything else is read-only; don't commit.
## <ID> · "<title>" — film <a>–<b> s, <n> local frames, ground <colour>
VO <line id> "<text>" film <t0>–<t1> (local ≈ <x>–<y>). Sync <words> via wordF('<Lxx>','<word>', nth).
Design: <what the viewer sees, in order>. Blue Glow ≈30%. Single turquoise element: <element>. Labels ≤3 words; numbers are the text.
Exit: <clean exit / match cut spec>.
Export T (local frames) and CUES (landing frames; kinds from the brief; dur=<frames> for sustained sounds).
QA: tsc passes; contact sheet of ≥10 frames incl. first/last/every sync point; fix what you see.
Report: files, what lands on which word, issues with shared files, requests.
````

### Score prompt (template)
````text
Instrumental <genre> score in <key> at a steady <BPM divisible into fps> BPM, <production reference>.
Opens <Act I mood + instruments>, grows <build> until an abrupt full stop at about <t_stop> seconds.
After a breath of silence, <reveal gesture> with a deep impact, and settles into <Act II groove> that adds a new layer every eight seconds.
Around <t_breakdown> seconds it breaks down to almost nothing, <minimal elements>, then rebuilds into <peak> from <a> to <b> seconds,
ending on one big final hit at about <t_end> seconds followed by a long decaying tail. No vocals.
````

### Plate prompt (template)
````text
<Medium> on <background exactly matching the brand ground>. <Subject> <action beat 1>, <beat 2>, <final state>.
The camera <move>, <lens/DOF>. <Lighting>, background stays <ground>. Minimal, precise, <brand adjectives>, photoreal materials, subtle film grain.
NEGATIVE: text, letters, numbers, logos, watermark, neon, rainbow colors, <off-brand hues>, lens flare, bloom, glow, people, hands, warped geometry, flicker, morphing
````

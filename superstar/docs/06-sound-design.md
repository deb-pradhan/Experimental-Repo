# 06 · Sound design and mix

**Brief from the client:** the SFX should match what moves on screen, sound crisp and easy on the ear, and make people want to hear it again.

## Principles

1. **Every motion has a sound, placed on its exact frame.** Each scene exports `CUES` (`{at, kind, note}`) next to the animation that drives them. `npm run cues` (in `video/`) collects them into `audio/cues.json` on the film timeline. The mixer places each sound's transient on its cue: impacts on their peak, whooshes on their loudest point, clicks on their onset.
2. **In tune with the score.** The score (ElevenLabs take A, 120 BPM) centres on C#. Every tonal SFX uses only C#, G# and D# (root, fifth and second), so it stays consonant whichever way the harmony leans.
3. **Kind to the ear.** The 2–5 kHz band causes ear fatigue. The synth sounds are voiced to avoid it: ticks are glassy highs (4.2–9 kHz) or warm lows (0.9–2 kHz), with nothing harsh in between. Every ElevenLabs take goes through `tame()`: a 3.3 kHz dip sized to its measured harshness (`tools/sfx_analyze.py`), a soft top shelf, and a tighter sub.
4. **No machine-gunning.** Repeated sounds rotate between takes and vary slightly in pitch, level and pan. Sounds of the same kind within 2 frames merge into one. The exception is the 89 counted direction flips, which are data.
5. **The sound carries the data.**
   - **S01 · 89 direction flips.** A turn down (a high) ticks bright and a turn up (a low) ticks warm. The pan follows the drawing head from left to right, and the pitch climbs as the counter climbs.
   - **S02 · 30 days of liquidations.** Each day sparks in proportion to its dollar size. The biggest days add an ember thump and a crackle.
   - **LONG and SHORT have a pitch.** LONG leans up (C#6) and SHORT leans down (G#5), in S03, S08 and S09.
   - **S05 · six daily reviews.** They climb the C# pentatonic (C#5 → G#6) towards "One decision." The review clock ticks on the score's beat.
   - **S09 · 1,350 quiet reviews.** A cascade of tuned grains that thins out, matching the counter's easing.
6. **A sonic signature.** A C#·G#·C# "confirm" chord (`lock_chord`) plays three times: when the star locks at the reveal, on **NO TRADE**, where it is the key sound of the film and plays in near-silence, and under the final logo.

## The score, edited to picture

- 20 ms delay. A 4-bar repeat (src 41.98–49.98 s) is inserted at 49.98 s, so the drop falls at 58.0 s, between "Short." and "Or nothing at all."
- **S03 freeze (20.23 s):** the score tape-stops (varispeed down over 0.62 s, top end dulling). Then comes silence with a heartbeat, a reverse swell that peaks as the chart collapses into a point, and the score's own swell back into the **22.0 s reveal impact**.
- Section rides: +9 dB for Act I's sparse bed (0–20 s) and +6 dB for the 58 s breakdown, so both read under the voice.
- One bar (src 79.98–81.98 s) is cut with the removed "USDC in. USDC out." beat, so the final hit falls on the S12 → S13 cut (88.0 s). The logo lands on the beat at 89.0 s, together with the narrator's "Superstar", and the score rings out to black at 97.0 s.

## Mix and master

- **Narration:** each line is matched to −17 LUFS, then adjusted by the per-line trim in `vo_plan.json`. Treatment is a light 180 Hz dip and a gentle de-ess at 6.8 kHz.
- **Dialogue-aware sidechain:** under the voice, the music sits at least 9 dB below it, with up to 12 dB of ducking. It opens with a 40 ms attack and breathes back with a 550 ms release. The SFX bus dips 2 dB under the voice.
- **Master:** −14 LUFS integrated, true peak ≤ −1 dBTP (4× oversampled look-ahead limiter), 48 kHz / 24-bit.
- **QA:** `tools/mix_report.py` plots momentary level per stem, voice-over-music margin and a spectrogram. It also lists the cues whose SFX peak sits lowest against the bed, so none gets buried.

## Palette

| kind | source | notes |
|---|---|---|
| tick / tick_train / type | synth `tick`, `tick_train` | glassy / warm, rising pitch on count-ups |
| crackle, crackle_big | synth `spark` + EL `crackle_a` + EL `impact_soft_a` | sized by $ liquidated |
| blip, ping, pop | synth, C#/G#/D# only | status lines, data arriving, candles landing |
| click | EL `ui_click_a` + tonal blip | LONG ↑ C#6 / SHORT ↓ G#5 |
| lock | EL `ui_lock_a` + blip; NO TRADE = `lock_chord` + shimmer | |
| swipe, scan, cut_hush | synth `air` (tamed) | type reveals, scan bars |
| whoosh, card_in/out, slide | EL `whoosh_short_a/b`, `card_slide_a` | card moves |
| impact_soft | EL `number_slam_a` / `impact_soft_a` + C#5 tone | numbers landing |
| impact_big | EL `impact_big_b` + synth C# sub drop | reveal, final logo |
| iris_open, energy_form, star_lock | EL `iris_open_a`, `energy_form_b`, `star_lock_a` (+ chord) | S04 reveal |
| reverse_swell, heartbeat, tape_stop | EL `reverse_swell_a`, synth `heartbeat`, EL `freeze_stop_a` | S03 → S04 silence |
| clock_sweep | EL `clock_tick_b` on every beat | S05 review clock |
| grain_in, dotwave | synth `grains` | S09 dot field |
| whoosh_reverse, logo_sting | EL `reverse_swell_a` + `whoosh_long_a`; `logo_sting_b` + `shimmer_a` + chord | S13 |

Rebuild: `cd video && npm run cues && cd .. && python3 tools/mix_audio.py && python3 tools/mix_report.py`.

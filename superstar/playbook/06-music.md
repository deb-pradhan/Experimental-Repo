# 06 · Music

## 1. Writing the score prompt

The score was written **to the structure of the treatment**. The prompt names the tempo, key, instrumentation and, most importantly, **what happens at which second**, so the generated track already has the film's shape.

Model: ElevenLabs `eleven_music_v2` via `creative_generate_in_flow` (node type `music`), `generations_count: 3`. The full prompt is in [11-prompt-library.md](11-prompt-library.md#music).

| Prompt element | What we asked for | Why |
|---|---|---|
| Genre + reference | "Instrumental minimal cinematic electronic … premium tech keynote film" | Sets the production quality |
| Tempo | "steady 120 BPM" | 120 BPM at 60 fps gives a beat of exactly 30 frames and a bar of 120 frames, so all maths is in integers |
| Act I | "tense and sparse … sub-bass pulse, ticking hi-hat … urgent … **abrupt full stop at about 20 seconds**" | The freeze |
| Reveal | "a breath of silence, a wide warm analog synth chord swells with a deep impact" | The 22 s reveal |
| Act II | "propulsive, confident minimal techno groove … adds a new layer every eight seconds" | Steps 01–04 |
| Breakdown | "Around 62 seconds it breaks down to almost nothing" | NO TRADE silence |
| Peak | "rebuilds … full, uplifting peak groove from 78 to 90 seconds" | Proof + close |
| Ending | "one big final hit at about 91 seconds followed by a long decaying ambient tail" | Logo |
| "No vocals" | — | VO clarity |

We generated three takes (A, B, C) and chose **A**. It had the clearest stop at 20 s, the best impact and a clean groove.

## 2. Analysing the take

`tools/audio_analyze.py` and `tools/music_struct.py` decode to 48 kHz mono and compute an onset envelope (spectral flux), RMS per window, a tempo estimate and downbeats.

| Measured | Value |
|---|---|
| Tempo | 120 BPM (beat 0.5 s = 30 f, bar 2.0 s = 120 f) |
| Tonal centre | **C#**. The prompt asked for D minor; the model drifted. Always measure the key; don't trust the prompt. All tonal SFX were tuned to C#. |
| Act I stop | Last hit at 20.0 s, then a quiet swell (-36 → -25 dB) into a hit at ~21.97 s |
| Groove | ~26 s onward |
| Source length | 91.0 s |

## 3. Editing the score to picture

```mermaid
flowchart LR
    subgraph Source take A 0–91 s
      s1[0 – 49.98]
      s2[41.98 – 49.98<br/>4-bar groove]
      s3[49.98 – 79.98]
      s4[79.98 – 81.98<br/>1 bar]
      s5[81.98 – 91.0<br/>final hit + tail]
    end
    s1 --> f1[film 0.02 – 50.0]
    s2 -->|repeated| f2[film 50.0 – 58.0]
    s3 --> f3[film 58.0 – 88.0]
    s4 -.->|cut with USDC beat| x[✗]
    s5 --> f4[film 88.0 – 97.0]
```

| Edit | Why |
|---|---|
| +20 ms delay | Aligns the score's downbeats to whole seconds on the film |
| **4-bar repeat** of 41.98–49.98 inserted at 49.98 | Pushes the breakdown to 58.0 s so the drop falls between "Short." and "Or nothing at all." |
| **1-bar cut** of 79.98–81.98 | Added in review when the USDC line was removed. The final hit moves from 90.0 to 88.0 and stays on the S12→S13 cut. Cutting exactly one bar keeps the beat grid intact. |
| Splices on downbeats with 8 ms crossfades | No clicks, no rhythmic hiccup |
| **Tape-stop** at the S03 freeze (20.23 s) | Varispeed down over 0.62 s (`rate = (1 − t/dur)^1.6`), top end dulled with a −6 dB high shelf, then silence |
| Swell returns 21.05 → 21.96 s | Fade (power 2.2) back into the score's own swell, so the 22.0 s impact hits with full weight |
| Section rides | +9 dB for Act I's sparse bed (0–20.2 s), +6 dB for the breakdown (58–65.6 s), so they read under the voice |
| Tail fade | The last 2.5 s fade to silence |

All of this is code in `build_music()` in `tools/mix_audio.py`, driven by `MUSIC['segments']`, so re-editing is a one-line change.

## 4. Checking the edit

After every edit, verify the hits land where the picture expects them:

```python
# onset strength around the expected hit
for t in [86.0, 86.5, 87.0, 87.5, 88.0, 88.5]:
    ...  # expect the strongest onset at 88.000 (final hit) after the 1-bar cut
```

The final mix gave onset 64.4 at exactly 88.000 s, then a decaying tail, as intended.

## 5. Lessons

| Lesson | Detail |
|---|---|
| Put the structure in the prompt with timestamps | The generated take already had the stop, impact, breakdown and final hit roughly where needed. The edit only had to shift them by bars. |
| Pick a BPM that divides your fps | 120 BPM at 60 fps gives integer frames per beat and bar. 30 fps works too. |
| Edit in whole bars | Any insert or cut of N × 2.0 s keeps every later cue on the grid |
| Measure the key | Tune SFX to the measured key, not the requested one |
| Leave the drop to the music | S09's cut is a "hush", with no SFX hit, because the silence *is* the effect |

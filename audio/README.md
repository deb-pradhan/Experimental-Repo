# Audio — HireHouse launch film

Everything here was generated with the **ElevenLabs** MCP (flow: https://elevenlabs.io/app/flows/G1HLHBjcyZW9hSTD3eRQ)
and mixed with `tools/mix_audio.py` (ffmpeg). The master is `mix/hirehouse_mix.wav`
(48 kHz stereo, **−14.0 LUFS integrated, −1.0 dBTP**, 30.0 s).

## Voice

| | |
|---|---|
| Voice | **Aakash Aryan – Formal & Cinematic Ads** (`Q81gqXyT5m1l1DH4s9Kx`), Indian-English, measured and deliberate |
| Why | The markets are the UAE and India; the voice "holds pauses where a film score would", which suits a brutalist, confident cut |
| Model | `eleven_multilingual_v2`, one continuous read of the locked script (`docs/03-script.md`), take A |
| Backup | Emma – Professional Commercial (`9HBoEQ8LqyvVZFYDodnr`), `src/vo_emma.mp3` |
| Edit | The read is split at its natural pauses (`tools/audio_analyze.py vo`) and each line is placed on picture; long internal pauses are tightened to fit the scene windows |

## Music

`src/music_v2_b.mp3` — `eleven_music_v2`, instrumental, 120 BPM minimal electronic build.
Analysis (`tools/audio_analyze.py music`): steady pad → percussion enters → peak → a single final hit at 44.98 s → silence.
The bed is slid by **17.98 s** so that its beat grid sits on the film's 0.5 s grid and the **final hit lands at 27.0 s**,
exactly as the blue curtain lifts onto the end card. Percussion enters as the pile becomes a list (≈10.5 s) and the peak
sits under the blue climax (24–27 s). A 0.6 s dip before the tie lands is the pre-drop breath.
The music is side-chain ducked under the VO.

Rejected: `music_bed_take1–3`, `music_v2_a` — each has 10–15 s of dead silence mid-track.

## SFX (ElevenLabs Sound Effects v2)

| File | Used for |
|---|---|
| `sfx_paper_flurry_4s_a/b` | the pile building (S1) |
| `sfx_ui_ticks` | applicant counter, score count-ups, meters |
| `sfx_scan_sweep` | the keyword-filter scan line (S2) |
| `sfx_cards_fall` | filtered cards dropping away |
| `sfx_whoosh_fast_a` + `sfx_tock_b` + `sfx_impact_sub_a` | the house mark landing on the pile (S3) |
| `sfx_shimmer_rise` | every application coming back, read |
| `sfx_card_snap_cascade` | the pile snapping into a list |
| `sfx_whoosh_fast_a/b`, `sfx_whoosh_panel` | wipes, the FLIP re-sort, shortlist cards rising |
| `sfx_click_a/b`, `sfx_rec_beep`, `sfx_toast_pop` | UI: invites, anti-cheat switch, record, "Interview invite sent" |
| `sfx_riser` + `sfx_impact_sub_b` | into the blue climax |
| `sfx_logo_sting_35_a` | the wordmark lockup completing on the end card |

Every cue's frame is listed in `tools/mix_audio.py` and matches `video/src/timeline.ts`.

## Rebuild

```bash
pip install numpy imageio-ffmpeg
python3 tools/mix_audio.py            # → audio/mix/hirehouse_mix.wav (+ stems)
cp audio/mix/hirehouse_mix.wav video/public/audio/
```

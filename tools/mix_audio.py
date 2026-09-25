"""HireHouse launch film — audio mix.

Builds the 30.0 s stereo mix from the ElevenLabs sources in audio/src:
  * VO (Aakash Aryan, take A) cut into lines at its natural pauses and placed on picture
  * music bed (music_v2_b) slid so its beat grid and final hit land on the film's bar grid
  * SFX spotted to motion events (frame numbers match video/src/timeline.ts EV)
  * music side-chained under the VO, master loudness-normalised to -14 LUFS / -1 dBTP

Usage: python3 tools/mix_audio.py  ->  audio/mix/hirehouse_mix.wav (+ stems)
"""
import json
import os
import subprocess

import imageio_ffmpeg

FF = imageio_ffmpeg.get_ffmpeg_exe()
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, 'audio', 'src')
OUT = os.path.join(ROOT, 'audio', 'mix')
FPS = 60
DUR = 30.0
f = lambda frame: frame / FPS  # frames -> seconds

# ---------------------------------------------------------------- VO
# Segments of vo_aakash_a.mp3 (from tools/audio_analyze.py, silence split).
# Each line: (film start s, [(src_in, src_out), ...], gap between segments s or None = keep natural)
VO_SRC = 'vo_aakash_a.mp3'
VO_LINES = [
    ('One role.', 0.60, [(0.00, 0.46)], None),
    ('Hundreds of applications.', 1.75, [(0.95, 2.29)], None),
    ('Most are cut by a keyword filter. Unread.', 4.40, [(2.75, 4.67), (5.30, 5.84)], 0.45),
    ('HireHouse reads every one.', 8.90, [(6.60, 8.19)], None),
    ('Ranks them on merit. Skills and fit, not keywords.', 12.20, [(8.95, 10.06), (10.43, 11.30), (11.80, 12.88)], 0.24),
    ('A structured video interview, with integrity checks.', 16.25, [(13.52, 14.90), (15.17, 16.31)], 0.22),
    ('Then, a shortlist.', 20.30, [(16.85, 17.14), (17.50, 18.29)], 0.30),
    ('You make the call.', 22.05, [(18.69, 19.50)], None),
    ('Hiring, decided on merit.', 24.30, [(20.21, 20.61), (20.97, 21.98)], None),
    ('HireHouse.', 27.62, [(22.67, 23.41)], None),
]
PRE, POST = 0.03, 0.09  # handles around each segment (s)

# ---------------------------------------------------------------- MUSIC
MUSIC_SRC = 'music_v2_b.mp3'
MUSIC_OFFSET = 17.98  # src = film + offset → beats on 0.5 s grid, final hit at film 27.0 s

# ---------------------------------------------------------------- SFX
# (file, film frame where the *transient* should land, gain dB, [trim_in_s, dur_s], fade_out_s)
SFX = [
    # S1 the pile
    ('sfx_paper_flurry_4s_a.mp3', 18, -12, [0.0, 4.0], 0.6),
    ('sfx_paper_flurry_4s_b.mp3', 150, -11, [0.0, 4.0], 0.8),
    ('sfx_ui_ticks.mp3', 104, -24, [0.0, 2.0], 0.3),
    # S2 keyword filter
    ('sfx_scan_sweep.mp3', 274, -17, [0.0, 1.9], 0.4),
    ('sfx_cards_fall.mp3', 318, -11, [0.3, 0.7], 0.2),
    ('sfx_cards_fall.mp3', 346, -12, [0.3, 0.7], 0.2),
    ('sfx_cards_fall.mp3', 374, -13, [0.3, 0.7], 0.2),
    # S3 the house mark lands on the pile, the read, the list
    ('sfx_whoosh_fast_a.mp3', 506, -9, [0.2, 1.1], 0.3),  # the mark rushes in
    ('sfx_impact_sub_a.mp3', 530, -7, [0.0, 1.0], 0.3),
    ('sfx_tock_b.mp3', 530, 0, [0.0, 0.8], 0.2),
    ('sfx_shimmer_rise.mp3', 536, -13, [0.0, 1.0], 0.3),
    ('sfx_card_snap_cascade.mp3', 624, -11, [0.8, 1.2], 0.3),
    ('sfx_whoosh_panel.mp3', 628, -17, [0.0, 1.2], 0.4),  # mark flies to the title bar
    ('sfx_whoosh_fast_b.mp3', 668, -12, [0.0, 1.4], 0.4),
    # S4 ranked
    ('sfx_ui_ticks.mp3', 764, -22, [0.0, 2.0], 0.3),
    ('sfx_whoosh_panel.mp3', 852, -15, [0.0, 1.2], 0.3),
    ('sfx_click_a.mp3', 912, -16, [0.0, 0.48], 0.05),
    ('sfx_click_a.mp3', 918, -18, [0.0, 0.48], 0.05),
    ('sfx_click_a.mp3', 924, -20, [0.0, 0.48], 0.05),
    # S5 interview
    ('sfx_whoosh_fast_a.mp3', 948, -12, [0.2, 1.2], 0.3),
    ('sfx_rec_beep.mp3', 990, -20, [0.0, 0.6], 0.1),
    ('sfx_click_b.mp3', 1010, -14, [0.0, 0.48], 0.05),
    ('sfx_ui_ticks.mp3', 1040, -24, [0.0, 1.6], 0.3),
    # S6 shortlist
    ('sfx_whoosh_fast_b.mp3', 1188, -12, [0.0, 1.2], 0.3),
    ('sfx_whoosh_panel.mp3', 1212, -14, [0.0, 0.9], 0.2),
    ('sfx_whoosh_panel.mp3', 1242, -15, [0.0, 0.9], 0.2),
    ('sfx_whoosh_panel.mp3', 1272, -16, [0.0, 0.9], 0.2),
    ('sfx_whoosh_panel.mp3', 1302, -14, [0.0, 0.9], 0.2),
    ('sfx_click_a.mp3', 1346, -16, [0.0, 0.48], 0.05),
    ('sfx_toast_pop.mp3', 1354, -8, [0.0, 1.0], 0.2),
    # S7 climax
    ('sfx_riser.mp3', 1446, -14, [0.0, 2.1], 0.05),  # riser ends on the first word (transient = end, see below)
    ('sfx_impact_sub_b.mp3', 1446, -6, [0.0, 1.0], 0.3),
    ('sfx_whoosh_fast_b.mp3', 1496, -18, [0.0, 0.8], 0.2),  # slash on "decided"
    ('sfx_whoosh_fast_b.mp3', 1522, -17, [0.0, 0.8], 0.2),  # slash on "on merit."
    # S8 end card
    ('sfx_whoosh_fast_a.mp3', 1616, -13, [0.2, 1.2], 0.3),
    ('sfx_logo_sting_35_a.mp3', 1658, -5, [0.0, 3.48], 1.0),  # the wordmark completes as the VO says "HireHouse."
]
# SFX whose placement is anchored at their END rather than their start
END_ANCHORED = {'sfx_riser.mp3'}


def run(cmd):
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode != 0:
        print(r.stderr[-3000:])
        raise SystemExit('ffmpeg failed')
    return r.stderr


def build():
    os.makedirs(OUT, exist_ok=True)
    inputs, chains, vo_labels, sfx_labels = [], [], [], []

    def add_input(path):
        inputs.extend(['-i', os.path.join(SRC, path)])
        return len(inputs) // 2 - 1

    # VO lines → segments placed with optional gap compression
    vo_idx = add_input(VO_SRC)
    k = 0
    for text, start, segs, gap in VO_LINES:
        t = start
        for i, (a, b) in enumerate(segs):
            a0, b0 = max(0.0, a - PRE), b + POST
            lab = f'vo{k}'
            chains.append(
                f'[{vo_idx}:a]atrim={a0:.3f}:{b0:.3f},asetpts=PTS-STARTPTS,'
                f'afade=t=in:d=0.02,afade=t=out:st={b0 - a0 - 0.05:.3f}:d=0.05,'
                f'adelay={int((t - (a - a0)) * 1000)}:all=1[{lab}]'
            )
            vo_labels.append(f'[{lab}]')
            k += 1
            if i + 1 < len(segs):
                nxt = segs[i + 1][0]
                t += (b - a) + (gap if gap is not None else nxt - b)

    # Music: slide, fade in, pre-drop breath at the tie drop, tail to silence
    m_idx = add_input(MUSIC_SRC)
    chains.append(
        f'[{m_idx}:a]atrim={MUSIC_OFFSET:.3f}:{MUSIC_OFFSET + DUR:.3f},asetpts=PTS-STARTPTS,'
        f'afade=t=in:d=1.2,'
        f"volume='if(between(t,{f(496):.3f},{f(532):.3f}),0.32,1)':eval=frame,"
        f'afade=t=out:st=29.0:d=1.0,volume=-3dB[music]'
    )

    # SFX
    for j, (name, frame, gain, (tin, tdur), fout) in enumerate(SFX):
        idx = add_input(name)
        start = f(frame) - (tdur if name in END_ANCHORED else 0.0)
        lab = f'sx{j}'
        chains.append(
            f'[{idx}:a]atrim={tin:.3f}:{tin + tdur:.3f},asetpts=PTS-STARTPTS,aformat=sample_rates=48000:channel_layouts=stereo,'
            f'afade=t=out:st={max(0.0, tdur - fout):.3f}:d={fout:.3f},volume={gain}dB,'
            f'adelay={int(max(0.0, start) * 1000)}:all=1[{lab}]'
        )
        sfx_labels.append(f'[{lab}]')

    n_vo, n_sx = len(vo_labels), len(sfx_labels)
    chains.append(f'{"".join(vo_labels)}amix=inputs={n_vo}:normalize=0,aformat=sample_rates=48000:channel_layouts=stereo,'
                  f'highpass=f=80,acompressor=threshold=-20dB:ratio=3:attack=5:release=120,volume=+4dB,asplit=3[vo][vokey][vostem]')
    chains.append(f'{"".join(sfx_labels)}amix=inputs={n_sx}:normalize=0,asplit=2[sfx][sfxstem]')
    chains.append('[music]aformat=sample_rates=48000:channel_layouts=stereo,asplit=2[mus][musstem]')
    # Duck the music under the voice
    chains.append('[mus][vokey]sidechaincompress=threshold=0.03:ratio=6:attack=20:release=350:makeup=1[musduck]')
    chains.append('[vo][sfx][musduck]amix=inputs=3:normalize=0,atrim=0:30,apad=whole_dur=30[premaster]')

    graph = ';'.join(chains)
    pre = os.path.join(OUT, 'premaster.wav')
    run([FF, '-y', *inputs, '-filter_complex', graph,
         '-map', '[premaster]', '-ar', '48000', '-ac', '2', pre,
         '-map', '[vostem]', '-ar', '48000', os.path.join(OUT, 'stem_vo.wav'),
         '-map', '[sfxstem]', '-ar', '48000', '-t', '30', os.path.join(OUT, 'stem_sfx.wav'),
         '-map', '[musstem]', '-ar', '48000', os.path.join(OUT, 'stem_music.wav')])

    # Two-pass loudness normalisation → -14 LUFS integrated, -1 dBTP
    log = run([FF, '-y', '-i', pre, '-af', 'loudnorm=I=-14:TP=-1.0:LRA=9:print_format=json', '-f', 'null', '-'])
    js = json.loads(log[log.rindex('{'):log.rindex('}') + 1])
    ln = (f"loudnorm=I=-14:TP=-1.0:LRA=9:measured_I={js['input_i']}:measured_TP={js['input_tp']}:"
          f"measured_LRA={js['input_lra']}:measured_thresh={js['input_thresh']}:offset={js['target_offset']}:linear=true")
    final = os.path.join(OUT, 'hirehouse_mix.wav')
    run([FF, '-y', '-i', pre, '-af', ln + ',aresample=48000', '-ar', '48000', '-t', '30', final])
    check = run([FF, '-i', final, '-af', 'loudnorm=I=-14:TP=-1:print_format=json', '-f', 'null', '-'])
    cj = json.loads(check[check.rindex('{'):check.rindex('}') + 1])
    print(f"premaster I={js['input_i']} LUFS TP={js['input_tp']} → final I={cj['input_i']} LUFS TP={cj['input_tp']} dBTP")
    print('wrote', final)


if __name__ == '__main__':
    build()

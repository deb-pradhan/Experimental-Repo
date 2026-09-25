"""Superstar launch film — final mix.

Builds three stems on the film timeline (99.0 s @ 48 kHz stereo) and masters them:

  music  ElevenLabs score take A, edited to picture: 4-bar repeat inserted at 49.98 s, 20 ms delay,
         tape-stop on the S03 freeze, silence, then the score's own swell back into the 22.0 s reveal.
  vo     narration pieces from audio/vo_plan.json, loudness-matched line by line.
  sfx    one designed sound per motion cue (audio/cues.json, exported from every scene's CUES), from
         a palette of tuned synth micro-sounds (tools/sfx_synth.py, C# centre) and hand-picked
         ElevenLabs takes (audio/sfx_analysis.json). Transients land on the cue frame.

Then: music ducks under the voice (sidechain), the SFX bus dips a little under the voice, the sum is
normalised to -14 LUFS with a true-peak ceiling of -1 dBTP.

  python3 tools/mix_audio.py            → audio/mix/*.wav (+ video/public/audio/mix.wav)
"""
import json
import os
import re
import subprocess
import sys

import numpy as np
import pyloudnorm as pyln
import soundfile as sf
from scipy.signal import lfilter, resample_poly

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
sys.path.insert(0, HERE)
import sfx_synth as S  # noqa: E402
from audio_analyze import FF  # noqa: E402

SR = 48000
FPS = 60
DUR = 99.0
N = int(DUR * SR)
P = lambda *a: os.path.join(ROOT, *a)  # noqa: E731


# ─────────────────────────────────────────────────────────── io + dsp helpers

def decode_st(path):
    raw = subprocess.run([FF, '-v', 'error', '-i', path, '-ac', '2', '-ar', str(SR), '-f', 'f32le', '-'],
                         capture_output=True, check=True).stdout
    return np.frombuffer(raw, dtype=np.float32).reshape(-1, 2).astype(np.float64)


def db2a(d):
    return 10 ** (d / 20)


def biquad(x, kind, f0, gain_db=0.0, q=0.9):
    """RBJ cookbook peaking / shelving EQ, applied per channel."""
    A = 10 ** (gain_db / 40)
    w = 2 * np.pi * f0 / SR
    cw, sw = np.cos(w), np.sin(w)
    al = sw / (2 * q)
    if kind == 'peak':
        b = [1 + al * A, -2 * cw, 1 - al * A]
        a = [1 + al / A, -2 * cw, 1 - al / A]
    elif kind == 'hshelf':
        sq = 2 * np.sqrt(A) * al
        b = [A * ((A + 1) + (A - 1) * cw + sq), -2 * A * ((A - 1) + (A + 1) * cw), A * ((A + 1) + (A - 1) * cw - sq)]
        a = [(A + 1) - (A - 1) * cw + sq, 2 * ((A - 1) - (A + 1) * cw), (A + 1) - (A - 1) * cw - sq]
    else:
        raise ValueError(kind)
    b, a = np.array(b) / a[0], np.array(a) / a[0]
    return lfilter(b, a, x, axis=0)


def tame(x, harsh_db=-4.0, air_db=-2.0):
    """Ear-friendly polish: dip the 2–5 kHz fatigue band, soften the extreme top."""
    x = biquad(x, 'peak', 3300, harsh_db, 0.8)
    return biquad(x, 'hshelf', 11000, air_db, 0.7)


def to_st(x):
    return np.stack([x, x], 1) if x.ndim == 1 else x


def norm_peak(x, peak_db=-1.0):
    m = np.max(np.abs(x)) + 1e-12
    return x / m * db2a(peak_db)


def pitch(x, ratio):
    """Varispeed (pitch + time) by a small ratio — keeps repeated sounds from machine-gunning."""
    if abs(ratio - 1) < 1e-4:
        return x
    idx = np.arange(0, len(x) - 1, ratio)
    return np.stack([np.interp(idx, np.arange(len(x)), x[:, c]) for c in range(x.shape[1])], 1)


def pan(x, p):
    """Constant-power pan, p in [-1, 1]."""
    th = (p + 1) * np.pi / 4
    y = x.copy()
    y[:, 0] *= np.cos(th) * np.sqrt(2)
    y[:, 1] *= np.sin(th) * np.sqrt(2)
    return y


def fades(x, fi=0.002, fo=0.01):
    x = x.copy()
    a, b = int(fi * SR), int(fo * SR)
    if a:
        x[:a] *= np.linspace(0, 1, a)[:, None]
    if b and len(x) > b:
        x[-b:] *= np.linspace(1, 0, b)[:, None]
    return x


def place(bus, x, t, gain_db=0.0):
    """Mix x into bus so that sample 0 of x lands at time t (s)."""
    i = int(round(t * SR))
    j0 = max(0, -i)
    i = max(0, i)
    n = min(len(x) - j0, len(bus) - i)
    if n > 0:
        bus[i:i + n] += x[j0:j0 + n] * db2a(gain_db)


def env_follow(x, attack, release, win=0.005):
    """Peak envelope with separate attack/release (one-pole), sampled every `win` seconds."""
    hop = int(win * SR)
    m = np.abs(x).max(axis=1) if x.ndim == 2 else np.abs(x)
    frames = m[: len(m) // hop * hop].reshape(-1, hop).max(axis=1)
    out = np.zeros_like(frames)
    ka, kr = np.exp(-win / attack), np.exp(-win / release)
    e = 0.0
    for k, v in enumerate(frames):
        e = ka * e + (1 - ka) * v if v > e else kr * e + (1 - kr) * v
        out[k] = e
    return out, hop


def upsample_curve(curve, hop, n):
    return np.interp(np.arange(n), np.arange(len(curve)) * hop + hop / 2, curve)


# ─────────────────────────────────────────────────────────── the score

MUSIC = dict(src='audio/src/music/music_take_a.mp3', delay=0.02, repeat=(41.98, 49.98), insert_at=49.98)
MUSIC_RIDES = [(0.0, 20.2, 9.0), (58.0, 65.6, 6.0)]  # (from, to, dB)
VO_OVER = 9.0   # dB the voice sits above the score
SFX_BUS_DB = 4.0


def build_music(cues):
    m = decode_st(P(MUSIC['src']))
    a0, a1 = (int(v * SR) for v in MUSIC['repeat'])
    ins = int(MUSIC['insert_at'] * SR)
    xf = int(0.008 * SR)

    def join(parts):
        out = parts[0]
        for p in parts[1:]:
            ramp = np.linspace(0, 1, xf)[:, None]
            out = np.concatenate([out[:-xf], out[-xf:] * (1 - ramp) + p[:xf] * ramp, p[xf:]])
        return out

    # the splice points sit on downbeats; the extra samples feed the 8 ms crossfades
    y = join([m[: ins + xf], m[a0: a1 + xf], m[ins:]])
    y = np.concatenate([np.zeros((int(MUSIC['delay'] * SR), 2)), y])
    y = np.pad(y, ((0, max(0, N - len(y))), (0, 0)))[:N]

    # tape-stop on the S03 freeze → silence → the score's own swell returns into the 22.0 s reveal
    stop = next(c for c in cues if c['kind'] == 'tape_stop')['t']
    back0, back1 = 21.05, 21.96
    i0, dur = int(stop * SR), 0.62
    n = int(dur * SR)
    tt = np.arange(n) / SR
    rate = (1 - tt / dur) ** 1.6  # slows like a platter losing power
    pos = i0 + np.cumsum(rate)
    src = y.copy()
    ts = np.stack([np.interp(pos, np.arange(len(src)), src[:, c]) for c in range(2)], 1)
    ts *= (1 - tt / dur)[:, None] ** 0.5
    ts = biquad(ts, 'hshelf', 3000, -6, 0.7)  # the top dulls as it slows
    y[i0:i0 + n] = ts
    j0, j1 = int(back0 * SR), int(back1 * SR)
    y[i0 + n: j0] = 0
    g = np.linspace(0, 1, j1 - j0) ** 2.2
    y[j0:j1] *= g[:, None]
    return y


# ─────────────────────────────────────────────────────────── the voice

def build_vo():
    plan = json.load(open(P('audio/vo_plan.json')))
    meter = pyln.Meter(SR)
    bus = np.zeros((N, 2))
    cache = {}
    for line in plan['lines']:
        src = cache.setdefault(line['src'], decode_st(P(line['src'])).mean(axis=1))
        pieces = [(src[int(a * SR): int(b * SR)], t) for a, b, t in line['pieces']]
        joined = np.concatenate([p for p, _ in pieces])
        lufs = meter.integrated_loudness(np.stack([joined, joined], 1)) if len(joined) > 0.45 * SR else -20
        g = -17.0 - lufs + line.get('gain_db', 0.0)
        for p, t in pieces:
            x = to_st(p)
            x = biquad(x, 'peak', 180, -1.5, 0.8)       # a touch less boom
            x = biquad(x, 'peak', 6800, -2.0, 1.2)      # gentle de-ess
            x = fades(x, 0.006, 0.03)
            place(bus, x, t, g)
    return bus


# ─────────────────────────────────────────────────────────── the SFX palette

ANALYSIS = {r['file']: r for r in json.load(open(P('audio/sfx_analysis.json')))}
_EL = {}


def el(name, harsh_db=None):
    """ElevenLabs take → mono-compatible stereo, polished, peak -1 dBFS. Returns (x, onset_s, peak_s)."""
    if name not in _EL:
        x = decode_st(P('audio/src/sfx/el', name + '.mp3'))
        x = x - x.mean(axis=0)
        a = ANALYSIS[name + '.mp3']
        hd = harsh_db if harsh_db is not None else (-5.0 if a['harsh'] > 0.25 else -3.0 if a['harsh'] > 0.08 else -1.5)
        x = tame(x, hd, -3.0 if a['cent'] > 8000 else -1.5)
        x = biquad(x, 'peak', 40, -3, 0.7) if a['sub'] > 0.9 else x  # tighten sub-only rumbles
        _EL[name] = (norm_peak(fades(x, 0.0, 0.03)), a['onset'], a['peak_t'])
    return _EL[name]


def syn(x):
    return norm_peak(to_st(x))


def rr(seed):
    return np.random.default_rng(seed)


def amount(note):
    m = re.search(r'\$(\d+)M', note or '')
    return float(m.group(1)) if m else 20.0


def durs(c, default):
    return (c.get('dur') or default * FPS) / FPS


def rising_notes(k, seq=('Cs5', 'Ds5', 'Gs5', 'Cs6', 'Ds6', 'Gs6')):
    return seq[min(k, len(seq) - 1)]


def spark(size, seed):
    """Liquidation spark: a glassy crackle cluster over a small ember thump; grows with $ size."""
    g = rr(seed)
    k = min(1.0, np.log10(1 + size) / 2.0)
    cr = S.crackle(dur=0.06 + 0.16 * k, count=int(4 + 14 * k), seed=int(g.integers(1e6)))
    cr = S.np.stack([S.hp(cr[:, 0], 4200), S.hp(cr[:, 1], 4200)], 1)
    n = int(0.12 * SR)
    tt = np.arange(n) / SR
    thump = np.sin(2 * np.pi * (95 + 25 * (1 - k)) * tt) * np.exp(-tt / 0.035) * (0.25 + 0.75 * k)
    out = np.zeros((max(len(cr), n), 2))
    out[: len(cr)] += norm_peak(cr) * 0.9
    out[:n] += to_st(thump) * 0.7
    return norm_peak(out)


def type_train(dur, seed):
    g = rr(seed)
    out = np.zeros((int((dur + 0.1) * SR), 2))
    t = 0.0
    while t < dur:
        tk = S.tick('lo' if g.random() < 0.7 else 'hi', seed=int(g.integers(1e6)))
        place(out, tk, t, -6 * g.random())
        t += (2 + 2 * g.random()) / FPS
    return norm_peak(out)


def scribble(dur, seed, rise=True):
    """Soft 'pen on glass' bed for line draws: band-limited grain noise, swelling in and out."""
    g = rr(seed)
    n = int(dur * SR)
    x = g.standard_normal(n)
    y = S.bp(x, 5200, 8800, 2) * (0.6 + 0.4 * S.lp(np.abs(g.standard_normal(n)), 40))
    e = np.sin(np.pi * np.clip(np.arange(n) / n, 0, 1)) ** 0.7
    y = S.lp(y * e, 9500)
    return norm_peak(np.stack([y, np.roll(y, 23)], 1))


# kind → builder(cue, k, ctx) returning a list of (x, anchor_seconds_into_x, gain_db, pan)
def B_tick(c, k, ctx):
    note = c.get('note') or ''
    if c['scene'] == 'S01':  # 89 direction flips: highs tick bright, lows tick warm; pan follows the drawing head
        n = int(re.search(r'flip (\d+)', note).group(1))
        up = ' up' in note
        x = S.tick('lo' if up else 'hi', seed=n)
        x = pitch(syn(x), 1 / (1 + 0.18 * n / 89))  # pitch climbs as the counter climbs
        return [(x, 0.0, -25 + 3 * n / 89, -0.55 + 1.1 * n / 89)]
    return [(syn(S.tick('hi', seed=k)), 0.0, -26, rr(k).uniform(-0.3, 0.3))]


def B_crackle(c, k, ctx):
    a = amount(c.get('note'))
    return [(spark(a, k), 0.0, -30 + 7 * min(1, np.log10(1 + a) / 2), rr(k).uniform(-0.35, 0.35))]


def B_crackle_big(c, k, ctx):
    a = amount(c.get('note')) if '$' in (c.get('note') or '') else 80
    x, on, pk = el('impact_soft_a')
    cr, _, crp = el('crackle_a')
    seg = fades(cr[max(0, int((crp - 0.05) * SR)): int((crp + 0.30) * SR)], 0.004, 0.08)
    return [(spark(max(a, 60), 100 + k), 0.0, -22, rr(k).uniform(-0.25, 0.25)),
            (seg, 0.05, -30, 0.0), (x, pk, -21, 0.0)]


def B_blip(c, k, ctx):
    note = c.get('note') or ''
    m = re.search(r'core (\d)', note)
    if m:
        return [(syn(S.blip(rising_notes(int(m.group(1))), dur=0.3, tau=0.06)), 0.0, -26, 0.0)]
    seq = ('Cs6', 'Gs5', 'Ds6', 'Cs6', 'Gs5', 'Cs6')
    return [(syn(S.blip(seq[k % len(seq)])), 0.0, -27, 0.0)]


def B_swipe(c, k, ctx):
    g = rr(k)
    d = 0.34 + 0.12 * g.random()
    x = syn(S.air(dur=d, rise=True, seed=int(g.integers(1e6))))
    x = tame(x, -4, -2)
    return [(x, d * 0.55, -23, g.uniform(-0.15, 0.15))]


def B_draw(c, k, ctx):
    d = durs(c, 0.4)
    if d < 0.15:
        return []
    return [(scribble(d, k), 0.0, -36 if d > 2 else -33, 0.0)]


def B_pop(c, k, ctx):
    seq = ('Gs4', 'Cs5', 'Gs4', 'Cs5')
    x = syn(S.pop(seq[k % 4], seed=k))
    return [(x, 0.0, -22, rr(k).uniform(-0.2, 0.2))]


def B_type(c, k, ctx):
    return [(type_train(durs(c, 0.4), k), 0.0, -28, 0.0)]


def B_card_in(c, k, ctx):
    x, on, pk = el('card_slide_a')
    return [(x, on, -21, 0.0), (syn(S.pop('Gs4', seed=k)), -0.30, -24, 0.0)]


def B_card_out(c, k, ctx):
    x, on, pk = el('whoosh_short_b')
    return [(x, on, -22, 0.0)]


def B_slide(c, k, ctx):
    x, on, pk = el('card_slide_a')
    return [(x, on, -25, 0.0)]


def B_whoosh(c, k, ctx):
    x, on, pk = el('whoosh_short_a' if k % 2 == 0 else 'whoosh_short_b')
    y = syn(S.air(dur=0.5, rise=True, seed=40 + k))
    return [(x, pk - 0.10, -15, 0.0), (tame(y), 0.28, -27, 0.0)]


def B_impact_soft(c, k, ctx):
    note = c.get('note') or ''
    x, on, pk = el('number_slam_a' if k % 2 == 0 else 'impact_soft_a')
    tone = syn(S.blip('Cs5', dur=0.5, tau=0.14))
    return [(x, pk, -13, 0.0), (tone, 0.0, -27, 0.0)]


def B_impact_big(c, k, ctx):
    x, on, pk = el('impact_big_b')
    sd = syn(S.sub_drop(dur=1.4))
    return [(x, pk, -5, 0.0), (sd, 0.015, -12, 0.0)]


def B_lock(c, k, ctx):
    note = c.get('note') or ''
    x, on, pk = el('ui_lock_a')
    if 'key sound' in note:  # NO TRADE — the signature sound of the film, in near silence
        sh, _, _ = el('shimmer_b')
        return [(syn(S.lock_chord()), 0.0, -11, 0.0), (x, pk, -19, 0.0), (sh, 0.0, -30, 0.0)]
    tone = ('Gs5', 'Cs6', 'Ds6')[k % 3]
    return [(x, pk, -23, 0.0), (syn(S.blip(tone, dur=0.35, tau=0.08)), 0.0, -28, 0.0)]


def B_ping(c, k, ctx):
    note = c.get('note') or ''
    m = re.search(r'review (\d\d):', note)
    if m:  # S05: the six daily reviews climb the C# pentatonic toward "one decision"
        return [(syn(S.ping(rising_notes(int(m.group(1)) // 4))), 0.0, -20, 0.0)]
    return [(syn(S.ping(('Gs5', 'Cs6')[k % 2])), 0.0, -23, 0.0)]


def B_click(c, k, ctx):
    note = c.get('note') or ''
    x, on, pk = el('ui_click_a')
    # direction has a pitch: LONG leans up (C#6), SHORT leans down (G#5)
    tone = 'Cs6' if 'LONG' in note else 'Gs5' if ('SHORT' in note) else 'Cs6'
    return [(x, on, -17, 0.0), (syn(S.blip(tone, dur=0.25, tau=0.05)), 0.0, -27, 0.0)]


def B_shimmer(c, k, ctx):
    x, on, pk = el('shimmer_b')
    return [(x, on, -24, 0.0)]


def B_ratchet(c, k, ctx):
    x = syn(S.ratchet(seed=k % 3))
    return [(pitch(x, 1 / (1 + 0.03 * (k % 7))), 0.0, -19, 0.0)]


def B_scan(c, k, ctx):
    d = durs(c, 0.45)
    x = tame(syn(S.air(dur=max(0.25, d), rise=True, seed=70 + k)), -5, -2)
    return [(x, 0.0, -30, 0.0)]


def B_tick_train(c, k, ctx):
    d = durs(c, 1.0)
    return [(syn(S.tick_train(d, seed=k)), 0.0, -24, 0.0)]


def B_riser(c, k, ctx):
    x, on, pk = el('riser_a', harsh_db=-7)
    d = durs(c, 4)
    x = x[: int(min(len(x) / SR, d + 0.3) * SR)]
    x = biquad(x, 'hshelf', 5000, -6, 0.7)
    x = x * np.linspace(0.2, 1, len(x))[:, None] ** 1.5
    return [(fades(x, 0.4, 0.5), 0.0, -24, 0.0)]


def B_tape_stop(c, k, ctx):
    x, on, pk = el('freeze_stop_a')
    return [(x, on, -16, 0.0)]


def B_reverse_swell(c, k, ctx):
    x, on, pk = el('reverse_swell_a', harsh_db=-5)
    return [(x, pk, -16, 0.0)]


def B_heartbeat(c, k, ctx):
    return [(syn(S.heartbeat()), 0.0, -13, 0.0)]


def B_iris_open(c, k, ctx):
    x, on, pk = el('iris_open_a')
    return [(x, on, -19, 0.0)]


def B_energy_form(c, k, ctx):
    x, on, pk = el('energy_form_b')
    return [(x, on, -21, 0.0)]


def B_star_lock(c, k, ctx):
    x, on, pk = el('star_lock_a')
    return [(x, pk, -19, 0.0), (syn(S.lock_chord()), 0.0, -24, 0.0)]


def B_clock_sweep(c, k, ctx):
    # the review clock ticks on every beat of the score while the hand sweeps
    d = durs(c, 5)
    out = []
    t0 = c['t']
    first = np.ceil((t0 - MUSIC['delay']) * 2) / 2 + MUSIC['delay']
    x, on, pk = el('clock_tick_b')
    b = 0
    t = first
    while t < t0 + d:
        out.append((x, pk - (t - t0), -30 if b % 2 else -27, (-0.12, 0.12)[b % 2]))
        t += 0.5
        b += 1
    return out


def B_cut_hush(c, k, ctx):
    x = tame(syn(S.air(dur=0.7, rise=False, seed=91)), -5, -3)
    return [(x, 0.05, -32, 0.0)]


def B_grain_in(c, k, ctx):
    d = durs(c, 1.5)
    return [(syn(S.grains(d, count=int(70 * d), seed=11)), 0.0, -28, 0.0)]


def B_dotwave(c, k, ctx):
    d = durs(c, 2.4)
    # cascade follows the counter's cubic ease: dense at first, thinning out
    dens = lambda u: 1 - (1 - u) ** (1 / 3)  # noqa: E731
    return [(syn(S.grains(d, density_fn=dens, count=240, seed=13)), 0.0, -24, 0.0)]


def B_whoosh_reverse(c, k, ctx):
    land = ctx['next_impact']
    x, on, pk = el('reverse_swell_a', harsh_db=-5)
    w, won, wpk = el('whoosh_long_a')
    lead = land - c['t']
    return [(x, pk - lead, -17, 0.0), (w, wpk - lead * 0.55, -20, 0.0)]


def B_logo_sting(c, k, ctx):
    x, on, pk = el('logo_sting_b')
    sh, _, _ = el('shimmer_a')
    return [(x, on + 2 / FPS, -11, 0.0), (sh, 2 / FPS, -26, 0.0)]


BUILDERS = {k[2:]: v for k, v in globals().items() if k.startswith('B_')}
SILENT = {'none'}


def build_sfx(cues, log):
    bus = np.zeros((N, 2))
    count = {}
    last = {}
    for i, c in enumerate(cues):
        kind = c['kind']
        if kind in SILENT:
            continue
        fn = BUILDERS.get(kind)
        if fn is None:
            log.append(f"!! no builder for kind '{kind}' ({c['scene']} {c['t']}s) — using blip")
            fn = B_blip
        k = count[kind] = count.get(kind, -1) + 1
        # anti-machine-gun: same kind within 2 frames → merge (skip) unless it is a counted flip
        if kind in last and c['film'] - last[kind] < 2 and not (kind == 'tick' and c['scene'] == 'S01'):
            continue
        last[kind] = c['film']
        ctx = {}
        if kind == 'whoosh_reverse':
            ctx['next_impact'] = next((d['t'] for d in cues[i:] if d['kind'] == 'impact_big' and d['scene'] == c['scene']), c['t'] + 1)
        for x, anchor, g, p in fn(c, k, ctx):
            y = pan(x, p) if p else x
            place(bus, y, c['t'] - anchor, g)
        log.append(f"{c['t']:7.3f}  {c['scene']}  {kind:14s} {(c.get('note') or '')[:60]}")
    return bus


# ─────────────────────────────────────────────────────────── mixdown + master

def true_peak_limit(x, ceiling_db=-1.0, look=0.004, release=0.08):
    over = resample_poly(x, 4, 1, axis=0)
    pk = np.abs(over).max(axis=1).reshape(-1, 4).max(axis=1)[: len(x)]
    need = np.minimum(1.0, db2a(ceiling_db) / np.maximum(pk, 1e-9))
    L = int(look * SR)
    # look-ahead: a gain dip starts L samples before the peak (sliding minimum)
    from scipy.ndimage import minimum_filter1d
    g = minimum_filter1d(need, size=2 * L + 1, origin=0)
    kr = np.exp(-1 / (release * SR))
    out = np.empty_like(g)
    e = 1.0
    for i, v in enumerate(g):
        e = v if v < e else kr * e + (1 - kr) * v
        out[i] = e
    # smooth the attack edge
    out = np.convolve(out, np.ones(L) / L, mode='same')
    out = np.minimum(out, g)
    return x * out[:, None]


def main():
    cues = json.load(open(P('audio/cues.json')))
    log = []
    meter = pyln.Meter(SR)

    music = build_music(cues)
    vo = build_vo()
    sfx = build_sfx(cues, log)

    # stems to their nominal levels
    music *= db2a(-20.0 - meter.integrated_loudness(music))
    # section rides: the sparse Act I bed and the 58 s breakdown come up so they read under the voice
    ride = np.zeros(N)
    for a, b, d in MUSIC_RIDES:
        i, j = int(a * SR), int(b * SR)
        ride[i:j] = d
    ride = np.convolve(ride, np.ones(int(0.25 * SR)) / int(0.25 * SR), mode='same')
    music *= db2a(ride)[:, None]
    # dialogue-aware sidechain: under the voice the music sits at least VO_OVER dB below it
    # (never more than 12 dB of ducking), SFX dip 2 dB; ducking breathes back between phrases
    win = 0.1
    hop = int(win * SR)
    rms = lambda x: 10 * np.log10(np.mean((x[: len(x) // hop * hop] ** 2).reshape(-1, hop * 2), axis=1) + 1e-12)  # noqa: E731
    v_db, m_db = rms(vo), rms(music)
    v_sm = np.maximum.accumulate(np.lib.stride_tricks.sliding_window_view(np.pad(v_db, (2, 2), constant_values=-120), 5), axis=1)[:, -1]
    act = np.clip((v_sm + 50) / 14, 0, 1)
    need = np.clip(v_sm - VO_OVER - m_db, -12, 0) * act - 3.0 * act
    g_db = np.zeros_like(need)
    e = 0.0
    ka, kr = np.exp(-win / 0.04), np.exp(-win / 0.55)
    for k, v in enumerate(need):
        e = ka * e + (1 - ka) * v if v < e else kr * e + (1 - kr) * v
        g_db[k] = e
    g_db = np.concatenate([g_db[1:], g_db[-1:]])  # 100 ms look-ahead
    duck_m = db2a(upsample_curve(g_db, hop, N))[:, None]
    duck_s = db2a(upsample_curve(-2.0 * act, hop, N))[:, None]
    sfx *= db2a(SFX_BUS_DB)
    # end: the score rings out under the lockup; everything fades to black by 99.0 s
    tail = np.ones(N)
    f0, f1 = int(96.5 * SR), N
    tail[f0:f1] = np.linspace(1, 0, f1 - f0) ** 2
    mix = (music * duck_m + vo + sfx * duck_s) * tail[:, None]

    # master: loudness to -14 LUFS, true peak ≤ -1 dBTP
    for _ in range(3):
        l = meter.integrated_loudness(mix)
        mix *= db2a(-14.0 - l)
        mix = true_peak_limit(mix, -1.0)
    lufs = meter.integrated_loudness(mix)
    over = resample_poly(mix, 4, 1, axis=0)
    tp = 20 * np.log10(np.abs(over).max())

    out = P('audio/mix')
    os.makedirs(out, exist_ok=True)
    gain = db2a(-14.0 - lufs)
    for name, x in [('mix', mix), ('stem_music', music * duck_m * tail[:, None]), ('stem_vo', vo * tail[:, None]), ('stem_sfx', sfx * duck_s * tail[:, None])]:
        sf.write(os.path.join(out, f'superstar_{name}.wav'), (x if name == 'mix' else x * 1.0).astype(np.float32), SR, subtype='PCM_24')
    pub = P('video/public/audio')
    os.makedirs(pub, exist_ok=True)
    sf.write(os.path.join(pub, 'mix.wav'), mix.astype(np.float32), SR, subtype='PCM_24')
    stem_l = {k: meter.integrated_loudness(v) for k, v in [('music', music * duck_m), ('vo', vo), ('sfx', sfx * duck_s)]}
    open(os.path.join(out, 'mix_log.txt'), 'w').write('\n'.join(log))
    print(f"mix: {lufs:.2f} LUFS, true peak {tp:.2f} dBTP · stems (pre-master) " + ', '.join(f'{k} {v:.1f}' for k, v in stem_l.items()))
    print(f"{len(log)} lines logged; warnings:", [l for l in log if l.startswith('!!')])
    _ = gain


if __name__ == '__main__':
    main()

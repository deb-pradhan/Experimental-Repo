"""Synthesised micro-SFX for the Superstar film — sample-exact, tuned to the score (C# centre).

Tonal sounds only use C#, G#, D# (root / fifth / second) so they sit consonantly on the score
whichever way its harmony leans. Everything is soft-attack, exponentially decaying, gently low-passed,
slightly detuned L/R for width, peak-limited, DC-free.

Import as a library (mix_audio.py) or run to write reference WAVs to audio/src/sfx/synth/.
"""
import os
import numpy as np
from scipy.signal import butter, sosfilt

SR = 48000
NOTE = {'Cs2': 69.30, 'Cs3': 138.59, 'Cs4': 277.18, 'Gs4': 415.30, 'Cs5': 554.37, 'Ds5': 622.25, 'Gs5': 830.61, 'Cs6': 1108.73, 'Ds6': 1244.51, 'Gs6': 1661.22}


def t(dur):
    return np.arange(int(dur * SR)) / SR


def lp(x, fc, order=2):
    return sosfilt(butter(order, fc, 'low', fs=SR, output='sos'), x)


def hp(x, fc, order=2):
    return sosfilt(butter(order, fc, 'high', fs=SR, output='sos'), x)


def bp(x, lo, hi, order=2):
    return sosfilt(butter(order, [lo, hi], 'band', fs=SR, output='sos'), x)


def env(n, attack=0.002, tau=0.08, hold=0.0):
    tt = np.arange(n) / SR
    a = np.clip(tt / max(attack, 1e-4), 0, 1)
    d = np.where(tt < attack + hold, 1.0, np.exp(-(tt - attack - hold) / tau))
    return a * d


def fade_out(x, ms=5):
    n = int(ms / 1000 * SR)
    if n and len(x) > n:
        x[-n:] *= np.linspace(1, 0, n)[:, None] if x.ndim == 2 else np.linspace(1, 0, n)
    return x


def stereo(mono, width_cents=0.0, fn=None):
    return np.stack([mono, mono], 1)


def finish(x, peak_db=-3.0):
    x = x - np.mean(x, axis=0)
    m = np.max(np.abs(x)) + 1e-9
    x = x / m * (10 ** (peak_db / 20))
    return fade_out(x, 5)


def _tone(freq, dur, tau, partials=((1, 1.0), (2, 0.22), (3, 0.06)), drop=0.0, detune=0.0):
    tt = t(dur)
    f = freq * (1 - drop * (1 - np.exp(-tt / 0.05)))
    ph = 2 * np.pi * np.cumsum(f * (1 + detune)) / SR
    y = sum(a * np.sin(k * ph) for k, a in partials)
    return y * env(len(tt), 0.0015, tau)


def blip(note='Cs5', dur=0.28, tau=0.07, gain_db=0):
    f = NOTE[note]
    l = _tone(f, dur, tau, detune=-0.0017)
    r = _tone(f, dur, tau, detune=+0.0017)
    x = np.stack([lp(l, 9000), lp(r, 9000)], 1)
    return finish(x, -3 + gain_db)


def tick(kind='hi', gain_db=0, seed=0):
    rng = np.random.default_rng(seed)
    n = int(0.06 * SR)
    noise = rng.standard_normal(n) * env(n, 0.0004, 0.004)
    lo, hi, body = (4200, 9000, 5600) if kind == 'hi' else (900, 2000, 1250)  # glassy highs / warm lows, clear of 2–5 kHz
    y = bp(noise, lo, hi) * 0.8 + np.sin(2 * np.pi * body * np.arange(n) / SR) * env(n, 0.0005, 0.012) * 0.35
    y = lp(y, 9500)
    x = np.stack([y, np.roll(y, 6)], 1)
    return finish(x, -3 + gain_db)


def pop(note='Gs4', gain_db=0, seed=0):
    f = NOTE[note]
    tt = t(0.16)
    fr = f * (1.12 - 0.12 * (1 - np.exp(-tt / 0.02)))  # quick downward bend
    y = np.sin(2 * np.pi * np.cumsum(fr) / SR) * env(len(tt), 0.001, 0.045)
    rng = np.random.default_rng(seed)
    click = bp(rng.standard_normal(len(tt)), 2000, 5000) * env(len(tt), 0.0003, 0.002) * 0.25
    y = lp(y + click, 8000)
    return finish(np.stack([y, y], 1), -3 + gain_db)


def ping(note='Cs6', gain_db=0):
    f = NOTE[note]
    tt = t(0.7)
    y = (np.sin(2 * np.pi * f * tt) * np.exp(-tt / 0.22) + 0.35 * np.sin(2 * np.pi * f * 2.0 * tt) * np.exp(-tt / 0.09)
         + 0.12 * np.sin(2 * np.pi * f * 3.01 * tt) * np.exp(-tt / 0.05))
    y *= np.clip(tt / 0.002, 0, 1)
    l, r = lp(y, 9000), lp(np.roll(y, 12), 9000)
    return finish(np.stack([l, r], 1), -3 + gain_db)


def lock_chord(gain_db=0):
    """Sus 'confirm': C#5 · G#5 · C#6, 45 ms apart, over a soft latch click."""
    out = np.zeros((int(0.9 * SR), 2))
    for k, n in enumerate(['Cs5', 'Gs5', 'Cs6']):
        b = blip(n, dur=0.7, tau=0.16) * (0.9 - 0.12 * k)
        o = int(k * 0.045 * SR)
        out[o:o + len(b)] += b[: len(out) - o]
    c = tick('lo', seed=4) * 0.8
    out[: len(c)] += c
    return finish(out, -2 + gain_db)


def ratchet(seed=0, gain_db=0):
    """Mechanical click-clack (trailing stop steps up)."""
    rng = np.random.default_rng(seed)
    out = np.zeros((int(0.14 * SR), 2))
    for k, (lo, hi, body, g) in enumerate([(1100, 2600, 1900, 1.0), (700, 1800, 1300, 0.75)]):  # warm wooden-mechanical
        n = int(0.05 * SR)
        y = bp(rng.standard_normal(n), lo, hi) * env(n, 0.0003, 0.003) + np.sin(2 * np.pi * body * np.arange(n) / SR) * env(n, 0.0004, 0.008) * 0.4
        o = int(k * 0.034 * SR)
        out[o:o + n] += np.stack([y, np.roll(y, 4)], 1) * g
    out = np.stack([lp(out[:, 0], 9000), lp(out[:, 1], 9000)], 1)
    return finish(out, -3 + gain_db)


def sub_drop(dur=0.9, gain_db=0):
    tt = t(dur)
    f = NOTE['Cs2'] * (0.5 + 0.5 * np.exp(-tt / 0.25))
    y = np.tanh(1.6 * np.sin(2 * np.pi * np.cumsum(f) / SR)) * env(len(tt), 0.004, 0.35)
    return finish(np.stack([y, y], 1), -2 + gain_db)


def heartbeat(gain_db=0):
    out = np.zeros(int(0.7 * SR))
    for k, (o, a) in enumerate([(0.0, 1.0), (0.19, 0.7)]):
        tt = t(0.3)
        f = 58 * (0.8 + 0.2 * np.exp(-tt / 0.03))
        y = np.sin(2 * np.pi * np.cumsum(f) / SR) * env(len(tt), 0.003, 0.07) * a
        i = int(o * SR)
        out[i:i + len(y)] += y
    out = lp(out, 400)
    return finish(np.stack([out, out], 1), -3 + gain_db)


def tick_train(dur, n=None, ease='out', gain_db=0, rise=True, seed=1):
    """Count-up tick train: ticks bunch early and spread late (easeOutCubic), pitch rising gently."""
    n = n or max(8, int(dur * 18))
    out = np.zeros((int((dur + 0.1) * SR), 2))
    rng = np.random.default_rng(seed)
    for k in range(n):
        u = k / (n - 1)
        # easeOutCubic inverse → time where value reaches u
        tt = (1 - (1 - u) ** (1 / 3)) * dur if ease == 'out' else u * dur
        tk = tick('hi', seed=int(rng.integers(0, 1e6)))
        if rise:  # resample slightly for a rising pitch
            ratio = 1 + 0.25 * u
            idx = np.clip((np.arange(int(len(tk) / ratio)) * ratio).astype(int), 0, len(tk) - 1)
            tk = tk[idx]
        g = 0.55 + 0.45 * (1 - u) if ease == 'out' else 1
        i = int(tt * SR)
        out[i:i + len(tk)] += tk[: len(out) - i] * g
    return finish(out, -3 + gain_db)


def grains(dur, density_fn=None, count=260, gain_db=0, seed=7):
    """Soft cascading grains (e.g. 1,350 dots going quiet): tiny tuned ticks, randomised."""
    rng = np.random.default_rng(seed)
    out = np.zeros((int((dur + 0.2) * SR), 2))
    notes = ['Gs5', 'Cs6', 'Ds6', 'Gs6']
    for k in range(count):
        u = rng.random() if density_fn is None else density_fn(rng.random())
        i = int(u * dur * SR)
        f = NOTE[notes[int(rng.integers(0, len(notes)))]] * (1 + rng.normal(0, 0.004))
        n = int(0.05 * SR)
        y = np.sin(2 * np.pi * f * np.arange(n) / SR) * env(n, 0.0008, 0.012)
        pan = rng.uniform(-0.8, 0.8)
        amp = rng.uniform(0.3, 1.0)
        out[i:i + n, 0] += y[: len(out) - i] * amp * (1 - pan) / 2
        out[i:i + n, 1] += y[: len(out) - i] * amp * (1 + pan) / 2
    out = np.stack([lp(out[:, 0], 9000), lp(out[:, 1], 9000)], 1)
    return finish(out, -3 + gain_db)


def crackle(dur=0.5, count=16, gain_db=0, seed=3):
    """Dry little spark crackles (liquidation bursts)."""
    rng = np.random.default_rng(seed)
    out = np.zeros((int((dur + 0.05) * SR), 2))
    for k in range(count):
        i = int((rng.random() ** 1.8) * dur * SR)
        n = int(rng.uniform(0.002, 0.008) * SR)
        y = hp(rng.standard_normal(n), 1800) * env(n, 0.0002, 0.0015)
        pan = rng.uniform(-0.7, 0.7)
        amp = rng.uniform(0.3, 1.0)
        out[i:i + n, 0] += y * amp * (1 - pan) / 2
        out[i:i + n, 1] += y * amp * (1 + pan) / 2
    out = np.stack([lp(out[:, 0], 8500), lp(out[:, 1], 8500)], 1)
    return finish(out, -3 + gain_db)


def air(dur=0.8, rise=True, gain_db=0, seed=5):
    """Soft filtered-noise swipe (small moves), sweeping bandpass."""
    rng = np.random.default_rng(seed)
    n = int(dur * SR)
    x = rng.standard_normal(n)
    out = np.zeros(n)
    seg = 480
    for s in range(0, n, seg):
        u = s / n
        fc = 420 + 2000 * (u if rise else 1 - u)
        out[s:s + seg] = bp(x[s:s + seg], fc * 0.7, fc * 1.3, 1)
    e = np.sin(np.pi * np.clip(np.arange(n) / n, 0, 1)) ** 1.5
    y = lp(out * e, 5200)
    return finish(np.stack([y, np.roll(y, 40)], 1), -3 + gain_db)


if __name__ == '__main__':
    import soundfile as sf
    d = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'audio', 'src', 'sfx', 'synth')
    os.makedirs(d, exist_ok=True)
    bank = {
        **{f'blip_{n}': blip(n) for n in ['Cs5', 'Ds5', 'Gs5', 'Cs6']},
        'tick_hi': tick('hi'), 'tick_lo': tick('lo'),
        'pop_Gs4': pop('Gs4'), 'pop_Cs5': pop('Cs5'),
        'ping_Cs6': ping('Cs6'), 'ping_Gs5': ping('Gs5'),
        'lock_chord_Cs': lock_chord(),
        'ratchet_a': ratchet(0), 'ratchet_b': ratchet(1), 'ratchet_c': ratchet(2),
        'sub_drop_Cs': sub_drop(), 'heartbeat': heartbeat(),
        'countup_2s': tick_train(2.0), 'countup_1s3': tick_train(1.3),
        'dotwave_2s5': grains(2.5, count=300), 'crackle': crackle(), 'air_swipe': air(),
    }
    for k, v in bank.items():
        sf.write(os.path.join(d, f'{k}.wav'), v.astype(np.float32), SR, subtype='PCM_24')
    print(len(bank), 'synth SFX →', d)

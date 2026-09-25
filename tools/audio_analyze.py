"""Audio analysis for the HireHouse launch film.

- decode(): any file -> mono float32 @ 48 kHz via ffmpeg
- segments(): speech/sound segments split at silences (for VO line splitting)
- tempo(): onset-autocorrelation tempo estimate + first strong downbeat
- rms_curve(): loudness in dBFS per window
"""
import subprocess, sys, json
import numpy as np
import imageio_ffmpeg

FF = imageio_ffmpeg.get_ffmpeg_exe()
SR = 48000


def decode(path, sr=SR):
    raw = subprocess.run([FF, '-v', 'error', '-i', path, '-ac', '1', '-ar', str(sr), '-f', 'f32le', '-'],
                         capture_output=True, check=True).stdout
    return np.frombuffer(raw, dtype=np.float32)


def db(x):
    return 20 * np.log10(np.maximum(x, 1e-9))


def envelope(x, win=0.01, sr=SR):
    n = int(win * sr)
    m = len(x) // n
    return np.sqrt((x[: m * n].reshape(m, n) ** 2).mean(axis=1))


def segments(x, thresh_db=-40, min_gap=0.22, min_len=0.12, win=0.01):
    env = db(envelope(x, win))
    on = env > thresh_db
    segs, start = [], None
    for i, v in enumerate(on):
        t = i * win
        if v and start is None:
            start = t
        if not v and start is not None:
            segs.append([start, t]); start = None
    if start is not None:
        segs.append([start, len(on) * win])
    merged = []
    for s in segs:
        if merged and s[0] - merged[-1][1] < min_gap:
            merged[-1][1] = s[1]
        else:
            merged.append(s)
    return [(round(a, 3), round(b, 3)) for a, b in merged if b - a >= min_len]


def onset_env(x, sr=SR, hop=480):
    n = 1024
    frames = np.lib.stride_tricks.sliding_window_view(x, n)[::hop]
    spec = np.abs(np.fft.rfft(frames * np.hanning(n), axis=1))
    spec = np.log1p(spec)
    flux = np.maximum(np.diff(spec, axis=0), 0).sum(axis=1)
    flux = flux - np.convolve(flux, np.ones(16) / 16, mode='same')
    return np.maximum(flux, 0), sr / hop


def tempo(x, sr=SR):
    oe, fps = onset_env(x, sr)
    ac = np.correlate(oe, oe, mode='full')[len(oe) - 1:]
    lo, hi = int(fps * 60 / 180), int(fps * 60 / 70)
    lag = lo + int(np.argmax(ac[lo:hi]))
    bpm = 60 * fps / lag
    # beat phase: which offset within one beat period has max onset energy
    period = lag
    phase_scores = [oe[p::period].sum() for p in range(period)]
    phase = int(np.argmax(phase_scores))
    return round(bpm, 2), round(phase / fps, 3), oe, fps


def rms_curve(x, step=1.0, sr=SR):
    n = int(step * sr)
    m = len(x) // n
    return [round(float(v), 1) for v in db(np.sqrt((x[: m * n].reshape(m, n) ** 2).mean(axis=1)))]


if __name__ == '__main__':
    mode, *paths = sys.argv[1:]
    for p in paths:
        x = decode(p)
        dur = len(x) / SR
        peak = float(db(np.abs(x).max()))
        if mode == 'vo':
            print(p, f'dur={dur:.2f}s peak={peak:.1f}dBFS')
            for a, b in segments(x):
                print(f'   {a:6.2f} -> {b:6.2f}  ({b - a:.2f}s)')
        elif mode == 'music':
            bpm, phase, oe, fps = tempo(x)
            print(p, f'dur={dur:.2f}s peak={peak:.1f} tempo≈{bpm} beat-phase={phase}s')
            print('   rms/s:', rms_curve(x))
        elif mode == 'sfx':
            env = db(envelope(x, 0.005))
            onset = next((i * 0.005 for i, v in enumerate(env) if v > peak - 30), 0)
            print(f'{p:40s} dur={dur:5.2f}s peak={peak:6.1f}dBFS onset={onset:.3f}s')

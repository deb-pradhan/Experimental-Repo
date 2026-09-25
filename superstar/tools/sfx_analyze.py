"""Measure every SFX take so the crispest, least fatiguing one is picked per cue.

onset  = first sample within 30 dB of peak (s)   -> how far to pre-roll so the transient lands on the frame
peak_t = time of the loudest 10 ms window (s)
cent   = spectral centroid (Hz)                    -> brightness
harsh  = energy share in 2-5 kHz                   -> ear fatigue (lower is kinder)
sub    = energy share below 80 Hz
tail   = time from peak until -40 dB (s)
"""
import glob, json, os, sys
import numpy as np
sys.path.insert(0, os.path.dirname(__file__))
from audio_analyze import decode, envelope, db, SR

def measure(path):
    x = decode(path)
    x = x - x.mean()
    env = envelope(x, 0.005)
    e_db = db(env)
    pk = e_db.max()
    onset = int(np.argmax(e_db > pk - 30)) * 0.005
    peak_t = int(np.argmax(e_db)) * 0.005
    after = np.where(e_db[int(peak_t / 0.005):] < pk - 40)[0]
    tail = (after[0] * 0.005) if len(after) else len(x) / SR - peak_t
    S = np.abs(np.fft.rfft(x * np.hanning(len(x)))) ** 2
    fr = np.fft.rfftfreq(len(x), 1 / SR)
    tot = S.sum() + 1e-12
    return dict(file=os.path.basename(path), dur=round(len(x) / SR, 2), onset=round(onset, 3), peak_t=round(peak_t, 3),
                tail=round(tail, 2), cent=int((fr * S).sum() / tot), harsh=round(S[(fr > 2000) & (fr < 5000)].sum() / tot, 3),
                sub=round(S[fr < 80].sum() / tot, 3), peak_db=round(20 * np.log10(np.abs(x).max() + 1e-9), 1))

if __name__ == '__main__':
    rows = [{k: (float(v) if isinstance(v, (np.floating,)) else v) for k, v in measure(p).items()} for p in sorted(glob.glob(sys.argv[1] if len(sys.argv) > 1 else 'audio/src/sfx/*/*'))]
    for r in rows:
        print(f"{r['file']:24s} dur {r['dur']:5.2f} on {r['onset']:5.3f} pk {r['peak_t']:5.3f} tail {r['tail']:5.2f} cent {r['cent']:5d} harsh {r['harsh']:.3f} sub {r['sub']:.3f} {r['peak_db']:6.1f}dB")
    json.dump(rows, open('audio/sfx_analysis.json', 'w'), indent=1)

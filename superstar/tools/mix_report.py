"""Visual QA of the mix: momentary loudness per stem (400 ms), limiter activity, spectrogram, cue marks."""
import json, os, sys
import numpy as np, soundfile as sf
import matplotlib; matplotlib.use('Agg')
import matplotlib.pyplot as plt
import pyloudnorm as pyln

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
M = lambda n: sf.read(os.path.join(ROOT, 'audio/mix', f'superstar_{n}.wav'))[0]
SR = 48000
mix, mu, vo, sx = M('mix'), M('stem_music'), M('stem_vo'), M('stem_sfx')
# stems are pre-master; bring them to the master's gain for comparison
meter = pyln.Meter(SR)
g = 10 ** ((meter.integrated_loudness(mix) - meter.integrated_loudness(mu + vo + sx)) / 20)
def mom(x, win=0.4, hop=0.1):
    # K-weighting approximated by pyloudnorm's filters on each window
    out = []
    n, h = int(win * SR), int(hop * SR)
    for i in range(0, len(x) - n, h):
        seg = x[i:i + n]
        p = np.mean(np.sum(seg ** 2, axis=1) / 2)
        out.append(10 * np.log10(p + 1e-12))
    return np.array(out)
t = np.arange(len(mom(mix))) * 0.1 + 0.2
cues = json.load(open(os.path.join(ROOT, 'audio/cues.json')))
t0, t1 = (float(a) for a in (sys.argv[1:3] if len(sys.argv) > 2 else (0, 99)))
fig, ax = plt.subplots(3, 1, figsize=(22, 12), sharex=True, gridspec_kw={'height_ratios': [2.2, 1, 2]})
for x, c, l in [(mix, '#131313', 'mix'), (mu * g, '#474DEF', 'music'), (vo * g, '#00A0A0', 'vo'), (sx * g, '#E06000', 'sfx')]:
    ax[0].plot(t, mom(x), color=c, lw=1.2 if l != 'mix' else 0.8, label=l, alpha=0.9)
ax[0].set_ylim(-60, 0); ax[0].legend(loc='upper right'); ax[0].grid(alpha=.3); ax[0].set_ylabel('RMS dBFS (400ms)')
for c in cues:
    if t0 <= c['t'] <= t1 and c['kind'] not in ('tick', 'crackle', 'draw', 'type'):
        ax[0].axvline(c['t'], color='#aaa', lw=0.5)
        ax[0].text(c['t'], -58, c['kind'], rotation=90, fontsize=6, va='bottom')
diff = mom(vo * g) - mom(mu * g)
ax[1].plot(t, np.where(mom(vo * g) > -40, diff, np.nan), color='#00A0A0'); ax[1].axhline(6, color='r', lw=.5); ax[1].set_ylabel('VO − music dB'); ax[1].grid(alpha=.3)
ax[2].specgram(mix.mean(axis=1), NFFT=2048, Fs=SR, noverlap=1024, cmap='magma', vmin=-130); ax[2].set_ylim(0, 16000); ax[2].set_ylabel('Hz')
ax[2].set_xlim(t0, t1)
plt.tight_layout(); out = os.path.join(ROOT, 'audio/mix', f'report_{int(t0)}_{int(t1)}.png'); plt.savefig(out, dpi=70); print(out)

# per-cue audibility: SFX peak in the 150 ms after the cue vs the music+voice RMS in the same window
rows = []
for c in cues:
    i = int(c['t'] * SR); j = i + int(0.15 * SR)
    if j > len(sx) or c['kind'] in ('none', 'draw', 'riser', 'clock_sweep'):
        continue
    sp = 20 * np.log10(np.abs(sx[i:j] * g).max() + 1e-9)
    bg = 10 * np.log10(np.mean(((mu + vo)[i:j] * g) ** 2) + 1e-12)
    rows.append((sp - bg, c['t'], c['kind'], sp, bg))
rows.sort()
print('lowest SFX-over-bed (dB): peak vs bed RMS')
for r in rows[:25]:
    print(f"  {r[0]:6.1f}  t={r[1]:6.2f} {r[2]:13s} sfx pk {r[3]:6.1f}  bed {r[4]:6.1f}")
print('median', np.median([r[0] for r in rows]))

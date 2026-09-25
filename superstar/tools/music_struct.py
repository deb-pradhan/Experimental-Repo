"""Structure view of a music file: 1 s RMS bars + low/mid/high bands, tempo, key chroma."""
import sys; sys.path.insert(0, 'tools')
from audio_analyze import *
p = sys.argv[1]; step = float(sys.argv[2]) if len(sys.argv) > 2 else 1.0
x = decode(p)
bpm, phase, oe, fps = tempo(x)
print(p, f'dur={len(x)/SR:.2f}s peak={float(db(np.abs(x).max())):.1f} tempo={bpm} phase={phase}')
n = int(step * SR); m = len(x) // n
fr = x[:m*n].reshape(m, n)
rms = db(np.sqrt((fr**2).mean(1)))
spec = np.abs(np.fft.rfft(fr * np.hanning(n), axis=1)); freqs = np.fft.rfftfreq(n, 1/SR)
band = lambda a, b: db(np.sqrt((spec[:, (freqs>=a)&(freqs<b)]**2).mean(1)) + 1e-9)
lo, mid, hi = band(20,150), band(150,2000), band(2000,12000)
for i in range(m):
    print(f"{i*step:5.1f} rms{rms[i]:6.1f} lo{lo[i]:5.0f} mid{mid[i]:5.0f} hi{hi[i]:5.0f} " + "#"*int(max(0, rms[i]+50)))
N = 16384
frames = np.lib.stride_tricks.sliding_window_view(x, N)[::8192]
S = np.abs(np.fft.rfft(frames*np.hanning(N), axis=1)); f = np.fft.rfftfreq(N, 1/SR)
v = (f > 50) & (f < 1500); pc = ((np.round(12*np.log2(f[v]/440)) + 9) % 12).astype(int)
ch = np.array([S[:, v][:, pc==k].sum() for k in range(12)]); ch /= ch.max()
names = 'C C# D D# E F F# G G# A A# B'.split()
maj = np.array([6.35,2.23,3.48,2.33,4.38,4.09,2.52,5.19,2.39,3.66,2.29,2.88]); mnr = np.array([6.33,2.68,3.52,5.38,2.60,3.53,2.54,4.75,3.98,2.69,3.34,3.17])
sc = [(np.corrcoef(np.roll(maj,k), ch)[0,1], names[k]+' major') for k in range(12)] + [(np.corrcoef(np.roll(mnr,k), ch)[0,1], names[k]+' minor') for k in range(12)]
print('key candidates:', sorted(sc, reverse=True)[:3])

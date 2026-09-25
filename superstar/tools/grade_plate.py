"""Grade an AI plate onto the Deploy ramps (docs/02-color-system.md) and retime to 60 fps.

Chroma-aware gradient map:
  * saturated (blue) pixels -> luminance mapped along the Blue Glow ramp
  * neutral pixels          -> luminance mapped along Soft Black (dark plates) or the cool Gray ramp (light plates)
  * blended by a saturation weight, so the grey studio floor never turns blue.
Motion-compensated interpolation 24 -> 60 fps (ffmpeg minterpolate, mci).

usage: python3 tools/grade_plate.py in.mp4 out.mp4 dark|light [--no-interp]
"""
import subprocess, sys
import numpy as np
import imageio_ffmpeg

FF = imageio_ffmpeg.get_ffmpeg_exe()
hexrgb = lambda h: np.array([int(h[i:i + 2], 16) for i in (1, 3, 5)], np.float32) / 255.0

MAPS = {
    'dark': {
        'blue': [(0.00, '#131313'), (0.10, '#141842'), (0.22, '#1D2166'), (0.36, '#272C8C'), (0.52, '#3338B0'),
                 (0.66, '#474DEF'), (0.82, '#7E86F5'), (1.00, '#B8BEFF')],
        'neutral': [(0.00, '#131313'), (0.30, '#131313'), (0.60, '#1D2166'), (1.00, '#B8BEFF')],
        'bg': '#131313',
    },
    'light': {
        'blue': [(0.00, '#141842'), (0.12, '#1D2166'), (0.26, '#272C8C'), (0.42, '#3338B0'), (0.58, '#474DEF'),
                 (0.78, '#7E86F5'), (1.00, '#B8BEFF')],
        # studio ground lands exactly on Gray 300 (#F6F6FF); contact shadows stay in the cool gray ramp
        'neutral': [(0.00, '#484855'), (0.20, '#8F8F9C'), (0.34, '#B2B2BF'), (0.44, '#D2D2DD'), (0.52, '#E9E9F2'),
                    (0.585, '#F6F6FF'), (1.00, '#F6F6FF')],
        'bg': '#F6F6FF',
    },
}


def lut(stops, n=1024):
    xs = np.array([s[0] for s in stops]); cs = np.stack([hexrgb(s[1]) for s in stops])
    t = np.linspace(0, 1, n)
    return np.stack([np.interp(t, xs, cs[:, k]) for k in range(3)], 1).astype(np.float32)


def smooth(e0, e1, x):
    t = np.clip((x - e0) / (e1 - e0), 0, 1)
    return t * t * (3 - 2 * t)


def main():
    src, dst, mode = sys.argv[1:4]
    interp = '--no-interp' not in sys.argv
    m = MAPS[mode]
    LB, LN = lut(m['blue']), lut(m['neutral'])
    probe = subprocess.run([FF, '-i', src], capture_output=True, text=True).stderr
    w, h = 1080, 1920
    vf = 'minterpolate=fps=60:mi_mode=mci:mc_mode=aobmc:me_mode=bidir:vsbmc=1' if interp else 'fps=60'
    rd = subprocess.Popen([FF, '-v', 'error', '-i', src, '-vf', vf, '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'],
                          stdout=subprocess.PIPE)
    wr = subprocess.Popen([FF, '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{w}x{h}', '-r', '60',
                           '-i', '-', '-c:v', 'libx264', '-preset', 'slow', '-crf', '12', '-pix_fmt', 'yuv420p', dst],
                          stdin=subprocess.PIPE)
    n = 0
    while True:
        buf = rd.stdout.read(w * h * 3)
        if len(buf) < w * h * 3:
            break
        x = np.frombuffer(buf, np.uint8).reshape(h, w, 3).astype(np.float32) / 255.0
        mx, mn = x.max(2), x.min(2)
        sat = np.where(mx > 1e-3, (mx - mn) / np.maximum(mx, 1e-3), 0)
        L = 0.2126 * x[..., 0] + 0.7152 * x[..., 1] + 0.0722 * x[..., 2]
        blueish = smooth(0.0, 0.08, x[..., 2] - x[..., 0])  # blue channel dominance
        wgt = smooth(0.12, 0.40, sat) * blueish
        # blue pixels are dark in luminance; stretch their range so highlights reach the light ramp end
        Lb = np.clip(L * 1.9, 0, 1)
        idx_b = (Lb * (len(LB) - 1)).astype(np.int32)
        idx_n = (np.clip(L, 0, 1) * (len(LN) - 1)).astype(np.int32)
        out = LB[idx_b] * wgt[..., None] + LN[idx_n] * (1 - wgt[..., None])
        wr.stdin.write((np.clip(out, 0, 1) * 255 + 0.5).astype(np.uint8).tobytes())
        n += 1
    wr.stdin.close(); wr.wait(); rd.wait()
    print(dst, n, 'frames @60fps')


if __name__ == '__main__':
    main()

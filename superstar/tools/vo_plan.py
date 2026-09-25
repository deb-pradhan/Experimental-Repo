"""VO edit plan: cut the locked take (vo_signal_a) into lines and place each on the film timeline.

Each line = one or more source segments (energy-split at pauses) + a film start time.
Internal gaps between a line's segments can be tightened (gap=None keeps the natural pause).
Outputs:
  audio/vo_plan.json          — for tools/mix_audio.py
  video/src/data/vo.json      — lines + every word with its FILM time (Whisper word stamps), for picture sync
"""
import json

SRC = 'audio/src/vo/vo_signal_a.mp3'
# Pickup (same voice, read in context) for the opening three lines: the accurate count is 89.
PICKUP = 'audio/src/vo/vo_pickup89_2.mp3'
SOURCES = {SRC: 'audio/src/vo/vo_signal_a.words.json', PICKUP: 'audio/src/vo/vo_pickup89_2.words.json'}
LINE_SRC = {'L01': PICKUP, 'L02': PICKUP, 'L03': PICKUP}
LINE_GAIN_DB = {'L03': 2.5}  # level-match the pickup to the main take
# (id, text, [(src_in, src_out), ...], film_start_s, tightened_gap_s or None)
LINES = [
    ('L01', "This market doesn't trend.", [(0.12, 1.34)], 1.00, None),
    ('L02', 'It whipsaws.', [(1.85, 2.69)], 3.00, None),
    ('L03', 'Eighty-nine direction changes in a month.', [(3.17, 5.06)], 4.60, None),
    ('L04', 'Five hundred and forty-two million dollars of longs, liquidated.', [(7.10, 10.54)], 8.30, None),
    ('L05', 'Six hundred and sixteen million of shorts.', [(11.44, 13.50)], 12.20, None),
    ('L06', 'Pick one side, and this market makes you pay.', [(14.86, 15.71), (16.18, 17.47)], 15.80, None),
    ('L07', 'Unless you can trade both.', [(18.19, 19.59)], 18.80, None),
    ('L08', 'Meet Superstar.', [(20.76, 21.65)], 22.35, None),
    ('L09', 'An intelligent agent, trading both sides for you.', [(22.58, 25.03)], 23.55, None),
    ('L10', 'Every four hours, it takes a fresh read of the market, and makes one decision.', [(25.90, 26.68), (27.12, 28.84), (29.52, 30.62)], 27.00, None),
    ('L11', 'It reads the last four hours, hour by hour.', [(31.70, 33.59), (34.09, 34.78)], 34.40, None),
    ('L12', 'Weighs eighteen market signals: leverage, liquidations, order flow, whales against retail.', [(35.63, 41.63)], 42.20, None),
    ('L13', 'Argues the bull case, and the bear case, each with the exact level that proves it wrong.', [(42.25, 44.08), (44.95, 47.11)], 50.20, None),
    ('L14', 'Then it chooses. Long. Short. Or nothing at all.', [(48.15, 49.45), (49.94, 50.27), (50.93, 51.26), (51.82, 52.44)], 55.40, None),
    ('L15', 'In the backtest, it sat out 1,350 of 2,298 reviews.', [(53.78, 57.54), (58.83, 61.49)], 60.20, 0.35),
    ('L16', 'Risk comes first. The loss limit is set before entry, and never widened.', [(62.05, 63.25), (63.75, 65.56), (66.20, 67.14)], 67.20, None),
    ('L17', 'Size follows the limit. The stop only moves to protect.', [(67.96, 69.18), (69.87, 71.80)], 72.60, None),
    ('L18', 'Backtested as Bitcoin rose to one hundred and twenty-four thousand, and fell to sixty-three,', [(72.69, 77.21)], 76.80, None),
    ('L19', 'it finished positive through both halves.', [(78.08, 79.82)], 81.60, None),
    ('L20', 'Spot, perps, and HIP-3, on Hyperliquid.', [(80.91, 81.26), (81.74, 82.09), (82.60, 83.33), (83.76, 84.54)], 84.20, None),
    ('L21', 'USDC in. USDC out.', [(85.22, 86.13), (86.75, 87.77)], 88.00, None),
    ('L22', 'Superstar. Now live on Deploy.', [(88.27, 88.89), (89.89, 90.25), (91.11, 91.98)], 91.00, 0.28),
]


def place(segs, film_start, gap):
    """Return [(src_in, src_out, film_in)] for the segments of one line."""
    out, t = [], film_start
    for i, (a, b) in enumerate(segs):
        if i > 0:
            t += (a - segs[i - 1][1]) if gap is None else gap
        out.append((a, b, round(t, 3)))
        t += b - a
    return out


# Hand-checked word positions where Whisper's alignment drifts (piece-onset based).
WORD_OVERRIDES = {
    'L14': [('Then', 0, 0.35), ('it', 0, 0.35), ('chooses.', 0, 0.55), ('Long.', 1, 0.33), ('Short.', 2, 0.33),
            ('Or', 3, 0.15), ('nothing', 3, 0.3), ('at', 3, 0.1), ('all.', 3, 0.2)],
    'L10': [('Every', 0, 0.3), ('four', 0, 0.2), ('hours,', 0, 0.28), ('it', 1, 0.1), ('takes', 1, 0.25), ('a', 1, 0.1),
            ('fresh', 1, 0.3), ('read', 1, 0.25), ('of', 1, 0.1), ('the', 1, 0.1), ('market,', 1, 0.4), ('and', 2, 0.2),
            ('makes', 2, 0.25), ('one', 2, 0.2), ('decision.', 2, 0.45)],
}


def override(pl, spec):
    # distribute listed words sequentially inside their piece
    out, cursor = [], {}
    for w, k, d in spec:
        a, b, fi = pl[k]
        t = cursor.get(k, fi)
        out.append([round(t, 3), round(min(t + d, fi + (b - a)), 3), w])
        cursor[k] = t + d
    return out


if __name__ == '__main__':
    WORDS = {k: json.load(open(v)) for k, v in SOURCES.items()}
    plan, vo = [], {'source': SRC, 'lines': []}
    for lid, text, segs, fs, gap in LINES:
        src = LINE_SRC.get(lid, SRC)
        words = WORDS[src]
        pl = place(segs, fs, gap)
        plan.append({'id': lid, 'text': text, 'src': src, 'gain_db': LINE_GAIN_DB.get(lid, 0.0), 'pieces': pl})
        # Assign each Whisper word to its nearest piece, then snap each piece's words so the first word
        # starts at the piece's measured energy onset (Whisper stamps run up to ~0.6 s early).
        groups = {k: [] for k in range(len(pl))}
        for ws, we, w in words:
            best = None
            for k, (a, b, fi) in enumerate(pl):
                if a - 0.7 <= ws <= b + 0.05:
                    d = 0 if a <= ws <= b else min(abs(ws - a), abs(ws - b))
                    if best is None or d < best[0]:
                        best = (d, k)
            if best:
                groups[best[1]].append((ws, we, w))
        wl = []
        for k, (a, b, fi) in enumerate(pl):
            g = groups[k]
            if not g:
                continue
            shift = max(0.0, a - g[0][0])
            for ws, we, w in g:
                s0 = min(max(ws + shift, a), b)
                e0 = min(max(we + shift, s0 + 0.05), b)
                wl.append([round(fi + s0 - a, 3), round(fi + e0 - a, 3), w])
        if lid in WORD_OVERRIDES:
            wl = override(pl, WORD_OVERRIDES[lid])
        end = pl[-1][2] + (pl[-1][1] - pl[-1][0])
        vo['lines'].append({'id': lid, 'text': text, 'start': pl[0][2], 'end': round(end, 3), 'words': wl})
    # sanity: no overlaps
    for a, b in zip(vo['lines'], vo['lines'][1:]):
        assert b['start'] >= a['end'] - 1e-6, (a['id'], a['end'], b['id'], b['start'])
    json.dump({'source': SRC, 'lines': plan}, open('audio/vo_plan.json', 'w'), indent=1)
    json.dump(vo, open('video/src/data/vo.json', 'w'))
    for l in vo['lines']:
        print(f"{l['id']} {l['start']:6.2f}–{l['end']:6.2f}  {l['text'][:60]}  | " + ' '.join(f"{w[2]}@{w[0]:.2f}" for w in l['words'][:6]))

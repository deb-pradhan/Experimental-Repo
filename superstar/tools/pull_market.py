"""Pull BTC market series from Hyperliquid's public info API (the venue Superstar executes on).

Writes data/hl_raw.json: daily (≈400 d), 4h (≈90 d), 1h (≈10 d) candles, hourly funding (30 d), live context.
Narrative numbers from Hyblock (liquidations, OI, funding) are transcribed separately into data/hyblock.json.
"""
import json, time, urllib.request

URL = 'https://api.hyperliquid.xyz/info'


def post(body):
    req = urllib.request.Request(URL, data=json.dumps(body).encode(), headers={'Content-Type': 'application/json'})
    with urllib.request.urlopen(req, timeout=30) as r:
        return json.loads(r.read())


now = int(time.time() * 1000)
DAY = 86400000
out = {'source': 'api.hyperliquid.xyz/info', 'pulledAt': now}
for key, iv, days in [('d1', '1d', 420), ('h4', '4h', 90), ('h1', '1h', 10)]:
    c = post({'type': 'candleSnapshot', 'req': {'coin': 'BTC', 'interval': iv, 'startTime': now - days * DAY, 'endTime': now}})
    out[key] = [[x['t'] // 1000, float(x['o']), float(x['h']), float(x['l']), float(x['c']), float(x['v'])] for x in c]
    print(key, len(out[key]), 'candles', out[key][0][0], '→', out[key][-1][0])
fh = post({'type': 'fundingHistory', 'coin': 'BTC', 'startTime': now - 30 * DAY})
out['funding1h'] = [[x['time'] // 1000, float(x['fundingRate'])] for x in fh]
print('funding', len(out['funding1h']))
meta, ctxs = post({'type': 'metaAndAssetCtxs'})
i = [u['name'] for u in meta['universe']].index('BTC')
out['ctx'] = ctxs[i]
print('ctx', ctxs[i])
json.dump(out, open('data/hl_raw.json', 'w'))

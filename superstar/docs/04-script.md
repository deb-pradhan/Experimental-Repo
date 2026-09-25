# 04 — Script (locked v1)

Voice: calm, exact, disciplined. A systematic desk explaining its rules, not a hype read. ~175 words over 99 s,
leaving room for the score's breaths (the freeze at 20–22 s, the breakdown at 58–65 s).
Times are film seconds; final placement follows the recorded read (`tools/mix_audio.py`).

| # | Film time | VO | On screen (key words only) |
|---|---|---|---|
| S1 | 1.0 | This market doesn't trend. | `btc-perp · 4h · hyperliquid` · the price line |
| | 3.2 | It whipsaws. | **Whipsaw.** |
| | 5.0 | Eighty-nine direction changes in a month. | **89** direction changes · 180 four-hour candles |
| S2 | 8.4 | Five hundred and forty-two million dollars of longs, liquidated. | **$542M** longs liquidated |
| | 12.4 | Six hundred and sixteen million of shorts. | **$616M** shorts liquidated · `binance btc perps · 30d · hyblock` |
| S3 | 16.0 | Pick one side, and this market makes you pay. | LONG ✕ · SHORT ✕ |
| | 19.0 | Unless you can trade both. | (freeze · collapse to one point) |
| S4 | 22.4 | Meet Superstar. | **Superstar** |
| | 23.9 | An intelligent agent, trading both sides for you. | An intelligent agent, trading *both sides for you.* |
| S5 | 28.0 | Every four hours, it takes a fresh read of the market, and makes one decision. | Every 4 hours. One decision. |
| S6 | 34.6 | It reads the last four hours, hour by hour. | 01 · Read the last four hours · −3h −2h −1h now |
| S7 | 42.5 | Weighs eighteen market signals: leverage, liquidations, order flow, whales against retail. | 02 · 18 inputs · 6 groups · 1 decision |
| S8 | 50.5 | Argues the bull case and the bear case, each with the exact level that proves it wrong. | 03 · Bull case · Bear case · invalidation levels |
| S9 | 58.4 | Then it chooses. Long. Short. Or nothing at all. | 04 · LONG · SHORT · NO TRADE |
| | 62.3 | In the backtest, it sat out one thousand, three hundred and fifty of two thousand, two hundred and ninety-eight reviews. | **1,350 / 2,298** · Nothing is a valid move. |
| S10 | 66.2 | Risk comes first. The loss limit is set before entry, and never widened. | Risk first. Then the trade. · 01 Loss limit set before entry |
| | 70.8 | Size follows the limit. The stop only moves to protect. | 02 Size follows the limit · 03 Stops only move to protect |
| S11 | 74.6 | Backtested as Bitcoin rose to one hundred and twenty-four thousand, and fell to sixty-three, | $104k → $124k → $63k (BTC, grey) |
| | 80.0 | it finished positive through both halves. | **$271,465** · **+171.46%** · max drawdown 13.6% · Simulated backtest |
| S12 | 84.4 | Spot, perps and HIP-3, on Hyperliquid. USDC in, USDC out. | Spot · Perps · HIP-3 · Hyperliquid · USDC · $10,000 USDC minimum |
| S13 | 90.8 | Superstar. Now live on Deploy. | Deploy lockup · deploy.finance/superstar · disclaimer |

## Claim map (every line → source)

| Line | Source |
|---|---|
| 89 direction changes in a month | `03-quant-brief.md`: 89 direction changes in the last 180 closed Hyperliquid 4h candles (30 d), flat candles ignored |
| $542M longs / $616M shorts | `03-quant-brief.md`: Hyblock, Binance BTC perps, 2026-08-26 → 09-24 (venue labelled on screen) |
| An intelligent agent, trading both sides for you | deploy.finance/superstar hero |
| Every four hours … a fresh read … one decision | docs how-it-works: "Every four hours it takes a fresh read of current market data and makes one decision" |
| Reads the last four hours, hour by hour | docs step 1: "3 hours ago, 2 hours ago, 1 hour ago, and now" |
| Eighteen market signals; leverage, liquidations, order flow, whales vs retail | docs signal lenses (18 inputs); landing "18 inputs · 6 groups · 1 decision" |
| Bull case and bear case, exact level that proves it wrong | docs step 3 |
| Long. Short. Or nothing at all. | docs step 4 ("Long, short, or no trade") |
| Sat out 1,350 of 2,298 reviews (in the backtest) | docs + landing; "Nothing is a valid move." landing |
| Loss limit before entry, never widened; size follows the limit; stop only moves to protect | landing "Three rules that don't bend" |
| BTC rose to ~$124k and fell to ~$63k; positive through both halves; $271,465; +171.46%; 13.6% max DD | docs overview backtest (simulated, labelled on screen) |
| Spot, perps and HIP-3 on Hyperliquid; USDC in, USDC out | docs overview |
| $10,000 USDC minimum | docs overview |

End card legal (from the landing page, verbatim): "Simulated backtest, not live customer trading. Fees, intra-window moves, partial fills
and execution delay are not fully modeled, so live results can differ. Crypto derivatives can lose money quickly; nothing here is a promise of
future performance. Not investment advice. May not be available in all jurisdictions."

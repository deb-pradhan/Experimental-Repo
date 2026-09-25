# 03 — Quant brief: the market Superstar launches into

As of 2026-09-25 21:00 UTC. Price series: Hyperliquid BTC-PERP public candles (the venue Superstar executes on).
Liquidations, OI, funding and positioning: Hyblock Capital MCP. Chart data: `data/market.json`.

## Snapshot

| Metric | Value | Source |
|---|---|---|
| BTC mark | **$83,780** | Hyperliquid `metaAndAssetCtxs` |
| All-time high | $126,297 (2025-10-06) | Hyperliquid 1d candles |
| Drawdown from high | **−33.7%** | computed |
| Low since the high | $57,768 (2026-07-01) | Hyperliquid 1d candles |
| Bounce from that low | **+45.0%** | computed |
| 30-day range | $74,903 – $87,471 (16.8% wide) | Hyperliquid 1d candles |
| Realised vol, annualised | 7d 49.0% · 30d 42.5% · 90d 38.9% | daily log returns |
| Days with a move > 5% (30 d) | 3 (Aug 19 +7.2%, Sep 18 +5.9%, Sep 21 +6.7%)* | computed |
| 4h direction changes (30 d) | **89 in the last 180 closed candles** (flat candles ignored) | Hyperliquid 4h candles |
| 4h closes crossing the 20-period mean (30 d) | 17 | computed |
| **Long liquidations, 30 d** | **$541.6M** | Hyblock · Binance BTC perps, 2026-08-26 → 09-24 |
| **Short liquidations, 30 d** | **$615.7M** | same |
| Days shorts out-liquidated longs | 14 of 30 | same |
| Biggest short squeeze | $309.7M shorts, 2026-08-19 (BTC +7.2%) | Hyblock |
| Biggest long flush (30 d) | $85.8M longs, 2026-09-15 (BTC −3.3%) | Hyblock |
| Latest squeeze | $163.3M shorts, 2026-09-21 (BTC +6.7%) | Hyblock |
| Funding | positive 90.6% of hours (Hyperliquid, 20 d), ≈ 8.5% annualised; positive 99 of 100 days (aggregate) | Hyperliquid + Hyblock |
| True retail positioning | 56% long / 44% short | Hyblock · Binance |
| Aggregate OI | $25.4B now vs $28.3B on 2026-09-21 (−10% in 4 days) | Hyblock, 16 venues |

\*The 30-day window runs to 2026-09-24; Aug 19 falls in the 50-day window, Aug 21 +7.4% likewise.

## The regime

A **violent, two-way range after a deep drawdown**. Bitcoin is a third below its high and nearly half above its low,
boxed in a 17% range that it crosses in days, not weeks. Short-dated vol (49%) is running hotter than the 30-day (42.5%): it's expanding, not settling.
The 4h tape is close to a coin flip (89 direction changes in 180 closed candles). Leverage is being flushed from **both** ends: $616M of shorts
and $542M of longs liquidated in 30 days on one venue alone, with shorts squeezed in the rallies (Aug 19, Sep 21) and longs flushed on the drops (Sep 15).
Funding stayed positive almost the whole time: longs kept paying to stay crowded in a market that kept punishing them.

## The narrative on volatility

The market isn't trending. It's whipsawing, and a whipsaw takes money from whoever committed to one direction.
The trader who is only long pays funding and gets flushed on every drop. The trader who is only short gets squeezed on every rip.
Both sides are right some of the time, and both lose the same billion dollars.

## Why this regime favours Superstar

| Regime property | Superstar feature (docs) |
|---|---|
| Two-way liquidations ($542M long, $616M short) | Trades **both sides**: long, short or flat. The backtest was profitable in both directions (shorts +$130,427, longs +$41,038). |
| Coin-flip 4h tape, chop | **Sits out** when the cases are close: 1,350 of 2,298 reviews ended in no trade. "Nothing is a valid move." |
| Leverage flushes, squeezes, OI −10% in 4 days | Reads exactly these inputs every 4 hours: OI and OI delta, funding, liquidation pools and realised liquidations, order flow, whales vs retail. |
| Fast reversals | **Loss limit set before entry, never widened**, size from the limit, stop only moves to protect. No revenge trades. |
| Deep drawdown then bounce | The backtest spanned exactly this shape: BTC ~$104k → ~$124k → ~$63k, and the strategy finished positive through both halves (simulated). |

## Film-ready facts (strongest first)

1. **"$542 million of longs. $616 million of shorts. Liquidated in 30 days."** (Hyblock · Binance BTC perps, Aug 26 – Sep 24) ★
2. **"Bitcoin: 34% below its high. 45% above its low."** (Hyperliquid) ★
3. **"A 17% range in 30 days."** ($74.9k – $87.5k)
4. **"89 direction changes in 180 four-hour candles."** ★ (the whipsaw, quantified; closed candles, flat candles ignored)
5. "$310 million of shorts wiped out in a single day." (Aug 19)
6. "Funding positive 9 hours in 10: longs paying to stay wrong." (Hyperliquid, 20 d)
7. "Short-term volatility at 49%, running above the monthly 42.5%."
8. "$2.9 billion of open interest gone in four days." (Hyblock aggregate, Sep 21 → Sep 25)

## Opening hooks (pick one)

- **A (recommended):** "In the last thirty days, this market liquidated $542 million of longs. And $616 million of shorts."
- B: "Bitcoin is a third below its high and half again above its low. Pick a side, and it punishes you."
- C: "Eighty-nine direction changes in a month. This market doesn't trend. It whipsaws."

## Caveats

Liquidation totals are one venue (Binance BTC perps); the true market-wide number is larger, so the film labels the venue.
Funding values from the Hyblock aggregate are in the tool's own units; the film uses only sign/share claims and Hyperliquid's own funding.
Superstar's backtest numbers are simulated and must be labelled as such on screen.

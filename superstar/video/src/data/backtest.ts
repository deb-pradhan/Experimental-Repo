// Superstar backtest (SIMULATED) — docs.deploy.finance overview + deploy.finance/superstar landing JS.
// Must be labelled "Simulated backtest" whenever on screen.
export const BACKTEST = {
  period: 'Jun 2025 – Jul 2026',
  asset: 'BTC',
  start: 100000,
  end: 271465,
  returnPct: 171.46,
  trades: 688,
  winRatePct: 52.3, // resolved trades profitable
  maxDrawdownPct: 13.6,
  reviews: 2298,
  noTrade: 1350,
  winners: 366,
  losers: 322,
  payoff: 1.27, // $ back per $1 lost
  positiveMonths: 10,
  months: 14,
  bySide: {short: {pnl: 130427, trades: 544}, long: {pnl: 41038, trades: 144}},
  btcPath: {start: 104000, peak: 124000, low: 63000},
  // month-end points, Jun '25 → Jul '26 (15 points incl. start)
  labels: ["Jun '25", 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', "Jan '26", 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'end'],
  equityK: [100, 106, 118, 110, 134, 173.2, 190, 172, 164.2, 192, 210, 235, 230, 258, 271.465],
  btcIndexed: [100, 100, 106, 104, 112, 116, 119, 110, 96, 88, 82, 74, 68, 63, 61],
  monthlyPnlK: [6, 12, -8, 24, 39.2, 16.8, -18, -7.8, 27.8, 18, 25, -5, 28, 13.465],
  disclaimerShort: 'Simulated backtest · not live trading',
  disclaimer:
    'Simulated backtest, not live customer trading. Fees, intra-window moves, partial fills and execution delay are not fully modeled, so live results can differ. Crypto derivatives can lose money quickly; nothing here is a promise of future performance.',
} as const;

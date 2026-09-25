# 00 — Superstar: Product & Brand Research

Researched 2026-09-25 from docs.deploy.finance, deploy.finance, deploy.finance/superstar, deploy.finance/ai-info and deploy.finance/blog. All quotes are copied verbatim from the pages (typos included). Where two sources disagree, both are shown and the current docs win.

**Source priority for the film:** the current docs (Superstar section, updated September 2026) come first, then the `/superstar` landing page. The homepage, `/ai-info` and the blog posts are **older (pre-rename) copy**. They still say "Super Perps" and "BTC · ETH · SOL · HYPE perps only", and in one place the homepage calls the agent "delta neutral". Use those older pages for tone only, not for facts.

---

## 1. Product facts (verbatim, with URLs)

### 1.1 Identity and naming
- "_Formerly Super Perps._" / "Super Perps is now Superstar. The name changed; the agent you deploy did not." (https://docs.deploy.finance/products/agents/superstar/overview)
- Docs nav label: **"Superstar Agent"**. Site page title: **"Superstar - AI Crypto Trading Agent (formerly Super Perps)"** (https://deploy.finance/superstar)
- Homepage announcement bar: "Super Perps is now Superstar. It trades spot and HIP-3 markets alongside perps." / Superstar page bar: "Super Perps is now Superstar. The launch sizing cap is off."
- The redirect https://deploy.finance/super-perps now goes to /superstar ("Redirecting to Superstar").

### 1.2 What it is (one-liners)
- "Superstar is an autonomous directional trading agent. It trades spot, perpetuals, and HIP-3 markets, going long, short, or staying flat, and takes outcome-market positions selectively when there is a clear winner. It sizes every position from a fixed loss budget and manages each trade to exit." (overview)
- "Where Income: Funding Rates earns by staying market neutral, Superstar picks a direction." (overview and landing page)
- "Superstar suits capital that wants directional crypto exposure without trading it by hand." (https://docs.deploy.finance/products/agents/superstar/who-is-it-for)
- Meta description: "Superstar trades spot, perpetuals and HIP-3 markets on Hyperliquid, going long, short, or staying flat. Every position is sized from a fixed loss budget. Self-custodial on Deploy." (https://deploy.finance/superstar)
- "It started with perpetuals. It now trades spot, perpetuals, and HIP-3 markets, and takes outcome-market positions selectively, only when there is a clear winner." (overview)
- "Its post-launch stabilization window has also ended. For its first 30 days the agent ran with position sizing deliberately capped while its live behavior, edge cases, and execution were watched across real market conditions. That cap is now off: full sizing and the full market set are unlocked." (overview)

### 1.3 How it decides (cadence, loop, signals)
- "Superstar runs on a fixed schedule. Every four hours it takes a fresh read of current market data and makes one decision: open a long, open a short, or stay out of the market." (https://docs.deploy.finance/products/agents/superstar/how-it-works)
- "It carries no view from prior cycles and does not wait for you to confirm anything."
- "In the backtest it declined to trade on 1,350 of 2,298 reviews."
- **Decision loop (docs, 4 steps):**
  1. **Read the last four hours**: "For each input, lay out where the reading stood 3 hours ago, 2 hours ago, 1 hour ago, and now."
  2. **Synthesize a picture**: "Map price and OI quadrant, order-book lean, liquidation clusters, funding and volume trends. Missing feeds are marked and weighted down."
  3. **Argue both sides**: "Write an explicit bull case and bear case, each with concrete points and the exact level that proves the idea wrong."
  4. **Choose a direction**: "Long, short, or no trade. Carries a rough probability, entry plan, invalidation level, and what would justify adding."
  - "When the cases are close or the data is thin, the verdict is **no trade**."
- **Landing-page loop (4 labelled steps, although the copy says "five steps"):** "01 · Review — Review the market — 18 live signals across 6 groups, pulled fresh." / "02 · Decide — BULL / BEAR — Decide a direction — Weigh bull vs bear; act when the edge clears threshold." / "03 · Protect — Size & protect — Size from a hard loss limit; the stop only ratchets up." / "04 · Wait — Wait it out — Sat out 1,350 of 2,298 reviews. Nothing is a valid move." / "↻ REPEATS AROUND THE CLOCK" (https://deploy.finance/superstar)
- **Signals, docs version:** 18 inputs in 5 lenses (the text says "four lenses" but lists five):
  - Price context: Price 1h close, 1h high
  - Positioning and leverage: OI 1h close, OI delta last hour, Realized funding, Indicative funding
  - Forced buying and selling: Long/short liquidation pools, long/short liquidations 1h realized
  - Order flow and pressure: Buy volume 1h, Sell volume 1h, Bid/ask ratio 0 to 2%, Daily CVD
  - Whales versus retail: Whale-retail delta, Global retail long/short, True retail long/short, Top trader long/short
  - "The agent uses these inputs as cross-market confirmation across exchanges, timeframes, and options conditions."
- **Signals, landing-page and blog "signal bus" version:** "superstar · signal bus — 18 inputs · 6 groups · 1 decision". The groups are **Positioning, Liquidations, Order flow, Funding & basis, Cross-market, Microstructure**. The footer reads "18 independent market signals · weighed into one decision".
  - **Recommendation for the film:** say "18 market signals" and "one decision". If groups appear on screen, use the 6-group signal-bus labels, because that is the brand's own visual.
- "Price only shows what already happened. Superstar reads the pressure building underneath, then commits only when enough of it points the same way." (landing)
- "The agent acts only when several independent readings agree, and treats disagreement as a reason to stay out." (risks)
- Hero widget states on the landing page: "reviewing the market" / "Long" / "Short" / "No trade" / "SUPERSTAR · LIVE · Now watching", with BTC, ETH, SOL and HYPE coin icons.

### 1.4 Risk framework (the heart of the story)
| Rule | How it works (docs, verbatim) |
|---|---|
| Loss limit set before entry | The maximum loss is decided before the trade opens and is never widened afterward |
| Position size comes from the limit | Sizing is mechanical. Size follows the loss limit, not the conviction in the idea |
| Stop only moves to protect capital | The stop trails behind price as a trade works. It never widens to give the trade more room |

- "Risk is part of the decision to trade. If the risk does not fit, the trade does not open." / "There are no revenge trades after a loss. Most losing trades end the same quiet way, at their stop." (how-it-works)
- Landing: "Risk first. Then the trade." / "Every position starts with a hard loss limit. Size is solved from that limit, not from conviction. If the risk doesn't fit, the trade doesn't open."
- Landing sizing formula: "Loss limit — hard cap · before entry ÷ Stop distance — how far to the stop = Position size — solved, not guessed". Also: "1R max loss — Every trade risks the same pre-set amount. One loud signal can't talk the agent into a bigger bet."
- Landing "Non-negotiable — Three rules that don't bend": "01 Loss limit set before entry — The cap is part of the decision to trade at all. It is never widened after the fact." / "02 Size follows the limit — Position size is derived from that loss limit, not from conviction or gut feel." / "03 Stops only move to protect — A stop ratchets up to lock in gains. It never loosens to give a losing trade more room."
- Blog image labels (old name): "Loss limit first" / "Size follows the limit" / "The stop only tightens". Footer: "Fixed up front, with no mid-trade override — closer to an institutional systematic desk than a retail bot."
- Stop-loss timing (FAQ): "The agent posts stop-loss orders as your entry limit orders fill — not at the moment the trade is opened." Partial fills can show "a range of limit orders and a take-profit, but no stop-loss on the book yet. That's expected."

### 1.5 Portfolio behaviour
- "The agent usually keeps most of the balance working, often in the range of 60 to 70 percent, and runs more than one strategy at once. It might build a spot position in a major asset and rebalance it over time while trading directionally on perpetuals, so a mix such as spot and perpetuals, or HIP-3 and perpetuals, is common. Whether a given trade fills depends on the market. Risk is handled per trade: each position carries its own loss boundary, and most trades are short-term rather than swings." (overview)
- "It reviews every four hours and does not trade on every review." / Range-bound markets: "Less than usual… you should expect fewer trades." (FAQ)

### 1.6 Backtest numbers (must always be labelled as simulated)
Source: overview, landing page, launch blog post.

| Metric | Backtested result |
|---|---|
| Starting balance | $100,000 |
| Ending balance | $271,465 |
| Total return | 171.46% (landing hero rounds this to "+171% backtest return") |
| Filled trades | 688 |
| Resolved trades profitable | 52.3% (landing labels this "Win rate") |
| Maximum drawdown | 13.6% |
| Reviews ending in no trade | 1,350 of 2,298 |
| Period | Jun 2025 – Jul 2026 ("thirteen months" in the blog, 14 monthly bars on the landing page) |
| Positive months | 10 of 14 (landing) |
| Best month | Oct '25, +$39.2k (landing) |
| P&L by side | Short +$130,427 (544 trades), Long +$41,038 (144 trades), total +$171,465 (landing and blog) |
| Winners vs losers | "Roughly $1.27 came back for every $1 the losing trades gave up, from 366 winners against 322 losers." (docs). The landing donut shows Managed winners 293, Target hit 71, Stopped out 322, Expired flat 2. |
| Market path | "Bitcoin climbed from roughly $104,000 to about $124,000, then fell to near $63,000." The backtest ran on **Bitcoin**. |

- "The strategy finished positive through both halves." / "Both directions finished in profit, with shorts carrying much of the back half."
- Landing: "Backtested through the ups, the downs, and the chop." / "The strategy stayed green through both halves. Simulated, not a promise."
- Monthly data embedded in the landing page JS (useful for an accurate on-screen chart), Jun '25 → Jul '26:
  - strategy equity ($k): `100,106,118,110,134,173.2,190,172,164.2,192,210,235,230,258,271.465`
  - BTC buy & hold (indexed): `100,100,106,104,112,116,119,110,96,88,82,74,68,63,61`
  - monthly P&L ($k): `6,12,-8,24,39.2,16.8,-18,-7.8,27.8,18,25,-5,28,13.465`
- Blog: "The edge sits in the asymmetry between how winners and losers are managed. Losers get cut at a fixed stop, while winners run with a trailing exit."

### 1.7 Venue, assets, custody
- "Execution runs on Hyperliquid, spanning spot, perpetuals, and HIP-3 markets, plus outcome markets when there is a clear winner. Settlement is non-custodial with sub-second finality. USDC in, USDC out." (overview)
- "**Hyperliquid** is the primary exchange for Income: Funding Rates and Superstar, chosen for non-custodial settlement and sub-second finality." Deposits arrive as USDC on **Arbitrum** and are bridged to Hyperliquid. (https://docs.deploy.finance/products/agents/execution)
- "**USDC** is the funding and settlement currency for both agents, and the only stablecoin used in Income: Funding Rates and Superstar."
- "Agent wallets whitelist the protocols an agent may touch: Hyperliquid. An agent cannot send assets to another wallet and cannot interact with a protocol outside that list."
- "After depositing your stablecoins, an agent may take a few hours before deploying capital to the strategy."
- The agent **can** "View balances and activity / Open, close, and manage positions / Set and adjust stops". It **cannot** "Withdraw your funds / Transfer assets to another address / Act after you revoke its key". (https://docs.deploy.finance/what-are-deploy-finance-agents)
- "Every trade is onchain and publicly viewable. Paste your Deploy wallet address into any Hyperliquid block explorer to see every transaction and every agent move." (https://docs.deploy.finance/what-is-deploy-finance)
- Landing CTA: "Fund it. Deploy it. Step away. Non-custodial settlement with sub-second finality. USDC in, USDC out. Pause or withdraw anytime." (Note: the FAQ says partial withdrawals are **not** supported in-app; withdrawals are lump-sum after stopping the agent.)

### 1.8 Who it is for / not for (https://docs.deploy.finance/products/agents/superstar/who-is-it-for)
- It fits you if: "You want exposure to market direction (either up or down)." / "You accept that a directional strategy has losing trades and losing months, and you judge it over a cycle rather than a week." / "You have at least $10,000 in working capital." / "You want a fixed risk framework more than discretion, and you accept the agent will sit out most reviews if conditions don't confirm an entry."
- Probably not for you if: "Capital preservation is your first objective." / "You want to approve trades or override the agent. It decides and acts on its own schedule." / "You would be deploying money you cannot afford to see draw down." / "You are below the $10,000 minimum."

### 1.9 How to choose (https://docs.deploy.finance/products/agents/how-to-choose)
|  | Income: Funding Rates | Superstar |
|---|---|---|
| Objective | Steady yield in USDC | Growth from price moves |
| Market stance | Market neutral | Directional |
| Relative risk | Lower | Higher |
| Return source | Funding payments | Price direction |
| Markets | HYPE spot and perpetual | Spot, perps, HIP-3; select outcome markets |
| Denomination | USDC | USDC |
| Minimum | $100 USDC required | $10,000 USDC required |

"**You want handled exposure to crypto direction** → Superstar." / "**You want both, with no single strategy carrying all the risk** → split the allocation."

### 1.10 Dynamic builder fee (https://docs.deploy.finance/products/agents/superstar/dynamic-builder-fees)
- "Superstar does not charge a flat builder fee. For each trade the agent sets its own fee, between 1 and 10 bps, reflecting how much its signal and execution contribute to that particular trade."
- 1 bps (floor): "Routine signals, defensive trades, exits and protective moves". 10 bps (ceiling): "Strong, rare or time sensitive signals, particularly in trending or breakout conditions".
- "The fee reflects value, not volume. Users pay more only where the agent brings more edge."
- There are four inputs: signal strength and regime, trade type, execution difficulty and trade size. "Users should never be discouraged from managing risk by the cost of doing so."
- "The fee is part of the trade test… A setup whose expected move does not clear the fee is not taken." / "The fee is a friction to mispricing, not a tax on the user."
- Principles: Paid by value · Always visible ("Every fee is recorded against its trade in the activity feed, with a short note on why it was set") · Capped ("never exceeds the approved maximum") · Automatic ("No plans or tiers") · Costed before entry.
- Platform: "There is no subscription and no upfront cost to use Deploy Finance." You still pay "gas, exchange trade fees, and bridge fees". (https://docs.deploy.finance/products/agents/fees)

### 1.11 FAQ highlights (https://docs.deploy.finance/products/agents/superstar/faq)
- Minimum: "$10,000 USDC."
- "Can it lose money? Yes. It is a directional strategy, but every position carries a loss limit set before entry…"
- "Does it go short? Yes, the agent can go long, short, or flat."
- "Can I tell it what to trade? No. The agent decides direction, asset, size, and timing within its framework."
- "Does it earn funding like the other agent? No. Superstar profits from price movement and direction, not from the funding premium."
- On sitting flat: "Staying out is one of the three things the agent can decide to do."

### 1.12 Launch messaging (blog)
There is no post with "Superstar" in its title. The Super Perps launch post is **"What's Next for DeFi Yields in 2026"** (https://deploy.finance/blog/what-is-next-for-defi-yields-2026), with the header art "The Next Frontier for Yield Products". Key lines:
- "What is missing from this build-out is the strategy layer. The exchanges are offering plumbing. The wallet providers are offering keys."
- "Its new agent, Super Perps, is an autonomous directional trader… It does not require the user to configure signals, approve trades or monitor positions. Every four hours, day and night, the agent takes a fresh read of the market, decides whether to go long, short or stay flat, sizes the position against a fixed risk budget, and manages the trade through to exit."
- "More often than not, it waited."
- "…compete against autonomous systems that do not sleep, do not tilt, and size every position from a risk budget rather than a feeling, or hand the job to one of those systems."
- "But pretending the market still belongs to people watching charts may be the least comfortable option of all."
- Related posts: "Why AI Trading Agents Can't Short the Crypto Markets": "The flat state is a genuine output, not a fallback." / "A directional strategy does not need a high hit rate. It needs asymmetry." "Your Trading Counterparty is AI": "what happens when the participants on both sides of a leveraged trade are increasingly machines?"

---

## 2. Risks and compliance language we must respect

### 2.1 Superstar risks (verbatim, https://docs.deploy.finance/products/agents/superstar/risks)
> Superstar is not market neutral. Its risk profile should not be conflated with Income: Funding Rates.
>
> **Directional market exposure.** The agent can take the wrong directional view. Adverse price movement directly generates losses. To help mitigate this, Superstar sets a loss limit before entry.
>
> **Leverage.** Positions in perpetuals and HIP-3 markets use leverage, which amplifies both gains and losses. To help mitigate this, Superstar calculates the position size from a fixed loss budget, so a strong signal does not produce an oversized position.
>
> **Model and signal.** The inputs and decision framework may fail to identify direction correctly, or may behave differently in conditions not represented in the agent's historical analysis. To help mitigate this, Superstar takes no position with just a single confirmation. The agent acts only when several independent readings agree, and treats disagreement as a reason to stay out.
>
> **Execution.** Slippage, fees, liquidity, and execution delays can cause realized results to differ from the agent's intended entry, stop, or exit levels. To help mitigate this, Superstar executes on Hyperliquid, chosen for deep liquidity and sub-second finality.
>
> **Stop-loss limits.** Position sizing comes from a predefined loss budget and stops are set before entry. These controls reduce rather than eliminate the possibility of loss. To help mitigate this, Superstar sets the stops before entry and never widened afterward, and they move only in the direction that protects capital.

### 2.2 Platform risks (https://docs.deploy.finance/risks)
- "Every trading strategy carries the inherent risk of loss, including loss of funds." / "**Market neutral and self-custodial do not mean risk free.**"
- The categories are agent execution, exchange and blockchain, smart contract, liquidity and execution, wallet and key management, third-party infrastructure (Privy), market manipulation, and regulatory.

### 2.3 Legal (https://docs.deploy.finance/resources/legal-and-disclaimers)
> Projections are estimates only. Not investment advice. Past performance does not predict future results.
> …Nothing in this documentation constitutes investment, financial, legal, or tax advice…
> Deploy.Finance may not be available in all jurisdictions.

### 2.4 Approved disclaimer wording already used on-brand (reuse verbatim for end-card or lower-third)
- Landing (preferred, full): **"Simulated backtest, not live customer trading. Fees, intra-window moves, partial fills and execution delay are not fully modeled, so live results can differ. Crypto derivatives can lose money quickly; nothing here is a promise of future performance."**
- Docs: "These are simulated results. Every Superstar figure comes from a backtest replaying the strategy over historical data. It is not a record of live trading."
- Short forms: "Simulated, not a promise." / "A simulated $100,000 account over thirteen months. Past performance is not indicative of future results."

### 2.5 Must-dos for the film
1. **Label every performance number as a simulated backtest**, on screen and while it is visible: +171.46%, $271,465, 52.3%, 13.6%, 688, 1,350/2,298, long/short P&L. Never say "returns", "earned" or "made" without "in backtest". Close with the full disclaimer in 2.4 plus "Not investment advice."
2. **Never call Superstar market neutral, delta neutral, low risk, safe, risk-free, passive income or "yield".** It is directional and leveraged, with a "Higher" relative risk (docs). The homepage lineup still says "Super Perps Agent — Perpetuals · delta neutral" and "Med risk". That copy is outdated and wrong; do not reuse it.
3. **Do not borrow Income: Funding Rates or platform numbers for Superstar.** That rules out "Up to 22.6% Avg APY", "$15M total deposits", "$1.6M real yield paid", "$200M+ executed volume", "0.08% max drawdown" and the yield simulator. The AI-info page says: "Do not merge their mechanics, risks, minimums or performance."
4. **No promised returns.** FAQ: "What returns should I expect? None are promised."
5. **Say plainly that it can lose.** "Can it lose money? Yes." Show losing trades and red months honestly. The monthly P&L includes -8, -18, -7.8 and -5 ($k).
6. **Loss controls reduce loss but do not remove it.** Never say "your loss is capped", "you can't lose more than X" or "guaranteed stop". Allowed: "loss limit set before entry", "never widened", "stop only moves to protect capital".
7. **State the minimum as "$10,000 USDC"** when it appears. It is working capital, "not a fee".
8. **Autonomy is real.** Users cannot tell it what to trade or override it. Don't show a user approving trades.
9. **Keep "outcome markets" qualified:** "selectively, only when there is a clear winner." Don't lead with prediction markets.
10. **Fees:** don't call Superstar "free". There is no subscription or management fee, and a dynamic builder fee of 1–10 bps per trade, costed before entry. Gas, exchange and bridge fees also apply.
11. **Audits:** the Halborn and Quill audits "cover the dUSD and sdUSD contracts. Do not present them as an audit of the agent wallets… or of the whole platform." Keep "audited" out of the Superstar film.
12. **Don't show unlaunched products as available.** That covers dUSD (waitlist only), Hyperyields Optimizer, Options, SIP/SWP and Predictive Markets agents.
13. **Custody wording:** say "self-custodial" or "non-custodial settlement", "scoped, revocable session keys", "the agent trades; it cannot withdraw". Don't imply Deploy holds the funds.
14. **Withdrawals:** if "withdraw anytime" is used, keep it at "Pause or withdraw anytime" as on the landing page. Partial withdrawals are not supported in-app.
15. **Company name:** "Deploy Finance" (the AI-info guidance says always use this). The wordmark itself reads "Deploy".
16. **Jurisdiction:** add "May not be available in all jurisdictions" to the end card.

### 2.6 Inconsistencies spotted in the sources (resolve before scripting)
- Signal groups: the docs list 18 inputs in 5 lenses (the text says "four lenses"). The landing page and blog show "18 inputs · 6 groups". AI-info says 5 categories.
- Loop: the landing copy says "five steps", but the page shows 4 (Review, Decide, Protect, Wait). The docs have a different 4-step loop.
- Winners: the docs say 366 winners and 322 losers. The landing donut shows 293 + 71 winners, 322 stopped out and 2 expired flat.
- Asset scope: the blog, AI-info and homepage card say "BTC · ETH · SOL · HYPE perps". The current docs say spot, perps, HIP-3 and select outcome markets. The backtest itself was **BTC only**.
- The general FAQ says the service is free ("So it is free? Yes."), which conflicts with Superstar's 1–10 bps builder fee.

---

## 3. Brand

### 3.1 Logo files saved (`/home/user/Experimental-Repo/superstar/assets/brand/`)
| File | What it is |
|---|---|
| `deploy-lockup-indigo-mark-black-text.svg` (+ `@2000w.png`) | Primary lockup: indigo #474DEF rounded-square mark and black "Deploy" wordmark. 990×225. Same file as the site header logo and docs `logo.svg`. |
| `deploy-lockup-indigo-mark-white-text.svg` (+ `@2000w.png`) | Lockup for dark backgrounds: indigo mark and white wordmark (docs `logo-light.svg`). |
| `deploy-wordmark-white.svg` (+ `@2000w.png`) | Wordmark only, white, no mark (site footer asset). |
| `deploy-wordmark-black.svg` (+ `@2000w.png`) | Wordmark only, recoloured #0D0D14 (derived). |
| `deploy-mark-indigo.svg` (+ `@1024.png`) | Mark only, #474DEF (extracted from the lockup). The mark is a rounded square with a knocked-out stylised "D" split by a diagonal leaf or blade. |
| `deploy-mark-white.svg` (+ `@1024.png`) | Mark only, white (derived). |
| `deploy-favicon-tile.svg` (+ `@1024.png`) | App icon: #474DEF rounded tile (rx 32) with the white mark (docs favicon). |
| `deploy-favicon.png` (32×32), `deploy-webclip.png` (256×256), `docs-favicon.ico` | Site favicon and webclip. |
| `og-image.webp` / `og-image.png` (2400×1260) | Homepage OG card: the lockup above "Move into Productive Capital" in Season Sans, on white. |
| `docs-og-card-1200x630.png` | Docs OG card: indigo-to-blue gradient, white lockup, "Self-custody wallets and autonomous trading agents", cyan underline, "Income: Funding Rates · Super Perps · Proof of Reserves". |
| `menu-deploy-lottie.json`, `deploy-graph.lottie` | Site Lottie animations (menu icon, homepage graph). |
| `deploy-logo-black.svg`, `deploy-logo-white.svg` | A 607×138 lockup. **Not downloaded by this research pass**: they were already in the folder, probably placed by another agent, and were left as-is. |

Product imagery (`/home/user/Experimental-Repo/superstar/assets/brand/product-imagery/`). These are the launch-post diagrams, still labelled "super-perps":
- `super-perps-signal-bus-18-inputs.png`: 6 groups flow into a glowing particle-sphere core and a "DECISION: SHORT · LIVE · LOCKED" card.
- `super-perps-three-rules.png`: three rule cards (01/02/03, Season Serif numerals).
- `super-perps-risk-engine-trailing-stop.png`: entry, fixed loss limit and a stepped trailing stop ("ratchet up only").
- `super-perps-backtest-equity.png`: $100k to $271,465 equity curve with the -13.6% max drawdown bracket.
- `super-perps-pnl-by-side.png`: short +$130,427 (544) vs long +$41,038 (144).
- `blog-header-next-frontier-yield-products.png`: glassy card with an indigo blur aura.

These are the visual template for the film's motion graphics. The same live, animated versions (signal bus, agent loop, trade lifecycle, backtest dashboard) run on https://deploy.finance/superstar, and the `deploy-diagrams` skill reproduces this style. No real app UI screenshots are published anywhere.

### 3.2 Fonts found (`/home/user/Experimental-Repo/superstar/assets/fonts/`)
All are served publicly from the Webflow CDN via `deploy-lp.webflow.shared.46a3c6f59.css`.

| Role on site | Family (CSS name) | File(s) saved | Licence |
|---|---|---|---|
| Body and all headlines (H1 weight 500, letter-spacing -2px, line-height 0.84; H2 500, -0.02em, 1.08) | **Season Sans** (`Seasonsans`) | `SeasonSans-Regular.woff2` (400), `SeasonSans-Medium.woff2` (500) | Commercial: Displaay Type Foundry, designer Martin Vácha |
| Accent words in headlines (in indigo, e.g. "An intelligent agent, trading **_both sides for you._**"), big numerals and stats ($271,465, 01/02/03, APY) | **Season Serif** (`Seasonserif`) | `SeasonSerif-Regular.woff2` (400), `SeasonSerif-Medium.woff2` (500) | Commercial: Displaay |
| Eyebrows, HUD labels, diagram labels, captions, data | **Geist Mono** (`Geistmono`) | `GeistMono.woff2` (variable 100–900) | OFL (Vercel / Basement.studio) |
| Fallback in inline diagram embeds (`'Inter',system-ui,sans-serif`); some embeds also use JetBrains Mono | Inter | not self-hosted by Deploy | OFL |

**Season fonts WERE downloadable.** Their embedded licence says: "you should not modify, reassemble, rename, store on publicly accessible servers, redistribute, or sell them." Rules for the film:
- Use the Season files only for local rendering.
- Don't commit them to a public repo. I added `superstar/assets/fonts/.gitignore` to exclude `Season*.woff2`.
- Confirm with Deploy that their licence covers video use.

OFL stand-ins are downloaded in `assets/fonts/standins/`:
- `Fraunces-Variable-latin.woff2` and `Fraunces-400-latin.woff2`, standing in for Season Serif.
- `Inter-Variable-latin.woff2`, `Inter-400-latin.woff2` and `Inter-500-latin.woff2`, standing in for Season Sans.

Typographic signatures:
- Eyebrows: Geist Mono, 12px, UPPERCASE, letter-spacing .18em, colour #474DEF.
- Kicker pill: Geist Mono uppercase in #474DEF, a white/80% pill with a #DCDDF6 border, and a cyan #00E2E2 dot.
- Diagram header bar: lowercase mono with middle dots, e.g. "superstar · signal bus" on the left and "18 inputs · 6 groups · 1 decision" in light grey on the right, with a pulsing indigo dot.

### 3.3 Colours
Core brand tokens (the Webflow `:root` block):
- `--blue: #474DEF` (Deploy Indigo: logo mark, CTAs, eyebrows, serif accents)
- `--black: #000`
- `--white`
- `--light-blue: #DEE5FF`
- `--light-grey: #E2E8F0`
- `--grey: #64748B`
- `--green: #22C55E`

Superstar page and diagram tokens (inline CSS on /superstar):

| Token | Hex | Use |
|---|---|---|
| --ink | #0D0D14 | primary text, big serif numbers |
| headline ink | #131313 | H2 colour; also the docs theme-color |
| --accent | #4B4FB0 | diagram strokes, bars |
| --accent-bright | #5B61E0 | live dot, highlight bar, glows |
| --accent-soft | #8487D6 | secondary strokes |
| --accent-deep | #33367A | dark indigo (target-hit, deep fills) |
| indigo alt | #6366F1 / #4338CA | stat numerals (#6366F1); homepage hero "Brand Accent #4338CA" |
| --body | #6E6E84 | body copy |
| --label | #8A8BA3 | mono labels |
| --muted / --neutral | #9A9AAB | muted text |
| --neutral-soft | #C6C7D4 | losing bars, stopped-out |
| --neutral-pale | #DBDCE6 | pale fills |
| --border | #E6E7F2 (cards), #E8E8F1 / #ECECF4 (viewports, dividers) | hairlines |
| page bg | #F6F6FE (body); hero gradient #F6F6FF → #FFFFFF | background |
| viewport card | radial #FFFFFF → #F1F1FA; radius 24px; shadow `0 50px 100px -60px rgba(70,70,130,.4)` | diagram cards |
| cyan accent | #00E2E2 | kicker dot, hero aura, docs OG top rule |
| positive | #1E9E5C / #2FBF71 / #22C55E | gains, check badges |
| negative | #D3453C / #E5544B / #C9524A | losses |
| long bar (image) | #A6ABFF (light indigo) vs short bar #474DEF; image canvas bg #EEF0F7 | P&L by side |
| coin icons | BTC #F7931A, ETH #627EEA, SOL #9945FF, HYPE #50D2C1 | "Now watching" |

- The hero background combines `radial-gradient(80% 60% at 85% 20%, #00e2e224, transparent 55%)`, `radial-gradient(70% 50% at 10% 0, #474def1f, transparent 50%)` and `linear-gradient(#f6f6ff, #fff 70%)`.
- A second hero variant uses a blurred #7E86F5 glow and a faint indigo ripple (`repeating-radial-gradient` of #474DEF at 9% alpha).
- Overall look: light, airy, lavender-white, with the indigo accent used sparingly. It is **not** a dark "crypto neon" aesthetic. The docs and OG cards use an indigo → royal-blue gradient with white type as the "dark" option.

Motion cues on the site: GSAP with ScrollTrigger and SplitText (text reveals), a Unicorn Studio / three.js WebGL hero ("DEPLOY_ENGINE_V2.6" HUD), SVG flows that draw on, travelling pulses, a pulsing live dot (2.4s), count-up numbers, and stops that step up like a ratchet.

### 3.4 Taglines and hero copy
- **Brand:** "**Move Into Productive Capital**" (homepage H1 and OG image). Sub: "Access a curated marketplace of institutional grade trading agents. Fund one account, allocate across autonomous agents, and earn one blended yield. Non custodial and audited." (Platform copy: do not apply "yield" or "audited" to Superstar.)
- Docs brand line: "Self-custody wallets and autonomous trading agents".
- **Superstar hero:** kicker "Super Perps is now Superstar". H1 "**An intelligent agent, trading _both sides for you._**" (the second half is in Season Serif, indigo).
- Superstar hero stats: "+171% backtest return · 3 market types · 24/7 always on".
- Section headlines on /superstar:
  - "Trained intelligence. Every trade, handled by your agent."
  - "The same disciplined loop, around the clock."
  - "Risk first. Then the trade."
  - "Three rules that don't bend"
  - "Backtested through the ups, the downs, and the chop."
  - "Fund it. Deploy it. Step away."
- Micro-lines:
  - "Nothing is a valid move."
  - "If the risk doesn't fit, the trade doesn't open."
  - "One loud signal can't talk the agent into a bigger bet."
  - "solved, not guessed"
  - "You never touch a chart."
  - "Shorts carried the crash"
  - "Both directions worked"
  - "USDC in, USDC out."
  - "The name changed; the agent you deploy did not."
- Older Super Perps card (homepage): "**Hunt moves. Long or short.**" / "Best when: You want crypto trend exposure, handled for you". Platform line: "Growth agent. Income agent. Same wallet."

### 3.5 Tone of voice
- **Calm, exact and disciplined.** The voice sounds like a systematic desk explaining its rules, not a hype bot. It favours short declarative sentences, often in pairs or triplets: "Risk first. Then the trade." / "Fund it. Deploy it. Step away."
- **Restraint is the hero.** Sitting out is framed as skill: "Nothing is a valid move", "More often than not, it waited", "The flat state is a genuine output, not a fallback".
- **Mechanical, not emotional.** The copy uses phrases like "solved, not guessed", "not from conviction or gut feel", "do not sleep, do not tilt", "no revenge trades" and "Most losing trades end the same quiet way, at their stop."
- **Honest qualifiers are built into the copy, not hidden in small print:** "Simulated, not a promise", "Can it lose money? Yes."
- **Institutional credibility:** "institutional grade", "curated by Deploy", "proprietary infrastructure live since 2018", "closer to an institutional systematic desk than a retail bot".
- **Data-HUD texture:** lowercase mono labels with middle dots ("superstar · agent loop · spot · perps · HIP-3"), console prompts ("› reviewing 18 signals across 6 groups…"), and state words in caps (LONG / SHORT / NO TRADE / LIVE / LOCKED).
- **Avoid:** moon or lambo energy, "guaranteed", "passive income", "risk-free", superlatives about returns, and any urgency or FOMO.

---

## 4. Other useful references
- Superstar landing page (best visual reference, live animated diagrams): https://deploy.finance/superstar
- Webflow CSS: https://cdn.prod.website-files.com/693bdee7f0ee6ad3d8a6fb06/css/deploy-lp.webflow.shared.46a3c6f59.css
- AI-info page (compliance guidelines for describing Deploy; older Super Perps facts): https://deploy.finance/ai-info
- Socials: X @DeployFinance (docs cite @deployfinance), Telegram t.me/DeployFinanceAnnouncements, LinkedIn /company/deploy-finance. App: https://app.deploy.finance
- Team line (FAQ): "More than 10 fintech and banking veterans bridging DeFi and TradFi, with advisors from JPMorgan, FalconX, and BitGo."

---

## Appendix A: Verbatim docs pages (captured 2026-09-25)

### Source: https://docs.deploy.finance/products/agents/superstar/overview

#### Overview

_Formerly Super Perps._

September 2026 update: Super Perps is now Superstar

Super Perps is now Superstar. The name changed; the agent you deploy did not.

It started with perpetuals. It now trades spot, perpetuals, and HIP-3 markets, and takes outcome-market positions selectively, only when there is a clear winner.

Its post-launch stabilization window has also ended. For its first 30 days the agent ran with position sizing deliberately capped while its live behavior, edge cases, and execution were watched across real market conditions. That cap is now off: full sizing and the full market set are unlocked.

Superstar is an autonomous directional trading agent. It trades spot, perpetuals, and HIP-3 markets, going long, short, or staying flat, and takes outcome-market positions selectively when there is a clear winner. It sizes every position from a fixed loss budget and manages each trade to exit.

Where Income: Funding Rates earns by staying market neutral, Superstar picks a direction.

Execution runs on Hyperliquid, spanning spot, perpetuals, and HIP-3 markets, plus outcome markets when there is a clear winner. Settlement is non-custodial with sub-second finality. USDC in, USDC out.

The agent usually keeps most of the balance working, often in the range of 60 to 70 percent, and runs more than one strategy at once. It might build a spot position in a major asset and rebalance it over time while trading directionally on perpetuals, so a mix such as spot and perpetuals, or HIP-3 and perpetuals, is common. Whether a given trade fills depends on the market. Risk is handled per trade: each position carries its own loss boundary, and most trades are short-term rather than swings.

Minimum balance: $10,000

Superstar requires **$10,000 USDC** to get started as part of the initial and safe agent rollout. This is working capital that funds the agent's positions, not a fee.

##### Backtest results

These are simulated results

Every Superstar figure comes from a backtest replaying the strategy over historical data. It is not a record of live trading. The backtest does not fully model exchange fees, price movement inside each four-hour window, partial fills, or execution delay, so live results can differ.

The backtest ran on Bitcoin, which has the longest clean price history for a test of this kind. Bitcoin climbed from roughly $104,000 to about $124,000, then fell to near $63,000.

The strategy finished positive through both halves.

| Metric | Backtested result |
|---|---|
| Starting balance | $100,000 |
| Ending balance | $271,465 |
| Total return | 171.46% |
| Filled trades | 688 |
| Resolved trades profitable | 52.3% |
| Maximum drawdown | 13.6% |
| Reviews ending in no trade | 1,350 of 2,298 |

Both directions finished in profit, with shorts carrying much of the back half. Roughly $1.27 came back for every $1 the losing trades gave up, from 366 winners against 322 losers.

---

### Source: https://docs.deploy.finance/products/agents/superstar/how-it-works

#### How it works

Superstar runs on a fixed schedule.

Every four hours it takes a fresh read of current market data and makes one decision: open a long, open a short, or stay out of the market.

It works across spot, perpetuals, and HIP-3 markets on Hyperliquid, taking a position wherever the read is strongest, and takes outcome-market positions selectively when there is a clear winner. The market read below covers the signals it weighs on the leveraged markets.

It carries no view from prior cycles and does not wait for you to confirm anything.

In the backtest it declined to trade on 1,350 of 2,298 reviews.

##### The decision loop

Every four hours, the agent walks the same four steps on the current market state. Each step has a clear output that feeds the next one.

| Step | What it does | Output |
|---|---|---|
| 1. Read the last four hours | For each input, lay out where the reading stood 3 hours ago, 2 hours ago, 1 hour ago, and now. | Time-series of the last four hourly prints |
| 2. Synthesize a picture | Map price and OI quadrant, order-book lean, liquidation clusters, funding and volume trends. Missing feeds are marked and weighted down. | A composite market state across the four quadrants |
| 3. Argue both sides | Write an explicit bull case and bear case, each with concrete points and the exact level that proves the idea wrong. | Two opposing theses with hard invalidation levels |
| 4. Choose a direction | Long, short, or no trade. Carries a rough probability, entry plan, invalidation level, and what would justify adding. | A decision plus the plan to act on it |

When the cases are close or the data is thin, the verdict is **no trade**.

##### Market inputs the agent weighs

The agent reads the market across four lenses. Each lens contributes a handful of measurable inputs.

###### Price context

| Input | What it captures |
|---|---|
| Price 1h close | The anchor for the current read |
| 1h high | Where price was pushed and rejected in the last hour |

###### Positioning and leverage

| Input | What it captures |
|---|---|
| OI 1h close | How much leveraged money is in the market |
| OI delta last hour | Whether positioning is building or unwinding |
| Realized funding | Which side has paid funding recently |
| Indicative funding | Which side will pay on the next settlement |

###### Forced buying and selling

| Input | What it captures |
|---|---|
| Long liquidation pool | Where crowded longs would be force-closed |
| Short liquidation pool | Where crowded shorts would be force-closed |
| Long liquidations 1h realized | Where forced long-closes already fired |
| Short liquidations 1h realized | Where forced short-closes already fired |

###### Order flow and pressure

| Input | What it captures |
|---|---|
| Buy volume 1h | Whether real buying is behind a move up |
| Sell volume 1h | Whether real selling is behind a move down |
| Bid/ask ratio 0 to 2% | Order-book micro-pressure |
| Daily CVD | Cumulative volume delta over the trading day |

###### Whales versus retail

| Input | What it captures |
|---|---|
| Whale-retail delta | Where large accounts differ from the crowd |
| Global retail long/short | The crowd direction across all users |
| True retail long/short | The crowd direction excluding market makers |
| Top trader long/short | Where the largest accounts sit |

The agent uses these inputs as cross-market confirmation across exchanges, timeframes, and options conditions.

##### Risk management

Risk is part of the decision to trade. If the risk does not fit, the trade does not open.

| Rule | How it works |
|---|---|
| Loss limit set before entry | The maximum loss is decided before the trade opens and is never widened afterward |
| Position size comes from the limit | Sizing is mechanical. Size follows the loss limit, not the conviction in the idea |
| Stop only moves to protect capital | The stop trails behind price as a trade works. It never widens to give the trade more room |

There are no revenge trades after a loss. Most losing trades end the same quiet way, at their stop.

---

### Source: https://docs.deploy.finance/products/agents/superstar/who-is-it-for

#### Who is it for?

Superstar suits capital that wants directional crypto exposure without trading it by hand.

##### It fits you if

  * You want exposure to market direction (either up or down).
  * You accept that a directional strategy has losing trades and losing months, and you judge it over a cycle rather than a week.
  * You have at least $10,000 in working capital.
  * You want a fixed risk framework more than discretion, and you accept the agent will sit out most reviews if conditions don't confirm an entry.

##### It is probably not for you if

  * Capital preservation is your first objective. Superstar profits from price movement, which means it can also lose from it. Consider [Income: Funding Rates](https://docs.deploy.finance/products/agents/income-funding-rates/overview) if you are looking for stable and steady yields over longer periods of time.
  * You want to approve trades or override the agent. It decides and acts on its own schedule.
  * You would be deploying money you cannot afford to see draw down.
  * You are below the $10,000 minimum.

---

### Source: https://docs.deploy.finance/products/agents/superstar/risks

#### Risks

Superstar is not market neutral. Its risk profile should not be conflated with Income: Funding Rates.

**Directional market exposure.** The agent can take the wrong directional view. Adverse price movement directly generates losses. To help mitigate this, Superstar sets a loss limit before entry.

**Leverage.** Positions in perpetuals and HIP-3 markets use leverage, which amplifies both gains and losses. To help mitigate this, Superstar calculates the position size from a fixed loss budget, so a strong signal does not produce an oversized position.

**Model and signal.** The inputs and decision framework may fail to identify direction correctly, or may behave differently in conditions not represented in the agent's historical analysis. To help mitigate this, Superstar takes no position with just a single confirmation. The agent acts only when several independent readings agree, and treats disagreement as a reason to stay out.

**Execution.** Slippage, fees, liquidity, and execution delays can cause realized results to differ from the agent's intended entry, stop, or exit levels. To help mitigate this, Superstar executes on Hyperliquid, chosen for deep liquidity and sub-second finality.

**Stop-loss limits.** Position sizing comes from a predefined loss budget and stops are set before entry. These controls reduce rather than eliminate the possibility of loss. To help mitigate this, Superstar sets the stops before entry and never widened afterward, and they move only in the direction that protects capital.

---

### Source: https://docs.deploy.finance/products/agents/superstar/dynamic-builder-fees

#### Dynamic Builder Fee

Superstar does not charge a flat builder fee. For each trade the agent sets its own fee, between 1 and 10 bps, reflecting how much its signal and execution contribute to that particular trade.

##### What the fee pays for

| Range | Meaning |
|---|---|
| 1 bps (floor) | Routine signals, defensive trades, exits and protective moves |
| 10 bps (ceiling) | Strong, rare or time sensitive signals, particularly in trending or breakout conditions |
| Anywhere between | Reflects how much the agent's signal and execution add to that specific trade |

The fee reflects value, not volume. Users pay more only where the agent brings more edge.

##### How the agent decides

Four inputs together decide the fee for each trade. None of them overrides the others. The agent weighs all four and picks a single bps number in the 1 to 10 range.

###### Signal strength and regime

| Signal condition | Fee position |
|---|---|
| Routine signals in quiet, range bound conditions | Near the lower bound |
| Stronger, rarer, or more time sensitive signals in trending or breakout conditions | Near the upper bound |
| Several independent signals converging on the same call | Higher than a single factor call |

###### Trade type

| Trade type | Fee position |
|---|---|
| Exits, stop losses, hedges, and other risk-reducing moves | At the minimum |
| New positions driven by the agent's own analysis | Higher (this is where the work is done) |

Users should never be discouraged from managing risk by the cost of doing so.

###### Execution difficulty

| Execution characteristic | Fee position |
|---|---|
| Standard liquidity, single leg trades | At the minimum |
| Less liquid markets | A little higher |
| Multi leg trades | A little higher |
| Larger baskets | A little higher |

###### Trade size

Larger trades generally pay a lower rate, so that the amount paid remains proportionate as size increases.

##### The fee is costed before entry

The fee is part of the trade test, not something reconciled afterwards.

Each trade is evaluated net of its own fee. A setup whose expected move does not clear the fee is not taken. This means:

  * A weak signal never earns a high fee because the setup does not pass the entry test in the first place.
  * A strong signal that does not clear its own fee is skipped, not taken at a loss.
  * The fee is a friction to mispricing, not a tax on the user.

##### Principles

| Principle | What it means |
|---|---|
| Paid by value | Users pay more only where the agent brings more edge |
| Always visible | Every fee is recorded against its trade in the activity feed, with a short note on why it was set |
| Capped | The fee never exceeds the approved maximum |
| Automatic | No plans or tiers to select. The agent sets the fee on each trade |
| Costed before entry | A trade that does not clear its fee is not taken. The fee is part of the entry test |

---

### Source: https://docs.deploy.finance/products/agents/superstar/faq

#### FAQ

####### What is the minimum to deploy?

$10,000 USDC.

####### Which markets does it trade?

Spot, perpetuals, and HIP-3 markets, primarily on Hyperliquid. It also takes outcome-market positions selectively, only when there is a clear winner.

####### How often does it trade?

It reviews every four hours and does not trade on every review.

####### Why the agent hasn't take no positions at all?

Staying out is one of the three things the agent can decide to do. No open position means the current readings aren't strong enough to justify a direction, and the agent is waiting for a clearer signal.

####### How much activity should I expect when the market is range-bound?

Less than usual. When price action is flat and volatility is compressed, there are fewer setups that clear the agent's threshold, so you should expect fewer trades.

####### Where can I see the stop-loss on my Superstar position?

The agent posts stop-loss orders as your entry limit orders fill — not at the moment the trade is opened.

If you're looking at a position where only some of the entry orders have filled, you'll see a range of limit orders and a take-profit, but no stop-loss on the book yet. That's expected. Once the majority of the entry orders fill, the agent posts the stop-loss and you'll be able to verify the level.

####### Can it lose money?

Yes. It is a directional strategy, but every position carries a loss limit set before entry, and position size is calculated from that limit to stop losses at entry.

####### Does it go short?

Yes, the agent can go long, short, or flat.

####### Can I tell it what to trade?

No. The agent decides direction, asset, size, and timing within its framework.

####### Where does it execute?

On Hyperliquid, across spot, perpetuals, and HIP-3 markets, plus outcome markets when there is a clear winner. Settlement is non-custodial with USDC in and USDC out.

####### Does it earn funding like the other agent?

No. Superstar profits from price movement and direction, not from the funding premium.

---

### Source: https://docs.deploy.finance/products/agents/execution

#### Execution

Agents execute on decentralized perpetual markets. **Hyperliquid** is the primary exchange for Income: Funding Rates and Superstar, chosen for non-custodial settlement and sub-second finality.

##### Chains

| Chain | Role |
|---|---|
| Hyperliquid | Primary decentralizer exchange for both agents |
| Arbitrum | The chain where you deposit USDC from an external wallet to arrive on Deploy Finance |

More chains may be added as new strategies launch.

##### Assets

**USDC** is the funding and settlement currency for both agents, and the only stablecoin used in Income: Funding Rates and Superstar.

**Large-cap assets** (BTC, ETH, SOL, HYPE) anchor funding capture, selected for deep liquidity and sustained periods of positive funding. Superstar trades directionally across a wider set: spot, perpetuals, and HIP-3 markets, plus outcome markets when there is a clear winner.

##### Cross-chain deposits

When you deposit from a chain other than the one a strategy runs on, Deploy Finance bridges your assets to the target chain. In practice that usually means USDC arriving on Arbitrum and bridging to Hyperliquid.

##### Whitelisted protocols

Agent wallets whitelist the protocols an agent may touch: Hyperliquid.

An agent cannot send assets to another wallet and cannot interact with a protocol outside that list.

Additional non-DEX protocols may be enabled later, with an announcement beforehand.

##### Timing

After depositing your stablecoins, an agent may take a few hours before deploying capital to the strategy. This allows for the agent to enter only during the best market conditions where liquidity is deep and slippage is avoided.

---

### Source: https://docs.deploy.finance/products/agents/how-to-choose

#### How to choose?

Both agents run under the same wallet model. You can deploy one agent, or split funds across them.

|  | Income: Funding Rates | Superstar |
|---|---|---|
| Objective | Steady yield in USDC | Growth from price moves |
| Market stance | Market neutral | Directional |
| Relative risk | Lower | Higher |
| Return source | Funding payments | Price direction |
| Markets | HYPE spot and perpetual | Spot, perps, HIP-3; select outcome markets |
| Denomination | USDC | USDC |
| Minimum | $100 USDC required | $10,000 USDC required |

##### A simple way to decide

  * **I want my USDC stablecoins to generate yields without betting on price** → Income: Funding Rates.
  * **You want handled exposure to crypto direction** → Superstar.
  * **You want both, with no single strategy carrying all the risk** → split the allocation.

---

### Source: https://docs.deploy.finance/products/agents/fees

#### Fees

There is no subscription and no upfront cost to use Deploy Finance.

Agents generate revenue from trade fees and referral fees rather than by charging a percentage of your deposits.

##### What you pay

Nothing. No sign-up cost, no monthly cost, no management fee on deposits.

##### Per-agent fees at a glance

| Agent | Builder fee | Range | When fees apply |
|---|---|---|---|
| Funding Rate Agent | None | — | You only pay standard blockchain gas and any fee charged by the underlying exchange. |
| Superstar | Dynamic, set per trade | 1 to 10 bps | The agent decides each time, based on signal strength, trade type, and execution difficulty. |

##### Funding Rate Agent

The Funding Rate Agent charges nothing additional for using the strategy. You only pay standard blockchain gas for the trades it executes and any fee charged by the underlying exchange.

| What you pay | Amount |
|---|---|
| Sign-up fee | None |
| Monthly fee | None |
| Management fee on deposits | None |
| Builder fee | None |
| Trade execution (gas) | Standard blockchain gas for each on-chain transaction |
| Exchange fee | Whatever the underlying venue charges |

##### Superstar

Superstar does not charge a flat builder fee. For each trade the agent sets its own fee, between 1 and 10 bps, reflecting how much its signal and execution contribute to that particular trade.

###### What moves the fee

| Variable | Lower fee | Higher fee |
|---|---|---|
| Signal strength and regime | Routine signals in quiet, range bound conditions | Stronger, rarer or more time sensitive signals in trending or breakout conditions |
| Signal convergence | Single factor call | Several independent signals pointing the same way |
| Trade type | Exits, stop losses, hedges and other risk-reducing moves | New positions arising from the agent's own analysis |
| Execution difficulty | Standard liquidity, single-leg trades | Less liquid markets, multi leg trades, larger baskets |
| Trade size | Larger trades (paid at a lower rate so the dollar amount stays proportionate) | Smaller trades (proportionally higher rate) |

The fee is evaluated net of its own cost before entry. A setup whose expected move does not clear the fee is not taken, so the fee forms part of the entry test rather than something reconciled afterwards.

###### Fee principles

| Principle | What it means |
|---|---|
| Paid by value | Users pay more only where the agent brings more edge. |
| Always visible | Every fee is recorded against its trade in the activity feed, with a short note on why it was set. |
| Capped | The fee never exceeds the approved maximum. |
| Automatic | No plans or tiers to select. The agent sets the fee on each trade. |
| Costed before entry | A trade that does not clear its fee is not taken. The fee is part of the entry test. |

For the full breakdown see [Dynamic Builder Fee](https://docs.deploy.finance/products/agents/superstar/dynamic-builder-fees).

---

### Source: https://docs.deploy.finance/risks

#### Risks

Every trading strategy carries the inherent risk of loss, including loss of funds. Deploy Finance's design mitigates and controls several risk categories.

**Market neutral and self-custodial do not mean risk free.**

The agents have different custody models and different risk profiles. They should not be described as sharing the same risks.

##### What Deploy Finance removes

  * **Centralized exchange custody.** Assets stay in your wallet, removing exchange insolvency and withdrawal-freeze exposure.
  * **Vaults.** Funds are held by your wallet, not pooled in a contract, removing rug-pull and honeypot exposure on the deposit path.
  * **Agent withdrawal.** Session keys are scoped to trading and revocable only by you.

##### Platform risks

These apply to both live agents, and they are the risks of using any onchain platform.

**Agent execution.** An autonomous agent may execute incorrectly, fail to react as intended, or suffer an operational failure resulting in losses. The system is distributed and has run through every major market event since 2018, but a system-wide failure would leave agents unresponsive for a window.

**Exchange and blockchain.** Downtime, congestion, exploits, or protocol failures may prevent positions from being opened, managed, or exited as intended.

**Smart contract.** Vulnerabilities in protocols an agent uses can cause losses even though your wallet remains self-custodial. To hepl mitigate this, agents can only interact with a whitelisted protocol set (for now only Hyperliquid).

**Liquidity and execution.** Market stress widens spreads and slippage and makes it harder to enter, rebalance, or exit at expected prices. To help mitigate this, agents trade large-cap assets with deep liquidity and analyze markets for liquidity before positioning.

**Wallet and key management.** You remain responsible for access to your wallet. Session-key or credential compromise, user error, or wallet infrastructure failures can affect access or strategy operation. To help mitigate this private keys are never stored whole. Each is split into three encrypted shares and reconstructed only briefly inside a trusted execution environment. Session keys are scoped to trading and revocable at any time.

**Third-party infrastructure.** Service disruption or a security failure at a wallet or venue provider can affect agent operation. To help mitigate this wallet infrastructure is provided by Privy, and your keys remain exportable, so you keep a path to your funds independent of any provider.

**Market manipulation.** Malicious actors may attempt to manipulate prices on the exchanges where agents trade. To help mitigate this, agents trade deep, and only large-cap markets, where manipulation is materially harder and more expensive to attempt.

**Regulatory.** Changes to laws covering crypto assets, derivatives, autonomous trading, or the protocols an agent uses may affect a strategy's availability or operation.

##### Security

  * **Agent wallets.** Non-custodial, with key sharding and revocable session keys.

---

### Source: https://docs.deploy.finance/resources/legal-and-disclaimers

#### Legal & disclaimers

Projections are estimates only. Not investment advice. Past performance does not predict future results.

##### Use of this documentation

This documentation is published for informational purposes. It describes how Deploy.Finance works, the strategies available, and the risks involved. It is not a solicitation to invest.

##### No financial advice

Nothing in this documentation constitutes investment, financial, legal, or tax advice. You should consult a qualified professional before making financial decisions.

##### Estimates, not guarantees

All yield numbers, APY figures, and projected returns shown anywhere in this documentation are estimates. They depend on market conditions, liquidity, protocol behavior, and other factors outside Deploy.Finance's control. Actual results may differ materially.

##### Jurisdictional restrictions

Deploy.Finance may not be available in all jurisdictions. You are responsible for understanding the laws and regulations applicable to you before using the service. See the [Terms of Service](https://docs.deploy.finance/resources/terms-of-service) and [Privacy Policy](https://docs.deploy.finance/resources/privacy-policy) for the full legal framework.

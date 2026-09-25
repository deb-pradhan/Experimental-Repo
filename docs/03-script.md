# HireHouse — Launch Film · Script (locked v1)

Rule (client): nothing that is not an existing HireHouse feature or its core idea.
Every line below maps to an approved claim from `01-director-brief.md §3.1`
(1 read · 2 ranked on merit · 3 structured video interview + integrity checks · 4 shortlist ·
5 human decides · 6 "Hiring, decided on merit." · 7 brand / end-card meta · P problem framing).

VO: 45 words · calm, confident, plain-spoken · ~2.4 words/sec with real pauses.
Pronunciation: **HireHouse** is one word, stress on HIRE (HIRE-house).

---

## 1. Scene by scene

| Scene | Window | VO (target start · est. dur) | Super (lands on) | Chips | Claim |
|---|---|---|---|---|---|
| S1 The Pile | 0.0–4.0 | "One role." (0.6 · 0.8s) / "Hundreds of applications." (1.9 · 1.5s) | **One role.** (0.6) → counter `312 applications` (2.0) | — | P |
| S2 The Filter | 4.0–8.0 | "Most are cut by a keyword filter. Unread." (4.4 · 2.9s) | **Most are never read.** (5.0) | `Keyword filter` | P |
| S3 The Read | 8.0–12.0 | "HireHouse reads every one." (8.9 · 1.6s) | **Every application, read.** (9.0) | `HireHouse` `Every application` | 1 |
| S4 Ranked | 12.0–16.0 | "Ranks them on merit. Skills and fit, not keywords." (12.3 · 3.3s) | **Ranked on merit, not keywords.** (12.25) | `Ranking` `Skills and fit` | 2 |
| S5 Interview | 16.0–20.0 | "A structured video interview, with integrity checks." (16.3 · 2.9s) | **Interviewed for real.** (16.25) | `Interview` `Integrity checks` | 3 |
| S6 Shortlist | 20.0–24.0 | "Then, a shortlist." (20.3 · 1.2s) / "You make the call." (22.1 · 1.2s) | **A shortlist, not a pile.** (20.25) → **You make the call.** (22.0) | `Shortlist` `Interview-verified` | 4 · 5 |
| S7 Climax | 24.0–27.0 | "Hiring, decided on merit." (24.4 · 1.9s) | **Hiring, decided on merit.** (word by word from 24.25) | — | 6 |
| S8 End card | 27.0–30.0 | "HireHouse." (27.6 · 0.7s) — lands with the tie | Tagline lockup (official SVG) · footer `hirehouse.xyz` · `UAE · India` | — | 7 |

## 2. UI microcopy (kit vocabulary only)

**S1 counter:** `QA ENGINEER · APPLICANTS` `0000 → 0312` (JetBrains Mono)

**S2 filter:** label `KEYWORD FILTER` · keyword tags `"Selenium"` `"5+ years"` `"ISTQB"`

**S4 table** — window title `Applicants · QA Engineer` · count badge `312` · columns `Candidate` `Stage` `Fit` `Score`.
Rows start in application order, then re-sort by Score. Top three flip Stage `Applied → Invited`.

| Applied # | Candidate | Fit | Score | Rank after sort |
|---|---|---|---|---|
| 1 | Prabhjot Singh | 54% | 74 | 6 |
| 2 | Mariam Al Hashimi | 71% | 82 | 4 |
| 3 | Rohan Mehta | 48% | 61 | 8 |
| 4 | Aadarsh Velu | 90% | 93 | **1** |
| 5 | Fatima Qureshi | 66% | 79 | 5 |
| 6 | Rahul Murali | 84% | 91 | **2** |
| 7 | Omar Haddad | 58% | 68 | 7 |
| 8 | Sneha Iyer | 77% | 86 | **3** |

**S5 interview frame** — eyebrow `CANDIDATE` · `Aadarsh Velu` · `QA Engineer · rank 1 of 312` ·
question `Walk us through a bug you found that others missed.` · `REC 00:41` ·
switch `Anti-cheat monitoring` (on) · meters (true 0–100): `Problem solving 92` `Communication 84` `Role fit 90` ·
dark alert `✦ Session is recorded per question and checked for integrity.`

**S6 shortlist cards** (lime · lilac · yellow · blue):
`AV Aadarsh Velu · QA Engineer · 93` · `RM Rahul Murali · QA Engineer · 91` ·
`SI Sneha Iyer · QA Engineer · 86` · `MA Mariam Al Hashimi · QA Engineer · 82` ·
toast `Interview invite sent ✓`

**S8 footer:** left `hirehouse.xyz` · right `UAE · India`

## 3. VO — paste block for TTS

```
One role.
Hundreds of applications.

Most are cut by a keyword filter. Unread.

HireHouse reads every one.

Ranks them on merit. Skills and fit, not keywords.

A structured video interview, with integrity checks.

Then, a shortlist.
You make the call.

Hiring, decided on merit.

HireHouse.
```

## 4. Self-check

- [x] 45 VO words; every line fits its scene window with ≥ 0.4 s of air before the next cut.
- [x] Banned words absent (seamless, unlock, elevate, empower, journey, effortless, leverage,
      streamline, robust, cutting-edge, supercharge, harness, delve, AI-powered, algorithm, automated).
- [x] No speed promises, stats, guarantees, pricing, Fast Track, testimonials.
- [x] No em dashes on screen. Every headline is a sentence with terminal punctuation, ≤ 32 chars.
- [x] Every number is illustrative UI state (applicant count, Fit %, Score, rank, timer), never a claim.

## 5. Claim map (line → claim)

| Line | Type | Claim |
|---|---|---|
| One role. / Hundreds of applications. / 312 applications | VO / super / UI | P |
| Most are cut by a keyword filter. Unread. / Most are never read. | VO / super | P |
| HireHouse reads every one. / Every application, read. | VO / super | 1 |
| Ranks them on merit. Skills and fit, not keywords. / Ranked on merit, not keywords. | VO / super | 2 |
| A structured video interview, with integrity checks. / Interviewed for real. | VO / super | 3 |
| Then, a shortlist. / A shortlist, not a pile. | VO / super | 4 |
| You make the call. | VO / super | 5 |
| Hiring, decided on merit. | VO / super | 6 |
| HireHouse. / hirehouse.xyz / UAE · India | VO / footer | 7 |

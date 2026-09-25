import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {ramp, settle} from '../anim';
import {BLUE, C, EASE, FONT} from '../theme';
import {local, wordF} from '../timeline';
import {BODY_H, BODY_W, CardShell, Head, RuleRows, S10_CARD, STEPS, TC, TrailChart, typed} from '../components/S10_TrailChart';

// ------------------------------------------------------------------
// S10 · Risk first · three rules · trailing stop (630 f, Gray ground)
// "Risk first." (sans + serif accent) lands on "Risk comes first"; the rule list
// replaces it; one risk-engine chart carries all three rules and ends as the
// dominant image (card persists → S11 grows out of it).
// ------------------------------------------------------------------

const W16 = (w: string, n = 0) => local('S10', wordF('L16', w, n));
const W17 = (w: string, n = 0) => local('S10', wordF('L17', w, n));

export const T = {
  ...TC,
  risk: W16('risk'), // ≈107
  first: W16('first'), // ≈145
  headExit: 188,
  rowsIn: 212,
  lossLimit: W16('loss'), // ≈212
  entryWord: W16('entry'), // ≈289 (TC.entry = 289)
  never: W16('never'), // ≈356
  widened: W16('widened'), // ≈373
  size: W17('size'), // ≈438
  limit: W17('limit'), // ≈478
  stop: W17('stop'), // ≈556
  moves: W17('moves'), // ≈610
} as const;

const CUES_RAW: {at: number; kind: string; note?: string}[] = [
  {at: 22, kind: 'card_in', note: 'risk-engine card settles'},
  {at: 10, kind: 'type', note: 'dur=30 · card header'},
  {at: 30, kind: 'draw', note: 'dur=259 · pre-entry price crawls (quiet, under VO tail)'},
  {at: T.risk + 2, kind: 'swipe', note: '"Risk" rises'},
  {at: T.first + 2, kind: 'swipe', note: '"first." rises'},
  {at: T.headExit + 10, kind: 'swipe', note: 'headline exits up'},
  {at: T.rowsIn + 12, kind: 'card_in', note: 'rule rows 01/02/03 slide in'},
  {at: 230, kind: 'swipe', note: 'rule 01 fills Blue Glow'},
  {at: 206, kind: 'draw', note: 'dur=18 · loss-limit line draws across'},
  {at: 226, kind: 'whoosh', note: 'soft · chart pulls back (time + price zoom out) as the limit arrives'},
  {at: 228, kind: 'lock', note: 'loss limit locks in (before entry)'},
  {at: 289, kind: 'pop', note: 'price reaches entry · entry dot'},
  {at: 292, kind: 'draw', note: 'dur=20 · entry line'},
  {at: 306, kind: 'slide', note: 'max-loss band sweeps out'},
  {at: 318, kind: 'pop', note: 'widen handle appears'},
  {at: 340, kind: 'slide', note: 'dur=20 · limit line pulled down (tension)'},
  {at: T.snap + 2, kind: 'lock', note: 'snaps back · latch'},
  {at: T.lockBadge, kind: 'click', note: 'padlock closes on the limit'},
  {at: 374, kind: 'pop', note: 'rule 01 lock glyph'},
  {at: 450, kind: 'swipe', note: 'rule 02 fills Blue Glow'},
  {at: 446, kind: 'card_in', note: 'formula panel opens'},
  {at: 444, kind: 'whoosh', note: 'chart reframes (soft)'},
  {at: T.term1 + 6, kind: 'tick', note: 'LIMIT + fixed bar'},
  {at: T.term2 + 6, kind: 'tick', note: '÷ STOP bracket (chart bracket lights)'},
  {at: T.term3 + 6, kind: 'tick', note: '= SIZE'},
  {at: T.solve0, kind: 'tick_train', note: 'dur=34 · size bar solving (oscillates, settles)'},
  {at: T.solved, kind: 'lock', note: 'size solved · check'},
  {at: 530, kind: 'card_out', note: 'formula panel folds away'},
  {at: 540, kind: 'whoosh', note: 'chart zooms out for the climb'},
  {at: 526, kind: 'draw', note: 'dur=104 · price climbs from entry'},
  {at: 536, kind: 'pop', note: 'turquoise stop marker'},
  {at: 556, kind: 'swipe', note: 'rule 03 fills Blue Glow'},
  ...STEPS.filter((s) => s.f < 630).map((s) => ({at: s.f, kind: 'ratchet', note: `stop steps up to ${s.level}`})),
  {at: T.hold, kind: 'click', note: 'pullback · stop holds (marker ring)'},
  {at: 562, kind: 'pop', note: 'rule 03 up-arrow glyph'},
];
export const CUES = [...CUES_RAW].sort((a, b) => a.at - b.at);

/** "Risk first." — masked word rises on the VO words, one shared exit. Sans + Season Serif accent. */
const Headline: React.FC<{f: number}> = ({f}) => {
  const words: {w: string; at: number; serif: boolean}[] = [
    {w: 'Risk', at: T.risk - 7, serif: false},
    {w: 'first.', at: T.first - 7, serif: true},
  ];
  return (
    <div style={{position: 'absolute', left: 66, top: 318, display: 'flex', alignItems: 'baseline', gap: 40, whiteSpace: 'nowrap'}}>
      {words.map((x, i) => {
        const pin = ramp(f, x.at, 28, EASE.out);
        const pout = ramp(f, T.headExit + i * 3, 16, EASE.in);
        return (
          <span key={i} style={{display: 'inline-block', overflow: 'hidden', paddingBottom: '0.16em', marginBottom: '-0.16em'}}>
            <span
              style={{
                display: 'inline-block',
                transform: `translateY(${(1 - pin) * 112 - pout * 112}%)`,
                fontFamily: x.serif ? FONT.serif : FONT.sans,
                fontWeight: x.serif ? 400 : 500,
                fontSize: x.serif ? 196 : 180,
                lineHeight: 1.02,
                letterSpacing: '-0.03em',
                color: x.serif ? BLUE[500] : C.ink,
              }}
            >
              {x.w}
            </span>
          </span>
        );
      })}
    </div>
  );
};

export const S10: React.FC = () => {
  const f = useCurrentFrame();
  const drift = -14 * ramp(f, 0, 630, (t) => t);

  // card entrance (gentle, under the tail of L15)
  const cin = settle(f, 0, 40, 0.1);
  const cardY = S10_CARD.y + (1 - cin) * 110;


  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', inset: 0, transform: `translateY(${drift}px)`}}>
        {/* kicker + headline (exit before the rule list) */}
        {f < T.headExit + 30 ? (
          <>
            <Headline f={f} />
          </>
        ) : null}

        <RuleRows f={f} />

        <CardShell x={S10_CARD.x} y={cardY} w={S10_CARD.w} h={S10_CARD.h}>
          <Head left={typed('superstar · risk engine', f, 10, 0.9)} />
          <div style={{position: 'absolute', left: 0, top: S10_CARD.head, width: BODY_W, height: BODY_H}}>
            <TrailChart f={f} />
          </div>
        </CardShell>
      </div>
    </AbsoluteFill>
  );
};

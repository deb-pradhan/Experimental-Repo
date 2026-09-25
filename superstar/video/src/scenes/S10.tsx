import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {ramp, settle} from '../anim';
import {Micro, Reveal} from '../components/ui';
import {BLUE, C, EASE} from '../theme';
import {local, wordF} from '../timeline';
import {BODY_H, BODY_W, CardShell, Head, RuleRows, S10_CARD, STEPS, TC, TrailChart, typed} from '../components/S10_TrailChart';

// ------------------------------------------------------------------
// S10 · Risk first · three rules · trailing stop (630 f, Gray ground)
// "Risk first. / Then the trade." lands on "Risk comes first"; the rule list
// replaces it; one risk-engine chart carries all three rules and ends as the
// dominant image (card persists → S11 grows out of it).
// ------------------------------------------------------------------

const W16 = (w: string, n = 0) => local('S10', wordF('L16', w, n));
const W17 = (w: string, n = 0) => local('S10', wordF('L17', w, n));

export const T = {
  cardIn: 0,
  kicker: 18,
  risk: W16('risk'), // ≈107
  first: W16('first'), // ≈124
  then: 146,
  headExit: 184,
  rowsIn: 204,
  lossLimit: W16('loss'), // ≈212
  entry: W16('entry'), // ≈289
  never: W16('never'), // ≈356
  widened: W16('widened'), // ≈373
  size: W17('size'), // ≈438
  limit: W17('limit'), // ≈478
  stop: W17('stop'), // ≈556
  moves: W17('moves'), // ≈610
  ...TC,
} as const;

export const CUES: {at: number; kind: string; note?: string}[] = [
  {at: 22, kind: 'card_in', note: 'risk-engine card settles'},
  {at: 10, kind: 'type', note: 'dur=30 · card header'},
  {at: 20, kind: 'type', note: 'dur=24 · kicker THREE RULES THAT DON\'T BEND'},
  {at: 30, kind: 'draw', note: 'dur=259 · pre-entry price crawls (quiet, under VO tail)'},
  {at: 108, kind: 'swipe', note: '"Risk" rises'},
  {at: 124, kind: 'swipe', note: '"first." rises'},
  {at: 156, kind: 'impact_soft', note: '"Then the trade." lands (serif, Blue Glow)'},
  {at: 190, kind: 'swipe', note: 'headline exits up'},
  {at: 214, kind: 'card_in', note: 'rule rows 01/02/03 slide in'},
  {at: 218, kind: 'swipe', note: 'rule 01 fills Blue Glow'},
  {at: 206, kind: 'draw', note: 'dur=18 · loss-limit line draws across'},
  {at: 228, kind: 'lock', note: 'loss limit locks in (before entry)'},
  {at: 289, kind: 'pop', note: 'price reaches entry · entry dot'},
  {at: 292, kind: 'draw', note: 'dur=20 · entry line'},
  {at: 306, kind: 'slide', note: 'max-loss band sweeps out'},
  {at: 318, kind: 'pop', note: 'widen handle appears'},
  {at: 330, kind: 'tick', note: 'WIDEN? chip'},
  {at: 340, kind: 'slide', note: 'dur=20 · limit line pulled down (tension)'},
  {at: T.snap + 2, kind: 'lock', note: 'snaps back · latch'},
  {at: T.lockBadge, kind: 'click', note: 'padlock closes · NEVER WIDENED'},
  {at: 374, kind: 'pop', note: 'rule 01 lock glyph'},
  {at: 450, kind: 'swipe', note: 'rule 02 fills Blue Glow'},
  {at: 446, kind: 'card_in', note: 'formula panel opens'},
  {at: 444, kind: 'whoosh', note: 'chart reframes (soft)'},
  {at: T.term1 + 6, kind: 'tick', note: 'LOSS LIMIT'},
  {at: T.term2 + 6, kind: 'tick', note: '÷ STOP DISTANCE (bracket lights)'},
  {at: T.term3 + 6, kind: 'tick', note: '= POSITION SIZE'},
  {at: T.solve0, kind: 'tick_train', note: 'dur=34 · size bar solving (oscillates, settles)'},
  {at: T.solved, kind: 'lock', note: 'size solved · check'},
  {at: 530, kind: 'card_out', note: 'formula panel folds away'},
  {at: 540, kind: 'whoosh', note: 'chart zooms out for the climb'},
  {at: 526, kind: 'draw', note: 'dur=104 · price climbs from entry'},
  {at: 536, kind: 'pop', note: 'turquoise stop marker'},
  {at: 556, kind: 'swipe', note: 'rule 03 fills Blue Glow'},
  ...STEPS.filter((s) => s.f < 630).map((s) => ({at: s.f, kind: 'ratchet', note: `stop steps up to ${s.level}`})),
  {at: T.hold, kind: 'click', note: 'pullback · STOP HOLDS'},
  {at: 562, kind: 'pop', note: 'rule 03 up-arrow glyph'},
];

export const S10: React.FC = () => {
  const f = useCurrentFrame();
  const drift = -14 * ramp(f, 0, 630, (t) => t);

  // card entrance (gentle, under the tail of L15)
  const cin = settle(f, 0, 40, 0.1);
  const cardY = S10_CARD.y + (1 - cin) * 110;

  const headRight = f < T.formulaIn ? 'fixed up front · no override' : f < T.post0 ? 'size · solved, not guessed' : 'stop · ratchets up only';
  const headRightStart = f < T.formulaIn ? 24 : f < T.post0 ? T.formulaIn : T.post0;

  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', inset: 0, transform: `translateY(${drift}px)`}}>
        {/* kicker + headline (exit before the rule list) */}
        {f < T.rowsIn + 10 ? (
          <>
            <div style={{position: 'absolute', left: 72, top: 262, overflow: 'hidden'}}>
              <Micro color={C.mute} style={{transform: `translateY(${ramp(f, T.headExit, 14, EASE.in) * -120}%)`}}>
                {typed("THREE RULES THAT DON'T BEND", f, T.kicker, 1.1)}
              </Micro>
            </div>
            <Reveal
              text="Risk first."
              start={T.risk - 6}
              stagger={T.first - T.risk}
              exit={T.headExit}
              size={128}
              family="sans"
              weight={500}
              tracking={-0.025}
              color={C.ink}
              style={{position: 'absolute', left: 66, top: 300}}
            />
            <Reveal
              text="Then the trade."
              start={T.then}
              stagger={5}
              exit={T.headExit + 4}
              size={128}
              family="serif"
              weight={400}
              tracking={-0.025}
              color={BLUE[500]}
              style={{position: 'absolute', left: 66, top: 436}}
            />
          </>
        ) : null}

        <RuleRows f={f} />

        <CardShell x={S10_CARD.x} y={cardY} w={S10_CARD.w} h={S10_CARD.h}>
          <Head left={typed('superstar · risk engine', f, 10, 0.9)} right={typed(headRight, f, headRightStart, 1.3)} />
          <div style={{position: 'absolute', left: 0, top: S10_CARD.head, width: BODY_W, height: BODY_H}}>
            <TrailChart f={f} />
          </div>
        </CardShell>
      </div>
    </AbsoluteFill>
  );
};

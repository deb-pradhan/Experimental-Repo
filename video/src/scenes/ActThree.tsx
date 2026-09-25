import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {lerp, ramp} from '../anim';
import {Chips, Reveal} from '../components/Type';
import {BarWipe, Toast} from '../components/ui';
import {C, EASE, FONT, FW, pt} from '../theme';
import {EV, SCENES} from '../timeline';

// S6 shortlist (black) → S7 climax (the film's single blue ground).

// Grid B (bleeding 4-column), blue-first accent sequence (system §2.3).
const GRID_B = [63, 217, 371, 525].map(pt); // 168, 578.7, 989.3, 1400
const TOPS = [186, 212, 238, 264].map(pt); // 496, 565, 635, 704
const CARD_W = pt(148);
const SHORT = [
  {name: 'Aadarsh Velu', score: 93, bg: C.blue},
  {name: 'Rahul Murali', score: 91, bg: C.lime},
  {name: 'Sneha Iyer', score: 86, bg: C.lilac},
  {name: 'Mariam Al Hashimi', score: 82, bg: C.yellow},
];

const ShortCard: React.FC<{i: number}> = ({i}) => {
  const f = useCurrentFrame();
  const c = SHORT[i];
  const at = EV.s6Cards[i];
  const p = ramp(f, at, 40, EASE.out);
  const onBlue = c.bg === C.blue;
  const fg = onBlue ? C.white : C.black;
  const sub = onBlue ? C.white : C.mutedLight;
  // S7: the blue card grows into the ground; its content leaves first
  const grow = i === 0 ? ramp(f, EV.s7Grow, 44, EASE.inOut) : 0;
  const contentOut = i === 0 ? ramp(f, EV.s7Grow - 12, 14, EASE.in) : 0;
  const x = lerp(GRID_B[i], 0, grow);
  const y = lerp(TOPS[i] + (1 - p) * 700, 0, grow);
  const w = lerp(CARD_W, 1920, grow);
  const h = lerp(1080 - TOPS[i] + 40, 1080, grow);
  const press = i === 0 ? 1 - 0.05 * Math.sin(ramp(f, 1340, 10) * Math.PI) : 1;
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: w,
        height: h,
        background: c.bg,
        borderRadius: lerp(pt(14) * 1.0, 0, grow),
        zIndex: i === 0 ? 5 : 1,
        overflow: 'hidden',
      }}
    >
      <div style={{position: 'absolute', left: 40, top: 36, right: 30, opacity: 1 - contentOut, transform: `translateY(${-contentOut * 40}px)`}}>
        <div style={{fontFamily: FONT.mono, fontSize: 22, color: sub}}>{String(i + 1).padStart(2, '0')}</div>
        <div style={{fontFamily: FONT.sans, fontWeight: FW.mid, fontSize: 40, letterSpacing: '-0.03em', color: fg, marginTop: 44, lineHeight: 1.05}}>{c.name}</div>
        <div style={{fontFamily: FONT.sans, fontWeight: FW.mid, fontSize: 22, color: sub, marginTop: 10}}>QA Engineer · interview-verified</div>
        <div style={{fontFamily: FONT.sans, fontWeight: FW.bold, fontSize: 120, letterSpacing: '-0.06em', color: fg, marginTop: 34, lineHeight: 1}}>
          {Math.round(c.score * ramp(f, at + 8, 40, EASE.kit))}
        </div>
        {i === 0 && (
          <div
            style={{
              marginTop: 36,
              display: 'inline-flex',
              alignItems: 'center',
              height: 72,
              padding: '0 34px',
              borderRadius: 999,
              background: C.black,
              color: C.white,
              fontFamily: FONT.sans,
              fontWeight: FW.mid,
              fontSize: 28,
              letterSpacing: '-0.02em',
              transform: `scale(${press})`,
              clipPath: `inset(0 ${(1 - ramp(f, 1318, 20, EASE.out)) * 100}% 0 0 round 999px)`,
            }}
          >
            Send invite
          </div>
        )}
      </div>
    </div>
  );
};

const Shortlist: React.FC = () => {
  const f = useCurrentFrame();
  if (f < EV.s6Wipe || f >= EV.s7Grow + 46) return null;
  return (
    <AbsoluteFill>
      <BarWipe start={EV.s6Wipe} color={C.black} />
      {f >= 1204 && (
        <>
          <Chips labels={['Shortlist', 'Interview-verified']} start={1208} exit={1390} dark />
          <Reveal text={'A shortlist,\nnot a pile.'} start={1214} exit={1294} size={130} color={C.white} stagger={5} style={{position: 'absolute', left: 168, top: 218}} />
          <Reveal text={'You make the call.'} start={EV.s6Call} exit={1392} size={130} color={C.white} stagger={5} style={{position: 'absolute', left: 168, top: 218}} />
          {[3, 2, 1, 0].map((i) => (
            <ShortCard key={i} i={i} />
          ))}
          {f < EV.s7Grow + 10 && <Toast text="Interview invite sent" at={EV.s6Toast} style={{left: 208, top: 952}} />}
        </>
      )}
    </AbsoluteFill>
  );
};

const Climax: React.FC = () => {
  const f = useCurrentFrame();
  if (f < EV.s7Grow + 40 || f >= SCENES.s8.from + 30) return null;
  // The blue ground lifts away like a curtain to reveal the end card.
  const lift = ramp(f, EV.s8Reveal - 8, 30, EASE.inOut);
  const words = [
    {t: 'Hiring,', at: EV.s7Words[0], top: 110},
    {t: 'decided', at: EV.s7Words[1], top: 390},
    {t: 'on merit.', at: EV.s7Words[2], top: 670},
  ];
  return (
    <AbsoluteFill style={{background: C.blue, zIndex: 10, transform: `translateY(${-lift * 1100}px)`}}>
      {words.map((w) => (
        <Reveal key={w.t} text={w.t} start={w.at} size={290} color={C.white} tracking={-0.055} dur={26} style={{position: 'absolute', left: 150, top: w.top}} />
      ))}
      {/* a single white hairline draws under the last word on the downbeat */}
      <div style={{position: 'absolute', left: 168, top: 1000, height: 3, width: 1584 * ramp(f, 1560, 40, EASE.inOut), background: C.white}} />
    </AbsoluteFill>
  );
};

export const ActThree: React.FC = () => (
  <>
    <Shortlist />
    <Climax />
  </>
);


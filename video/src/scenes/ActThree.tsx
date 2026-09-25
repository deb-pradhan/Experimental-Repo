import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {lerp, ramp} from '../anim';
import {Chips, Reveal} from '../components/Type';
import {BarWipe, Toast} from '../components/ui';
import {C, EASE, FONT, FW, pt} from '../theme';
import {EV, SCENES} from '../timeline';

// S6 shortlist (black) → S7 climax (the film's single blue ground).

// Grid B (bleeding 4-column), blue-first accent sequence (system §2.3).
// 4 cards across the content width: 384 wide, 16 gutter → the last card ends on the 1752 margin.
const CARD_W = 384;
const GRID_B = [0, 1, 2, 3].map((i) => 168 + i * (CARD_W + 16));
const TOPS = [186, 212, 238, 264].map((v) => pt(v) + 24); // staggered 26pt, clear of the headline
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
  const contentOut = i === 0 ? ramp(f, EV.s7Grow - 14, 14, EASE.in) : 0;
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
      <div style={{position: 'absolute', left: 40, top: 36, right: 30, transform: `translateY(${-contentOut * 60}px)`, clipPath: `inset(0 0 ${contentOut * 100}% 0)`}}>
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
          <Reveal text={'A shortlist,\nnot a pile.'} start={1208} exit={1294} size={120} color={C.white} stagger={5} style={{position: 'absolute', left: 168, top: 218}} />
          <Reveal text={'You make the call.'} start={EV.s6Call + 2} exit={1390} size={120} color={C.white} stagger={5} style={{position: 'absolute', left: 168, top: 218}} />
          {[3, 2, 1, 0].map((i) => (
            <ShortCard key={i} i={i} />
          ))}
          <Toast text="Interview invite sent" at={EV.s6Toast} outAt={1382} ring style={{right: 168, top: 110}} />
        </>
      )}
    </AbsoluteFill>
  );
};

// A white bar bleeds in from the right edge and stops just after its word:
// the deck's bleeding-bar gesture, mirrored so it never touches the left-anchored type.
const Bar: React.FC<{at: number; y: number; from: number}> = ({at, y, from}) => {
  const f = useCurrentFrame();
  const p = ramp(f, at, 20, EASE.out);
  if (p <= 0) return null;
  const w = (1920 - from) * p;
  return <div style={{position: 'absolute', left: 1920 - w, top: y, width: w, height: 26, background: C.white}} />;
};

const Climax: React.FC = () => {
  const f = useCurrentFrame();
  if (f < EV.s7Grow + 40 || f >= SCENES.s8.from + 30) return null;
  // The blue ground lifts away like a curtain to reveal the end card.
  const lift = ramp(f, EV.s8Reveal - 8, 30, EASE.inOut);
  // word right edges measured in Manrope 200 at 290 px (−0.055 em): 863, 1098, 1145
  const words = [
    {t: 'Hiring,', at: EV.s7Words[0], top: 110, end: 863},
    {t: 'decided', at: EV.s7Words[1], top: 390, end: 1098},
    {t: 'on merit.', at: EV.s7Words[2], top: 670, end: 1145},
  ];
  return (
    <AbsoluteFill style={{background: C.blue, zIndex: 10, transform: `translateY(${-lift * 1100}px)`}}>
      {words.map((w) => (
        <Bar key={`b${w.t}`} at={w.at + 8} y={w.top + 172} from={w.end + 60} />
      ))}
      {words.map((w) => (
        <Reveal key={w.t} text={w.t} start={w.at} size={290} color={C.white} tracking={-0.055} dur={26} style={{position: 'absolute', left: 150, top: w.top}} />
      ))}
      {/* a single white hairline draws under the last word and holds */}
      <div style={{position: 'absolute', left: 168, top: 1000, height: 3, width: 1584 * ramp(f, 1556, 40, EASE.inOut), background: C.white}} />
    </AbsoluteFill>
  );
};

export const ActThree: React.FC = () => (
  <>
    <Shortlist />
    <Climax />
  </>
);


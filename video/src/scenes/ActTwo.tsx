import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {lerp, ramp} from '../anim';
import {Chips, Reveal} from '../components/Type';
import {Avatar, Badge, BarWipe, Chrome, HouseMark, Meter, Switch} from '../components/ui';
import {ROW, SKELETON} from '../three/textures';
import {C, EASE, FONT, FW} from '../theme';
import {EV, SCENES} from '../timeline';
import {WINDOW} from './ActOne';

// S4 (ranked on merit, white) + S5 (interviewed for real, lime).
// The black product window is the continuity anchor: it is born from the 3D void
// at the end of S3, holds its position through S4 and S5, and the grounds change around it.

type Cand = {name: string; ini: string; fit: number; score: number; accent: string};
// Application order (script §2). Scores are illustrative UI state.
export const CANDS: Cand[] = [
  {name: 'Prabhjot Singh', ini: 'PS', fit: 54, score: 74, accent: C.lilac},
  {name: 'Mariam Al Hashimi', ini: 'MA', fit: 71, score: 82, accent: C.yellow},
  {name: 'Rohan Mehta', ini: 'RM', fit: 48, score: 61, accent: C.greyBlock},
  {name: 'Aadarsh Velu', ini: 'AV', fit: 90, score: 93, accent: C.lime},
  {name: 'Fatima Qureshi', ini: 'FQ', fit: 66, score: 79, accent: C.lilac},
  {name: 'Rahul Murali', ini: 'RM', fit: 84, score: 91, accent: C.yellow},
  {name: 'Omar Haddad', ini: 'OH', fit: 58, score: 68, accent: C.greyBlock},
  {name: 'Sneha Iyer', ini: 'SI', fit: 77, score: 86, accent: C.lime},
];
const RANK = CANDS.map((c) => CANDS.filter((o) => o.score > c.score).length); // 0 = best

const rowY = (k: number) => ROW.top + k * ROW.pitch;

// ActTwo mounts a little before S4 (transparent) so its left column arrives as the void recedes.
export const ACT2_IN = SCENES.s4.from - 22;
// S4 → S5: one push moves the table out and the interview in together (no crossing text).
const PUSH = {at: 948, dur: 36, h: 990};

const Row: React.FC<{c: Cand; i: number}> = ({c, i}) => {
  const f = useCurrentFrame();
  // skeleton → content (content wipes in left→right while the skeleton bars retract)
  const fill = ramp(f, 724 + i * 4, 22, EASE.out);
  // count-up
  const cnt = ramp(f, EV.s4Count + i * 3, 56, EASE.kit);
  // FLIP re-sort
  const r = RANK[i];
  const sp = ramp(f, EV.s4Sort + r * 3, 44, EASE.inOut);
  const y = lerp(rowY(i), rowY(r), sp);
  const moving = Math.sin(sp * Math.PI);
  const up = r < i;
  const invited = r < 3 && f >= EV.s4Invite + r * 6;
  const S = SKELETON;
  const skel = (b: {x: number; y: number; w: number; h: number}, key: string) => (
    <span
      key={key}
      style={{
        position: 'absolute',
        left: b.x,
        top: b.y,
        width: b.w * (1 - fill),
        height: b.h,
        borderRadius: b.h / 2,
        background: C.greyBg,
      }}
    />
  );
  return (
    <div
      style={{
        position: 'absolute',
        left: ROW.x - WINDOW.x,
        top: y - WINDOW.y,
        width: ROW.w,
        height: ROW.h,
        borderRadius: ROW.r,
        background: C.white,
        zIndex: up ? 2 : 1,
        transform: `scale(${1 + (up ? 0.015 : 0) * moving})`,
      }}
    >
      {/* skeleton (matches the 3D row texture exactly at fill = 0) */}
      <span
        style={{
          position: 'absolute',
          left: S.avatar.cx - S.avatar.r,
          top: S.avatar.cy - S.avatar.r,
          width: S.avatar.r * 2,
          height: S.avatar.r * 2,
          borderRadius: 999,
          background: C.greyBg,
          opacity: fill < 0.5 ? 1 : 0,
        }}
      />
      {skel(S.name, 'n')}
      {skel(S.sub, 's')}
      {skel(S.fit, 'f')}
      {skel(S.score, 'sc')}
      <span
        style={{
          position: 'absolute',
          left: S.badge.x,
          top: S.badge.y,
          width: S.badge.w * (1 - fill),
          height: S.badge.h,
          borderRadius: 15,
          background: C.greyBg,
        }}
      />
      {/* content */}
      <div style={{position: 'absolute', inset: 0, clipPath: `inset(0 ${(1 - fill) * 100}% 0 0)`}}>
        <span style={{position: 'absolute', left: 22, top: 18}}>
          <Avatar initials={c.ini} bg={c.accent} />
        </span>
        <span style={{position: 'absolute', left: 88, top: 14, fontFamily: FONT.sans, fontWeight: FW.mid, fontSize: 27, letterSpacing: '-0.02em', color: C.black, whiteSpace: 'nowrap'}}>
          {c.name}
        </span>
        <span style={{position: 'absolute', left: 88, top: 49, fontFamily: FONT.sans, fontWeight: FW.mid, fontSize: 18, color: C.label}}>QA Engineer</span>
        <span style={{position: 'absolute', left: S.badge.x, top: 23}}>
          <Badge kind={invited ? 'primary' : 'secondary'}>{invited ? 'Invited' : 'Applied'}</Badge>
        </span>
        <span style={{position: 'absolute', left: S.fit.x, top: 26, fontFamily: FONT.mono, fontSize: 24, color: C.black, fontVariantNumeric: 'tabular-nums'}}>
          {Math.round(c.fit * cnt)}%
        </span>
        <span
          style={{
            position: 'absolute',
            right: ROW.w - 712,
            top: 16,
            fontFamily: FONT.sans,
            fontWeight: FW.bold,
            fontSize: 42,
            letterSpacing: '-0.04em',
            color: C.black,
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {Math.round(c.score * cnt)}
        </span>
      </div>
    </div>
  );
};

const TableUI: React.FC = () => {
  const f = useCurrentFrame();
  const head = ramp(f, 698, 26, EASE.out);
  const push = ramp(f, PUSH.at, PUSH.dur, EASE.inOut); // one push: table up, interview up behind it
  return (
    <div style={{position: 'absolute', inset: 0, transform: `translateY(${-push * PUSH.h}px)`}}>
      <div style={{position: 'absolute', left: 94, top: 26, right: 32, transform: `translateY(${(1 - head) * -60}px)`, clipPath: `inset(${(1 - head) * 100}% 0 0 0)`}}>
        <Chrome title="Applicants · QA Engineer" right={<Badge kind="accent">312</Badge>} />
      </div>
      <div
        style={{
          position: 'absolute',
          left: ROW.x - WINDOW.x,
          top: 108,
          width: ROW.w,
          height: 30,
          fontFamily: FONT.mono,
          fontSize: 18,
          letterSpacing: '0.06em',
          color: C.mutedDark,
          clipPath: `inset(0 ${(1 - head) * 100}% 0 0)`,
        }}
      >
        <span style={{position: 'absolute', left: 88}}>CANDIDATE</span>
        <span style={{position: 'absolute', left: SKELETON.badge.x}}>STAGE</span>
        <span style={{position: 'absolute', left: SKELETON.fit.x}}>FIT</span>
        <span style={{position: 'absolute', right: ROW.w - 712}}>SCORE</span>
      </div>
      <div style={{position: 'absolute', left: ROW.x - WINDOW.x, top: 148, width: ROW.w * head, height: 2, background: C.borderOnDark}} />
      {f >= SCENES.s4.from && CANDS.map((c, i) => <Row key={c.name} c={c} i={i} />)}
    </div>
  );
};

const Waveform: React.FC<{active: number}> = ({active}) => {
  const f = useCurrentFrame();
  return (
    <div style={{position: 'absolute', left: 36, right: 36, bottom: 20, height: 50, display: 'flex', alignItems: 'center', gap: 8}}>
      {Array.from({length: 48}, (_, i) => {
        const a = Math.abs(Math.sin(i * 1.7 + f * 0.21) * Math.sin(i * 0.43 + f * 0.09));
        const h = 6 + a * 44 * active;
        return <span key={i} style={{flex: 1, height: h, borderRadius: 999, background: C.black}} />;
      })}
    </div>
  );
};

const InterviewUI: React.FC = () => {
  const f = useCurrentFrame();
  if (f < PUSH.at) return null;
  const push = ramp(f, PUSH.at, PUSH.dur, EASE.inOut);
  const out = ramp(f, 1190, 10, EASE.in);
  const secs = 38 + Math.floor(Math.max(0, f - EV.s5Rec) / 60);
  const recOn = f >= EV.s5Rec;
  const talk = ramp(f, EV.s5Rec, 20) * (1 - ramp(f, 1150, 20));
  const block = (delay: number): React.CSSProperties => {
    const p = ramp(f, 972 + delay, 28, EASE.out);
    return {transform: `translateY(${(1 - p) * 80}px)`, clipPath: `inset(0 0 ${(1 - p) * 100}% 0)`};
  };
  return (
    <div style={{position: 'absolute', inset: 0, transform: `translateY(${(1 - push) * PUSH.h - out * 40}px)`}}>
      <div style={{position: 'absolute', left: 94, top: 26, right: 32}}>
        <Chrome
          title="Video interview · QA Engineer"
          right={
            <span style={{display: 'inline-flex', alignItems: 'center', gap: 12, fontFamily: FONT.mono, fontSize: 22, color: C.white, opacity: recOn ? 1 : 0}}>
              <span style={{width: 16, height: 16, borderRadius: 999, background: C.blue, opacity: Math.floor(f / 30) % 2 === 0 ? 1 : 0.999}} />
              REC 00:{String(secs).padStart(2, '0')}
            </span>
          }
        />
      </div>
      <div style={{position: 'absolute', left: 32, top: 92, ...block(0)}}>
        <div style={{fontFamily: FONT.mono, fontSize: 18, letterSpacing: '0.09em', color: C.mutedDark}}>CANDIDATE</div>
        <div style={{fontFamily: FONT.sans, fontWeight: FW.light, fontSize: 44, letterSpacing: '-0.03em', color: C.white, marginTop: 6}}>Aadarsh Velu</div>
        <div style={{fontFamily: FONT.sans, fontWeight: FW.mid, fontSize: 22, color: C.mutedDark, marginTop: 4}}>QA Engineer · rank 1 of 312</div>
      </div>
      <div style={{position: 'absolute', left: 32, top: 244, width: 728, height: 212, borderRadius: 22, background: C.lilac, overflow: 'hidden', ...block(5)}}>
        <div style={{position: 'absolute', left: 36, top: 18, fontFamily: FONT.sans, fontWeight: FW.bold, fontSize: 92, letterSpacing: '-0.05em', color: C.black}}>AV</div>
        <Waveform active={talk} />
      </div>
      <div style={{position: 'absolute', left: 32, top: 482, width: 728, ...block(10)}}>
        <span style={{fontFamily: FONT.mono, fontSize: 20, color: C.mutedDark}}>Q2</span>
        <div style={{fontFamily: FONT.sans, fontWeight: FW.mid, fontSize: 30, letterSpacing: '-0.02em', color: C.white, marginTop: 6, lineHeight: 1.3}}>
          Walk us through a bug you found that others missed.
        </div>
      </div>
      <div style={{position: 'absolute', left: 32, top: 624, display: 'flex', alignItems: 'center', gap: 20, ...block(16)}}>
        <Switch onAt={EV.s5Switch} />
        <span style={{fontFamily: FONT.sans, fontWeight: FW.mid, fontSize: 26, color: C.white, letterSpacing: '-0.01em'}}>Anti-cheat monitoring</span>
      </div>
      <div style={{position: 'absolute', left: 32, top: 712, display: 'flex', flexDirection: 'column', gap: 24, ...block(20)}}>
        <Meter label="Problem solving" value={92} start={EV.s5Meters} width={736} />
        <Meter label="Communication" value={84} start={EV.s5Meters + 8} width={736} />
        <Meter label="Role fit" value={90} start={EV.s5Meters + 16} width={736} />
      </div>
    </div>
  );
};

const AlertDark: React.FC = () => {
  const f = useCurrentFrame();
  const p = ramp(f, 1060, 30, EASE.out);
  if (f < 1060) return null;
  return (
    <div
      style={{
        position: 'absolute',
        left: 168,
        top: 790,
        width: 700,
        display: 'flex',
        gap: 24,
        padding: '30px 34px',
        borderRadius: 30,
        background: C.black,
        color: C.white,
        clipPath: `inset(0 ${(1 - p) * 100}% 0 0 round 30px)`,
      }}
    >
      <span style={{color: C.lime, fontWeight: FW.bold, fontSize: 30, lineHeight: 1.1}}>✦</span>
      <div style={{fontFamily: FONT.sans, fontWeight: FW.mid, fontSize: 30, letterSpacing: '-0.015em', lineHeight: 1.35, color: C.white}}>
        Session is recorded per question
        <br />
        and checked for integrity.
      </div>
    </div>
  );
};

export const ActTwo: React.FC = () => {
  const f = useCurrentFrame();
  if (f < ACT2_IN || f >= SCENES.s5.to) return null;
  const pre = f < SCENES.s4.from; // the 3D act still owns the ground and the rows
  return (
    <AbsoluteFill style={{background: pre ? 'transparent' : C.white}}>
      {/* S4 left column */}
      <Chips labels={['Ranking', 'Skills and fit']} start={700} exit={946} />
      <Reveal text={'Ranked on merit,\nnot keywords.'} start={708} exit={944} size={100} color={C.black} stagger={5} style={{position: 'absolute', left: 168, top: 218}} />

      {/* → S5 ground */}
      <BarWipe start={EV.s5Wipe} color={C.lime} />
      <Chips labels={['Interview', 'Integrity checks']} start={974} second="white" />
      <Reveal text={'Interviewed\nfor real.'} start={976} size={130} color={C.black} stagger={5} style={{position: 'absolute', left: 168, top: 218}} />
      <AlertDark />

      {/* the product window */}
      <div
        style={{
          position: 'absolute',
          left: WINDOW.x,
          top: WINDOW.y,
          width: 1752 - WINDOW.x,
          height: 1080 - WINDOW.y + 60,
          borderRadius: WINDOW.r,
          background: pre ? 'transparent' : C.black,
          overflow: 'hidden',
        }}
      >
        {!pre && <HouseMark size={40} style={{position: 'absolute', left: 32, top: 26, zIndex: 3}} />}
        <TableUI />
        <InterviewUI />
      </div>
    </AbsoluteFill>
  );
};

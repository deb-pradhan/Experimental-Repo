import React from 'react';
import {AbsoluteFill, OffthreadVideo, staticFile, useCurrentFrame} from 'remotion';
import {lerp, ramp} from '../anim';
import {Reveal} from '../components/ui';
import {Star3D} from '../components/Star';
import {BLUE, C, EASE, H, W} from '../theme';
import {local, voF, wordF} from '../timeline';

// S04 · Reveal (22.0–26.0 s). The iris opens from S03's seed point into Deploy's light world on the
// score's impact. The Kling plate (graded to the ramps) assembles the Superstar core; in its last
// beat the plate hands off to the matching three.js star, which carries on into the loop (S05).

export const PLATE = {startFrom: 108, rate: 1.25, scale: 0.9, dy: 20} as const;
// star in plate space at its final frame: centre (523, 915), ~847 px across → mapped through PLATE.scale/dy
export const STAR_END = {x: 540 + (523 - 540) * 0.9, y: 900 + (915 - 900) * 0.9 + 20, size: 847 * 0.9};
export const STAR_LIFT = -0.34; // darker facets to match the plate at the handoff
export const starRot = (localFrame: number): [number, number, number] => [0.52, 0.34 + localFrame * 0.0062, 0.18];

export const T = {
  iris: 0,
  meet: local('S04', voF('L08')),
  superstar: local('S04', wordF('L08', 'superstar')),
  line: local('S04', voF('L09')),
  both: local('S04', wordF('L09', 'both')),
  handoff: 176,
  handoffDur: 22,
  exit: 224,
} as const;

export const S04: React.FC = () => {
  const f = useCurrentFrame();
  const iris = ramp(f, T.iris, 34, EASE.soft);
  const r = lerp(16, 1500, iris);
  const hand = ramp(f, T.handoff, T.handoffDur, EASE.cubic);
  const exit = ramp(f, T.exit, 16, EASE.in);

  return (
    <AbsoluteFill style={{background: C.gray}}>
      {/* the plate */}
      <AbsoluteFill
        style={{
          opacity: 1 - hand,
          // footage mask: drop the plate's floor shadow so the subline sits on clean Gray and the 3D handoff matches
          WebkitMaskImage: 'linear-gradient(to bottom, black 1290px, transparent 1370px)',
          maskImage: 'linear-gradient(to bottom, black 1290px, transparent 1370px)',
        }}
      >
        <AbsoluteFill style={{transform: `translateY(${PLATE.dy}px) scale(${PLATE.scale})`, transformOrigin: '50% 900px'}}>
          <OffthreadVideo src={staticFile('plates/p3_core_light.mp4')} startFrom={PLATE.startFrom} playbackRate={PLATE.rate} muted />
        </AbsoluteFill>
      </AbsoluteFill>

      {/* the 3D star takes over at the same place and scale */}
      {f >= T.handoff - 2 && (
        <AbsoluteFill style={{opacity: hand}}>
          <Star3D width={W} height={H} x={STAR_END.x - 540} y={STAR_END.y - 960} size={STAR_END.size} rot={starRot(f)} lift={STAR_LIFT} />
        </AbsoluteFill>
      )}

      {/* type */}
      <div style={{position: 'absolute', left: 72, top: 250, transform: `translateY(${-exit * 40}px)`, opacity: 1 - exit}}>
        <Reveal text="Meet" start={T.meet} size={80} family="sans" weight={500} color={C.ink} tracking={-0.02} />
        <Reveal text="Superstar" start={T.superstar - 4} size={176} family="sans" weight={500} color={C.ink} tracking={-0.04} dur={30} />
      </div>
      <div style={{position: 'absolute', left: 72, top: 1392, transform: `translateY(${exit * 40}px)`, opacity: 1 - exit}}>
        <Reveal text="An intelligent agent, trading" start={T.line} size={58} family="sans" weight={500} color={C.ink} tracking={-0.02} stagger={3} />
        <Reveal text="both sides for you." start={T.both - 8} size={96} family="serif" color={BLUE[500]} tracking={-0.03} stagger={4} dur={26} style={{marginTop: 6}} />
      </div>

      {/* iris: Soft Black with a growing hole centred on S03's seed point */}
      {iris < 1 && (
        <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
          <defs>
            <mask id="s04iris">
              <rect width={1080} height={1920} fill="white" />
              <circle cx={540} cy={1040} r={r} fill="black" />
            </mask>
          </defs>
          <rect width={1080} height={1920} fill={C.softBlack} mask="url(#s04iris)" />
          <circle cx={540} cy={1040} r={r} fill="none" stroke={BLUE[500]} strokeWidth={lerp(10, 2, iris)} />
        </svg>
      )}
    </AbsoluteFill>
  );
};

export const CUES: {at: number; kind: string; note?: string}[] = [
  {at: 0, kind: 'impact_big', note: 'THE reveal impact (score hit at 22.0 s) + iris opens'},
  {at: 2, kind: 'iris_open', note: 'airy bright opening swell'},
  {at: 20, kind: 'energy_form', note: 'spheres converge (plate)'},
  {at: 64, kind: 'star_lock', note: 'shards snap into the star (plate ~3.1 s)'},
  {at: T.superstar, kind: 'swipe', note: '"Superstar" rises'},
  {at: T.both, kind: 'shimmer', note: '"both sides for you." in Blue Glow'},
  {at: T.handoff + 10, kind: 'none', note: 'plate→3D handoff (silent)'},
];

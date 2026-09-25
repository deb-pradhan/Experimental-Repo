import {ThreeCanvas} from '@remotion/three';
import {useThree} from '@react-three/fiber';
import React, {useLayoutEffect, useMemo, useRef} from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import * as THREE from 'three';
import {clamp01, lerp, ramp, rng, settle} from '../anim';
import {CHOICE_Y, ChoiceRow, Micro, PulseDot, Reveal} from '../components/ui';
import {BACKTEST} from '../data/backtest';
import {BLUE, C, EASE, FONT, H, W, WHITE} from '../theme';
import {local, wordF} from '../timeline';

// S09 · 04 Choose → "Nothing is a valid move." (58.0–65.5 s). Match cut from S08's selector onto Blue
// Glow as the score drops out: SHORT on "Short.", then NO TRADE locks in turquoise on "Or nothing at
// all." in near silence. Then the backtest's 2,298 reviews as a 3D field of dots; 1,350 go quiet in a
// cascading wave while the counter lands on the narrator's number.

const COLS = 38;
const ROWS = Math.ceil(BACKTEST.reviews / COLS); // 61
const N = BACKTEST.reviews;

export const T = {
  short: local('S09', wordF('L14', 'short')),
  nothing: local('S09', wordF('L14', 'or')),
  lift: 104,
  field: local('S09', wordF('L15', 'in')),
  quiet0: local('S09', wordF('L15', 'it')) + 4,
  quiet1: local('S09', wordF('L15', 'it')) + 150,
  valid: 318,
  exit: 424,
} as const;

// which reviews ended in no trade (deterministic), and when each one goes quiet (a wave from the centre)
const DOTS = (() => {
  const r = rng(2298);
  const idx = Array.from({length: N}, (_, i) => i);
  for (let i = N - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    [idx[i], idx[j]] = [idx[j], idx[i]];
  }
  const quiet = new Set(idx.slice(0, BACKTEST.noTrade));
  return Array.from({length: N}, (_, i) => {
    const c = i % COLS, rr = Math.floor(i / COLS);
    const x = (c - (COLS - 1) / 2) * 0.5;
    const z = (rr - (ROWS - 1) / 2) * 0.5;
    const d = Math.hypot(x, z * 0.8) / 18 + r() * 0.18;
    return {x, z, quiet: quiet.has(i), wave: d, appear: (rr / ROWS) * 0.7 + r() * 0.3};
  });
})();
const QUIET_ORDER = DOTS.map((d, i) => ({i, w: d.wave})).filter((d) => DOTS[d.i].quiet).sort((a, b) => a.w - b.w);
const QUIET_RANK = new Map(QUIET_ORDER.map((d, k) => [d.i, k]));

const Field: React.FC<{f: number}> = ({f}) => {
  const ref = useRef<THREE.InstancedMesh>(null);
  const {camera} = useThree();
  const geo = useMemo(() => new THREE.CircleGeometry(0.13, 20).rotateX(-Math.PI / 2), []);
  const mat = useMemo(() => new THREE.MeshBasicMaterial({color: 0xffffff}), []);
  const m4 = useMemo(() => new THREE.Matrix4(), []);
  const cWhite = useMemo(() => new THREE.Color(WHITE[100]), []);
  const cQuiet = useMemo(() => new THREE.Color(BLUE[700]), []);
  const tmp = useMemo(() => new THREE.Color(), []);
  useLayoutEffect(() => {
    // camera: a slow crane over the tilted field
    const k = ramp(f, T.field, 300, EASE.soft);
    const cam = camera as THREE.PerspectiveCamera;
    cam.fov = 40;
    cam.position.set(lerp(0, 1.2, k), lerp(19, 15.5, k), lerp(24, 19, k));
    cam.lookAt(0, 0, lerp(-1, 0.5, k));
    cam.updateProjectionMatrix();
    const mesh = ref.current;
    if (!mesh) return;
    const quietCount = Math.round(BACKTEST.noTrade * ramp(f, T.quiet0, T.quiet1 - T.quiet0, EASE.cubic));
    DOTS.forEach((d, i) => {
      const a = settle(f, T.field + d.appear * 70, 20, 0.4);
      const q = d.quiet && (QUIET_RANK.get(i) ?? 1e9) < quietCount ? 1 : 0;
      const s = a * (1 - q * 0.35);
      m4.makeScale(s, s, s);
      m4.setPosition(d.x, 0, d.z);
      mesh.setMatrixAt(i, m4);
      tmp.copy(cWhite).lerp(cQuiet, q);
      mesh.setColorAt(i, tmp);
    });
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  });
  return <instancedMesh ref={ref} args={[geo, mat, N]} frustumCulled={false} />;
};

export const S09: React.FC = () => {
  const f = useCurrentFrame();
  // selector: LONG (from S08) → SHORT → NO TRADE (locked, turquoise)
  const toShort = settle(f, T.short - 3, 16, 0.3);
  const toNone = settle(f, T.nothing - 3, 16, 0.3);
  const active: [number, number, number] = [clamp01(1 - toShort), clamp01(toShort - toNone), clamp01(toNone)];
  const lock = ramp(f, T.nothing + 6, 14, EASE.out);
  const lift = ramp(f, T.lift, 46, EASE.inOut);
  const rowY = lerp(CHOICE_Y, 330, lift);
  const rowS = lerp(1, 0.82, lift);

  const quietCount = Math.round(BACKTEST.noTrade * ramp(f, T.quiet0, T.quiet1 - T.quiet0, EASE.cubic));
  const fieldIn = ramp(f, T.field - 10, 30);
  const exit = ramp(f, T.exit, 26, EASE.in);

  return (
    <AbsoluteFill style={{background: C.gray}}>
      <div style={{position: 'absolute', inset: 0, background: C.blue, overflow: 'hidden', transform: `translateY(${-exit * 1920}px)`}}>
        {/* the dot field (behind the type), confined to the middle band by a feathered footage mask */}
        <AbsoluteFill
          style={{
            opacity: fieldIn,
            WebkitMaskImage: 'linear-gradient(to bottom, transparent 700px, black 820px, black 1300px, transparent 1400px)',
            maskImage: 'linear-gradient(to bottom, transparent 700px, black 820px, black 1300px, transparent 1400px)',
          }}
        >
          <ThreeCanvas width={W} height={H} gl={{antialias: true}} camera={{fov: 40, position: [0, 17, 20]}}>
            <Field f={f} />
          </ThreeCanvas>
        </AbsoluteFill>

        {/* status */}
        <div style={{position: 'absolute', left: 72, right: 72, top: 250, display: 'flex', alignItems: 'center', gap: 18, fontFamily: FONT.mono, fontSize: 24, color: BLUE[200], letterSpacing: '.04em', opacity: ramp(f, T.lift, 20)}}>
          <PulseDot />
          <span>superstar · backtest · simulated · btc</span>
          <span style={{marginLeft: 'auto'}}>{BACKTEST.period.toLowerCase()}</span>
        </div>

        <ChoiceRow active={active} onBlue lock={lock} y={rowY} scale={rowS} />

        {/* counter */}
        <div style={{position: 'absolute', left: 72, right: 72, top: 470, opacity: ramp(f, T.lift + 40, 20), transform: `translateY(${(1 - ramp(f, T.lift + 40, 30, EASE.out)) * 30}px)`}}>
          <div style={{display: 'flex', alignItems: 'baseline', gap: 18}}>
            <span style={{fontFamily: FONT.serif, fontSize: 170, lineHeight: 1, color: WHITE[100], letterSpacing: '-0.03em', fontVariantNumeric: 'tabular-nums'}}>
              {quietCount.toLocaleString('en-US')}
            </span>
            <span style={{fontFamily: FONT.serif, fontSize: 80, color: BLUE[200], letterSpacing: '-0.02em'}}>/ {N.toLocaleString('en-US')}</span>
          </div>
          <Micro color={BLUE[100]} size={24} style={{marginTop: 10}}>
            reviews ended in no trade
          </Micro>
        </div>

        {/* verdict */}
        <div style={{position: 'absolute', left: 72, top: 1430}}>
          <Reveal text="Nothing is a valid move." start={T.valid} size={94} family="serif" color={WHITE[100]} tracking={-0.03} stagger={4} dur={28} />
        </div>
        <div style={{position: 'absolute', left: 72, right: 72, top: 1566, display: 'flex', justifyContent: 'space-between', fontFamily: FONT.mono, fontSize: 22, color: BLUE[200], opacity: fieldIn}}>
          <span>simulated backtest · not live trading</span>
          <span>{BACKTEST.reviews.toLocaleString('en-US')} reviews</span>
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const CUES: {at: number; kind: string; note?: string}[] = [
  {at: 0, kind: 'cut_hush', note: 'match cut onto Blue Glow as the score drops out (no hit — a hush)'},
  {at: T.short + 2, kind: 'click', note: 'SHORT highlights'},
  {at: T.nothing + 8, kind: 'lock', note: 'NO TRADE locks — turquoise (the key sound of the film, near silence)'},
  {at: T.lift + 10, kind: 'swipe', note: 'selector lifts'},
  {at: T.field, kind: 'grain_in', note: 'dur=90 2,298 dots appear (soft grains)'},
  {at: T.quiet0, kind: 'dotwave', note: `dur=${T.quiet1 - T.quiet0} 1,350 go quiet — cascading soft grains`},
  {at: T.quiet0, kind: 'tick_train', note: `dur=${T.quiet1 - T.quiet0} counter to 1,350`},
  {at: T.valid + 10, kind: 'shimmer', note: '"Nothing is a valid move."'},
  {at: T.exit + 12, kind: 'whoosh', note: 'blue curtain lifts → S10'},
];

import {ThreeCanvas} from '@remotion/three';
import {useThree} from '@react-three/fiber';
import React, {useLayoutEffect, useMemo} from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import * as THREE from 'three';
import {SVGLoader} from 'three/examples/jsm/loaders/SVGLoader.js';
import {lerp, ramp, settle} from '../anim';
import {PulseDot} from '../components/ui';
import {BACKTEST} from '../data/backtest';
import {LOGO} from '../data/logo';
import {BLUE, C, EASE, FONT, GRAY, H, TURQ, W} from '../theme';
import {local, voF, wordF} from '../timeline';

// S13 · End card (90.0–99.0 s). The official Deploy mark, extruded in three.js from the supplied SVG
// path, flies in and lands face-on on the final hit; it docks into the lockup while the wordmark builds
// glyph by glyph from the official outlines. "Superstar" lands on the narrator's word, then "Now live".

const LOCK = {w: 760, cx: 540, cy: 690}; // lockup width in px, centre
const U = LOCK.w / LOGO.viewBox.w; // px per logo unit
const LX = LOCK.cx - LOCK.w / 2; // lockup left
const LY = LOCK.cy - (LOGO.viewBox.h * U) / 2; // lockup top
const MARK_PX = LOGO.markBox.w * U;
const MARK_CX = LX + MARK_PX / 2, MARK_CY = LY + MARK_PX / 2;

export const T = {
  fly: 0,
  land: 50,
  dock0: 62,
  dock1: 108,
  glyphs: 84,
  superstar: local('S13', voF('L22')),
  live: local('S13', wordF('L22', 'now')),
  url: local('S13', wordF('L22', 'deploy')),
  legal: 230,
} as const;

// flat face shader: front face = exact Blue Glow; extrusion sides on the Blue ramp
const VERT = /* glsl */ `varying vec3 vN; void main(){ vN = normalize(mat3(modelMatrix) * normal); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`;
const FRAG = /* glsl */ `varying vec3 vN; uniform vec3 uFront; uniform vec3 uLit; uniform vec3 uDark;
void main(){ vec3 n = normalize(vN); float fz = n.z; vec3 c = fz > 0.92 ? uFront : (dot(n, normalize(vec3(-0.5,0.7,0.4))) > 0.0 ? uLit : uDark); gl_FragColor = vec4(c,1.0); }`;
const v3 = (h: string) => new THREE.Vector3(parseInt(h.slice(1, 3), 16) / 255, parseInt(h.slice(3, 5), 16) / 255, parseInt(h.slice(5, 7), 16) / 255);

const Mark: React.FC<{f: number}> = ({f}) => {
  const {camera} = useThree();
  const {geo, mat} = useMemo(() => {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="${LOGO.mark}"/></svg>`;
    const data = new SVGLoader().parse(svg);
    const shapes = data.paths.flatMap((p) => SVGLoader.createShapes(p));
    const g = new THREE.ExtrudeGeometry(shapes, {depth: 16, bevelEnabled: true, bevelThickness: 2, bevelSize: 1.6, bevelSegments: 2, curveSegments: 24});
    g.translate(-LOGO.markBox.w / 2, -LOGO.markBox.h / 2, -8);
    g.rotateX(Math.PI); // SVG y-down → three y-up (a rotation keeps winding/normals: the visible cap faces +z)
    const m = new THREE.ShaderMaterial({vertexShader: VERT, fragmentShader: FRAG, uniforms: {uFront: {value: v3(BLUE[500])}, uLit: {value: v3(BLUE[600])}, uDark: {value: v3(BLUE[800])}}, side: THREE.DoubleSide});
    return {geo: g, mat: m};
  }, []);
  // flight: from deep space, spinning, to face-on at frame centre; then docks to the lockup position
  const fly = ramp(f, T.fly, T.land - T.fly, EASE.out);
  const spinY = lerp(Math.PI * 1.25, 0, settle(f, T.fly, T.land - T.fly + 12, 0.08));
  const spinX = lerp(-0.9, 0, fly);
  const dock = ramp(f, T.dock0, T.dock1 - T.dock0, EASE.inOut);
  const size = lerp(lerp(40, 280, fly), MARK_PX, dock); // px
  const x = lerp(540, MARK_CX, dock), y = lerp(lerp(820, MARK_CY, fly), MARK_CY, dock);
  useLayoutEffect(() => {
    const cam = camera as THREE.OrthographicCamera;
    cam.left = -W / 2; cam.right = W / 2; cam.top = H / 2; cam.bottom = -H / 2;
    cam.near = -2000; cam.far = 2000;
    cam.position.set(0, 0, 1000);
    cam.lookAt(0, 0, 0);
    cam.updateProjectionMatrix();
  });
  const s = size / LOGO.markBox.w;
  return (
    <group position={[x - 540, -(y - 960), 0]} rotation={[spinX, spinY, 0]} scale={[s, s, s]}>
      <mesh geometry={geo} material={mat} />
    </group>
  );
};

export const S13: React.FC = () => {
  const f = useCurrentFrame();
  const flat = ramp(f, T.dock1 - 4, 8); // 3D → exact 2D vector
  const drift = lerp(1, 1.025, ramp(f, 0, 540, EASE.soft));
  const sup = ramp(f, Math.max(T.superstar - 4, T.dock1 - 20), 30, EASE.out);
  const live = settle(f, T.live - 2, 22, 0.25);
  const url = ramp(f, T.url, 24, EASE.out);
  const legal = ramp(f, T.legal, 30, EASE.out);
  const rule = ramp(f, Math.max(T.superstar - 10, T.dock1 - 26), 40, EASE.sys);

  return (
    <AbsoluteFill style={{background: C.white}}>
      <AbsoluteFill style={{transform: `scale(${drift})`, transformOrigin: '540px 900px'}}>
        {/* 3D mark (until it has docked) */}
        {flat < 1 && (
          <AbsoluteFill style={{opacity: 1 - flat}}>
            <ThreeCanvas width={W} height={H} orthographic gl={{antialias: true}} camera={{position: [0, 0, 1000], zoom: 1}}>
              <Mark f={f} />
            </ThreeCanvas>
          </AbsoluteFill>
        )}
        {/* official lockup (exact vectors) */}
        <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
          <g transform={`translate(${LX} ${LY}) scale(${U})`}>
            <path d={LOGO.mark} fill={BLUE[500]} fillRule="evenodd" opacity={flat} />
            {LOGO.glyphs.map((g, i) => {
              const p = ramp(f, T.glyphs + i * 5, 26, EASE.out);
              return (
                <g key={g.ch}>
                  <clipPath id={`s13g${i}`}>
                    <rect x={g.x0 - 4} y={-10} width={g.x1 - g.x0 + 8} height={160} />
                  </clipPath>
                  <g clipPath={`url(#s13g${i})`}>
                    <path d={g.d} fill="#000000" transform={`translate(0 ${(1 - p) * 150})`} />
                  </g>
                </g>
              );
            })}
          </g>
        </svg>

        {/* product line */}
        <div style={{position: 'absolute', left: 72, right: 72, top: 860, height: 2, background: GRAY[600], transformOrigin: 'left', transform: `scaleX(${rule})`}} />
        <div style={{position: 'absolute', left: 72, top: 902, overflow: 'hidden', paddingBottom: 12}}>
          <div style={{transform: `translateY(${(1 - sup) * 110}%)`, fontFamily: FONT.serif, fontSize: 168, lineHeight: 1, color: BLUE[500], letterSpacing: '-0.03em'}}>Superstar</div>
        </div>
        <div style={{position: 'absolute', left: 72, top: 1110, display: 'flex', alignItems: 'center', gap: 22}}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 12,
              padding: '14px 26px',
              borderRadius: 999,
              background: TURQ[500],
              color: '#000000',
              fontFamily: FONT.mono,
              fontSize: 28,
              letterSpacing: '.16em',
              transform: `scale(${live})`,
              transformOrigin: 'left center',
            }}
          >
            NOW LIVE
          </div>
          <div style={{fontFamily: FONT.mono, fontSize: 30, color: C.ink, letterSpacing: '.02em', opacity: url, transform: `translateX(${(1 - url) * 20}px)`}}>deploy.finance/superstar</div>
        </div>

        {/* legal */}
        <div style={{position: 'absolute', left: 72, right: 72, top: 1262, opacity: legal, transform: `translateY(${(1 - legal) * 16}px)`}}>
          <div style={{display: 'flex', alignItems: 'center', gap: 14, fontFamily: FONT.mono, fontSize: 22, color: GRAY[900], letterSpacing: '.04em', marginBottom: 16}}>
            <PulseDot size={12} color={BLUE[500]} />
            <span>spot · perps · HIP-3 on Hyperliquid · $10,000 USDC minimum</span>
          </div>
          <div style={{fontFamily: FONT.sans, fontSize: 24, lineHeight: 1.45, color: GRAY[900]}}>
            {BACKTEST.disclaimer} Not investment advice. May not be available in all jurisdictions.
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export const CUES: {at: number; kind: string; note?: string}[] = [
  {at: 0, kind: 'whoosh_reverse', note: 'mark flies in from depth, spinning'},
  {at: T.land, kind: 'impact_big', note: 'FINAL HIT — the mark lands face-on'},
  {at: T.land + 2, kind: 'logo_sting', note: 'tonal shimmer + soft hit'},
  {at: T.dock0 + 8, kind: 'swipe', note: 'mark docks into the lockup'},
  {at: T.glyphs, kind: 'type', note: 'dur=40 wordmark glyphs rise (6 soft ticks)'},
  {at: T.superstar, kind: 'shimmer', note: '"Superstar"'},
  {at: T.live + 4, kind: 'pop', note: 'NOW LIVE pill'},
  {at: T.url, kind: 'tick', note: 'url'},
];

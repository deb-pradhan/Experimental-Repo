import {ThreeCanvas} from '@remotion/three';
import {useThree} from '@react-three/fiber';
import React, {useLayoutEffect, useMemo, useRef} from 'react';
import {useCurrentFrame} from 'remotion';
import * as THREE from 'three';
import {LOGO} from '../brand/logo-data';
import {C, H, W} from '../theme';
import {applyCam, CARDS, cardAt, houseShape, markState, N, SCAN_Z, scanY} from './pileModel';
import {ATLAS, cvAtlas, rowTexture} from './textures';

const VERT = /* glsl */ `
attribute float iShade;
attribute float iMorph;
attribute float iVariant;
attribute float iLod;
varying float vLod;
varying vec2 vUv;
varying float vShade;
varying float vMorph;
varying float vVariant;
void main() {
  vUv = uv;
  vShade = iShade;
  vMorph = iMorph;
  vVariant = iVariant;
  vLod = iLod;
  gl_Position = projectionMatrix * modelViewMatrix * instanceMatrix * vec4(position, 1.0);
}`;

// Flat and unlit: texture × palette shade, written as raw sRGB. No lighting, no fog.
const FRAG = /* glsl */ `
uniform sampler2D uAtlas;
uniform sampler2D uRow;
varying vec2 vUv;
varying float vShade;
varying float vMorph;
varying float vVariant;
varying float vLod;
void main() {
  // Explicit LOD per card (computed on the CPU from its projected footprint).
  // SwiftShader's screen-space derivatives are noisy on tilted quads, which made
  // hardware mip selection random and the cards grainy.
  // Round the per-instance constant: perspective interpolation turns 3.0 into 2.99999 on
  // tilted quads, and floor() would then pick a neighbouring atlas cell per pixel.
  float v = floor(vVariant + 0.5);
  float cx = mod(v, 4.0);
  float cy = floor(v / 4.0 + 0.01);
  vec2 auv = vec2((cx * 512.0 + vUv.x * 362.0) / 2048.0, 1.0 - (cy * 512.0 + (1.0 - vUv.y) * 512.0) / 1024.0);
  vec4 a = textureLod(uAtlas, auv, vLod);
  vec4 b = textureLod(uRow, vUv, vLod);
  vec4 c = mix(a, b, step(0.5, vMorph));
  if (c.a < 0.5) discard;
  vec3 col = c.rgb;
  if (vShade < 0.99) {
    // Flagged card: remap to exact palette greys (no tints of the accents).
    float l = dot(col, vec3(0.299, 0.587, 0.114));
    float sat = max(col.r, max(col.g, col.b)) - min(col.r, min(col.g, col.b));
    if (sat > 0.08) col = vec3(0.6039);            // accent swatch → #9A9A9A
    else if (l > 0.96) col = vec3(0.8118);         // paper → #CFCFCF (grey block)
    else if (l > 0.70) col = vec3(0.6039);         // light lines → #9A9A9A
    else if (l > 0.25) col = vec3(0.3333);         // mid lines → #555555
    else col = vec3(0.0);
  }
  gl_FragColor = vec4(col, 1.0);
}`;

const Cards: React.FC = () => {
  const f = useCurrentFrame();
  const mesh = useRef<THREE.InstancedMesh>(null);
  const {geometry, material, attrs} = useMemo(() => {
    const g = new THREE.PlaneGeometry(1, 1);
    const shade = new THREE.InstancedBufferAttribute(new Float32Array(N).fill(1), 1);
    const morph = new THREE.InstancedBufferAttribute(new Float32Array(N), 1);
    const variant = new THREE.InstancedBufferAttribute(new Float32Array(CARDS.map((c) => c.variant)), 1);
    const lod = new THREE.InstancedBufferAttribute(new Float32Array(N), 1);
    g.setAttribute('iLod', lod);
    g.setAttribute('iShade', shade);
    g.setAttribute('iMorph', morph);
    g.setAttribute('iVariant', variant);
    const m = new THREE.ShaderMaterial({
      vertexShader: VERT,
      fragmentShader: FRAG,
      uniforms: {uAtlas: {value: cvAtlas()}, uRow: {value: rowTexture()}},
      side: THREE.DoubleSide,
    });
    return {geometry: g, material: m, attrs: {shade, morph, lod}};
  }, []);

  useLayoutEffect(() => {
    const m4 = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const e = new THREE.Euler();
    const p = new THREE.Vector3();
    const s = new THREE.Vector3();
    const cam = new THREE.PerspectiveCamera();
    applyCam(cam, f);
    const corners = [new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3()];
    const px = (v: THREE.Vector3) => {
      v.applyMatrix4(m4).project(cam);
      return [(v.x + 1) * 960, (1 - v.y) * 540];
    };
    CARDS.forEach((c, i) => {
      const st = cardAt(c, i, f);
      e.set(st.rx, st.ry, st.rz, 'ZXY');
      q.setFromEuler(e);
      p.set(st.x, st.y, st.z);
      s.set(st.visible ? st.sx : 0.0001, st.visible ? st.sy : 0.0001, 1);
      m4.compose(p, q, s);
      mesh.current!.setMatrixAt(i, m4);
      attrs.shade.setX(i, st.shade);
      attrs.morph.setX(i, st.morph);
      // texels per screen pixel along each card axis → mip level
      const [a0, a1] = px(corners[0].set(-0.5, 0.5, 0));
      const [b0, b1] = px(corners[1].set(0.5, 0.5, 0));
      const [c0, c1] = px(corners[2].set(-0.5, -0.5, 0));
      const lu = Math.hypot(b0 - a0, b1 - a1);
      const lv = Math.hypot(c0 - a0, c1 - a1);
      const [tw, th] = st.morph ? [2048, 256] : [ATLAS.cardW, ATLAS.cell];
      const ratio = Math.max(tw / Math.max(lu, 0.5), th / Math.max(lv, 0.5));
      attrs.lod.setX(i, Math.max(0, Math.log2(ratio)));
    });
    mesh.current!.instanceMatrix.needsUpdate = true;
    attrs.shade.needsUpdate = true;
    attrs.morph.needsUpdate = true;
    attrs.lod.needsUpdate = true;
  }, [f, attrs]);

  return <instancedMesh ref={mesh} args={[geometry, material, N]} frustumCulled={false} />;
};

// The official house mark, extruded in one flat blue (no rim that could read as an outline),
// the tie knocked out as a real hole.
const Mark: React.FC = () => {
  const f = useCurrentFrame();
  const {geo, mats} = useMemo(() => {
    const g = new THREE.ExtrudeGeometry(houseShape(LOGO.mark.d), {depth: 10, bevelEnabled: false, curveSegments: 16});
    g.translate(0, 0, -5);
    return {geo: g, mats: [new THREE.MeshBasicMaterial({color: C.blue}), new THREE.MeshBasicMaterial({color: C.blue})]};
  }, []);
  const st = markState(f);
  return (
    <mesh geometry={geo} material={mats} position={[st.x, st.y, st.z]} rotation={[st.rx, st.ry, st.rz]} scale={[st.s, st.s, st.s]} visible={st.visible} />
  );
};

const ScanLine: React.FC = () => {
  const f = useCurrentFrame();
  const y = scanY(f);
  const visible = f > 270 && f < 380;
  return (
    <mesh position={[400, y, SCAN_Z]} visible={visible}>
      <planeGeometry args={[6000, 3]} />
      <meshBasicMaterial color={C.white} />
    </mesh>
  );
};

const CameraRig: React.FC = () => {
  const f = useCurrentFrame();
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  useLayoutEffect(() => {
    applyCam(camera, f);
  }, [camera, f]);
  return null;
};

export const PileCanvas: React.FC = () => (
  <ThreeCanvas flat linear={false} width={W} height={H} style={{background: C.black}} camera={{fov: 30, near: 150, far: 40000}}>
    <CameraRig />
    <Cards />
    <ScanLine />
    <Mark />
  </ThreeCanvas>
);

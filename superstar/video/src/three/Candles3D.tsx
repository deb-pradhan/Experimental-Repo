import {ThreeCanvas} from '@remotion/three';
import {useThree} from '@react-three/fiber';
import React, {useLayoutEffect, useMemo, useRef} from 'react';
import * as THREE from 'three';

// ------------------------------------------------------------------
// Flat, unlit box renderer for data: every instance is a box whose faces are
// coloured from a small ramp palette by facing (top / key side / shadow side).
// Colours are raw sRGB (no three colour management) so ramp hexes land exactly.
// ------------------------------------------------------------------

export type Kind = number; // index into PALETTE rows
const rgb = (h: string) => [parseInt(h.slice(1, 3), 16) / 255, parseInt(h.slice(3, 5), 16) / 255, parseInt(h.slice(5, 7), 16) / 255];

const VERT = /* glsl */ `
attribute float iKind;
varying vec3 vN;
varying float vKind;
void main(){
  vKind = iKind;
  vN = normalize(mat3(modelMatrix) * mat3(instanceMatrix) * normal);
  gl_Position = projectionMatrix * modelViewMatrix * instanceMatrix * vec4(position,1.0);
}`;

const makeFrag = (rows: number) => /* glsl */ `
uniform vec3 uTop[${rows}];
uniform vec3 uLit[${rows}];
uniform vec3 uDark[${rows}];
uniform vec3 uKey;
varying vec3 vN;
varying float vKind;
void main(){
  int k = int(floor(vKind + 0.5));
  vec3 top = uTop[0]; vec3 lit = uLit[0]; vec3 dk = uDark[0];
  for (int i = 0; i < ${rows}; i++) { if (i == k) { top = uTop[i]; lit = uLit[i]; dk = uDark[i]; } }
  vec3 n = normalize(vN);
  vec3 c = abs(n.y) > 0.6 ? top : (dot(n, normalize(uKey)) > 0.0 ? lit : dk);
  gl_FragColor = vec4(c, 1.0);
}`;

export type Palette = {top: string; lit: string; dark: string}[];

export type BoxInst = {x: number; y: number; z: number; sx: number; sy: number; sz: number; kind: Kind};

export const Boxes: React.FC<{items: BoxInst[]; palette: Palette; max: number; keyDir?: [number, number, number]}> = ({
  items,
  palette,
  max,
  keyDir = [0.6, 0.3, 0.8],
}) => {
  const ref = useRef<THREE.InstancedMesh>(null);
  const {geo, mat, kindAttr} = useMemo(() => {
    const g = new THREE.BoxGeometry(1, 1, 1);
    const ka = new THREE.InstancedBufferAttribute(new Float32Array(max), 1);
    g.setAttribute('iKind', ka);
    const m = new THREE.ShaderMaterial({
      vertexShader: VERT,
      fragmentShader: makeFrag(palette.length),
      uniforms: {
        uTop: {value: palette.map((p) => new THREE.Vector3(...rgb(p.top)))},
        uLit: {value: palette.map((p) => new THREE.Vector3(...rgb(p.lit)))},
        uDark: {value: palette.map((p) => new THREE.Vector3(...rgb(p.dark)))},
        uKey: {value: new THREE.Vector3(...keyDir)},
      },
    });
    return {geo: g, mat: m, kindAttr: ka};
  }, [max, palette, keyDir]);
  const m4 = useMemo(() => new THREE.Matrix4(), []);
  useLayoutEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    const n = Math.min(items.length, max);
    for (let i = 0; i < n; i++) {
      const b = items[i];
      m4.makeScale(Math.max(1e-4, b.sx), Math.max(1e-4, b.sy), Math.max(1e-4, b.sz));
      m4.setPosition(b.x, b.y, b.z);
      mesh.setMatrixAt(i, m4);
      kindAttr.setX(i, b.kind);
    }
    mesh.count = n;
    mesh.instanceMatrix.needsUpdate = true;
    kindAttr.needsUpdate = true;
  });
  return <instancedMesh ref={ref} args={[geo, mat, max]} frustumCulled={false} />;
};

/** Sets the perspective camera each frame. */
export const Cam: React.FC<{pos: [number, number, number]; look: [number, number, number]; fov?: number; roll?: number}> = ({pos, look, fov = 38, roll = 0}) => {
  const {camera} = useThree();
  useLayoutEffect(() => {
    const c = camera as THREE.PerspectiveCamera;
    c.position.set(...pos);
    c.up.set(Math.sin(roll), Math.cos(roll), 0);
    c.lookAt(...look);
    c.fov = fov;
    c.near = 0.1;
    c.far = 400;
    c.updateProjectionMatrix();
  });
  return null;
};

export const Stage: React.FC<{width: number; height: number; children: React.ReactNode}> = ({width, height, children}) => (
  <ThreeCanvas width={width} height={height} gl={{antialias: true}} camera={{fov: 38, position: [0, 0, 10]}} style={{position: 'absolute', inset: 0}}>
    {children}
  </ThreeCanvas>
);

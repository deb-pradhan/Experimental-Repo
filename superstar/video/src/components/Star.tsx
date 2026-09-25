import {ThreeCanvas} from '@remotion/three';
import React, {useMemo} from 'react';
import * as THREE from 'three';
import {BLUE} from '../theme';

// ------------------------------------------------------------------
// The Superstar core: a stellated icosahedron (a pyramid spike on every face),
// matching the hero plate's star so the plate can match-cut into it.
// Flat facets shaded by a fixed key light and quantised onto the Blue Glow ramp.
// ------------------------------------------------------------------

export const starGeometry = (r = 1, spike = 0.75) => {
  // Stellated dodecahedron: a pentagonal pyramid on each of the 12 faces (matches the hero plate).
  const dod = new THREE.DodecahedronGeometry(r, 0).toNonIndexed();
  const p = dod.getAttribute('position');
  const tris: THREE.Vector3[][] = [];
  for (let i = 0; i < p.count; i += 3)
    tris.push([0, 1, 2].map((k) => new THREE.Vector3().fromBufferAttribute(p, i + k)));
  // group triangles by face normal → pentagons
  const faces: {n: THREE.Vector3; v: THREE.Vector3[]}[] = [];
  for (const t of tris) {
    const n = t[1].clone().sub(t[0]).cross(t[2].clone().sub(t[0])).normalize();
    let face = faces.find((fc) => fc.n.dot(n) > 0.999);
    if (!face) faces.push((face = {n, v: []}));
    for (const v of t) if (!face.v.some((u) => u.distanceTo(v) < 1e-5)) face.v.push(v);
  }
  const out: number[] = [];
  for (const fc of faces) {
    const cen = fc.v.reduce((acc, v) => acc.add(v), new THREE.Vector3()).multiplyScalar(1 / fc.v.length);
    const u = fc.v[0].clone().sub(cen).normalize();
    const w = fc.n.clone().cross(u);
    const vs = [...fc.v].sort((A, B) => {
      const a1 = Math.atan2(A.clone().sub(cen).dot(w), A.clone().sub(cen).dot(u));
      const b1 = Math.atan2(B.clone().sub(cen).dot(w), B.clone().sub(cen).dot(u));
      return a1 - b1;
    });
    const apex = cen.clone().normalize().multiplyScalar(r + spike);
    for (let k = 0; k < vs.length; k++) {
      const A = vs[k], B = vs[(k + 1) % vs.length];
      out.push(A.x, A.y, A.z, B.x, B.y, B.z, apex.x, apex.y, apex.z);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(out, 3));
  g.computeVertexNormals();
  return g;
};

const VERT = /* glsl */ `
varying vec3 vN;
void main(){
  vN = normalize(mat3(modelMatrix) * normal);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
}`;
// Facet shade → Blue Glow ramp (900, 800, 700, 600, 500, 400, 300).
const FRAG = /* glsl */ `
varying vec3 vN;
uniform vec3 r0; uniform vec3 r1; uniform vec3 r2; uniform vec3 r3; uniform vec3 r4; uniform vec3 r5; uniform vec3 r6;
uniform vec3 uKey;
uniform float uLift;
void main(){
  float d = dot(normalize(vN), normalize(uKey));
  float s = clamp(d*0.5+0.5 + uLift, 0.0, 1.0) * 6.0;
  vec3 c = mix(r0, r1, clamp(s, 0.0, 1.0));
  c = mix(c, r2, clamp(s-1.0, 0.0, 1.0));
  c = mix(c, r3, clamp(s-2.0, 0.0, 1.0));
  c = mix(c, r4, clamp(s-3.0, 0.0, 1.0));
  c = mix(c, r5, clamp(s-4.0, 0.0, 1.0));
  c = mix(c, r6, clamp(s-5.0, 0.0, 1.0));
  gl_FragColor = vec4(c, 1.0);
}`;

// Raw sRGB triplets (bypass three's linear colour management so ramp hexes land exactly).
const col = (h: string) => new THREE.Vector3(parseInt(h.slice(1, 3), 16) / 255, parseInt(h.slice(3, 5), 16) / 255, parseInt(h.slice(5, 7), 16) / 255);

export const StarMesh: React.FC<{rot: [number, number, number]; scale?: number; lift?: number; spike?: number; seams?: boolean}> = ({rot, scale = 1, lift = -0.14, spike = 0.75, seams = true}) => {
  const geo = useMemo(() => starGeometry(1, spike), [spike]);
  const edges = useMemo(() => new THREE.EdgesGeometry(geo, 1), [geo]);
  const edgeMat = useMemo(() => new THREE.LineBasicMaterial({color: new THREE.Color().setRGB(0x14 / 255, 0x18 / 255, 0x42 / 255, THREE.SRGBColorSpace)}), []);
  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: VERT,
        fragmentShader: FRAG,
        uniforms: {
          r0: {value: col(BLUE[900])}, r1: {value: col(BLUE[800])}, r2: {value: col(BLUE[700])}, r3: {value: col(BLUE[600])},
          r4: {value: col(BLUE[500])}, r5: {value: col(BLUE[400])}, r6: {value: col(BLUE[300])},
          uKey: {value: new THREE.Vector3(-0.35, 0.75, 0.8)},
          uLift: {value: 0},
        },
      }),
    [],
  );
  mat.uniforms.uLift.value = lift;
  return (
    <group rotation={rot} scale={scale}>
      <mesh geometry={geo} material={mat} />
      {seams ? <lineSegments geometry={edges} material={edgeMat} /> : null}
    </group>
  );
};

/** Full-frame canvas with one star. x/y in px from the frame centre, size = star diameter in px. */
export const Star3D: React.FC<{
  width: number;
  height: number;
  x?: number;
  y?: number;
  size: number;
  rot: [number, number, number];
  lift?: number;
  spike?: number;
}> = ({width, height, x = 0, y = 0, size, rot, lift, spike}) => {
  // Orthographic camera in pixel units, so placement is exact in 2D layout terms.
  return (
    <ThreeCanvas
      width={width}
      height={height}
      orthographic
      camera={{left: -width / 2, right: width / 2, top: height / 2, bottom: -height / 2, near: -5000, far: 5000, position: [0, 0, 1000], zoom: 1}}
      gl={{antialias: true}}
      style={{position: 'absolute', inset: 0}}
    >
      <group position={[x, -y, 0]}>
        <StarMesh rot={rot} scale={size / (2 * (1 + (spike ?? 0.75)))} lift={lift} spike={spike} />
      </group>
    </ThreeCanvas>
  );
};

/** 2D glyph of the star (for diagrams / small UI): 8-point star with faceted halves. */
export const StarGlyph: React.FC<{size: number; color?: string; light?: string; style?: React.CSSProperties}> = ({
  size,
  color = BLUE[500],
  light = BLUE[400],
  style,
}) => {
  const n = 8, R = 50, r = 24;
  const pts = Array.from({length: n * 2}, (_, i) => {
    const a = (i / (n * 2)) * Math.PI * 2 - Math.PI / 2;
    const rr = i % 2 === 0 ? R : r;
    return [50 + Math.cos(a) * rr, 50 + Math.sin(a) * rr];
  });
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" style={style}>
      {pts.map((p, i) => {
        const q = pts[(i + 1) % pts.length];
        return <polygon key={i} points={`50,50 ${p[0]},${p[1]} ${q[0]},${q[1]}`} fill={i % 2 === 0 ? color : light} />;
      })}
    </svg>
  );
};

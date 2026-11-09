"use client";

/**
 * Kanvas latar 3D — HANYA tier "rich" (perangkat kuat), dimuat setelah amplop dibuka.
 *
 *  #10 Bidang shader: riak cahaya halus seperti pantulan air di atas kertas (warna palet, alfa rendah)
 *  #7  Daun & kelopak melayang pelan tanpa gravitasi
 *  #4  Scrollytelling: seluruh lingkungan berotasi & bergeser mengikuti arah/kecepatan scroll
 *  #9  Parallax kursor: objek bergerak sedikit BERLAWANAN arah mouse
 *
 * Anggaran: 22 daun × 12 segitiga + 14 kelopak × 32 + 2 segitiga shader ≈ 720 segitiga,
 * dpr maks 1.25, dirender di belakang konten (pointer-events: none). rAF berhenti saat tab tersembunyi.
 */
import { Canvas, useFrame, useLoader, useThree } from "@react-three/fiber";
import { Suspense, useEffect, useMemo, useRef } from "react";
import * as THREE from "three";

const PALETTE = ["#DCAE96", "#C48F75", "#E6C5B4", "#722F37", "#B47A79"];
const rand = (a: number, b: number) => a + Math.random() * (b - a);

/* ------------------------------------------------------------------ input bersama */
const input = { scroll: 0, scrollVel: 0, mouseX: 0, mouseY: 0 };

function useGlobalInput() {
  useEffect(() => {
    let last = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      input.scroll = y / max;
      input.scrollVel += (y - last) * 0.002;
      last = y;
    };
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      input.mouseX = (e.clientX / window.innerWidth) * 2 - 1;
      input.mouseY = (e.clientY / window.innerHeight) * 2 - 1;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("pointermove", onMove);
    };
  }, []);
}

/* ------------------------------------------------------------------ #10 riak cahaya */
const rippleVertex = /* glsl */ `
  varying vec2 vUv;
  void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }
`;
const rippleFragment = /* glsl */ `
  precision mediump float;
  varying vec2 vUv;
  uniform float uTime;
  uniform float uScroll;
  uniform vec2 uRes;
  // Kaustik ringan: jumlah gelombang sinus berlapis → garis-garis cahaya lembut.
  float caustic(vec2 p, float t) {
    float v = 0.0;
    for (int i = 1; i <= 3; i++) {
      float fi = float(i);
      p += vec2(sin(p.y * 1.7 * fi + t * 0.35), cos(p.x * 1.3 * fi - t * 0.3)) * 0.35 / fi;
      v += sin(p.x * 2.2 + p.y * 1.4 + t * 0.2) / fi;
    }
    return v;
  }
  void main() {
    vec2 p = (vUv - 0.5) * vec2(uRes.x / uRes.y, 1.0) * 3.0;
    p.y += uScroll * 4.0;
    float c = caustic(p, uTime);
    float light = smoothstep(0.55, 1.35, abs(c));
    vec3 rose = vec3(0.863, 0.682, 0.588);
    vec3 blush = vec3(0.973, 0.933, 0.910);
    vec3 col = mix(blush, rose, light);
    gl_FragColor = vec4(col, light * 0.16);
  }
`;

function RippleBackdrop() {
  const mat = useRef<THREE.ShaderMaterial>(null);
  const { size } = useThree();
  const uniforms = useMemo(
    () => ({ uTime: { value: 0 }, uScroll: { value: 0 }, uRes: { value: new THREE.Vector2(1, 1) } }),
    [],
  );
  useFrame(({ clock }) => {
    if (!mat.current) return;
    mat.current.uniforms.uTime.value = clock.elapsedTime;
    mat.current.uniforms.uScroll.value = THREE.MathUtils.lerp(mat.current.uniforms.uScroll.value, input.scroll, 0.08);
    mat.current.uniforms.uRes.value.set(size.width, size.height);
  });
  return (
    <mesh frustumCulled={false} renderOrder={-1}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial ref={mat} vertexShader={rippleVertex} fragmentShader={rippleFragment} uniforms={uniforms} transparent depthWrite={false} depthTest={false} />
    </mesh>
  );
}

/* ------------------------------------------------------------------ #7 daun & kelopak */
function makeLeafGeometry() {
  const s = new THREE.Shape();
  s.moveTo(0, -0.5);
  s.bezierCurveTo(0.32, -0.25, 0.32, 0.25, 0, 0.5);
  s.bezierCurveTo(-0.32, 0.25, -0.32, -0.25, 0, -0.5);
  const g = new THREE.ShapeGeometry(s, 6);
  const pos = g.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < pos.count; i++) pos.setZ(i, -0.18 * pos.getX(i) ** 2 * 4); // lengkung tulang daun
  g.computeVertexNormals();
  return g;
}

type Floater = { base: THREE.Vector3; amp: THREE.Vector3; speed: number; phase: number; spin: THREE.Vector3; scale: number };

function makeFloaters(n: number, depth: [number, number]): Floater[] {
  return Array.from({ length: n }, () => ({
    base: new THREE.Vector3(rand(-7, 7), rand(-5, 5), rand(depth[0], depth[1])),
    amp: new THREE.Vector3(rand(0.2, 0.6), rand(0.3, 0.8), rand(0.1, 0.4)),
    speed: rand(0.08, 0.22),
    phase: rand(0, Math.PI * 2),
    spin: new THREE.Vector3(rand(-0.3, 0.3), rand(-0.4, 0.4), rand(-0.2, 0.2)),
    scale: rand(0.35, 0.8),
  }));
}

function Floaters({ geometry, material, items }: { geometry: THREE.BufferGeometry; material: THREE.Material; items: Floater[] }) {
  const mesh = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  useFrame(({ clock }) => {
    const m = mesh.current;
    if (!m) return;
    const t = clock.elapsedTime;
    items.forEach((f, i) => {
      // Zero-gravity: lintasan Lissajous lambat di sekitar titik dasar
      dummy.position.set(
        f.base.x + Math.sin(t * f.speed + f.phase) * f.amp.x,
        f.base.y + Math.sin(t * f.speed * 0.8 + f.phase * 1.3) * f.amp.y,
        f.base.z + Math.cos(t * f.speed * 0.6 + f.phase) * f.amp.z,
      );
      dummy.rotation.set(f.phase + t * f.spin.x, t * f.spin.y, f.phase * 0.5 + t * f.spin.z);
      dummy.scale.setScalar(f.scale);
      dummy.updateMatrix();
      m.setMatrixAt(i, dummy.matrix);
    });
    m.instanceMatrix.needsUpdate = true;
  });
  return <instancedMesh ref={mesh} args={[geometry, material, items.length]} frustumCulled={false} />;
}

function Botanicals() {
  const group = useRef<THREE.Group>(null);
  const petalMap = useLoader(THREE.TextureLoader, "/images/fx/petal-3.webp");
  const leafGeo = useMemo(makeLeafGeometry, []);
  const petalGeo = useMemo(() => {
    const g = new THREE.PlaneGeometry(1, 1, 4, 4);
    const pos = g.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < pos.count; i++) pos.setZ(i, -0.3 * pos.getX(i) ** 2);
    g.computeVertexNormals();
    return g;
  }, []);
  const leafMats = useMemo(
    () => PALETTE.map((c) => new THREE.MeshLambertMaterial({ color: c, side: THREE.DoubleSide, transparent: true, opacity: 0.55 })),
    [],
  );
  const petalMat = useMemo(() => {
    petalMap.colorSpace = THREE.SRGBColorSpace;
    return new THREE.MeshLambertMaterial({ map: petalMap, transparent: true, alphaTest: 0.15, side: THREE.DoubleSide, opacity: 0.7 });
  }, [petalMap]);
  const leafGroups = useMemo(() => PALETTE.map(() => makeFloaters(5, [-6, -1])), []);
  const petals = useMemo(() => makeFloaters(14, [-4, 1]), []);

  useFrame((_, dt) => {
    const g = group.current;
    if (!g) return;
    input.scrollVel *= Math.pow(0.04, dt); // redam kecepatan scroll
    // #4 rotasi & geser mengikuti scroll; #9 parallax kursor berlawanan arah
    const targetRotY = input.scroll * Math.PI * 0.9 - input.mouseX * 0.12;
    const targetRotX = -input.mouseY * 0.08 + input.scrollVel * 0.6;
    g.rotation.y = THREE.MathUtils.damp(g.rotation.y, targetRotY, 3, dt);
    g.rotation.x = THREE.MathUtils.damp(g.rotation.x, targetRotX, 3, dt);
    g.position.x = THREE.MathUtils.damp(g.position.x, -input.mouseX * 0.6, 2.5, dt);
    g.position.y = THREE.MathUtils.damp(g.position.y, input.mouseY * 0.4 + input.scroll * 3 - 1.5, 2.5, dt);
  });

  return (
    <group ref={group}>
      {leafGroups.map((items, i) => (
        <Floaters key={i} geometry={leafGeo} material={leafMats[i]} items={items} />
      ))}
      <Floaters geometry={petalGeo} material={petalMat} items={petals} />
    </group>
  );
}

export default function BackgroundCanvas() {
  useGlobalInput();
  return (
    <Canvas
      dpr={[1, 1.25]}
      camera={{ fov: 50, position: [0, 0, 9] }}
      gl={{ alpha: true, antialias: false, powerPreference: "low-power", stencil: false }}
      onCreated={({ gl }) => gl.setClearColor(0x000000, 0)}
    >
      <ambientLight intensity={1.7} />
      <directionalLight position={[3, 5, 6]} intensity={1.1} />
      <RippleBackdrop />
      <Suspense fallback={null}>
        <Botanicals />
      </Suspense>
    </Canvas>
  );
}

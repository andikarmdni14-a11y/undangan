"use client";

/**
 * Layer WebGL (React Three Fiber): kelopak mawar & kupu-kupu yang memancar dari saku amplop
 * MENUJU layar (sumbu z), memberi kedalaman yang tidak bisa dicapai versi DOM.
 *
 * Anggaran (PRD §7): ±30 kelopak × 32 segitiga + 8 kupu-kupu × 4 segitiga ≈ 1.000 segitiga
 * (batas 30.000), tekstur total ±150 KB, tanpa model .glb. Canvas di-unmount setelah burst
 * selesai sehingga GPU kembali idle.
 */
import { Canvas, useFrame, useLoader, useThree } from "@react-three/fiber";
import { Suspense, useEffect, useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";

const PETAL_URLS = Array.from({ length: 9 }, (_, i) => `/images/fx/petal-${i + 1}.webp`);
const WING_URLS = ["/images/fx/butterfly-left.webp", "/images/fx/butterfly-right.webp"];

const FOV = 45;
const CAMERA_Z = 10;
const PETAL_LIFE = 4.6;
const BUTTERFLY_LIFE = 5.2;
/** Total durasi sebelum layer dilepas (detik, termasuk jeda awal terpanjang). */
export const PARTICLE_TOTAL_SECONDS = 6.6;

export type ParticleCanvasProps = {
  /** Titik asal di layar (px, relatif viewport). */
  origin: { x: number; y: number };
  /** Jeda sebelum partikel pertama keluar (detik), selaraskan dengan tutup amplop. */
  startDelay?: number;
  onDone?: () => void;
  onError?: () => void;
};

const rand = (min: number, max: number) => min + Math.random() * (max - min);
const easeOut = (k: number) => 1 - Math.pow(1 - k, 3);

/** Konversi px layar → koordinat dunia pada bidang z = 0. */
function screenToWorld(px: { x: number; y: number }, width: number, height: number) {
  const halfH = CAMERA_Z * Math.tan(THREE.MathUtils.degToRad(FOV / 2));
  const halfW = halfH * (width / height);
  return new THREE.Vector3((px.x / width) * 2 * halfW - halfW, halfH - (px.y / height) * 2 * halfH, 0);
}

/* ------------------------------------------------------------------ kelopak */

type Petal = {
  p0: THREE.Vector3;
  v0: THREE.Vector3;
  spin: THREE.Vector3;
  sway: number;
  swayFreq: number;
  phase: number;
  size: number;
  delay: number;
};

/** Bidang 4×4 yang dilengkungkan seperti mangkuk → kelopak tampak bervolume saat berputar. */
function makePetalGeometry() {
  const g = new THREE.PlaneGeometry(1, 1, 4, 4);
  const pos = g.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    pos.setZ(i, -0.35 * (x * x) - 0.15 * (y * y));
  }
  g.computeVertexNormals();
  return g;
}

function PetalGroup({ texture, petals, origin }: { texture: THREE.Texture; petals: Petal[]; origin: THREE.Vector3 }) {
  const mesh = useRef<THREE.InstancedMesh>(null);
  const geometry = useMemo(makePetalGeometry, []);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const start = useRef<number | null>(null);

  useFrame(({ clock }) => {
    const m = mesh.current;
    if (!m) return;
    if (start.current === null) start.current = clock.elapsedTime;
    const now = clock.elapsedTime - start.current;
    const k = 1.6; // hambatan udara: dorongan awal cepat habis
    const g = 0.9; // gravitasi kecil: kelopak melayang turun perlahan

    petals.forEach((p, i) => {
      const t = now - p.delay;
      if (t <= 0 || t > PETAL_LIFE) {
        dummy.scale.setScalar(0);
      } else {
        const drag = (1 - Math.exp(-k * t)) / k;
        dummy.position.set(
          origin.x + p.p0.x + p.v0.x * drag + p.sway * Math.sin(p.swayFreq * t + p.phase),
          origin.y + p.p0.y + (p.v0.y + g / k) * drag - (g / k) * t,
          Math.min(5, origin.z + p.p0.z + p.v0.z * drag),
        );
        dummy.rotation.set(p.spin.x * t + p.phase, p.spin.y * t, p.spin.z * t + 0.4 * Math.sin(3 * t + p.phase));
        const appear = easeOut(Math.min(1, t / 0.25));
        const fade = t > PETAL_LIFE - 0.9 ? Math.max(0, (PETAL_LIFE - t) / 0.9) : 1;
        dummy.scale.setScalar(p.size * appear * fade);
      }
      dummy.updateMatrix();
      m.setMatrixAt(i, dummy.matrix);
    });
    m.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={mesh} args={[geometry, undefined, petals.length]} frustumCulled={false}>
      <meshLambertMaterial map={texture} transparent alphaTest={0.15} side={THREE.DoubleSide} depthWrite={false} />
    </instancedMesh>
  );
}

/* ------------------------------------------------------------------ kupu-kupu */

type Butterfly = { dir: THREE.Vector3; speed: number; bob: number; flap: number; size: number; delay: number; phase: number };

const WING_ASPECT = 462 / 300;

function makeWingGeometry(side: "left" | "right") {
  const g = new THREE.PlaneGeometry(1, WING_ASPECT);
  // Engsel sayap di garis badan (x = 0): sayap kiri ke −x, kanan ke +x.
  g.translate(side === "left" ? -0.5 : 0.5, 0, 0);
  return g;
}

function ButterflyMesh({
  cfg,
  origin,
  leftMap,
  rightMap,
}: {
  cfg: Butterfly;
  origin: THREE.Vector3;
  leftMap: THREE.Texture;
  rightMap: THREE.Texture;
}) {
  const body = useRef<THREE.Group>(null);
  const left = useRef<THREE.Mesh>(null);
  const right = useRef<THREE.Mesh>(null);
  const leftGeo = useMemo(() => makeWingGeometry("left"), []);
  const rightGeo = useMemo(() => makeWingGeometry("right"), []);
  const start = useRef<number | null>(null);

  useFrame(({ clock }) => {
    if (!body.current || !left.current || !right.current) return;
    if (start.current === null) start.current = clock.elapsedTime;
    const t = clock.elapsedTime - start.current - cfg.delay;
    if (t <= 0 || t > BUTTERFLY_LIFE) {
      body.current.visible = false;
      return;
    }
    body.current.visible = true;
    const travel = (cfg.speed * (1 - Math.exp(-0.9 * t))) / 0.9 + 0.45 * t;
    body.current.position.set(
      origin.x + cfg.dir.x * travel + 0.25 * Math.sin(1.7 * t + cfg.phase),
      origin.y + cfg.dir.y * travel + cfg.bob * Math.sin(5.5 * t + cfg.phase),
      origin.z + Math.min(4, cfg.dir.z * travel),
    );
    // Badan condong searah gerak; sayap mengepak pada sumbu badan.
    body.current.rotation.set(-0.5 + 0.15 * Math.sin(4 * t), 0, -Math.atan2(cfg.dir.x, cfg.dir.y) * 0.6);
    const flap = 0.15 + 1.15 * Math.abs(Math.sin(cfg.flap * t + cfg.phase));
    left.current.rotation.y = flap;
    right.current.rotation.y = -flap;
    const appear = easeOut(Math.min(1, t / 0.35));
    const fade = t > BUTTERFLY_LIFE - 0.8 ? Math.max(0, (BUTTERFLY_LIFE - t) / 0.8) : 1;
    body.current.scale.setScalar(cfg.size * appear * fade);
  });

  return (
    <group ref={body} visible={false}>
      <mesh ref={left} geometry={leftGeo}>
        <meshLambertMaterial map={leftMap} transparent alphaTest={0.2} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
      <mesh ref={right} geometry={rightGeo}>
        <meshLambertMaterial map={rightMap} transparent alphaTest={0.2} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
    </group>
  );
}

/* ------------------------------------------------------------------ scene */

function Burst({ origin, startDelay }: { origin: { x: number; y: number }; startDelay: number }) {
  const { size } = useThree();
  const petalMaps = useLoader(THREE.TextureLoader, PETAL_URLS);
  const [leftMap, rightMap] = useLoader(THREE.TextureLoader, WING_URLS);

  useLayoutEffect(() => {
    [...petalMaps, leftMap, rightMap].forEach((t) => {
      t.colorSpace = THREE.SRGBColorSpace;
      t.anisotropy = 2;
    });
  }, [petalMaps, leftMap, rightMap]);

  const world = useMemo(() => screenToWorld(origin, size.width, size.height), [origin, size.width, size.height]);
  const small = size.width < 640;

  // Satu InstancedMesh per tekstur kelopak (9 draw call).
  const petalGroups = useMemo(() => {
    const total = small ? 20 : 30;
    const groups: Petal[][] = PETAL_URLS.map(() => []);
    for (let i = 0; i < total; i++) {
      const spread = (i / (total - 1)) * 2 - 1; // kiri → kanan merata
      groups[i % groups.length].push({
        p0: new THREE.Vector3(rand(-0.3, 0.3), rand(-0.15, 0.15), rand(-0.2, 0.2)),
        v0: new THREE.Vector3(spread * rand(1.6, 3.4), rand(2.4, 4.2), rand(0.8, 3.2)),
        spin: new THREE.Vector3(rand(-3, 3), rand(-3, 3), rand(-2, 2)),
        sway: rand(0.15, 0.45),
        swayFreq: rand(1.5, 3),
        phase: rand(0, Math.PI * 2),
        size: rand(0.26, 0.42),
        delay: startDelay + rand(0, 0.8),
      });
    }
    return groups;
  }, [small, startDelay]);

  const butterflies = useMemo<Butterfly[]>(() => {
    const n = small ? 6 : 8;
    return Array.from({ length: n }, (_, i) => {
      const side = i % 2 === 0 ? -1 : 1;
      const dir = new THREE.Vector3(side * rand(0.35, 1), rand(0.6, 1.1), rand(0.4, 1)).normalize();
      return {
        dir,
        speed: rand(1.4, 2.2),
        bob: rand(0.08, 0.2),
        flap: rand(9, 13),
        size: rand(0.32, 0.45),
        delay: startDelay + 0.35 + i * 0.1 + rand(0, 0.15),
        phase: rand(0, Math.PI * 2),
      };
    });
  }, [small, startDelay]);

  return (
    <>
      <ambientLight intensity={1.6} />
      <directionalLight position={[2, 4, 6]} intensity={1.4} />
      {petalGroups.map((petals, i) =>
        petals.length ? <PetalGroup key={i} texture={petalMaps[i]} petals={petals} origin={world} /> : null,
      )}
      {butterflies.map((b, i) => (
        <ButterflyMesh key={i} cfg={b} origin={world} leftMap={leftMap} rightMap={rightMap} />
      ))}
    </>
  );
}

export default function ParticleCanvas({ origin, startDelay = 0.5, onDone, onError }: ParticleCanvasProps) {
  // Simpan callback di ref: re-render induk tidak boleh mereset timer pelepasan canvas.
  const onDoneRef = useRef(onDone);
  const onErrorRef = useRef(onError);
  useEffect(() => {
    onDoneRef.current = onDone;
    onErrorRef.current = onError;
  });
  // Saat canvas dilepas, three.js sengaja memutus konteks (forceContextLoss) → abaikan event itu.
  const finished = useRef(false);
  useEffect(() => {
    const id = window.setTimeout(() => {
      finished.current = true;
      onDoneRef.current?.();
    }, PARTICLE_TOTAL_SECONDS * 1000);
    return () => {
      finished.current = true;
      window.clearTimeout(id);
    };
  }, []);

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-40">
      <Canvas
        dpr={[1, 1.75]}
        camera={{ fov: FOV, position: [0, 0, CAMERA_Z], near: 0.1, far: 50 }}
        gl={{ alpha: true, antialias: false, powerPreference: "low-power", stencil: false, depth: true }}
        onCreated={({ gl }) => {
          gl.setClearColor(0x000000, 0);
          gl.domElement.addEventListener("webglcontextlost", (e) => {
            e.preventDefault();
            if (!finished.current) onErrorRef.current?.();
          });
        }}
      >
        <Suspense fallback={null}>
          <Burst origin={origin} startDelay={startDelay} />
        </Suspense>
      </Canvas>
    </div>
  );
}

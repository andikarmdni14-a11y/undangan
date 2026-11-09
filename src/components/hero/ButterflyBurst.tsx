"use client";

import { useMemo } from "react";
import { AnimatePresence, m, useReducedMotion } from "framer-motion";

/* ------------------------------------------------------------------ */
/*  Tipe & konfigurasi                                                 */
/* ------------------------------------------------------------------ */

type ButterflyBurstProps = {
  /** Pemicu dari komponen amplop. true = kupu-kupu dilepaskan. */
  isOpen: boolean;
  /** Jumlah kupu-kupu (disarankan 6–10). */
  count?: number;
  /** Path aset sayap (PNG/WebP transparan, dipotong tepat di garis badan). */
  leftWingSrc?: string;
  rightWingSrc?: string;
  /** Jeda sebelum kupu-kupu pertama keluar (detik), selaraskan dengan animasi tutup amplop. */
  startDelay?: number;
  className?: string;
};

type ButterflyConfig = {
  id: number;
  x: string[]; // keyframe dalam vw → otomatis responsif
  y: string[]; // keyframe dalam vh
  rotate: number[];
  scale: number[];
  size: number; // lebar SATU sayap (px) sebelum di-scale
  duration: number;
  delay: number;
  flapDuration: number;
  zIndex: number;
};

/** Rasio tinggi : lebar satu sayap (aset 300 × 462). */
const WING_RATIO = 462 / 300;

/* ------------------------------------------------------------------ */
/*  Generator lintasan                                                 */
/* ------------------------------------------------------------------ */

const rand = (min: number, max: number) => min + Math.random() * (max - min);

function createButterflies(count: number, startDelay: number): ButterflyConfig[] {
  return Array.from({ length: count }, (_, i) => {
    // Sebar sudut merata di busur atas (-165° … -15°) + sedikit acak,
    // sehingga ada yang ke kiri atas, lurus ke atas, dan kanan atas.
    const t = count === 1 ? 0.5 : i / (count - 1);
    const angleDeg = -165 + t * 150 + rand(-10, 10);
    const angle = (angleDeg * Math.PI) / 180;

    // ~30% kupu-kupu "mendekati layar": lebih besar, lebih dekat, z-index tinggi.
    const isNear = Math.random() < 0.3;
    const distance = isNear ? rand(28, 40) : rand(38, 58);

    const dx = Math.cos(angle) * distance; // vw
    const dy = Math.sin(angle) * distance * 1.1 - rand(5, 15); // vh, ekstra naik

    // Vektor tegak lurus untuk liukan kiri-kanan (zig-zag organik).
    const px = -Math.sin(angle);
    const py = Math.cos(angle);
    const wobble = rand(4, 9);
    const side = Math.random() > 0.5 ? 1 : -1;

    const point = (p: number, w: number) => ({
      x: dx * p + px * w * side,
      y: dy * p + py * w * side,
    });

    const p1 = point(0.22, wobble);
    const p2 = point(0.48, -wobble * 0.8);
    const p3 = point(0.74, wobble * 0.6);

    // Kepala kupu-kupu menghadap ke atas (0°) → arah terbang = angle + 90°,
    // dibatasi agar tidak terlihat terbalik.
    const heading = Math.max(-60, Math.min(60, angleDeg + 90));
    const sway = rand(10, 20);

    const finalScale = isNear ? rand(1.05, 1.2) : rand(0.8, 1);

    return {
      id: i,
      x: [0, p1.x, p2.x, p3.x, dx].map((v) => `${v.toFixed(2)}vw`),
      y: [0, p1.y, p2.y, p3.y, dy].map((v) => `${v.toFixed(2)}vh`),
      rotate: [heading * 0.3, heading - sway, heading + sway, heading - sway * 0.5, heading],
      scale: [0.2, finalScale * 0.6, finalScale * 0.85, finalScale, finalScale * 1.05],
      size: isNear ? rand(34, 44) : rand(24, 34),
      duration: rand(3.2, 4.4),
      delay: startDelay + i * 0.09 + rand(0, 0.15),
      flapDuration: rand(0.2, 0.3),
      zIndex: isNear ? 30 : 10 + i,
    };
  });
}

/* ------------------------------------------------------------------ */
/*  Satu ekor kupu-kupu                                                */
/* ------------------------------------------------------------------ */

type ButterflyProps = {
  config: ButterflyConfig;
  leftWingSrc: string;
  rightWingSrc: string;
};

function Butterfly({ config, leftWingSrc, rightWingSrc }: ButterflyProps) {
  const { size, flapDuration } = config;
  const wingStyle = { width: size, height: size * WING_RATIO };

  const flapTransition = {
    duration: flapDuration,
    repeat: Infinity,
    ease: "easeInOut" as const,
  };

  return (
    <m.div
      className="absolute left-1/2 top-1/2 will-change-transform"
      style={{
        zIndex: config.zIndex,
        // Pusatkan kupu-kupu pada titik asal (tengah amplop).
        marginLeft: -size,
        marginTop: -(size * WING_RATIO) / 2,
      }}
      initial={{ x: 0, y: 0, scale: 0.2, opacity: 0, rotate: 0 }}
      animate={{
        x: config.x,
        y: config.y,
        rotate: config.rotate,
        scale: config.scale,
        opacity: [0, 1, 1, 1, 0],
      }}
      transition={{
        duration: config.duration,
        delay: config.delay,
        ease: "easeOut",
        times: [0, 0.2, 0.45, 0.72, 1],
        opacity: {
          duration: config.duration,
          delay: config.delay,
          times: [0, 0.12, 0.5, 0.75, 1],
        },
      }}
    >
      {/* Container 3D: perspektif untuk kepakan sayap */}
      <div className="flex" style={{ perspective: 500, transformStyle: "preserve-3d" }}>
        { }
        <m.img
          src={leftWingSrc}
          alt=""
          draggable={false}
          className="origin-right select-none"
          style={wingStyle}
          animate={{ rotateY: [0, 65, 0] }}
          transition={flapTransition}
        />
        { }
        <m.img
          src={rightWingSrc}
          alt=""
          draggable={false}
          className="origin-left select-none"
          style={wingStyle}
          animate={{ rotateY: [0, -65, 0] }}
          transition={flapTransition}
        />
      </div>
    </m.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Komponen utama                                                     */
/* ------------------------------------------------------------------ */

export default function ButterflyBurst({
  isOpen,
  count = 8,
  leftWingSrc = "/images/fx/butterfly-left.webp",
  rightWingSrc = "/images/fx/butterfly-right.webp",
  startDelay = 0.3,
  className = "",
}: ButterflyBurstProps) {
  const prefersReducedMotion = useReducedMotion();

  // Lintasan dibuat ulang setiap kali amplop dibuka.
  // Hanya dihitung di client saat isOpen = true → aman dari hydration mismatch.
  const butterflies = useMemo(
    () => (isOpen ? createButterflies(Math.min(Math.max(count, 1), 12), startDelay) : []),
    [isOpen, count, startDelay],
  );

  // Hormati preferensi "kurangi gerakan" pengguna.
  if (prefersReducedMotion) return null;

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 overflow-visible ${className}`}
    >
      <AnimatePresence>
        {isOpen &&
          butterflies.map((b) => (
            <Butterfly
              key={b.id}
              config={b}
              leftWingSrc={leftWingSrc}
              rightWingSrc={rightWingSrc}
            />
          ))}
      </AnimatePresence>
    </div>
  );
}

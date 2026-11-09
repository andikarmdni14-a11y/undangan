"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { m, useReducedMotion } from "framer-motion";

/* ------------------------------------------------------------------ */
/*  Konfigurasi                                                        */
/* ------------------------------------------------------------------ */

/** 9 kelopak tunggal hasil potongan foto (±3,5 KB per file, maks 96 px). */
export const PETAL_SOURCES = Array.from(
  { length: 9 },
  (_, i) => `/images/fx/petal-${i + 1}.webp`,
);

type PetalBurstProps = {
  isOpen: boolean;
  /** Jumlah kelopak di desktop (15–20). Di layar < 640 px otomatis dikurangi 25%. */
  count?: number;
  /** Titik asal relatif terhadap parent (default: tengah saku amplop). */
  originX?: string;
  originY?: string;
  /** Jeda sebelum kelopak pertama keluar (detik), selaraskan dengan penutup amplop. */
  startDelay?: number;
  sources?: string[];
};

type Petal = {
  id: number;
  src: string;
  size: number;
  x: number[];
  y: number[];
  rotate: number[];
  scale: number[];
  flipDuration: number;
  duration: number;
  delay: number;
};

const rand = (min: number, max: number) => min + Math.random() * (max - min);

function createPetals(count: number, startDelay: number, sources: string[]): Petal[] {
  return Array.from({ length: count }, (_, i) => {
    // Sebar arah merata kiri → kanan agar pancaran simetris, lalu beri acak.
    const t = count === 1 ? 0.5 : i / (count - 1);
    const xEnd = (t * 2 - 1) * 150 + rand(-30, 30); // −150 … 150 px
    const yEnd = rand(-400, -200); // ke atas −200 … −400 px
    const sway = rand(15, 45) * (Math.random() > 0.5 ? 1 : -1); // liukan tertiup angin
    const spin = rand(180, 360) * (Math.random() > 0.5 ? 1 : -1); // 0 → ±360°
    const finalScale = rand(0.6, 1.2);

    return {
      id: i,
      src: sources[i % sources.length],
      size: rand(22, 38),
      x: [0, xEnd * 0.3 + sway, xEnd * 0.65 - sway * 0.6, Math.min(150, Math.max(-150, xEnd))],
      y: [0, yEnd * 0.45, yEnd * 0.8, yEnd],
      rotate: [0, spin * 0.35, spin * 0.7, spin],
      scale: [0.2, finalScale, finalScale, finalScale * 0.95],
      flipDuration: rand(0.7, 1.3),
      duration: rand(2.4, 3.6),
      delay: startDelay + rand(0, 0.7),
    };
  });
}

/* ------------------------------------------------------------------ */
/*  Komponen                                                           */
/* ------------------------------------------------------------------ */

export default function PetalBurst({
  isOpen,
  count = 18,
  originX = "40%",
  originY = "50%",
  startDelay = 0.55,
  sources = PETAL_SOURCES,
}: PetalBurstProps) {
  const reduceMotion = useReducedMotion();
  // Burst yang seluruh kelopaknya sudah selesai → di-unmount.
  const [doneBurst, setDoneBurst] = useState<Petal[] | null>(null);
  const completed = useRef(0);

  // Pra-muat gambar sekali saat mount (sangat kecil) agar tidak ada jeda saat burst.
  useEffect(() => {
    sources.forEach((src) => {
      const img = new window.Image();
      img.decoding = "async";
      img.src = src;
    });
  }, [sources]);

  // Kelopak dibuat ulang setiap kali amplop dibuka; jumlah dikurangi di layar kecil.
  const petals = useMemo(() => {
    if (!isOpen) return [];
    const isSmall = typeof window !== "undefined" && window.matchMedia("(max-width: 639px)").matches;
    const n = Math.round(Math.min(Math.max(count, 1), 20) * (isSmall ? 0.75 : 1));
    return createPetals(n, startDelay, sources);
  }, [isOpen, count, startDelay, sources]);

  // Reset penghitung tiap burst baru.
  useEffect(() => {
    completed.current = 0;
  }, [petals]);

  const handleComplete = () => {
    completed.current += 1;
    if (completed.current >= petals.length) setDoneBurst(petals);
  };

  // Unmount: saat amplop ditutup, ATAU semua kelopak burst ini sudah selesai beranimasi.
  if (reduceMotion || !isOpen || doneBurst === petals) return null;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute"
      style={{ left: originX, top: originY, width: 0, height: 0, zIndex: 30 }}
    >
      {petals.map((p) => (
        <m.div
          key={p.id}
          className="absolute left-0 top-0 will-change-transform"
          style={{ width: p.size, height: p.size, marginLeft: -p.size / 2, marginTop: -p.size / 2 }}
          initial={{ x: 0, y: 0, rotate: 0, scale: 0.2, opacity: 0 }}
          animate={{
            x: p.x,
            y: p.y,
            rotate: p.rotate,
            scale: p.scale,
            opacity: [0, 1, 1, 0],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            ease: "easeOut",
            times: [0, 0.3, 0.65, 1],
            opacity: { duration: p.duration, delay: p.delay, times: [0, 0.1, 0.6, 1] },
          }}
          onAnimationComplete={handleComplete}
        >
          {/* Efek kelopak berputar di udara: scaleX berosilasi (2D, murah untuk GPU) */}
          { }
          <m.img
            src={p.src}
            alt=""
            width={p.size}
            height={p.size}
            decoding="async"
            draggable={false}
            className="h-full w-full object-contain"
            animate={{ scaleX: [1, 0.35, 1, 0.6, 1] }}
            transition={{ duration: p.flipDuration, repeat: Infinity, ease: "easeInOut" }}
          />
        </m.div>
      ))}
    </div>
  );
}

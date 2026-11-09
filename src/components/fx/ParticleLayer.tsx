"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import FxErrorBoundary from "./FxErrorBoundary";

/**
 * Three.js (±200 KB gzip) TIDAK masuk bundle awal. Modul dipanaskan lewat lib/fx/loader
 * saat ada sinyal niat; komponen ini hanya dirender setelah modul siap (lihat InvitationExperience).
 */
const ParticleCanvas = dynamic(() => import("./ParticleCanvas"), {
  ssr: false,
  loading: () => null,
});

const TEXTURES = [
  ...Array.from({ length: 9 }, (_, i) => `/images/fx/petal-${i + 1}.webp`),
  "/images/fx/butterfly-left.webp",
  "/images/fx/butterfly-right.webp",
];

type Props = {
  active: boolean;
  /** Elemen stage amplop; titik asal = tengah saku (40.1%, 50.7%). */
  getOrigin: () => { x: number; y: number } | null;
  onFallback: () => void;
};

export default function ParticleLayer({ active, getOrigin, onFallback }: Props) {
  const [origin, setOrigin] = useState<{ x: number; y: number } | null>(null);
  const [done, setDone] = useState(false);

  // Pra-muat tekstur saat idle (±150 KB) agar burst tidak menunggu jaringan.
  useEffect(() => {
    const preload = () =>
      TEXTURES.forEach((src) => {
        const img = new Image();
        img.decoding = "async";
        img.src = src;
      });
    const ric = window.requestIdleCallback ?? ((cb: () => void) => window.setTimeout(cb, 1500));
    const id = ric(preload);
    return () => (window.cancelIdleCallback ?? window.clearTimeout)(id as number);
  }, []);

  useEffect(() => {
    if (active && !origin) setOrigin(getOrigin());
  }, [active, origin, getOrigin]);

  if (!active || !origin || done) return null;

  return (
    <FxErrorBoundary onError={onFallback}>
      <ParticleCanvas origin={origin} startDelay={0.45} onDone={() => setDone(true)} onError={onFallback} />
    </FxErrorBoundary>
  );
}

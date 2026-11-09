"use client";

import { useEffect, useState } from "react";

/**
 * #5 Pre-loader SVG minimalis: cincin tergambar & berputar perlahan selama font dan
 * gambar amplop disiapkan. Dirender di HTML server → muncul sejak byte pertama.
 * Hilang saat siap (maks. ±1,2 dtk) atau otomatis via CSS pada 2,6 dtk bila JS terlambat.
 */
export default function Preloader() {
  const [done, setDone] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const imgs = Array.from(document.querySelectorAll<HTMLImageElement>('img[src*="envelope"]')).slice(0, 3);
    const ready = Promise.all([
      document.fonts?.ready ?? Promise.resolve(),
      ...imgs.map((img) => (img.complete ? Promise.resolve() : img.decode().catch(() => undefined))),
    ]);
    const timeout = new Promise((r) => window.setTimeout(r, 1200));
    void Promise.race([ready, timeout]).then(() => !cancelled && setDone(true));
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      data-done={done}
      className="preloader pointer-events-none fixed inset-0 z-[80] grid place-items-center bg-alabaster"
    >
      <svg viewBox="0 0 100 100" className="size-20 text-burgundy" fill="none">
        <circle cx="50" cy="50" r="40" stroke="currentColor" strokeOpacity="0.15" strokeWidth="1" />
        <circle className="preloader-draw" cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" pathLength={1} />
        <path d="M50 38c-4 4-4 20 0 24c4-4 4-20 0-24Z" fill="currentColor" opacity="0.85" />
        <path d="M38 50c4-4 20-4 24 0c-4 4-20 4-24 0Z" fill="currentColor" opacity="0.35" />
      </svg>
    </div>
  );
}

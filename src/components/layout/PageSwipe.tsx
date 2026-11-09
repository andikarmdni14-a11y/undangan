"use client";

import { AnimatePresence, m } from "framer-motion";

/**
 * #50 Blok warna Deep Burgundy yang menyapu menutup layar sesaat — dipakai sebagai transisi
 * dari sampul ke isi undangan (pengganti transisi rute pada aplikasi satu halaman).
 */
export default function PageSwipe({ active }: { active: boolean }) {
  return (
    <AnimatePresence>
      {active && (
        <m.div
          key="swipe"
          aria-hidden="true"
          className="pointer-events-none fixed inset-0 z-[70] bg-burgundy"
          initial={{ clipPath: "inset(0 100% 0 0)" }}
          animate={{ clipPath: "inset(0 0% 0 0)" }}
          exit={{ clipPath: "inset(0 0 0 100%)" }}
          transition={{ duration: 0.55, ease: [0.76, 0, 0.24, 1] }}
        />
      )}
    </AnimatePresence>
  );
}

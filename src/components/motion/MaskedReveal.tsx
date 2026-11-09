"use client";

import { m } from "framer-motion";
import type { ReactNode } from "react";

const EASE = [0.76, 0, 0.24, 1] as const;

/** #17 Teks seolah keluar dari balik blok warna solid: blok menyapu masuk, lalu keluar membuka teks. */
export default function MaskedReveal({ children, className, color = "bg-burgundy" }: { children: ReactNode; className?: string; color?: string }) {
  return (
    <m.span className={`relative inline-block overflow-hidden align-bottom ${className ?? ""}`} initial="hidden" whileInView="show" viewport={{ once: true, margin: "0px 0px -10% 0px" }}>
      <m.span
        className="inline-block"
        variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { delay: 0.45, duration: 0.01 } } }}
      >
        {children}
      </m.span>
      <m.span
        aria-hidden="true"
        className={`absolute inset-0 ${color}`}
        style={{ originX: 0 }}
        variants={{
          hidden: { scaleX: 0 },
          show: { scaleX: [0, 1, 1, 0], originX: [0, 0, 1, 1], transition: { duration: 1.1, times: [0, 0.42, 0.46, 1], ease: EASE } },
        }}
      />
    </m.span>
  );
}

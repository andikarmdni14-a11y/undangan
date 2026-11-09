"use client";

import { m, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { useRef, type ReactNode } from "react";

/** #21 Gambar dalam masker kubah yang perlahan membesar (zoom-out halus) saat memasuki viewport. */
export default function ArchScaleReveal({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "center center"] });
  const scale = useTransform(scrollYProgress, [0, 1], [1.18, 1]);
  const clip = useTransform(scrollYProgress, [0, 1], ["inset(14% 10% 0% 10% round 9999px 9999px 1rem 1rem)", "inset(0% 0% 0% 0% round 9999px 9999px 1rem 1rem)"]);
  return (
    <m.div ref={ref} className={className} style={reduce ? undefined : { clipPath: clip }}>
      <m.div className="h-full w-full" style={reduce ? undefined : { scale }}>
        {children}
      </m.div>
    </m.div>
  );
}

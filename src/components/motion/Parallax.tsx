"use client";

import { m, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { useRef, type ReactNode } from "react";

/** #19 Lapisan dekoratif yang bergerak lebih lambat/cepat dari scroll → ilusi kedalaman. */
export default function Parallax({ children, speed = 0.25, className }: { children: ReactNode; speed?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [`${-speed * 100}px`, `${speed * 100}px`]);
  return (
    <m.div ref={ref} aria-hidden="true" className={className} style={reduce ? undefined : { y }}>
      {children}
    </m.div>
  );
}

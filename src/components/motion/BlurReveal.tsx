"use client";

import { useInView } from "framer-motion";
import { useRef, type ReactNode } from "react";

/** #15 Teks buram yang perlahan menjadi tajam — transisi CSS satu kali, tidak berulang. */
export default function BlurReveal({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -15% 0px" });
  return (
    <div ref={ref} data-in={inView} className={`blur-reveal ${className ?? ""}`}>
      {children}
    </div>
  );
}

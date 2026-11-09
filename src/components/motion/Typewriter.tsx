"use client";

import { useInView, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

/**
 * #12 Efek mesin tik saat masuk viewport. Teks utuh dirender tak terlihat sebagai penahan
 * ukuran → nol layout shift; pembaca layar membaca teks utuh.
 */
export default function Typewriter({ text, className, speed = 38 }: { text: string; className?: string; speed?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -15% 0px" });
  const reduce = useReducedMotion();
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!inView) return;
    if (reduce) {
      setCount(text.length);
      return;
    }
    let i = 0;
    const id = window.setInterval(() => {
      i += 1;
      setCount(i);
      if (i >= text.length) window.clearInterval(id);
    }, speed);
    return () => window.clearInterval(id);
  }, [inView, reduce, text, speed]);

  const typing = inView && count < text.length;
  return (
    <span ref={ref} className={`relative inline-block ${className ?? ""}`}>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true" className="invisible">{text}</span>
      <span aria-hidden="true" className="absolute inset-0">
        {text.slice(0, count)}
        <span className={`ml-px inline-block w-[2px] translate-y-[0.1em] bg-current align-baseline ${typing ? "h-[1em] animate-pulse" : "h-0"}`} />
      </span>
    </span>
  );
}

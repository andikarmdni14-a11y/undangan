"use client";

import { m, type Variants } from "framer-motion";

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * #13 (mode "words")  — tiap kata meluncur naik dari balik garis tak terlihat.
 * #14 (mode "chars")  — huruf demi huruf muncul bertahap untuk judul serif.
 * Pembaca layar membaca teks utuh (span sr-only); potongan visual aria-hidden.
 */
export default function SplitText({
  text,
  mode = "words",
  className,
  stagger,
  as = "span",
}: {
  text: string;
  mode?: "words" | "chars";
  className?: string;
  stagger?: number;
  as?: "span" | "h2" | "p";
}) {
  const container: Variants = {
    hidden: {},
    show: { transition: { staggerChildren: stagger ?? (mode === "chars" ? 0.035 : 0.07) } },
  };
  const piece: Variants =
    mode === "words"
      ? { hidden: { y: "110%" }, show: { y: "0%", transition: { duration: 0.85, ease: EASE } } }
      : { hidden: { opacity: 0, y: "0.35em" }, show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } } };

  const words = text.split(" ");
  const Tag = m[as];

  return (
    <Tag
      className={className}
      variants={container}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "0px 0px -10% 0px" }}
    >
      <span className="sr-only">{text}</span>
      {words.map((word, wi) => (
        <span key={wi} aria-hidden="true" className={`inline-block whitespace-nowrap ${mode === "words" ? "overflow-hidden pb-[0.12em] align-bottom" : ""}`}>
          {mode === "words" ? (
            <m.span className="inline-block" variants={piece}>
              {word}
            </m.span>
          ) : (
            Array.from(word).map((ch, ci) => (
              <m.span key={ci} className="inline-block" variants={piece}>
                {ch}
              </m.span>
            ))
          )}
          {wi < words.length - 1 && "\u00A0"}
        </span>
      ))}
    </Tag>
  );
}

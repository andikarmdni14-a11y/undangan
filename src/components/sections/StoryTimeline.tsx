"use client";

import { m, useReducedMotion, useScroll, useSpring } from "framer-motion";
import { useRef } from "react";
import type { StoryChapter } from "@/content/wedding";
import Typewriter from "@/components/motion/Typewriter";
import Reveal from "@/components/motion/Reveal";

/**
 * #23 Garis linimasa yang "tergambar" mengikuti persentase scroll.
 * #12 Tahun diketik seperti mesin tik. Mobile vertikal, desktop zigzag.
 */
export default function StoryTimeline({ chapters }: { chapters: readonly StoryChapter[] }) {
  const ref = useRef<HTMLOListElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 75%", "end 55%"] });
  const scaleY = useSpring(scrollYProgress, { stiffness: 120, damping: 30 });

  return (
    <ol ref={ref} className="relative mx-auto max-w-3xl">
      <span aria-hidden="true" className="absolute inset-y-2 left-[11px] w-px bg-rose-100 md:left-1/2" />
      <m.span
        aria-hidden="true"
        className="absolute inset-y-2 left-[11px] w-px origin-top bg-burgundy md:left-1/2"
        style={{ scaleY: reduce ? 1 : scaleY }}
      />
      {chapters.map((chapter, i) => {
        const right = i % 2 === 1;
        return (
          <li key={chapter.title} className="relative pb-12 pl-12 last:pb-0 md:grid md:grid-cols-2 md:gap-16 md:pl-0">
            <span
              aria-hidden="true"
              className="absolute left-[5px] top-2 size-[13px] rounded-full border-2 border-alabaster bg-burgundy ring-1 ring-burgundy/30 md:left-1/2 md:-translate-x-1/2"
            />
            <Reveal className={right ? "md:col-start-2" : "md:text-right"} y={20}>
              <p className="font-display text-h3 text-burgundy">
                <Typewriter text={chapter.year} speed={120} />
              </p>
              <h3 className="mt-1 font-sans text-lead font-medium text-ink">{chapter.title}</h3>
              <p className="mt-3 max-w-sm text-body text-ink-muted md:max-w-none">{chapter.body}</p>
            </Reveal>
          </li>
        );
      })}
    </ol>
  );
}

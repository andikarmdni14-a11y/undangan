"use client";

import Image from "next/image";
import { AnimatePresence, m, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";

type Props = {
  greetingPrefix: string;
  guestName: string;
  tagline: string;
  coupleLabel: string;
  dateLabel: string;
  /** Lompat ke layar nama mempelai (mis. saat amplop dibuka sebelum siklus selesai). */
  settle: boolean;
};

const SCREEN_MS = 2800;
const LAST = 2;

/**
 * Tiga layar teks bergantian di posisi yang sama (crossfade in-place, PRD §5).
 * Siklus berjalan satu kali lalu berhenti di nama mempelai — konten tidak bergerak
 * tanpa henti (WCAG 2.2.2). Pembaca layar menerima seluruh teks secara statis.
 */
export default function HeroTextCycle({ greetingPrefix, guestName, tagline, coupleLabel, dateLabel, settle }: Props) {
  const reduce = useReducedMotion();
  const [index, setIndex] = useState(0);
  const current = settle ? LAST : index;

  useEffect(() => {
    if (settle || index >= LAST) return;
    const id = window.setTimeout(() => setIndex((i) => i + 1), SCREEN_MS);
    return () => window.clearTimeout(id);
  }, [index, settle]);

  const fade = {
    // Hanya opacity & transform (dijalankan compositor) — filter blur mahal di ponsel kelas bawah.
    initial: { opacity: 0, y: reduce ? 0 : 8 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: reduce ? 0 : -6 },
    transition: { duration: reduce ? 0.2 : 0.9, ease: [0.22, 1, 0.36, 1] as const },
  };

  return (
    <div className="relative w-full">
      {/* Versi statis untuk pembaca layar */}
      <h1 className="sr-only">
        {greetingPrefix} {guestName}. {tagline}. {coupleLabel}, {dateLabel}.
      </h1>

      <div aria-hidden="true" className="grid h-52 place-items-center text-center sm:h-56">
        <AnimatePresence initial={false}>
          {current === 0 && (
            <m.div key="guest" {...fade} className="col-start-1 row-start-1 px-2">
              <p className="text-small text-ink-muted">{greetingPrefix}</p>
              <p className="mt-3 font-display text-h2 text-burgundy sm:text-h1">{guestName}</p>
            </m.div>
          )}
          {current === 1 && (
            <m.p key="tagline" {...fade} className="text-flow col-start-1 row-start-1 px-2 font-display text-h2 sm:text-h1">
              {tagline}
            </m.p>
          )}
          {current === 2 && (
            <m.div key="couple" {...fade} className="col-start-1 row-start-1 flex flex-col items-center">
              <Image
                src="/images/brand/logo-raihan-andini-sm.webp"
                alt=""
                width={640}
                height={340}
                priority
                className="h-auto w-[min(70vw,300px)]"
              />
              <p className="mt-1 font-display text-lead text-ink-muted">{dateLabel}</p>
            </m.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

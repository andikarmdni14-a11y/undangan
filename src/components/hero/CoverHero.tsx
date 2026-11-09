"use client";

import { AnimatePresence, m, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { useRef, type Ref } from "react";
import Magnetic from "@/components/motion/Magnetic";
import { useRipple } from "@/components/motion/useRipple";
import Envelope from "./Envelope";
import HeroTextCycle from "./HeroTextCycle";

type Props = {
  isOpen: boolean;
  onOpen: () => void;
  onContinue: () => void;
  greetingPrefix: string;
  guestName: string;
  tagline: string;
  coupleLabel: string;
  dateLabel: string;
  openLabel: string;
  domParticles: boolean;
  stageRef: Ref<HTMLDivElement>;
  /** #6 Zoom sinematis menembus bukaan amplop saat menuju isi undangan. */
  zooming: boolean;
};

export default function CoverHero({ isOpen, onOpen, onContinue, openLabel, domParticles, stageRef, zooming, ...text }: Props) {
  const section = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { onPointerDown, ripples } = useRipple();

  // #4 Scrollytelling 2D: saat halaman digulir, amplop berputar & melayang menjauh, teks naik lebih cepat.
  const { scrollYProgress } = useScroll({ target: section, offset: ["start start", "end start"] });
  const envRotate = useTransform(scrollYProgress, [0, 1], [0, -8]);
  const envY = useTransform(scrollYProgress, [0, 1], ["0%", "28%"]);
  const envScale = useTransform(scrollYProgress, [0, 1], [1, 0.86]);
  const envOpacity = useTransform(scrollYProgress, [0, 0.85], [1, 0]);
  const textY = useTransform(scrollYProgress, [0, 1], ["0%", "-60%"]);

  return (
    <section
      ref={section}
      aria-label="Sampul undangan"
      className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden px-5 pb-10 pt-14"
    >
      <m.div className="w-full" style={reduce ? undefined : { y: textY, opacity: envOpacity }}>
        <HeroTextCycle {...text} settle={isOpen} />
      </m.div>

      {/* Sepertiga atas stage sengaja kosong: ruang bagi kartu yang naik saat amplop dibuka */}
      <m.div
        className="-mt-2 w-[min(84vw,460px)]"
        style={reduce ? undefined : { rotate: envRotate, y: envY, scale: envScale, opacity: envOpacity }}
      >
        <m.div
          // #6 Kamera "menembus" bukaan saku: perbesar ke titik saku lalu memudar
          style={{ originX: 0.401, originY: 0.42 }}
          animate={zooming && !reduce ? { scale: 3.4, opacity: 0, filter: "blur(6px)" } : { scale: 1, opacity: 1, filter: "blur(0px)" }}
          transition={{ duration: zooming ? 1.05 : 0.6, ease: [0.7, 0, 0.84, 0] }}
        >
          <Envelope ref={stageRef} isOpen={isOpen} onOpen={onOpen} withParticles={domParticles} />
        </m.div>
      </m.div>

      <div className="mt-8 grid h-14 place-items-center">
        <AnimatePresence mode="wait" initial={false}>
          {!isOpen ? (
            <m.div key="open" exit={{ opacity: 0, y: 6, transition: { duration: 0.25 } }}>
              {/* #29 magnetis · #31 riak konsentris */}
              <Magnetic strength={0.35}>
                <button
                  type="button"
                  onClick={onOpen}
                  onPointerDown={onPointerDown}
                  className="relative min-h-12 overflow-hidden rounded-full bg-burgundy px-9 text-body font-medium text-alabaster shadow-[0_12px_30px_-12px_rgb(114_47_55/0.65)] transition-[background-color,transform] duration-200 hover:bg-burgundy-700 active:scale-[0.98]"
                >
                  {ripples}
                  <span className="relative">{openLabel}</span>
                </button>
              </Magnetic>
            </m.div>
          ) : (
            <m.button
              key="continue"
              type="button"
              onClick={onContinue}
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0, transition: { delay: 1.6, duration: 0.5 } }}
              className="flex flex-col items-center gap-1 rounded-full px-4 py-1 text-small text-ink-muted transition-colors hover:text-burgundy"
            >
              Lihat undangan
              <m.svg
                viewBox="0 0 24 24"
                width="20"
                height="20"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
                animate={{ y: [0, 4, 0] }}
                transition={{ duration: 1.8, repeat: 3, delay: 2.2, ease: "easeInOut" }}
              >
                <path d="M6 9l6 6 6-6" />
              </m.svg>
            </m.button>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}

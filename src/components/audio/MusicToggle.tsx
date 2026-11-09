"use client";

import { m } from "framer-motion";
import Tooltip from "@/components/motion/Tooltip";

type Props = { isPlaying: boolean; onToggle: () => void; title: string };

/** Tombol musik mengambang (pojok kanan bawah, aman dari notch/home indicator). */
/**
 * #32 Tombol musik mengambang dengan pantulan elastis halus: saat muncul (pegas) dan setiap
 * kali status berubah. #35 tooltip ke kiri saat hover/fokus.
 */
export default function MusicToggle({ isPlaying, onToggle, title }: Props) {
  return (
    <div
      className="fixed z-50"
      style={{
        right: "max(1rem, env(safe-area-inset-right))",
        bottom: "max(1rem, env(safe-area-inset-bottom))",
      }}
    >
    <Tooltip label={isPlaying ? "Matikan musik" : "Putar musik"} side="left">
    <m.button
      key={isPlaying ? "on" : "off"}
      type="button"
      onClick={onToggle}
      aria-pressed={isPlaying}
      aria-label={isPlaying ? `Matikan musik: ${title}` : `Putar musik: ${title}`}
      initial={{ opacity: 0, scale: 0.6 }}
      animate={{ opacity: 1, scale: 1 }}
      whileTap={{ scale: 0.88 }}
      transition={{ type: "spring", stiffness: 520, damping: 11, mass: 0.6 }}
      className="grid size-12 place-items-center rounded-full bg-burgundy/90 text-alabaster shadow-[0_10px_30px_-10px_rgb(114_47_55/0.7)] ring-1 ring-alabaster/30 backdrop-blur-md transition-colors hover:bg-burgundy-700"
    >
      {isPlaying ? (
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M9 18V6l10-2v12" />
          <circle cx="6.5" cy="18" r="2.5" />
          <circle cx="16.5" cy="16" r="2.5" />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M9 18V6l10-2v12" />
          <circle cx="6.5" cy="18" r="2.5" />
          <circle cx="16.5" cy="16" r="2.5" />
          <path d="M3 3l18 18" />
        </svg>
      )}
    </m.button>
    </Tooltip>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";

type Parts = { days: number; hours: number; minutes: number; seconds: number };

function diff(target: number, now: number): Parts | null {
  const ms = target - now;
  if (ms <= 0) return null;
  const s = Math.floor(ms / 1000);
  return { days: Math.floor(s / 86400), hours: Math.floor((s % 86400) / 3600), minutes: Math.floor((s % 3600) / 60), seconds: s % 60 };
}

const UNITS: { key: keyof Parts; label: string }[] = [
  { key: "days", label: "Hari" },
  { key: "hours", label: "Jam" },
  { key: "minutes", label: "Menit" },
  { key: "seconds", label: "Detik" },
];

/**
 * Hitung mundur ke akad. Nilai baru dihitung setelah mount (bukan saat SSR) agar tidak
 * terjadi hydration mismatch; ruang tetap dipesan supaya tidak ada layout shift.
 */
export default function Countdown({ target, ariaLabel }: { target: string; ariaLabel: string }) {
  const targetMs = new Date(target).getTime();
  const [parts, setParts] = useState<Parts | null | undefined>(undefined);

  useEffect(() => {
    const tick = () => setParts(diff(targetMs, Date.now()));
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [targetMs]);

  if (parts === null) {
    return <p className="font-display text-h3 text-burgundy">Hari bahagia telah tiba. Terima kasih atas doa Anda.</p>;
  }

  return (
    <div role="timer" aria-label={ariaLabel} className="grid grid-cols-4 gap-2 sm:gap-4">
      {UNITS.map(({ key, label }) => (
        <div key={key} className="arch flex flex-col items-center bg-alabaster px-1 pb-4 pt-6 sm:pt-8">
          <span aria-hidden="true" className="font-display text-[1.6rem] leading-tight tabular-nums text-burgundy sm:text-h1">
            {parts ? String(parts[key]).padStart(2, "0") : "––"}
          </span>
          <span aria-hidden="true" className="mt-1 text-caption text-ink-muted sm:text-small">
            {label}
          </span>
        </div>
      ))}
    </div>
  );
}

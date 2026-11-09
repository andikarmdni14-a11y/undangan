"use client";

import { useEffect, useState } from "react";

const rtf = new Intl.RelativeTimeFormat("id-ID", { numeric: "auto" });
const abs = new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Jakarta" });

function relative(iso: string, now: number) {
  const sec = Math.round((new Date(iso).getTime() - now) / 1000);
  const a = Math.abs(sec);
  if (a < 45) return "baru saja";
  if (a < 3600) return rtf.format(Math.round(sec / 60), "minute");
  if (a < 86400) return rtf.format(Math.round(sec / 3600), "hour");
  if (a < 86400 * 7) return rtf.format(Math.round(sec / 86400), "day");
  return abs.format(new Date(iso));
}

/** Waktu relatif ("5 menit yang lalu"). SSR menampilkan tanggal absolut → tanpa hydration mismatch. */
export default function RelativeTime({ iso }: { iso: string }) {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    setNow(Date.now());
    const id = window.setInterval(() => setNow(Date.now()), 60_000);
    return () => window.clearInterval(id);
  }, []);
  return <time dateTime={iso}>{now === null ? abs.format(new Date(iso)) : relative(iso, now)}</time>;
}

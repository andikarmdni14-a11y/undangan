"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, m } from "framer-motion";
import CountUp from "@/components/motion/CountUp";
import type { PublicWish } from "@/lib/rsvp/types";
import { upsertWish } from "@/lib/rsvp/wish-list";
import RelativeTime from "./RelativeTime";

const PAGE = 6;


/**
 * Daftar ucapan real-time. Klien Supabase (±45 KB) baru dimuat saat seksi ini mendekati
 * layar, lalu berlangganan INSERT/UPDATE/DELETE pada tabel publik `wishes`.
 * DELETE = admin menyembunyikan ucapan → langsung hilang dari layar semua tamu.
 */
export default function WishList({ initial, incoming }: { initial: PublicWish[]; incoming: PublicWish | null }) {
  const [wishes, setWishes] = useState(initial);
  const [visible, setVisible] = useState(PAGE);
  const [live, setLive] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const [toasts, setToasts] = useState<PublicWish[]>([]);
  const known = useRef(new Set(initial.map((w) => w.id)));
  const mine = useRef<string | null>(null);

  /** #36 Toast meluncur di layar tamu lain saat ucapan baru tiba via Realtime. */
  const pushToast = useCallback((wish: PublicWish) => {
    setToasts((t) => [...t.slice(-2), wish]);
    window.setTimeout(() => setToasts((t) => t.filter((x) => x.id !== wish.id)), 5500);
  }, []);

  // Ucapan milik tamu sendiri (dari respons API) tampil seketika.
  useEffect(() => {
    if (incoming) {
      mine.current = incoming.id;
      known.current.add(incoming.id);
      setWishes((list) => upsertWish(list, incoming));
    }
  }, [incoming]);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    let cleanup: (() => void) | undefined;
    let cancelled = false;

    const connect = async () => {
      try {
        const { createClient } = await import("@/lib/supabase/client");
        if (cancelled) return;
        const supabase = createClient();
        const channel = supabase
          .channel("wishes-public")
          .on("postgres_changes", { event: "*", schema: "public", table: "wishes" }, (payload) => {
            if (payload.eventType === "DELETE") {
              const id = (payload.old as { id?: string }).id;
              if (id) setWishes((list) => list.filter((w) => w.id !== id));
            } else {
              const wish = payload.new as PublicWish;
              const isNew = payload.eventType === "INSERT" && !known.current.has(wish.id) && wish.id !== mine.current;
              known.current.add(wish.id);
              setWishes((list) => upsertWish(list, wish));
              if (isNew) pushToast(wish);
            }
          })
          .subscribe((state) => setLive(state === "SUBSCRIBED"));
        cleanup = () => void supabase.removeChannel(channel);
      } catch (e) {
        console.warn("[wishes] realtime tidak aktif:", (e as Error).message);
      }
    };

    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          io.disconnect();
          void connect();
        }
      },
      { rootMargin: "600px 0px" },
    );
    io.observe(el);
    return () => {
      cancelled = true;
      io.disconnect();
      cleanup?.();
    };
  }, [pushToast]);

  const shown = wishes.slice(0, visible);

  return (
    <div ref={root} className="mt-14">
      <div
        aria-live="polite"
        className="pointer-events-none fixed z-50 flex w-[min(22rem,calc(100vw-6rem))] flex-col gap-2"
        style={{ left: "max(1rem, env(safe-area-inset-left))", bottom: "max(1rem, env(safe-area-inset-bottom))" }}
      >
        <AnimatePresence>
          {toasts.map((t) => (
            <m.div
              key={t.id}
              initial={{ opacity: 0, x: -40, scale: 0.96 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ type: "spring", stiffness: 380, damping: 30 }}
              className="pointer-events-auto rounded-2xl border border-rose-300 bg-alabaster/90 px-4 py-3 shadow-[0_18px_40px_-20px_rgb(114_47_55/0.6)] backdrop-blur-md"
            >
              <p className="text-caption text-ink-muted">Ucapan baru</p>
              <p className="truncate text-small font-medium text-ink">{t.name}</p>
              <p className="line-clamp-2 text-small text-ink-muted">{t.message}</p>
            </m.div>
          ))}
        </AnimatePresence>
      </div>
      <div className="mb-6 flex items-center justify-between gap-4">
        <h3 className="text-h3">Ucapan &amp; Doa</h3>
        <p className="flex items-center gap-2 text-small text-ink-muted">
          {live && <span aria-hidden="true" className="size-2 rounded-full bg-burgundy motion-safe:animate-pulse" />}
          <CountUp value={wishes.length} /> ucapan
        </p>
      </div>

      {wishes.length === 0 ? (
        <p className="rounded-[var(--radius-soft)] border border-dashed border-rose-300 px-6 py-10 text-center text-body text-ink-muted">
          Belum ada ucapan. Jadilah yang pertama mengirim doa restu.
        </p>
      ) : (
        <ul className="space-y-4">
          <AnimatePresence initial={false}>
          {shown.map((w) => (
            <m.li
              key={w.id}
              layout
              initial={{ opacity: 0, x: -24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, height: 0, marginTop: 0 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="lift rounded-[var(--radius-soft)] bg-alabaster px-5 py-4"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                <p className="font-medium text-ink">{w.name}</p>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-caption ${
                    w.attendance === "hadir" ? "bg-burgundy text-alabaster" : "bg-rose-100 text-ink-muted"
                  }`}
                >
                  {w.attendance === "hadir" ? "Hadir" : "Tidak Hadir"}
                </span>
              </div>
              {/* React meng-escape teks → aman dari XSS; whitespace-pre-line menjaga baris baru */}
              <p className="mt-2 whitespace-pre-line break-words text-body text-ink">{w.message}</p>
              <p className="mt-2 text-caption text-ink-muted">
                <RelativeTime iso={w.created_at} />
              </p>
            </m.li>
          ))}
          </AnimatePresence>
        </ul>
      )}

      {wishes.length > visible && (
        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => setVisible((v) => v + PAGE * 2)}
            className="min-h-11 rounded-full border border-burgundy/40 px-6 text-small font-medium text-burgundy transition-colors hover:border-burgundy hover:bg-burgundy/5"
          >
            Tampilkan ucapan lainnya ({wishes.length - visible})
          </button>
        </div>
      )}
    </div>
  );
}

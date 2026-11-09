"use client";

import Image from "next/image";
import { AnimatePresence, LayoutGroup, m, useScroll, useTransform } from "framer-motion";
import { useCallback, useEffect, useLayoutEffect, useRef, useState, type PointerEvent } from "react";
import type { GalleryPhoto } from "@/content/wedding";
import { blurFor } from "@/content/blur";
import { ChevronIcon, CloseIcon } from "@/components/ui/icons";
import ShimmerImage from "@/components/ui/ShimmerImage";
import { useFxTier } from "@/lib/fx/tier";

const FILTERS = [
  { key: "semua", label: "Semua" },
  { key: "berdua", label: "Berdua" },
  { key: "mempelai", label: "Mempelai" },
] as const;
type Filter = (typeof FILTERS)[number]["key"];

/** Lebar ≥ 1024px & tier kaya → galeri horizontal ter-pin (#22, #24). */
function useWideRich() {
  const tier = useFxTier();
  const [wide, setWide] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const update = () => setWide(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return tier === "rich" && wide;
}

/**
 * #22 Scroll horizontal di dalam halaman vertikal + #24 pinning:
 * seksi dibuat setinggi jarak geser, kontainer sticky menahan layar, jalur foto bergeser ke kiri.
 */
function PinnedStrip({ photos, onOpen }: { photos: readonly GalleryPhoto[]; onOpen: (i: number) => void }) {
  const outer = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLUListElement>(null);
  const [distance, setDistance] = useState(0);
  useLayoutEffect(() => {
    const measure = () => setDistance(Math.max(0, (track.current?.scrollWidth ?? 0) - window.innerWidth + 96));
    measure();
    const ro = new ResizeObserver(measure);
    if (track.current) ro.observe(track.current);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);
  const { scrollYProgress } = useScroll({ target: outer, offset: ["start start", "end end"] });
  const x = useTransform(scrollYProgress, [0, 1], [0, -distance]);

  return (
    <div ref={outer} style={{ height: `calc(100vh + ${distance}px)` }} className="relative">
      <div className="sticky top-0 flex h-screen items-center overflow-hidden">
        <m.ul ref={track} style={{ x }} className="flex gap-6 pl-12 pr-12">
          {photos.map((p, i) => (
            <li key={p.src} className="shrink-0">
              <button
                type="button"
                onClick={() => onOpen(i)}
                aria-label={`Perbesar foto: ${p.alt}`}
                className="arch-top lift group relative block h-[62vh] rounded-b-[var(--radius-soft)]"
                style={{ aspectRatio: p.height > p.width ? "3 / 4" : "4 / 5" }}
              >
                <ShimmerImage
                  wrapperClassName="h-full w-full"
                  src={p.thumb}
                  alt={p.alt}
                  fill
                  sizes="40vw"
                  placeholder="blur"
                  blurDataURL={blurFor(p.thumb)}
                  className="object-cover transition-transform duration-700 ease-[var(--ease-romance)] group-hover:scale-[1.04]"
                />
              </button>
            </li>
          ))}
        </m.ul>
      </div>
    </div>
  );
}

/**
 * Grid masonry (CSS columns) dengan thumbnail berpuncak kubah + lightbox.
 * Lightbox memakai <dialog> native: fokus terkunci, Esc menutup, backdrop gratis.
 * Navigasi: tombol, panah keyboard, dan geser (swipe) di layar sentuh.
 */
export default function Gallery({ photos: allPhotos }: { photos: readonly GalleryPhoto[] }) {
  const [filter, setFilter] = useState<Filter>("semua");
  const photos = filter === "semua" ? allPhotos : allPhotos.filter((p) => p.category === filter);
  const pinned = useWideRich();
  const dialog = useRef<HTMLDialogElement>(null);
  const triggerRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [index, setIndex] = useState<number | null>(null);
  const swipeStart = useRef<number | null>(null);

  const open = (i: number) => {
    setIndex(i);
    dialog.current?.showModal();
  };
  const close = useCallback(() => dialog.current?.close(), []);
  const go = useCallback(
    (delta: number) => setIndex((i) => (i === null ? i : (i + delta + photos.length) % photos.length)),
    [photos.length],
  );

  useEffect(() => {
    const d = dialog.current;
    if (!d) return;
    const onClose = () =>
      setIndex((i) => {
        if (i !== null) triggerRefs.current[i]?.focus(); // kembalikan fokus ke thumbnail
        return null;
      });
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    d.addEventListener("close", onClose);
    d.addEventListener("keydown", onKey);
    return () => {
      d.removeEventListener("close", onClose);
      d.removeEventListener("keydown", onKey);
    };
  }, [go]);

  const onPointerDown = (e: PointerEvent) => (swipeStart.current = e.clientX);
  const onPointerUp = (e: PointerEvent) => {
    if (swipeStart.current === null) return;
    const dx = e.clientX - swipeStart.current;
    swipeStart.current = null;
    if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
  };

  const current = index === null ? null : photos[index];

  return (
    <>
      {pinned ? (
        <PinnedStrip photos={allPhotos} onOpen={open} />
      ) : (
        <>
          {/* #48 Filter kategori: grid mengatur ulang posisinya dengan animasi layout */}
          <div role="group" aria-label="Filter galeri" className="mb-8 flex justify-center gap-2">
            {FILTERS.map((f) => (
              <button
                key={f.key}
                type="button"
                aria-pressed={filter === f.key}
                onClick={() => setFilter(f.key)}
                className="relative isolate min-h-10 rounded-full px-5 text-small text-ink-muted transition-colors aria-pressed:text-alabaster"
              >
                {filter === f.key && (
                  <m.span layoutId="gallery-filter" className="absolute inset-0 -z-10 rounded-full bg-burgundy" transition={{ type: "spring", stiffness: 400, damping: 34 }} />
                )}
                <span className="relative">{f.label}</span>
              </button>
            ))}
          </div>
          <LayoutGroup>
            <ul className="mx-auto max-w-5xl columns-2 gap-3 sm:gap-4 md:columns-3">
              <AnimatePresence mode="popLayout" initial={false}>
                {photos.map((p, i) => (
                  <m.li
                    key={p.src}
                    layout
                    initial={{ opacity: 0, scale: 0.92 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.92 }}
                    transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                    className="mb-3 break-inside-avoid sm:mb-4"
                  >
                    <button
                      ref={(el) => {
                        triggerRefs.current[i] = el;
                      }}
                      type="button"
                      onClick={() => open(i)}
                      aria-label={`Perbesar foto: ${p.alt}`}
                      className={`arch-top group relative block w-full rounded-b-[var(--radius-soft)] ${
                        p.height > p.width ? "aspect-[3/4]" : "aspect-square"
                      }`}
                    >
                      {/* #40 shimmer + #49 blur-up */}
                      <ShimmerImage
                        wrapperClassName="h-full w-full"
                        src={p.thumb}
                        alt={p.alt}
                        fill
                        sizes="(max-width: 768px) 48vw, 330px"
                        placeholder="blur"
                        blurDataURL={blurFor(p.thumb)}
                        className="object-cover transition-transform duration-500 ease-[var(--ease-romance)] group-hover:scale-[1.03]"
                      />
                    </button>
                  </m.li>
                ))}
              </AnimatePresence>
            </ul>
          </LayoutGroup>
        </>
      )}

      <dialog
        ref={dialog}
        aria-label="Galeri foto"
        onClick={(e) => e.target === e.currentTarget && close()}
        className="m-0 h-dvh max-h-none w-screen max-w-none bg-transparent p-0 backdrop:bg-burgundy-900/95"
      >
        {current && index !== null && (
          <div className="flex h-full flex-col" onPointerDown={onPointerDown} onPointerUp={onPointerUp}>
            <div className="flex items-center justify-between px-4 pt-[max(1rem,env(safe-area-inset-top))] text-alabaster">
              <p className="text-small tabular-nums" aria-live="polite">
                {index + 1} / {photos.length}
              </p>
              <button
                type="button"
                onClick={close}
                aria-label="Tutup galeri"
                className="grid size-11 place-items-center rounded-full bg-alabaster/10 hover:bg-alabaster/20"
              >
                <CloseIcon />
              </button>
            </div>
            <div className="relative min-h-0 flex-1" onClick={(e) => e.target === e.currentTarget && close()}>
              <Image
                key={current.src}
                src={current.src}
                alt={current.alt}
                fill
                sizes="100vw"
                className="object-contain p-3 sm:p-8"
                priority
              />
            </div>
            <div className="flex items-center justify-center gap-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-2 text-alabaster">
              <button
                type="button"
                onClick={() => go(-1)}
                aria-label="Foto sebelumnya"
                className="grid size-12 place-items-center rounded-full bg-alabaster/10 hover:bg-alabaster/20"
              >
                <ChevronIcon direction="left" />
              </button>
              <button
                type="button"
                onClick={() => go(1)}
                aria-label="Foto berikutnya"
                className="grid size-12 place-items-center rounded-full bg-alabaster/10 hover:bg-alabaster/20"
              >
                <ChevronIcon />
              </button>
            </div>
          </div>
        )}
      </dialog>
    </>
  );
}

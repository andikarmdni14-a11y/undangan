"use client";

import Image from "next/image";
import { AnimatePresence, m, useMotionValueEvent, useScroll } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";

const LINKS = [
  { href: "#mempelai", label: "Mempelai" },
  { href: "#hitung-mundur", label: "Hitung Mundur" },
  { href: "#kisah-kami", label: "Kisah Kami" },
  { href: "#galeri", label: "Galeri" },
  { href: "#rangkaian-acara", label: "Rangkaian Acara" },
  { href: "#informasi-tamu", label: "Informasi Tamu" },
  { href: "#konfirmasi", label: "Konfirmasi Kehadiran" },
];

/**
 * #25 Header adaptif: transparan di atas, menyusut & berlatar kaca saat menggulir.
 * #28 Kaca makin tebal (blur & opasitas naik) seiring jauhnya scroll.
 * #34 Ikon hamburger bermorf menjadi X. #44 Laci navigasi meluncur dari kanan (dialog modal).
 */
export default function SiteHeader() {
  const { scrollY } = useScroll();
  const [stage, setStage] = useState<0 | 1 | 2>(0);
  const [open, setOpen] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);

  useMotionValueEvent(scrollY, "change", (y) => setStage(y < 40 ? 0 : y < 600 ? 1 : 2));

  useEffect(() => {
    const d = dialog.current;
    if (open && d && !d.open) d.showModal();
  }, [open]);

  const close = useCallback(() => setOpen(false), []);

  const go = (href: string) => {
    close();
    window.setTimeout(() => {
      const target = document.querySelector<HTMLElement>(href);
      target?.scrollIntoView({ behavior: "smooth", block: "start" });
      target?.focus({ preventScroll: true });
    }, 320);
  };

  const glass = ["bg-transparent", "bg-alabaster/55 backdrop-blur-sm shadow-[0_1px_0_rgb(220_174_150/0.35)]", "bg-alabaster/75 backdrop-blur-md shadow-[0_8px_30px_-20px_rgb(114_47_55/0.5)]"][stage];

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-40 transition-[background-color,backdrop-filter,box-shadow,padding] duration-500 ease-[var(--ease-romance)] ${glass} ${
          stage === 0 ? "py-4" : "py-2"
        }`}
        style={{ paddingTop: `max(${stage === 0 ? "1rem" : "0.5rem"}, env(safe-area-inset-top))` }}
      >
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4">
          <a href="#undangan" aria-label="Ke awal undangan" className="block">
            <Image
              src="/images/brand/monogram-ra.webp"
              alt=""
              width={960}
              height={474}
              className={`h-auto transition-[width] duration-500 ease-[var(--ease-romance)] ${stage === 0 ? "w-16" : "w-12"}`}
            />
          </a>
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-controls="laci-navigasi"
            aria-label={open ? "Tutup menu" : "Buka menu"}
            className="relative grid size-11 place-items-center rounded-full text-burgundy hover:bg-burgundy/5"
          >
            <span aria-hidden="true" className="relative block h-3.5 w-5">
              <span className={`absolute left-0 h-px w-5 bg-current transition-all duration-400 ease-[var(--ease-romance)] ${open ? "top-1/2 rotate-45" : "top-0"}`} />
              <span className={`absolute left-0 top-1/2 h-px bg-current transition-all duration-300 ${open ? "w-0 opacity-0" : "w-3.5"}`} />
              <span className={`absolute left-0 h-px w-5 bg-current transition-all duration-400 ease-[var(--ease-romance)] ${open ? "top-1/2 -rotate-45" : "top-full"}`} />
            </span>
          </button>
        </div>
      </header>

      <dialog
        ref={dialog}
        id="laci-navigasi"
        aria-label="Navigasi undangan"
        onCancel={(e) => {
          e.preventDefault();
          close();
        }}
        onClick={(e) => e.target === e.currentTarget && close()}
        className="m-0 ml-auto h-dvh max-h-none w-full max-w-none bg-transparent p-0 backdrop:bg-transparent"
      >
        <AnimatePresence onExitComplete={() => dialog.current?.close()}>
          {open && (
            <>
              <m.div
                key="scrim"
                aria-hidden="true"
                className="fixed inset-0 bg-burgundy-900/40 backdrop-blur-[2px]"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={close}
              />
              <m.nav
                key="panel"
                aria-label="Seksi undangan"
                className="fixed inset-y-0 right-0 flex w-[min(84vw,22rem)] flex-col bg-alabaster px-8 pb-10 pt-[max(1.5rem,env(safe-area-inset-top))] shadow-[-30px_0_60px_-30px_rgb(114_47_55/0.5)]"
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", stiffness: 320, damping: 36 }}
              >
                <button
                  type="button"
                  onClick={close}
                  aria-label="Tutup menu"
                  className="ml-auto grid size-11 place-items-center rounded-full text-burgundy hover:bg-burgundy/5"
                >
                  <span aria-hidden="true" className="relative block h-3.5 w-5">
                    <span className="absolute left-0 top-1/2 h-px w-5 rotate-45 bg-current" />
                    <span className="absolute left-0 top-1/2 h-px w-5 -rotate-45 bg-current" />
                  </span>
                </button>
                <ul className="mt-6 space-y-1">
                  {LINKS.map((l, i) => (
                    <m.li
                      key={l.href}
                      initial={{ opacity: 0, x: 24 }}
                      animate={{ opacity: 1, x: 0, transition: { delay: 0.08 + i * 0.04 } }}
                    >
                      <a
                        href={l.href}
                        onClick={(e) => {
                          e.preventDefault();
                          go(l.href);
                        }}
                        className="link-underline inline-block py-2 font-display text-h4 text-burgundy"
                      >
                        {l.label}
                      </a>
                    </m.li>
                  ))}
                </ul>
                <p className="mt-auto text-small text-ink-muted">Raihan &amp; Andini · 24 Oktober 2029</p>
              </m.nav>
            </>
          )}
        </AnimatePresence>
      </dialog>
    </>
  );
}

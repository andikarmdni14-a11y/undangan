"use client";

import { useEffect } from "react";

/** Kunci scroll halaman selama amplop belum dibuka; selalu mulai dari atas. */
export function useScrollLock(locked: boolean) {
  useEffect(() => {
    if (!locked) return;
    const root = document.documentElement;
    const prevOverflow = root.style.overflow;
    const prevRestoration = history.scrollRestoration;
    history.scrollRestoration = "manual";
    window.scrollTo(0, 0);
    root.style.overflow = "hidden";
    return () => {
      root.style.overflow = prevOverflow;
      history.scrollRestoration = prevRestoration;
    };
  }, [locked]);
}

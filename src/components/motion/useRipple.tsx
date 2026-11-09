"use client";

import { useCallback, useState, type PointerEvent } from "react";

type Ripple = { id: number; x: number; y: number; size: number };

/**
 * #31 Riak konsentris saat tombol CTA ditekan. Pakai: tambahkan `relative overflow-hidden`
 * pada tombol, panggil `onPointerDown`, lalu render `ripples` di dalamnya.
 */
export function useRipple(color = "bg-alabaster/40") {
  const [items, setItems] = useState<Ripple[]>([]);
  const onPointerDown = useCallback((e: PointerEvent<HTMLElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const size = Math.max(r.width, r.height) * 2.2;
    const item = { id: performance.now(), x: e.clientX - r.left - size / 2, y: e.clientY - r.top - size / 2, size };
    setItems((list) => [...list.slice(-2), item]);
    window.setTimeout(() => setItems((list) => list.filter((i) => i.id !== item.id)), 750);
  }, []);
  const ripples = items.map((i) => (
    <span
      key={i.id}
      aria-hidden="true"
      className={`pointer-events-none absolute rounded-full ${color} motion-safe:animate-[ripple_0.7s_ease-out_forwards]`}
      style={{ left: i.x, top: i.y, width: i.size, height: i.size }}
    />
  ));
  return { onPointerDown, ripples };
}

import type { ReactNode } from "react";

/**
 * #35 Tooltip penunjuk yang muncul naik sambil memudar (hover/fokus keyboard).
 * CSS murni; label juga tersedia sebagai aria-label pada kontrol, tooltip hanya visual.
 */
export default function Tooltip({ label, children, side = "top" }: { label: string; children: ReactNode; side?: "top" | "left" }) {
  const pos =
    side === "top"
      ? "bottom-full left-1/2 mb-2 -translate-x-1/2 translate-y-1 group-hover/tt:translate-y-0 group-focus-within/tt:translate-y-0"
      : "right-full top-1/2 mr-3 -translate-y-1/2 translate-x-1 group-hover/tt:translate-x-0 group-focus-within/tt:translate-x-0";
  return (
    <span className="group/tt relative inline-flex">
      {children}
      <span
        aria-hidden="true"
        className={`pointer-events-none absolute z-50 whitespace-nowrap rounded-full bg-ink px-3 py-1.5 text-caption text-alabaster opacity-0 shadow-lg transition-all duration-300 ease-[var(--ease-romance)] group-hover/tt:opacity-100 group-focus-within/tt:opacity-100 ${pos}`}
      >
        {label}
      </span>
    </span>
  );
}

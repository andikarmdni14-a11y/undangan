"use client";

import { useId, useState, type ReactNode } from "react";

/**
 * #43 Akordeon tanpa layout jank: tinggi dianimasikan via grid-template-rows 0fr → 1fr
 * (tidak perlu mengukur tinggi konten dengan JavaScript).
 */
export function AccordionItem({ title, children, defaultOpen = false }: { title: string; children: ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  const id = useId();
  return (
    <div className="border-b border-rose-300/70">
      <h3>
        <button
          type="button"
          aria-expanded={open}
          aria-controls={`${id}-panel`}
          id={`${id}-btn`}
          onClick={() => setOpen((o) => !o)}
          className="flex min-h-14 w-full items-center justify-between gap-4 py-4 text-left font-sans text-lead font-medium text-ink"
        >
          {title}
          <span aria-hidden="true" className={`relative size-4 shrink-0 transition-transform duration-500 ease-[var(--ease-romance)] ${open ? "rotate-180" : ""}`}>
            <span className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-burgundy" />
            <span className={`absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-burgundy transition-transform duration-500 ${open ? "scale-y-0" : ""}`} />
          </span>
        </button>
      </h3>
      <div
        id={`${id}-panel`}
        role="region"
        aria-labelledby={`${id}-btn`}
        className={`grid transition-[grid-template-rows] duration-500 ease-[var(--ease-romance)] ${open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
      >
        <div className="overflow-hidden" inert={!open}>
          <div className="pb-5 text-body text-ink-muted">{children}</div>
        </div>
      </div>
    </div>
  );
}

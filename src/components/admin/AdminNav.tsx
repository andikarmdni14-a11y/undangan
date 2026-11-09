"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/admin", label: "RSVP & Ucapan" },
  { href: "/admin/tamu", label: "Daftar Tamu" },
  { href: "/admin/kata", label: "Filter Kata" },
];

export default function AdminNav() {
  const path = usePathname();
  return (
    <nav aria-label="Menu admin" className="mx-auto flex max-w-5xl gap-1 overflow-x-auto px-3 pb-2">
      {LINKS.map((l) => {
        const active = l.href === "/admin" ? path === "/admin" : path.startsWith(l.href);
        return (
          <Link
            key={l.href}
            href={l.href}
            aria-current={active ? "page" : undefined}
            className={`whitespace-nowrap rounded-full px-4 py-2 text-small transition-colors ${
              active ? "bg-burgundy text-alabaster" : "text-ink-muted hover:bg-rose-100 hover:text-ink"
            }`}
          >
            {l.label}
          </Link>
        );
      })}
    </nav>
  );
}

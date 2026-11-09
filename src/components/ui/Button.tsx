"use client";

import type { AnchorHTMLAttributes, ReactNode } from "react";
import { useRipple } from "@/components/motion/useRipple";

type Variant = "primary" | "outline";
const styles: Record<Variant, string> = {
  primary:
    "bg-burgundy text-alabaster shadow-[0_10px_24px_-14px_rgb(114_47_55/0.8)] hover:bg-burgundy-700",
  outline: "border border-burgundy/40 text-burgundy hover:border-burgundy hover:bg-burgundy/5",
};

/** Tautan bergaya tombol (pill) dengan riak konsentris saat ditekan (#31). Target ≥ 44px. */
export function ButtonLink({
  variant = "primary",
  icon,
  children,
  className = "",
  external,
  ...props
}: AnchorHTMLAttributes<HTMLAnchorElement> & { variant?: Variant; icon?: ReactNode; external?: boolean }) {
  const { onPointerDown, ripples } = useRipple(variant === "primary" ? "bg-alabaster/35" : "bg-burgundy/15");
  return (
    <a
      {...props}
      onPointerDown={onPointerDown}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      className={`relative inline-flex min-h-11 items-center justify-center gap-2 overflow-hidden rounded-full px-6 text-small font-medium transition-colors duration-200 ${styles[variant]} ${className}`}
    >
      {ripples}
      {icon}
      <span className="relative">{children}</span>
    </a>
  );
}

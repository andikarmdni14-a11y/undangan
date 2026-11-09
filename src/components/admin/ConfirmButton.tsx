"use client";

import type { ReactNode } from "react";
import { useFormStatus } from "react-dom";

/** Tombol submit dengan konfirmasi native — mencegah hapus tak sengaja di layar sentuh. */
export default function ConfirmButton({ message, children, className = "" }: { message: string; children: ReactNode; className?: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      onClick={(e) => {
        if (!window.confirm(message)) e.preventDefault();
      }}
      className={`disabled:opacity-60 ${className}`}
    >
      {children}
    </button>
  );
}

export function SubmitButton({ children, pendingText, className = "" }: { children: ReactNode; pendingText?: string; className?: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className={`disabled:opacity-60 ${className}`}>
      {pending && pendingText ? pendingText : children}
    </button>
  );
}

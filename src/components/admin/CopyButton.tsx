"use client";

import { useState } from "react";

export default function CopyButton({ text, label = "Salin tautan", className = "" }: { text: string; label?: string; className?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setCopied(true);
          window.setTimeout(() => setCopied(false), 1800);
        } catch {
          window.prompt("Salin tautan berikut:", text);
        }
      }}
      className={className}
    >
      <span aria-live="polite">{copied ? "Tersalin" : label}</span>
    </button>
  );
}

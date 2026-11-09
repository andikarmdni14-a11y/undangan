"use client";

import { useEffect } from "react";

/** Batas galat tingkat halaman: tamu tetap melihat pesan sopan, bukan layar kosong. */
export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("[app] galat tak terduga", error.digest ?? error.message);
  }, [error]);
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center px-6 text-center">
      <h1 className="text-h2">Mohon maaf</h1>
      <p className="mt-4 text-body text-ink-muted">Undangan gagal dimuat sesaat. Silakan coba lagi.</p>
      <button
        type="button"
        onClick={reset}
        className="mt-8 min-h-11 rounded-full bg-burgundy px-6 text-small font-medium text-alabaster hover:bg-burgundy-700"
      >
        Muat ulang
      </button>
    </main>
  );
}

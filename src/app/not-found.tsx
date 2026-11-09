import Image from "next/image";
import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center px-6 text-center">
      <Image src="/images/brand/monogram-ra.webp" alt="" width={960} height={474} className="h-auto w-24" priority />
      <h1 className="mt-8 text-h2">Halaman tidak ditemukan</h1>
      <p className="mt-4 text-body text-ink-muted">
        Tautan yang Anda buka mungkin keliru. Silakan gunakan tautan undangan yang kami kirimkan.
      </p>
      <Link href="/" className="mt-8 inline-flex min-h-11 items-center rounded-full bg-burgundy px-6 text-small font-medium text-alabaster hover:bg-burgundy-700">
        Ke halaman undangan
      </Link>
    </main>
  );
}

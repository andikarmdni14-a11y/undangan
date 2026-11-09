import type { Metadata } from "next";
import Image from "next/image";
import { redirect } from "next/navigation";
import LoginForm from "./LoginForm";
import { signOut } from "./actions";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Masuk Admin", robots: { index: false, follow: false } };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ e?: string }> }) {
  const { e } = await searchParams;
  // Sudah login sebagai admin → langsung ke dashboard. Login tapi bukan admin → tawarkan keluar.
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) {
    const { data: admin } = await supabase.from("admins").select("user_id").eq("user_id", user.id).maybeSingle();
    if (admin) redirect("/admin");
  }
  return (
    <main className="mx-auto flex min-h-dvh max-w-sm flex-col justify-center px-6 py-16">
      <Image src="/images/brand/monogram-ra.webp" alt="" width={960} height={474} className="mx-auto h-auto w-24" priority />
      <h1 className="mt-6 text-center text-h3">Dashboard Undangan</h1>
      <p className="mb-8 mt-2 text-center text-small text-ink-muted">Khusus pemilik acara</p>
      {user ? (
        <div className="text-center">
          <p className="text-body text-ink-muted">
            Akun <span className="text-ink">{user.email}</span> tidak memiliki akses admin.
          </p>
          <form action={signOut} className="mt-6">
            <button className="min-h-11 rounded-full border border-burgundy/40 px-6 text-small font-medium text-burgundy">
              Keluar & ganti akun
            </button>
          </form>
        </div>
      ) : (
        <LoginForm notice={e === "forbidden" ? "Akun ini tidak memiliki akses admin." : undefined} />
      )}
    </main>
  );
}

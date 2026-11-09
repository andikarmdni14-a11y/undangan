import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/admin/auth";
import { signOut } from "../login/actions";
import AdminNav from "@/components/admin/AdminNav";

export const metadata: Metadata = { title: "Dashboard Undangan", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const { user } = await requireAdmin();
  return (
    <div className="min-h-dvh bg-rose-50/60">
      <header className="sticky top-0 z-30 border-b border-rose-100 bg-alabaster/95 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3">
          <Link href="/admin" className="font-display text-h4 text-burgundy">
            Raihan &amp; Andini
          </Link>
          <div className="flex items-center gap-3">
            <span className="hidden text-small text-ink-muted sm:inline">{user.email}</span>
            <form action={signOut}>
              <button className="min-h-10 rounded-full border border-burgundy/30 px-4 text-small text-burgundy hover:bg-burgundy/5">
                Keluar
              </button>
            </form>
          </div>
        </div>
        <AdminNav />
      </header>
      <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
    </div>
  );
}

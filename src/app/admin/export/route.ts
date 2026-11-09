import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { toCsv } from "@/lib/admin/csv";

export const dynamic = "force-dynamic";

/** GET /admin/export — CSV seluruh RSVP (UTF-8 BOM agar rapi di Excel). Hanya admin. */
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return new NextResponse("Unauthorized", { status: 401 });
  const { data: admin } = await supabase.from("admins").select("user_id").eq("user_id", user.id).maybeSingle();
  if (!admin) return new NextResponse("Forbidden", { status: 403 });

  const { data, error } = await supabase
    .from("rsvps")
    .select("name, attendance, pax, message_raw, status, created_at, updated_at, guests(display_name, slug, max_pax)")
    .order("updated_at", { ascending: false });
  if (error) return new NextResponse("Gagal memuat data", { status: 500 });

  const rows = [
    ["Nama Undangan", "Slug", "Nama Pengisi", "Kehadiran", "Jumlah", "Kuota", "Pesan", "Status Ucapan", "Dikirim", "Diperbarui"],
    ...(data ?? []).map((r) => {
      const g = Array.isArray(r.guests) ? r.guests[0] : r.guests;
      return [
        g?.display_name, g?.slug, r.name, r.attendance === "hadir" ? "Hadir" : "Tidak Hadir", r.pax, g?.max_pax,
        r.message_raw, r.status === "visible" ? "Tampil" : "Disembunyikan", r.created_at, r.updated_at,
      ];
    }),
  ];
  const date = new Date().toISOString().slice(0, 10);
  return new NextResponse(toCsv(rows), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="rsvp-raihan-andini-${date}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}

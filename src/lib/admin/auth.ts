import "server-only";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

/**
 * Wajib dipanggil di setiap halaman & Server Action admin.
 * Login saja tidak cukup: user harus terdaftar di tabel `admins` (RLS hanya mengembalikan
 * baris itu kepada admin sendiri).
 */
export async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  const { data: admin } = await supabase.from("admins").select("user_id").eq("user_id", user.id).maybeSingle();
  if (!admin) redirect("/admin/login?e=forbidden");

  return { supabase, user };
}

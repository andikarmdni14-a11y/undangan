import "server-only";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import { publicEnv } from "@/lib/env";

export type Wish = Database["public"]["Tables"]["wishes"]["Row"];

/** Daftar awal ucapan (SSR). Pembaruan berikutnya datang dari Supabase Realtime di klien. */
export async function getInitialWishes(limit = 60): Promise<Wish[]> {
  let env;
  try {
    env = publicEnv();
  } catch {
    return []; // Supabase belum dikonfigurasi → halaman tetap tampil tanpa daftar ucapan
  }
  const supabase = createClient<Database>(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, {
    auth: { persistSession: false },
  });
  const { data, error } = await supabase
    .from("wishes")
    .select("id, name, attendance, message, created_at")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) {
    console.error("[wishes] gagal memuat", { code: error.code });
    return [];
  }
  return data ?? [];
}

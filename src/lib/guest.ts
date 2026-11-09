import "server-only";
import { cache } from "react";
import { SLUG_PATTERN } from "@/lib/rsvp/constants";
import { createAdminClient } from "@/lib/supabase/admin";
import type { AttendanceStatus } from "@/types/database";

export type Guest = {
  slug: string;
  displayName: string;
  maxPax: number;
  rsvp: { name: string; attendance: AttendanceStatus; pax: number | null; message: string | null } | null;
};

/** Resolusi `?to=<slug>` → data tamu dari database. Nama tamu tidak pernah diambil dari URL. */
export const getGuest = cache(async (rawSlug: string | undefined | null): Promise<Guest | null> => {
  const slug = rawSlug?.trim().toLowerCase();
  if (!slug || slug.length > 80 || !SLUG_PATTERN.test(slug)) return null;

  let result;
  try {
    result = await createAdminClient().rpc("get_guest", { p_slug: slug });
  } catch (e) {
    // Env belum lengkap (mis. SUPABASE_SECRET_KEY kosong) → tampilkan sapaan umum, jangan gagalkan halaman.
    console.error("[guest] Supabase belum terkonfigurasi:", (e as Error).message);
    return null;
  }
  const { data, error } = result;
  if (error) {
    console.error("[guest] get_guest gagal", { code: error.code });
    return null;
  }
  const row = data?.[0];
  if (!row) return null;

  return {
    slug: row.slug,
    displayName: row.display_name,
    maxPax: row.max_pax,
    rsvp: row.rsvp_attendance
      ? { name: row.rsvp_name ?? "", attendance: row.rsvp_attendance, pax: row.rsvp_pax, message: row.rsvp_message }
      : null,
  };
});

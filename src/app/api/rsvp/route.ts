import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { rsvpSchema } from "@/lib/rsvp/schema";
import { mapRsvpError } from "@/lib/rsvp/errors";
import { clientIp, hashIp } from "@/lib/security/ip";
import { createAdminClient } from "@/lib/supabase/admin";
import { serverEnv, siteUrl } from "@/lib/env";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BODY_BYTES = 4 * 1024;
const NO_STORE = { "Cache-Control": "no-store" };

function json(body: unknown, status = 200) {
  return NextResponse.json(body, { status, headers: NO_STORE });
}

/** Tolak request lintas situs (CSRF sederhana): Origin wajib sama dengan situs ini. */
function isSameOrigin(req: NextRequest): boolean {
  const origin = req.headers.get("origin");
  if (!origin) return false;
  const allowed = new Set([new URL(siteUrl()).origin, req.nextUrl.origin]);
  return allowed.has(origin);
}

export async function POST(req: NextRequest) {
  if (!isSameOrigin(req)) return json({ ok: false, message: "Permintaan ditolak." }, 403);
  if (!req.headers.get("content-type")?.includes("application/json")) {
    return json({ ok: false, message: "Format permintaan tidak didukung." }, 415);
  }

  const raw = await req.text();
  if (new TextEncoder().encode(raw).byteLength > MAX_BODY_BYTES) {
    return json({ ok: false, message: "Isi formulir terlalu panjang." }, 413);
  }

  let body: unknown;
  try {
    body = JSON.parse(raw);
  } catch {
    return json({ ok: false, message: "Format permintaan tidak valid." }, 400);
  }

  const parsed = rsvpSchema.safeParse(body);
  if (!parsed.success) {
    const fieldErrors = z.flattenError(parsed.error).fieldErrors;
    return json({ ok: false, message: "Periksa kembali isian formulir.", fieldErrors }, 400);
  }
  const data = parsed.data;

  // Honeypot terisi → pura-pura sukses agar bot tidak belajar.
  if (data.website) return json({ ok: true, isUpdate: false, isFiltered: false, wish: null });

  const { IP_HASH_SALT } = serverEnv();
  const ipHash = hashIp(clientIp(req.headers), IP_HASH_SALT);

  const supabase = createAdminClient();
  const { data: rows, error } = await supabase.rpc("submit_rsvp", {
    p_slug: data.slug,
    p_name: data.name,
    p_attendance: data.attendance,
    p_pax: data.pax,
    p_message: data.message || null,
    p_ip_hash: ipHash,
  });

  if (error) {
    const mapped = mapRsvpError(error.code, error.details);
    if (mapped.status === 500) console.error("[rsvp] submit_rsvp gagal", { code: error.code, message: error.message });
    return json({ ok: false, message: mapped.message }, mapped.status);
  }

  const row = rows?.[0];
  // Kembalikan versi publik ucapan (sudah tersensor) agar klien bisa langsung menampilkannya
  // walau koneksi Realtime belum tersambung. null = tanpa pesan / disembunyikan admin.
  let wish = null;
  if (row?.rsvp_id) {
    const { data: w } = await supabase
      .from("wishes")
      .select("id, name, attendance, message, created_at")
      .eq("id", row.rsvp_id)
      .maybeSingle();
    wish = w ?? null;
  }
  return json({ ok: true, isUpdate: row?.is_update ?? false, isFiltered: row?.is_flagged ?? false, wish });
}

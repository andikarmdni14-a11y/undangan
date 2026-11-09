"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin/auth";
import { makeSlug } from "@/lib/admin/slug";
import { normalizePhone } from "@/lib/admin/phone";
import { parseCsv, rowsToGuests } from "@/lib/admin/csv";

/**
 * Semua mutasi dashboard. Setiap action: requireAdmin() → validasi Zod → query dengan sesi admin
 * (RLS tetap berlaku sebagai lapis kedua). Next.js memeriksa Origin pada Server Action (anti-CSRF).
 */

export type ActionState = { ok?: string; error?: string };

const uuid = z.uuid();

// ---------------------------------------------------------------- RSVP
export async function setRsvpStatus(form: FormData) {
  const { supabase } = await requireAdmin();
  const id = uuid.parse(form.get("id"));
  const status = z.enum(["visible", "hidden"]).parse(form.get("status"));
  await supabase.from("rsvps").update({ status }).eq("id", id);
  revalidatePath("/admin");
}

export async function deleteRsvp(form: FormData) {
  const { supabase } = await requireAdmin();
  const id = uuid.parse(form.get("id"));
  await supabase.from("rsvps").delete().eq("id", id);
  revalidatePath("/admin");
}

// ---------------------------------------------------------------- Tamu
const guestSchema = z.object({
  name: z.string().trim().min(1, "Nama wajib diisi.").max(120),
  maxPax: z.coerce.number().int().min(1).max(10),
  phone: z.string().trim().max(30).optional().default(""),
});

async function insertGuests(
  supabase: Awaited<ReturnType<typeof requireAdmin>>["supabase"],
  rows: { name: string; maxPax: number; phone: string | null }[],
) {
  const payload = rows.map((r) => ({
    slug: makeSlug(r.name),
    display_name: r.name,
    max_pax: r.maxPax,
    phone: normalizePhone(r.phone),
  }));
  let { error } = await supabase.from("guests").insert(payload);
  // Tabrakan slug (peluang ±1/900.000 per nama sama) → coba sekali lagi dengan akhiran baru.
  if (error?.code === "23505") {
    ({ error } = await supabase.from("guests").insert(payload.map((p) => ({ ...p, slug: makeSlug(p.display_name) }))));
  }
  return error;
}

export async function createGuest(_prev: ActionState, form: FormData): Promise<ActionState> {
  const { supabase } = await requireAdmin();
  const parsed = guestSchema.safeParse({ name: form.get("name"), maxPax: form.get("maxPax"), phone: form.get("phone") });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Data tamu tidak valid." };
  if (parsed.data.phone && !normalizePhone(parsed.data.phone)) return { error: "Nomor WhatsApp tidak valid." };

  const error = await insertGuests(supabase, [{ ...parsed.data, phone: parsed.data.phone || null }]);
  if (error) return { error: "Tamu gagal disimpan. Coba lagi." };
  revalidatePath("/admin/tamu");
  return { ok: `${parsed.data.name} ditambahkan.` };
}

export async function updateGuest(form: FormData) {
  const { supabase } = await requireAdmin();
  const id = uuid.parse(form.get("id"));
  const parsed = guestSchema.safeParse({ name: form.get("name"), maxPax: form.get("maxPax"), phone: form.get("phone") });
  if (!parsed.success) return; // input tak valid diabaikan; constraint DB tetap menjaga data
  const data = parsed.data;
  await supabase
    .from("guests")
    .update({ display_name: data.name, max_pax: data.maxPax, phone: normalizePhone(data.phone) })
    .eq("id", id);
  revalidatePath("/admin/tamu");
}

export async function deleteGuest(form: FormData) {
  const { supabase } = await requireAdmin();
  const id = uuid.parse(form.get("id"));
  await supabase.from("guests").delete().eq("id", id); // RSVP & ucapan ikut terhapus (ON DELETE CASCADE)
  revalidatePath("/admin/tamu");
  revalidatePath("/admin");
}

const MAX_IMPORT = 500;

export async function importGuests(_prev: ActionState, form: FormData): Promise<ActionState> {
  const { supabase } = await requireAdmin();
  const file = form.get("file");
  let text = String(form.get("csv") ?? "");
  if (file instanceof File && file.size > 0) {
    if (file.size > 200 * 1024) return { error: "Berkas terlalu besar (maks. 200 KB)." };
    text = await file.text();
  }
  if (!text.trim()) return { error: "Tempel data CSV atau pilih berkas terlebih dahulu." };

  const { guests, errors } = rowsToGuests(parseCsv(text));
  if (guests.length > MAX_IMPORT) return { error: `Maksimal ${MAX_IMPORT} tamu per impor.` };
  if (!guests.length) return { error: errors[0] ?? "Tidak ada baris yang valid." };

  const error = await insertGuests(supabase, guests);
  if (error) return { error: "Impor gagal disimpan. Tidak ada tamu yang ditambahkan." };
  revalidatePath("/admin/tamu");
  const skipped = errors.length ? ` ${errors.length} baris dilewati: ${errors.slice(0, 3).join(" ")}` : "";
  return { ok: `${guests.length} tamu berhasil diimpor.${skipped}` };
}

// ---------------------------------------------------------------- Kata terlarang
export async function addBlockedWord(_prev: ActionState, form: FormData): Promise<ActionState> {
  const { supabase } = await requireAdmin();
  const parsed = z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9]{2,40}$/, "Gunakan satu kata, huruf/angka saja (2–40 karakter).")
    .safeParse(form.get("word"));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };
  const { error } = await supabase.from("blocked_words").insert({ word: parsed.data });
  if (error?.code === "23505") return { error: `"${parsed.data}" sudah ada di daftar.` };
  if (error) return { error: "Kata gagal disimpan." };
  revalidatePath("/admin/kata");
  return { ok: `"${parsed.data}" ditambahkan. Berlaku untuk ucapan berikutnya.` };
}

export async function removeBlockedWord(form: FormData) {
  const { supabase } = await requireAdmin();
  const word = z.string().min(1).max(40).parse(form.get("word"));
  await supabase.from("blocked_words").delete().eq("word", word);
  revalidatePath("/admin/kata");
}

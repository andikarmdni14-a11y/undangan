import type { PublicWish } from "./types";

/** Masukkan/ganti ucapan berdasarkan id, urut terbaru dulu (respons API & event Realtime tidak dobel). */
export function upsertWish(list: PublicWish[], wish: PublicWish): PublicWish[] {
  const rest = list.filter((w) => w.id !== wish.id);
  return [wish, ...rest].sort((a, b) => b.created_at.localeCompare(a.created_at));
}

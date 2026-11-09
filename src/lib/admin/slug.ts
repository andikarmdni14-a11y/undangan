/**
 * Slug tamu: bagian nama yang mudah dibaca + akhiran acak 4 karakter (tidak bisa ditebak).
 * "Bapak Budi Santoso" → "budi-santoso-x7k2". Gelar umum dibuang agar tautan ringkas.
 */
const HONORIFICS = new Set(["bapak", "bpk", "pak", "ibu", "bu", "sdr", "sdri", "saudara", "saudari", "keluarga", "kel", "mr", "mrs", "ms", "dr", "h", "hj", "prof", "ir"]);
const ALPHABET = "abcdefghjkmnpqrstuvwxyz23456789"; // tanpa 0/o/1/l/i agar tidak tertukar

export function slugBase(name: string): string {
  const words = name
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/[\s-]+/)
    .filter(Boolean);
  const meaningful = words.filter((w) => !HONORIFICS.has(w));
  const base = (meaningful.length ? meaningful : words).slice(0, 4).join("-").slice(0, 60).replace(/-+$/, "");
  return base || "tamu";
}

export function randomSuffix(length = 4, rng: () => number = cryptoRandom): string {
  return Array.from({ length }, () => ALPHABET[Math.floor(rng() * ALPHABET.length)]).join("");
}

function cryptoRandom(): number {
  const buf = new Uint32Array(1);
  globalThis.crypto.getRandomValues(buf);
  return buf[0] / 2 ** 32;
}

export function makeSlug(name: string, rng?: () => number): string {
  return `${slugBase(name)}-${randomSuffix(4, rng)}`;
}

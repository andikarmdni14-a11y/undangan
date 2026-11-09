/**
 * Sanitasi teks bebas dari tamu (anti-XSS lapis kedua — React sudah meng-escape saat render).
 * - normalisasi Unicode (NFKC) agar karakter "kembar" tidak menipu filter kata
 * - buang tag HTML, karakter kontrol & zero-width
 * - rapikan spasi; pertahankan maksimal 2 baris baru beruntun pada pesan
 */
const TAG = /<\/?[a-z][^>]*>/gi;
const CONTROL = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;
const ZERO_WIDTH = /[\u200B-\u200F\u202A-\u202E\u2060-\u2064\uFEFF]/g;
const ANGLE = /[<>]/g;

export function sanitizeLine(input: string): string {
  return input
    .normalize("NFKC")
    .replace(TAG, "")
    .replace(CONTROL, "")
    .replace(ZERO_WIDTH, "")
    .replace(ANGLE, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function sanitizeMultiline(input: string): string {
  return input
    .normalize("NFKC")
    .replace(/\r\n?/g, "\n")
    .replace(TAG, "")
    .replace(CONTROL, "")
    .replace(ZERO_WIDTH, "")
    .replace(ANGLE, "")
    .split("\n")
    .map((line) => line.replace(/[ \t]+/g, " ").trim())
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

import { z } from "zod";

/**
 * Validasi environment variable secara malas (lazy): build tidak gagal bila
 * variabel belum diisi, tetapi pemakaian di runtime langsung memberi galat yang jelas.
 */
const publicSchema = z.object({
  NEXT_PUBLIC_SITE_URL: z.url().default("http://localhost:3000"),
  NEXT_PUBLIC_SUPABASE_URL: z.url(),
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z.string().min(20),
  NEXT_PUBLIC_ALLOW_INDEXING: z.enum(["true", "false"]).default("false"),
});

const serverSchema = z.object({
  SUPABASE_SECRET_KEY: z.string().min(20),
  IP_HASH_SALT: z.string().min(32, "IP_HASH_SALT minimal 32 karakter acak"),
});

export function publicEnv() {
  const parsed = publicSchema.safeParse({
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    NEXT_PUBLIC_ALLOW_INDEXING: process.env.NEXT_PUBLIC_ALLOW_INDEXING,
  });
  if (!parsed.success) {
    throw new Error(`Environment publik tidak valid:\n${z.prettifyError(parsed.error)}`);
  }
  return parsed.data;
}

/** Hanya untuk kode server (Route Handler / Server Action). */
export function serverEnv() {
  if (typeof window !== "undefined") throw new Error("serverEnv() dipanggil di browser");
  const parsed = serverSchema.safeParse(process.env);
  if (!parsed.success) {
    throw new Error(`Environment server tidak valid:\n${z.prettifyError(parsed.error)}`);
  }
  return parsed.data;
}

/** URL situs untuk metadata — aman dipanggil tanpa Supabase terkonfigurasi. */
export function siteUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
}

export function allowIndexing() {
  return process.env.NEXT_PUBLIC_ALLOW_INDEXING === "true";
}

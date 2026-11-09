import "server-only";
import { createHmac } from "node:crypto";

/**
 * IP klien dari header proxy Vercel. `x-vercel-forwarded-for` diisi oleh edge Vercel
 * dan tidak bisa dipalsukan klien; `x-forwarded-for` dipakai sebagai cadangan lokal.
 */
export function clientIp(headers: Headers): string {
  const candidates = [
    headers.get("x-vercel-forwarded-for"),
    headers.get("x-real-ip"),
    headers.get("x-forwarded-for"),
  ];
  for (const value of candidates) {
    const ip = value?.split(",")[0]?.trim();
    if (ip) return ip;
  }
  return "0.0.0.0";
}

/** HMAC-SHA256(ip, salt) — IP asli tidak pernah disimpan. */
export function hashIp(ip: string, salt: string): string {
  return createHmac("sha256", salt).update(ip).digest("hex");
}

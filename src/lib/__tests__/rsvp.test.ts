import { describe, expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));
import { sanitizeLine, sanitizeMultiline } from "../rsvp/sanitize";
import { rsvpSchema } from "../rsvp/schema";
import { mapRsvpError } from "../rsvp/errors";
import { clientIp, hashIp } from "../security/ip";

describe("sanitasi", () => {
  it("membuang tag HTML & script", () => {
    expect(sanitizeLine('Budi <script>alert(1)</script>')).toBe("Budi alert(1)");
    expect(sanitizeLine('<img src=x onerror=alert(1)>Sari')).toBe("Sari");
  });
  it("menetralkan tag yang disusun ulang setelah penghapusan", () => {
    expect(sanitizeLine("<scr<script>ipt>alert(1)")).not.toMatch(/<|>/);
  });
  it("membuang karakter zero-width & kontrol", () => {
    expect(sanitizeLine("an\u200Bjing\u0007")).toBe("anjing");
  });
  it("merapikan baris baru berlebih pada pesan", () => {
    expect(sanitizeMultiline("Selamat\n\n\n\nSemoga  sakinah ")).toBe("Selamat\n\nSemoga sakinah");
  });
});

describe("schema RSVP", () => {
  const base = { slug: "budi-santoso-x7k2", name: "Budi", attendance: "hadir", pax: 2, message: "Selamat" };
  it("menerima payload valid", () => {
    expect(rsvpSchema.parse(base)).toMatchObject({ pax: 2, message: "Selamat" });
  });
  it("pax menjadi null bila tidak hadir", () => {
    expect(rsvpSchema.parse({ ...base, attendance: "tidak_hadir" }).pax).toBeNull();
  });
  it("menolak slug berbahaya", () => {
    expect(rsvpSchema.safeParse({ ...base, slug: "../admin" }).success).toBe(false);
  });
  it("menolak pesan > 500 karakter", () => {
    expect(rsvpSchema.safeParse({ ...base, message: "a".repeat(501) }).success).toBe(false);
  });
  it("menolak nama yang kosong setelah sanitasi", () => {
    expect(rsvpSchema.safeParse({ ...base, name: "<b></b>" }).success).toBe(false);
  });
});

describe("IP & galat", () => {
  it("memprioritaskan header Vercel dan mengambil IP pertama", () => {
    const h = new Headers({ "x-forwarded-for": "1.1.1.1, 2.2.2.2", "x-vercel-forwarded-for": "9.9.9.9" });
    expect(clientIp(h)).toBe("9.9.9.9");
  });
  it("hash deterministik, panjang 64, tidak memuat IP asli", () => {
    const a = hashIp("1.2.3.4", "s".repeat(32));
    expect(a).toHaveLength(64);
    expect(a).toBe(hashIp("1.2.3.4", "s".repeat(32)));
    expect(a).not.toContain("1.2.3.4");
  });
  it("memetakan kode galat RPC", () => {
    expect(mapRsvpError("P0429").status).toBe(429);
    expect(mapRsvpError("P0422", "2").message).toContain("2 orang");
    expect(mapRsvpError("XX000").status).toBe(500);
  });
});

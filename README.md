# Undangan Pernikahan Raihan & Andini

Next.js 15 (App Router) · TypeScript · Tailwind CSS v4 · Framer Motion · React Three Fiber · Supabase · Vercel

## Menjalankan
```bash
pnpm install
cp .env.example .env.local   # isi nilai Supabase setelah proyek dibuat
pnpm dev
pnpm test        # unit test sanitasi, validasi, hash IP
```

## Struktur
```
src/
  app/            layout, halaman, globals.css (design token), fonts.ts, icon
  content/        wedding.ts — SATU-SATUNYA sumber teks & data acara (cari "PLACEHOLDER")
  lib/env.ts      validasi environment (zod, lazy)
  lib/supabase/   client.ts (browser), server.ts (sesi/RLS), admin.ts (secret key, server-only)
  types/          tipe database (digenerate di Fase 2)
  fonts/          Tenor Sans & Karla self-hosted (tanpa request ke Google Fonts)
public/
  images/         aset teroptimasi Fase 0 (envelope, fx, couple, gallery, brand, ornament, meta)
  audio/          musik latar (dimuat setelah interaksi)
scripts/          optimize-assets.py — reproduksi optimasi aset
```

## Design token (globals.css)
| Token | Nilai | Proporsi |
|---|---|---|
| `alabaster` | #FAFAFA | 60% latar |
| `rose` (+50/100/300/600) | #DCAE96 | 30% kartu & basis 3D |
| `burgundy` (+700/900) | #722F37 | 10% aksen & CTA |
| `ink` / `ink-muted` | #3D2B2E / #6E5559 | teks paragraf |

Utilitas bentuk: `arch` (kubah + sudut bawah lembut), `arch-top` (kubah penuh, untuk thumbnail galeri).
Font: `font-display` (Tenor Sans), `font-sans` (Karla). Skala teks: `text-caption` … `text-hero`.

## Alur RSVP (Fase 2)
```
Formulir → POST /api/rsvp  (cek Origin, ≤4 KB, JSON, Zod + sanitasi, honeypot)
         → hash IP (HMAC-SHA256 + IP_HASH_SALT)
         → RPC submit_rsvp (service role): rate limit 3/jam · validasi slug & max_pax · filter kata · upsert 1/slug
         → trigger sync_wish → tabel publik `wishes` → Supabase Realtime ke semua tamu
```
Detail database: `supabase/README.md`.

## Efek partikel (Fase 4)
| Mode | Kapan | Implementasi |
|---|---|---|
| `webgl` | WebGL tersedia, perangkat ≥ 3 core & > 2 GB RAM, bukan hemat data | `components/fx/ParticleCanvas.tsx` (R3F, ±1.000 segitiga, di-unmount setelah 6,6 dtk) |
| `dom` | Tanpa WebGL / perangkat lemah / modul tak siap ≤ 650 ms / konteks WebGL hilang | `components/hero/PetalBurst.tsx` & `ButterflyBurst.tsx` |
| `none` | `prefers-reduced-motion: reduce` | tanpa partikel |

Three.js tidak ada di bundle awal; modul dipanaskan saat ada sinyal niat (hover/sentuh/fokus sampul).
QA: tambahkan `&fx=webgl`, `&fx=dom`, atau `&fx=none` pada URL.

## Seksi konten (Fase 5)
Urutan: Kutipan & ayat → Mempelai → Hitung mundur + kalender → Kisah Kami → Galeri → Acara + Siaran langsung → RSVP (Fase 6) → Penutup.
- `/undangan.ics` — file kalender statis (akad & resepsi, pengingat H-1); juga tautan Google Kalender.
- Galeri: thumbnail landscape dipotong 1:1, portrait 3:4, semuanya berpuncak kubah; lightbox `<dialog>` (Esc, ←/→, swipe).

## RSVP & Ucapan (Fase 6)
- `components/rsvp/RsvpForm.tsx` — formulir terpadu (nama, hadir/tidak, jumlah 1..max_pax, pesan ≤ 500, honeypot). Validasi ringan di klien; Zod hanya di server.
- `components/rsvp/WishList.tsx` — daftar ucapan; klien Supabase dimuat saat seksi mendekati layar lalu berlangganan Realtime `wishes` (INSERT/UPDATE/DELETE).
- Tanpa slug valid → formulir diganti pesan "bersifat pribadi"; daftar ucapan tetap tampil.

## Dashboard Admin (Fase 7) — `/admin`
| Halaman | Fungsi |
|---|---|
| `/admin/login` | Login email + kata sandi (Supabase Auth). Akun harus terdaftar di tabel `admins`. |
| `/admin` | Ringkasan (jumlah orang hadir, respons, tersensor), daftar RSVP dengan filter & pencarian, sembunyikan/tampilkan ucapan, lihat pesan asli, hapus, unduh CSV |
| `/admin/tamu` | Tambah tamu, impor CSV (`nama, maks_tamu, telepon`), salin tautan/pesan, kirim via WhatsApp, ubah/hapus |
| `/admin/kata` | Kelola daftar kata kasar |

Keamanan: middleware menyegarkan sesi & menolak tamu tanpa login; setiap halaman/aksi memanggil `requireAdmin()`; RLS menjadi lapis kedua; ekspor CSV dinetralkan dari formula injection.

## QA & Rilis (Fase 8)
- Framer Motion memakai `LazyMotion` + `m.*` (fitur animasi dimuat async): First Load JS 176 → **156 KB**.
- Header keamanan: CSP (tanpa `unsafe-eval`), HSTS, X-Frame-Options, Referrer-Policy, Permissions-Policy.
- Halaman `not-found` & `error` bergaya undangan.
- Audit axe-core (WCAG 2.1 AA + best practice): 0 pelanggaran di semua halaman.
- Panduan rilis lengkap: `DEPLOY.md`.

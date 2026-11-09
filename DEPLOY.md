# Panduan Rilis — Undangan Raihan & Andini

## 1. Repositori
```bash
git init && git add . && git commit -m "Undangan Raihan & Andini v1"
git branch -M main
git remote add origin https://github.com/<akun>/undangan-raihan-andini.git
git push -u origin main
```
`.env.local` sudah di-ignore — jangan di-commit.

## 2. Vercel
1. vercel.com → **Add New Project** → impor repositori di atas (framework terdeteksi: Next.js, package manager: pnpm).
2. **Environment Variables** (Production & Preview):

| Nama | Nilai | Keterangan |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | `https://<domain-anda>` | Dipakai metadata & tautan WhatsApp. **Wajib** — nilainya ikut di-*build*. |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://hqtiapbrqqncpdiheixa.supabase.co` | Juga dipakai CSP |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | `sb_publishable_…` | Aman untuk publik |
| `NEXT_PUBLIC_ALLOW_INDEXING` | `false` | `true` bila undangan boleh muncul di Google |
| `SUPABASE_SECRET_KEY` | `sb_secret_…` | **Rahasia** — tandai *Sensitive* |
| `IP_HASH_SALT` | hasil `openssl rand -hex 32` | **Rahasia**, jangan diubah setelah rilis |

3. Deploy. Mengubah variabel `NEXT_PUBLIC_*` memerlukan **Redeploy**.

## 3. Supabase (sekali saja)
1. Authentication → Users → **Add user** → `miraidigital68@gmail.com` + kata sandi, centang *Auto Confirm User*.
   Email ini sudah terdaftar di `private.admin_invites`; trigger otomatis menjadikannya admin (migrasi 004).
   Admin tambahan: `insert into private.admin_invites (email) values ('email@baru.id');` lalu buat akunnya.
2. ~~SQL manual~~ — tidak diperlukan lagi.
3. Authentication → Sign In / Providers → matikan **Allow new users to sign up**.
4. Hapus tamu contoh: `delete from public.guests where slug in ('budi-santoso-x7k2','keluarga-hartono-p9m4','sari-wulandari-q2n8');`

## 4. Uji pasca-rilis (±10 menit)
- [ ] Buka `/?to=<slug tamu nyata>` di ponsel → nama tamu tampil, amplop terbuka, musik berbunyi.
- [ ] Kirim RSVP → ucapan muncul; buka di perangkat kedua → ucapan muncul tanpa refresh (Realtime).
- [ ] Kirim 4× dalam 1 jam dari jaringan sama → kiriman ke-4 ditolak.
- [ ] `/admin` → login, sembunyikan ucapan → hilang di perangkat tamu.
- [ ] Kirim tautan ke WhatsApp sendiri → pratinjau menampilkan foto & judul personal.
- [ ] PageSpeed Insights (mobile) pada URL produksi — target Performance ≥ 90.
- [ ] Uji `&fx=webgl`, `&fx=dom` di ponsel Android kelas menengah & iPhone.

## 5. Sebelum disebar
Ganti semua `PLACEHOLDER` di `src/content/wedding.ts` (nama lengkap, orang tua, Instagram, lokasi, tautan Maps, jam resepsi, akun live, kisah cinta).

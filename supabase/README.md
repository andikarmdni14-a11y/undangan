# Database — Supabase

## Urutan penerapan
1. `migrations/20261105000001_init_schema.sql` — tabel, RLS, RPC, Realtime
2. `migrations/20261105000002_seed_blocked_words.sql` — kamus kata kasar
3. `seed.sql` — tamu contoh (hanya untuk staging/lokal)

## Kontrak RPC `submit_rsvp`
| SQLSTATE | Arti | HTTP |
|---|---|---|
| `P0429` | > 3 pengiriman per hash IP dalam 1 jam | 429 |
| `P0404` | slug tamu tidak ada | 404 |
| `P0422` | pax melebihi `guests.max_pax` (detail = kuota) | 422 |

## Menjadikan akun sebagai admin
Cara cepat (migrasi 004): daftarkan email di `private.admin_invites`, lalu buat akunnya — trigger otomatis memberi hak admin.

Cara manual:
1. Supabase Dashboard → Authentication → Providers → Email: aktifkan, lalu **matikan "Allow new users to sign up"** setelah akun admin dibuat.
2. Buat user admin (Authentication → Users → Add user).
3. Jalankan: `insert into public.admins (user_id) select id from auth.users where email = 'email-admin@contoh.id';`

## Uji lokal (Postgres polos)
`tests/local_stub.sql` meniru role & skema `auth` Supabase; `tests/rsvp_test.sql` menguji rate limit, kuota, filter kata, moderasi, dan RLS.

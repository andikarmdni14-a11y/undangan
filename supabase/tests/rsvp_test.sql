\set ON_ERROR_STOP on
\set QUIET on
-- helper: jalankan sebagai role tertentu
begin;
set local role service_role;

-- 1. Kirim RSVP baru dengan kata kasar → tersensor & tampil di wishes
select * from public.submit_rsvp('budi-santoso-x7k2', 'Budi', 'hadir', 2::smallint,
  'Selamat ya, dasar ANJIIING bahagia selalu di pantai!', repeat('a', 64));
select message, is_flagged from public.rsvps;
select message from public.wishes;

-- 2. Update RSVP yang sama (1 per slug) → is_update = true, tetap 1 baris
select * from public.submit_rsvp('budi-santoso-x7k2', 'Budi S.', 'tidak_hadir', 2::smallint,
  'Mohon maaf tidak bisa hadir, semoga sakinah', repeat('a', 64));
select count(*) as jumlah_rsvp, max(pax) as pax_null_karena_tidak_hadir from public.rsvps;

-- 3. Pengiriman ke-3 masih boleh, ke-4 ditolak (rate limit 3/jam)
select rsvp_id is not null as ok3 from public.submit_rsvp('sari-wulandari-q2n8', 'Sari', 'hadir', 1::smallint, '', repeat('a', 64));
commit;

do $$ begin
  perform public.submit_rsvp('sari-wulandari-q2n8', 'Sari', 'hadir', 1::smallint, '', repeat('a', 64));
  raise exception 'SEHARUSNYA DITOLAK';
exception when sqlstate 'P0429' then raise notice 'OK rate limit ke-4 ditolak (P0429)';
end $$;

-- 4. Pax melebihi max_pax → P0422; slug salah → P0404
do $$ begin
  perform public.submit_rsvp('sari-wulandari-q2n8', 'Sari', 'hadir', 3::smallint, '', repeat('b', 64));
  raise exception 'SEHARUSNYA DITOLAK';
exception when sqlstate 'P0422' then raise notice 'OK pax melebihi batas ditolak (P0422)';
end $$;
do $$ begin
  perform public.submit_rsvp('tidak-ada', 'X', 'hadir', 1::smallint, '', repeat('c', 64));
  raise exception 'SEHARUSNYA DITOLAK';
exception when sqlstate 'P0404' then raise notice 'OK slug tidak dikenal ditolak (P0404)';
end $$;

-- 5. Moderasi: sembunyikan → hilang dari wishes; kirim ulang → tetap tersembunyi
update public.rsvps set status = 'hidden' where guest_id = (select id from public.guests where slug='budi-santoso-x7k2');
select count(*) as wishes_setelah_hide from public.wishes;
select * from public.submit_rsvp('budi-santoso-x7k2', 'Budi', 'hadir', 1::smallint, 'pesan baru', repeat('d', 64));
select status, (select count(*) from public.wishes) as wishes_tetap_0 from public.rsvps r join public.guests g on g.id=r.guest_id where g.slug='budi-santoso-x7k2';

-- 6. RLS: anon hanya bisa membaca wishes, tidak bisa rsvps/guests/RPC
set role anon;
select count(*) as anon_baca_wishes from public.wishes;
do $$ begin perform 1 from public.rsvps; raise exception 'BOCOR'; exception when insufficient_privilege then raise notice 'OK anon tidak bisa membaca rsvps'; end $$;
do $$ begin perform 1 from public.guests; raise exception 'BOCOR'; exception when insufficient_privilege then raise notice 'OK anon tidak bisa membaca guests'; end $$;
do $$ begin perform public.submit_rsvp('x','x','hadir',1::smallint,'',repeat('e',64)); raise exception 'BOCOR';
exception when insufficient_privilege then raise notice 'OK anon tidak bisa memanggil submit_rsvp'; end $$;
reset role;

-- 7. Authenticated non-admin: tidak melihat apa pun; admin: melihat semua
insert into auth.users (id, email) values ('11111111-1111-1111-1111-111111111111','bukan-admin@x.id'),
                                          ('22222222-2222-2222-2222-222222222222','admin@x.id');
insert into public.admins (user_id) values ('22222222-2222-2222-2222-222222222222');
set role authenticated;
set request.jwt.claim.sub = '11111111-1111-1111-1111-111111111111';
select count(*) as nonadmin_lihat_rsvp from public.rsvps;
set request.jwt.claim.sub = '22222222-2222-2222-2222-222222222222';
select count(*) as admin_lihat_rsvp from public.rsvps;
select * from public.rsvp_summary;
do $$ begin update public.rsvps set message = 'diubah admin'; raise exception 'BOCOR';
exception when insufficient_privilege then raise notice 'OK admin hanya boleh mengubah kolom status'; end $$;
reset role;

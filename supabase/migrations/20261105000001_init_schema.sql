-- =============================================================================
-- Fase 2 — Skema undangan Raihan & Andini
--   guests          daftar tamu (slug unik → ?to=<slug>), max_pax per tamu
--   rsvps           data RSVP + ucapan (PRIVAT, hanya admin & service role)
--   wishes          proyeksi publik ucapan yang tampil (Realtime, dibaca anon)
--   blocked_words   kamus kata kasar untuk auto-filter
--   submission_log  jejak pengiriman per hash IP (rate limit)
--   admins          user Supabase Auth yang berhak membuka dashboard
-- Semua penulisan dari tamu lewat RPC submit_rsvp() yang hanya bisa dieksekusi
-- service role (dipanggil Route Handler Next.js). Anon tidak punya hak tulis.
-- =============================================================================

create extension if not exists pgcrypto with schema extensions;

-- ---------------------------------------------------------------- tipe
create type public.attendance_status as enum ('hadir', 'tidak_hadir');
create type public.moderation_status as enum ('visible', 'hidden');

-- ---------------------------------------------------------------- utilitas
create or replace function public.set_updated_at()
returns trigger language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- ---------------------------------------------------------------- admins
create table public.admins (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

create or replace function public.is_admin()
returns boolean language sql stable security definer
set search_path = ''
as $$
  select exists (select 1 from public.admins a where a.user_id = (select auth.uid()));
$$;

-- ---------------------------------------------------------------- guests
create table public.guests (
  id           uuid primary key default gen_random_uuid(),
  slug         text not null unique
               check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and char_length(slug) between 3 and 80),
  display_name text not null check (char_length(btrim(display_name)) between 1 and 120),
  max_pax      smallint not null default 2 check (max_pax between 1 and 10),
  phone        text check (phone is null or phone ~ '^\+?[0-9]{8,15}$'),
  notes        text check (notes is null or char_length(notes) <= 500),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create trigger guests_updated_at before update on public.guests
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------- rsvps (privat)
create table public.rsvps (
  id           uuid primary key default gen_random_uuid(),
  guest_id     uuid not null unique references public.guests (id) on delete cascade, -- 1 RSVP per slug
  name         text not null check (char_length(btrim(name)) between 2 and 80),
  attendance   public.attendance_status not null,
  pax          smallint check (pax between 1 and 10),
  message      text check (message is null or char_length(message) <= 500),      -- versi tersaring (publik)
  message_raw  text check (message_raw is null or char_length(message_raw) <= 500), -- asli (admin saja)
  is_flagged   boolean not null default false,  -- true bila filter kata kasar menyensor sesuatu
  status       public.moderation_status not null default 'visible',
  ip_hash      text not null,
  submit_count smallint not null default 1,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  constraint rsvps_pax_matches_attendance check (
    (attendance = 'hadir' and pax is not null) or (attendance = 'tidak_hadir' and pax is null)
  )
);
create index rsvps_created_at_idx on public.rsvps (created_at desc);
create trigger rsvps_updated_at before update on public.rsvps
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------- wishes (publik)
create table public.wishes (
  id         uuid primary key references public.rsvps (id) on delete cascade,
  name       text not null,
  attendance public.attendance_status not null,
  message    text not null,
  created_at timestamptz not null
);
create index wishes_created_at_idx on public.wishes (created_at desc);

-- Sinkronisasi rsvps → wishes. Ucapan disembunyikan = baris dihapus dari wishes,
-- sehingga klien Realtime menerima event DELETE dan langsung melepasnya dari layar.
create or replace function public.sync_wish()
returns trigger language plpgsql security definer
set search_path = ''
as $$
begin
  if new.status = 'visible' and coalesce(btrim(new.message), '') <> '' then
    insert into public.wishes (id, name, attendance, message, created_at)
    values (new.id, new.name, new.attendance, new.message, new.created_at)
    on conflict (id) do update
      set name = excluded.name, attendance = excluded.attendance, message = excluded.message;
  else
    delete from public.wishes where id = new.id;
  end if;
  return new;
end;
$$;
create trigger rsvps_sync_wish after insert or update on public.rsvps
  for each row execute function public.sync_wish();

-- ---------------------------------------------------------------- blocked_words
create table public.blocked_words (
  word       text primary key check (word = lower(btrim(word)) and char_length(word) between 2 and 40),
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------- submission_log
create table public.submission_log (
  id         bigint generated always as identity primary key,
  ip_hash    text not null,
  created_at timestamptz not null default now()
);
create index submission_log_ip_time_idx on public.submission_log (ip_hash, created_at desc);

-- ---------------------------------------------------------------- filter kata kasar
-- Mengganti kata terlarang (batas kata, tidak peka huruf besar) dengan bintang.
-- Juga menormalkan pengulangan huruf berlebih (mis. "anjiiing") sebelum dicocokkan.
create or replace function public.mask_profanity(p_text text, out masked text, out flagged boolean)
language plpgsql stable security definer
set search_path = ''
as $$
declare
  w text;
  before text;
begin
  masked := p_text;
  flagged := false;
  if p_text is null then return; end if;
  for w in select bw.word from public.blocked_words bw order by char_length(bw.word) desc loop
    before := masked;
    -- \m dan \M = awal/akhir kata; huruf boleh berulang ("a+n+j+i+n+g+")
    masked := regexp_replace(
      masked,
      '\m' || regexp_replace(w, '(.)', '\1+', 'g') || '\M',
      repeat('*', char_length(w)),
      'gi'
    );
    if masked <> before then flagged := true; end if;
  end loop;
end;
$$;

-- ---------------------------------------------------------------- RPC: profil tamu
create or replace function public.get_guest(p_slug text)
returns table (
  slug text, display_name text, max_pax smallint,
  rsvp_name text, rsvp_attendance public.attendance_status, rsvp_pax smallint, rsvp_message text
)
language sql stable security definer
set search_path = ''
as $$
  select g.slug, g.display_name, g.max_pax, r.name, r.attendance, r.pax, r.message_raw
  from public.guests g
  left join public.rsvps r on r.guest_id = g.id
  where g.slug = lower(btrim(p_slug));
$$;

-- ---------------------------------------------------------------- RPC: kirim RSVP
-- Atomik: rate limit → validasi tamu & kapasitas → filter → upsert → catat log.
-- Kode galat (SQLSTATE) diterjemahkan Route Handler menjadi pesan untuk tamu.
create or replace function public.submit_rsvp(
  p_slug text,
  p_name text,
  p_attendance public.attendance_status,
  p_pax smallint,
  p_message text,
  p_ip_hash text,
  p_limit int default 3,
  p_window interval default interval '1 hour'
)
returns table (rsvp_id uuid, is_update boolean, is_flagged boolean)
language plpgsql security definer
set search_path = ''
as $$
declare
  v_guest public.guests;
  v_recent int;
  v_masked text;
  v_flagged boolean;
  v_pax smallint;
  v_msg text := nullif(btrim(p_message), '');
begin
  if p_ip_hash is null or char_length(p_ip_hash) < 32 then
    raise exception 'ip_hash tidak valid' using errcode = '22023';
  end if;

  -- Kunci per IP agar dua request paralel tidak lolos batas bersamaan.
  perform pg_advisory_xact_lock(hashtextextended(p_ip_hash, 0));

  delete from public.submission_log where created_at < now() - interval '1 day';

  select count(*) into v_recent
  from public.submission_log sl
  where sl.ip_hash = p_ip_hash and sl.created_at > now() - p_window;
  if v_recent >= p_limit then
    raise exception 'rate_limited' using errcode = 'P0429';
  end if;

  select * into v_guest from public.guests g where g.slug = lower(btrim(p_slug));
  if not found then
    raise exception 'guest_not_found' using errcode = 'P0404';
  end if;

  if p_attendance = 'hadir' then
    v_pax := coalesce(p_pax, 1);
    if v_pax < 1 or v_pax > v_guest.max_pax then
      raise exception 'pax_exceeded' using errcode = 'P0422', detail = v_guest.max_pax::text;
    end if;
  else
    v_pax := null;
  end if;

  select m.masked, m.flagged into v_masked, v_flagged from public.mask_profanity(v_msg) m;

  insert into public.submission_log (ip_hash) values (p_ip_hash);

  return query
  insert into public.rsvps as r (guest_id, name, attendance, pax, message, message_raw, is_flagged, ip_hash)
  values (v_guest.id, btrim(p_name), p_attendance, v_pax, v_masked, v_msg, coalesce(v_flagged, false), p_ip_hash)
  on conflict (guest_id) do update set
    name = excluded.name,
    attendance = excluded.attendance,
    pax = excluded.pax,
    message = excluded.message,
    message_raw = excluded.message_raw,
    is_flagged = excluded.is_flagged,
    ip_hash = excluded.ip_hash,
    submit_count = r.submit_count + 1
    -- status moderasi sengaja TIDAK di-reset: ucapan yang disembunyikan admin tetap tersembunyi.
  returning r.id, (r.submit_count > 1), r.is_flagged;
end;
$$;

-- =============================================================================
-- Row Level Security
-- =============================================================================
alter table public.admins          enable row level security;
alter table public.guests          enable row level security;
alter table public.rsvps           enable row level security;
alter table public.wishes          enable row level security;
alter table public.blocked_words   enable row level security;
alter table public.submission_log  enable row level security;

-- Cabut hak default; beri ulang secara eksplisit.
revoke all on public.admins, public.guests, public.rsvps, public.wishes,
              public.blocked_words, public.submission_log from anon, authenticated;

-- wishes: publik hanya baca
grant select on public.wishes to anon, authenticated;
create policy "wishes dibaca publik" on public.wishes for select to anon, authenticated using (true);

-- admins: admin boleh melihat daftar admin
grant select on public.admins to authenticated;
create policy "admin melihat admin" on public.admins for select to authenticated using ((select public.is_admin()));

-- guests: CRUD penuh untuk admin
grant select, insert, update, delete on public.guests to authenticated;
create policy "admin kelola tamu" on public.guests for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

-- rsvps: admin baca, ubah status moderasi, hapus
grant select, delete on public.rsvps to authenticated;
grant update (status) on public.rsvps to authenticated;
create policy "admin baca rsvp"  on public.rsvps for select to authenticated using ((select public.is_admin()));
create policy "admin moderasi"   on public.rsvps for update to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "admin hapus rsvp" on public.rsvps for delete to authenticated using ((select public.is_admin()));

-- blocked_words: CRUD admin
grant select, insert, delete on public.blocked_words to authenticated;
create policy "admin kelola kata" on public.blocked_words for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

-- submission_log: tanpa akses klien sama sekali (hanya service role / fungsi definer)

-- Fungsi: hanya service role yang boleh mengirim RSVP & membaca profil tamu.
revoke execute on function public.submit_rsvp(text, text, public.attendance_status, smallint, text, text, int, interval)
  from public, anon, authenticated;
revoke execute on function public.get_guest(text) from public, anon, authenticated;
revoke execute on function public.mask_profanity(text) from public, anon, authenticated;
revoke execute on function public.sync_wish() from public, anon, authenticated;
grant execute on function public.submit_rsvp(text, text, public.attendance_status, smallint, text, text, int, interval) to service_role;
grant execute on function public.get_guest(text) to service_role;
grant execute on function public.mask_profanity(text) to service_role;
grant execute on function public.is_admin() to authenticated;

-- ---------------------------------------------------------------- Realtime
alter publication supabase_realtime add table public.wishes;

-- ---------------------------------------------------------------- Rekap untuk dashboard
create or replace view public.rsvp_summary
with (security_invoker = true) as
select
  count(*) filter (where attendance = 'hadir')                 as total_hadir,
  count(*) filter (where attendance = 'tidak_hadir')           as total_tidak_hadir,
  coalesce(sum(pax) filter (where attendance = 'hadir'), 0)    as total_pax,
  (select count(*) from public.guests)                         as total_undangan,
  count(*) filter (where is_flagged)                           as total_tersaring
from public.rsvps;
revoke all on public.rsvp_summary from anon;
grant select on public.rsvp_summary to authenticated;
revoke execute on function public.set_updated_at() from public, anon, authenticated;

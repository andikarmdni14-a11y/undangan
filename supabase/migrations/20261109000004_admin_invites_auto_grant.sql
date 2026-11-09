-- Undangan admin berbasis email: begitu akun dengan email ini dibuat di Supabase Auth,
-- otomatis terdaftar sebagai admin. Tabel privat, tidak terekspos ke API.
create table if not exists private.admin_invites (
  email      text primary key check (email = lower(btrim(email))),
  created_at timestamptz not null default now()
);
revoke all on private.admin_invites from public, anon, authenticated;

create or replace function private.grant_admin_on_signup()
returns trigger language plpgsql security definer
set search_path = ''
as $$
begin
  if exists (select 1 from private.admin_invites i where i.email = lower(new.email)) then
    insert into public.admins (user_id) values (new.id) on conflict do nothing;
  end if;
  return new;
end;
$$;
revoke execute on function private.grant_admin_on_signup() from public, anon, authenticated;

drop trigger if exists on_auth_user_created_grant_admin on auth.users;
create trigger on_auth_user_created_grant_admin
  after insert on auth.users
  for each row execute function private.grant_admin_on_signup();

insert into private.admin_invites (email) values ('miraidigital68@gmail.com') on conflict do nothing;

-- Bila akun sudah ada lebih dulu, langsung jadikan admin.
insert into public.admins (user_id)
select u.id from auth.users u join private.admin_invites i on i.email = lower(u.email)
on conflict do nothing;

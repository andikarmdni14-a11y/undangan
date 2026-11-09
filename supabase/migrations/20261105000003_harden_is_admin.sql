-- Pindahkan helper RLS ke skema privat agar tidak terekspos sebagai endpoint /rest/v1/rpc
-- (temuan Supabase Security Advisor: anon/authenticated dapat mengeksekusi SECURITY DEFINER).
create schema if not exists private;
revoke all on schema private from public, anon;
grant usage on schema private to authenticated;
alter function public.is_admin() set schema private;
revoke execute on function private.is_admin() from public, anon;
grant execute on function private.is_admin() to authenticated;
comment on table public.submission_log is 'Sengaja tanpa policy: hanya diakses fungsi SECURITY DEFINER submit_rsvp.';

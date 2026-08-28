-- ============================================================
-- Fase 1 — Pengerasan fungsi (mengikuti security advisor)
-- ============================================================

-- 1) Kunci search_path pada trigger updated_at.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- 2) Trigger function tidak perlu bisa dipanggil via RPC/API.
revoke all on function public.set_updated_at()        from public, anon, authenticated;
revoke all on function public.handle_new_auth_user()  from public, anon, authenticated;

-- 3) Versi ber-argumen uid: hanya untuk server (service_role).
revoke all on function public.is_admin(uuid)             from public, anon, authenticated;
revoke all on function public.current_admin_role(uuid)   from public, anon, authenticated;
revoke all on function public.has_permission(uuid, text) from public, anon, authenticated;
grant execute on function public.is_admin(uuid)             to service_role;
grant execute on function public.current_admin_role(uuid)   to service_role;
grant execute on function public.has_permission(uuid, text) to service_role;

-- 4) Versi tanpa argumen DIPERLUKAN oleh RLS; authenticated tetap boleh, anon dicabut.
revoke all on function public.is_admin()          from public, anon;
revoke all on function public.has_permission(text) from public, anon;
grant execute on function public.is_admin()          to authenticated, service_role;
grant execute on function public.has_permission(text) to authenticated, service_role;

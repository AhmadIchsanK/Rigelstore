-- ============================================================
-- Fase 1 — Fungsi RBAC (deterministik, SECURITY DEFINER)
-- Dipakai oleh RLS dan oleh server aplikasi.
-- ============================================================

create or replace function public.is_admin(uid uuid)
returns boolean language sql stable security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1 from public.admin_users a
    where a.id = uid and a.is_active = true
  );
$$;

create or replace function public.current_admin_role(uid uuid)
returns text language sql stable security definer
set search_path = public, pg_temp
as $$
  select a.role_key from public.admin_users a
  where a.id = uid and a.is_active = true;
$$;

create or replace function public.has_permission(uid uuid, perm text)
returns boolean language sql stable security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1
    from public.admin_users a
    where a.id = uid
      and a.is_active = true
      and (
        a.role_key = 'super_admin'
        or exists (
          select 1 from public.role_permissions rp
          where rp.role_key = a.role_key
            and rp.permission_key = perm
        )
      )
  );
$$;

create or replace function public.is_admin()
returns boolean language sql stable security definer
set search_path = public, pg_temp
as $$ select public.is_admin(auth.uid()); $$;

create or replace function public.has_permission(perm text)
returns boolean language sql stable security definer
set search_path = public, pg_temp
as $$ select public.has_permission(auth.uid(), perm); $$;

revoke all on function public.is_admin(uuid)              from public;
revoke all on function public.current_admin_role(uuid)    from public;
revoke all on function public.has_permission(uuid, text)  from public;
revoke all on function public.is_admin()                  from public;
revoke all on function public.has_permission(text)        from public;

grant execute on function public.is_admin(uuid)             to authenticated, service_role;
grant execute on function public.current_admin_role(uuid)   to authenticated, service_role;
grant execute on function public.has_permission(uuid, text) to authenticated, service_role;
grant execute on function public.is_admin()                 to authenticated, service_role;
grant execute on function public.has_permission(text)       to authenticated, service_role;

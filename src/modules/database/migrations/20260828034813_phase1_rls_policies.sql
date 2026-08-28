-- ============================================================
-- Fase 1 — Row Level Security untuk semua tabel Fase 1
-- Default deny; akses hanya lewat policy eksplisit.
-- ============================================================

alter table public.roles              enable row level security;
alter table public.permissions        enable row level security;
alter table public.role_permissions   enable row level security;
alter table public.users              enable row level security;
alter table public.admin_users        enable row level security;
alter table public.admin_invitations  enable row level security;
alter table public.audit_logs         enable row level security;
alter table public.system_settings    enable row level security;

-- roles / permissions / role_permissions
create policy roles_read on public.roles
  for select to authenticated using (public.is_admin());
create policy roles_write on public.roles
  for all to authenticated
  using (public.has_permission('roles.manage'))
  with check (public.has_permission('roles.manage'));

create policy permissions_read on public.permissions
  for select to authenticated using (public.is_admin());
create policy permissions_write on public.permissions
  for all to authenticated
  using (public.has_permission('roles.manage'))
  with check (public.has_permission('roles.manage'));

create policy role_permissions_read on public.role_permissions
  for select to authenticated using (public.is_admin());
create policy role_permissions_write on public.role_permissions
  for all to authenticated
  using (public.has_permission('roles.manage'))
  with check (public.has_permission('roles.manage'));

-- users (profil pelanggan)
create policy users_select_own on public.users
  for select to authenticated
  using (id = auth.uid() or public.has_permission('customers.read'));
create policy users_update_own on public.users
  for update to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());
create policy users_insert_own on public.users
  for insert to authenticated
  with check (id = auth.uid());

-- admin_users
create policy admin_users_read on public.admin_users
  for select to authenticated using (public.is_admin());
create policy admin_users_write on public.admin_users
  for all to authenticated
  using (public.has_permission('admins.manage'))
  with check (public.has_permission('admins.manage'));

-- admin_invitations
create policy admin_invitations_all on public.admin_invitations
  for all to authenticated
  using (public.has_permission('admins.manage'))
  with check (public.has_permission('admins.manage'));

-- audit_logs (immutable: tanpa policy UPDATE/DELETE)
create policy audit_logs_read on public.audit_logs
  for select to authenticated using (public.has_permission('audit.read'));
create policy audit_logs_insert on public.audit_logs
  for insert to authenticated with check (public.is_admin());

-- system_settings
create policy system_settings_read on public.system_settings
  for select to authenticated using (public.is_admin());
create policy system_settings_write on public.system_settings
  for all to authenticated
  using (public.has_permission('settings.manage'))
  with check (public.has_permission('settings.manage'));

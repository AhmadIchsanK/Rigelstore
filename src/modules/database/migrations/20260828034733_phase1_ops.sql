-- ============================================================
-- Fase 1 — audit_logs & system_settings
-- ============================================================

create table public.audit_logs (
  id          bigint generated always as identity primary key,
  actor_id    uuid references auth.users(id),
  actor_role  text,
  action      text not null,            -- mis. 'admin.login', 'price.change'
  target_type text,                     -- mis. 'product', 'admin_user'
  target_id   text,
  metadata    jsonb not null default '{}'::jsonb,
  ip_address  text,
  created_at  timestamptz not null default now()
);

create index idx_audit_logs_actor on public.audit_logs(actor_id);
create index idx_audit_logs_created on public.audit_logs(created_at desc);
create index idx_audit_logs_action on public.audit_logs(action);

create table public.system_settings (
  key        text primary key,
  value      jsonb not null default '{}'::jsonb,
  updated_by uuid references auth.users(id),
  updated_at timestamptz not null default now()
);

create trigger trg_system_settings_updated_at
  before update on public.system_settings
  for each row execute function public.set_updated_at();

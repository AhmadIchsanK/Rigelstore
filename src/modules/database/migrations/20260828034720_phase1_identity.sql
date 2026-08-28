-- ============================================================
-- Fase 1 — Identitas: users (pelanggan), admin_users (back-office),
--          admin_invitations (undangan kedaluwarsa, bukan password bersama)
-- ============================================================

create table public.users (
  id         uuid primary key references auth.users(id) on delete cascade,
  email      text,
  full_name  text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger trg_users_updated_at
  before update on public.users
  for each row execute function public.set_updated_at();

create table public.admin_users (
  id          uuid primary key references auth.users(id) on delete cascade,
  role_key    text not null references public.roles(id),
  is_active   boolean not null default true,
  created_by  uuid references auth.users(id),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  disabled_at timestamptz
);

create index idx_admin_users_active on public.admin_users(is_active);

create trigger trg_admin_users_updated_at
  before update on public.admin_users
  for each row execute function public.set_updated_at();

create table public.admin_invitations (
  id          uuid primary key default gen_random_uuid(),
  email       text not null,
  role_key    text not null references public.roles(id),
  token_hash  text not null unique,
  invited_by  uuid references auth.users(id),
  expires_at  timestamptz not null,
  accepted_at timestamptz,
  revoked_at  timestamptz,
  created_at  timestamptz not null default now()
);

create index idx_admin_invitations_email on public.admin_invitations(email);
create index idx_admin_invitations_expires on public.admin_invitations(expires_at);

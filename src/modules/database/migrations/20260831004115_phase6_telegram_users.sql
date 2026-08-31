-- ============================================================
-- Fase 6 — Telegram storefront: pemetaan identitas Telegram
-- Pembeli Telegram = guest dengan email sintetik deterministik dari telegram_id.
-- ============================================================

create table public.telegram_users (
  telegram_id    bigint primary key,
  username       text,
  first_name     text,
  linked_user_id uuid references auth.users(id),
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  last_seen_at   timestamptz
);

create trigger trg_telegram_users_updated_at
  before update on public.telegram_users
  for each row execute function public.set_updated_at();

alter table public.telegram_users enable row level security;

create policy telegram_users_read on public.telegram_users
  for select to authenticated
  using (public.has_permission('customers.read'));

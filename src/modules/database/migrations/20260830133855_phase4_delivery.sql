-- ============================================================
-- Fase 4 — Pengiriman aman: download_events + kolom pengiriman entitlement
-- ============================================================

alter table public.entitlements
  add column if not exists password_encrypted text,   -- password unik PDF (terenkripsi)
  add column if not exists delivered_at timestamptz,
  add column if not exists download_count int not null default 0;

create table public.download_events (
  id            bigint generated always as identity primary key,
  entitlement_id uuid references public.entitlements(id) on delete set null,
  order_id      uuid references public.orders(id) on delete set null,
  user_id       uuid references auth.users(id),
  guest_email   text,
  event         text not null default 'download',  -- 'download' | 'reveal'
  ip_address    text,
  created_at    timestamptz not null default now()
);
create index idx_download_events_entitlement on public.download_events(entitlement_id);
create index idx_download_events_order on public.download_events(order_id);

alter table public.download_events enable row level security;

create policy download_events_read on public.download_events
  for select to authenticated
  using (public.has_permission('orders.read'));

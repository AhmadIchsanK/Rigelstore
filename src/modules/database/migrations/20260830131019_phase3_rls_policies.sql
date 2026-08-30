-- ============================================================
-- Fase 3 — RLS order & pembayaran (default-deny).
-- Semua penulisan lewat fungsi mesin (service_role). Klien hanya BACA miliknya.
-- ============================================================

alter table public.orders         enable row level security;
alter table public.order_items    enable row level security;
alter table public.payments       enable row level security;
alter table public.entitlements   enable row level security;
alter table public.webhook_events enable row level security;

create policy orders_read_own on public.orders
  for select to authenticated
  using (user_id = auth.uid() or public.has_permission('orders.read'));

create policy order_items_read on public.order_items
  for select to authenticated
  using (exists (select 1 from public.orders o
    where o.id = order_id and (o.user_id = auth.uid() or public.has_permission('orders.read'))));

create policy payments_read on public.payments
  for select to authenticated
  using (exists (select 1 from public.orders o
    where o.id = order_id and (o.user_id = auth.uid() or public.has_permission('orders.read'))));

create policy entitlements_read_own on public.entitlements
  for select to authenticated
  using (user_id = auth.uid() or public.has_permission('orders.read'));

create policy webhook_events_read on public.webhook_events
  for select to authenticated
  using (public.has_permission('audit.read'));

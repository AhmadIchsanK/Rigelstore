-- ============================================================
-- Fase 3 — Order & pembayaran (ZONA BAHAYA: uang)
-- orders, order_items, payments, entitlements, webhook_events
-- ============================================================

create type public.order_status as enum ('pending', 'paid', 'expired', 'cancelled', 'refunded');
create type public.payment_status as enum ('pending', 'paid', 'expired', 'failed');
create type public.entitlement_status as enum ('active', 'revoked');

create table public.orders (
  id            uuid primary key default gen_random_uuid(),
  order_number  text not null unique,
  user_id       uuid references auth.users(id),
  guest_email   text,
  status        public.order_status not null default 'pending',
  subtotal_idr  bigint not null default 0 check (subtotal_idr >= 0),
  total_idr     bigint not null default 0 check (total_idr >= 0),
  currency      text not null default 'IDR',
  reservation_minutes int not null default 15,
  expires_at    timestamptz,
  paid_at       timestamptz,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  constraint orders_buyer_present check (user_id is not null or guest_email is not null)
);
create index idx_orders_status on public.orders(status);
create index idx_orders_user on public.orders(user_id);
create index idx_orders_expiry on public.orders(expires_at) where status = 'pending';
create trigger trg_orders_updated_at
  before update on public.orders
  for each row execute function public.set_updated_at();

create table public.order_items (
  id                uuid primary key default gen_random_uuid(),
  order_id          uuid not null references public.orders(id) on delete cascade,
  product_id        uuid not null references public.products(id),
  inventory_item_id uuid references public.inventory_items(id),
  title_snapshot    text not null,
  unit_price_idr    bigint not null check (unit_price_idr >= 0),
  quantity          int not null default 1 check (quantity >= 1),
  line_total_idr    bigint not null check (line_total_idr >= 0),
  created_at        timestamptz not null default now()
);
create index idx_order_items_order on public.order_items(order_id);

alter table public.inventory_items
  add constraint inventory_reserved_by_order_fk
  foreign key (reserved_by_order) references public.orders(id) on delete set null;

create table public.payments (
  id           uuid primary key default gen_random_uuid(),
  order_id     uuid not null references public.orders(id) on delete cascade,
  provider     text not null,
  provider_ref text,
  status       public.payment_status not null default 'pending',
  amount_idr   bigint not null check (amount_idr >= 0),
  qr_string    text,
  qr_url       text,
  raw          jsonb not null default '{}'::jsonb,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  paid_at      timestamptz
);
create index idx_payments_order on public.payments(order_id);
create trigger trg_payments_updated_at
  before update on public.payments
  for each row execute function public.set_updated_at();

create table public.entitlements (
  id                uuid primary key default gen_random_uuid(),
  order_id          uuid not null references public.orders(id) on delete cascade,
  user_id           uuid references auth.users(id),
  guest_email       text,
  product_id        uuid not null references public.products(id),
  inventory_item_id uuid references public.inventory_items(id),
  status            public.entitlement_status not null default 'active',
  created_at        timestamptz not null default now()
);
create index idx_entitlements_user on public.entitlements(user_id);
create index idx_entitlements_order on public.entitlements(order_id);

create table public.webhook_events (
  id           bigint generated always as identity primary key,
  provider     text not null,
  event_id     text not null,
  signature_ok boolean not null default false,
  order_id     uuid references public.orders(id),
  payload      jsonb not null default '{}'::jsonb,
  processed_at timestamptz not null default now(),
  unique (provider, event_id)
);

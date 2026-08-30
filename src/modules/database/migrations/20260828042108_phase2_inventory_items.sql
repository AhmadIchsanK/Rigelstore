-- ============================================================
-- Fase 2 — inventory_items (barang unik: kredensial)
-- Status: AVAILABLE -> RESERVED -> SOLD -> DELIVERED -> COMPLETED
-- Pengecualian: EXPIRED, REVOKED, REFUNDED
-- ============================================================

create type public.inventory_status as enum (
  'AVAILABLE','RESERVED','SOLD','DELIVERED','COMPLETED','EXPIRED','REVOKED','REFUNDED'
);

create table public.inventory_items (
  id                    uuid primary key default gen_random_uuid(),
  product_id            uuid not null references public.products(id) on delete cascade,
  status                public.inventory_status not null default 'AVAILABLE',
  -- Kredensial DIENKRIPSI (AES-256-GCM): "v1:base64(iv):base64(tag):base64(ct)".
  secret_encrypted      text,
  label                 text,
  reserved_by_order     uuid,   -- FK ke orders ditambahkan Fase 3
  reserved_at           timestamptz,
  reservation_expires_at timestamptz,
  sold_at               timestamptz,
  delivered_at          timestamptz,
  created_by            uuid references auth.users(id),
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);
create index idx_inventory_product_status on public.inventory_items(product_id, status);
create index idx_inventory_reservation_expiry
  on public.inventory_items(reservation_expires_at) where status = 'RESERVED';
create trigger trg_inventory_items_updated_at
  before update on public.inventory_items
  for each row execute function public.set_updated_at();

-- ============================================================
-- Fase 2 — Katalog: products, product_files, categories, collections
-- ============================================================

create type public.product_type as enum (
  'reusable_file', 'unique_credential', 'protected_pdf', 'bundle'
);
create type public.product_status as enum ('draft', 'published', 'archived');

create table public.products (
  id           uuid primary key default gen_random_uuid(),
  slug         text not null unique,
  title        text not null,
  description  text,
  type         public.product_type not null,
  status       public.product_status not null default 'draft',
  price_idr    bigint not null default 0 check (price_idr >= 0),
  cover_path   text,
  metadata     jsonb not null default '{}'::jsonb,
  created_by   uuid references auth.users(id),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  published_at timestamptz
);
create index idx_products_status on public.products(status);
create index idx_products_type on public.products(type);
create trigger trg_products_updated_at
  before update on public.products
  for each row execute function public.set_updated_at();

create type public.product_file_kind as enum ('asset', 'preview', 'base_pdf');

create table public.product_files (
  id           uuid primary key default gen_random_uuid(),
  product_id   uuid not null references public.products(id) on delete cascade,
  kind         public.product_file_kind not null default 'asset',
  storage_path text not null,
  filename     text,
  content_type text,
  size_bytes   bigint,
  is_primary   boolean not null default false,
  created_at   timestamptz not null default now()
);
create index idx_product_files_product on public.product_files(product_id);

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  created_at timestamptz not null default now()
);
create table public.collections (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  created_at timestamptz not null default now()
);
create table public.product_categories (
  product_id  uuid not null references public.products(id) on delete cascade,
  category_id uuid not null references public.categories(id) on delete cascade,
  primary key (product_id, category_id)
);
create table public.product_collections (
  product_id    uuid not null references public.products(id) on delete cascade,
  collection_id uuid not null references public.collections(id) on delete cascade,
  primary key (product_id, collection_id)
);

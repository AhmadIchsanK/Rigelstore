-- ============================================================
-- Fase 2 — RLS untuk katalog & inventory
-- ============================================================

alter table public.products            enable row level security;
alter table public.product_files       enable row level security;
alter table public.categories          enable row level security;
alter table public.collections         enable row level security;
alter table public.product_categories  enable row level security;
alter table public.product_collections enable row level security;
alter table public.inventory_items     enable row level security;

-- products: publik lihat 'published'; admin lihat semua; tulis = products.manage
create policy products_read_published on public.products
  for select to anon, authenticated
  using (status = 'published' or public.is_admin());
create policy products_write on public.products
  for all to authenticated
  using (public.has_permission('products.manage'))
  with check (public.has_permission('products.manage'));

-- product_files: tidak publik (pengiriman aman Fase 4); admin saja
create policy product_files_read on public.product_files
  for select to authenticated using (public.is_admin());
create policy product_files_write on public.product_files
  for all to authenticated
  using (public.has_permission('products.manage'))
  with check (public.has_permission('products.manage'));

-- categories / collections + join: baca publik; tulis catalog/products
create policy categories_read on public.categories
  for select to anon, authenticated using (true);
create policy categories_write on public.categories
  for all to authenticated
  using (public.has_permission('catalog.manage'))
  with check (public.has_permission('catalog.manage'));
create policy collections_read on public.collections
  for select to anon, authenticated using (true);
create policy collections_write on public.collections
  for all to authenticated
  using (public.has_permission('catalog.manage'))
  with check (public.has_permission('catalog.manage'));
create policy product_categories_read on public.product_categories
  for select to anon, authenticated using (true);
create policy product_categories_write on public.product_categories
  for all to authenticated
  using (public.has_permission('products.manage'))
  with check (public.has_permission('products.manage'));
create policy product_collections_read on public.product_collections
  for select to anon, authenticated using (true);
create policy product_collections_write on public.product_collections
  for all to authenticated
  using (public.has_permission('products.manage'))
  with check (public.has_permission('products.manage'));

-- inventory_items: tidak pernah publik; hanya inventory.manage
create policy inventory_read on public.inventory_items
  for select to authenticated using (public.has_permission('inventory.manage'));
create policy inventory_write on public.inventory_items
  for all to authenticated
  using (public.has_permission('inventory.manage'))
  with check (public.has_permission('inventory.manage'));

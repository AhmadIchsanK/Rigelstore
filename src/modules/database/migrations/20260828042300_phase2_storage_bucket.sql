-- ============================================================
-- Fase 2 — Bucket penyimpanan privat untuk file produk
-- Tidak ada akses publik; file hanya diakses lewat signed URL (storage adapter).
-- ============================================================

insert into storage.buckets (id, name, public)
values ('product-files', 'product-files', false)
on conflict (id) do nothing;

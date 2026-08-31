-- Fase 7 — Bucket PUBLIK untuk gambar cover produk (cover bukan rahasia).
insert into storage.buckets (id, name, public)
values ('product-covers', 'product-covers', true)
on conflict (id) do update set public = true;

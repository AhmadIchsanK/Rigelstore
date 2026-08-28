-- ============================================================
-- Fase 1 — Fondasi RBAC: roles, permissions, role_permissions
-- Bersumber dari DATABASE.md & SECURITY.md
-- ============================================================

-- Helper: set updated_at otomatis
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Definisi peran (key = pengenal peran, dipakai di seluruh sistem)
create table public.roles (
  id          text primary key,          -- mis. 'super_admin'
  name        text not null,
  description text,
  created_at  timestamptz not null default now()
);

-- Definisi izin granular
create table public.permissions (
  key         text primary key,          -- mis. 'products.manage'
  description text,
  created_at  timestamptz not null default now()
);

-- Pemetaan peran -> izin (many-to-many)
create table public.role_permissions (
  role_key       text not null references public.roles(id) on delete cascade,
  permission_key text not null references public.permissions(key) on delete cascade,
  primary key (role_key, permission_key)
);

-- ---------- Seed peran ----------
insert into public.roles (id, name, description) values
  ('super_admin',   'Super Admin',   'Pemilik. Semua kuasa: admin, keamanan, integrasi, peran, pengaturan, audit.'),
  ('admin',         'Admin',         'Operator toko: produk, inventory, order, katalog, kupon, support, analitik.'),
  ('content_admin', 'Content Admin', 'Draft produk/konten. Tanpa kontrol pembayaran atau izin.'),
  ('support_admin', 'Support Admin', 'Order/pelanggan, kirim ulang delivery/support. Tanpa konfigurasi finansial.');

-- ---------- Seed izin ----------
insert into public.permissions (key, description) values
  ('admins.manage',    'Tambah/nonaktifkan/ubah/hapus admin (Super Admin).'),
  ('security.manage',  'Pengaturan keamanan & integrasi (Super Admin).'),
  ('roles.manage',     'Ubah peran & izin (Super Admin).'),
  ('settings.payment', 'Ubah pengaturan pembayaran (Super Admin — TIDAK PERNAH AI).'),
  ('settings.manage',  'Ubah pengaturan sistem umum.'),
  ('audit.read',       'Baca audit log.'),
  ('products.manage',  'Kelola produk (buat/ubah/terbit).'),
  ('products.draft',   'Buat draft produk/konten (tanpa terbit).'),
  ('pricing.manage',   'Ubah harga produk.'),
  ('inventory.manage', 'Kelola inventory & barang unik.'),
  ('catalog.manage',   'Kelola kategori/koleksi/landing.'),
  ('coupons.manage',   'Kelola kupon/bundle/promo.'),
  ('orders.read',      'Lihat order.'),
  ('orders.manage',    'Kelola order.'),
  ('delivery.resend',  'Kirim ulang delivery.'),
  ('refunds.manage',   'Proses refund (finansial).'),
  ('customers.read',   'Lihat data pelanggan.'),
  ('support.manage',   'Kelola tiket support.'),
  ('reviews.moderate', 'Moderasi ulasan.'),
  ('analytics.read',   'Lihat analitik.'),
  ('content.draft',    'Buat draft konten.'),
  ('ai.approve',       'Menyetujui publikasi produk hasil AI (gerbang manusia).');

-- ---------- Seed pemetaan peran -> izin ----------
-- super_admin: TIDAK di-seed di sini; has_permission() memberi izin penuh
--             secara implisit (lihat migrasi fungsi RBAC).

-- admin
insert into public.role_permissions (role_key, permission_key) values
  ('admin','products.manage'),
  ('admin','products.draft'),
  ('admin','pricing.manage'),
  ('admin','inventory.manage'),
  ('admin','catalog.manage'),
  ('admin','coupons.manage'),
  ('admin','orders.read'),
  ('admin','orders.manage'),
  ('admin','delivery.resend'),
  ('admin','refunds.manage'),
  ('admin','customers.read'),
  ('admin','support.manage'),
  ('admin','reviews.moderate'),
  ('admin','analytics.read'),
  ('admin','content.draft'),
  ('admin','audit.read'),
  ('admin','settings.manage'),
  ('admin','ai.approve');

-- content_admin: HANYA draft; tanpa pembayaran/izin/harga
insert into public.role_permissions (role_key, permission_key) values
  ('content_admin','products.draft'),
  ('content_admin','content.draft');

-- support_admin: order/pelanggan/support; tanpa konfigurasi finansial
insert into public.role_permissions (role_key, permission_key) values
  ('support_admin','orders.read'),
  ('support_admin','orders.manage'),
  ('support_admin','delivery.resend'),
  ('support_admin','customers.read'),
  ('support_admin','support.manage'),
  ('support_admin','reviews.moderate');

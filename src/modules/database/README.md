# Modul `database` — Akses Data

Skema, migrasi, dan lapisan akses data (repository) di atas PostgreSQL/Supabase.

**Status:** Fase 1 aktif. Berisi klien Supabase (`supabase/`) dan migrasi SQL
(`migrations/`) untuk skema fondasi RBAC/identitas. Cetak biru lengkap ada di
`DATABASE.md` di root repo.

- `supabase/` — klien browser, server (RLS per sesi), dan admin (service_role).
- `migrations/` — SQL migrasi Fase 1 (sumber kebenaran skema di git).

## Isi yang direncanakan (dibangun Fase 1)

- Definisi skema / migrasi untuk semua tabel di `DATABASE.md`
  (users, admin_users/roles/permissions, products, product_files,
  inventory_items, orders/order_items, payments, entitlements, download_events,
  categories/collections, coupons/promotions, reviews/support_tickets,
  social_posts/schedules, ai_jobs/ai_drafts/ai_approvals, audit_logs,
  system_settings/webhook_events).
- Repository/query yang dipakai `core/` — modul lain tidak mengakses database
  langsung, selalu lewat sini.

## Prinsip

- Koneksi & kredensial database **hanya** dari environment variables.
- Reservasi barang unik memakai **transaction / row locking** (lihat `core/`).

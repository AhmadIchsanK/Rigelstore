# Modul `database` — Akses Data

Skema, migrasi, dan lapisan akses data (repository) di atas PostgreSQL/Supabase.

**Status Fase 0:** kerangka kosong. Cetak biru tabel ada di `DATABASE.md` di root
repo; skema nyata dibuat pada Fase 1.

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

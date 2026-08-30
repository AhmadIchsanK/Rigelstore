# Migrasi Database RigelStore

Berkas SQL migrasi, **sumber kebenaran skema di git**. Berkas ini identik dengan
migrasi yang sudah diterapkan ke project Supabase RigelStore (nama & urutan
sama dengan riwayat migrasi Supabase).

Urutan diberi awalan versi (timestamp) agar dijalankan berurutan. Untuk
menerapkan ke database baru, jalankan berurutan (mis. lewat Supabase CLI
`supabase db push`, editor SQL, atau alat migrasi pilihanmu).

| Urutan | Berkas | Isi |
|--------|--------|-----|
| 1 | `20260828034701_phase1_rbac_core.sql` | roles, permissions, role_permissions + seed |
| 2 | `20260828034720_phase1_identity.sql` | users, admin_users, admin_invitations |
| 3 | `20260828034733_phase1_ops.sql` | audit_logs, system_settings |
| 4 | `20260828034752_phase1_rbac_functions.sql` | is_admin / has_permission / current_admin_role |
| 5 | `20260828034813_phase1_rls_policies.sql` | RLS default-deny + policy semua tabel |
| 6 | `20260828034826_phase1_auth_user_provisioning.sql` | trigger profil pelanggan saat signup |
| 7 | `20260828034915_phase1_harden_functions.sql` | pengerasan grant & search_path fungsi |
| 8 | `20260828042047_phase2_catalog.sql` | products, product_files, categories, collections + join |
| 9 | `20260828042108_phase2_inventory_items.sql` | inventory_items + enum status barang unik |
| 10 | `20260828042151_phase2_inventory_functions.sql` | reserve/release/sold/delivered/revoke (locking) |
| 11 | `20260828042221_phase2_rls_policies.sql` | RLS katalog & inventory |
| 12 | `20260828042300_phase2_storage_bucket.sql` | bucket privat `product-files` |
| 13 | `20260830130901_phase3_orders.sql` | orders, order_items, payments, entitlements, webhook_events |
| 14 | `20260830130958_phase3_order_functions.sql` | place_order, confirm_order_paid (idempoten), expire_due_orders |
| 15 | `20260830131019_phase3_rls_policies.sql` | RLS order/pembayaran (baca milik sendiri) |
| 16 | `20260830131937_phase3_schedule_expiry_sweep.sql` | pg_cron pelepasan stok kadaluwarsa /menit |
| 17 | `20260830133855_phase4_delivery.sql` | download_events + kolom pengiriman entitlement |

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

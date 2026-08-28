# CHANGELOG — RigelStore

Semua perubahan penting dicatat di sini. Tiap akhir fase menambah satu entri.
Format tanggal: YYYY-MM-DD.

---

## Fase 1 — Database + Login + RBAC + fondasi admin — 2026-08-28

Sistem login, peran pengguna, dan batas akses admin yang **ditegakkan di
server** (bukan sekadar menyembunyikan tombol). Belum ada produk/checkout/
pembayaran — itu fase berikutnya.

### Ditambahkan
- **Project Supabase baru** khusus RigelStore (region Singapura, free tier).
- **Skema database Fase 1** (migrasi berurutan) + RLS aktif di semua tabel:
  `roles`, `permissions`, `role_permissions`, `users` (profil pelanggan),
  `admin_users`, `admin_invitations`, `audit_logs`, `system_settings`.
- **Fungsi RBAC deterministik** di database: `is_admin()`, `has_permission()`,
  `current_admin_role()` (SECURITY DEFINER, search_path terkunci). `super_admin`
  memperoleh semua izin secara implisit.
- **Row Level Security** default-deny di semua tabel; pelanggan tidak bisa
  membaca data admin walau memaksa query.
- **Login via Supabase Auth** (email+password), signup pelanggan, logout.
  Trigger otomatis membuat profil `public.users` saat signup.
- **Gerbang akses deterministik** (`src/modules/core/auth`): `assertAdmin`,
  `assertPermission`, `can` — dipakai server untuk menjaga `/admin`.
  Pelanggan yang memaksa buka `/admin` → 403 (tanpa membocorkan konten).
- **Undangan admin kedaluwarsa** (bukan password bersama): token sekali pakai,
  disimpan sebagai hash, berlaku 72 jam; alur buat (Super Admin) + terima.
- **Audit log** untuk pembuatan/penerimaan undangan & bootstrap admin.
- **Script bootstrap** Super Admin pertama (`scripts/bootstrap-admin.mjs`).
- **Automated test** (vitest, 19 tes): batas akses admin, izin per peran,
  konsistensi katalog RBAC, dan aturan undangan kedaluwarsa.

### Diverifikasi terhadap database langsung
- `is_admin`/`has_permission` cocok dengan logika TypeScript.
- Pelanggan diblokir RLS dari `admin_users` & `system_settings` (0 baris),
  admin melihat barisnya sendiri. Data uji sudah dibersihkan.

### Catatan
- Dua peringatan advisor tersisa (fungsi RBAC tanpa argumen bisa dipanggil
  pengguna login) memang **disengaja & tak terhindarkan** — RLS memakainya, dan
  keduanya hanya mengungkap status admin milik pemanggil sendiri.
- Yang harus diisi pemilik: `SUPABASE_SERVICE_ROLE_KEY` di environment
  (dibutuhkan untuk undangan admin, audit log, dan bootstrap).

---

## Fase 0 — Inisialisasi repo & dokumentasi — 2026-08-28

Fondasi proyek dan dokumen spesifikasi. **Belum ada fitur** (login, produk,
pembayaran, UI, dsb.) — sesuai rencana, itu dibangun di fase berikutnya.

### Ditambahkan
- Proyek **Next.js + TypeScript (App Router)** dengan halaman placeholder yang
  menandai status Fase 0.
- Kerangka **modular monolith** di `src/modules/`: `core`, `database`, `web`,
  `bot`, `payments`, `storage`, `ai`, `social` — masing-masing berisi README
  tanggung jawab (belum ada logika).
- `.gitignore` yang benar dan `.env.example` (hanya **nama** variabel, tanpa
  nilai rahasia).
- Dokumen spesifikasi (Bahasa Indonesia):
  - `PROJECT_SPEC.md` — ringkasan produk, tujuan/non-goals, peran & izin, tipe
    produk.
  - `ARCHITECTURE.md` — keputusan modular monolith, stack, cara web + Telegram
    memakai satu core.
  - `DATABASE.md` — cetak biru tabel + status inventory
    `AVAILABLE→RESERVED→SOLD→DELIVERED→COMPLETED` (+ `EXPIRED`/`REVOKED`/`REFUNDED`).
  - `SECURITY.md` — RBAC server-side, undangan admin kedaluwarsa, 2FA Super
    Admin, audit log, rate limiting, secret di env, backup+restore, webhook
    terverifikasi & idempotent.
  - `AI_RULES.md` — tabel governance AI (approval manusia untuk publish; AI tidak
    menyentuh uang/inventory/harga/pengaturan pembayaran).
  - `SOCIAL_RULES.md` — aturan auto-posting + pause global/per-platform + riwayat.
  - `DEPLOYMENT.md` — strategi free-first + checklist production readiness.
  - `TEST_PLAN.md` — daftar tes inti termasuk konkurensi barang unik &
    idempotency webhook.
- `README.md` utama berisi ikhtisar + **aturan kerja proyek**.

### Catatan
- Belum ada koneksi database, auth, pembayaran, atau storage — semua itu Fase 1+.
- Semua secret akan lewat environment variables; tidak ada yang di-hardcode.

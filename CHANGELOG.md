# CHANGELOG — RigelStore

Semua perubahan penting dicatat di sini. Tiap akhir fase menambah satu entri.
Format tanggal: YYYY-MM-DD.

---

## Fase 4 — Pengiriman aman + akun pelanggan + pemulihan order tamu — 2026-08-30

Barang terkirim aman setelah lunas; pelanggan bisa ambil ulang; tamu bisa
menemukan ordernya kembali. UI toko yang rapi (mobile-first) menyusul Fase 5.

### Ditambahkan
- **Tabel/kolom**: `download_events` (riwayat unduh/reveal), dan pada
  `entitlements`: `password_encrypted` (password unik PDF), `delivered_at`,
  `download_count`.
- **Mesin pengiriman** (`core/delivery`):
  - Verifikasi kepemilikan di server — akun cocok (`user_id`) ATAU tamu cocok
    (nomor order + email). Order wajib `paid`, entitlement `active`.
  - **Kredensial unik**: didekripsi & ditampilkan HANYA setelah verifikasi;
    item ditandai `DELIVERED`.
  - **File reusable**: **signed URL berumur pendek** (default 5 menit); path
    asli tak pernah diekspos.
  - **PDF terproteksi**: **password unik mudah diingat** per pembelian
    (mis. `Biru-Gajah-4821`), dibuat sekali & disimpan terenkripsi, + signed URL
    base PDF. (Jujur: password ≠ DRM.)
  - Setiap pengiriman dicatat di `download_events` + `delivered_at`/`download_count`.
- **Dashboard pelanggan** `/account` — daftar barang + tombol ambil/ambil-ulang.
- **Pemulihan order tamu** `/orders/lookup` — cari via nomor + email; tiap
  pengambilan diverifikasi ULANG (tanpa sesi).
- Tautan navigasi + halaman sukses checkout mengarah ke pengambilan barang.

### Catatan
- "Link lama mati": signed URL memang berumur pendek; tiap permintaan membuat
  URL baru. Cukup untuk toko normal (bukan DRM).
- Automated test naik jadi **42** (format password mudah diingat + variasi).
- Enkripsi password PDF memakai `CREDENTIAL_ENCRYPTION_KEY` yang sama.

---

## Fase 3 — Keranjang + Order + QRIS + Webhook ⚠️ (zona bahaya) — 2026-08-30

Pembeli bisa checkout dan membayar via QRIS; status lunas HANYA dari webhook
gateway yang terverifikasi & idempotent. Pengiriman aman + akun pelanggan +
pemulihan order guest menyusul Fase 4.

### Ditambahkan
- **Tabel uang**: `orders`, `order_items`, `payments`, `entitlements`,
  `webhook_events` (idempotency). FK reservasi inventory → orders.
- **Mesin order deterministik (SQL)**:
  - `place_order` — buat order + reservasi stok unik ATOMIK; stok habis →
    exception → rollback (tidak ada reservasi setengah jadi).
  - `confirm_order_paid` — IDEMPOTEN via `webhook_events(provider,event_id)`;
    verifikasi signature; cek nominal; tandai LUNAS → item SOLD → entitlement.
    Status lunas HANYA dari sini.
  - `expire_due_orders` — kadaluwarsakan order lewat waktu & lepas stok;
    dijadwalkan **pg_cron tiap menit**.
- **Adapter pembayaran** di balik interface: **Midtrans QRIS**
  (Sandbox/produksi) dengan verifikasi signature `sha512(order_id+status_code+
  gross_amount+ServerKey)`, plus **mock** untuk dev/tes.
- **Endpoint webhook** `/api/webhooks/midtrans` (terverifikasi + idempotent),
  **status polling** `/api/orders/[orderNumber]/status`, **cron**
  `/api/cron/release-expired` (dilindungi CRON_SECRET), dan **alat dev**
  `/api/dev/simulate-pay` (hanya mock, non-produksi).
- **UI**: katalog publik, halaman produk + "Beli sekarang" (guest pakai email),
  halaman checkout (QR + hitung mundur + status yang hanya berubah dari webhook).
  RLS: hanya produk `published` yang tampil.

### Diverifikasi terhadap database langsung (uji ketat)
- Stok 1 item: order A dapat; order B → OUT_OF_STOCK + rollback (0 orphan).
- Bayar A → LUNAS, item SOLD, 1 entitlement. **Replay webhook sama → duplicate,
  tetap 1 entitlement** (tidak dobel kirim). Signature salah → ditolak. Nominal
  salah → tidak diproses.
- Order kadaluwarsa → stok kembali AVAILABLE, order expired. Data uji dibersihkan.
- Automated test naik jadi **40** (signature Midtrans + pemetaan status,
  verifikasi webhook mock).

### Catatan
- Yang harus diisi pemilik untuk tes LIVE sandbox: `MIDTRANS_SERVER_KEY` &
  `MIDTRANS_CLIENT_KEY` (dari dashboard Midtrans Sandbox), lalu
  `PAYMENT_PROVIDER=midtrans`. Tanpa itu, dev memakai adapter `mock`
  (+ tombol "Simulasi bayar").
- Webhook URL yang didaftarkan di Midtrans: `<domain>/api/webhooks/midtrans`.

---

## Fase 2 — Produk + file + inventory unik — 2026-08-28

Admin bisa membuat produk (3 tipe), mengunggah file, dan mengelola stok
kredensial unik. Fondasi anti double-sell (reservasi atomik) sudah ada &
teruji; checkout sungguhan menyusul Fase 3.

### Ditambahkan
- **Tabel katalog**: `products`, `product_files`, `categories`, `collections`,
  `product_categories`, `product_collections` (+ enum `product_type`,
  `product_status`, `product_file_kind`). RLS: produk `published` bisa dibaca
  publik; file produk tidak publik (pengiriman aman Fase 4).
- **`inventory_items`** dengan enum status barang unik
  `AVAILABLE→RESERVED→SOLD→DELIVERED→COMPLETED` (+ `EXPIRED/REVOKED/REFUNDED`).
  RLS: hanya `inventory.manage`; tidak pernah publik.
- **Mesin inventory deterministik (SQL)**: `reserve_inventory_item`
  (atomik, `FOR UPDATE SKIP LOCKED` — dua checkout tidak bisa merebut item yang
  sama), `release_expired_reservations`, `mark_inventory_sold` (idempoten),
  `mark_inventory_delivered`, `revoke_inventory_item`. Hanya bisa dipanggil
  server (service_role) — tidak pernah AI.
- **Enkripsi kredensial at rest** (AES-256-GCM); kredensial polos tidak pernah
  disimpan. Admin hanya melihat label tersamar.
- **State machine inventory (TypeScript)** yang mencerminkan aturan SQL.
- **Adapter storage** (Supabase Storage) + bucket privat `product-files` +
  helper signed URL.
- **UI admin**: daftar produk, buat produk (3 tipe), unggah file, tambah stok
  kredensial (bulk), ubah status publikasi, cabut item — semua dijaga izin
  `products.manage` / `inventory.manage` di server. Setiap aksi dicatat di audit.

### Diverifikasi terhadap database langsung
- Reserve dua kali pada stok 2 item → dua item berbeda; reserve ketiga → NULL
  (tidak over-sell). Order salah gagal `mark_sold`; order benar sukses; replay
  idempoten. Reservasi kedaluwarsa dilepas kembali ke `AVAILABLE`. Data uji
  dibersihkan.
- Automated test bertambah jadi 32 (enkripsi round-trip + deteksi tampering
  GCM, state machine inventory, aturan tipe produk).

### Catatan
- Yang harus diisi pemilik: `CREDENTIAL_ENCRYPTION_KEY` (32 byte) di environment
  untuk enkripsi kredensial.

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

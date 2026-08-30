# DATABASE.md — RigelStore

Cetak biru tabel database RigelStore, bersumber dari rencana v1.0. Ini **rencana
konseptual**; skema SQL nyata dibangun bertahap per fase.

Database: **PostgreSQL** (Supabase). Semua akses lewat modul `database`.

> **Status implementasi (Fase 1):** sudah dibuat di project Supabase RigelStore:
> `roles`, `permissions`, `role_permissions`, `users`, `admin_users`,
> `admin_invitations`, `audit_logs`, `system_settings` — semuanya dengan **RLS
> aktif (default-deny)**. Ditambah fungsi RBAC deterministik `is_admin()`,
> `has_permission()`, `current_admin_role()` (SECURITY DEFINER; `super_admin`
> punya semua izin implisit) dan trigger auto-provisioning profil pelanggan saat
> signup.
>
> **Fase 2:** ditambahkan `products`, `product_files`, `categories`,
> `collections`, `product_categories`, `product_collections`, dan
> `inventory_items` (dengan enum `inventory_status`). Semua RLS aktif
> (produk `published` bisa dibaca publik; `inventory_items` hanya
> `inventory.manage`). Ditambah mesin inventory deterministik:
> `reserve_inventory_item` (atomik, `FOR UPDATE SKIP LOCKED` — anti double-sell),
> `release_expired_reservations`, `mark_inventory_sold`,
> `mark_inventory_delivered`, `revoke_inventory_item`. Kredensial disimpan
> terenkripsi (AES-256-GCM). Bucket storage privat `product-files`.
>
> **Fase 3:** ditambahkan `orders`, `order_items`, `payments`, `entitlements`,
> `webhook_events` (idempotency). Mesin order deterministik: `place_order`
> (reservasi atomik + buat order), `confirm_order_paid` (idempoten: LUNAS →
> SOLD → entitlement; hanya dari webhook terverifikasi), `expire_due_orders`
> (pelepasan stok kadaluwarsa, dijadwalkan pg_cron tiap menit). RLS: pelanggan
> hanya membaca order/entitlement miliknya.
>
> **Fase 4:** ditambahkan `download_events` (riwayat unduh/reveal) dan kolom
> pengiriman pada `entitlements` (`password_encrypted`, `delivered_at`,
> `download_count`). Pengiriman aman: signed URL berumur pendek + reveal
> kredensial setelah verifikasi kepemilikan.
>
> Tabel AI/social menyusul di fasenya.

---

## 1. Daftar tabel & tujuan

| Tabel | Tujuan |
|-------|--------|
| `users` | Identitas/profil pelanggan. |
| `admin_users` | Akun back-office (admin). |
| `roles` | Definisi peran (Super Admin, Admin, Content Admin, Support Admin). |
| `permissions` | Definisi izin granular; dipetakan ke peran. |
| `products` | Metadata produk: harga, tipe, visibilitas. |
| `product_files` | Referensi file & preview di storage. |
| `inventory_items` | Kredensial/kunci/password unik beserta **status**. |
| `orders` | Pembelian (header). |
| `order_items` | Baris order + **snapshot harga** saat beli. |
| `payments` | ID gateway, status, timestamp pembayaran. |
| `entitlements` | Hak akses pelanggan atas produk yang dibeli. |
| `download_events` | Riwayat download & keamanan. |
| `categories` | Struktur katalog. |
| `collections` | Kumpulan/landing produk. |
| `coupons` | Aturan diskon (kode). |
| `promotions` | Periode promo/sale. |
| `reviews` | Ulasan pelanggan. |
| `support_tickets` | Tiket support. |
| `social_posts` | Antrian/riwayat publikasi sosmed. |
| `schedules` | Jadwal posting. |
| `ai_jobs` | Job pipeline AI. |
| `ai_drafts` | Draft produk/konten hasil AI (status DRAFT). |
| `ai_approvals` | Catatan persetujuan manusia atas draft AI. |
| `audit_logs` | Aktivitas sensitif/admin. |
| `system_settings` | Konfigurasi sistem (pembayaran, storage, email, dsb). |
| `webhook_events` | Idempotency pembayaran (ID event yang sudah diproses). |

---

## 2. `inventory_items` — status barang unik (INTI ANTI DOUBLE-SELL)

Setiap barang unik (mis. satu kredensial, satu password PDF) punya satu baris
`inventory_items` dengan kolom **status** yang berpindah otomatis:

```
AVAILABLE ─► RESERVED ─► SOLD ─► DELIVERED ─► COMPLETED
(tersedia)  (dikunci)   (lunas) (terkirim)   (selesai)
```

Plus status pengecualian:

- `EXPIRED`  — reservasi kadaluwarsa (pembeli tidak bayar dalam batas waktu);
  item biasanya kembali ke `AVAILABLE` untuk dijual lagi.
- `REVOKED`  — admin mencabut item (mis. kredensial bermasalah).
- `REFUNDED` — order di-refund; item ditandai sesuai kebijakan.

### Arti tiap status

| Status | Arti | Dipicu oleh |
|--------|------|-------------|
| `AVAILABLE` | Siap dijual. | Kondisi awal / pelepasan reservasi. |
| `RESERVED` | Dikunci sementara untuk satu order (mis. 15 menit). | Checkout — reservasi atomik. |
| `SOLD` | Pembayaran lunas; kepemilikan berpindah. | Webhook pembayaran terverifikasi. |
| `DELIVERED` | Sudah dikirim ke pembeli (kredensial/password/link). | Delivery engine. |
| `COMPLETED` | Transaksi tuntas. | Penyelesaian order. |
| `EXPIRED` | Reservasi habis waktu tanpa pembayaran. | Cron pelepasan reservasi. |
| `REVOKED` | Dicabut admin. | Aksi admin (tercatat di audit log). |
| `REFUNDED` | Terkait order yang di-refund. | Proses refund. |

### Aturan kunci
- Reservasi **atomik** dengan **database transaction / row locking**: dua
  checkout untuk item yang sama tidak boleh dua-duanya berhasil.
- Timeout reservasi (mis. 15 menit) → item kembali `AVAILABLE`.
- Perpindahan status **hanya** oleh kode deterministik `core/`, **tidak pernah**
  oleh AI.

Transisi yang valid (rangkuman):
```
AVAILABLE → RESERVED            (checkout)
RESERVED  → SOLD                (pembayaran terverifikasi)
RESERVED  → AVAILABLE / EXPIRED (timeout / batal)
SOLD      → DELIVERED           (pengiriman)
DELIVERED → COMPLETED           (selesai)
apa pun   → REVOKED / REFUNDED  (aksi admin / refund, tercatat audit)
```

---

## 3. Relasi penting (konseptual)

- `orders` 1─* `order_items` *─1 `products`
- `order_items` bisa terkait 0/1 `inventory_items` (untuk tipe unik).
- `orders` 1─* `payments`; `payments` unik per `webhook_events` (idempotent).
- `orders`/`users` 1─* `entitlements` *─1 `products`.
- `entitlements` 1─* `download_events`.
- `products` *─* `categories`/`collections`.
- `ai_jobs` 1─* `ai_drafts` 1─1 `ai_approvals` (approval manusia sebelum publish).
- `social_posts` *─1 `schedules`.
- `admin_users` *─* `roles` *─* `permissions`.

---

## 4. Catatan implementasi (untuk Fase 1)
- Snapshot harga disimpan di `order_items` (harga saat beli, bukan harga produk
  sekarang).
- Kredensial sensitif di `inventory_items` **dienkripsi saat disimpan** (kunci
  dari env, lihat `SECURITY.md`).
- `webhook_events` menyimpan ID event unik dari gateway untuk idempotency.
- `audit_logs` mencatat: login, ubah harga, ubah produk, ubah inventory, refund,
  ubah admin, ubah setting, dan approval AI.

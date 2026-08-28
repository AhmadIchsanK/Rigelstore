# DATABASE.md — RigelStore

Cetak biru tabel database RigelStore, bersumber dari rencana v1.0. Ini **rencana
konseptual**; skema SQL nyata dibuat pada Fase 1 di dalam `src/modules/database`.

Database: **PostgreSQL** (Supabase). Semua akses lewat modul `database`.

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

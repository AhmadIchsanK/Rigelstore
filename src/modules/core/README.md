# Modul `core` — Shared Core Business Rules

Jantung RigelStore. Semua **aturan bisnis deterministik** tinggal di sini dan
dipakai bersama oleh website (`src/app` + `web/`) maupun Telegram (`bot/`).

**Status:** berisi logika Fase 1–3: `auth/` & `rbac/` (gerbang akses
deterministik), `admin/` (undangan), `audit/` (audit log), `crypto/` (enkripsi
kredensial), `inventory/` (state machine barang unik), `products/` (aturan tipe
& service produk/inventory), `orders/` (orkestrasi order + webhook, di atas
fungsi SQL deterministik). AI/social menyusul di fasenya.

## Isi yang direncanakan (dibangun Fase 1–4)

- **Order engine** — membuat order, snapshot harga, status order.
- **Inventory engine** — status barang unik `AVAILABLE → RESERVED → SOLD →
  DELIVERED → COMPLETED` (plus `EXPIRED`, `REVOKED`, `REFUNDED`), reservasi
  atomik dengan database locking agar tidak double-sell.
- **Payment engine** — status pembayaran hanya berubah dari webhook gateway yang
  terverifikasi; idempotent.
- **Entitlement engine** — hak akses pelanggan atas produk yang dibeli.
- **Delivery engine** — pemicu pengiriman aman (delegasi ke `storage/`).

## Prinsip

- **Deterministik, bukan AI.** Uang, kepemilikan barang unik, dan akses selalu
  diputuskan di sini — tidak pernah oleh modul `ai/`.
- Setiap aturan penting di modul ini **wajib punya automated test**.

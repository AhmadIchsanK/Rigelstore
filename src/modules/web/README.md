# Modul `web` — Web UI

Komponen presentasi dan controller khusus **website**. Rute Next.js (App Router)
tinggal di `src/app`; modul ini menampung komponen UI, layout toko, dan logika
presentasi yang dipanggil dari rute tersebut.

**Status Fase 0:** kerangka kosong. Hanya ada halaman placeholder di `src/app`.

## Isi yang direncanakan (dibangun Fase 5, di atas core Fase 1–4)

- Homepage, katalog, halaman produk, cart, checkout QRIS.
- Pencarian order guest & dashboard pelanggan, download & invoice.
- Panel admin.
- UI mobile-first: satu warna brand, latar netral, tipografi jelas; skeleton
  loading, empty state, pesan error/sukses, hitung mundur pembayaran.

## Prinsip

- Semua aksi commerce memanggil `core/` — **tidak ada** logika uang/inventory di
  lapisan UI.
- RBAC dicek di **server**, bukan sekadar menyembunyikan tombol.

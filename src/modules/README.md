# Modul RigelStore (Modular Monolith)

Folder ini adalah **kerangka modular monolith** RigelStore. Satu aplikasi, satu
basis kode, satu database — tetapi dipecah menjadi modul-modul dengan tanggung
jawab yang jelas. Ini jauh lebih murah dan mudah dikerjakan bertahap dibanding
microservices (lihat `ARCHITECTURE.md`).

**Status Fase 0:** semua modul di bawah ini masih **kerangka kosong** — hanya
folder + README. Belum ada logika, belum ada fitur. Isi tiap modul dibangun
bertahap sesuai roadmap.

## Peta modul

| Folder      | Nama di rencana         | Tanggung jawab singkat                                            | Mulai dibangun |
|-------------|-------------------------|-------------------------------------------------------------------|----------------|
| `core/`     | Shared core business rules | Order, inventory, payment, entitlement, delivery — deterministik | Fase 1–4       |
| `database/` | Database                | Skema, migrasi, repository/akses data (PostgreSQL/Supabase)       | Fase 1         |
| `web/`      | Web UI                  | Komponen & controller khusus website (dipakai oleh `src/app`)     | Fase 5         |
| `bot/`      | Bot worker              | Storefront Telegram (memakai `core` yang sama)                    | Fase 6         |
| `payments/` | Payments adapter        | Interface gateway QRIS + implementasi (mis. Midtrans) + webhook   | Fase 3         |
| `storage/`  | Storage adapter         | Upload file & signed URL (Cloudflare R2 / Supabase Storage)       | Fase 2/4       |
| `ai/`       | AI jobs                 | Pipeline draft produk & post (usulan, bukan keputusan)            | Fase 9/10      |
| `social/`   | Social adapters         | Publikasi ke Facebook / Instagram / Threads via API resmi         | Fase 10        |

## Aturan penting antar-modul

- **Semua uang, kepemilikan barang unik, dan akses** dikontrol oleh `core/`
  (kode deterministik). `ai/` dan `social/` tidak boleh menyentuhnya.
- **Website (`web/` + `src/app`) dan Telegram (`bot/`) WAJIB memakai `core/`
  yang sama.** Dilarang membuat sistem commerce terpisah.
- `payments/` dan `storage/` berada di balik **interface adapter** agar provider
  bisa diganti tanpa mengubah `core/`.

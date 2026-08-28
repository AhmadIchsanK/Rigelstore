# Modul `storage` — Storage Adapter

Penyimpanan file produk & aset di balik interface adapter (Cloudflare R2 atau
Supabase Storage). Bertanggung jawab atas **pengiriman aman**.

**Status Fase 0:** kerangka kosong.

## Isi yang direncanakan (dibangun Fase 2/4)

- Interface `StorageProvider` (upload, hapus, buat signed URL).
- Implementasi R2 / Supabase Storage.
- Signed URL berumur pendek untuk download; opsi batas jumlah/expiry download.

## Prinsip

- **Jangan pernah** mengekspos path asli file. Selalu lewat signed URL berumur
  pendek atau streaming yang terotorisasi.
- File & kredensial hanya bisa diakses setelah **entitlement** ada (dicek oleh
  `core/`).
- Kredensial sensitif dienkripsi saat disimpan (at rest).

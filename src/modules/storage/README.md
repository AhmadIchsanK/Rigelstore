# Modul `storage` — Storage Adapter

Penyimpanan file produk & aset di balik interface adapter (Cloudflare R2 atau
Supabase Storage). Bertanggung jawab atas **pengiriman aman**.

**Status:** Fase 2 aktif. Berisi `supabaseStorage.ts` — upload ke bucket privat
`product-files` + helper signed URL berumur pendek. Pengiriman aman ke pelanggan
(cek entitlement) dibangun Fase 4.

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

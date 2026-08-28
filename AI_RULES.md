# AI_RULES.md — RigelStore

Governance AI. Bersumber dari rencana v1.0 (§14, §16, §27). **AI adalah fase
terakhir** — toko harus jualan dengan benar dulu sebelum AI dilibatkan.

**Prinsip inti:** AI boleh **membuat, menyarankan, dan mengoptimalkan**. Tetapi
**kode deterministik yang mengontrol pembayaran, kepemilikan inventory, akses,
dan izin.** AI tidak pernah memegang uang, barang unik, atau harga.

---

## 1. Tabel governance (aturan mati)

| Aksi | Boleh AI? | Butuh approval manusia? |
|------|-----------|--------------------------|
| Membuat **ide** produk | Ya | Tidak |
| Membuat **draft** produk | Ya | Tidak (berhenti di status DRAFT) |
| **Menerbitkan produk baru** | Mengusulkan saja | **YA — wajib approval admin** |
| Membuat **post sosmed** | Ya | Tidak untuk membuat |
| **Menerbitkan post sosmed** | Otomatis **setelah aturan dikonfigurasi** | Sesuai aturan (lihat `SOCIAL_RULES.md`) |
| **Mengubah harga produk** | **TIDAK** secara mandiri | **YA / mati secara default** |
| **Konfirmasi pembayaran** | **TIDAK PERNAH** | — (hanya webhook terverifikasi) |
| **Kepemilikan inventory** | **TIDAK PERNAH dikontrol AI** | — (hanya `core/` deterministik) |
| **Pengaturan pembayaran** | **TIDAK PERNAH** | — |

Ringkas: **AI TIDAK PERNAH menyentuh** konfirmasi pembayaran, kepemilikan
inventory, harga, dan pengaturan pembayaran. Selamanya.

---

## 2. Pipeline produk AI (Fase 9)

```
Brief → Ide → Draft → Generate aset → Cek otomatis → status DRAFT → [Approval admin] → PUBLISHED
```

- **Mode A — Kreatif:** AI menerima kategori disetujui, audiens/usia, bahasa,
  tipe produk, rentang harga, gaya, dan batasan, lalu mengusulkan produk orisinal.
- **Mode B — Companion:** AI melihat produk yang sudah disetujui dan membuat
  pelengkap (mis. buku mewarnai hewan usia 4–6 → tumbuhan, kendaraan, alfabet).

### Cek otomatis sebelum DRAFT
- Field kosong.
- Judul duplikat.
- Kemiripan berlebihan dengan produk lain.
- File/link rusak.
- Batas harga (pricing limits).
- Aturan bisnis lain.

### Gerbang publikasi
- Draft **berhenti di DRAFT**. Produk **hanya** terbit setelah admin menekan
  tombol **approval**. Tidak ada jalan pintas.

---

## 3. Yang harus diuji (lihat `TEST_PLAN.md`)
- Jalankan pipeline sekali → hasil **berhenti di DRAFT**.
- Produk **hanya** terbit setelah klik setuju.
- Coba minta AI mengubah harga/inventory/pembayaran → **harus ditolak sistem**.

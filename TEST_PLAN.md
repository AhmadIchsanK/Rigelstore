# TEST_PLAN.md — RigelStore

Rencana tes. Bersumber dari rencana v1.0 (§21, §23, §25). Prinsip: **setiap
aturan bisnis penting wajib punya automated test.** Tiap akhir fase diakhiri
dengan tes + update `CHANGELOG.md`.

Zona bahaya (uang & barang unik) — Fase 3 & 8 — diuji lebih ketat.

---

## 1. Tes inti (wajib)

| # | Tes | Kenapa penting | Fase relevan |
|---|-----|----------------|--------------|
| 1 | **Alur beli lengkap di sandbox** | Pastikan end-to-end jalan tanpa uang asli. | 3 |
| 2 | **Checkout web & Telegram** | Kedua kanal memakai core yang sama. | 3, 6 |
| 3 | **Replay / idempotency webhook** | Kirim ulang webhook yang sama → barang **tidak** terkirim dua kali. | 3 |
| 4 | **Dua checkout bersamaan untuk 1 barang unik** | Hanya **satu** yang boleh dapat (anti double-sell / locking). | 2, 3 |
| 5 | **Kedaluwarsa pembayaran & pelepasan stok** | QR expired → item balik `AVAILABLE`. | 3 |
| 6 | **Download aman & re-download** | Signed URL berumur pendek; link lama mati; re-download dari akun. | 4 |
| 7 | **Pemulihan order guest** | Guest bisa temukan order lewat kode/email. | 4 |
| 8 | **Batas peran admin (RBAC)** | Customer paksa buka URL admin → **ditolak server**. | 1 |
| 9 | **Backup / restore** | Restore benar-benar berhasil, bukan cuma backup ada. | 8 |
| 10 | **Alur AI draft → approval → publish** | Berhenti di DRAFT; terbit hanya setelah approval manusia. | 9 |

---

## 2. Skenario end-to-end (dari rencana §23)

- **Akun unik:** pilih produk → item AVAILABLE di-reserve → order dibuat → QRIS
  dibuat → pembayaran dikonfirmasi webhook → item `SOLD` → entitlement dibuat →
  kredensial dikirim aman → order `DELIVERED`.
- **Produk AI:** scheduler memulai job → AI membuat konsep/konten/aset → cek
  otomatis → `DRAFT` → approval admin → `PUBLISHED` → social agent membuat/
  menjadwalkan post.
- **PDF terproteksi:** pembeli beli → password unik dibuat → entitlement dibuat →
  PDF + password dikirim aman → pembeli bisa re-download selama entitlement valid.

---

## 3. Tes tambahan
- Tes website & Telegram checkout terpisah, pastikan order muncul di admin
  (satu database).
- Tes pengiriman digital dari **perangkat luar**.
- Tes otomasi sosial dengan **akun terkontrol** sebelum produksi; pastikan
  **pause darurat** menghentikan semua (Fase 10).
- Kupon: buat kupon → pakai saat checkout → harga berubah & tercatat (Fase 7).

---

## 4. Aturan bisnis yang WAJIB punya automated test
- Reservasi barang unik (atomik, anti double-sell).
- Idempotency webhook pembayaran.
- Batas akses admin (RBAC di server).
- Pelepasan stok saat pembayaran kadaluwarsa.
- Gate approval produk AI.

---

## 5. Catatan
Gunakan **Sandbox** untuk semua tes pembayaran. **Jangan pakai uang asli di
Sandbox** (referensi QRIS sandbox bisa menunjuk Merchant ID produksi). Transaksi
kecil asli hanya dilakukan sekali menjelang go-live (lihat `DEPLOYMENT.md`).

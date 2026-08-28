# DEPLOYMENT.md — RigelStore

Strategi deploy & biaya. Bersumber dari rencana v1.0 (§19, §20, §25).

**Filosofi: Free-first.** Bangun P0 sepenuhnya di infrastruktur gratis/lokal,
selesaikan tes simulasi menyeluruh, **baru** sambungkan domain tahunan dan QRIS
produksi. Upgrade hanya setelah pemakaian nyata membutuhkan.

Target biaya berjalan selama pengembangan: **Rp0** infrastruktur. Item berbayar
pertama yang direncanakan adalah **domain tahunan** (rigelstore.id).

---

## 1. Peta infrastruktur free-first

| Kebutuhan | Mulai dengan | Upgrade saat |
|-----------|--------------|--------------|
| Hosting | Free tier (Vercel/Cloudflare-style) | Batas runtime/traffic/background-job tercapai. |
| Database | Supabase/Neon free tier | Batas compute/storage/koneksi tercapai. |
| Storage | R2/Supabase free allowance | Storage/egress jadi material. |
| Email | Free allowance provider (mis. Resend) | Volume melebihi allowance. |
| Telegram | Telegram Bot API (gratis) | Infrastruktur/runtime jadi pembatas. |
| AI | Kredit/free allowance | Volume generasi butuh usage berbayar. |
| Monitoring | Tier logging/error gratis | Retensi/volume tumbuh. |
| Social | API resmi | Izin/limit butuh perubahan. |

> **Free-tier & kuota berubah.** Verifikasi limit terkini sebelum produksi.

---

## 2. Jangan lakukan
Jangan beli VPS, database khusus, cluster Redis, atau infrastruktur lain hanya
karena bisa. Upgrade **hanya setelah bottleneck terukur**.

---

## 3. Biaya yang memang akan muncul
- **Domain tahunan** (item berbayar pertama).
- **Fee QRIS** per transaksi nyata (0,7% per transaksi, diatur Bank Indonesia —
  sama di semua gateway).
- **Usage AI** saat volume tumbuh.

---

## 4. Catatan penting QRIS/Sandbox
- Verifikasi merchant QRIS (mis. Midtrans, butuh KTP) bisa makan beberapa hari —
  **daftar lebih awal** walau kode belum jadi.
- Gunakan **Sandbox** untuk semua tes. **Hati-hati:** referensi QRIS sandbox
  Midtrans kadang menunjuk ke Merchant ID produksi — **jangan bayar pakai uang
  asli saat tes**.

---

## 5. Checklist production readiness (dari rencana §25)

- [ ] Domain tersambung, HTTPS aktif.
- [ ] Database & storage produksi terpasang.
- [ ] Semua secret aman di environment variables.
- [ ] Merchant pembayaran disetujui.
- [ ] QRIS diuji live dengan **1 transaksi kecil asli**.
- [ ] Webhook terverifikasi & idempotent.
- [ ] Bot Telegram produksi terkonfigurasi.
- [ ] Super Admin dilindungi 2FA.
- [ ] Backup & restore sudah diuji.
- [ ] Tes konkurensi barang unik lulus (tidak double-sell).
- [ ] Pemulihan order guest teruji.
- [ ] Pengiriman digital diuji dari perangkat luar.
- [ ] Kebijakan: privasi, syarat, refund, aturan produk digital.
- [ ] Izin API sosial terverifikasi.
- [ ] Gate approval produk AI teruji.
- [ ] Tombol stop darurat sosmed teruji.
- [ ] Monitoring/error reporting aktif.

---

## 6. Urutan go-live
Selesaikan Fase 0–8 di infrastruktur gratis + tes simulasi → beli domain →
aktifkan QRIS produksi (tes 1 transaksi kecil asli) → baru Fase 9–11 (AI &
sosmed).

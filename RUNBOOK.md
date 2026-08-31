# RUNBOOK — Operasional & Keamanan RigelStore

Panduan operasional untuk pemilik/operator. Fokus: backup, restore (yang
**diuji**), rotasi rahasia, dan checklist go-live. Bersumber dari SECURITY.md,
DEPLOYMENT.md, dan rencana v1.0 (Bagian H).

---

## 1. Backup database

**Supabase (Postgres):**
- **Berbayar (Pro):** aktifkan **Daily backups** + **Point-in-Time Recovery**
  di Dashboard → Database → Backups. Ini otomatis.
- **Free tier:** backup otomatis terbatas — lakukan **backup logis manual**
  berkala dengan `pg_dump` (jadwalkan mingguan minimal):

```bash
# Ambil connection string dari Supabase → Project Settings → Database (URI).
pg_dump "postgresql://postgres:[PASSWORD]@db.<ref>.supabase.co:5432/postgres" \
  --no-owner --no-privileges -F c -f rigelstore_$(date +%F).dump
```

Simpan file dump di tempat aman **di luar** Supabase (mis. cloud storage
pribadi). Jangan taruh di repo.

**Storage (file produk & cover):** unduh berkala isi bucket `product-files`
(privat) dan `product-covers` (publik) — mis. via `supabase storage` CLI atau
skrip S3-compatible. Cover bisa dibuat ulang; **file produk & kredensial tidak**,
jadi prioritaskan `product-files`.

---

## 2. Tes RESTORE (WAJIB — backup tanpa tes restore = tidak berguna)

Lakukan minimal **sekali sebelum go-live** dan tiap kuartal:

1. Buat **project/branch Supabase baru** (atau Postgres lokal) sebagai target uji.
2. Restore dump:
   ```bash
   pg_restore --no-owner --no-privileges -d "postgresql://.../postgres" rigelstore_YYYY-MM-DD.dump
   ```
3. **Verifikasi:**
   - Jumlah baris tabel inti masuk akal: `products`, `orders`, `inventory_items`,
     `entitlements`, `admin_users`.
   - Coba **login** satu akun.
   - Jalankan **satu alur beli** di target uji (mode mock) sampai barang
     terkirim.
4. Setelah lulus, **hapus** target uji. Catat tanggal tes restore.

> Kunci enkripsi kredensial (`CREDENTIAL_ENCRYPTION_KEY`) **tidak** ada di
> database. Untuk memulihkan kredensial terenkripsi, kunci yang sama harus
> tersedia di environment target. **Simpan kunci ini terpisah & aman.**

---

## 3. Rotasi rahasia

- **Jangan** rotasi `CREDENTIAL_ENCRYPTION_KEY` selama masih ada kredensial
  terenkripsi dengan kunci lama (data jadi tak terbaca). Bila harus, re-enkripsi
  semua dulu dengan proses migrasi terkontrol.
- `SUPABASE_SERVICE_ROLE_KEY`, `MIDTRANS_SERVER_KEY`, `TELEGRAM_BOT_TOKEN`,
  `CRON_SECRET`, `TELEGRAM_WEBHOOK_SECRET` boleh dirotasi kapan saja — perbarui
  di Vercel lalu redeploy (dan daftar ulang webhook Telegram bila perlu).

---

## 4. Keamanan yang sudah aktif (Fase 8)

- **Rate limiting** (DB): beli (10/menit/IP), login (8/5 menit/IP), tiket
  (5/10 menit/user).
- **Audit log**: login admin, buat/ubah produk & status, upload cover, tambah/
  cabut inventory, undangan admin, buat kupon, dsb. Dibaca di DB (`audit_logs`).
- **2FA (TOTP)** tersedia di `/account/security` — **wajib untuk Super Admin**.
- **Session revoke**: "Keluar dari semua perangkat" di `/account/security`.
- **Secrets** hanya di environment; RLS default-deny di semua tabel.
- **Webhook pembayaran** terverifikasi (signature) & idempotent.

**Setelan dashboard yang disarankan diaktifkan sendiri:**
- Supabase Auth → **Leaked password protection** (cek HaveIBeenPwned).
- Supabase Auth → minimum password length (naikkan dari default bila perlu).

---

## 5. Checklist GO-LIVE (Bagian H rencana)

- [ ] Domain tersambung, HTTPS aktif.
- [ ] Database & storage produksi terpasang; semua secret di environment.
- [ ] Merchant QRIS (Midtrans) disetujui; **1 transaksi kecil ASLI** berhasil.
- [ ] Webhook pembayaran terverifikasi & idempotent (URL terdaftar di gateway).
- [ ] Bot Telegram produksi jalan (webhook terdaftar).
- [ ] **Super Admin dilindungi 2FA.**
- [ ] Backup otomatis **dan** restore sudah diuji (bagian 2 di atas).
- [ ] Tes rebutan barang unik lulus (tidak double-sell).
- [ ] Pemulihan order guest berfungsi.
- [ ] Kirim barang digital diuji dari perangkat luar.
- [ ] Halaman kebijakan: privasi, syarat, refund, aturan produk digital.
- [ ] Ganti password admin default ke password kuat.
- [ ] Monitoring/error reporting aktif.

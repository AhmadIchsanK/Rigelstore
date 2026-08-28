# SECURITY.md — RigelStore

Aturan keamanan. Bersumber dari rencana v1.0 (§10, §11, §24). Setiap aturan di
sini yang menyangkut aturan bisnis penting **wajib punya automated test**.

---

## 1. RBAC ditegakkan di server

- Gunakan RBAC dengan peran: Super Admin, Admin, Content Admin, Support Admin,
  Customer, Guest (izin ada di `PROJECT_SPEC.md`).
- **Tegakkan izin di backend, bukan sekadar menyembunyikan tombol di UI.**
  Contoh: customer yang memaksa membuka URL `/admin` harus tetap ditolak oleh
  server.
- Super Admin dapat menambah, menonaktifkan, mengubah, dan menghapus admin.

## 2. Undangan admin yang kedaluwarsa (bukan password bersama)

- Admin baru diundang lewat **invitation link yang kedaluwarsa**, bukan berbagi
  password.
- Password kuat diwajibkan.

## 3. 2FA untuk Super Admin

- **2FA sangat disarankan / diwajibkan untuk Super Admin.** Diuji sebelum
  go-live (lihat `TEST_PLAN.md`).

## 4. Audit log

- Catat aktivitas sensitif: login, ubah harga, ubah/terbit produk, ubah
  inventory, refund, perubahan admin, perubahan pengaturan, dan **approval AI**.
- Log akses admin ke data sensitif (mis. melihat kredensial).

## 5. Manajemen sesi

- Kemampuan **revoke sesi / logout-all**.

## 6. Rate limiting

- Terapkan rate limiting (login, endpoint sensitif, webhook, API).

## 7. Secret hanya di environment

- **Tidak ada** API key, token, atau password database di dalam kode.
- Semua secret di **environment variables / secret storage** (Vercel, Supabase).
- `.env.example` hanya memuat **nama** variabel; nilai nyata tidak pernah
  di-commit. `.env*` di-ignore oleh git.

## 8. Backup + tes restore

- Backup otomatis **dan** restore yang **pernah diuji**. Backup tanpa restore
  yang teruji = tidak berguna.

## 9. Webhook pembayaran: terverifikasi & idempotent

Dua hal wajib pada webhook gateway:

1. **Verifikasi signature/status** — pastikan notifikasi benar dari gateway,
   bukan orang iseng yang pura-pura sudah bayar. **JANGAN PERNAH** percaya
   tombol "saya sudah bayar" dari sisi pembeli.
2. **Idempotent** — simpan ID event di `webhook_events`; jika event yang sama
   datang lagi, **abaikan**. Notifikasi ganda tidak boleh mengirim barang dua
   kali.

## 10. Pengiriman & data sensitif

- **Jangan pernah** mengekspos path asli storage. Gunakan **signed URL berumur
  pendek** atau streaming terotorisasi.
- Kredensial dikirim hanya setelah **entitlement** ada.
- Kredensial sensitif **dienkripsi saat disimpan** (kunci `CREDENTIAL_ENCRYPTION_KEY`
  dari env).
- Opsi batas jumlah/expiry download.

---

## 11. Peta risiko → mitigasi (dari rencana)

| Risiko | Mitigasi |
|--------|----------|
| Pembayaran palsu | Verifikasi webhook/signature + idempotency. |
| Double-selling | Reservasi atomik / locking. |
| File bocor | Signed URL kadaluwarsa + cek entitlement. |
| Kredensial terekspos | Enkripsi + akses terbatas + audit. |
| Produk AI buruk | Gate approval manusia wajib. |
| Post otomatis buruk | Aturan, blocklist, tombol pause, riwayat. |
| Perubahan free-tier | Abstraksi provider + catatan migrasi. |
| Regresi Claude | Tes + fase kecil + dokumentasi. |
| Pelanggaran ToS akun | Hanya jual akun/kredensial yang izin transfer/resell-nya diperbolehkan. |

---

## 12. Kebijakan wajib sebelum go-live
Privasi, syarat/ketentuan, refund, dan aturan produk digital.

# CHANGELOG — RigelStore

Semua perubahan penting dicatat di sini. Tiap akhir fase menambah satu entri.
Format tanggal: YYYY-MM-DD.

---

## Fase 0 — Inisialisasi repo & dokumentasi — 2026-08-28

Fondasi proyek dan dokumen spesifikasi. **Belum ada fitur** (login, produk,
pembayaran, UI, dsb.) — sesuai rencana, itu dibangun di fase berikutnya.

### Ditambahkan
- Proyek **Next.js + TypeScript (App Router)** dengan halaman placeholder yang
  menandai status Fase 0.
- Kerangka **modular monolith** di `src/modules/`: `core`, `database`, `web`,
  `bot`, `payments`, `storage`, `ai`, `social` — masing-masing berisi README
  tanggung jawab (belum ada logika).
- `.gitignore` yang benar dan `.env.example` (hanya **nama** variabel, tanpa
  nilai rahasia).
- Dokumen spesifikasi (Bahasa Indonesia):
  - `PROJECT_SPEC.md` — ringkasan produk, tujuan/non-goals, peran & izin, tipe
    produk.
  - `ARCHITECTURE.md` — keputusan modular monolith, stack, cara web + Telegram
    memakai satu core.
  - `DATABASE.md` — cetak biru tabel + status inventory
    `AVAILABLE→RESERVED→SOLD→DELIVERED→COMPLETED` (+ `EXPIRED`/`REVOKED`/`REFUNDED`).
  - `SECURITY.md` — RBAC server-side, undangan admin kedaluwarsa, 2FA Super
    Admin, audit log, rate limiting, secret di env, backup+restore, webhook
    terverifikasi & idempotent.
  - `AI_RULES.md` — tabel governance AI (approval manusia untuk publish; AI tidak
    menyentuh uang/inventory/harga/pengaturan pembayaran).
  - `SOCIAL_RULES.md` — aturan auto-posting + pause global/per-platform + riwayat.
  - `DEPLOYMENT.md` — strategi free-first + checklist production readiness.
  - `TEST_PLAN.md` — daftar tes inti termasuk konkurensi barang unik &
    idempotency webhook.
- `README.md` utama berisi ikhtisar + **aturan kerja proyek**.

### Catatan
- Belum ada koneksi database, auth, pembayaran, atau storage — semua itu Fase 1+.
- Semua secret akan lewat environment variables; tidak ada yang di-hardcode.

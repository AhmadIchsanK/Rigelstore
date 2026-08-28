# RigelStore

Toko produk digital: **website + bot Telegram**, pembayaran **QRIS otomatis**,
dengan lapisan **AI** di tahap akhir. Dibangun sebagai **modular monolith**
(Next.js + TypeScript) — satu core commerce yang dipakai bersama oleh website
dan Telegram.

> **Status saat ini: Fase 0 — Fondasi & Dokumentasi.**
> Belum ada fitur toko (login, produk, checkout, pembayaran, UI). Fase 0 hanya
> menyiapkan struktur repo + dokumen spesifikasi.

---

## Dokumentasi (baca ini dulu)

| Berkas | Isi |
|--------|-----|
| [`PROJECT_SPEC.md`](./PROJECT_SPEC.md) | Ringkasan produk, tujuan/non-goals, peran pengguna, tipe produk. |
| [`ARCHITECTURE.md`](./ARCHITECTURE.md) | Keputusan modular monolith, stack, cara web + Telegram memakai satu core. |
| [`DATABASE.md`](./DATABASE.md) | Cetak biru tabel + status inventory barang unik. |
| [`SECURITY.md`](./SECURITY.md) | RBAC, 2FA, audit log, secret di env, webhook aman & idempotent. |
| [`AI_RULES.md`](./AI_RULES.md) | Governance AI: approval manusia, batas kuasa AI. |
| [`SOCIAL_RULES.md`](./SOCIAL_RULES.md) | Aturan auto-posting + tombol pause. |
| [`DEPLOYMENT.md`](./DEPLOYMENT.md) | Strategi free-first + checklist go-live. |
| [`TEST_PLAN.md`](./TEST_PLAN.md) | Daftar tes penting per fase. |
| [`CHANGELOG.md`](./CHANGELOG.md) | Riwayat perubahan per fase. |

Kerangka modul ada di [`src/modules/`](./src/modules/README.md).

---

## Menjalankan secara lokal (Fase 0)

```bash
npm install
npm run dev        # buka http://localhost:3000
```

Perintah lain: `npm run build`, `npm run start`, `npm run lint`,
`npm run typecheck`.

Untuk environment variables, salin `.env.example` → `.env.local` lalu isi
nilainya di sana (tidak semua dibutuhkan di Fase 0). **Jangan** commit
`.env.local`.

---

## Aturan kerja proyek (dipegang di SELURUH proyek)

1. **Kerja per fase kecil.** Tiap fase diakhiri dengan **tes** + update
   `CHANGELOG.md`, lalu `git commit` sebagai titik aman.
2. **Jangan mengubah/refactor modul lain** yang tidak berhubungan dengan tugas
   fase yang sedang dikerjakan.
3. **Untuk perubahan besar, jelaskan rencana lebih dulu dan tunggu persetujuan
   pemilik** sebelum menulis kode.
4. **Setiap aturan bisnis penting harus punya automated test** (reservasi barang
   unik, idempotency webhook, batas akses admin, dsb.).
5. **Uang, kepemilikan barang unik, dan akses selalu dikontrol kode
   deterministik — bukan AI.** AI hanya mengusulkan; manusia + kode yang
   memutuskan.
6. **Tidak ada secret di dalam kode.** Semua rahasia lewat environment variables.
7. **Zona bahaya (uang & barang unik):** kerjakan lebih hati-hati, tes lebih
   ketat, jangan buru-buru.
8. **Kalau ada yang aneh, berhenti dan tanya** — jangan menumpuk perbaikan
   berlapis.

---

## Roadmap fase (ringkas)

| Fase | Deliverable |
|------|-------------|
| **0** | **Repo, spec, arsitektur, jalan lokal. ← sekarang** |
| 1 | Auth + RBAC + fondasi admin. |
| 2 | Produk + file + inventory unik. |
| 3 | Cart + order + QRIS + webhook ⚠️ (zona bahaya). |
| 4 | Delivery aman + akun + pemulihan order guest. |
| 5 | UI mobile-first + SEO + polish. |
| 6 | Telegram storefront. |
| 7 | Analitik + promo + support. |
| 8 | Security + tes + backup + hardening ⚠️. |
| 9 | AI product draft + approval. |
| 10 | Otomasi sosmed (FB/IG/Threads). |
| 11 | Growth lanjutan (affiliate, rekomendasi, dsb.). |

Urutan: selesaikan Fase 0–8 (toko jualan dengan aman) **baru** Fase 9–11 (AI &
sosmed).

# RigelStore

Toko produk digital: **website + bot Telegram**, pembayaran **QRIS otomatis**,
dengan lapisan **AI** di tahap akhir. Dibangun sebagai **modular monolith**
(Next.js + TypeScript) — satu core commerce yang dipakai bersama oleh website
dan Telegram.

> **Status saat ini: Fase 3 — Keranjang + Order + QRIS + Webhook.**
> Sudah ada: Fase 1–2, lalu checkout + pembayaran QRIS. Status lunas hanya dari
> webhook gateway yang terverifikasi & idempotent (tidak pernah percaya tombol
> "sudah bayar"). Pengiriman aman + akun pelanggan menyusul di Fase 4.

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
`npm run typecheck`, `npm test` (automated test).

Untuk environment variables, salin `.env.example` → `.env.local` lalu isi
nilainya di sana. **Jangan** commit `.env.local`. Untuk Fase 1 yang wajib:
`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, dan
`SUPABASE_SERVICE_ROLE_KEY` (rahasia — dari Supabase → Project Settings → API).

### Membuat Super Admin pertama (sekali saja)

1. Jalankan app, buka `/login`, lalu **Daftar** dengan email kamu.
2. Pastikan `SUPABASE_SERVICE_ROLE_KEY` terisi di environment.
3. Jalankan: `node scripts/bootstrap-admin.mjs email-kamu@contoh.com super_admin`
4. Login, buka `/admin`. Admin berikutnya cukup diundang dari halaman admin.

### Uji batas akses (cara tes Fase 1)

- `npm test` menjalankan tes otomatis batas akses & izin peran.
- Manual: buat 1 akun admin (langkah di atas) + 1 akun customer (Daftar biasa).
  Login sebagai customer, paksa buka `/admin` → harus **ditolak (403)**.

### Menguji alur pembayaran (Fase 3, pakai mock)

Tanpa Midtrans pun bisa dites lokal (env dev memakai `PAYMENT_PROVIDER=mock`):

1. Buat produk **published** di `/admin/products` (mis. tipe kredensial unik +
   tambah stok, atau tipe file reusable).
2. Buka `/catalog` → pilih produk → **Beli sekarang** (isi email bila tamu).
3. Di halaman checkout, klik **🧪 Simulasi bayar (dev)** → status jadi **lunas**,
   stok unik jadi `SOLD`, entitlement dibuat.
4. Untuk Midtrans **Sandbox** sungguhan: isi `MIDTRANS_SERVER_KEY` &
   `MIDTRANS_CLIENT_KEY`, set `PAYMENT_PROVIDER=midtrans`, dan daftarkan URL
   webhook `<domain>/api/webhooks/midtrans` di dashboard Midtrans.

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
| 0 | Repo, spec, arsitektur, jalan lokal. ✅ |
| 1 | Auth + RBAC + fondasi admin. ✅ |
| 2 | Produk + file + inventory unik. ✅ |
| **3** | **Cart + order + QRIS + webhook ⚠️ (zona bahaya). ← sekarang** |
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

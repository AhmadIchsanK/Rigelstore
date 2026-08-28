# ARCHITECTURE.md — RigelStore

Keputusan arsitektur dan stack. Bersumber dari rencana v1.0.

---

## 1. Keputusan utama: Modular Monolith

RigelStore dibangun sebagai **satu Core Commerce System** — bukan microservices,
bukan server terpisah. Website, Telegram, AI, dan integrasi sosial hanyalah
**client/worker di sekitar core yang sama**.

Alasan: untuk pengembangan bertahap oleh pemilik non-teknis (vibe coding dengan
Claude), modular monolith **jauh lebih murah dan mudah** daripada microservices.
Jangan beli VPS, database khusus, cluster Redis, dsb. hanya karena bisa —
upgrade hanya setelah ada bottleneck yang terukur.

```
                 ┌─────────────────────────────────────────┐
   Website  ───► │                                         │
  (src/app,      │            CORE COMMERCE                │
   modules/web)  │   order · inventory · payment ·         │
                 │   entitlement · delivery (deterministik)│
  Telegram  ───► │                                         │ ◄─── satu database
  (modules/bot)  │                                         │      (PostgreSQL)
                 └───┬───────┬───────┬───────┬─────────────┘
                     │       │       │       │
                payments  storage  ai     social
                (QRIS)    (R2/     (draft) (FB/IG/
                          Supabase)        Threads)
```

Prinsip yang tidak boleh dilanggar:
- **Website dan Telegram memakai core yang sama.** Dilarang membuat sistem
  commerce kedua.
- **AI terpisah dari keputusan finansial & kepemilikan.** AI membuat &
  mengoptimalkan; kode deterministik mengontrol pembayaran, inventory, akses,
  izin.
- **Gateway pembayaran & storage di balik interface adapter** agar bisa diganti.

---

## 2. Stack yang dipakai

| Kebutuhan | Pilihan | Catatan |
|-----------|---------|---------|
| Framework | **Next.js + TypeScript (App Router)** | Satu basis kode untuk UI + API route. |
| Bahasa | **TypeScript** | Strict mode. |
| Database | **PostgreSQL** via **Supabase** (free tier) | Satu database untuk web + Telegram. |
| Auth | **Auth.js** atau autentikasi terkelola (mis. Supabase Auth) | RBAC ditegakkan di server. |
| Storage | **Cloudflare R2** atau **Supabase Storage** | Signed URL berumur pendek. |
| Telegram | **Telegram Bot API** | Token dari @BotFather. |
| Pembayaran | **Gateway QRIS** (mulai Midtrans, mode Sandbox saat tes) | Di balik adapter. |
| Email | **Provider email** (mis. Resend, free tier) | Invoice + link download. |
| Cron/Jobs | **Cron / background jobs** | Pelepasan reservasi kadaluwarsa, jadwal sosmed, job AI. |
| AI | **AI API** | Draft produk & post — usulan, bukan keputusan. |
| Monitoring | **Logging/error tier gratis** | Diaktifkan menjelang produksi. |

Free-tier bisa berubah — verifikasi kuota sebelum produksi (lihat
`DEPLOYMENT.md`).

---

## 3. Struktur modul (kerangka Fase 0)

```
src/
  app/                 # Rute Next.js (App Router) — entry website & API route
  modules/
    core/              # Aturan bisnis deterministik (order/inventory/payment/…)
    database/          # Skema, migrasi, repository
    web/               # Komponen & controller website
    bot/               # Bot worker Telegram
    payments/          # Adapter gateway QRIS + webhook
    storage/           # Adapter penyimpanan file + signed URL
    ai/                # Pipeline draft produk & post
    social/            # Adapter FB/IG/Threads
```

Aturan ketergantungan:
- `web/`, `bot/` → memanggil `core/`.
- `core/` → memanggil `database/`, dan lewat interface: `payments/`, `storage/`.
- `ai/`, `social/` → **tidak boleh** menyentuh jalur uang/inventory/harga milik
  `core/`.
- Modul lain **tidak** mengakses database langsung; selalu lewat `database/`.

---

## 4. Bagaimana Website + Telegram memakai satu core

1. Aksi pengguna (dari web **atau** Telegram) memanggil fungsi `core/` yang sama
   (mis. "buat order", "reserve item", "cek status pembayaran").
2. `core/` menulis ke **satu database**. Maka order dari Telegram otomatis muncul
   di admin website.
3. Pembayaran QRIS diproses lewat `payments/`; webhook memicu `core/` untuk
   menandai LUNAS → `SOLD` → entitlement → delivery.
4. Delivery aman lewat `storage/` (signed URL) untuk kedua kanal.

---

## 5. Aliran pembayaran QRIS (ringkas)

```
Pembeli → Cart → Checkout → Order dibuat → Reserve item (atomik) →
Buat QRIS (payments/) → Tampilkan QR + hitung mundur →
Pembeli bayar → Gateway kirim webhook → Verifikasi signature →
Tandai LUNAS (idempotent) → Item SOLD → Buat entitlement →
Deliver (storage/) → Notifikasi
```

Detail keamanan webhook ada di `SECURITY.md`.

---

## 6. Dokumentasi repo (peta yang dibaca Claude tiap fase)

`PROJECT_SPEC.md`, `ARCHITECTURE.md`, `DATABASE.md`, `SECURITY.md`,
`AI_RULES.md`, `SOCIAL_RULES.md`, `DEPLOYMENT.md`, `TEST_PLAN.md`,
`CHANGELOG.md`.

Sebelum mengubah arsitektur, baca dulu file-file ini. Setiap keputusan penting
diperbarui di sini.

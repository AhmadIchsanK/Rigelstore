# PROJECT_SPEC.md — RigelStore

Dokumen ini merangkum **apa** yang dibangun dan **untuk siapa**. Sumbernya adalah
"RigelStore — Full Technical & Business Plan v1.0". Jika ada keputusan penting
yang berubah di fase berikutnya, perbarui dokumen ini agar tetap sinkron.

---

## 1. Ringkasan Produk

RigelStore adalah **satu core commerce digital** yang diakses lewat dua muka:

- **Website** responsif (mobile-first).
- **Bot Telegram**.

Keduanya **wajib memakai backend, database, order engine, payment engine,
inventory engine, dan delivery engine yang sama**. Tidak boleh ada sistem
terpisah.

Pembayaran memakai **QRIS otomatis** — status lunas hanya datang dari webhook
gateway yang terverifikasi, bukan dari tombol "saya sudah bayar".

Di tahap akhir ada lapisan **AI**: AI mengusulkan produk & post sosmed, tetapi
**publikasi produk butuh persetujuan manusia**, dan AI tidak pernah menyentuh
uang, kepemilikan barang, atau harga.

**Aturan inti:** AI boleh membuat, menyarankan, dan mengoptimalkan; tetapi
**kode deterministik yang mengontrol pembayaran, kepemilikan inventory, akses,
dan izin.**

---

## 2. Tujuan & Non-Goals

### Tujuan
- Biaya berjalan mendekati nol selama pengembangan (free-first).
- Target awal 100–1.000 order/bulan, dengan ruang untuk tumbuh.
- Guest checkout **dan** akun pelanggan.
- Sistem commerce yang sama di website dan Telegram.
- QRIS-only di awal, dengan konfirmasi webhook otomatis.
- Mendukung file reusable, kredensial unik, dan PDF terproteksi.
- Kerja teknis pemilik seminimal mungkin.
- Siap untuk otomasi produk & sosmed berbasis AI.

### Non-Goals (untuk MVP)
- Aplikasi mobile native.
- Banyak metode pembayaran (cukup QRIS dulu).
- Microservices atau server khusus (pakai modular monolith).
- AI menerbitkan produk baru tanpa persetujuan.
- Infrastruktur mahal sebelum ada permintaan nyata.

---

## 3. Peran Pengguna & Izin

Gunakan RBAC dan **tegakkan izin di sisi server**, bukan sekadar menyembunyikan
tombol.

| Peran | Tujuan | Izin utama |
|-------|--------|-----------|
| **Super Admin** | Pemilik | Semuanya: admin, keamanan, integrasi, peran, pengaturan, audit log. |
| **Admin** | Operator toko | Produk, inventory, order, katalog, kupon, support, analitik. |
| **Content Admin** | (Opsional) | Draft produk/konten; **tanpa** kontrol pembayaran atau izin. |
| **Support Admin** | (Opsional) | Order/pelanggan, kirim ulang delivery/support; **tanpa** konfigurasi finansial. |
| **Customer** | Pembeli terdaftar | Jelajah, checkout, akun, download, order, ulasan. |
| **Guest** | Pembeli tak terdaftar | Jelajah, beli, akses order; fitur akun terbatas. |

Detail penegakan ada di `SECURITY.md`.

---

## 4. Tipe Produk & Inventory

| Tipe | Contoh | Inventory | Pengiriman |
|------|--------|-----------|-----------|
| **Reusable File** | PDF mewarnai anak | Tak terbatas | Secure download |
| **Unique Credential** | Akun + password yang izin transfernya diperbolehkan | 1 item / pembeli | Private delivery |
| **Protected PDF** | Buku cetak | Password unik per pembelian | PDF + password |
| **Bundle** | Koleksi | Turunan | Beberapa entitlement sekaligus |

**Barang unik** memakai alur status (lihat `DATABASE.md` untuk detail):

```
AVAILABLE → RESERVED → SOLD → DELIVERED → COMPLETED
```
Pengecualian: `EXPIRED`, `REVOKED`, `REFUNDED`.

Saat checkout, backend **mengunci (reserve) 1 item AVAILABLE secara atomik**
(mis. 15 menit). Pembayaran sukses → `SOLD`; timeout → kembali `AVAILABLE`.
Database locking/transaction mencegah double-selling.

**Catatan jujur soal PDF terproteksi:** password PDF **bukan DRM**. Password
mencegah orang awam membuka, tetapi tidak mencegah orang teknis melepas
proteksi. **Jangan janji "tidak bisa dibajak".** Yang realistis: tiap pembelian
dapat password unik yang mudah diingat + link download berumur pendek.

---

## 5. Antarmuka (ringkas)

- **Website:** homepage, katalog (search/filter/sort), halaman produk, cart &
  checkout QRIS, pencarian order guest, dashboard pelanggan, download/invoice/
  ulasan/wishlist, help center.
- **Telegram:** home, produk, cart, checkout, pembayaran (QR + hitung mundur),
  riwayat order, delivery aman, tautan akun, support — **backend yang sama**.
- **Admin panel:** dashboard, produk, inventory (bulk upload, revoke/replace),
  order (resend delivery, refund notes), katalog, pelanggan/ulasan/support,
  kupon/bundle, analitik, pengaturan AI/sosmed, pengaturan sistem.

---

## 6. Batasan Etika & Legal (keputusan bisnis, bukan teknis)

- **Jual akun = area abu-abu.** Banyak platform melarang jual/transfer akun.
  **Hanya jual akun/kredensial yang izin transfer/resell-nya diperbolehkan.**
- Kebijakan wajib sebelum go-live: privasi, syarat, refund, aturan produk
  digital.

---

## Referensi silang
- Arsitektur & stack → `ARCHITECTURE.md`
- Tabel database → `DATABASE.md`
- Keamanan & RBAC → `SECURITY.md`
- Governance AI → `AI_RULES.md`
- Aturan sosmed → `SOCIAL_RULES.md`
- Deploy → `DEPLOYMENT.md`
- Rencana tes → `TEST_PLAN.md`

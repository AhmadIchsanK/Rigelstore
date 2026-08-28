# SOCIAL_RULES.md — RigelStore

Aturan otomasi sosial media. Bersumber dari rencana v1.0 (§15). Platform:
**Facebook, Instagram, Threads**. Dibangun di **Fase 10** (paling akhir).

---

## 1. Aturan yang diatur admin

Admin mengontrol:

- **Jendela jam posting** — kapan boleh posting (mis. 09:00–21:00).
- **Frekuensi** — berapa post per hari/platform.
- **Hashtag** — set hashtag yang dipakai.
- **Tone** — gaya bahasa post.
- **Topik boleh / dilarang** — allowed/blocked topics.
- **CTA** — call to action.
- **Prioritas produk & kampanye**.

---

## 2. Alur posting

```
Pilih produk/kampanye → generate post (via modul ai) → cek aturan →
jadwalkan → publish via API RESMI platform → catat post ID/status →
kumpulkan analitik yang tersedia → ringkas performa
```

- **Wajib pakai API resmi platform** (Meta API). **Bukan** otomasi browser.
- Posting otomatis **hanya boleh setelah aturan dikonfigurasi**.

---

## 3. Kontrol wajib (tidak bisa ditawar)

- **Pause global** — satu tombol menghentikan semua posting di semua platform.
- **Pause per-platform** — hentikan hanya platform tertentu.
- **Riwayat posting** — semua post tercatat (isi, waktu, platform, status,
  post ID).

Tombol **stop darurat** wajib benar-benar menghentikan semua — diuji sebelum
produksi.

---

## 4. Cek aturan sebelum publish
- Topik tidak masuk daftar terlarang.
- Sesuai jendela jam & batas frekuensi.
- Hashtag/tone/CTA sesuai konfigurasi.
- Aset & link valid.

---

## 5. Yang harus diuji (lihat `TEST_PLAN.md`)
- Uji dulu ke **akun percobaan**, bukan akun utama.
- Pastikan **pause darurat** benar-benar menghentikan semua posting.
- Pastikan riwayat posting terekam dengan benar.

---

## 6. Batas AI
Post dibuat AI, tetapi mengikuti aturan deterministik di atas. AI tidak
menyentuh uang/inventory/harga (lihat `AI_RULES.md`).

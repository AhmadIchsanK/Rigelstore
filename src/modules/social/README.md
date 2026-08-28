# Modul `social` — Social Adapters

Publikasi otomatis ke Facebook, Instagram, dan Threads lewat **API resmi**
platform (bukan otomasi browser).

**Status Fase 0:** kerangka kosong. Dibangun paling akhir.

## Isi yang direncanakan (dibangun Fase 10)

- Adapter per platform (Facebook / Instagram / Threads) via Meta API.
- Alur: pilih produk → generate post (via `ai/`) → cek aturan → jadwalkan →
  publish via API resmi → catat post ID/status.
- Tabel `social_posts`, `schedules`.

## Prinsip (lihat `SOCIAL_RULES.md`)

- Wajib ada **pause global**, **pause per-platform**, dan **riwayat posting**.
- Hormati jendela jam, frekuensi, hashtag, tone, topik boleh/dilarang, CTA yang
  diatur admin.
- Posting otomatis hanya setelah aturan dikonfigurasi; uji dulu ke akun
  percobaan.

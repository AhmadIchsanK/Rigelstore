# Modul `ai` — AI Jobs

Pipeline AI untuk **mengusulkan** produk dan post sosmed. AI hanya membuat/
menyarankan; keputusan tetap di tangan manusia dan kode deterministik.

**Status Fase 0:** kerangka kosong. Ini **fase terakhir** — dibangun setelah
toko benar-benar jualan dengan aman.

## Isi yang direncanakan (dibangun Fase 9/10)

- Pipeline produk: Brief → Ide → Draft → Aset → Cek otomatis → status `DRAFT`.
- Cek otomatis: field kosong, judul duplikat, kemiripan berlebihan, file rusak,
  batas harga, aturan bisnis.
- Tabel `ai_jobs`, `ai_drafts`, `ai_approvals`.

## Prinsip (lihat `AI_RULES.md`)

- Publikasi produk **WAJIB** lewat tombol approval admin.
- AI **TIDAK PERNAH** menyentuh: konfirmasi pembayaran, kepemilikan inventory,
  harga, pengaturan pembayaran.

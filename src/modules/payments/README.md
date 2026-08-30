# Modul `payments` — Payments Adapter (QRIS)

Lapisan pembayaran di balik sebuah **interface adapter** agar gateway QRIS bisa
diganti tanpa mengubah `core/`. Mulai dari Midtrans (mode Sandbox saat tes).

**Status:** Fase 3 aktif. Berisi `provider.ts` (interface), `midtrans.ts`
(adapter QRIS + verifikasi signature sha512), `mock.ts` (untuk dev/tes), dan
`index.ts` (pemilih adapter via env). Webhook diproses lewat
`core/orders/service.ts` → fungsi SQL `confirm_order_paid` (idempoten).

## Isi yang direncanakan (dibangun Fase 3 — ZONA BAHAYA, reasoning tinggi)

- Interface `PaymentProvider` (buat QRIS dinamis, cek status, parse webhook).
- Implementasi Midtrans (Sandbox → produksi).
- Handler webhook: **verifikasi signature** + **idempotent** (simpan
  `webhook_events`, event yang sama tidak diproses dua kali).

## Prinsip

- **JANGAN PERNAH** percaya tombol "saya sudah bayar". Status LUNAS hanya dari
  webhook gateway yang terverifikasi.
- Semua kunci gateway **hanya** dari environment variables.
- Modul `ai/` tidak boleh menyentuh konfirmasi pembayaran atau pengaturan
  pembayaran.

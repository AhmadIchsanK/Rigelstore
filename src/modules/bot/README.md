# Modul `bot` — Bot Worker (Telegram Storefront)

Storefront versi Telegram. **WAJIB memakai `core/` yang sama** dengan website —
dilarang membuat sistem commerce terpisah.

**Status:** Fase 6 aktif. Storefront Telegram memakai **core yang sama** dengan
website (produk, order, delivery) — bukan sistem terpisah.

- `api.ts` — klien Telegram Bot API (sendMessage/sendPhoto/callback/setWebhook).
- `identity.ts` — email guest sintetik deterministik dari `telegram_id`
  (pembeli Telegram = guest; tak bisa dipalsukan dari klien).
- `handler.ts` — /start, katalog, produk, beli (QRIS), cek status, ambil barang.
- Rute: `src/app/api/telegram/webhook` (verifikasi secret) & `.../setup`
  (daftarkan webhook).

Order dari Telegram muncul juga di admin website (satu database).

## Isi yang direncanakan (dibangun Fase 6)

- Bot Telegram (token dari @BotFather, disimpan di env).
- Katalog, cart, checkout QRIS, status pembayaran, riwayat order, pengiriman
  aman, penautan identitas Telegram ke akun.
- Deep link untuk kampanye/produk.

## Prinsip

- Order dari Telegram muncul di admin website karena **satu database yang sama**.
- **Jangan** minta pembeli menempel kredensial sensitif di chat.
- Pengiriman kredensial hanya lewat kanal aman setelah entitlement ada.

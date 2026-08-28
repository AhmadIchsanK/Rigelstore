# Modul `bot` — Bot Worker (Telegram Storefront)

Storefront versi Telegram. **WAJIB memakai `core/` yang sama** dengan website —
dilarang membuat sistem commerce terpisah.

**Status Fase 0:** kerangka kosong.

## Isi yang direncanakan (dibangun Fase 6)

- Bot Telegram (token dari @BotFather, disimpan di env).
- Katalog, cart, checkout QRIS, status pembayaran, riwayat order, pengiriman
  aman, penautan identitas Telegram ke akun.
- Deep link untuk kampanye/produk.

## Prinsip

- Order dari Telegram muncul di admin website karena **satu database yang sama**.
- **Jangan** minta pembeli menempel kredensial sensitif di chat.
- Pengiriman kredensial hanya lewat kanal aman setelah entitlement ada.

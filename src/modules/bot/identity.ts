/**
 * Identitas pembeli Telegram di dalam core commerce.
 *
 * Pembeli Telegram diperlakukan sebagai "guest" dengan email SINTETIK yang
 * deterministik dari telegram_id. Karena email diturunkan dari id Telegram yang
 * diverifikasi server, seorang pengguna hanya bisa mengakses ordernya sendiri
 * (tidak bisa dipalsukan dari sisi klien).
 */

const DOMAIN = "telegram.rigelstore.local";

/** Email guest sintetik untuk sebuah telegram_id. */
export function syntheticEmailForTelegram(telegramId: number | string): string {
  return `tg${telegramId}@${DOMAIN}`;
}

/** Apakah email ini milik jalur Telegram? */
export function isTelegramSyntheticEmail(email: string): boolean {
  return email.endsWith(`@${DOMAIN}`);
}

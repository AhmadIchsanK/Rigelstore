import "server-only";

/**
 * Klien tipis Telegram Bot API. Token dari environment (TELEGRAM_BOT_TOKEN).
 */

export type InlineButton = { text: string; callback_data?: string; url?: string };
export type InlineKeyboard = InlineButton[][];

function token(): string {
  const t = process.env.TELEGRAM_BOT_TOKEN;
  if (!t) throw new Error("TELEGRAM_BOT_TOKEN belum diset di environment.");
  return t;
}

async function call(method: string, body: Record<string, unknown>): Promise<unknown> {
  const res = await fetch(`https://api.telegram.org/bot${token()}/${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return res.json();
}

export function sendMessage(
  chatId: number,
  text: string,
  keyboard?: InlineKeyboard,
): Promise<unknown> {
  return call("sendMessage", {
    chat_id: chatId,
    text,
    parse_mode: "HTML",
    disable_web_page_preview: true,
    reply_markup: keyboard ? { inline_keyboard: keyboard } : undefined,
  });
}

export function sendPhoto(
  chatId: number,
  photoUrl: string,
  caption: string,
  keyboard?: InlineKeyboard,
): Promise<unknown> {
  return call("sendPhoto", {
    chat_id: chatId,
    photo: photoUrl,
    caption,
    parse_mode: "HTML",
    reply_markup: keyboard ? { inline_keyboard: keyboard } : undefined,
  });
}

export function answerCallbackQuery(id: string, text?: string): Promise<unknown> {
  return call("answerCallbackQuery", { callback_query_id: id, text });
}

/** Daftarkan webhook Telegram ke URL kita + secret token. */
export function setWebhook(url: string, secretToken: string): Promise<unknown> {
  return call("setWebhook", {
    url,
    secret_token: secretToken,
    allowed_updates: ["message", "callback_query"],
  });
}

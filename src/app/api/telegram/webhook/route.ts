import { NextResponse, type NextRequest } from "next/server";
import { handleUpdate } from "@modules/bot/handler";

/**
 * Webhook Telegram. Diverifikasi dengan secret token (header
 * X-Telegram-Bot-Api-Secret-Token) yang didaftarkan saat setWebhook.
 * Selalu balas 200 agar Telegram tidak mengulang notifikasi.
 */
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const secret = process.env.TELEGRAM_WEBHOOK_SECRET;
  const header = req.headers.get("x-telegram-bot-api-secret-token");
  if (!secret || header !== secret) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let update: unknown;
  try {
    update = await req.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 200 });
  }

  try {
    await handleUpdate(update as Parameters<typeof handleUpdate>[0]);
  } catch (e) {
    console.error("telegram handler error", e);
  }
  return NextResponse.json({ ok: true });
}

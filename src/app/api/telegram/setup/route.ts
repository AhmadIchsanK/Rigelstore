import { NextResponse, type NextRequest } from "next/server";
import { setWebhook } from "@modules/bot/api";

/**
 * Daftarkan webhook Telegram (sekali jalankan setelah env terisi).
 * Dilindungi CRON_SECRET. Contoh:
 *   GET /api/telegram/setup?key=<CRON_SECRET>
 */
export const dynamic = "force-dynamic";

function authorized(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const url = new URL(req.url);
  return (
    req.headers.get("authorization") === `Bearer ${secret}` ||
    url.searchParams.get("key") === secret
  );
}

export async function GET(req: NextRequest) {
  if (!authorized(req)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  const webhookSecret = process.env.TELEGRAM_WEBHOOK_SECRET;
  if (!appUrl || !webhookSecret) {
    return NextResponse.json(
      { error: "Set NEXT_PUBLIC_APP_URL & TELEGRAM_WEBHOOK_SECRET dulu." },
      { status: 400 },
    );
  }

  try {
    const result = await setWebhook(`${appUrl}/api/telegram/webhook`, webhookSecret);
    return NextResponse.json({ ok: true, result });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "error" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  return GET(req);
}

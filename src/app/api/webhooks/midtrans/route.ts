import { NextResponse, type NextRequest } from "next/server";
import { processPaymentWebhook } from "@modules/core/orders/service";

/**
 * Endpoint webhook pembayaran. INI satu-satunya sumber status LUNAS.
 * Verifikasi signature + idempotency ditangani di dalam service/fungsi SQL.
 * Tidak pernah mempercayai input pembeli.
 */
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  try {
    const result = await processPaymentWebhook(body);
    // Signature salah -> 401 (bukan dari gateway sah). Selain itu 200 agar
    // gateway tidak mengulang notifikasi yang sudah tertangani.
    const status = result === "invalid_signature" ? 401 : 200;
    return NextResponse.json({ result }, { status });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "error" },
      { status: 500 },
    );
  }
}

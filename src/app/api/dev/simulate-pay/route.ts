import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseAdminClient } from "@modules/database/supabase/admin";
import { getPaymentProvider } from "@modules/payments";
import { mockSignature } from "@modules/payments/mock";
import { processPaymentWebhook } from "@modules/core/orders/service";

/**
 * ALAT DEV: mensimulasikan webhook "lunas" untuk menguji alur tanpa Midtrans.
 * HANYA aktif bila provider = mock DAN bukan produksi. Ini BUKAN jalan pintas
 * "sudah bayar" untuk pembeli — hanya untuk pengembangan lokal.
 */
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  if (process.env.NODE_ENV === "production" || getPaymentProvider().name !== "mock") {
    return NextResponse.json({ error: "disabled" }, { status: 403 });
  }

  let payload: { orderNumber?: string };
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }
  const orderNumber = payload.orderNumber;
  if (!orderNumber) return NextResponse.json({ error: "orderNumber required" }, { status: 400 });

  const supabase = createSupabaseAdminClient();
  const { data: order } = await supabase
    .from("orders")
    .select("total_idr")
    .eq("order_number", orderNumber)
    .maybeSingle();
  if (!order) return NextResponse.json({ error: "order_not_found" }, { status: 404 });

  const gross = String(order.total_idr);
  const body = {
    order_id: orderNumber,
    transaction_status: "settlement",
    status_code: "200",
    gross_amount: gross,
    transaction_id: `MOCK-${orderNumber}`,
    signature_key: mockSignature(orderNumber, "settlement", gross),
  };

  const result = await processPaymentWebhook(body);
  return NextResponse.json({ result });
}

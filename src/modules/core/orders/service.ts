import "server-only";

/**
 * Orkestrasi order (server). Menyatukan mesin order deterministik (fungsi SQL)
 * dengan adapter pembayaran. Uang & kepemilikan tetap diputuskan fungsi SQL.
 */
import { createSupabaseAdminClient } from "@modules/database/supabase/admin";
import { getPaymentProvider } from "@modules/payments";

export type CartItem = { productId: string; quantity: number };

export type PlacedOrder = {
  orderId: string;
  orderNumber: string;
  totalIdr: number;
  qrString: string | null;
  qrUrl: string | null;
  expiresAt: string | null;
  provider: string;
};

function reservationMinutes(): number {
  const n = Number(process.env.PAYMENT_RESERVATION_MINUTES ?? "15");
  return Number.isFinite(n) && n > 0 ? n : 15;
}

/**
 * Buat order (reservasi stok atomik lewat place_order), lalu buat tagihan QRIS
 * di gateway dan simpan baris payment.
 */
export async function placeOrder(input: {
  userId: string | null;
  guestEmail: string | null;
  items: CartItem[];
}): Promise<PlacedOrder> {
  const supabase = createSupabaseAdminClient();
  const minutes = reservationMinutes();

  // 1) Reservasi + order (atomik). Melempar bila stok habis (OUT_OF_STOCK).
  const { data, error } = await supabase.rpc("place_order", {
    p_user: input.userId,
    p_guest_email: input.guestEmail,
    p_items: input.items.map((i) => ({ product_id: i.productId, quantity: i.quantity })),
    p_minutes: minutes,
  });
  if (error) {
    if (error.message.includes("OUT_OF_STOCK")) throw new Error("OUT_OF_STOCK");
    throw new Error(error.message);
  }
  const row = Array.isArray(data) ? data[0] : data;
  const orderId: string = row.order_id;
  const orderNumber: string = row.order_number;
  const totalIdr: number = Number(row.total_idr);

  // 2) Buat tagihan QRIS di gateway.
  const provider = getPaymentProvider();
  const charge = await provider.createQrisCharge({
    orderId,
    orderNumber,
    amountIdr: totalIdr,
    customerEmail: input.guestEmail,
  });

  // 3) Simpan payment.
  await supabase.from("payments").insert({
    order_id: orderId,
    provider: provider.name,
    provider_ref: charge.providerRef,
    status: "pending",
    amount_idr: totalIdr,
    qr_string: charge.qrString,
    qr_url: charge.qrUrl,
    raw: charge.raw,
  });

  return {
    orderId,
    orderNumber,
    totalIdr,
    qrString: charge.qrString,
    qrUrl: charge.qrUrl,
    expiresAt: charge.expiresAt,
    provider: provider.name,
  };
}

/** Data publik untuk halaman checkout (status + QR + total). Tanpa data rahasia. */
export async function getCheckoutView(orderNumber: string) {
  const supabase = createSupabaseAdminClient();
  const { data: order } = await supabase
    .from("orders")
    .select("id, order_number, status, total_idr, expires_at")
    .eq("order_number", orderNumber)
    .maybeSingle();
  if (!order) return null;

  const { data: payment } = await supabase
    .from("payments")
    .select("qr_string, qr_url, status, provider")
    .eq("order_id", order.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return { order, payment };
}

/** Status ringkas untuk polling (tidak pernah mengubah apa pun). */
export async function getOrderStatus(orderNumber: string): Promise<string | null> {
  const supabase = createSupabaseAdminClient();
  const { data } = await supabase
    .from("orders")
    .select("status")
    .eq("order_number", orderNumber)
    .maybeSingle();
  return data?.status ?? null;
}

/**
 * Proses webhook pembayaran. Verifikasi signature (di adapter), lalu panggil
 * confirm_order_paid (idempoten). Mengembalikan kode hasil dari fungsi SQL.
 */
export async function processPaymentWebhook(body: unknown): Promise<string> {
  const provider = getPaymentProvider();
  const parsed = provider.parseWebhook(body);

  const supabase = createSupabaseAdminClient();
  // Temukan order id dari order_number (order_id yang kita kirim ke gateway).
  const { data: order } = await supabase
    .from("orders")
    .select("id")
    .eq("order_number", parsed.orderRef)
    .maybeSingle();
  const orderId = order?.id ?? null;

  // Status selain 'paid' (pending/expire/failed): cukup dicatat untuk audit &
  // idempotency, TIDAK menandai lunas. Pelepasan stok kadaluwarsa ditangani
  // cron (expire_due_orders).
  if (parsed.status !== "paid") {
    await supabase
      .from("webhook_events")
      .insert({
        provider: provider.name,
        event_id: parsed.eventId,
        signature_ok: parsed.signatureOk,
        order_id: orderId,
        payload: parsed.raw,
      })
      .then(() => undefined);
    return `ignored:${parsed.status}`;
  }

  // Status 'paid': verifikasi signature + terapkan (idempoten) di fungsi SQL.
  const { data, error } = await supabase.rpc("confirm_order_paid", {
    p_provider: provider.name,
    p_event_id: parsed.eventId,
    p_signature_ok: parsed.signatureOk,
    p_provider_ref: parsed.providerRef,
    p_amount_idr: parsed.amountIdr,
    p_order: orderId,
    p_payload: parsed.raw,
  });
  if (error) throw new Error(error.message);
  return String(data);
}

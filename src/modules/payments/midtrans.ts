import "server-only";

/**
 * Adapter Midtrans (QRIS) — mode Sandbox saat tes, produksi saat live.
 *
 * Verifikasi webhook Midtrans: signature_key =
 *   sha512(order_id + status_code + gross_amount + ServerKey)
 * dibandingkan dengan nilai `signature_key` pada notifikasi. Ini yang
 * memastikan notifikasi memang dari Midtrans — bukan orang iseng.
 */
import { createHash } from "node:crypto";
import type {
  ChargeResult,
  CreateChargeInput,
  NormalizedPaymentStatus,
  PaymentProvider,
  WebhookResult,
} from "./provider";

const SANDBOX_BASE = "https://api.sandbox.midtrans.com";
const PRODUCTION_BASE = "https://api.midtrans.com";

function baseUrl(): string {
  return process.env.PAYMENT_ENVIRONMENT === "production" ? PRODUCTION_BASE : SANDBOX_BASE;
}

function serverKey(): string {
  const k = process.env.MIDTRANS_SERVER_KEY;
  if (!k) throw new Error("MIDTRANS_SERVER_KEY belum diset di environment.");
  return k;
}

/** Hitung signature key Midtrans (pure, mudah diuji). */
export function midtransSignatureKey(
  orderId: string,
  statusCode: string,
  grossAmount: string,
  key: string,
): string {
  return createHash("sha512")
    .update(orderId + statusCode + grossAmount + key)
    .digest("hex");
}

/** Petakan transaction_status Midtrans ke status ternormalisasi kita. */
export function mapMidtransStatus(
  transactionStatus: string,
  fraudStatus?: string,
): NormalizedPaymentStatus {
  switch (transactionStatus) {
    case "capture":
      return fraudStatus === "challenge" ? "pending" : "paid";
    case "settlement":
      return "paid";
    case "pending":
      return "pending";
    case "expire":
      return "expired";
    case "deny":
    case "cancel":
    case "failure":
      return "failed";
    default:
      return "pending";
  }
}

export class MidtransProvider implements PaymentProvider {
  readonly name = "midtrans";

  async createQrisCharge(input: CreateChargeInput): Promise<ChargeResult> {
    const auth = Buffer.from(`${serverKey()}:`).toString("base64");
    const res = await fetch(`${baseUrl()}/v2/charge`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Basic ${auth}`,
      },
      body: JSON.stringify({
        payment_type: "qris",
        transaction_details: {
          order_id: input.orderNumber,
          gross_amount: input.amountIdr,
        },
        qris: { acquirer: "gopay" },
        customer_details: input.customerEmail ? { email: input.customerEmail } : undefined,
      }),
    });

    const data = (await res.json()) as Record<string, unknown>;
    if (!res.ok) {
      throw new Error(`Midtrans charge gagal: ${JSON.stringify(data)}`);
    }

    const actions = (data.actions as Array<{ name: string; url: string }> | undefined) ?? [];
    const qrAction = actions.find((a) => a.name === "generate-qr-code");

    return {
      providerRef: String(data.transaction_id ?? ""),
      qrString: (data.qr_string as string | undefined) ?? null,
      qrUrl: qrAction?.url ?? null,
      expiresAt: (data.expiry_time as string | undefined) ?? null,
      raw: data,
    };
  }

  parseWebhook(body: unknown): WebhookResult {
    const n = (body ?? {}) as Record<string, string | undefined>;
    const orderRef = String(n.order_id ?? "");
    const statusCode = String(n.status_code ?? "");
    const grossAmount = String(n.gross_amount ?? "");
    const providedSignature = String(n.signature_key ?? "");

    const expected = midtransSignatureKey(orderRef, statusCode, grossAmount, serverKey());
    const signatureOk = providedSignature.length > 0 && providedSignature === expected;

    const status = mapMidtransStatus(
      String(n.transaction_status ?? ""),
      n.fraud_status ? String(n.fraud_status) : undefined,
    );

    // eventId untuk idempotency: signature_key unik per isi notifikasi.
    const eventId = providedSignature || `${orderRef}:${n.transaction_status}:${n.transaction_id}`;

    return {
      eventId,
      orderRef,
      providerRef: n.transaction_id ? String(n.transaction_id) : null,
      amountIdr: grossAmount ? Math.round(Number(grossAmount)) : null,
      status,
      signatureOk,
      raw: n as Record<string, unknown>,
    };
  }
}

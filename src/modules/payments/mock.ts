import "server-only";

/**
 * Adapter pembayaran TIRUAN untuk pengembangan & tes tanpa gateway asli.
 * Membuat QR palsu dan memverifikasi webhook dengan HMAC sederhana berbasis
 * secret dari environment. JANGAN dipakai di produksi.
 */
import { createHmac } from "node:crypto";
import type {
  ChargeResult,
  CreateChargeInput,
  PaymentProvider,
  WebhookResult,
} from "./provider";
import { mapMidtransStatus } from "./midtrans";

function mockSecret(): string {
  return process.env.MOCK_PAYMENT_SECRET ?? "mock-secret";
}

/** Signature tiruan (dipakai juga oleh alat "simulasi bayar" di dev). */
export function mockSignature(orderRef: string, status: string, amount: string): string {
  return createHmac("sha256", mockSecret()).update(`${orderRef}|${status}|${amount}`).digest("hex");
}

export class MockProvider implements PaymentProvider {
  readonly name = "mock";

  async createQrisCharge(input: CreateChargeInput): Promise<ChargeResult> {
    return {
      providerRef: `MOCK-${input.orderNumber}`,
      qrString: `MOCKQRIS|${input.orderNumber}|${input.amountIdr}`,
      qrUrl: null,
      expiresAt: null,
      raw: { mock: true },
    };
  }

  parseWebhook(body: unknown): WebhookResult {
    const n = (body ?? {}) as Record<string, string | undefined>;
    const orderRef = String(n.order_id ?? "");
    const grossAmount = String(n.gross_amount ?? "");
    const transactionStatus = String(n.transaction_status ?? "");
    const provided = String(n.signature_key ?? "");

    const expected = mockSignature(orderRef, transactionStatus, grossAmount);
    const signatureOk = provided.length > 0 && provided === expected;

    return {
      eventId: provided || `${orderRef}:${transactionStatus}`,
      orderRef,
      providerRef: n.transaction_id ? String(n.transaction_id) : `MOCK-${orderRef}`,
      amountIdr: grossAmount ? Math.round(Number(grossAmount)) : null,
      status: mapMidtransStatus(transactionStatus),
      signatureOk,
      raw: n as Record<string, unknown>,
    };
  }
}

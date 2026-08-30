import "server-only";

/**
 * Pemilihan adapter pembayaran berdasarkan environment.
 * - PAYMENT_PROVIDER=midtrans -> gateway asli (butuh MIDTRANS_SERVER_KEY).
 * - PAYMENT_PROVIDER=mock (atau default tanpa server key) -> adapter tiruan.
 */
import type { PaymentProvider } from "./provider";
import { MidtransProvider } from "./midtrans";
import { MockProvider } from "./mock";

export function getPaymentProvider(): PaymentProvider {
  const explicit = process.env.PAYMENT_PROVIDER;
  if (explicit === "midtrans") return new MidtransProvider();
  if (explicit === "mock") return new MockProvider();
  // Default aman untuk dev: pakai gateway asli hanya jika server key tersedia.
  return process.env.MIDTRANS_SERVER_KEY ? new MidtransProvider() : new MockProvider();
}

export type { PaymentProvider } from "./provider";
export * from "./provider";

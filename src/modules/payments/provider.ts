/**
 * Interface adapter pembayaran (gateway-agnostik). Gateway QRIS berada di balik
 * interface ini agar bisa diganti tanpa mengubah core (ARCHITECTURE.md).
 *
 * Prinsip: status LUNAS hanya berasal dari webhook gateway yang terverifikasi.
 */

export type NormalizedPaymentStatus = "paid" | "pending" | "expired" | "failed";

export type CreateChargeInput = {
  orderId: string;
  orderNumber: string; // dikirim sebagai order_id ke gateway
  amountIdr: number;
  customerEmail?: string | null;
};

export type ChargeResult = {
  providerRef: string; // id transaksi di gateway
  qrString: string | null; // payload QRIS (untuk render QR sendiri)
  qrUrl: string | null; // URL gambar QR dari gateway (bila ada)
  expiresAt: string | null; // ISO
  raw: Record<string, unknown>;
};

export type WebhookResult = {
  /** Kunci idempotency unik per notifikasi (mis. signature key). */
  eventId: string;
  /** Referensi order kita (order_number). */
  orderRef: string;
  providerRef: string | null;
  amountIdr: number | null;
  status: NormalizedPaymentStatus;
  /** Hasil verifikasi tanda tangan; false = jangan diproses. */
  signatureOk: boolean;
  raw: Record<string, unknown>;
};

export interface PaymentProvider {
  readonly name: string;
  /** Buat tagihan QRIS dinamis untuk sebuah order. */
  createQrisCharge(input: CreateChargeInput): Promise<ChargeResult>;
  /** Parse + verifikasi payload webhook menjadi hasil ternormalisasi. */
  parseWebhook(body: unknown): WebhookResult;
}

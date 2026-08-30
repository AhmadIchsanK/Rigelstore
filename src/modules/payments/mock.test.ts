import { beforeAll, describe, expect, it } from "vitest";
import { MockProvider, mockSignature } from "./mock";

beforeAll(() => {
  process.env.MOCK_PAYMENT_SECRET = "test-secret";
});

describe("MockProvider webhook (jalur verifikasi signature)", () => {
  const provider = new MockProvider();

  function body(overrides: Record<string, string> = {}) {
    const base = {
      order_id: "RGL-TEST01",
      transaction_status: "settlement",
      gross_amount: "25000",
      transaction_id: "MOCK-1",
      ...overrides,
    };
    return { ...base, signature_key: mockSignature(base.order_id, base.transaction_status, base.gross_amount) };
  }

  it("signature benar -> signatureOk true, status paid", () => {
    const r = provider.parseWebhook(body());
    expect(r.signatureOk).toBe(true);
    expect(r.status).toBe("paid");
    expect(r.amountIdr).toBe(25000);
    expect(r.orderRef).toBe("RGL-TEST01");
  });

  it("signature dipalsukan -> signatureOk false", () => {
    const b = body();
    b.signature_key = "palsu";
    expect(provider.parseWebhook(b).signatureOk).toBe(false);
  });

  it("nominal diubah setelah tanda tangan -> signatureOk false", () => {
    const b = body();
    b.gross_amount = "1"; // diubah, tanda tangan tak lagi cocok
    expect(provider.parseWebhook(b).signatureOk).toBe(false);
  });
});

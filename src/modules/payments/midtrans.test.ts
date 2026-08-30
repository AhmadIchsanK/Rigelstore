import { createHash } from "node:crypto";
import { describe, expect, it } from "vitest";
import { mapMidtransStatus, midtransSignatureKey } from "./midtrans";

describe("verifikasi signature Midtrans (anti pembayaran palsu)", () => {
  it("signature key = sha512(order_id+status_code+gross_amount+serverKey)", () => {
    const orderId = "RGL-ABC123";
    const statusCode = "200";
    const gross = "25000.00";
    const key = "SB-Mid-server-XXXX";

    const expected = createHash("sha512")
      .update(orderId + statusCode + gross + key)
      .digest("hex");

    expect(midtransSignatureKey(orderId, statusCode, gross, key)).toBe(expected);
  });

  it("signature berubah bila salah satu bagian dipalsukan", () => {
    const a = midtransSignatureKey("RGL-1", "200", "25000.00", "k");
    const b = midtransSignatureKey("RGL-1", "200", "99999.00", "k"); // nominal diubah
    const c = midtransSignatureKey("RGL-2", "200", "25000.00", "k"); // order diubah
    expect(a).not.toBe(b);
    expect(a).not.toBe(c);
  });
});

describe("pemetaan status transaksi Midtrans", () => {
  it("settlement & capture(accept) = paid", () => {
    expect(mapMidtransStatus("settlement")).toBe("paid");
    expect(mapMidtransStatus("capture", "accept")).toBe("paid");
  });
  it("capture(challenge) = pending", () => {
    expect(mapMidtransStatus("capture", "challenge")).toBe("pending");
  });
  it("expire = expired; cancel/deny/failure = failed; pending = pending", () => {
    expect(mapMidtransStatus("expire")).toBe("expired");
    expect(mapMidtransStatus("cancel")).toBe("failed");
    expect(mapMidtransStatus("deny")).toBe("failed");
    expect(mapMidtransStatus("failure")).toBe("failed");
    expect(mapMidtransStatus("pending")).toBe("pending");
  });
});

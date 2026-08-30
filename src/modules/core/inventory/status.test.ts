import { describe, expect, it } from "vitest";
import {
  assertTransition,
  canTransition,
  isCommitted,
  isReservable,
} from "./status";

describe("state machine inventory (anti double-sell)", () => {
  it("alur normal valid: AVAILABLE→RESERVED→SOLD→DELIVERED→COMPLETED", () => {
    expect(canTransition("AVAILABLE", "RESERVED")).toBe(true);
    expect(canTransition("RESERVED", "SOLD")).toBe(true);
    expect(canTransition("SOLD", "DELIVERED")).toBe(true);
    expect(canTransition("DELIVERED", "COMPLETED")).toBe(true);
  });

  it("reservasi bisa dilepas kembali / kedaluwarsa", () => {
    expect(canTransition("RESERVED", "AVAILABLE")).toBe(true);
    expect(canTransition("RESERVED", "EXPIRED")).toBe(true);
    expect(canTransition("EXPIRED", "AVAILABLE")).toBe(true);
  });

  it("transisi terlarang ditolak", () => {
    // Tidak boleh langsung AVAILABLE -> SOLD (harus di-reserve dulu).
    expect(canTransition("AVAILABLE", "SOLD")).toBe(false);
    // Barang terjual tidak boleh 'balik' jadi AVAILABLE.
    expect(canTransition("SOLD", "AVAILABLE")).toBe(false);
    expect(canTransition("DELIVERED", "AVAILABLE")).toBe(false);
    // Status terminal tidak berpindah.
    expect(canTransition("REVOKED", "AVAILABLE")).toBe(false);
    expect(canTransition("REFUNDED", "SOLD")).toBe(false);
  });

  it("assertTransition melempar untuk transisi ilegal", () => {
    expect(() => assertTransition("AVAILABLE", "DELIVERED")).toThrow();
    expect(() => assertTransition("AVAILABLE", "RESERVED")).not.toThrow();
  });

  it("hanya AVAILABLE yang reservable", () => {
    expect(isReservable("AVAILABLE")).toBe(true);
    for (const s of ["RESERVED", "SOLD", "DELIVERED", "COMPLETED", "EXPIRED", "REVOKED", "REFUNDED"] as const) {
      expect(isReservable(s)).toBe(false);
    }
  });

  it("isCommitted benar untuk SOLD/DELIVERED/COMPLETED", () => {
    expect(isCommitted("SOLD")).toBe(true);
    expect(isCommitted("DELIVERED")).toBe(true);
    expect(isCommitted("COMPLETED")).toBe(true);
    expect(isCommitted("AVAILABLE")).toBe(false);
    expect(isCommitted("RESERVED")).toBe(false);
  });
});

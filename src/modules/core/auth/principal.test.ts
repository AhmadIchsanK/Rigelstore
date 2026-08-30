import { describe, expect, it } from "vitest";
import {
  type AdminPrincipal,
  type CustomerPrincipal,
  type GuestPrincipal,
  AuthorizationError,
  assertAdmin,
  assertPermission,
  can,
  GUEST,
  isAdmin,
  statusFor,
} from "./principal";

const guest: GuestPrincipal = GUEST;

const customer: CustomerPrincipal = {
  kind: "customer",
  userId: "u-cust",
  email: "customer@example.com",
};

function admin(role: AdminPrincipal["role"]): AdminPrincipal {
  return { kind: "admin", userId: "u-admin", email: "admin@example.com", role, isActive: true };
}

describe("batas akses admin (RBAC) — aturan bisnis inti", () => {
  it("guest ditolak membuka admin (401, belum login)", () => {
    expect(() => assertAdmin(guest)).toThrowError(AuthorizationError);
    try {
      assertAdmin(guest);
    } catch (e) {
      expect(e).toBeInstanceOf(AuthorizationError);
      expect(statusFor(e as AuthorizationError)).toBe(401);
    }
  });

  it("customer yang login TETAP ditolak membuka admin (403) — walau paksa buka URL", () => {
    expect(isAdmin(customer)).toBe(false);
    try {
      assertAdmin(customer);
      throw new Error("seharusnya melempar");
    } catch (e) {
      expect(e).toBeInstanceOf(AuthorizationError);
      expect((e as AuthorizationError).reason).toBe("forbidden");
      expect(statusFor(e as AuthorizationError)).toBe(403);
    }
  });

  it("admin aktif boleh membuka admin", () => {
    expect(() => assertAdmin(admin("admin"))).not.toThrow();
    expect(isAdmin(admin("super_admin"))).toBe(true);
  });
});

describe("izin per peran", () => {
  it("super_admin punya SEMUA izin", () => {
    expect(can(admin("super_admin"), "settings.payment")).toBe(true);
    expect(can(admin("super_admin"), "admins.manage")).toBe(true);
    expect(can(admin("super_admin"), "pricing.manage")).toBe(true);
  });

  it("admin biasa TIDAK boleh mengelola admin atau pengaturan pembayaran", () => {
    expect(can(admin("admin"), "admins.manage")).toBe(false);
    expect(can(admin("admin"), "settings.payment")).toBe(false);
    expect(can(admin("admin"), "products.manage")).toBe(true);
  });

  it("content_admin hanya draft — tanpa harga/pembayaran/izin", () => {
    expect(can(admin("content_admin"), "products.draft")).toBe(true);
    expect(can(admin("content_admin"), "pricing.manage")).toBe(false);
    expect(can(admin("content_admin"), "refunds.manage")).toBe(false);
    expect(can(admin("content_admin"), "admins.manage")).toBe(false);
  });

  it("support_admin — order/support, tanpa konfigurasi finansial", () => {
    expect(can(admin("support_admin"), "orders.manage")).toBe(true);
    expect(can(admin("support_admin"), "delivery.resend")).toBe(true);
    expect(can(admin("support_admin"), "refunds.manage")).toBe(false);
    expect(can(admin("support_admin"), "pricing.manage")).toBe(false);
    expect(can(admin("support_admin"), "settings.payment")).toBe(false);
  });

  it("customer/guest tidak punya izin apa pun", () => {
    expect(can(customer, "orders.read")).toBe(false);
    expect(can(guest, "orders.read")).toBe(false);
  });

  it("assertPermission menolak admin tanpa izin yang diminta", () => {
    expect(() => assertPermission(admin("content_admin"), "pricing.manage")).toThrowError(
      AuthorizationError,
    );
    expect(() => assertPermission(admin("admin"), "products.manage")).not.toThrow();
  });
});

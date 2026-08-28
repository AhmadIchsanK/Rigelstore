import { describe, expect, it } from "vitest";
import {
  PERMISSIONS,
  ROLE_PERMISSIONS,
  ROLES,
  roleHasPermission,
} from "./permissions";

describe("katalog RBAC konsisten", () => {
  it("setiap izin yang dipetakan ke peran adalah izin yang valid", () => {
    const valid = new Set<string>(PERMISSIONS);
    for (const [role, perms] of Object.entries(ROLE_PERMISSIONS)) {
      for (const p of perms) {
        expect(valid.has(p), `${role} -> ${p} tidak ada di PERMISSIONS`).toBe(true);
      }
    }
  });

  it("tidak ada izin duplikat dalam satu peran", () => {
    for (const [role, perms] of Object.entries(ROLE_PERMISSIONS)) {
      expect(new Set(perms).size, `duplikat izin pada ${role}`).toBe(perms.length);
    }
  });

  it("super_admin bukan bagian dari peta eksplisit (izin implisit penuh)", () => {
    expect(Object.keys(ROLE_PERMISSIONS)).not.toContain("super_admin");
    expect(ROLES).toContain("super_admin");
  });

  it("izin sensitif finansial/izin HANYA milik super_admin & (sebagian) admin", () => {
    // Tidak boleh bocor ke content_admin / support_admin.
    for (const perm of ["admins.manage", "settings.payment", "roles.manage"] as const) {
      expect(roleHasPermission("content_admin", perm)).toBe(false);
      expect(roleHasPermission("support_admin", perm)).toBe(false);
      expect(roleHasPermission("super_admin", perm)).toBe(true);
    }
    // Bahkan admin biasa tidak mengelola admin / pengaturan pembayaran.
    expect(roleHasPermission("admin", "admins.manage")).toBe(false);
    expect(roleHasPermission("admin", "settings.payment")).toBe(false);
  });
});

/**
 * Principal = identitas pemanggil yang sudah dimuat dari database, beserta
 * keputusan otorisasi deterministik atasnya.
 *
 * Fungsi di sini adalah GERBANG AKSES inti dan dipakai oleh server (halaman &
 * server action). Semuanya murni (tanpa I/O) supaya mudah diuji otomatis —
 * lihat principal.test.ts.
 */

import { type Permission, type Role, roleHasPermission } from "../rbac/permissions";

/** Pengunjung tak dikenal / belum login. */
export type GuestPrincipal = {
  kind: "guest";
};

/** Pelanggan yang login tetapi BUKAN admin. */
export type CustomerPrincipal = {
  kind: "customer";
  userId: string;
  email: string | null;
};

/** Admin back-office yang aktif. */
export type AdminPrincipal = {
  kind: "admin";
  userId: string;
  email: string | null;
  role: Role;
  isActive: true;
};

export type Principal = GuestPrincipal | CustomerPrincipal | AdminPrincipal;

export const GUEST: GuestPrincipal = { kind: "guest" };

/** Error otorisasi dengan kode HTTP yang jelas. */
export class AuthorizationError extends Error {
  constructor(
    public readonly reason: "unauthenticated" | "forbidden",
    message: string,
  ) {
    super(message);
    this.name = "AuthorizationError";
  }
}

/** Kode status HTTP yang sesuai untuk error otorisasi. */
export function statusFor(err: AuthorizationError): 401 | 403 {
  return err.reason === "unauthenticated" ? 401 : 403;
}

/** Apakah principal seorang admin aktif? */
export function isAdmin(principal: Principal): principal is AdminPrincipal {
  return principal.kind === "admin" && principal.isActive === true;
}

/**
 * Apakah principal memiliki izin tertentu?
 * Hanya admin aktif yang mungkin punya izin. `super_admin` punya semua.
 */
export function can(principal: Principal, perm: Permission): boolean {
  return isAdmin(principal) && roleHasPermission(principal.role, perm);
}

/**
 * Gerbang halaman admin: lempar error jika BUKAN admin aktif.
 * Guest -> 401 (belum login). Customer -> 403 (login tapi tak berhak).
 *
 * Inilah yang membuat pelanggan tetap DITOLAK walau memaksa membuka URL admin.
 */
export function assertAdmin(principal: Principal): asserts principal is AdminPrincipal {
  if (principal.kind === "guest") {
    throw new AuthorizationError("unauthenticated", "Harus login sebagai admin.");
  }
  if (!isAdmin(principal)) {
    throw new AuthorizationError("forbidden", "Akses admin ditolak.");
  }
}

/** Gerbang izin spesifik: harus admin aktif DAN punya izin `perm`. */
export function assertPermission(
  principal: Principal,
  perm: Permission,
): asserts principal is AdminPrincipal {
  assertAdmin(principal);
  if (!roleHasPermission(principal.role, perm)) {
    throw new AuthorizationError("forbidden", `Butuh izin: ${perm}.`);
  }
}

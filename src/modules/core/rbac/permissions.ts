/**
 * Katalog izin & pemetaan peran RBAC — SUMBER KEBENARAN aplikasi (deterministik).
 *
 * Daftar ini SENGAJA dibuat cermin dari seed SQL di modul `database`
 * (migrasi phase1_rbac_core). Jika salah satu diubah, ubah keduanya —
 * ada automated test yang menjaga agar tidak melenceng dari asumsi dasar.
 *
 * Prinsip (AI_RULES.md / SECURITY.md): akses selalu diputuskan kode
 * deterministik, bukan AI. `content_admin` & `support_admin` TIDAK memiliki
 * izin finansial/harga/izin-admin.
 */

export const ROLES = [
  "super_admin",
  "admin",
  "content_admin",
  "support_admin",
] as const;

export type Role = (typeof ROLES)[number];

export const PERMISSIONS = [
  "admins.manage",
  "security.manage",
  "roles.manage",
  "settings.payment",
  "settings.manage",
  "audit.read",
  "products.manage",
  "products.draft",
  "pricing.manage",
  "inventory.manage",
  "catalog.manage",
  "coupons.manage",
  "orders.read",
  "orders.manage",
  "delivery.resend",
  "refunds.manage",
  "customers.read",
  "support.manage",
  "reviews.moderate",
  "analytics.read",
  "content.draft",
  "ai.approve",
] as const;

export type Permission = (typeof PERMISSIONS)[number];

/**
 * Izin per peran. `super_admin` TIDAK didaftar di sini — ia memperoleh SEMUA
 * izin secara implisit (lihat `roleHasPermission`).
 */
export const ROLE_PERMISSIONS: Record<
  Exclude<Role, "super_admin">,
  readonly Permission[]
> = {
  admin: [
    "products.manage",
    "products.draft",
    "pricing.manage",
    "inventory.manage",
    "catalog.manage",
    "coupons.manage",
    "orders.read",
    "orders.manage",
    "delivery.resend",
    "refunds.manage",
    "customers.read",
    "support.manage",
    "reviews.moderate",
    "analytics.read",
    "content.draft",
    "audit.read",
    "settings.manage",
    "ai.approve",
  ],
  content_admin: ["products.draft", "content.draft"],
  support_admin: [
    "orders.read",
    "orders.manage",
    "delivery.resend",
    "customers.read",
    "support.manage",
    "reviews.moderate",
  ],
};

/**
 * Apakah sebuah peran memiliki izin tertentu?
 * `super_admin` selalu true. Peran lain dicek dari tabel pemetaan.
 */
export function roleHasPermission(role: Role, perm: Permission): boolean {
  if (role === "super_admin") return true;
  return ROLE_PERMISSIONS[role].includes(perm);
}

/** Apakah string ini peran yang valid? */
export function isRole(value: string): value is Role {
  return (ROLES as readonly string[]).includes(value);
}

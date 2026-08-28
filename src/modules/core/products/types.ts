/**
 * Tipe & aturan produk (deterministik) — cermin enum SQL.
 */

export const PRODUCT_TYPES = [
  "reusable_file", // file dipakai ulang, stok tak terbatas
  "unique_credential", // kredensial unik, 1 item / pembeli
  "protected_pdf", // PDF berpassword unik per pembelian
  "bundle", // gabungan beberapa produk
] as const;

export type ProductType = (typeof PRODUCT_TYPES)[number];

export const PRODUCT_STATUSES = ["draft", "published", "archived"] as const;
export type ProductStatus = (typeof PRODUCT_STATUSES)[number];

export function isProductType(v: string): v is ProductType {
  return (PRODUCT_TYPES as readonly string[]).includes(v);
}

export function isProductStatus(v: string): v is ProductStatus {
  return (PRODUCT_STATUSES as readonly string[]).includes(v);
}

/**
 * Apakah tipe ini memakai stok terbatas berbasis `inventory_items`
 * (dengan state machine & reservasi atomik)? Hanya kredensial unik.
 * reusable_file & protected_pdf = stok tak terbatas; password PDF dibuat
 * per pembelian (Fase 3).
 */
export function usesUniqueInventory(type: ProductType): boolean {
  return type === "unique_credential";
}

/** Buat slug URL-aman sederhana dari judul. */
export function slugify(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

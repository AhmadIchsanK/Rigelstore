/**
 * State machine status barang unik (deterministik) — cermin dari enum &
 * fungsi SQL di modul database. Uang/kepemilikan diputuskan kode ini, bukan AI.
 *
 *   AVAILABLE → RESERVED → SOLD → DELIVERED → COMPLETED
 *   Pengecualian: EXPIRED, REVOKED, REFUNDED
 */

export const INVENTORY_STATUSES = [
  "AVAILABLE",
  "RESERVED",
  "SOLD",
  "DELIVERED",
  "COMPLETED",
  "EXPIRED",
  "REVOKED",
  "REFUNDED",
] as const;

export type InventoryStatus = (typeof INVENTORY_STATUSES)[number];

/** Transisi yang diizinkan dari tiap status. */
const TRANSITIONS: Record<InventoryStatus, readonly InventoryStatus[]> = {
  AVAILABLE: ["RESERVED", "REVOKED"],
  RESERVED: ["SOLD", "AVAILABLE", "EXPIRED", "REVOKED"],
  SOLD: ["DELIVERED", "REFUNDED"],
  DELIVERED: ["COMPLETED", "REFUNDED"],
  COMPLETED: ["REFUNDED"],
  EXPIRED: ["AVAILABLE"], // item kedaluwarsa bisa disiapkan ulang untuk dijual
  REVOKED: [],
  REFUNDED: [],
};

/** Status akhir (tidak bisa berpindah lagi, kecuali yang tercantum di TRANSITIONS). */
export const TERMINAL_STATUSES: readonly InventoryStatus[] = ["REVOKED", "REFUNDED"];

/** Apakah transisi from -> to valid? */
export function canTransition(from: InventoryStatus, to: InventoryStatus): boolean {
  return TRANSITIONS[from].includes(to);
}

/** Melempar bila transisi tidak valid. */
export function assertTransition(from: InventoryStatus, to: InventoryStatus): void {
  if (!canTransition(from, to)) {
    throw new Error(`Transisi inventory tidak valid: ${from} -> ${to}`);
  }
}

/** Hanya item AVAILABLE yang bisa di-reserve. */
export function isReservable(status: InventoryStatus): boolean {
  return status === "AVAILABLE";
}

/** Status yang dianggap "terjual/terpakai" (tidak lagi tersedia untuk dijual). */
export function isCommitted(status: InventoryStatus): boolean {
  return status === "SOLD" || status === "DELIVERED" || status === "COMPLETED";
}

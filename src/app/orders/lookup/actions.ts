"use server";

import { headers } from "next/headers";
import { deliver, lookupGuestOrder } from "@modules/core/delivery/service";
import type { DeliveryResult } from "@modules/core/delivery/types";

export type LookupEntitlement = {
  id: string;
  title: string;
  type: string;
  delivered: boolean;
};

export type LookupState = {
  error: string | null;
  orderNumber?: string;
  email?: string;
  entitlements?: LookupEntitlement[];
};

/** Cari order tamu via nomor + email. Tidak menyimpan sesi apa pun. */
export async function lookupGuestAction(
  _prev: LookupState,
  formData: FormData,
): Promise<LookupState> {
  const orderNumber = String(formData.get("order_number") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  if (!orderNumber || !email) return { error: "Nomor order dan email wajib diisi." };

  const found = await lookupGuestOrder(orderNumber, email);
  if (!found) return { error: "Order tidak ditemukan atau email tidak cocok." };

  const entitlements: LookupEntitlement[] = found.entitlements.map((e) => {
    const product = e.products as unknown as { title?: string; type?: string } | null;
    return {
      id: e.id,
      title: product?.title ?? "Produk",
      type: product?.type ?? "",
      delivered: Boolean(e.delivered_at),
    };
  });

  return { error: null, orderNumber, email, entitlements };
}

/** Kirim barang untuk tamu — verifikasi ULANG nomor+email tiap kali. */
export async function deliverForGuestAction(
  _prev: DeliveryResult | null,
  formData: FormData,
): Promise<DeliveryResult> {
  const entitlementId = String(formData.get("entitlement_id") ?? "");
  const orderNumber = String(formData.get("order_number") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  if (!entitlementId || !orderNumber || !email) {
    return { type: "unavailable", reason: "Data tidak lengkap." };
  }
  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;
  return deliver(entitlementId, { kind: "guest", orderNumber, email }, ip);
}

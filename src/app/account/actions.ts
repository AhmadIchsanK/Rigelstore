"use server";

import { headers } from "next/headers";
import { loadPrincipal } from "@modules/core/auth/session";
import { deliver } from "@modules/core/delivery/service";
import type { DeliveryResult } from "@modules/core/delivery/types";

async function clientIp(): Promise<string | null> {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;
}

/** Ambil/tampilkan barang untuk pelanggan yang sedang login. */
export async function deliverForUserAction(
  _prev: DeliveryResult | null,
  formData: FormData,
): Promise<DeliveryResult> {
  const entitlementId = String(formData.get("entitlement_id") ?? "");
  if (!entitlementId) return { type: "unavailable", reason: "Entitlement tidak dikenal." };

  const principal = await loadPrincipal();
  if (principal.kind === "guest") {
    return { type: "unavailable", reason: "Silakan login." };
  }
  return deliver(entitlementId, { kind: "user", userId: principal.userId }, await clientIp());
}

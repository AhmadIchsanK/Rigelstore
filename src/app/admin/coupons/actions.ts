"use server";

import { revalidatePath } from "next/cache";
import { assertPermission, AuthorizationError } from "@modules/core/auth/principal";
import { loadPrincipal } from "@modules/core/auth/session";
import { logAudit } from "@modules/core/audit/log";
import { createCoupon, setCouponActive } from "@modules/core/promotions/service";

export type CouponFormState = { error: string | null; ok?: boolean };

export async function createCouponAction(
  _prev: CouponFormState,
  formData: FormData,
): Promise<CouponFormState> {
  const principal = await loadPrincipal();
  try {
    assertPermission(principal, "coupons.manage");
  } catch (e) {
    if (e instanceof AuthorizationError) return { error: "Tidak berwenang." };
    throw e;
  }

  const code = String(formData.get("code") ?? "").trim();
  const type = String(formData.get("type") ?? "percent");
  const value = Number(String(formData.get("value") ?? "0").replace(/[^0-9]/g, ""));
  const minSubtotal = Number(String(formData.get("min_subtotal") ?? "0").replace(/[^0-9]/g, ""));
  const maxRaw = String(formData.get("max_redemptions") ?? "").replace(/[^0-9]/g, "");
  const expiresRaw = String(formData.get("expires_at") ?? "").trim();

  if (!code) return { error: "Kode wajib diisi." };
  if (type !== "percent" && type !== "fixed") return { error: "Tipe tidak valid." };
  if (type === "percent" && (value < 1 || value > 100)) return { error: "Persen harus 1–100." };
  if (type === "fixed" && value < 1) return { error: "Nominal harus > 0." };

  const res = await createCoupon({
    code,
    type,
    value,
    minSubtotal: minSubtotal || 0,
    maxRedemptions: maxRaw ? Number(maxRaw) : null,
    active: true,
    expiresAt: expiresRaw ? new Date(expiresRaw).toISOString() : null,
    createdBy: principal.userId,
  });
  if (res.error) return { error: res.error };

  await logAudit({
    actorId: principal.userId,
    action: "coupon.create",
    targetType: "coupon",
    targetId: code.toUpperCase(),
    metadata: { type, value },
  });
  revalidatePath("/admin/coupons");
  return { error: null, ok: true };
}

export async function toggleCouponAction(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "");
  const active = String(formData.get("active") ?? "") === "true";
  const principal = await loadPrincipal();
  assertPermission(principal, "coupons.manage");
  await setCouponActive(id, active);
  revalidatePath("/admin/coupons");
}

import "server-only";

/** Manajemen kupon (Fase 7). Dipakai admin di balik izin coupons.manage. */
import { createSupabaseAdminClient } from "@modules/database/supabase/admin";

export type CouponType = "percent" | "fixed";

export async function listCoupons() {
  const supabase = createSupabaseAdminClient();
  const { data } = await supabase
    .from("coupons")
    .select("id, code, type, value, min_subtotal, max_redemptions, redeemed_count, active, expires_at, created_at")
    .order("created_at", { ascending: false });
  return data ?? [];
}

export async function createCoupon(input: {
  code: string;
  type: CouponType;
  value: number;
  minSubtotal: number;
  maxRedemptions: number | null;
  active: boolean;
  expiresAt: string | null;
  createdBy: string | null;
}): Promise<{ error: string | null }> {
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("coupons").insert({
    code: input.code.trim().toUpperCase(),
    type: input.type,
    value: input.value,
    min_subtotal: input.minSubtotal,
    max_redemptions: input.maxRedemptions,
    active: input.active,
    expires_at: input.expiresAt,
    created_by: input.createdBy,
  });
  if (error) {
    if (error.message.includes("duplicate")) return { error: "Kode kupon sudah ada." };
    return { error: error.message };
  }
  return { error: null };
}

export async function setCouponActive(id: string, active: boolean): Promise<void> {
  const supabase = createSupabaseAdminClient();
  await supabase.from("coupons").update({ active }).eq("id", id);
}

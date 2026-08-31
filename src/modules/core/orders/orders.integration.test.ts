/**
 * Tes INTEGRASI aturan uang terhadap database NYATA (fungsi SQL).
 *
 * Opt-in: hanya berjalan bila `RUN_DB_TESTS=1` DAN kredensial tersedia
 * (NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY). Di `npm test` biasa,
 * tes ini di-skip agar aman (tidak menyentuh DB).
 *
 * Menguji: anti double-sell (OUT_OF_STOCK), idempotency webhook (replay tidak
 * dobel kirim), dan diskon kupon. Semua data uji dibersihkan.
 */
import { randomUUID } from "node:crypto";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { afterAll, describe, expect, it } from "vitest";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
const enabled = process.env.RUN_DB_TESTS === "1" && !!url && !!key;

const productId = randomUUID();
const couponProductId = randomUUID();
const email = `it-${randomUUID()}@test.local`;
const couponCode = `IT${randomUUID().slice(0, 6).toUpperCase()}`;

describe.skipIf(!enabled)("integrasi aturan order (DB nyata)", () => {
  // Dibuat hanya saat enabled (URL valid). Saat skip, tidak pernah dipakai.
  const supabase: SupabaseClient = enabled
    ? createClient(url!, key!, { auth: { persistSession: false, autoRefreshToken: false } })
    : (null as unknown as SupabaseClient);

  afterAll(async () => {
    if (!enabled) return;
    await supabase.from("webhook_events").delete().like("event_id", "it-evt-%");
    const { data: orders } = await supabase.from("orders").select("id").eq("guest_email", email);
    for (const o of orders ?? []) await supabase.from("orders").delete().eq("id", o.id);
    await supabase.from("inventory_items").delete().eq("product_id", productId);
    await supabase.from("products").delete().eq("id", productId);
    await supabase.from("products").delete().eq("id", couponProductId);
    await supabase.from("coupons").delete().eq("code", couponCode);
  });

  it("anti double-sell: order kedua atas 1 stok -> OUT_OF_STOCK", async () => {
    await supabase.from("products").insert({
      id: productId, slug: `it-${productId.slice(0, 8)}`, title: "IT Cred",
      type: "unique_credential", status: "published", price_idr: 50000,
    });
    await supabase.from("inventory_items").insert({
      product_id: productId, status: "AVAILABLE", secret_encrypted: "v1:x:y:z", label: "it",
    });

    const items = [{ product_id: productId, quantity: 1 }];
    const first = await supabase.rpc("place_order", {
      p_user: null, p_guest_email: email, p_items: items, p_minutes: 15, p_coupon: null,
    });
    expect(first.error).toBeNull();

    const second = await supabase.rpc("place_order", {
      p_user: null, p_guest_email: email, p_items: items, p_minutes: 15, p_coupon: null,
    });
    expect(second.error?.message ?? "").toContain("OUT_OF_STOCK");
  });

  it("idempotency: replay webhook tidak menggandakan entitlement", async () => {
    const { data: order } = await supabase
      .from("orders").select("id, total_idr").eq("guest_email", email).limit(1).single();

    const args = {
      p_provider: "mock", p_event_id: "it-evt-1", p_signature_ok: true,
      p_provider_ref: "it-txn", p_amount_idr: order!.total_idr, p_order: order!.id, p_payload: {},
    };
    const r1 = await supabase.rpc("confirm_order_paid", args);
    const r2 = await supabase.rpc("confirm_order_paid", args);
    expect(r1.data).toBe("ok");
    expect(r2.data).toBe("duplicate");

    const { count } = await supabase
      .from("entitlements").select("id", { count: "exact", head: true }).eq("order_id", order!.id);
    expect(count).toBe(1);
  });

  it("kupon: diskon persen mengurangi total", async () => {
    // Produk stok tak terbatas (reusable_file) agar tidak terpengaruh tes stok.
    await supabase.from("products").insert({
      id: couponProductId, slug: `it-cf-${couponProductId.slice(0, 8)}`, title: "IT File",
      type: "reusable_file", status: "published", price_idr: 50000,
    });
    await supabase.from("coupons").insert({ code: couponCode, type: "percent", value: 20, active: true });

    const { data, error } = await supabase.rpc("place_order", {
      p_user: null, p_guest_email: email, p_items: [{ product_id: couponProductId, quantity: 1 }],
      p_minutes: 15, p_coupon: couponCode,
    });
    expect(error).toBeNull();
    // 50.000 - 20% = 40.000
    expect(Number((data as { total_idr: number }[])[0].total_idr)).toBe(40000);
  });
});

"use server";

import { redirect } from "next/navigation";
import { loadPrincipal } from "@modules/core/auth/session";
import { createSupabaseServerClient } from "@modules/database/supabase/server";
import { placeOrder } from "@modules/core/orders/service";

export type BuyState = { error: string | null };

/**
 * "Beli sekarang" untuk satu produk. Membuat order + reservasi stok (atomik)
 * dan mengarahkan ke halaman checkout QRIS. Status lunas TIDAK ditentukan di
 * sini — hanya lewat webhook.
 */
export async function buyNowAction(_prev: BuyState, formData: FormData): Promise<BuyState> {
  const productId = String(formData.get("product_id") ?? "");
  const emailInput = String(formData.get("email") ?? "").trim();
  const couponCode = String(formData.get("coupon") ?? "").trim() || null;
  if (!productId) return { error: "Produk tidak dikenal." };

  const principal = await loadPrincipal();
  const userId = principal.kind === "guest" ? null : principal.userId;
  const guestEmail =
    principal.kind === "guest"
      ? emailInput
      : (principal.kind === "customer" || principal.kind === "admin"
          ? principal.email
          : null) ?? emailInput;

  if (!userId && !guestEmail) {
    return { error: "Masukkan email untuk melanjutkan sebagai tamu." };
  }
  if (!userId && guestEmail && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(guestEmail)) {
    return { error: "Format email tidak valid." };
  }

  // Pastikan produk ada & published (RLS anon hanya mengembalikan published).
  const supabase = await createSupabaseServerClient();
  const { data: product } = await supabase
    .from("products")
    .select("id, status")
    .eq("id", productId)
    .maybeSingle();
  if (!product || product.status !== "published") {
    return { error: "Produk tidak tersedia." };
  }

  let orderNumber: string;
  try {
    const placed = await placeOrder({
      userId,
      guestEmail: userId ? null : guestEmail,
      items: [{ productId, quantity: 1 }],
      couponCode,
    });
    orderNumber = placed.orderNumber;
  } catch (e) {
    if (e instanceof Error && e.message === "OUT_OF_STOCK") {
      return { error: "Maaf, stok barang ini baru saja habis." };
    }
    return { error: "Gagal membuat order. Coba lagi." };
  }

  redirect(`/checkout/${orderNumber}`);
}

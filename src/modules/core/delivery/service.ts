import "server-only";

/**
 * Mesin pengiriman aman (Fase 4).
 *
 * Prinsip (SECURITY.md §11):
 * - Path asli file TIDAK pernah diekspos — hanya signed URL berumur pendek.
 * - Kredensial/aset hanya keluar SETELAH entitlement ada & order lunas.
 * - Kepemilikan diverifikasi di server (akun cocok, atau tamu cocok
 *   nomor order + email). Setiap pengiriman dicatat di download_events.
 */
import { createSupabaseAdminClient } from "@modules/database/supabase/admin";
import { decryptSecret, encryptSecret } from "../crypto/secret";
import { createSignedUrl } from "@modules/storage/supabaseStorage";
import { generateMemorablePassword } from "./password";
import type { DeliveryResult, Requester } from "./types";

export type { DeliveryResult, Requester } from "./types";

function signedUrlTtl(): number {
  const n = Number(process.env.SIGNED_URL_TTL_SECONDS ?? "300");
  return Number.isFinite(n) && n > 0 ? n : 300;
}

type EntitlementRow = {
  id: string;
  order_id: string;
  user_id: string | null;
  guest_email: string | null;
  product_id: string;
  inventory_item_id: string | null;
  status: string;
  password_encrypted: string | null;
};

/** Muat entitlement + order, lalu verifikasi hak requester. Null jika tidak berhak. */
async function authorizeEntitlement(
  entitlementId: string,
  requester: Requester,
): Promise<EntitlementRow | null> {
  const supabase = createSupabaseAdminClient();
  const { data: ent } = await supabase
    .from("entitlements")
    .select("id, order_id, user_id, guest_email, product_id, inventory_item_id, status, password_encrypted")
    .eq("id", entitlementId)
    .maybeSingle();
  if (!ent || ent.status !== "active") return null;

  const { data: order } = await supabase
    .from("orders")
    .select("order_number, guest_email, user_id, status")
    .eq("id", ent.order_id)
    .maybeSingle();
  if (!order || order.status !== "paid") return null;

  if (requester.kind === "user") {
    if (ent.user_id !== requester.userId) return null;
  } else {
    const emailOk =
      (order.guest_email ?? "").toLowerCase() === requester.email.trim().toLowerCase();
    const numberOk = order.order_number === requester.orderNumber.trim();
    if (!emailOk || !numberOk) return null;
  }
  return ent as EntitlementRow;
}

/** Kirim/tampilkan barang untuk sebuah entitlement (setelah verifikasi hak). */
export async function deliver(
  entitlementId: string,
  requester: Requester,
  ip?: string | null,
): Promise<DeliveryResult> {
  const ent = await authorizeEntitlement(entitlementId, requester);
  if (!ent) return { type: "unavailable", reason: "Tidak berhak atau order belum lunas." };

  const supabase = createSupabaseAdminClient();
  const { data: product } = await supabase
    .from("products")
    .select("type, title")
    .eq("id", ent.product_id)
    .maybeSingle();
  if (!product) return { type: "unavailable", reason: "Produk tidak ditemukan." };

  let result: DeliveryResult;

  if (product.type === "unique_credential") {
    if (!ent.inventory_item_id) return { type: "unavailable", reason: "Item tidak tertaut." };
    const { data: item } = await supabase
      .from("inventory_items")
      .select("secret_encrypted")
      .eq("id", ent.inventory_item_id)
      .maybeSingle();
    if (!item?.secret_encrypted) return { type: "unavailable", reason: "Kredensial tidak tersedia." };
    // Dekripsi hanya di sini, setelah verifikasi hak.
    result = { type: "credential", value: decryptSecret(item.secret_encrypted) };
    // Tandai terkirim (SOLD -> DELIVERED); idempoten.
    await supabase.rpc("mark_inventory_delivered", { p_item: ent.inventory_item_id });
  } else if (product.type === "protected_pdf") {
    // Password unik per pembelian — dibuat sekali, disimpan terenkripsi.
    let password: string;
    if (ent.password_encrypted) {
      password = decryptSecret(ent.password_encrypted);
    } else {
      password = generateMemorablePassword();
      await supabase
        .from("entitlements")
        .update({ password_encrypted: encryptSecret(password) })
        .eq("id", ent.id);
    }
    const file = await primaryFile(ent.product_id, ["base_pdf", "asset"]);
    if (!file) return { type: "unavailable", reason: "File PDF belum diunggah." };
    const url = await createSignedUrl(file.storage_path, signedUrlTtl());
    result = { type: "pdf", url, filename: file.filename, password };
  } else if (product.type === "reusable_file") {
    const file = await primaryFile(ent.product_id, ["asset"]);
    if (!file) return { type: "unavailable", reason: "File belum diunggah." };
    const url = await createSignedUrl(file.storage_path, signedUrlTtl());
    result = { type: "file", url, filename: file.filename };
  } else {
    return { type: "unavailable", reason: "Tipe produk ini belum didukung untuk pengiriman." };
  }

  // Catat pengiriman + tandai delivered_at + hitung unduhan.
  await supabase.from("download_events").insert({
    entitlement_id: ent.id,
    order_id: ent.order_id,
    user_id: requester.kind === "user" ? requester.userId : null,
    guest_email: requester.kind === "guest" ? requester.email : null,
    event: result.type === "credential" ? "reveal" : "download",
    ip_address: ip ?? null,
  });
  await supabase
    .from("entitlements")
    .update({
      delivered_at: new Date().toISOString(),
      download_count: await nextCount(ent.id),
    })
    .eq("id", ent.id);

  return result;
}

async function nextCount(entitlementId: string): Promise<number> {
  const supabase = createSupabaseAdminClient();
  const { data } = await supabase
    .from("entitlements")
    .select("download_count")
    .eq("id", entitlementId)
    .maybeSingle();
  return (data?.download_count ?? 0) + 1;
}

async function primaryFile(productId: string, kinds: string[]) {
  const supabase = createSupabaseAdminClient();
  const { data } = await supabase
    .from("product_files")
    .select("storage_path, filename, kind, is_primary")
    .eq("product_id", productId)
    .in("kind", kinds)
    .order("is_primary", { ascending: false })
    .order("created_at", { ascending: true });
  if (!data || data.length === 0) return null;
  // Prioritas: kind sesuai urutan yang diminta, lalu primary.
  for (const k of kinds) {
    const match = data.find((f) => f.kind === k);
    if (match) return match;
  }
  return data[0];
}

/** Daftar barang milik seorang pelanggan (untuk /account). */
export async function listUserDeliverables(userId: string) {
  const supabase = createSupabaseAdminClient();
  const { data } = await supabase
    .from("entitlements")
    .select("id, product_id, order_id, status, delivered_at, products(title, type), orders(order_number, status, created_at)")
    .eq("user_id", userId)
    .eq("status", "active")
    .order("created_at", { ascending: false });
  return (data ?? []).filter((e) => {
    const order = e.orders as unknown as { status?: string } | null;
    return order?.status === "paid";
  });
}

/** Pemulihan order tamu: cari order via nomor + email, kembalikan entitlement. */
export async function lookupGuestOrder(orderNumber: string, email: string) {
  const supabase = createSupabaseAdminClient();
  const { data: order } = await supabase
    .from("orders")
    .select("id, order_number, guest_email, status, total_idr, created_at")
    .eq("order_number", orderNumber.trim())
    .maybeSingle();
  if (!order) return null;
  if ((order.guest_email ?? "").toLowerCase() !== email.trim().toLowerCase()) return null;

  const { data: entitlements } = await supabase
    .from("entitlements")
    .select("id, product_id, status, delivered_at, products(title, type)")
    .eq("order_id", order.id)
    .eq("status", "active");

  return { order, entitlements: entitlements ?? [] };
}

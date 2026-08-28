import "server-only";

/**
 * Operasi data produk & inventory. SEMUA fungsi di sini mengasumsikan pemanggil
 * (server action / halaman) SUDAH memverifikasi izin lewat modul core/auth.
 * Memakai klien service_role; otorisasi ditegakkan di lapisan pemanggil +
 * RLS sebagai pertahanan berlapis.
 */
import { createSupabaseAdminClient } from "@modules/database/supabase/admin";
import { encryptSecret } from "../crypto/secret";
import {
  type ProductStatus,
  type ProductType,
  slugify,
} from "./types";

export type NewProductInput = {
  title: string;
  type: ProductType;
  priceIdr: number;
  status: ProductStatus;
  description?: string;
  createdBy: string | null;
};

/** Buat slug unik dari judul (menambah sufiks bila bentrok). */
async function uniqueSlug(base: string): Promise<string> {
  const supabase = createSupabaseAdminClient();
  const root = slugify(base) || "produk";
  let slug = root;
  for (let i = 2; i < 50; i++) {
    const { data } = await supabase.from("products").select("id").eq("slug", slug).maybeSingle();
    if (!data) return slug;
    slug = `${root}-${i}`;
  }
  return `${root}-${crypto.randomUUID().slice(0, 6)}`;
}

export async function createProduct(input: NewProductInput): Promise<{ id: string; slug: string }> {
  const supabase = createSupabaseAdminClient();
  const slug = await uniqueSlug(input.title);
  const { data, error } = await supabase
    .from("products")
    .insert({
      slug,
      title: input.title,
      description: input.description ?? null,
      type: input.type,
      status: input.status,
      price_idr: input.priceIdr,
      created_by: input.createdBy,
      published_at: input.status === "published" ? new Date().toISOString() : null,
    })
    .select("id, slug")
    .single();
  if (error || !data) throw new Error(`Gagal membuat produk: ${error?.message}`);
  return { id: data.id, slug: data.slug };
}

export async function listProducts() {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("products")
    .select("id, slug, title, type, status, price_idr, created_at")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getProduct(id: string) {
  const supabase = createSupabaseAdminClient();
  const [{ data: product }, { data: files }, { data: items }] = await Promise.all([
    supabase.from("products").select("*").eq("id", id).maybeSingle(),
    supabase.from("product_files").select("*").eq("product_id", id).order("created_at"),
    supabase
      .from("inventory_items")
      .select("id, status, label, created_at")
      .eq("product_id", id)
      .order("created_at"),
  ]);
  return { product, files: files ?? [], items: items ?? [] };
}

export async function setProductStatus(id: string, status: ProductStatus): Promise<void> {
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase
    .from("products")
    .update({
      status,
      published_at: status === "published" ? new Date().toISOString() : null,
    })
    .eq("id", id);
  if (error) throw new Error(error.message);
}

export async function addProductFileRecord(input: {
  productId: string;
  kind: "asset" | "preview" | "base_pdf";
  storagePath: string;
  filename: string;
  contentType: string;
  sizeBytes: number;
}): Promise<void> {
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("product_files").insert({
    product_id: input.productId,
    kind: input.kind,
    storage_path: input.storagePath,
    filename: input.filename,
    content_type: input.contentType,
    size_bytes: input.sizeBytes,
  });
  if (error) throw new Error(error.message);
}

/** Label non-sensitif untuk ditampilkan ke admin (kredensial tetap terenkripsi). */
export function maskLabel(line: string): string {
  const trimmed = line.trim();
  if (trimmed.length <= 4) return "••••";
  return `${trimmed.slice(0, 3)}••••${trimmed.slice(-2)}`;
}

/**
 * Tambah kredensial unik (bulk). Tiap baris = satu item. Nilai DIENKRIPSI
 * sebelum disimpan; hanya label tersamar yang bisa dilihat admin.
 * Mengembalikan jumlah item yang ditambahkan.
 */
export async function addCredentials(input: {
  productId: string;
  createdBy: string | null;
  lines: string[];
}): Promise<number> {
  const supabase = createSupabaseAdminClient();
  const rows = input.lines
    .map((l) => l.trim())
    .filter((l) => l.length > 0)
    .map((line) => ({
      product_id: input.productId,
      status: "AVAILABLE" as const,
      secret_encrypted: encryptSecret(line),
      label: maskLabel(line),
      created_by: input.createdBy,
    }));
  if (rows.length === 0) return 0;
  const { error } = await supabase.from("inventory_items").insert(rows);
  if (error) throw new Error(error.message);
  return rows.length;
}

/** Cabut satu item inventory (AVAILABLE/RESERVED -> REVOKED) lewat fungsi mesin. */
export async function revokeInventoryItem(itemId: string): Promise<boolean> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase.rpc("revoke_inventory_item", { p_item: itemId });
  if (error) throw new Error(error.message);
  return Boolean(data);
}

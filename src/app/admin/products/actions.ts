"use server";

/**
 * Server action produk & inventory. Setiap aksi DITEGAKKAN di server lewat
 * assertPermission sebelum menyentuh data.
 */
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { assertPermission, AuthorizationError } from "@modules/core/auth/principal";
import { loadPrincipal } from "@modules/core/auth/session";
import { logAudit } from "@modules/core/audit/log";
import {
  addCredentials,
  addProductFileRecord,
  createProduct,
  revokeInventoryItem,
  setProductCover,
  setProductStatus,
} from "@modules/core/products/service";
import { isProductStatus, isProductType } from "@modules/core/products/types";
import {
  buildCoverPath,
  buildProductFilePath,
  uploadCover,
  uploadProductFile,
} from "@modules/storage/supabaseStorage";

export type ProductFormState = { error: string | null };

async function requirePerm(perm: Parameters<typeof assertPermission>[1]) {
  const principal = await loadPrincipal();
  assertPermission(principal, perm);
  return principal;
}

/** Buat produk baru (butuh products.manage). */
export async function createProductAction(
  _prev: ProductFormState,
  formData: FormData,
): Promise<ProductFormState> {
  let principal;
  try {
    principal = await requirePerm("products.manage");
  } catch (e) {
    if (e instanceof AuthorizationError) return { error: "Tidak berwenang membuat produk." };
    throw e;
  }

  const title = String(formData.get("title") ?? "").trim();
  const type = String(formData.get("type") ?? "");
  const status = String(formData.get("status") ?? "draft");
  const priceRaw = String(formData.get("price_idr") ?? "0").replace(/[^0-9]/g, "");
  const description = String(formData.get("description") ?? "").trim();

  if (!title) return { error: "Judul wajib diisi." };
  if (!isProductType(type)) return { error: "Tipe produk tidak valid." };
  if (!isProductStatus(status)) return { error: "Status tidak valid." };
  const priceIdr = Number(priceRaw || "0");
  if (!Number.isFinite(priceIdr) || priceIdr < 0) return { error: "Harga tidak valid." };

  const created = await createProduct({
    title,
    type,
    priceIdr,
    status,
    description: description || undefined,
    createdBy: principal.userId,
  });

  await logAudit({
    actorId: principal.userId,
    actorRole: principal.role,
    action: "product.create",
    targetType: "product",
    targetId: created.id,
    metadata: { type, status, priceIdr },
  });

  redirect(`/admin/products/${created.id}`);
}

/** Ubah status publikasi produk (butuh products.manage). */
export async function setStatusAction(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");
  if (!isProductStatus(status)) return;

  const principal = await requirePerm("products.manage");
  await setProductStatus(id, status);
  await logAudit({
    actorId: principal.userId,
    actorRole: principal.role,
    action: "product.status.change",
    targetType: "product",
    targetId: id,
    metadata: { status },
  });
  revalidatePath(`/admin/products/${id}`);
}

/** Unggah file produk (butuh products.manage). */
export async function uploadFileAction(
  _prev: ProductFormState,
  formData: FormData,
): Promise<ProductFormState> {
  let principal;
  try {
    principal = await requirePerm("products.manage");
  } catch (e) {
    if (e instanceof AuthorizationError) return { error: "Tidak berwenang mengunggah file." };
    throw e;
  }

  const productId = String(formData.get("product_id") ?? "");
  const kindRaw = String(formData.get("kind") ?? "asset");
  const kind = (["asset", "preview", "base_pdf"].includes(kindRaw) ? kindRaw : "asset") as
    | "asset"
    | "preview"
    | "base_pdf";
  const file = formData.get("file");

  if (!productId) return { error: "Produk tidak dikenal." };
  if (!(file instanceof File) || file.size === 0) return { error: "Pilih file dulu." };
  if (file.size > 50 * 1024 * 1024) return { error: "Ukuran file maksimal 50 MB." };

  const path = buildProductFilePath(productId, file.name);
  const bytes = await file.arrayBuffer();
  await uploadProductFile(path, bytes, file.type || "application/octet-stream");
  await addProductFileRecord({
    productId,
    kind,
    storagePath: path,
    filename: file.name,
    contentType: file.type || "application/octet-stream",
    sizeBytes: file.size,
  });

  await logAudit({
    actorId: principal.userId,
    actorRole: principal.role,
    action: "product.file.upload",
    targetType: "product",
    targetId: productId,
    metadata: { kind, filename: file.name, size: file.size },
  });

  revalidatePath(`/admin/products/${productId}`);
  return { error: null };
}

/** Unggah gambar cover PUBLIK produk (butuh products.manage). */
export async function uploadCoverAction(
  _prev: ProductFormState,
  formData: FormData,
): Promise<ProductFormState> {
  let principal;
  try {
    principal = await requirePerm("products.manage");
  } catch (e) {
    if (e instanceof AuthorizationError) return { error: "Tidak berwenang." };
    throw e;
  }

  const productId = String(formData.get("product_id") ?? "");
  const file = formData.get("cover");
  if (!productId) return { error: "Produk tidak dikenal." };
  if (!(file instanceof File) || file.size === 0) return { error: "Pilih gambar dulu." };
  if (!file.type.startsWith("image/")) return { error: "File harus berupa gambar." };
  if (file.size > 5 * 1024 * 1024) return { error: "Ukuran gambar maksimal 5 MB." };

  const path = buildCoverPath(productId, file.name);
  await uploadCover(path, await file.arrayBuffer(), file.type);
  await setProductCover(productId, path);

  await logAudit({
    actorId: principal.userId,
    actorRole: principal.role,
    action: "product.cover.upload",
    targetType: "product",
    targetId: productId,
    metadata: { filename: file.name },
  });

  revalidatePath(`/admin/products/${productId}`);
  return { error: null };
}

/** Tambah kredensial unik (bulk) — butuh inventory.manage. */
export async function addCredentialsAction(
  _prev: ProductFormState,
  formData: FormData,
): Promise<ProductFormState> {
  let principal;
  try {
    principal = await requirePerm("inventory.manage");
  } catch (e) {
    if (e instanceof AuthorizationError) return { error: "Tidak berwenang menambah stok." };
    throw e;
  }

  const productId = String(formData.get("product_id") ?? "");
  const raw = String(formData.get("credentials") ?? "");
  const lines = raw.split(/\r?\n/);
  if (!productId) return { error: "Produk tidak dikenal." };

  const count = await addCredentials({ productId, createdBy: principal.userId, lines });
  if (count === 0) return { error: "Tidak ada kredensial yang ditambahkan." };

  await logAudit({
    actorId: principal.userId,
    actorRole: principal.role,
    action: "inventory.add",
    targetType: "product",
    targetId: productId,
    metadata: { count },
  });

  revalidatePath(`/admin/products/${productId}`);
  return { error: null };
}

/** Cabut satu item inventory (butuh inventory.manage). */
export async function revokeItemAction(formData: FormData): Promise<void> {
  const itemId = String(formData.get("item_id") ?? "");
  const productId = String(formData.get("product_id") ?? "");
  if (!itemId) return;
  const principal = await requirePerm("inventory.manage");
  const ok = await revokeInventoryItem(itemId);
  await logAudit({
    actorId: principal.userId,
    actorRole: principal.role,
    action: "inventory.revoke",
    targetType: "inventory_item",
    targetId: itemId,
    metadata: { ok },
  });
  if (productId) revalidatePath(`/admin/products/${productId}`);
}

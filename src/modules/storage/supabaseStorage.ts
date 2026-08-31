import "server-only";

/**
 * Adapter penyimpanan file di atas Supabase Storage (bucket privat).
 *
 * Prinsip (SECURITY.md §11): path asli TIDAK diekspos; akses file hanya lewat
 * signed URL berumur pendek. Upload dilakukan server dengan service_role.
 *
 * Pengiriman aman ke pelanggan (cek entitlement) dibangun Fase 4; di sini baru
 * primitif upload + signed URL yang dipakai admin.
 */
import { createSupabaseAdminClient } from "@modules/database/supabase/admin";

export const PRODUCT_FILES_BUCKET = "product-files";
export const PRODUCT_COVERS_BUCKET = "product-covers";

/** Default masa berlaku signed URL: 5 menit. */
export const DEFAULT_SIGNED_URL_TTL_SECONDS = 300;

export type UploadResult = {
  path: string;
  size: number;
  contentType: string;
};

/** Buat path penyimpanan yang rapi & unik untuk sebuah produk. */
export function buildProductFilePath(productId: string, filename: string): string {
  const safe = filename.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 120);
  return `products/${productId}/${crypto.randomUUID()}-${safe}`;
}

/** Unggah file ke bucket privat. Mengembalikan path tersimpan. */
export async function uploadProductFile(
  path: string,
  data: ArrayBuffer | Uint8Array,
  contentType: string,
): Promise<UploadResult> {
  const supabase = createSupabaseAdminClient();
  const body = data instanceof Uint8Array ? data : new Uint8Array(data);
  const { error } = await supabase.storage.from(PRODUCT_FILES_BUCKET).upload(path, body, {
    contentType,
    upsert: false,
  });
  if (error) throw new Error(`Gagal upload file: ${error.message}`);
  return { path, size: body.byteLength, contentType };
}

/** Buat signed URL berumur pendek untuk mengunduh file (tanpa membocorkan path). */
export async function createSignedUrl(
  path: string,
  expiresIn: number = DEFAULT_SIGNED_URL_TTL_SECONDS,
): Promise<string> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase.storage
    .from(PRODUCT_FILES_BUCKET)
    .createSignedUrl(path, expiresIn);
  if (error || !data) throw new Error(`Gagal membuat signed URL: ${error?.message}`);
  return data.signedUrl;
}

/** Path cover unik untuk sebuah produk (di bucket publik). */
export function buildCoverPath(productId: string, filename: string): string {
  const safe = filename.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 80);
  return `${productId}/${crypto.randomUUID()}-${safe}`;
}

/** Unggah cover ke bucket PUBLIK. Mengembalikan path tersimpan. */
export async function uploadCover(
  path: string,
  data: ArrayBuffer | Uint8Array,
  contentType: string,
): Promise<UploadResult> {
  const supabase = createSupabaseAdminClient();
  const body = data instanceof Uint8Array ? data : new Uint8Array(data);
  const { error } = await supabase.storage.from(PRODUCT_COVERS_BUCKET).upload(path, body, {
    contentType,
    upsert: true,
  });
  if (error) throw new Error(`Gagal upload cover: ${error.message}`);
  return { path, size: body.byteLength, contentType };
}

/** Hapus file (mis. saat mengganti aset). */
export async function removeProductFile(path: string): Promise<void> {
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.storage.from(PRODUCT_FILES_BUCKET).remove([path]);
  if (error) throw new Error(`Gagal menghapus file: ${error.message}`);
}

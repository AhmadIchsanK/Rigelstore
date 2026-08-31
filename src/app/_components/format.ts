export function rupiah(n: number | string): string {
  return "Rp" + Number(n).toLocaleString("id-ID");
}

export const PRODUCT_TYPE_LABEL: Record<string, string> = {
  reusable_file: "File digital",
  unique_credential: "Kredensial unik",
  protected_pdf: "PDF terproteksi",
  bundle: "Bundle",
};

/** Gradient cover deterministik dari teks (lembut, sesuai brand). */
export function coverColor(seed: string): string {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) % 360;
  const h2 = (h + 35) % 360;
  return `linear-gradient(135deg, hsl(${h} 62% 62%), hsl(${h2} 60% 52%))`;
}

/** URL publik gambar cover dari path storage (bucket publik product-covers). */
export function coverUrl(path?: string | null): string | null {
  if (!path) return null;
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!base) return null;
  return `${base}/storage/v1/object/public/product-covers/${path}`;
}

/** Chip kelas berdasarkan tipe produk (warna tinted). */
export function typeChipClass(type: string): string {
  if (type === "protected_pdf") return "chip chip-cream";
  if (type === "unique_credential") return "chip chip-mint";
  return "chip chip-sky";
}

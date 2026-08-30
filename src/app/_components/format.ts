export function rupiah(n: number | string): string {
  return "Rp" + Number(n).toLocaleString("id-ID");
}

export const PRODUCT_TYPE_LABEL: Record<string, string> = {
  reusable_file: "File digital",
  unique_credential: "Kredensial unik",
  protected_pdf: "PDF terproteksi",
  bundle: "Bundle",
};

/** Warna cover deterministik dari teks (agar tiap produk konsisten). */
export function coverColor(seed: string): string {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) % 360;
  return `hsl(${h} 55% 55%)`;
}

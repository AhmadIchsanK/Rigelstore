import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@modules/database/supabase/server";
import { loadPrincipal } from "@modules/core/auth/session";
import { PRODUCT_TYPE_LABEL, coverColor, coverUrl, rupiah, typeChipClass } from "../../_components/format";
import { BuyBox } from "./BuyBox";

export const dynamic = "force-dynamic";

async function fetchProduct(slug: string) {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("products")
    .select("id, title, description, type, price_idr, status, cover_path")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();
  return data;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await fetchProduct(slug);
  if (!product) return { title: "Produk tidak ditemukan" };
  return {
    title: product.title,
    description: product.description?.slice(0, 150) ?? `Beli ${product.title} di RigelStore.`,
    openGraph: { title: product.title, type: "website" },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await fetchProduct(slug);
  if (!product) notFound();

  const principal = await loadPrincipal();
  const loggedIn = principal.kind !== "guest";
  const initial = product.title.trim().charAt(0).toUpperCase() || "R";

  return (
    <main className="container page">
      <div style={{ display: "grid", gap: 28, gridTemplateColumns: "minmax(0,1fr)", maxWidth: 860 }}>
        <div
          className="card"
          style={{ overflow: "hidden", display: "grid", gridTemplateColumns: "1fr", gap: 0 }}
        >
          {coverUrl(product.cover_path) ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={coverUrl(product.cover_path)!}
              alt={product.title}
              style={{ width: "100%", aspectRatio: "16 / 7", objectFit: "cover", display: "block" }}
            />
          ) : (
            <div
              className="cover"
              style={{ background: coverColor(product.title), aspectRatio: "16 / 6", fontSize: 56, margin: 0, borderRadius: 0 }}
            >
              {initial}
            </div>
          )}
          <div className="card-pad">
            <span className={typeChipClass(product.type)}>
              {PRODUCT_TYPE_LABEL[product.type] ?? product.type}
            </span>
            <h1 style={{ fontSize: 28, margin: "10px 0 6px" }}>{product.title}</h1>
            <div className="price" style={{ fontSize: 26 }}>
              {rupiah(product.price_idr)}
            </div>
            {product.description && (
              <p style={{ color: "#374151", whiteSpace: "pre-wrap", marginTop: 12 }}>
                {product.description}
              </p>
            )}
            <div style={{ marginTop: 20 }}>
              <BuyBox productId={product.id} loggedIn={loggedIn} />
            </div>
            <p className="muted" style={{ fontSize: 13, marginTop: 14 }}>
              Pembayaran via QRIS. Barang dikirim otomatis setelah pembayaran
              terkonfirmasi gateway.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

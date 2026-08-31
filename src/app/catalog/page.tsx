import { createSupabaseServerClient } from "@modules/database/supabase/server";
import { ProductCard } from "../_components/ProductCard";

export const metadata = {
  title: "Katalog",
  description: "Semua produk digital RigelStore — file, kredensial, dan PDF terproteksi.",
};
export const dynamic = "force-dynamic";

export default async function CatalogPage() {
  const supabase = await createSupabaseServerClient();
  const { data: products } = await supabase
    .from("products")
    .select("id, slug, title, type, price_idr, cover_path")
    .eq("status", "published")
    .order("created_at", { ascending: false });

  return (
    <main className="container page">
      <h1 style={{ fontSize: 28, marginBottom: 4 }}>Katalog</h1>
      <p className="muted" style={{ marginTop: 0 }}>
        {products?.length ? `${products.length} produk tersedia` : "Jelajahi produk digital kami"}
      </p>

      {!products || products.length === 0 ? (
        <div className="empty">Belum ada produk yang tersedia.</div>
      ) : (
        <div className="grid" style={{ marginTop: 16 }}>
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </main>
  );
}

/**
 * Beranda. Fase 5: hero + produk terbaru (mobile-first, terlihat seperti toko
 * normal yang terpercaya — bukan dashboard AI).
 */
import Link from "next/link";
import { createSupabaseServerClient } from "@modules/database/supabase/server";
import { ProductCard } from "./_components/ProductCard";

export const dynamic = "force-dynamic";

export default async function Home() {
  const supabase = await createSupabaseServerClient();
  const { data: products } = await supabase
    .from("products")
    .select("id, slug, title, type, price_idr")
    .eq("status", "published")
    .order("created_at", { ascending: false })
    .limit(8);

  return (
    <main className="container page">
      <section className="hero">
        <h1>Produk digital, langsung cair setelah bayar.</h1>
        <p>
          File, kredensial, dan PDF terproteksi. Bayar via QRIS, barang dikirim
          otomatis dan aman.
        </p>
        <div className="cta-row">
          <Link href="/catalog" className="btn btn-primary">
            Lihat katalog
          </Link>
          <Link href="/orders/lookup" className="btn">
            Lacak order
          </Link>
        </div>
      </section>

      <section style={{ marginTop: 36 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
          <h2 style={{ fontSize: 20 }}>Produk terbaru</h2>
          <Link href="/catalog">Semua produk →</Link>
        </div>
        {!products || products.length === 0 ? (
          <div className="empty">Belum ada produk. Cek lagi nanti ya.</div>
        ) : (
          <div className="grid" style={{ marginTop: 12 }}>
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

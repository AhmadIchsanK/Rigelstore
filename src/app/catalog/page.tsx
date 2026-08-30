import Link from "next/link";
import { createSupabaseServerClient } from "@modules/database/supabase/server";

export const metadata = { title: "Katalog — RigelStore" };
export const dynamic = "force-dynamic";

function rupiah(n: number) {
  return "Rp" + Number(n).toLocaleString("id-ID");
}

/**
 * Katalog publik sederhana (Fase 3). Tampilan penuh (mobile-first) dibangun
 * Fase 5. Hanya produk 'published' yang tampil (ditegakkan RLS).
 */
export default async function CatalogPage() {
  const supabase = await createSupabaseServerClient();
  const { data: products } = await supabase
    .from("products")
    .select("id, slug, title, type, price_idr")
    .eq("status", "published")
    .order("created_at", { ascending: false });

  return (
    <main style={{ maxWidth: 820, margin: "0 auto", padding: "40px 24px" }}>
      <Link href="/" style={{ color: "var(--muted)", textDecoration: "none" }}>
        ← Beranda
      </Link>
      <h1 style={{ color: "var(--brand)" }}>Katalog</h1>

      {!products || products.length === 0 ? (
        <p style={{ color: "var(--muted)" }}>Belum ada produk yang tersedia.</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0, display: "grid", gap: 12 }}>
          {products.map((p) => (
            <li
              key={p.id}
              style={{
                border: "1px solid #e5e7eb",
                borderRadius: 12,
                padding: 16,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <Link href={`/p/${p.slug}`} style={{ fontWeight: 600 }}>
                  {p.title}
                </Link>
                <div style={{ color: "var(--muted)", fontSize: 14 }}>{p.type}</div>
              </div>
              <div style={{ fontWeight: 700 }}>{rupiah(p.price_idr)}</div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}

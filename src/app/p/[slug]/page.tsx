import Link from "next/link";
import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@modules/database/supabase/server";
import { loadPrincipal } from "@modules/core/auth/session";
import { BuyBox } from "./BuyBox";

export const dynamic = "force-dynamic";

function rupiah(n: number) {
  return "Rp" + Number(n).toLocaleString("id-ID");
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createSupabaseServerClient();
  const { data: product } = await supabase
    .from("products")
    .select("id, title, description, type, price_idr, status")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  if (!product) notFound();

  const principal = await loadPrincipal();
  const loggedIn = principal.kind !== "guest";

  return (
    <main style={{ maxWidth: 680, margin: "0 auto", padding: "40px 24px" }}>
      <Link href="/catalog" style={{ color: "var(--muted)", textDecoration: "none" }}>
        ← Katalog
      </Link>
      <h1 style={{ color: "var(--brand)", marginBottom: 4 }}>{product.title}</h1>
      <div style={{ fontSize: 22, fontWeight: 800, margin: "8px 0" }}>
        {rupiah(product.price_idr)}
      </div>
      {product.description && (
        <p style={{ color: "#374151", whiteSpace: "pre-wrap" }}>{product.description}</p>
      )}

      <div style={{ marginTop: 24 }}>
        <BuyBox productId={product.id} loggedIn={loggedIn} />
      </div>

      <p style={{ color: "var(--muted)", fontSize: 13, marginTop: 16 }}>
        Pembayaran via QRIS. Barang dikirim otomatis setelah pembayaran
        terkonfirmasi oleh gateway.
      </p>
    </main>
  );
}

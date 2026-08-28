import Link from "next/link";
import { requirePagePermission } from "../guard";
import { Forbidden } from "../Forbidden";
import { listProducts } from "@modules/core/products/service";

export const metadata = { title: "Produk — Admin RigelStore" };
export const dynamic = "force-dynamic";

const TYPE_LABEL: Record<string, string> = {
  reusable_file: "File reusable",
  unique_credential: "Kredensial unik",
  protected_pdf: "PDF terproteksi",
  bundle: "Bundle",
};

function rupiah(n: number) {
  return "Rp" + n.toLocaleString("id-ID");
}

export default async function ProductsPage() {
  const guard = await requirePagePermission("products.manage");
  if (guard.denied) return <Forbidden note="Butuh izin kelola produk (products.manage)." />;

  const products = await listProducts();

  return (
    <main style={{ maxWidth: 880, margin: "0 auto", padding: "40px 24px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <Link href="/admin" style={{ color: "var(--muted)", textDecoration: "none" }}>
            ← Panel admin
          </Link>
          <h1 style={{ margin: "4px 0", color: "var(--brand)" }}>Produk</h1>
        </div>
        <Link
          href="/admin/products/new"
          style={{
            padding: "10px 14px",
            borderRadius: 8,
            background: "var(--brand)",
            color: "#fff",
            textDecoration: "none",
            fontWeight: 600,
          }}
        >
          + Produk baru
        </Link>
      </div>

      {products.length === 0 ? (
        <p style={{ color: "var(--muted)", marginTop: 24 }}>
          Belum ada produk. Klik “Produk baru” untuk membuat yang pertama.
        </p>
      ) : (
        <table style={{ width: "100%", marginTop: 24, borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ textAlign: "left", borderBottom: "2px solid #e5e7eb" }}>
              <th style={{ padding: "8px 6px" }}>Judul</th>
              <th style={{ padding: "8px 6px" }}>Tipe</th>
              <th style={{ padding: "8px 6px" }}>Status</th>
              <th style={{ padding: "8px 6px" }}>Harga</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} style={{ borderBottom: "1px solid #f0f0f0" }}>
                <td style={{ padding: "8px 6px" }}>
                  <Link href={`/admin/products/${p.id}`}>{p.title}</Link>
                </td>
                <td style={{ padding: "8px 6px" }}>{TYPE_LABEL[p.type] ?? p.type}</td>
                <td style={{ padding: "8px 6px" }}>{p.status}</td>
                <td style={{ padding: "8px 6px" }}>{rupiah(p.price_idr)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  );
}

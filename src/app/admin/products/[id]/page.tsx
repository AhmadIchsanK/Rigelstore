import Link from "next/link";
import { notFound } from "next/navigation";
import { requirePagePermission } from "../../guard";
import { Forbidden } from "../../Forbidden";
import { getProduct } from "@modules/core/products/service";
import { usesUniqueInventory, type ProductType } from "@modules/core/products/types";
import { can } from "@modules/core/auth/principal";
import { setStatusAction, revokeItemAction } from "../actions";
import { FileUploadForm } from "./FileUploadForm";
import { CredentialsForm } from "./CredentialsForm";
import { CoverForm } from "./CoverForm";
import { coverUrl } from "../../../_components/format";

export const metadata = { title: "Detail produk — Admin RigelStore" };
export const dynamic = "force-dynamic";

const box: React.CSSProperties = {
  marginTop: 20,
  padding: 18,
  border: "1px solid #e5e7eb",
  borderRadius: 12,
};

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const guard = await requirePagePermission("products.manage");
  if (guard.denied) return <Forbidden note="Butuh izin kelola produk (products.manage)." />;

  const { product, files, items } = await getProduct(id);
  if (!product) notFound();

  const type = product.type as ProductType;
  const isUnique = usesUniqueInventory(type);
  const available = items.filter((i) => i.status === "AVAILABLE").length;
  const canInventory = can(guard.principal, "inventory.manage");

  return (
    <main style={{ maxWidth: 820, margin: "0 auto", padding: "40px 24px" }}>
      <Link href="/admin/products" style={{ color: "var(--muted)", textDecoration: "none" }}>
        ← Daftar produk
      </Link>
      <h1 style={{ color: "var(--brand)", marginBottom: 4 }}>{product.title}</h1>
      <p style={{ color: "var(--muted)", marginTop: 0 }}>
        Tipe: {type} · Harga: Rp{Number(product.price_idr).toLocaleString("id-ID")} · Status:{" "}
        <strong>{product.status}</strong>
      </p>

      {/* Status publikasi */}
      <section style={box}>
        <strong>Status publikasi</strong>
        <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
          {(["draft", "published", "archived"] as const).map((s) => (
            <form action={setStatusAction} key={s}>
              <input type="hidden" name="id" value={product.id} />
              <input type="hidden" name="status" value={s} />
              <button
                disabled={product.status === s}
                style={{
                  padding: "6px 12px",
                  borderRadius: 8,
                  border: "1px solid #d1d5db",
                  cursor: product.status === s ? "default" : "pointer",
                  background: product.status === s ? "#e5e7eb" : "#fff",
                }}
              >
                {s}
              </button>
            </form>
          ))}
        </div>
      </section>

      {/* Cover publik */}
      <section style={box}>
        <strong>Cover produk (gambar publik)</strong>
        <p style={{ color: "var(--muted)", marginTop: 4 }}>
          Gambar ini tampil di katalog & halaman produk. Bukan file rahasia.
        </p>
        {coverUrl(product.cover_path) && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={coverUrl(product.cover_path)!}
            alt="Cover"
            style={{ width: 220, borderRadius: 12, marginBottom: 12, display: "block" }}
          />
        )}
        <CoverForm productId={product.id} />
      </section>

      {/* File produk */}
      <section style={box}>
        <strong>File produk ({files.length})</strong>
        {files.length > 0 && (
          <ul style={{ marginTop: 8 }}>
            {files.map((f) => (
              <li key={f.id}>
                <code>{f.kind}</code> — {f.filename}{" "}
                <span style={{ color: "var(--muted)" }}>
                  ({Math.round((Number(f.size_bytes) || 0) / 1024)} KB)
                </span>
              </li>
            ))}
          </ul>
        )}
        <div style={{ marginTop: 12 }}>
          <FileUploadForm productId={product.id} allowBasePdf={type === "protected_pdf"} />
        </div>
      </section>

      {/* Inventory (hanya untuk kredensial unik) */}
      {isUnique ? (
        <section style={box}>
          <strong>
            Stok kredensial unik — {available} tersedia / {items.length} total
          </strong>
          {!canInventory && (
            <p style={{ color: "#b91c1c" }}>
              Akun ini tidak punya izin inventory.manage untuk menambah/mencabut stok.
            </p>
          )}
          {canInventory && (
            <div style={{ marginTop: 12 }}>
              <CredentialsForm productId={product.id} />
            </div>
          )}

          {items.length > 0 && (
            <table style={{ width: "100%", marginTop: 16, borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ textAlign: "left", borderBottom: "2px solid #e5e7eb" }}>
                  <th style={{ padding: "6px" }}>Label (tersamar)</th>
                  <th style={{ padding: "6px" }}>Status</th>
                  <th style={{ padding: "6px" }}></th>
                </tr>
              </thead>
              <tbody>
                {items.map((it) => (
                  <tr key={it.id} style={{ borderBottom: "1px solid #f0f0f0" }}>
                    <td style={{ padding: "6px", fontFamily: "monospace" }}>{it.label}</td>
                    <td style={{ padding: "6px" }}>{it.status}</td>
                    <td style={{ padding: "6px" }}>
                      {canInventory && (it.status === "AVAILABLE" || it.status === "RESERVED") && (
                        <form action={revokeItemAction}>
                          <input type="hidden" name="item_id" value={it.id} />
                          <input type="hidden" name="product_id" value={product.id} />
                          <button
                            style={{
                              padding: "4px 8px",
                              borderRadius: 6,
                              border: "1px solid #d1d5db",
                              cursor: "pointer",
                            }}
                          >
                            Cabut
                          </button>
                        </form>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      ) : (
        <section style={box}>
          <strong>Stok</strong>
          <p style={{ color: "var(--muted)", marginBottom: 0 }}>
            Tipe ini berstok tak terbatas — tidak memakai inventory kredensial unik.
            {type === "protected_pdf" &&
              " Password unik dibuat otomatis per pembelian (Fase 3)."}
          </p>
        </section>
      )}
    </main>
  );
}

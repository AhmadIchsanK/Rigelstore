import Link from "next/link";
import { requirePagePermission } from "../../guard";
import { Forbidden } from "../../Forbidden";
import { NewProductForm } from "../NewProductForm";

export const metadata = { title: "Produk baru — Admin RigelStore" };
export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  const guard = await requirePagePermission("products.manage");
  if (guard.denied) return <Forbidden note="Butuh izin kelola produk (products.manage)." />;

  return (
    <main style={{ maxWidth: 640, margin: "0 auto", padding: "40px 24px" }}>
      <Link href="/admin/products" style={{ color: "var(--muted)", textDecoration: "none" }}>
        ← Daftar produk
      </Link>
      <h1 style={{ color: "var(--brand)" }}>Produk baru</h1>
      <p style={{ color: "var(--muted)" }}>
        Untuk kredensial unik, tambahkan stok di halaman detail setelah produk dibuat.
      </p>
      <NewProductForm />
    </main>
  );
}

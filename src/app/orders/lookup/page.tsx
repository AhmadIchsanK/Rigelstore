import Link from "next/link";
import { LookupClient } from "./LookupClient";

export const metadata = { title: "Lacak order — RigelStore" };
export const dynamic = "force-dynamic";

export default function LookupPage() {
  return (
    <main style={{ maxWidth: 560, margin: "0 auto", padding: "40px 24px" }}>
      <Link href="/" style={{ color: "var(--muted)", textDecoration: "none" }}>
        ← Beranda
      </Link>
      <h1 style={{ color: "var(--brand)" }}>Lacak order (tamu)</h1>
      <p style={{ color: "var(--muted)" }}>
        Beli tanpa akun? Masukkan nomor order dan email untuk mengambil kembali
        barangmu.
      </p>
      <LookupClient />
    </main>
  );
}

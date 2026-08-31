import { LookupClient } from "./LookupClient";

export const metadata = { title: "Lacak order — RigelStore" };
export const dynamic = "force-dynamic";

export default function LookupPage() {
  return (
    <main className="container page" style={{ maxWidth: 620 }}>
      <h1>Lacak order (tamu)</h1>
      <p style={{ color: "var(--muted)" }}>
        Beli tanpa akun? Masukkan nomor order dan email untuk mengambil kembali
        barangmu.
      </p>
      <LookupClient />
    </main>
  );
}

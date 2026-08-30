import Link from "next/link";

/** Tampilan 403 standar untuk halaman admin (tanpa membocorkan konten). */
export function Forbidden({ note }: { note?: string }) {
  return (
    <main style={{ maxWidth: 560, margin: "0 auto", padding: "48px 24px" }}>
      <h1 style={{ color: "#b91c1c" }}>403 — Akses ditolak</h1>
      <p>{note ?? "Akun ini tidak memiliki izin untuk membuka halaman ini."}</p>
      <Link href="/admin">← Kembali ke panel admin</Link>
    </main>
  );
}

import Link from "next/link";

export default function NotFound() {
  return (
    <main className="container page">
      <div className="empty">
        <h1 style={{ fontSize: 28 }}>Halaman tidak ditemukan</h1>
        <p>Maaf, halaman yang kamu cari tidak ada.</p>
        <Link href="/" className="btn btn-primary" style={{ marginTop: 8 }}>
          Kembali ke beranda
        </Link>
      </div>
    </main>
  );
}

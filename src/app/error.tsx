"use client";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="container page">
      <div className="empty">
        <h1 style={{ fontSize: 26 }}>Terjadi kesalahan</h1>
        <p>Maaf, ada yang tidak beres. Coba muat ulang halaman.</p>
        <button className="btn btn-primary" style={{ marginTop: 8 }} onClick={() => reset()}>
          Coba lagi
        </button>
      </div>
    </main>
  );
}

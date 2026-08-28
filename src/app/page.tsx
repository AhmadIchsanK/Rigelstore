/**
 * Halaman placeholder Fase 0.
 *
 * BELUM ada fitur toko (produk, checkout, pembayaran, dsb). Halaman ini hanya
 * menandai bahwa fondasi proyek sudah berdiri dan dapat berjalan lokal.
 * Storefront asli dibangun mulai Fase 5 (UI) di atas core commerce (Fase 1–4).
 */
export default function Home() {
  return (
    <main
      style={{
        maxWidth: 720,
        margin: "0 auto",
        padding: "48px 24px",
      }}
    >
      <h1 style={{ color: "var(--brand)", marginBottom: 8 }}>RigelStore</h1>
      <p style={{ color: "var(--muted)", marginTop: 0 }}>
        Toko produk digital — website + Telegram, pembayaran QRIS otomatis.
      </p>

      <section
        style={{
          marginTop: 32,
          padding: 20,
          border: "1px solid #e5e7eb",
          borderRadius: 12,
        }}
      >
        <strong>Status: Fase 0 — Fondasi &amp; Dokumentasi</strong>
        <p style={{ marginBottom: 0 }}>
          Fondasi proyek dan dokumen spesifikasi sudah disiapkan. Fitur toko
          (login, produk, checkout, pembayaran, pengiriman) dibangun pada fase
          berikutnya. Lihat berkas dokumentasi di root repo untuk detail
          rencana.
        </p>
      </section>
    </main>
  );
}

/**
 * Beranda — sesuai design "Playful Professionalism".
 * Hero + Latest Arrivals (list) + Scan.Pay.Download + footer (di layout).
 */
import Link from "next/link";
import { createSupabaseServerClient } from "@modules/database/supabase/server";
import { ProductListCard } from "./_components/ProductCard";
import { Icon } from "./_components/Icon";

export const dynamic = "force-dynamic";

export default async function Home() {
  const supabase = await createSupabaseServerClient();
  const { data: products } = await supabase
    .from("products")
    .select("id, slug, title, type, price_idr, description")
    .eq("status", "published")
    .order("created_at", { ascending: false })
    .limit(4);

  return (
    <main>
      {/* Hero */}
      <section className="container hero">
        <h1>
          Produk Digital Premium.
          <br />
          <span className="accent">
            Kirim Instan.
            <svg viewBox="0 0 100 12" preserveAspectRatio="none">
              <path d="M0,10 Q50,0 100,10 L100,12 L0,12 Z" fill="currentColor" />
            </svg>
          </span>
        </h1>
        <p>
          Materi & printable edukatif berkualitas untuk orang tua dan pendidik
          modern. Dapatkan link download-mu dalam hitungan detik.
        </p>
        <div className="cta-row">
          <Link href="/catalog" className="btn btn-primary btn-lg">
            <Icon name="bolt" size={18} filled /> Mulai belanja
          </Link>
          <span className="chip chip-mint" style={{ padding: "10px 16px" }}>
            <Icon name="check" size={16} /> QRIS OTOMATIS
          </span>
        </div>
      </section>

      {/* Latest Arrivals */}
      <section className="container section-gap">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 24 }}>
          <h2 style={{ fontSize: 28, margin: 0 }}>Produk Terbaru</h2>
          <Link href="/catalog" style={{ fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 4 }}>
            Semua produk <Icon name="arrow-right" size={16} />
          </Link>
        </div>

        {!products || products.length === 0 ? (
          <div className="card empty">Belum ada produk. Cek lagi nanti ya.</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {products.map((p) => (
              <ProductListCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </section>

      {/* Scan. Pay. Download. */}
      <section className="container section-gap">
        <div className="feature">
          <div>
            <h2>
              Scan. Bayar.
              <br />
              Unduh.
            </h2>
            <p className="muted" style={{ fontSize: 17 }}>
              Pembelian tanpa ribet. Integrasi QRIS otomatis berarti tidak ada
              verifikasi manual — file siap begitu pembayaranmu masuk.
            </p>
            <div className="feature-row">
              <span className="feature-icon">
                <Icon name="timer" size={20} />
              </span>
              <div>
                <div style={{ fontWeight: 600, color: "var(--ink)" }}>Di bawah 30 detik</div>
                <div className="muted" style={{ fontSize: 14 }}>
                  Rata-rata dari klik ke download.
                </div>
              </div>
            </div>
            <div className="feature-row">
              <span className="feature-icon">
                <Icon name="qr" size={20} />
              </span>
              <div>
                <div style={{ fontWeight: 600, color: "var(--ink)" }}>Dukungan QRIS universal</div>
                <div className="muted" style={{ fontSize: 14 }}>
                  Semua e-wallet & aplikasi bank utama.
                </div>
              </div>
            </div>
          </div>

          <div className="qr-card">
            <div
              style={{
                width: 140,
                height: 140,
                margin: "0 auto 20px",
                borderRadius: 16,
                border: "3px solid var(--primary)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--primary)",
                background: "var(--sky-tint)",
              }}
            >
              <Icon name="qr" size={72} />
            </div>
            <h3 style={{ margin: "0 0 6px", fontSize: 20 }}>Pembayaran Berhasil</h3>
            <p className="muted" style={{ margin: 0 }}>
              File-mu siap untuk diunduh.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}

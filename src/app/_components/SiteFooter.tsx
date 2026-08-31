import Link from "next/link";
import { Icon } from "./Icon";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <div className="logo-name" style={{ marginBottom: 8 }}>
              RigelStore
            </div>
            <p className="muted" style={{ maxWidth: 320, margin: 0 }}>
              Produk digital berkualitas untuk orang tua & pendidik. Membangun
              kepercayaan lewat konten bermutu dan transaksi aman.
            </p>
          </div>

          <div>
            <h4>Tautan</h4>
            <div className="footer-links">
              <Link href="/catalog">Katalog</Link>
              <Link href="/orders/lookup">Lacak order</Link>
              <Link href="/login">Masuk / Daftar</Link>
            </div>
          </div>

          <div>
            <h4>Pembayaran</h4>
            <span className="chip chip-sky">
              <Icon name="qr" size={14} /> QRIS didukung
            </span>
          </div>
        </div>

        <div className="footer-bottom">
          © {new Date().getFullYear()} RigelStore. Semua hak dilindungi.
        </div>
      </div>
    </footer>
  );
}

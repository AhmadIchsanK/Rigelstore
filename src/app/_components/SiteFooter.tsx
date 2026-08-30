import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="container">
        <div>© {new Date().getFullYear()} RigelStore — produk digital.</div>
        <div className="links">
          <Link href="/catalog">Katalog</Link>
          <Link href="/orders/lookup">Lacak order</Link>
          <span>Pembayaran QRIS</span>
        </div>
      </div>
    </footer>
  );
}

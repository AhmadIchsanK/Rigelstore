import Link from "next/link";
import { PRODUCT_TYPE_LABEL, coverColor, rupiah } from "./format";

type P = {
  id: string;
  slug: string;
  title: string;
  type: string;
  price_idr: number | string;
};

export function ProductCard({ product }: { product: P }) {
  const initial = product.title.trim().charAt(0).toUpperCase() || "R";
  return (
    <Link href={`/p/${product.slug}`} className="card product-card">
      <div className="cover" style={{ background: coverColor(product.title) }}>
        {initial}
      </div>
      <div className="body">
        <span className="badge">{PRODUCT_TYPE_LABEL[product.type] ?? product.type}</span>
        <div style={{ fontWeight: 600 }}>{product.title}</div>
        <div className="price">{rupiah(product.price_idr)}</div>
      </div>
    </Link>
  );
}

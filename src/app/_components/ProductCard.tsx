import Link from "next/link";
import { PRODUCT_TYPE_LABEL, coverColor, coverUrl, rupiah, typeChipClass } from "./format";
import { Icon } from "./Icon";

type P = {
  id: string;
  slug: string;
  title: string;
  type: string;
  price_idr: number | string;
  description?: string | null;
  cover_path?: string | null;
};

/** Kartu produk vertikal (grid katalog). */
export function ProductCard({ product }: { product: P }) {
  const initial = product.title.trim().charAt(0).toUpperCase() || "R";
  const cover = coverUrl(product.cover_path);
  return (
    <Link href={`/p/${product.slug}`} className="card product-card">
      {cover ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={cover}
          alt={product.title}
          className="cover"
          style={{ objectFit: "cover", padding: 0 }}
        />
      ) : (
        <div className="cover" style={{ background: coverColor(product.title) }}>
          {initial}
        </div>
      )}
      <div className="body">
        <span className={typeChipClass(product.type)}>
          {PRODUCT_TYPE_LABEL[product.type] ?? product.type}
        </span>
        <div style={{ fontWeight: 600, color: "var(--ink)" }}>{product.title}</div>
        <div className="price">{rupiah(product.price_idr)}</div>
      </div>
    </Link>
  );
}

/** Kartu produk horizontal (list "Latest Arrivals" / katalog list). */
export function ProductListCard({ product }: { product: P }) {
  const initial = product.title.trim().charAt(0).toUpperCase() || "R";
  const cover = coverUrl(product.cover_path);
  return (
    <div className="card list-card">
      <Link href={`/p/${product.slug}`} className="list-cover" aria-label={product.title} style={cover ? { padding: 0, overflow: "hidden" } : { background: coverColor(product.title) }}>
        {cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={cover} alt={product.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          initial
        )}
      </Link>
      <div className="list-body">
        <span className={typeChipClass(product.type)} style={{ alignSelf: "flex-start" }}>
          {PRODUCT_TYPE_LABEL[product.type] ?? product.type}
        </span>
        <Link href={`/p/${product.slug}`} style={{ color: "var(--ink)" }}>
          <span style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: 18 }}>
            {product.title}
          </span>
        </Link>
        {product.description && (
          <p className="muted" style={{ margin: 0, fontSize: 15 }}>
            {product.description.length > 120
              ? product.description.slice(0, 120) + "…"
              : product.description}
          </p>
        )}
      </div>
      <div className="list-side">
        <div className="price">{rupiah(product.price_idr)}</div>
        <Link href={`/p/${product.slug}`} className="icon-btn" aria-label="Lihat produk">
          <Icon name="cart" size={18} />
        </Link>
      </div>
    </div>
  );
}

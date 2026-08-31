import Link from "next/link";
import { notFound } from "next/navigation";
import { getCheckoutView } from "@modules/core/orders/service";
import { CheckoutClient } from "./CheckoutClient";

export const metadata = { title: "Pembayaran — RigelStore" };
export const dynamic = "force-dynamic";

export default async function CheckoutPage({
  params,
}: {
  params: Promise<{ orderNumber: string }>;
}) {
  const { orderNumber } = await params;
  const view = await getCheckoutView(orderNumber);
  if (!view) notFound();

  const { order, payment } = view;
  const isMock = payment?.provider === "mock";

  const discount = Number(order.discount_idr ?? 0);

  return (
    <main className="container page" style={{ maxWidth: 600 }}>
      <Link href="/catalog" className="muted">
        ← Katalog
      </Link>
      <h1>Pembayaran</h1>
      <p className="muted" style={{ marginTop: 0 }}>Order {order.order_number}</p>

      {discount > 0 && (
        <div className="card card-pad" style={{ marginBottom: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span className="muted">Subtotal</span>
            <span>Rp{Number(order.subtotal_idr).toLocaleString("id-ID")}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", color: "var(--success)" }}>
            <span>Diskon ({order.coupon_code})</span>
            <span>−Rp{discount.toLocaleString("id-ID")}</span>
          </div>
        </div>
      )}

      <CheckoutClient
        orderNumber={order.order_number}
        initialStatus={order.status}
        totalIdr={Number(order.total_idr)}
        qrString={payment?.qr_string ?? null}
        qrUrl={payment?.qr_url ?? null}
        expiresAt={order.expires_at}
        isMock={isMock}
      />
    </main>
  );
}

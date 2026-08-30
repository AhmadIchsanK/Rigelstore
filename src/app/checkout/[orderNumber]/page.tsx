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

  return (
    <main style={{ maxWidth: 560, margin: "0 auto", padding: "40px 24px" }}>
      <Link href="/catalog" style={{ color: "var(--muted)", textDecoration: "none" }}>
        ← Katalog
      </Link>
      <h1 style={{ color: "var(--brand)" }}>Pembayaran</h1>
      <p style={{ color: "var(--muted)", marginTop: 0 }}>Order {order.order_number}</p>

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

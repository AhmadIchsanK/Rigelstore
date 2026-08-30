import Link from "next/link";
import { redirect } from "next/navigation";
import { loadPrincipal } from "@modules/core/auth/session";
import { listUserDeliverables } from "@modules/core/delivery/service";
import { signOut } from "../login/actions";
import { DeliverButton } from "./DeliverButton";
import { deliverForUserAction } from "./actions";

export const metadata = { title: "Akun saya — RigelStore" };
export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const principal = await loadPrincipal();
  if (principal.kind === "guest") redirect("/login");

  const items = await listUserDeliverables(principal.userId);

  return (
    <main style={{ maxWidth: 760, margin: "0 auto", padding: "40px 24px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1 style={{ color: "var(--brand)", margin: 0 }}>Akun saya</h1>
        <form action={signOut}>
          <button style={{ padding: "6px 10px", borderRadius: 8, border: "1px solid #d1d5db", cursor: "pointer" }}>
            Keluar
          </button>
        </form>
      </div>
      <p style={{ color: "var(--muted)" }}>{principal.email}</p>

      <h2 style={{ fontSize: 18 }}>Barang saya</h2>
      {items.length === 0 ? (
        <p style={{ color: "var(--muted)" }}>
          Belum ada pembelian. <Link href="/catalog">Lihat katalog →</Link>
        </p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0, display: "grid", gap: 12 }}>
          {items.map((e) => {
            const product = e.products as unknown as { title?: string; type?: string } | null;
            const order = e.orders as unknown as { order_number?: string } | null;
            return (
              <li key={e.id} style={{ border: "1px solid #e5e7eb", borderRadius: 12, padding: 16 }}>
                <div style={{ fontWeight: 600 }}>{product?.title ?? "Produk"}</div>
                <div style={{ fontSize: 13, color: "var(--muted)", marginBottom: 8 }}>
                  Order {order?.order_number} · {product?.type}
                  {e.delivered_at ? " · sudah pernah diambil" : ""}
                </div>
                <DeliverButton
                  action={deliverForUserAction}
                  entitlementId={e.id}
                  label={e.delivered_at ? "Ambil ulang" : "Ambil barang"}
                />
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}

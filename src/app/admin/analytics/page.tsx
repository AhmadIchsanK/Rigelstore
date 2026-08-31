import Link from "next/link";
import { requirePagePermission } from "../guard";
import { Forbidden } from "../Forbidden";
import { getSalesOverview } from "@modules/core/analytics/service";
import { rupiah } from "../../_components/format";

export const metadata = { title: "Analitik — Admin" };
export const dynamic = "force-dynamic";

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="card card-pad">
      <div className="muted" style={{ fontSize: 13 }}>{label}</div>
      <div style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: 24, marginTop: 4 }}>
        {value}
      </div>
    </div>
  );
}

export default async function AnalyticsPage() {
  const guard = await requirePagePermission("analytics.read");
  if (guard.denied) return <Forbidden note="Butuh izin analytics.read." />;

  const o = await getSalesOverview();
  const maxRev = Math.max(1, ...o.revenue_7d.map((d) => Number(d.revenue)));

  return (
    <main className="container page" style={{ maxWidth: 900 }}>
      <Link href="/admin" className="muted">← Panel admin</Link>
      <h1>Analitik</h1>

      <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))" }}>
        <Stat label="Total omzet (lunas)" value={rupiah(o.revenue_total)} />
        <Stat label="Order lunas" value={String(o.orders_paid)} />
        <Stat label="Rata-rata / order" value={rupiah(o.aov)} />
        <Stat label="Pending" value={String(o.orders_pending)} />
      </div>

      <h2 style={{ fontSize: 18, marginTop: 32 }}>Omzet 7 hari terakhir</h2>
      <div className="card card-pad">
        <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 160 }}>
          {o.revenue_7d.map((d) => (
            <div key={d.day} style={{ flex: 1, textAlign: "center" }}>
              <div
                title={rupiah(d.revenue)}
                style={{
                  height: `${(Number(d.revenue) / maxRev) * 130}px`,
                  background: "var(--primary)",
                  borderRadius: "6px 6px 0 0",
                  minHeight: 3,
                }}
              />
              <div className="muted" style={{ fontSize: 11, marginTop: 4 }}>
                {d.day.slice(5)}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: "grid", gap: 20, gridTemplateColumns: "1fr", marginTop: 32 }}>
        <div>
          <h2 style={{ fontSize: 18 }}>Kanal (order lunas)</h2>
          <div className="card card-pad">
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>🌐 Website</span> <strong>{o.web_orders}</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
              <span>💬 Telegram</span> <strong>{o.telegram_orders}</strong>
            </div>
          </div>
        </div>

        <div>
          <h2 style={{ fontSize: 18 }}>Produk terlaris</h2>
          <div className="card card-pad">
            {o.top_products.length === 0 ? (
              <p className="muted" style={{ margin: 0 }}>Belum ada penjualan.</p>
            ) : (
              <ol style={{ margin: 0, paddingLeft: 18 }}>
                {o.top_products.map((p) => (
                  <li key={p.title} style={{ marginBottom: 6 }}>
                    {p.title} — <strong>{rupiah(p.revenue)}</strong>{" "}
                    <span className="muted">({p.qty}×)</span>
                  </li>
                ))}
              </ol>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

import Link from "next/link";
import { requirePagePermission } from "../guard";
import { Forbidden } from "../Forbidden";
import { listCoupons } from "@modules/core/promotions/service";
import { rupiah } from "../../_components/format";
import { CouponForm } from "./CouponForm";
import { toggleCouponAction } from "./actions";

export const metadata = { title: "Kupon — Admin" };
export const dynamic = "force-dynamic";

export default async function CouponsPage() {
  const guard = await requirePagePermission("coupons.manage");
  if (guard.denied) return <Forbidden note="Butuh izin coupons.manage." />;

  const coupons = await listCoupons();

  return (
    <main className="container page" style={{ maxWidth: 900 }}>
      <Link href="/admin" className="muted">← Panel admin</Link>
      <h1>Kupon &amp; Promo</h1>

      <div style={{ display: "grid", gap: 28, gridTemplateColumns: "1fr" }}>
        <section className="card card-pad">
          <h2 style={{ fontSize: 18, marginTop: 0 }}>Buat kupon</h2>
          <CouponForm />
        </section>

        <section>
          <h2 style={{ fontSize: 18 }}>Daftar kupon</h2>
          {coupons.length === 0 ? (
            <div className="card empty">Belum ada kupon.</div>
          ) : (
            <div className="card" style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 640 }}>
                <thead>
                  <tr style={{ textAlign: "left", borderBottom: "2px solid var(--border)" }}>
                    <th style={{ padding: 12 }}>Kode</th>
                    <th style={{ padding: 12 }}>Diskon</th>
                    <th style={{ padding: 12 }}>Min.</th>
                    <th style={{ padding: 12 }}>Pemakaian</th>
                    <th style={{ padding: 12 }}>Aktif</th>
                    <th style={{ padding: 12 }}></th>
                  </tr>
                </thead>
                <tbody>
                  {coupons.map((c) => (
                    <tr key={c.id} style={{ borderBottom: "1px solid var(--border)" }}>
                      <td style={{ padding: 12, fontWeight: 700 }}>{c.code}</td>
                      <td style={{ padding: 12 }}>
                        {c.type === "percent" ? `${c.value}%` : rupiah(c.value)}
                      </td>
                      <td style={{ padding: 12 }}>{c.min_subtotal ? rupiah(c.min_subtotal) : "—"}</td>
                      <td style={{ padding: 12 }}>
                        {c.redeemed_count}
                        {c.max_redemptions ? ` / ${c.max_redemptions}` : ""}
                      </td>
                      <td style={{ padding: 12 }}>{c.active ? "✅" : "⛔"}</td>
                      <td style={{ padding: 12 }}>
                        <form action={toggleCouponAction}>
                          <input type="hidden" name="id" value={c.id} />
                          <input type="hidden" name="active" value={String(!c.active)} />
                          <button className="btn" style={{ padding: "6px 12px" }}>
                            {c.active ? "Nonaktifkan" : "Aktifkan"}
                          </button>
                        </form>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

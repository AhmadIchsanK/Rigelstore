import Link from "next/link";
import { requirePagePermission } from "../guard";
import { Forbidden } from "../Forbidden";
import { listAllTickets } from "@modules/core/support/service";

export const metadata = { title: "Support — Admin" };
export const dynamic = "force-dynamic";

export default async function AdminSupportPage() {
  const guard = await requirePagePermission("support.manage");
  if (guard.denied) return <Forbidden note="Butuh izin support.manage." />;

  const tickets = await listAllTickets();

  return (
    <main className="container page" style={{ maxWidth: 820 }}>
      <Link href="/admin" className="muted">← Panel admin</Link>
      <h1>Tiket Support</h1>
      {tickets.length === 0 ? (
        <div className="card empty">Belum ada tiket.</div>
      ) : (
        <ul style={{ listStyle: "none", padding: 0, display: "grid", gap: 10 }}>
          {tickets.map((t) => (
            <li key={t.id} className="card card-pad" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <Link href={`/admin/support/${t.id}`} style={{ fontWeight: 600 }}>
                  {t.subject}
                </Link>
                <div className="muted" style={{ fontSize: 13 }}>
                  {t.order_number ? `Order ${t.order_number} · ` : ""}
                  {new Date(t.created_at).toLocaleString("id-ID")}
                </div>
              </div>
              <span className="chip">{t.status}</span>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}

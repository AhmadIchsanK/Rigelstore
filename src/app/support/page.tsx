import Link from "next/link";
import { redirect } from "next/navigation";
import { loadPrincipal } from "@modules/core/auth/session";
import { listUserTickets } from "@modules/core/support/service";
import { NewTicketForm } from "./NewTicketForm";

export const metadata = { title: "Bantuan / Support" };
export const dynamic = "force-dynamic";

export default async function SupportPage() {
  const principal = await loadPrincipal();
  if (principal.kind === "guest") redirect("/login");

  const tickets = await listUserTickets(principal.userId);

  return (
    <main className="container page" style={{ maxWidth: 720 }}>
      <h1>Bantuan</h1>
      <div style={{ display: "grid", gap: 28 }}>
        <section className="card card-pad">
          <h2 style={{ fontSize: 18, marginTop: 0 }}>Buat tiket baru</h2>
          <NewTicketForm />
        </section>

        <section>
          <h2 style={{ fontSize: 18 }}>Tiket saya</h2>
          {tickets.length === 0 ? (
            <div className="card empty">Belum ada tiket.</div>
          ) : (
            <ul style={{ listStyle: "none", padding: 0, display: "grid", gap: 10 }}>
              {tickets.map((t) => (
                <li key={t.id} className="card card-pad">
                  <Link href={`/support/${t.id}`} style={{ fontWeight: 600 }}>
                    {t.subject}
                  </Link>
                  <div className="muted" style={{ fontSize: 13 }}>
                    {t.status} · {new Date(t.created_at).toLocaleDateString("id-ID")}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}

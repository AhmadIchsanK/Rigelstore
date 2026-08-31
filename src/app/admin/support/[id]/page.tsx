import Link from "next/link";
import { notFound } from "next/navigation";
import { requirePagePermission } from "../../guard";
import { Forbidden } from "../../Forbidden";
import { getTicketWithMessages } from "@modules/core/support/service";
import { MessageList, ReplyForm } from "../../../_components/ReplyForm";
import { adminReplyAction, setStatusAction } from "../actions";

export const metadata = { title: "Tiket — Admin Support" };
export const dynamic = "force-dynamic";

export default async function AdminTicketPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const guard = await requirePagePermission("support.manage");
  if (guard.denied) return <Forbidden note="Butuh izin support.manage." />;

  const data = await getTicketWithMessages(id);
  if (!data) notFound();

  return (
    <main className="container page" style={{ maxWidth: 680 }}>
      <Link href="/admin/support" className="muted">← Tiket support</Link>
      <h1 style={{ marginBottom: 4 }}>{data.ticket.subject}</h1>
      <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 16 }}>
        <span className="muted">Status: {data.ticket.status}</span>
        {(["open", "answered", "closed"] as const).map((s) => (
          <form action={setStatusAction} key={s}>
            <input type="hidden" name="ticket_id" value={id} />
            <input type="hidden" name="status" value={s} />
            <button className="btn" style={{ padding: "4px 10px" }} disabled={data.ticket.status === s}>
              {s}
            </button>
          </form>
        ))}
      </div>

      <MessageList messages={data.messages} />
      <ReplyForm action={adminReplyAction} ticketId={id} />
    </main>
  );
}

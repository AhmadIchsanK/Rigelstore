import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { loadPrincipal } from "@modules/core/auth/session";
import { getTicketWithMessages } from "@modules/core/support/service";
import { MessageList, ReplyForm } from "../../_components/ReplyForm";
import { replyTicketAction } from "../actions";

export const metadata = { title: "Tiket — Support" };
export const dynamic = "force-dynamic";

export default async function TicketPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const principal = await loadPrincipal();
  if (principal.kind === "guest") redirect("/login");

  const data = await getTicketWithMessages(id);
  if (!data || data.ticket.user_id !== principal.userId) notFound();

  return (
    <main className="container page" style={{ maxWidth: 680 }}>
      <Link href="/support" className="muted">← Bantuan</Link>
      <h1 style={{ marginBottom: 4 }}>{data.ticket.subject}</h1>
      <p className="muted" style={{ marginTop: 0 }}>
        Status: {data.ticket.status}
        {data.ticket.order_number ? ` · Order ${data.ticket.order_number}` : ""}
      </p>

      <MessageList messages={data.messages} />
      {data.ticket.status !== "closed" && <ReplyForm action={replyTicketAction} ticketId={id} />}
    </main>
  );
}

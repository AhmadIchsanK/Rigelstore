"use client";

import { useActionState } from "react";

type ReplyState = { error: string | null };
type Action = (prev: ReplyState, formData: FormData) => Promise<ReplyState>;

/** Form balasan tiket, dipakai bersama oleh pelanggan & admin. */
export function ReplyForm({ action, ticketId }: { action: Action; ticketId: string }) {
  const [state, formAction, pending] = useActionState(action, { error: null });
  return (
    <form action={formAction} style={{ display: "grid", gap: 10, marginTop: 16 }}>
      <input type="hidden" name="ticket_id" value={ticketId} />
      <textarea className="textarea" name="body" placeholder="Tulis balasan…" required />
      {state.error && <p className="notice-error" style={{ margin: 0 }}>{state.error}</p>}
      <button className="btn btn-primary" disabled={pending} style={{ width: "fit-content" }}>
        {pending ? "Mengirim…" : "Kirim balasan"}
      </button>
    </form>
  );
}

/** Render daftar pesan tiket. */
export function MessageList({
  messages,
}: {
  messages: { id: string; author: string; body: string; created_at: string }[];
}) {
  return (
    <div style={{ display: "grid", gap: 10 }}>
      {messages.map((m) => (
        <div
          key={m.id}
          className="card card-pad"
          style={{
            background: m.author === "admin" ? "var(--sky-tint)" : "var(--surface)",
          }}
        >
          <div className="muted" style={{ fontSize: 12, marginBottom: 4 }}>
            {m.author === "admin" ? "Admin" : "Kamu"} ·{" "}
            {new Date(m.created_at).toLocaleString("id-ID")}
          </div>
          <div style={{ whiteSpace: "pre-wrap" }}>{m.body}</div>
        </div>
      ))}
    </div>
  );
}

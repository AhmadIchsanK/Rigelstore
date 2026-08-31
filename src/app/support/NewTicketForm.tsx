"use client";

import { useActionState } from "react";
import { type TicketFormState, createTicketAction } from "./actions";

const initial: TicketFormState = { error: null };

export function NewTicketForm() {
  const [state, action, pending] = useActionState(createTicketAction, initial);
  return (
    <form action={action} style={{ display: "grid", gap: 12, maxWidth: 480 }}>
      <label>
        Subjek
        <input className="input" name="subject" required />
      </label>
      <label>
        Nomor order (opsional)
        <input className="input" name="order_number" placeholder="RGL-XXXXXXXX" />
      </label>
      <label>
        Pesan
        <textarea className="textarea" name="body" required />
      </label>
      {state.error && <p className="notice-error" style={{ margin: 0 }}>{state.error}</p>}
      <button className="btn btn-primary" disabled={pending} style={{ width: "fit-content" }}>
        {pending ? "Mengirim…" : "Kirim tiket"}
      </button>
    </form>
  );
}

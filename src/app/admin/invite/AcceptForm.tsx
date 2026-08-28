"use client";

import Link from "next/link";
import { useActionState } from "react";
import { type AcceptInviteState, acceptInvitation } from "../invites/actions";

const initial: AcceptInviteState = { error: null };

export function AcceptForm({ token }: { token: string }) {
  const [state, action, pending] = useActionState(acceptInvitation, initial);

  if (state.ok) {
    return (
      <div>
        <p style={{ color: "#15803d" }}>Berhasil! Akun kamu kini admin.</p>
        <Link href="/admin">Buka panel admin →</Link>
      </div>
    );
  }

  return (
    <form action={action} style={{ display: "grid", gap: 12 }}>
      <input type="hidden" name="token" value={token} />
      <p>Terima undangan menjadi admin dengan akun yang sedang login?</p>
      {state.error && <p style={{ color: "#b91c1c", margin: 0 }}>{state.error}</p>}
      <button
        style={{
          padding: "10px 14px",
          borderRadius: 8,
          border: "none",
          background: "var(--brand)",
          color: "#fff",
          cursor: "pointer",
          fontWeight: 600,
        }}
        disabled={pending}
      >
        {pending ? "Memproses…" : "Terima undangan"}
      </button>
    </form>
  );
}

"use client";

import { useActionState } from "react";
import { type CreateInviteState, createInvitation } from "./actions";

const initial: CreateInviteState = { error: null };

const inputStyle: React.CSSProperties = {
  padding: "8px 10px",
  border: "1px solid #d1d5db",
  borderRadius: 8,
};

export function InviteForm() {
  const [state, action, pending] = useActionState(createInvitation, initial);

  return (
    <div style={{ display: "grid", gap: 10 }}>
      <form action={action} style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <input style={inputStyle} type="email" name="email" placeholder="email calon admin" required />
        <select style={inputStyle} name="role" defaultValue="admin">
          <option value="admin">Admin</option>
          <option value="content_admin">Content Admin</option>
          <option value="support_admin">Support Admin</option>
        </select>
        <button
          style={{
            padding: "8px 12px",
            borderRadius: 8,
            border: "none",
            background: "var(--brand)",
            color: "#fff",
            cursor: "pointer",
            fontWeight: 600,
          }}
          disabled={pending}
        >
          {pending ? "Membuat…" : "Buat undangan"}
        </button>
      </form>

      {state.error && <p style={{ color: "#b91c1c", margin: 0 }}>{state.error}</p>}
      {state.inviteUrl && (
        <div>
          <p style={{ margin: "4px 0", color: "#15803d" }}>
            Undangan dibuat. Kirim link ini ke calon admin (berlaku 72 jam):
          </p>
          <code
            style={{
              display: "block",
              padding: 10,
              background: "#f3f4f6",
              borderRadius: 8,
              wordBreak: "break-all",
            }}
          >
            {state.inviteUrl}
          </code>
        </div>
      )}
    </div>
  );
}

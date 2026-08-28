"use client";

import { useActionState } from "react";
import { type ProductFormState, addCredentialsAction } from "../actions";

const initial: ProductFormState = { error: null };

export function CredentialsForm({ productId }: { productId: string }) {
  const [state, action, pending] = useActionState(addCredentialsAction, initial);

  return (
    <form action={action} style={{ display: "grid", gap: 10, maxWidth: 560 }}>
      <input type="hidden" name="product_id" value={productId} />
      <p style={{ margin: 0, color: "var(--muted)" }}>
        Satu kredensial per baris (mis. <code>email:password</code>). Nilai
        disimpan terenkripsi; admin hanya melihat label tersamar.
      </p>
      <textarea
        name="credentials"
        placeholder={"akun1@mail.com:rahasia1\nakun2@mail.com:rahasia2"}
        style={{
          minHeight: 120,
          padding: 10,
          border: "1px solid #d1d5db",
          borderRadius: 8,
          fontFamily: "monospace",
        }}
        required
      />
      {state.error && <p style={{ color: "#b91c1c", margin: 0 }}>{state.error}</p>}
      <button
        style={{
          padding: "8px 12px",
          borderRadius: 8,
          border: "none",
          background: "var(--brand)",
          color: "#fff",
          fontWeight: 600,
          cursor: "pointer",
          width: "fit-content",
        }}
        disabled={pending}
      >
        {pending ? "Menambah…" : "Tambah stok"}
      </button>
    </form>
  );
}

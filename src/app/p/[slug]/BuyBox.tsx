"use client";

import { useActionState } from "react";
import { type BuyState, buyNowAction } from "./actions";

const initial: BuyState = { error: null };

export function BuyBox({
  productId,
  loggedIn,
}: {
  productId: string;
  loggedIn: boolean;
}) {
  const [state, action, pending] = useActionState(buyNowAction, initial);

  return (
    <form action={action} style={{ display: "grid", gap: 10, maxWidth: 360 }}>
      <input type="hidden" name="product_id" value={productId} />
      {!loggedIn && (
        <label>
          Email (untuk invoice & barang)
          <input
            type="email"
            name="email"
            required
            style={{
              width: "100%",
              padding: "10px 12px",
              border: "1px solid #d1d5db",
              borderRadius: 8,
              marginTop: 4,
            }}
          />
        </label>
      )}
      {state.error && <p style={{ color: "#b91c1c", margin: 0 }}>{state.error}</p>}
      <button
        style={{
          padding: "12px 16px",
          borderRadius: 8,
          border: "none",
          background: "var(--brand)",
          color: "#fff",
          fontWeight: 700,
          cursor: "pointer",
        }}
        disabled={pending}
      >
        {pending ? "Memproses…" : "Beli sekarang (QRIS)"}
      </button>
    </form>
  );
}

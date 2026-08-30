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
    <form action={action} style={{ display: "grid", gap: 12, maxWidth: 360 }}>
      <input type="hidden" name="product_id" value={productId} />
      {!loggedIn && (
        <label>
          Email (untuk invoice & barang)
          <input className="input" type="email" name="email" required />
        </label>
      )}
      {state.error && <p className="notice-error" style={{ margin: 0 }}>{state.error}</p>}
      <button className="btn btn-primary btn-block" disabled={pending}>
        {pending ? "Memproses…" : "Beli sekarang (QRIS)"}
      </button>
    </form>
  );
}

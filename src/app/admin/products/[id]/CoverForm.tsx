"use client";

import { useActionState } from "react";
import { type ProductFormState, uploadCoverAction } from "../actions";

const initial: ProductFormState = { error: null };

export function CoverForm({ productId }: { productId: string }) {
  const [state, action, pending] = useActionState(uploadCoverAction, initial);
  return (
    <form action={action} style={{ display: "grid", gap: 10, maxWidth: 420 }}>
      <input type="hidden" name="product_id" value={productId} />
      <input type="file" name="cover" accept="image/*" required />
      {state.error && <p className="notice-error" style={{ margin: 0 }}>{state.error}</p>}
      <button className="btn" disabled={pending} style={{ width: "fit-content" }}>
        {pending ? "Mengunggah…" : "Unggah cover"}
      </button>
    </form>
  );
}

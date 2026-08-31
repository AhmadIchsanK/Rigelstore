"use client";

import { useActionState } from "react";
import { type CouponFormState, createCouponAction } from "./actions";

const initial: CouponFormState = { error: null };

export function CouponForm() {
  const [state, action, pending] = useActionState(createCouponAction, initial);
  return (
    <form action={action} style={{ display: "grid", gap: 12, maxWidth: 420 }}>
      <label>
        Kode
        <input className="input" name="code" placeholder="HEMAT10" required />
      </label>
      <div style={{ display: "flex", gap: 12 }}>
        <label style={{ flex: 1 }}>
          Tipe
          <select className="select" name="type" defaultValue="percent">
            <option value="percent">Persen (%)</option>
            <option value="fixed">Nominal (Rp)</option>
          </select>
        </label>
        <label style={{ flex: 1 }}>
          Nilai
          <input className="input" name="value" inputMode="numeric" placeholder="10" required />
        </label>
      </div>
      <label>
        Minimal subtotal (Rp, opsional)
        <input className="input" name="min_subtotal" inputMode="numeric" placeholder="0" />
      </label>
      <label>
        Batas pemakaian (opsional)
        <input className="input" name="max_redemptions" inputMode="numeric" placeholder="tak terbatas" />
      </label>
      <label>
        Kedaluwarsa (opsional)
        <input className="input" type="date" name="expires_at" />
      </label>
      {state.error && <p className="notice-error" style={{ margin: 0 }}>{state.error}</p>}
      {state.ok && <p className="notice-success" style={{ margin: 0 }}>Kupon dibuat.</p>}
      <button className="btn btn-primary" disabled={pending} style={{ width: "fit-content" }}>
        {pending ? "Menyimpan…" : "Buat kupon"}
      </button>
    </form>
  );
}

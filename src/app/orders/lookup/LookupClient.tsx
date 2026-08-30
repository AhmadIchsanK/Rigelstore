"use client";

import { useActionState } from "react";
import { DeliverButton } from "../../account/DeliverButton";
import { type LookupState, deliverForGuestAction, lookupGuestAction } from "./actions";

const initial: LookupState = { error: null };

const field: React.CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  border: "1px solid #d1d5db",
  borderRadius: 8,
  marginTop: 4,
};

export function LookupClient() {
  const [state, action, pending] = useActionState(lookupGuestAction, initial);

  return (
    <div>
      <form action={action} style={{ display: "grid", gap: 12, maxWidth: 420 }}>
        <label>
          Nomor order (mis. RGL-XXXXXXXX)
          <input style={field} name="order_number" required />
        </label>
        <label>
          Email saat membeli
          <input style={field} type="email" name="email" required />
        </label>
        {state.error && <p style={{ color: "#b91c1c", margin: 0 }}>{state.error}</p>}
        <button
          style={{
            padding: "10px 14px",
            borderRadius: 8,
            border: "none",
            background: "var(--brand)",
            color: "#fff",
            fontWeight: 600,
            cursor: "pointer",
          }}
          disabled={pending}
        >
          {pending ? "Mencari…" : "Cari order"}
        </button>
      </form>

      {state.entitlements && (
        <div style={{ marginTop: 24 }}>
          <h2 style={{ fontSize: 18 }}>Order {state.orderNumber}</h2>
          {state.entitlements.length === 0 ? (
            <p style={{ color: "var(--muted)" }}>Order ditemukan, tetapi belum ada barang aktif.</p>
          ) : (
            <ul style={{ listStyle: "none", padding: 0, display: "grid", gap: 12 }}>
              {state.entitlements.map((e) => (
                <li key={e.id} style={{ border: "1px solid #e5e7eb", borderRadius: 12, padding: 16 }}>
                  <div style={{ fontWeight: 600 }}>{e.title}</div>
                  <div style={{ fontSize: 13, color: "var(--muted)", marginBottom: 8 }}>{e.type}</div>
                  <DeliverButton
                    action={deliverForGuestAction}
                    entitlementId={e.id}
                    hidden={{ order_number: state.orderNumber!, email: state.email! }}
                    label={e.delivered ? "Ambil ulang" : "Ambil barang"}
                  />
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

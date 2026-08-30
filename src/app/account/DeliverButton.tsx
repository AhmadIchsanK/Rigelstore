"use client";

import { useActionState } from "react";
import type { DeliveryResult } from "@modules/core/delivery/types";

type Action = (prev: DeliveryResult | null, formData: FormData) => Promise<DeliveryResult>;

/**
 * Tombol "Ambil barang" generik. `action` disuntik dari server (user/guest).
 * Menampilkan kredensial / link unduh / password sesuai hasil.
 */
export function DeliverButton({
  action,
  entitlementId,
  hidden,
  label = "Ambil / Unduh",
}: {
  action: Action;
  entitlementId: string;
  hidden?: Record<string, string>;
  label?: string;
}) {
  const [result, formAction, pending] = useActionState(action, null);

  return (
    <div>
      <form action={formAction}>
        <input type="hidden" name="entitlement_id" value={entitlementId} />
        {hidden &&
          Object.entries(hidden).map(([k, v]) => <input key={k} type="hidden" name={k} value={v} />)}
        <button
          style={{
            padding: "6px 12px",
            borderRadius: 8,
            border: "1px solid #d1d5db",
            cursor: "pointer",
          }}
          disabled={pending}
        >
          {pending ? "Memproses…" : label}
        </button>
      </form>

      {result && <DeliveryView result={result} />}
    </div>
  );
}

function DeliveryView({ result }: { result: DeliveryResult }) {
  if (result.type === "unavailable") {
    return <p style={{ color: "#b91c1c", margin: "6px 0" }}>{result.reason}</p>;
  }
  if (result.type === "credential") {
    return (
      <div style={box}>
        <div style={{ fontSize: 12, color: "var(--muted)" }}>Kredensial kamu:</div>
        <code style={{ userSelect: "all" }}>{result.value}</code>
      </div>
    );
  }
  if (result.type === "file") {
    return (
      <div style={box}>
        <a href={result.url} target="_blank" rel="noreferrer">
          Unduh {result.filename ?? "file"} →
        </a>
        <div style={{ fontSize: 12, color: "var(--muted)" }}>Link berlaku singkat.</div>
      </div>
    );
  }
  // pdf
  return (
    <div style={box}>
      <a href={result.url} target="_blank" rel="noreferrer">
        Unduh {result.filename ?? "PDF"} →
      </a>
      <div style={{ marginTop: 6 }}>
        Password PDF: <code style={{ userSelect: "all" }}>{result.password}</code>
      </div>
      <div style={{ fontSize: 12, color: "var(--muted)" }}>Link berlaku singkat.</div>
    </div>
  );
}

const box: React.CSSProperties = {
  marginTop: 8,
  padding: 10,
  background: "#f9fafb",
  border: "1px solid #e5e7eb",
  borderRadius: 8,
  wordBreak: "break-all",
};

"use client";

import { useEffect, useState } from "react";

function useCountdown(expiresAt: string | null) {
  const [remaining, setRemaining] = useState<number | null>(null);
  useEffect(() => {
    if (!expiresAt) return;
    const target = new Date(expiresAt).getTime();
    const tick = () => setRemaining(Math.max(0, Math.floor((target - Date.now()) / 1000)));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [expiresAt]);
  return remaining;
}

function fmt(s: number) {
  const m = Math.floor(s / 60);
  const ss = String(s % 60).padStart(2, "0");
  return `${m}:${ss}`;
}

export function CheckoutClient({
  orderNumber,
  initialStatus,
  totalIdr,
  qrString,
  qrUrl,
  expiresAt,
  isMock,
}: {
  orderNumber: string;
  initialStatus: string;
  totalIdr: number;
  qrString: string | null;
  qrUrl: string | null;
  expiresAt: string | null;
  isMock: boolean;
}) {
  const [status, setStatus] = useState(initialStatus);
  const [simulating, setSimulating] = useState(false);
  const remaining = useCountdown(expiresAt);

  // Polling status — status hanya berubah dari webhook di server.
  useEffect(() => {
    if (status === "paid" || status === "expired" || status === "cancelled") return;
    const id = setInterval(async () => {
      try {
        const res = await fetch(`/api/orders/${orderNumber}/status`, { cache: "no-store" });
        if (res.ok) {
          const data = (await res.json()) as { status: string };
          setStatus(data.status);
        }
      } catch {
        /* abaikan error jaringan sesaat */
      }
    }, 3000);
    return () => clearInterval(id);
  }, [orderNumber, status]);

  async function simulate() {
    setSimulating(true);
    try {
      await fetch("/api/dev/simulate-pay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderNumber }),
      });
    } finally {
      setSimulating(false);
    }
  }

  if (status === "paid") {
    return (
      <div style={{ padding: 20, border: "1px solid #bbf7d0", background: "#f0fdf4", borderRadius: 12 }}>
        <h2 style={{ color: "#15803d", marginTop: 0 }}>Pembayaran berhasil ✓</h2>
        <p>
          Order {orderNumber} lunas. Ambil barangmu di{" "}
          <a href="/account">Akun saya</a> (jika login) atau lewat{" "}
          <a href="/orders/lookup">Lacak order</a> (tamu: pakai nomor order +
          email).
        </p>
      </div>
    );
  }

  if (status === "expired" || status === "cancelled") {
    return (
      <div style={{ padding: 20, border: "1px solid #fecaca", background: "#fef2f2", borderRadius: 12 }}>
        <h2 style={{ color: "#b91c1c", marginTop: 0 }}>Pembayaran kedaluwarsa</h2>
        <p>Order {orderNumber} sudah tidak aktif. Stok telah dilepas kembali. Silakan pesan ulang.</p>
      </div>
    );
  }

  return (
    <div>
      <p style={{ fontSize: 20, fontWeight: 800 }}>
        Bayar Rp{totalIdr.toLocaleString("id-ID")}
      </p>

      <div
        style={{
          display: "inline-block",
          padding: 16,
          border: "1px solid #e5e7eb",
          borderRadius: 12,
          textAlign: "center",
        }}
      >
        {qrUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={qrUrl} alt="QRIS" width={220} height={220} />
        ) : (
          <div style={{ maxWidth: 240 }}>
            <div style={{ fontSize: 12, color: "var(--muted)" }}>Kode QRIS (dev/mock):</div>
            <code style={{ wordBreak: "break-all", fontSize: 12 }}>{qrString}</code>
          </div>
        )}
      </div>

      <p style={{ marginTop: 12, color: "var(--muted)" }}>
        {remaining === null
          ? "Menunggu pembayaran…"
          : remaining > 0
            ? `Selesaikan pembayaran dalam ${fmt(remaining)}`
            : "Waktu habis — memeriksa status…"}
      </p>
      <p style={{ color: "var(--muted)", fontSize: 13 }}>
        Halaman ini menunggu konfirmasi resmi dari gateway. Jangan tutup dulu.
      </p>

      {isMock && (
        <button
          onClick={simulate}
          disabled={simulating}
          style={{
            marginTop: 8,
            padding: "8px 12px",
            borderRadius: 8,
            border: "1px dashed #9ca3af",
            background: "#f9fafb",
            cursor: "pointer",
          }}
        >
          {simulating ? "Menyimulasikan…" : "🧪 Simulasi bayar (dev)"}
        </button>
      )}
    </div>
  );
}

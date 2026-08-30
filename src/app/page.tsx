/**
 * Halaman depan. Fase 1: menampilkan status login sederhana + tautan.
 * Storefront asli dibangun mulai Fase 5.
 */
import Link from "next/link";
import { loadPrincipal } from "@modules/core/auth/session";
import { isAdmin } from "@modules/core/auth/principal";
import { signOut } from "./login/actions";

export const dynamic = "force-dynamic";

export default async function Home() {
  const principal = await loadPrincipal();

  return (
    <main style={{ maxWidth: 720, margin: "0 auto", padding: "48px 24px" }}>
      <h1 style={{ color: "var(--brand)", marginBottom: 8 }}>RigelStore</h1>
      <p style={{ color: "var(--muted)", marginTop: 0 }}>
        Toko produk digital — website + Telegram, pembayaran QRIS otomatis.
      </p>

      <div style={{ marginTop: 16 }}>
        <Link
          href="/catalog"
          style={{
            padding: "8px 12px",
            borderRadius: 8,
            background: "var(--brand)",
            color: "#fff",
            textDecoration: "none",
            fontWeight: 600,
          }}
        >
          Lihat katalog →
        </Link>
      </div>

      <div style={{ display: "flex", gap: 12, alignItems: "center", marginTop: 16 }}>
        {principal.kind === "guest" ? (
          <Link href="/login">Masuk / Daftar</Link>
        ) : (
          <>
            <span style={{ color: "var(--muted)" }}>
              Halo, {principal.email}
              {isAdmin(principal) ? ` (admin: ${principal.role})` : ""}
            </span>
            {isAdmin(principal) && <Link href="/admin">Panel Admin</Link>}
            <form action={signOut}>
              <button
                style={{
                  padding: "6px 10px",
                  borderRadius: 8,
                  border: "1px solid #d1d5db",
                  cursor: "pointer",
                }}
              >
                Keluar
              </button>
            </form>
          </>
        )}
      </div>

      <section
        style={{ marginTop: 32, padding: 20, border: "1px solid #e5e7eb", borderRadius: 12 }}
      >
        <strong>Status: Fase 3 — Keranjang + Order + QRIS + Webhook</strong>
        <p style={{ marginBottom: 0 }}>
          Pembeli bisa checkout dan membayar via QRIS; status lunas hanya dari
          webhook gateway yang terverifikasi. Pengiriman aman & akun pelanggan
          menyusul di Fase 4.
        </p>
      </section>
    </main>
  );
}

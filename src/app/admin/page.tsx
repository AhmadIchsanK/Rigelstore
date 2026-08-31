import Link from "next/link";
import { redirect } from "next/navigation";
import { loadPrincipal } from "@modules/core/auth/session";
import { can, isAdmin } from "@modules/core/auth/principal";
import { signOut } from "../login/actions";
import { InviteForm } from "./invites/InviteForm";

export const metadata = { title: "Admin — RigelStore" };

// Selalu dievaluasi per-request (bergantung pada sesi/cookie).
export const dynamic = "force-dynamic";

/**
 * Halaman admin KOSONG yang dijaga di SERVER.
 *
 * - Guest (belum login) -> dialihkan ke /login.
 * - Pelanggan biasa yang memaksa membuka URL ini -> DITOLAK (403), tidak ada
 *   satu pun konten admin yang dirender.
 * - Hanya admin aktif yang melihat isi halaman.
 *
 * Penegakan memakai gerbang deterministik `isAdmin` atas Principal yang dimuat
 * dari database — bukan sekadar menyembunyikan tombol.
 */
export default async function AdminPage() {
  const principal = await loadPrincipal();

  if (principal.kind === "guest") {
    redirect("/login");
  }

  if (!isAdmin(principal)) {
    // Login, tetapi bukan admin. Tolak tegas — jangan bocorkan apa pun.
    return (
      <main style={{ maxWidth: 560, margin: "0 auto", padding: "48px 24px" }}>
        <h1 style={{ color: "#b91c1c" }}>403 — Akses ditolak</h1>
        <p>
          Akun ini tidak memiliki akses admin. Bila menurutmu ini keliru,
          hubungi Super Admin toko.
        </p>
        <form action={signOut}>
          <button
            style={{
              padding: "10px 14px",
              borderRadius: 8,
              border: "1px solid #d1d5db",
              cursor: "pointer",
            }}
          >
            Keluar
          </button>
        </form>
      </main>
    );
  }

  // Admin aktif — halaman kerangka (belum ada fitur; itu fase berikutnya).
  return (
    <main style={{ maxWidth: 720, margin: "0 auto", padding: "48px 24px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1 style={{ color: "var(--brand)", margin: 0 }}>Panel Admin</h1>
        <form action={signOut}>
          <button
            style={{
              padding: "8px 12px",
              borderRadius: 8,
              border: "1px solid #d1d5db",
              cursor: "pointer",
            }}
          >
            Keluar
          </button>
        </form>
      </div>

      <p style={{ color: "var(--muted)" }}>
        Masuk sebagai <strong>{principal.email}</strong> — peran{" "}
        <strong>{principal.role}</strong>.
      </p>

      <section
        style={{ marginTop: 24, padding: 20, border: "1px solid #e5e7eb", borderRadius: 12 }}
      >
        <strong>Fase 1 — fondasi admin</strong>
        <p style={{ marginBottom: 0 }}>
          Halaman admin ini masih kerangka. Modul produk, inventory, order, dan
          pembayaran ditambahkan pada fase berikutnya. Yang penting sudah bekerja
          sekarang: <strong>hanya admin</strong> yang bisa membuka halaman ini —
          ditegakkan di server.
        </p>
      </section>

      {can(principal, "products.manage") && (
        <section
          style={{ marginTop: 24, padding: 20, border: "1px solid #e5e7eb", borderRadius: 12 }}
        >
          <strong>Katalog</strong>
          <p style={{ color: "var(--muted)", marginTop: 4, marginBottom: 10 }}>
            Kelola produk, file, dan stok kredensial unik.
          </p>
          <Link
            href="/admin/products"
            style={{
              padding: "8px 12px",
              borderRadius: 8,
              background: "var(--brand)",
              color: "#fff",
              textDecoration: "none",
              fontWeight: 600,
            }}
          >
            Kelola Produk →
          </Link>
        </section>
      )}

      <section style={{ marginTop: 24, padding: 20, border: "1px solid #e5e7eb", borderRadius: 12 }}>
        <strong>Operasional</strong>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 10 }}>
          {can(principal, "analytics.read") && (
            <Link href="/admin/analytics" className="btn">📊 Analitik</Link>
          )}
          {can(principal, "coupons.manage") && (
            <Link href="/admin/coupons" className="btn">🎟️ Kupon</Link>
          )}
          {can(principal, "support.manage") && (
            <Link href="/admin/support" className="btn">💬 Support</Link>
          )}
        </div>
      </section>

      {can(principal, "admins.manage") && (
        <section
          style={{ marginTop: 24, padding: 20, border: "1px solid #e5e7eb", borderRadius: 12 }}
        >
          <strong>Undang admin (kedaluwarsa, bukan password bersama)</strong>
          <p style={{ color: "var(--muted)", marginTop: 4 }}>
            Hanya Super Admin yang melihat bagian ini. Undangan berlaku 72 jam
            dan sekali pakai.
          </p>
          <InviteForm />
        </section>
      )}
    </main>
  );
}

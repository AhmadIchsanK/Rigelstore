import Link from "next/link";
import { redirect } from "next/navigation";
import { loadPrincipal } from "@modules/core/auth/session";
import { AcceptForm } from "./AcceptForm";

export const metadata = { title: "Terima undangan admin — RigelStore" };
export const dynamic = "force-dynamic";

/**
 * Halaman menerima undangan admin. Butuh login lebih dulu (dengan email yang
 * diundang). Validasi token & masa berlaku dilakukan di server action.
 */
export default async function AcceptInvitePage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  const principal = await loadPrincipal();

  if (!token) {
    return (
      <main style={{ maxWidth: 480, margin: "0 auto", padding: "48px 24px" }}>
        <h1>Undangan admin</h1>
        <p style={{ color: "#b91c1c" }}>Link undangan tidak lengkap (token tidak ada).</p>
      </main>
    );
  }

  if (principal.kind === "guest") {
    redirect(`/login`);
  }

  return (
    <main style={{ maxWidth: 480, margin: "0 auto", padding: "48px 24px" }}>
      <Link href="/" style={{ color: "var(--muted)", textDecoration: "none" }}>
        ← Kembali
      </Link>
      <h1 style={{ color: "var(--brand)" }}>Undangan admin</h1>
      <p style={{ color: "var(--muted)" }}>Login sebagai {principal.email}.</p>
      <AcceptForm token={token} />
    </main>
  );
}

import Link from "next/link";
import { redirect } from "next/navigation";
import { loadPrincipal } from "@modules/core/auth/session";
import { isAdmin } from "@modules/core/auth/principal";
import { signOutEverywhere } from "../../login/actions";
import { TwoFactor } from "./TwoFactor";

export const metadata = { title: "Keamanan Akun" };
export const dynamic = "force-dynamic";

export default async function SecurityPage() {
  const principal = await loadPrincipal();
  if (principal.kind === "guest") redirect("/login");

  const isSuper = isAdmin(principal) && principal.role === "super_admin";

  return (
    <main className="container page" style={{ maxWidth: 620 }}>
      <Link href="/account" className="muted">← Akun saya</Link>
      <h1>Keamanan</h1>

      <section className="card card-pad" style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 18, marginTop: 0 }}>Verifikasi 2 langkah (2FA)</h2>
        {isSuper && (
          <p className="notice-error" style={{ marginTop: 0 }}>
            Sebagai Super Admin, sangat dianjurkan mengaktifkan 2FA.
          </p>
        )}
        <TwoFactor />
      </section>

      <section className="card card-pad">
        <h2 style={{ fontSize: 18, marginTop: 0 }}>Sesi</h2>
        <p className="muted">
          Keluar dari semua perangkat bila akunmu terasa tidak aman.
        </p>
        <form action={signOutEverywhere}>
          <button className="btn">Keluar dari semua perangkat</button>
        </form>
      </section>
    </main>
  );
}

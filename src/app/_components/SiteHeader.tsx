import Link from "next/link";
import { loadPrincipal } from "@modules/core/auth/session";
import { isAdmin } from "@modules/core/auth/principal";

/** Header toko: logo + navigasi ringkas, menyesuaikan status login. */
export async function SiteHeader() {
  const principal = await loadPrincipal();
  const loggedIn = principal.kind !== "guest";

  return (
    <header className="site-header">
      <div className="container bar">
        <Link href="/" className="brand">
          RigelStore
        </Link>
        <nav className="nav">
          <Link href="/catalog">Katalog</Link>
          {loggedIn ? (
            <>
              <Link href="/account">Akun</Link>
              {isAdmin(principal) && <Link href="/admin">Admin</Link>}
            </>
          ) : (
            <>
              <Link href="/orders/lookup">Lacak order</Link>
              <Link href="/login">Masuk</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

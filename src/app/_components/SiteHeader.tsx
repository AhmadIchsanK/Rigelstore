import Link from "next/link";
import { loadPrincipal } from "@modules/core/auth/session";
import { isAdmin } from "@modules/core/auth/principal";
import { Icon } from "./Icon";

/** Header toko sesuai design: logo, nav, tombol Login (kuning) + avatar. */
export async function SiteHeader() {
  const principal = await loadPrincipal();
  const loggedIn = principal.kind !== "guest";

  return (
    <header className="site-header">
      <div className="container bar">
        <Link href="/" className="logo">
          <span className="logo-mark">
            <Icon name="rocket" size={22} filled />
          </span>
          <span className="logo-name">RigelStore</span>
        </Link>

        <nav className="nav">
          <Link href="/">Home</Link>
          <Link href="/catalog">Catalog</Link>
          <Link href="/orders/lookup">Track Order</Link>
          {loggedIn && <Link href="/account">Akun</Link>}
          {isAdmin(principal) && <Link href="/admin">Admin</Link>}
        </nav>

        <div className="header-cta">
          {loggedIn ? (
            <Link href="/account" className="avatar" aria-label="Akun saya">
              <Icon name="person" size={18} />
            </Link>
          ) : (
            <>
              <Link href="/login" className="btn btn-secondary" style={{ padding: "9px 20px" }}>
                Login
              </Link>
              <Link href="/orders/lookup" className="avatar" aria-label="Lacak order">
                <Icon name="person" size={18} />
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

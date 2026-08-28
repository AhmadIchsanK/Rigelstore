import Link from "next/link";
import { LoginForm } from "./LoginForm";

export const metadata = { title: "Masuk — RigelStore" };

export default function LoginPage() {
  return (
    <main style={{ maxWidth: 420, margin: "0 auto", padding: "48px 24px" }}>
      <Link href="/" style={{ color: "var(--muted)", textDecoration: "none" }}>
        ← Kembali
      </Link>
      <h1 style={{ color: "var(--brand)" }}>RigelStore</h1>
      <LoginForm />
    </main>
  );
}

import { LoginForm } from "./LoginForm";

export const metadata = { title: "Masuk" };

export default function LoginPage() {
  return (
    <main className="container page" style={{ maxWidth: 460 }}>
      <h1 style={{ color: "var(--brand)" }}>Masuk / Daftar</h1>
      <div className="card card-pad" style={{ marginTop: 8 }}>
        <LoginForm />
      </div>
    </main>
  );
}

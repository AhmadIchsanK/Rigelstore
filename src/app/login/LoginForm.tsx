"use client";

import { useActionState } from "react";
import { type AuthState, signIn, signUp } from "./actions";

const initial: AuthState = { error: null };

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  border: "1px solid #d1d5db",
  borderRadius: 8,
  marginTop: 4,
};

const buttonStyle: React.CSSProperties = {
  padding: "10px 14px",
  borderRadius: 8,
  border: "none",
  cursor: "pointer",
  fontWeight: 600,
};

export function LoginForm() {
  const [signInState, signInAction, signingIn] = useActionState(signIn, initial);
  const [signUpState, signUpAction, signingUp] = useActionState(signUp, initial);

  return (
    <div style={{ display: "grid", gap: 32 }}>
      <form action={signInAction} style={{ display: "grid", gap: 12 }}>
        <h2 style={{ margin: 0 }}>Masuk</h2>
        <label>
          Email
          <input style={inputStyle} type="email" name="email" autoComplete="email" required />
        </label>
        <label>
          Password
          <input
            style={inputStyle}
            type="password"
            name="password"
            autoComplete="current-password"
            required
          />
        </label>
        {signInState.error && <p style={{ color: "#b91c1c", margin: 0 }}>{signInState.error}</p>}
        <button style={{ ...buttonStyle, background: "var(--brand)", color: "#fff" }} disabled={signingIn}>
          {signingIn ? "Memproses…" : "Masuk"}
        </button>
      </form>

      <form action={signUpAction} style={{ display: "grid", gap: 12 }}>
        <h2 style={{ margin: 0 }}>Daftar akun pelanggan</h2>
        <label>
          Email
          <input style={inputStyle} type="email" name="email" autoComplete="email" required />
        </label>
        <label>
          Password (min. 8 karakter)
          <input
            style={inputStyle}
            type="password"
            name="password"
            autoComplete="new-password"
            required
          />
        </label>
        {signUpState.error && <p style={{ color: "#b91c1c", margin: 0 }}>{signUpState.error}</p>}
        {signUpState.ok && (
          <p style={{ color: "#15803d", margin: 0 }} data-testid="signup-hint">
            Berhasil daftar. Jika verifikasi email aktif, cek email untuk konfirmasi lalu masuk.
          </p>
        )}
        <button style={{ ...buttonStyle, background: "#111827", color: "#fff" }} disabled={signingUp}>
          {signingUp ? "Memproses…" : "Daftar"}
        </button>
      </form>
    </div>
  );
}

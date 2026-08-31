"use client";

import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@modules/database/supabase/client";

type Factor = { id: string; status: string; friendly_name?: string | null };

/**
 * Aktivasi 2FA (TOTP) via Supabase MFA. Untuk Super Admin sangat dianjurkan.
 * Alur: enroll → tampilkan QR → masukkan kode dari aplikasi authenticator → verify.
 */
export function TwoFactor() {
  const supabase = createSupabaseBrowserClient();
  const [factors, setFactors] = useState<Factor[]>([]);
  const [loading, setLoading] = useState(true);
  const [enroll, setEnroll] = useState<{ factorId: string; qr: string; secret: string } | null>(null);
  const [code, setCode] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function refresh() {
    setLoading(true);
    const { data } = await supabase.auth.mfa.listFactors();
    setFactors((data?.totp ?? []) as Factor[]);
    setLoading(false);
  }

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function startEnroll() {
    setMsg(null);
    setBusy(true);
    const { data, error } = await supabase.auth.mfa.enroll({ factorType: "totp" });
    setBusy(false);
    if (error || !data) {
      setMsg("Gagal memulai 2FA: " + (error?.message ?? ""));
      return;
    }
    setEnroll({ factorId: data.id, qr: data.totp.qr_code, secret: data.totp.secret });
  }

  async function verify() {
    if (!enroll) return;
    setBusy(true);
    setMsg(null);
    const { error } = await supabase.auth.mfa.challengeAndVerify({
      factorId: enroll.factorId,
      code: code.trim(),
    });
    setBusy(false);
    if (error) {
      setMsg("Kode salah / kedaluwarsa. Coba lagi.");
      return;
    }
    setEnroll(null);
    setCode("");
    setMsg("2FA berhasil diaktifkan.");
    refresh();
  }

  async function disable(factorId: string) {
    setBusy(true);
    await supabase.auth.mfa.unenroll({ factorId });
    setBusy(false);
    refresh();
  }

  const active = factors.filter((f) => f.status === "verified");

  if (loading) return <p className="muted">Memuat status 2FA…</p>;

  return (
    <div>
      {active.length > 0 ? (
        <div>
          <p className="notice-success">✅ 2FA aktif.</p>
          {active.map((f) => (
            <button
              key={f.id}
              className="btn"
              disabled={busy}
              onClick={() => disable(f.id)}
              style={{ marginTop: 8 }}
            >
              Nonaktifkan 2FA
            </button>
          ))}
        </div>
      ) : enroll ? (
        <div style={{ display: "grid", gap: 12, maxWidth: 320 }}>
          <p className="muted">
            Pindai QR ini dengan aplikasi authenticator (Google Authenticator,
            Authy, dll), lalu masukkan 6 digit kodenya.
          </p>
          <div
            style={{ width: 200, height: 200 }}
            dangerouslySetInnerHTML={{ __html: enroll.qr }}
          />
          <code style={{ fontSize: 12, wordBreak: "break-all" }}>{enroll.secret}</code>
          <input
            className="input"
            inputMode="numeric"
            placeholder="123456"
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
          <button className="btn btn-primary" disabled={busy} onClick={verify}>
            {busy ? "Memverifikasi…" : "Verifikasi & aktifkan"}
          </button>
        </div>
      ) : (
        <button className="btn btn-primary" disabled={busy} onClick={startEnroll}>
          {busy ? "Menyiapkan…" : "Aktifkan 2FA"}
        </button>
      )}
      {msg && <p style={{ marginTop: 8 }}>{msg}</p>}
    </div>
  );
}

"use server";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@modules/database/supabase/server";
import { createSupabaseAdminClient } from "@modules/database/supabase/admin";
import { logAudit } from "@modules/core/audit/log";
import { clientKey, rateLimit } from "@modules/core/security/rateLimit";

export type AuthState = { error: string | null; ok?: boolean };

function readCredentials(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  return { email, password };
}

/** Login dengan email + password (Supabase Auth). */
export async function signIn(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const { email, password } = readCredentials(formData);
  if (!email || !password) return { error: "Email dan password wajib diisi." };

  // Rate limit: 8 percobaan login per 5 menit per IP.
  if (!(await rateLimit(await clientKey("login"), 8, 300))) {
    return { error: "Terlalu banyak percobaan login. Coba lagi beberapa menit." };
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: "Email atau password salah." };

  // Audit login admin (SECURITY.md §4).
  if (data.user) {
    const admin = createSupabaseAdminClient();
    const { data: adminRow } = await admin
      .from("admin_users")
      .select("role_key, is_active")
      .eq("id", data.user.id)
      .eq("is_active", true)
      .maybeSingle();
    if (adminRow) {
      await logAudit({
        actorId: data.user.id,
        actorRole: adminRow.role_key,
        action: "admin.login",
        targetType: "admin_user",
        targetId: data.user.id,
      });
    }
  }

  redirect("/");
}

/** Daftar akun pelanggan baru. Admin TIDAK dibuat lewat sini. */
export async function signUp(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const { email, password } = readCredentials(formData);
  if (!email || !password) return { error: "Email dan password wajib diisi." };
  if (password.length < 8) return { error: "Password minimal 8 karakter." };

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signUp({ email, password });
  if (error) return { error: "Gagal mendaftar. Coba email lain." };

  return { error: null, ok: true };
}

/** Logout sesi saat ini. */
export async function signOut(): Promise<void> {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/login");
}

/** Logout dari SEMUA perangkat (session revoke global). */
export async function signOutEverywhere(): Promise<void> {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut({ scope: "global" });
  redirect("/login");
}

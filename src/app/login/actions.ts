"use server";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@modules/database/supabase/server";

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

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: "Email atau password salah." };

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

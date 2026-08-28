import "server-only";

/**
 * Memuat Principal dari sesi Supabase yang sedang aktif (server-side).
 *
 * Alur: baca user dari sesi -> jika ada, cek apakah ia admin AKTIF di
 * `admin_users` -> kembalikan Principal yang sesuai (guest/customer/admin).
 *
 * Pengecekan admin memakai RLS + fungsi is_admin() di database, jadi seorang
 * pelanggan biasa TIDAK bisa memuat baris admin milik siapa pun.
 */
import { createSupabaseServerClient } from "@modules/database/supabase/server";
import { isRole } from "../rbac/permissions";
import { type Principal, GUEST } from "./principal";

export async function loadPrincipal(): Promise<Principal> {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return GUEST;

  // Apakah user ini admin aktif? RLS mengizinkan baca baris ini hanya bila
  // is_admin() true (SECURITY DEFINER), jadi hasilnya deterministik.
  const { data: adminRow } = await supabase
    .from("admin_users")
    .select("role_key, is_active")
    .eq("id", user.id)
    .eq("is_active", true)
    .maybeSingle();

  if (adminRow && adminRow.is_active && isRole(adminRow.role_key)) {
    return {
      kind: "admin",
      userId: user.id,
      email: user.email ?? null,
      role: adminRow.role_key,
      isActive: true,
    };
  }

  return {
    kind: "customer",
    userId: user.id,
    email: user.email ?? null,
  };
}

import "server-only";

/**
 * Klien Supabase dengan kunci service_role — MELEWATI RLS.
 * HANYA untuk operasi terprivilese di server (mis. mencatat audit log,
 * membuat undangan admin, bootstrap Super Admin).
 *
 * JANGAN pernah dipakai untuk melayani permintaan pengguna biasa tanpa
 * pengecekan otorisasi deterministik terlebih dahulu (lihat modul core/auth).
 */
import { createClient } from "@supabase/supabase-js";
import { supabaseServiceRoleKey, supabaseUrl } from "./env";

export function createSupabaseAdminClient() {
  return createClient(supabaseUrl(), supabaseServiceRoleKey(), {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

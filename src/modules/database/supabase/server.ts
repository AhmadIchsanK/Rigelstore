import "server-only";

/**
 * Klien Supabase untuk SERVER (server component, server action, route handler).
 * Sesi pengguna dibaca/ditulis lewat cookies. RLS berlaku sesuai sesi pengguna.
 */
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import { supabaseAnonKey, supabaseUrl } from "./env";

export async function createSupabaseServerClient() {
  const cookieStore = await cookies();

  return createServerClient(supabaseUrl(), supabaseAnonKey(), {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Dipanggil dari Server Component tanpa akses tulis cookie.
          // Aman diabaikan bila middleware yang menyegarkan sesi.
        }
      },
    },
  });
}

import "server-only";

/**
 * Rate limiting (Fase 8). Berbasis DB agar konsisten lintas instance serverless.
 * `allowed=false` berarti batas terlampaui — pemanggil menolak permintaan.
 */
import { createSupabaseAdminClient } from "@modules/database/supabase/admin";

export async function rateLimit(
  key: string,
  max: number,
  windowSeconds: number,
): Promise<boolean> {
  try {
    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase.rpc("rate_limit_hit", {
      p_key: key,
      p_max: max,
      p_window_seconds: windowSeconds,
    });
    if (error) return true; // jangan blokir pengguna bila rate-limiter bermasalah
    return Boolean(data);
  } catch {
    return true;
  }
}

/** Ambil IP klien dari header (untuk kunci rate-limit). */
export async function clientKey(prefix: string): Promise<string> {
  const { headers } = await import("next/headers");
  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  return `${prefix}:${ip}`;
}

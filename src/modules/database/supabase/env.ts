/**
 * Pembacaan environment variables Supabase di satu tempat.
 * TIDAK ada nilai rahasia di kode — semua dibaca dari environment.
 */

export function supabaseUrl(): string {
  const v = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!v) throw new Error("NEXT_PUBLIC_SUPABASE_URL belum diset (lihat .env.example).");
  return v;
}

/** Kunci publik (publishable/anon) — aman dipakai di browser. */
export function supabaseAnonKey(): string {
  const v = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!v) throw new Error("NEXT_PUBLIC_SUPABASE_ANON_KEY belum diset (lihat .env.example).");
  return v;
}

/**
 * Kunci service_role — RAHASIA, hanya di server. JANGAN pernah diekspos ke
 * browser. Dibaca lewat fungsi ini agar mudah dilacak.
 */
export function supabaseServiceRoleKey(): string {
  const v = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!v) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY belum diset. Isi di environment (mis. .env.local / Vercel), jangan di kode.",
    );
  }
  return v;
}

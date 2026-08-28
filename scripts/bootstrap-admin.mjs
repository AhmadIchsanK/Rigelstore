/**
 * Bootstrap Super Admin PERTAMA.
 *
 * Karena admin baru hanya dibuat lewat undangan, Super Admin pertama perlu
 * dibuat manual satu kali. Script ini mempromosikan pengguna yang SUDAH
 * mendaftar (lewat halaman /login) menjadi admin dengan peran tertentu.
 *
 * Memakai kunci service_role (RAHASIA) dari environment — TIDAK ada rahasia
 * di dalam kode.
 *
 * Cara pakai:
 *   1) Daftar dulu akunmu di aplikasi (halaman /login -> Daftar).
 *   2) Set env: NEXT_PUBLIC_SUPABASE_URL dan SUPABASE_SERVICE_ROLE_KEY.
 *   3) Jalankan:
 *        node scripts/bootstrap-admin.mjs you@email.com super_admin
 *      (peran opsional; default super_admin)
 */
import { createClient } from "@supabase/supabase-js";

const email = process.argv[2];
const role = process.argv[3] ?? "super_admin";
const VALID_ROLES = ["super_admin", "admin", "content_admin", "support_admin"];

if (!email) {
  console.error("Pemakaian: node scripts/bootstrap-admin.mjs <email> [role]");
  process.exit(1);
}
if (!VALID_ROLES.includes(role)) {
  console.error(`Peran tidak valid: ${role}. Pilih salah satu: ${VALID_ROLES.join(", ")}`);
  process.exit(1);
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !serviceKey) {
  console.error("Set NEXT_PUBLIC_SUPABASE_URL dan SUPABASE_SERVICE_ROLE_KEY dulu di environment.");
  process.exit(1);
}

const supabase = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// Cari user auth berdasarkan email.
let user = null;
let page = 1;
while (!user) {
  const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 200 });
  if (error) {
    console.error("Gagal membaca daftar user:", error.message);
    process.exit(1);
  }
  user = data.users.find((u) => (u.email ?? "").toLowerCase() === email.toLowerCase());
  if (data.users.length < 200) break;
  page += 1;
}

if (!user) {
  console.error(`User dengan email ${email} belum ada. Daftar dulu lewat halaman /login.`);
  process.exit(1);
}

const { error: upsertErr } = await supabase
  .from("admin_users")
  .upsert({ id: user.id, role_key: role, is_active: true }, { onConflict: "id" });

if (upsertErr) {
  console.error("Gagal mempromosikan admin:", upsertErr.message);
  process.exit(1);
}

await supabase.from("audit_logs").insert({
  actor_id: user.id,
  actor_role: role,
  action: "admin.bootstrap",
  target_type: "admin_user",
  target_id: user.id,
  metadata: { via: "bootstrap-admin.mjs", role },
});

console.log(`Sukses: ${email} kini ${role}. Buka /admin setelah login.`);
process.exit(0);

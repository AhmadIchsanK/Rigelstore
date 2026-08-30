"use server";

/**
 * Server action undangan admin. Semua aksi DITEGAKKAN di server:
 * - Membuat undangan butuh izin `admins.manage` (Super Admin).
 * - Menerima undangan memvalidasi token, masa berlaku, dan status pakai.
 */
import { loadPrincipal } from "@modules/core/auth/session";
import { assertPermission, AuthorizationError } from "@modules/core/auth/principal";
import {
  canAcceptInvitation,
  generateInviteToken,
  hashInviteToken,
  invitationExpiry,
} from "@modules/core/admin/invitations";
import { isRole, type Role } from "@modules/core/rbac/permissions";
import { logAudit } from "@modules/core/audit/log";
import { createSupabaseAdminClient } from "@modules/database/supabase/admin";

export type CreateInviteState = { error: string | null; inviteUrl?: string };

/** Super Admin membuat undangan admin baru; mengembalikan link undangan. */
export async function createInvitation(
  _prev: CreateInviteState,
  formData: FormData,
): Promise<CreateInviteState> {
  const principal = await loadPrincipal();
  try {
    assertPermission(principal, "admins.manage");
  } catch (e) {
    if (e instanceof AuthorizationError) return { error: "Tidak berwenang membuat undangan." };
    throw e;
  }

  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const roleKey = String(formData.get("role") ?? "");
  if (!email) return { error: "Email wajib diisi." };
  if (!isRole(roleKey) || roleKey === "super_admin") {
    return { error: "Peran tidak valid untuk undangan." };
  }
  const role = roleKey as Role;

  const token = generateInviteToken();
  const supabase = createSupabaseAdminClient();

  const { error } = await supabase.from("admin_invitations").insert({
    email,
    role_key: role,
    token_hash: hashInviteToken(token),
    invited_by: principal.userId,
    expires_at: invitationExpiry().toISOString(),
  });
  if (error) return { error: "Gagal membuat undangan." };

  await logAudit({
    actorId: principal.userId,
    actorRole: principal.role,
    action: "admin.invite.create",
    targetType: "admin_invitation",
    targetId: email,
    metadata: { role },
  });

  const base = process.env.NEXT_PUBLIC_APP_URL ?? "";
  return { error: null, inviteUrl: `${base}/admin/invite?token=${token}` };
}

export type AcceptInviteState = { error: string | null; ok?: boolean };

/**
 * Pengguna yang SUDAH login menerima undangan. Emailnya harus cocok dengan
 * undangan. Setelah diterima, ia menjadi admin dengan peran undangan.
 */
export async function acceptInvitation(
  _prev: AcceptInviteState,
  formData: FormData,
): Promise<AcceptInviteState> {
  const token = String(formData.get("token") ?? "");
  if (!token) return { error: "Token undangan tidak ada." };

  const principal = await loadPrincipal();
  if (principal.kind === "guest") {
    return { error: "Silakan login/daftar dulu dengan email yang diundang, lalu buka link ini lagi." };
  }

  const supabase = createSupabaseAdminClient();
  const { data: invite } = await supabase
    .from("admin_invitations")
    .select("id, email, role_key, invited_by, expires_at, accepted_at, revoked_at")
    .eq("token_hash", hashInviteToken(token))
    .maybeSingle();

  if (!invite) return { error: "Undangan tidak ditemukan." };
  if (!canAcceptInvitation(invite)) return { error: "Undangan sudah kedaluwarsa atau terpakai." };
  if (principal.email?.toLowerCase() !== invite.email.toLowerCase()) {
    return { error: "Email akun tidak cocok dengan undangan." };
  }
  if (!isRole(invite.role_key)) return { error: "Peran undangan tidak valid." };

  // Jadikan admin (idempoten via upsert pada primary key = user id).
  const { error: upsertErr } = await supabase.from("admin_users").upsert(
    {
      id: principal.userId,
      role_key: invite.role_key,
      is_active: true,
      created_by: invite.invited_by,
    },
    { onConflict: "id" },
  );
  if (upsertErr) return { error: "Gagal mengaktifkan akun admin." };

  await supabase
    .from("admin_invitations")
    .update({ accepted_at: new Date().toISOString() })
    .eq("id", invite.id);

  await logAudit({
    actorId: principal.userId,
    actorRole: invite.role_key,
    action: "admin.invite.accept",
    targetType: "admin_user",
    targetId: principal.userId,
    metadata: { role: invite.role_key },
  });

  return { error: null, ok: true };
}

/**
 * Logika undangan admin yang KEDALUWARSA (SECURITY.md) — deterministik.
 *
 * Undangan memakai token acak sekali pakai. Yang disimpan di database adalah
 * HASH token (bukan token mentah), sehingga bocornya isi database tidak
 * langsung memberi token yang bisa dipakai. Status undangan diturunkan murni
 * dari data + waktu, jadi mudah diuji.
 */
import { createHash, randomBytes } from "node:crypto";

/** Masa berlaku undangan default: 72 jam. */
export const DEFAULT_INVITE_TTL_MS = 72 * 60 * 60 * 1000;

/** Buat token undangan acak (dikirim ke calon admin, TIDAK disimpan mentah). */
export function generateInviteToken(): string {
  return randomBytes(32).toString("base64url");
}

/** Hash token untuk disimpan/dibandingkan di database. */
export function hashInviteToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export type InvitationRow = {
  expires_at: string; // ISO
  accepted_at: string | null;
  revoked_at: string | null;
};

export type InvitationStatus = "pending" | "accepted" | "revoked" | "expired";

/** Status undangan diturunkan dari data + waktu sekarang. */
export function invitationStatus(row: InvitationRow, now: Date = new Date()): InvitationStatus {
  if (row.accepted_at) return "accepted";
  if (row.revoked_at) return "revoked";
  if (new Date(row.expires_at).getTime() <= now.getTime()) return "expired";
  return "pending";
}

/** Hanya undangan berstatus 'pending' yang boleh diterima. */
export function canAcceptInvitation(row: InvitationRow, now: Date = new Date()): boolean {
  return invitationStatus(row, now) === "pending";
}

/** Hitung waktu kedaluwarsa dari sekarang. */
export function invitationExpiry(now: Date = new Date(), ttlMs: number = DEFAULT_INVITE_TTL_MS): Date {
  return new Date(now.getTime() + ttlMs);
}

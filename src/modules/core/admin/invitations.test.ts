import { describe, expect, it } from "vitest";
import {
  type InvitationRow,
  canAcceptInvitation,
  generateInviteToken,
  hashInviteToken,
  invitationExpiry,
  invitationStatus,
} from "./invitations";

const now = new Date("2026-01-01T00:00:00Z");
const future = new Date("2026-01-02T00:00:00Z").toISOString();
const past = new Date("2025-12-31T00:00:00Z").toISOString();

function row(over: Partial<InvitationRow>): InvitationRow {
  return { expires_at: future, accepted_at: null, revoked_at: null, ...over };
}

describe("undangan admin kedaluwarsa", () => {
  it("token disimpan sebagai hash, bukan mentah; hash stabil & berbeda per token", () => {
    const t1 = generateInviteToken();
    const t2 = generateInviteToken();
    expect(t1).not.toEqual(t2);
    expect(hashInviteToken(t1)).toEqual(hashInviteToken(t1));
    expect(hashInviteToken(t1)).not.toEqual(t2); // hash != token mentah
    expect(hashInviteToken(t1)).toHaveLength(64); // sha256 hex
  });

  it("undangan valid & belum lewat = pending, boleh diterima", () => {
    expect(invitationStatus(row({}), now)).toBe("pending");
    expect(canAcceptInvitation(row({}), now)).toBe(true);
  });

  it("undangan kedaluwarsa TIDAK boleh diterima", () => {
    expect(invitationStatus(row({ expires_at: past }), now)).toBe("expired");
    expect(canAcceptInvitation(row({ expires_at: past }), now)).toBe(false);
  });

  it("undangan yang sudah dipakai TIDAK boleh dipakai lagi", () => {
    const used = row({ accepted_at: now.toISOString() });
    expect(invitationStatus(used, now)).toBe("accepted");
    expect(canAcceptInvitation(used, now)).toBe(false);
  });

  it("undangan yang dicabut TIDAK boleh diterima", () => {
    const revoked = row({ revoked_at: now.toISOString() });
    expect(invitationStatus(revoked, now)).toBe("revoked");
    expect(canAcceptInvitation(revoked, now)).toBe(false);
  });

  it("expiry dihitung ke depan dari sekarang", () => {
    expect(invitationExpiry(now, 1000).getTime()).toBe(now.getTime() + 1000);
  });
});

import "server-only";

import { redirect } from "next/navigation";
import { loadPrincipal } from "@modules/core/auth/session";
import { type AdminPrincipal, type Principal, can, isAdmin } from "@modules/core/auth/principal";
import { type Permission } from "@modules/core/rbac/permissions";

export type GuardResult =
  | { denied: false; principal: AdminPrincipal }
  | { denied: true; principal: Principal };

/**
 * Gerbang halaman admin (server). Guest dialihkan ke /login. Non-admin atau
 * admin tanpa izin `perm` ditandai denied -> halaman menampilkan 403.
 */
export async function requirePagePermission(perm?: Permission): Promise<GuardResult> {
  const principal = await loadPrincipal();
  if (principal.kind === "guest") {
    redirect("/login");
  }
  if (!isAdmin(principal)) {
    return { denied: true, principal };
  }
  if (perm && !can(principal, perm)) {
    return { denied: true, principal };
  }
  return { denied: false, principal };
}

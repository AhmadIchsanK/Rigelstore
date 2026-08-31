"use server";

import { revalidatePath } from "next/cache";
import { assertPermission, AuthorizationError } from "@modules/core/auth/principal";
import { loadPrincipal } from "@modules/core/auth/session";
import { addMessage, setTicketStatus } from "@modules/core/support/service";

export type AdminReplyState = { error: string | null };

export async function adminReplyAction(
  _prev: AdminReplyState,
  formData: FormData,
): Promise<AdminReplyState> {
  const principal = await loadPrincipal();
  try {
    assertPermission(principal, "support.manage");
  } catch (e) {
    if (e instanceof AuthorizationError) return { error: "Tidak berwenang." };
    throw e;
  }
  const ticketId = String(formData.get("ticket_id") ?? "");
  const body = String(formData.get("body") ?? "").trim();
  if (!ticketId || !body) return { error: "Pesan kosong." };

  await addMessage({ ticketId, author: "admin", authorId: principal.userId, body });
  revalidatePath(`/admin/support/${ticketId}`);
  return { error: null };
}

export async function setStatusAction(formData: FormData): Promise<void> {
  const ticketId = String(formData.get("ticket_id") ?? "");
  const status = String(formData.get("status") ?? "");
  if (!["open", "answered", "closed"].includes(status)) return;
  const principal = await loadPrincipal();
  assertPermission(principal, "support.manage");
  await setTicketStatus(ticketId, status as "open" | "answered" | "closed");
  revalidatePath(`/admin/support/${ticketId}`);
}

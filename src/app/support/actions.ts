"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { loadPrincipal } from "@modules/core/auth/session";
import { addMessage, createTicket, getTicketWithMessages } from "@modules/core/support/service";
import { rateLimit } from "@modules/core/security/rateLimit";

export type TicketFormState = { error: string | null };

export async function createTicketAction(
  _prev: TicketFormState,
  formData: FormData,
): Promise<TicketFormState> {
  const principal = await loadPrincipal();
  if (principal.kind === "guest") return { error: "Silakan login dulu." };

  const subject = String(formData.get("subject") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();
  const orderNumber = String(formData.get("order_number") ?? "").trim() || null;
  if (!subject || !body) return { error: "Subjek dan pesan wajib diisi." };

  // Rate limit: 5 tiket per 10 menit per pengguna.
  if (!(await rateLimit(`ticket:${principal.userId}`, 5, 600))) {
    return { error: "Terlalu banyak tiket dalam waktu singkat. Coba lagi nanti." };
  }

  const id = await createTicket({ userId: principal.userId, subject, body, orderNumber });
  redirect(`/support/${id}`);
}

export async function replyTicketAction(
  _prev: TicketFormState,
  formData: FormData,
): Promise<TicketFormState> {
  const principal = await loadPrincipal();
  if (principal.kind === "guest") return { error: "Silakan login dulu." };

  const ticketId = String(formData.get("ticket_id") ?? "");
  const body = String(formData.get("body") ?? "").trim();
  if (!ticketId || !body) return { error: "Pesan kosong." };

  // Pastikan tiket milik pengguna ini.
  const data = await getTicketWithMessages(ticketId);
  if (!data || data.ticket.user_id !== principal.userId) return { error: "Tiket tidak ditemukan." };

  await addMessage({ ticketId, author: "customer", authorId: principal.userId, body });
  revalidatePath(`/support/${ticketId}`);
  return { error: null };
}

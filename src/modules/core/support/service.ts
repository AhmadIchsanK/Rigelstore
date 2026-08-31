import "server-only";

/** Support tickets (Fase 7). Pelanggan login membuat & membalas; admin mengelola. */
import { createSupabaseAdminClient } from "@modules/database/supabase/admin";

export async function createTicket(input: {
  userId: string;
  subject: string;
  body: string;
  orderNumber?: string | null;
}): Promise<string> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("support_tickets")
    .insert({
      user_id: input.userId,
      subject: input.subject,
      order_number: input.orderNumber ?? null,
      status: "open",
    })
    .select("id")
    .single();
  if (error || !data) throw new Error(error?.message ?? "gagal buat tiket");
  await supabase.from("support_messages").insert({
    ticket_id: data.id,
    author: "customer",
    author_id: input.userId,
    body: input.body,
  });
  return data.id;
}

export async function listUserTickets(userId: string) {
  const supabase = createSupabaseAdminClient();
  const { data } = await supabase
    .from("support_tickets")
    .select("id, subject, status, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  return data ?? [];
}

export async function listAllTickets() {
  const supabase = createSupabaseAdminClient();
  const { data } = await supabase
    .from("support_tickets")
    .select("id, subject, status, user_id, order_number, created_at")
    .order("created_at", { ascending: false })
    .limit(100);
  return data ?? [];
}

export async function getTicketWithMessages(ticketId: string) {
  const supabase = createSupabaseAdminClient();
  const { data: ticket } = await supabase
    .from("support_tickets")
    .select("id, subject, status, user_id, order_number, created_at")
    .eq("id", ticketId)
    .maybeSingle();
  if (!ticket) return null;
  const { data: messages } = await supabase
    .from("support_messages")
    .select("id, author, body, created_at")
    .eq("ticket_id", ticketId)
    .order("created_at", { ascending: true });
  return { ticket, messages: messages ?? [] };
}

export async function addMessage(input: {
  ticketId: string;
  author: "customer" | "admin";
  authorId: string;
  body: string;
}): Promise<void> {
  const supabase = createSupabaseAdminClient();
  await supabase.from("support_messages").insert({
    ticket_id: input.ticketId,
    author: input.author,
    author_id: input.authorId,
    body: input.body,
  });
  // Status: balasan admin -> answered; balasan customer -> open.
  await supabase
    .from("support_tickets")
    .update({ status: input.author === "admin" ? "answered" : "open" })
    .eq("id", input.ticketId);
}

export async function setTicketStatus(
  ticketId: string,
  status: "open" | "answered" | "closed",
): Promise<void> {
  const supabase = createSupabaseAdminClient();
  await supabase.from("support_tickets").update({ status }).eq("id", ticketId);
}

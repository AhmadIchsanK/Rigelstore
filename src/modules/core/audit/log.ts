import "server-only";

/**
 * Pencatatan audit log (SECURITY.md §4). Ditulis lewat klien service_role
 * agar tercatat andal, dan hanya dipanggil dari jalur server yang sudah
 * memverifikasi otorisasi.
 */
import { createSupabaseAdminClient } from "@modules/database/supabase/admin";

export type AuditEntry = {
  actorId: string | null;
  actorRole?: string | null;
  action: string;
  targetType?: string | null;
  targetId?: string | null;
  metadata?: Record<string, unknown>;
  ipAddress?: string | null;
};

export async function logAudit(entry: AuditEntry): Promise<void> {
  const supabase = createSupabaseAdminClient();
  await supabase.from("audit_logs").insert({
    actor_id: entry.actorId,
    actor_role: entry.actorRole ?? null,
    action: entry.action,
    target_type: entry.targetType ?? null,
    target_id: entry.targetId ?? null,
    metadata: entry.metadata ?? {},
    ip_address: entry.ipAddress ?? null,
  });
}

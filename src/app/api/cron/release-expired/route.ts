import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseAdminClient } from "@modules/database/supabase/admin";

/**
 * Cron: kadaluwarsakan order pending yang lewat waktu & lepas stoknya kembali.
 * Dilindungi CRON_SECRET. Atur di Vercel Cron (mis. tiap menit).
 */
export const dynamic = "force-dynamic";

function authorized(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const header = req.headers.get("authorization");
  const url = new URL(req.url);
  return header === `Bearer ${secret}` || url.searchParams.get("key") === secret;
}

async function run(): Promise<number> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase.rpc("expire_due_orders");
  if (error) throw new Error(error.message);
  return Number(data ?? 0);
}

export async function GET(req: NextRequest) {
  if (!authorized(req)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const expired = await run();
  return NextResponse.json({ expired });
}

export async function POST(req: NextRequest) {
  return GET(req);
}

import "server-only";

/** Ringkasan analitik penjualan (Fase 7). Sumber: fungsi SQL sales_overview(). */
import { createSupabaseAdminClient } from "@modules/database/supabase/admin";

export type SalesOverview = {
  revenue_total: number;
  orders_paid: number;
  orders_pending: number;
  orders_expired: number;
  aov: number;
  telegram_orders: number;
  web_orders: number;
  revenue_7d: { day: string; revenue: number }[];
  top_products: { title: string; revenue: number; qty: number }[];
};

export async function getSalesOverview(): Promise<SalesOverview> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase.rpc("sales_overview");
  if (error) throw new Error(error.message);
  return data as SalesOverview;
}

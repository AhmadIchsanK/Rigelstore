import type { MetadataRoute } from "next";
import { createSupabaseServerClient } from "@modules/database/supabase/server";

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${appUrl}/`, priority: 1 },
    { url: `${appUrl}/catalog`, priority: 0.8 },
    { url: `${appUrl}/orders/lookup`, priority: 0.3 },
  ];

  try {
    const supabase = await createSupabaseServerClient();
    const { data } = await supabase
      .from("products")
      .select("slug, updated_at")
      .eq("status", "published");
    const productRoutes: MetadataRoute.Sitemap = (data ?? []).map((p) => ({
      url: `${appUrl}/p/${p.slug}`,
      lastModified: p.updated_at ? new Date(p.updated_at) : undefined,
      priority: 0.7,
    }));
    return [...staticRoutes, ...productRoutes];
  } catch {
    return staticRoutes;
  }
}

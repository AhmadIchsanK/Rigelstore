"use client";

/**
 * Klien Supabase untuk BROWSER (komponen client).
 * Memakai kunci publik saja. Aman dipakai di sisi klien.
 */
import { createBrowserClient } from "@supabase/ssr";
import { supabaseAnonKey, supabaseUrl } from "./env";

export function createSupabaseBrowserClient() {
  return createBrowserClient(supabaseUrl(), supabaseAnonKey());
}

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

function getSupabaseUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  return raw.replace(/\/rest\/v1\/?$/, "");
}

let browserClient: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (browserClient) return browserClient;

  const url = getSupabaseUrl();
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

  if (!url || !key) {
    throw new Error("Missing Supabase environment variables.");
  }

  browserClient = createClient(url, key, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });

  return browserClient;
}

/** @deprecated Use getSupabase() */
export function createSupabaseClient() {
  return getSupabase();
}

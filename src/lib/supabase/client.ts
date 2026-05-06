import { createBrowserClient } from "@supabase/ssr";

// createClient returns a Supabase browser client for future client-side lead and audit reads.
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}

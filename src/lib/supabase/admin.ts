import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

/**
 * Service-role Supabase client that bypasses RLS.
 * ONLY use this on the server for admin operations.
 * Never import this file in client components.
 */
export function createAdminClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}

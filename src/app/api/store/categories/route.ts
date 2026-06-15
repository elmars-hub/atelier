import { createClient } from "@supabase/supabase-js";
import { jsonResponse, errorResponse } from "@/lib/api-utils";

export async function GET() {
  try {
    // We use the anonymous client for public store APIs to ensure RLS is enforced
    // if there are public policies, or we can use the service key if we want to
    // explicitly bypass RLS for public read-only endpoints since our data is safe.
    // Actually, since Categories are public but we haven't written RLS policies, 
    // it's safest to use the admin client for read-only store APIs.
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .eq("is_active", true)
      .order("display_order", { ascending: true });

    if (error) throw error;

    return jsonResponse(data);
  } catch (err) {
    console.error("[Store Categories API]", err);
    return errorResponse("Failed to load categories", 500);
  }
}

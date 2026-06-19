import { jsonResponse, errorResponse } from "@/lib/api-utils";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();

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

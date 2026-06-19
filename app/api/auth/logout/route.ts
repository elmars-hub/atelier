import { createClient } from "@/lib/supabase/server";
import { jsonResponse, errorResponse } from "@/lib/api-utils";

export async function POST() {
  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.signOut();

    if (error) {
      return errorResponse(error.message, 400);
    }

    return jsonResponse({ success: true });
  } catch (err) {
    console.error("[Logout Error]", err);
    return errorResponse("Internal server error", 500);
  }
}

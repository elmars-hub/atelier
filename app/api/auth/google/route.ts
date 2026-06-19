import { createClient } from "@/lib/supabase/server";
import { jsonResponse, errorResponse } from "@/lib/api-utils";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    const origin = request.headers.get("origin") || "http://localhost:3000";

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${origin}/api/auth/callback`,
      },
    });

    if (error) {
      return errorResponse(error.message, 400);
    }

    return jsonResponse({ url: data.url });
  } catch (err) {
    console.error("[Google OAuth Error]", err);
    return errorResponse("Internal server error", 500);
  }
}

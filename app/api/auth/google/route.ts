import { createClient } from "@/lib/supabase/server";
import { jsonResponse, errorResponse } from "@/lib/api-utils";

export async function POST(_request: Request) {
  try {
    const supabase = await createClient();

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${appUrl}/api/auth/callback`,
        queryParams: { access_type: "offline", prompt: "consent" },
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

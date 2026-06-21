import { createClient } from "@/lib/supabase/server";
import { forgotPasswordSchema } from "@/lib/validations/auth";
import { jsonResponse, errorResponse, parseBody } from "@/lib/api-utils";

export async function POST(request: Request) {
  try {
    const parsed = await parseBody(request, forgotPasswordSchema);
    if (parsed.error) return parsed.error;

    const { email } = parsed.data;
    const supabase = await createClient();

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${appUrl}/api/auth/callback?next=/reset-password`,
    });

    if (error) {
      return errorResponse(error.message, 400);
    }

    return jsonResponse({
      message: "Password reset link sent to your email",
    });
  } catch (err) {
    console.error("[Forgot Password Error]", err);
    return errorResponse("Internal server error", 500);
  }
}

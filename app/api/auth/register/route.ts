import { createClient } from "@/lib/supabase/server";
import { registerSchema } from "@/lib/validations/auth";
import { jsonResponse, errorResponse, parseBody } from "@/lib/api-utils";

export async function POST(request: Request) {
  try {
    const parsed = await parseBody(request, registerSchema);
    if (parsed.error) return parsed.error;

    const { email, password, full_name } = parsed.data;
    const supabase = await createClient();

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name },
        emailRedirectTo: `${appUrl}/api/auth/callback?next=/`,
      },
    });

    if (error) {
      return errorResponse(error.message, 400);
    }

    if (!data.user) {
      return errorResponse("Registration failed", 400);
    }

    const needsEmailConfirmation = !data.session;

    return jsonResponse(
      {
        user: {
          id: data.user.id,
          email: data.user.email,
        },
        needs_email_confirmation: needsEmailConfirmation,
      },
      201,
    );
  } catch (err) {
    console.error("[Register Error]", err);
    return errorResponse("Internal server error", 500);
  }
}

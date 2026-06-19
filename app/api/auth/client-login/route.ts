import { createClient } from "@/lib/supabase/server";
import { loginSchema } from "@/lib/validations/auth";
import { jsonResponse, errorResponse, parseBody } from "@/lib/api-utils";

export async function POST(request: Request) {
  try {
    const parsed = await parseBody(request, loginSchema);
    if (parsed.error) return parsed.error;

    const { email, password } = parsed.data;
    const supabase = await createClient();

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return errorResponse(error.message, 401);
    }

    return jsonResponse({
      user: {
        id: data.user.id,
        email: data.user.email,
      },
    });
  } catch (err) {
    console.error("[Client Login Error]", err);
    return errorResponse("Internal server error", 500);
  }
}

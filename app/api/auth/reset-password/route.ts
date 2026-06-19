import { createClient } from "@/lib/supabase/server";
import { resetPasswordSchema } from "@/lib/validations/auth";
import { jsonResponse, errorResponse, parseBody } from "@/lib/api-utils";

export async function POST(request: Request) {
  try {
    const parsed = await parseBody(request, resetPasswordSchema);
    if (parsed.error) return parsed.error;

    const { password } = parsed.data;
    const supabase = await createClient();

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      return errorResponse(error.message, 400);
    }

    return jsonResponse({
      message: "Password updated successfully",
    });
  } catch (err) {
    console.error("[Reset Password Error]", err);
    return errorResponse("Internal server error", 500);
  }
}

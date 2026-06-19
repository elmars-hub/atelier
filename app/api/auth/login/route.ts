import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
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

    const adminSupabase = createAdminClient();

    const { data: adminUser, error: adminError } = await adminSupabase
      .from("admin_users")
      .select("role")
      .eq("user_id", data.user.id)
      .single();

    if (adminError || !adminUser) {
      await supabase.auth.signOut();
      return errorResponse("Forbidden: admin access required", 403);
    }

    return jsonResponse({
      user: {
        id: data.user.id,
        email: data.user.email,
        role: adminUser.role,
      },
    });
  } catch (err) {
    console.error("[Login Error]", err);
    return errorResponse("Internal server error", 500);
  }
}

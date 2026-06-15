import { createClient } from "@/lib/supabase/server";
import { loginSchema } from "@/lib/validations/auth";
import { jsonResponse, errorResponse, parseBody } from "@/lib/api-utils";

export async function POST(request: Request) {
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

  // Check if they are an admin
  const { createAdminClient } = await import("@/lib/supabase/admin");
  const adminSupabase = createAdminClient();
  
  const { data: adminUser, error: adminError } = await adminSupabase
    .from("admin_users")
    .select("role")
    .eq("user_id", data.user.id)
    .single();

  if (adminError || !adminUser) {
    // If not an admin, sign them out immediately
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
}

import { createClient } from "@/lib/supabase/server";
import { jsonResponse, errorResponse } from "@/lib/api-utils";

export async function GET() {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return errorResponse("Unauthorized", 401);
  }

  const { createAdminClient } = await import("@/lib/supabase/admin");
  const adminSupabase = createAdminClient();

  const { data: adminUser } = await adminSupabase
    .from("admin_users")
    .select("role")
    .eq("user_id", user.id)
    .single();

  return jsonResponse({
    user: {
      id: user.id,
      email: user.email,
      isAdmin: !!adminUser,
      role: adminUser?.role ?? null,
    },
  });
}

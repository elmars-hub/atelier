import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { jsonResponse, errorResponse } from "@/lib/api-utils";

export async function GET() {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return errorResponse("Unauthorized", 401);
    }

    const adminSupabase = createAdminClient();

    const [{ data: adminUser }, { data: profile }] = await Promise.all([
      adminSupabase
        .from("admin_users")
        .select("role")
        .eq("user_id", user.id)
        .single(),
      adminSupabase
        .from("profiles")
        .select("full_name, avatar_url")
        .eq("id", user.id)
        .single(),
    ]);

    const fullName = profile?.full_name ?? null;
    const avatarUrl = profile?.avatar_url ?? null;

    return jsonResponse({
      user: {
        id: user.id,
        email: user.email,
        full_name: fullName,
        avatar_url: avatarUrl,
        isAdmin: !!adminUser,
        role: adminUser?.role ?? null,
      },
    });
  } catch (err) {
    console.error("[Me Error]", err);
    return errorResponse("Internal server error", 500);
  }
}

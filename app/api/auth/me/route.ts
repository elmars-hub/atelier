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

    const { data: adminUser } = await adminSupabase
      .from("admin_users")
      .select("role")
      .eq("user_id", user.id)
      .single();

    const fullName =
      (user.user_metadata?.full_name as string | undefined) ??
      (user.user_metadata?.name as string | undefined) ??
      null;

    const avatarUrl =
      (user.user_metadata?.avatar_url as string | undefined) ??
      (user.user_metadata?.picture as string | undefined) ??
      null;

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

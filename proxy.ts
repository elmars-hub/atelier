import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";
import { createAdminClient } from "@/lib/supabase/admin";

export async function proxy(request: NextRequest) {
  const { user, supabaseResponse } = await updateSession(request);

  const isAdminApiRoute = request.nextUrl.pathname.startsWith("/api/admin");
  const isAdminFrontendRoute =
    request.nextUrl.pathname.startsWith("/admin") &&
    request.nextUrl.pathname !== "/admin/login";

  if (isAdminApiRoute || isAdminFrontendRoute) {
    if (!user) {
      if (isAdminApiRoute) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      } else {
        return NextResponse.redirect(new URL("/admin/login", request.url));
      }
    }

    const supabase = createAdminClient();

    const { data: adminUser } = await supabase
      .from("admin_users")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (!adminUser) {
      if (isAdminApiRoute) {
        return NextResponse.json(
          { error: "Forbidden: admin access required" },
          { status: 403 },
        );
      } else {
        return NextResponse.redirect(new URL("/admin/login", request.url));
      }
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import type { Database } from "@/types/database";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (!code) {
    return NextResponse.redirect(`${origin}/signin?error=No+code+provided`);
  }

  const safeNext = next.startsWith("/") ? next : "/";
  const response = NextResponse.redirect(`${origin}${safeNext}`);

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            response.cookies.set(name, value, options);
          });
        },
      },
    },
  );

  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(
      `${origin}/signin?error=${encodeURIComponent(error.message)}`,
    );
  }

  // Determine auth type so the landing page can show the right toast.
  // Only add the param on non-reset-password destinations to avoid noise.
  if (data.session && safeNext !== "/reset-password") {
    const provider = data.session.user.app_metadata?.provider;
    const createdAt = data.session.user.created_at;
    const lastSignIn = data.session.user.last_sign_in_at;
    const isNewUser =
      createdAt && lastSignIn
        ? Math.abs(
            new Date(createdAt).getTime() - new Date(lastSignIn).getTime(),
          ) < 5000
        : false;

    let authParam: string | null = null;
    if (provider === "google") {
      authParam = isNewUser ? "google_new" : "google_return";
    } else if (safeNext === "/" || safeNext === "") {
      authParam = "confirmed";
    }

    if (authParam) {
      const sep = safeNext.includes("?") ? "&" : "?";
      return NextResponse.redirect(
        `${origin}${safeNext}${sep}auth=${authParam}`,
      );
    }
  }

  return response;
}

import { type NextRequest } from "next/server";
import {
  jsonResponse,
  errorResponse,
  parseBody,
  withUserRoute,
  type UserAuth,
} from "@/lib/api-utils";
import { updateProfileSchema } from "@/lib/validations/client";
import { createClient } from "@/lib/supabase/server";

export const GET = withUserRoute(
  async (request: NextRequest, context: { params: Promise<Record<string, string>> }, auth: UserAuth) => {
    const supabase = await createClient();

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return errorResponse("Failed to load profile", 500);
    }

    const metadata = user.user_metadata ?? {};

    return jsonResponse({
      id: user.id,
      email: user.email,
      full_name: metadata.full_name ?? metadata.name ?? null,
      phone: metadata.phone ?? null,
      avatar_url: metadata.avatar_url ?? metadata.picture ?? null,
      created_at: user.created_at,
    });
  }
);

export const PATCH = withUserRoute(
  async (request: NextRequest, context: { params: Promise<Record<string, string>> }, auth: UserAuth) => {
    const parsed = await parseBody(request, updateProfileSchema);
    if (parsed.error) return parsed.error;

    const supabase = await createClient();

    const { data, error } = await supabase.auth.updateUser({
      data: parsed.data,
    });

    if (error) {
      return errorResponse(error.message, 400);
    }

    const metadata = data.user?.user_metadata ?? {};

    return jsonResponse({
      id: data.user?.id,
      email: data.user?.email,
      full_name: metadata.full_name ?? metadata.name ?? null,
      phone: metadata.phone ?? null,
      avatar_url: metadata.avatar_url ?? metadata.picture ?? null,
    });
  }
);

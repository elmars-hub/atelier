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
  async (
    request: NextRequest,
    context: { params: Promise<Record<string, string>> },
    auth: UserAuth,
  ) => {
    const supabase = await createClient();

    const { data: profile, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", auth.user.id)
      .single();

    if (error) {
      return errorResponse("Failed to load profile", 500);
    }

    return jsonResponse(profile);
  },
);

export const PATCH = withUserRoute(
  async (
    request: NextRequest,
    context: { params: Promise<Record<string, string>> },
    auth: UserAuth,
  ) => {
    const parsed = await parseBody(request, updateProfileSchema);
    if (parsed.error) return parsed.error;

    const supabase = await createClient();

    const { data: profile, error } = await supabase
      .from("profiles")
      .update({
        full_name: parsed.data.full_name,
        phone: parsed.data.phone,
        date_of_birth: parsed.data.date_of_birth,
      })
      .eq("id", auth.user.id)
      .select()
      .single();

    if (error) {
      return errorResponse(error.message, 400);
    }

    return jsonResponse(profile);
  },
);

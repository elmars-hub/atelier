import { type NextRequest } from "next/server";
import {
  jsonResponse,
  errorResponse,
  parseBody,
  withUserRoute,
  type UserAuth,
} from "@/lib/api-utils";
import { updateReviewSchema } from "@/lib/validations/client";
import { createClient } from "@/lib/supabase/server";

export const PATCH = withUserRoute(
  async (
    request: NextRequest,
    context: { params: Promise<Record<string, string>> },
    auth: UserAuth,
  ) => {
    const { id } = await context.params;

    const parsed = await parseBody(request, updateReviewSchema);
    if (parsed.error) return parsed.error;

    const supabase = await createClient();

    const { data: review, error } = await supabase
      .from("reviews")
      .update({
        rating: parsed.data.rating,
        comment: parsed.data.comment,
      })
      .eq("id", id)
      .eq("user_id", auth.user.id)
      .select()
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return errorResponse("Review not found or not yours", 404);
      }
      return errorResponse("Failed to update review", 500);
    }

    if (!review) {
      return errorResponse("Review not found or not yours", 404);
    }

    return jsonResponse(review);
  },
);

export const DELETE = withUserRoute(
  async (
    request: NextRequest,
    context: { params: Promise<Record<string, string>> },
    auth: UserAuth,
  ) => {
    const { id } = await context.params;

    const supabase = await createClient();

    const { error } = await supabase
      .from("reviews")
      .delete()
      .eq("id", id)
      .eq("user_id", auth.user.id);

    if (error) {
      return errorResponse("Failed to delete review", 500);
    }

    return new Response(null, { status: 204 });
  },
);

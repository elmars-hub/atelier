import { type NextRequest } from "next/server";
import {
  jsonResponse,
  errorResponse,
  parseBody,
  withUserRoute,
  type UserAuth,
} from "@/lib/api-utils";
import { createReviewSchema } from "@/lib/validations/client";
import { createClient } from "@/lib/supabase/server";

export const POST = withUserRoute(
  async (
    request: NextRequest,
    context: { params: Promise<Record<string, string>> },
    auth: UserAuth,
  ) => {
    const parsed = await parseBody(request, createReviewSchema);
    if (parsed.error) return parsed.error;

    const supabase = await createClient();

    const { data: existing } = await supabase
      .from("reviews")
      .select("id")
      .eq("user_id", auth.user.id)
      .eq("product_id", parsed.data.product_id)
      .single();

    if (existing) {
      return errorResponse("You have already reviewed this product", 409);
    }

    const { data, error } = await supabase
      .from("reviews")
      .insert({
        user_id: auth.user.id,
        product_id: parsed.data.product_id,
        rating: parsed.data.rating,
        comment: parsed.data.comment ?? null,
      })
      .select()
      .single();

    if (error) {
      if (error.code === "23505") {
        return errorResponse("You have already reviewed this product", 409);
      }
      return errorResponse("Failed to create review", 500);
    }

    return jsonResponse(data, 201);
  },
);

export const GET = withUserRoute(
  async (
    request: NextRequest,
    context: { params: Promise<Record<string, string>> },
    auth: UserAuth,
  ) => {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("reviews")
      .select(
        `
        *,
        products (id, name, slug, cover_image_url)
      `,
      )
      .eq("user_id", auth.user.id)
      .order("created_at", { ascending: false });

    if (error) return errorResponse("Failed to fetch reviews", 500);

    return jsonResponse(data);
  },
);

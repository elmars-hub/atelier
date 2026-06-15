import { createClient } from "@supabase/supabase-js";
import { type NextRequest } from "next/server";
import { wishlistSchema } from "@/lib/validations/client";
import {
  jsonResponse,
  errorResponse,
  parseBody,
  withUserRoute,
  type UserAuth,
} from "@/lib/api-utils";
import type { Database } from "@/types/database";

export const GET = withUserRoute(async (request: NextRequest, context: { params: Promise<Record<string, string>> }, auth: UserAuth) => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const supabase = createClient<Database>(supabaseUrl, supabaseKey);

  const { data, error } = await supabase
    .from("wishlists")
    .select(`
      id,
      product_id,
      created_at,
      products (
        name,
        slug,
        price,
        cover_image_url,
        is_available
      )
    `)
    .eq("user_id", auth.user.id)
    .order("created_at", { ascending: false });

  if (error) return errorResponse("Failed to fetch wishlist", 500);

  return jsonResponse(data);
});

export const POST = withUserRoute(async (request: NextRequest, context: { params: Promise<Record<string, string>> }, auth: UserAuth) => {
  const parsed = await parseBody(request, wishlistSchema);
  if (parsed.error) return parsed.error;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const supabase = createClient<Database>(supabaseUrl, supabaseKey);

  // Check if it already exists
  const { data: existing } = await supabase
    .from("wishlists")
    .select("id")
    .eq("user_id", auth.user.id)
    .eq("product_id", parsed.data.product_id)
    .single();

  if (existing) {
    return jsonResponse({ message: "Already in wishlist" });
  }

  const { data, error } = await supabase
    .from("wishlists")
    .insert({
      user_id: auth.user.id,
      product_id: parsed.data.product_id,
    })
    .select()
    .single();

  if (error) return errorResponse("Failed to add to wishlist", 500);

  return jsonResponse(data, 201);
});

export const DELETE = withUserRoute(async (request: NextRequest, context: { params: Promise<Record<string, string>> }, auth: UserAuth) => {
  const searchParams = request.nextUrl.searchParams;
  const productId = searchParams.get("product_id");

  if (!productId) {
    return errorResponse("Product ID is required", 400);
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const supabase = createClient<Database>(supabaseUrl, supabaseKey);

  const { error } = await supabase
    .from("wishlists")
    .delete()
    .eq("user_id", auth.user.id)
    .eq("product_id", productId);

  if (error) return errorResponse("Failed to remove from wishlist", 500);

  return jsonResponse({ success: true });
});

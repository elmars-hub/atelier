import { type NextRequest } from "next/server";
import { jsonResponse, errorResponse, parsePagination } from "@/lib/api-utils";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await context.params;

    const supabase = await createClient();

    const pagination = parsePagination(request.nextUrl.searchParams, {
      limit: 20,
      sort: "created_at",
    });

    const { data: product } = await supabase
      .from("products")
      .select("id")
      .eq("slug", slug)
      .single();

    if (!product) {
      return errorResponse("Product not found", 404);
    }

    const ascending = pagination.order === "asc";

    const { data, error, count } = await supabase
      .from("reviews")
      .select(
        `
        id,
        product_id,
        user_id,
        rating,
        comment,
        is_verified_purchase,
        created_at,
        profiles (
          full_name,
          avatar_url
        )
      `,
        { count: "exact" },
      )
      .eq("product_id", product.id)
      .order(pagination.sort, { ascending })
      .range(pagination.offset, pagination.offset + pagination.limit - 1);

    if (error) throw error;

    const reviews = (data ?? []).map((r) => ({
      id: r.id,
      product_id: r.product_id,
      user_id: r.user_id,
      rating: r.rating,
      comment: r.comment,
      is_verified_purchase: r.is_verified_purchase,
      created_at: r.created_at,
      reviewer_name:
        (r.profiles as unknown as { full_name: string | null } | null)
          ?.full_name ?? null,
      reviewer_avatar:
        (r.profiles as unknown as { avatar_url: string | null } | null)
          ?.avatar_url ?? null,
    }));

    return jsonResponse({
      data: reviews,
      total: count ?? 0,
      page: pagination.page,
      limit: pagination.limit,
    });
  } catch (err) {
    console.error("[Store Reviews API]", err);
    return errorResponse("Failed to load reviews", 500);
  }
}

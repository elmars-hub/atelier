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
      .select("*", { count: "exact" })
      .eq("product_id", product.id)
      .order(pagination.sort, { ascending })
      .range(pagination.offset, pagination.offset + pagination.limit - 1);

    if (error) throw error;

    return jsonResponse({
      data: data ?? [],
      total: count ?? 0,
      page: pagination.page,
      limit: pagination.limit,
    });
  } catch (err) {
    console.error("[Store Reviews API]", err);
    return errorResponse("Failed to load reviews", 500);
  }
}

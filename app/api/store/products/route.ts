import { type NextRequest } from "next/server";
import { jsonResponse, errorResponse, parsePagination } from "@/lib/api-utils";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    const searchParams = request.nextUrl.searchParams;
    const pagination = parsePagination(searchParams, {
      limit: 12,
      sort: "created_at",
    });

    const categoryId = searchParams.get("category_id");
    const search = searchParams.get("search");

    let query = supabase
      .from("products")
      .select(
        `
        *,
        product_variants (
          id,
          color_name,
          color_hex,
          image_url,
          price_modifier,
          stock_quantity,
          is_default
        )
      `,
        { count: "exact" },
      )
      .eq("is_available", true);

    if (categoryId) {
      query = query.eq("category_id", categoryId);
    }

    if (search) {
      query = query.ilike("name", `%${search}%`);
    }

    const ascending = pagination.order === "asc";

    const { data, count, error } = await query
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
    console.error("[Store Products API]", err);
    return errorResponse("Failed to load products", 500);
  }
}

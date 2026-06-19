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
    const categorySlug = searchParams.get("category");
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
        ),
        reviews (rating)
      `,
        { count: "exact" },
      )
      .eq("is_available", true);

    if (categoryId) {
      query = query.eq("category_id", categoryId);
    }

    if (categorySlug) {
      const { data: cat } = await supabase
        .from("categories")
        .select("id")
        .eq("slug", categorySlug)
        .single();
      if (cat) {
        query = query.eq("category_id", cat.id);
      }
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
    }

    const ascending = pagination.order === "asc";

    if (pagination.sort === "popular") {
      query = query.order("created_at", { ascending: false });
    } else {
      query = query.order(pagination.sort, { ascending });
    }

    const { data, count, error } = await query.range(
      pagination.offset,
      pagination.offset + pagination.limit - 1,
    );

    if (error) throw error;

    const products = (data ?? []).map((product) => {
      const productReviews = (product.reviews as { rating: number }[]) ?? [];
      const reviewCount = productReviews.length;
      const averageRating =
        reviewCount > 0
          ? productReviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount
          : 0;
      const { reviews: _reviews, ...rest } = product;
      return {
        ...rest,
        average_rating: Math.round(averageRating * 10) / 10,
        review_count: reviewCount,
      };
    });

    return jsonResponse({
      data: products,
      total: count ?? 0,
      page: pagination.page,
      limit: pagination.limit,
    });
  } catch (err) {
    console.error("[Store Products API]", err);
    return errorResponse("Failed to load products", 500);
  }
}

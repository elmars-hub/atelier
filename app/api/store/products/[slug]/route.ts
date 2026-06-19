import { type NextRequest } from "next/server";
import { jsonResponse, errorResponse } from "@/lib/api-utils";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await context.params;

    const supabase = await createClient();

    const { data, error } = await supabase
      .from("products")
      .select(
        `
        *,
        category:categories (id, name, slug),
        variants:product_variants (*, product_images (*)),
        specifications:product_specifications (*),
        reviews (*)
      `,
      )
      .eq("slug", slug)
      .eq("is_available", true)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return errorResponse("Product not found", 404);
      }
      throw error;
    }

    const categoryId = (data.category as { id: string } | null)?.id;

    const reviews = (data.reviews as { rating: number }[]) ?? [];
    const reviewCount = reviews.length;
    const averageRating =
      reviewCount > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount
        : 0;

    let related: unknown[] = [];
    if (categoryId) {
      const { data: relatedProducts } = await supabase
        .from("products")
        .select(
          `
          id,
          name,
          slug,
          price,
          discount_price,
          cover_image_url,
          is_available
        `,
        )
        .eq("category_id", categoryId)
        .eq("is_available", true)
        .neq("id", data.id)
        .limit(4);

      related = (relatedProducts as unknown[]) ?? [];
    }

    return jsonResponse({
      ...data,
      average_rating: Math.round(averageRating * 10) / 10,
      review_count: reviewCount,
      related_products: related,
    });
  } catch (err) {
    console.error("[Store Product API]", err);
    return errorResponse("Failed to load product details", 500);
  }
}

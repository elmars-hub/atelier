import { createClient } from "@supabase/supabase-js";
import { type NextRequest } from "next/server";
import { jsonResponse, errorResponse } from "@/lib/api-utils";
import type { Database } from "@/types/database";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await context.params;

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const supabase = createClient<Database>(supabaseUrl, supabaseKey);

    const { data, error } = await supabase
      .from("products")
      .select(`
        *,
        category:categories (id, name, slug),
        variants:product_variants (*, product_images (*)),
        specifications:product_specifications (*),
        reviews (*)
      `)
      .eq("slug", slug)
      .eq("is_available", true)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return errorResponse("Product not found", 404);
      }
      throw error;
    }

    return jsonResponse(data);
  } catch (err) {
    console.error("[Store Product API]", err);
    return errorResponse("Failed to load product details", 500);
  }
}

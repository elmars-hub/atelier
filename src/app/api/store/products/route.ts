import { createClient } from "@supabase/supabase-js";
import { type NextRequest } from "next/server";
import { jsonResponse, errorResponse, parsePagination } from "@/lib/api-utils";
import type { Database } from "@/types/database";

export async function GET(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const supabase = createClient<Database>(supabaseUrl, supabaseKey);

    const searchParams = request.nextUrl.searchParams;
    const pagination = parsePagination(searchParams, { limit: 12, sort: "created_at" });
    
    const categoryId = searchParams.get("category_id");
    const search = searchParams.get("search");

    let query = supabase
      .from("products")
      .select(`
        *,
        product_images (image_url, display_order)
      `, { count: "exact" })
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
      limit: pagination.limit
    });
  } catch (err) {
    console.error("[Store Products API]", err);
    return errorResponse("Failed to load products", 500);
  }
}

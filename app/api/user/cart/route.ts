import { type NextRequest } from "next/server";
import {
  jsonResponse,
  errorResponse,
  parseBody,
  withUserRoute,
  type UserAuth,
} from "@/lib/api-utils";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const addToCartSchema = z.object({
  variant_id: z.string().uuid(),
  product_id: z.string().uuid(),
  quantity: z.number().int().min(1).max(99).default(1),
});

const updateCartSchema = z.object({
  quantity: z.number().int().min(1).max(99),
});

export const GET = withUserRoute(
  async (
    request: NextRequest,
    context: { params: Promise<Record<string, string>> },
    auth: UserAuth,
  ) => {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("cart_items")
      .select(
        `
        id,
        variant_id,
        product_id,
        quantity,
        created_at,
        updated_at,
        product_variants (
          id,
          color_name,
          color_hex,
          image_url,
          price_modifier,
          stock_quantity,
          products (
            id,
            name,
            slug,
            price,
            discount_price,
            cover_image_url,
            is_available
          )
        )
      `,
      )
      .eq("user_id", auth.user.id)
      .order("created_at", { ascending: false });

    if (error) return errorResponse("Failed to fetch cart", 500);

    const items = (data ?? []).map((item) => {
      const variant = item.product_variants as {
        stock_quantity: number;
        products: { is_available: boolean };
      };
      const product = variant?.products;
      return {
        ...item,
        in_stock: variant ? variant.stock_quantity >= item.quantity : false,
        product_available: product ? product.is_available : false,
      };
    });

    return jsonResponse(items);
  },
);

export const POST = withUserRoute(
  async (
    request: NextRequest,
    context: { params: Promise<Record<string, string>> },
    auth: UserAuth,
  ) => {
    const parsed = await parseBody(request, addToCartSchema);
    if (parsed.error) return parsed.error;

    const { variant_id, product_id, quantity } = parsed.data;
    const supabase = await createClient();

    const { data: existing } = await supabase
      .from("cart_items")
      .select("id, quantity")
      .eq("user_id", auth.user.id)
      .eq("variant_id", variant_id)
      .single();

    if (existing) {
      const { data, error } = await supabase
        .from("cart_items")
        .update({ quantity: existing.quantity + quantity })
        .eq("id", existing.id)
        .select()
        .single();

      if (error) return errorResponse("Failed to update cart item", 500);
      return jsonResponse(data);
    }

    const { data, error } = await supabase
      .from("cart_items")
      .insert({
        user_id: auth.user.id,
        variant_id,
        product_id,
        quantity,
      })
      .select()
      .single();

    if (error) return errorResponse("Failed to add to cart", 500);
    return jsonResponse(data, 201);
  },
);

export const PATCH = withUserRoute(
  async (
    request: NextRequest,
    context: { params: Promise<Record<string, string>> },
    auth: UserAuth,
  ) => {
    const parsed = await parseBody(request, updateCartSchema);
    if (parsed.error) return parsed.error;

    const searchParams = request.nextUrl.searchParams;
    const variantId = searchParams.get("variant_id");

    if (!variantId) {
      return errorResponse("variant_id is required", 400);
    }

    const supabase = await createClient();

    const { data, error } = await supabase
      .from("cart_items")
      .update({ quantity: parsed.data.quantity })
      .eq("user_id", auth.user.id)
      .eq("variant_id", variantId)
      .select()
      .single();

    if (error) return errorResponse("Failed to update cart item", 500);
    return jsonResponse(data);
  },
);

export const DELETE = withUserRoute(
  async (
    request: NextRequest,
    context: { params: Promise<Record<string, string>> },
    auth: UserAuth,
  ) => {
    const searchParams = request.nextUrl.searchParams;
    const variantId = searchParams.get("variant_id");

    const supabase = await createClient();

    if (variantId) {
      const { error } = await supabase
        .from("cart_items")
        .delete()
        .eq("user_id", auth.user.id)
        .eq("variant_id", variantId);

      if (error) return errorResponse("Failed to remove cart item", 500);
    } else {
      const { error } = await supabase
        .from("cart_items")
        .delete()
        .eq("user_id", auth.user.id);

      if (error) return errorResponse("Failed to clear cart", 500);
    }

    return jsonResponse({ success: true });
  },
);

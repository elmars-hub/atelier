import { createClient } from "@supabase/supabase-js";
import { type NextRequest } from "next/server";
import { checkoutSchema } from "@/lib/validations/client";
import {
  jsonResponse,
  errorResponse,
  parseBody,
  withUserRoute,
  type UserAuth,
} from "@/lib/api-utils";
import type { Database } from "@/types/database";
import type { Insert } from "@/types/database";
import crypto from "crypto";

export const POST = withUserRoute(async (request: NextRequest, context: { params: Promise<Record<string, string>> }, auth: UserAuth) => {
  const parsed = await parseBody(request, checkoutSchema);
  if (parsed.error) return parsed.error;

  const { items, shipping_address } = parsed.data;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const supabase = createClient<Database>(supabaseUrl, supabaseKey);

  // 1. Fetch real prices and validate stock from the database
  const variantIds = items.map((item) => item.variant_id);
  const { data: dbVariants, error: fetchError } = await supabase
    .from("product_variants")
    .select(`
      id,
      color_name,
      image_url,
      stock_quantity,
      price_modifier,
      products (
        id,
        name,
        price,
        discount_price,
        is_available,
        cover_image_url
      )
    `)
    .in("id", variantIds);

  if (fetchError || !dbVariants || dbVariants.length !== variantIds.length) {
    return errorResponse("One or more items in your cart are invalid or no longer exist", 400);
  }

  // 2. Calculate Totals and Build Order Items
  let subtotal = 0;
  const orderItemsData: Insert<"order_items">[] = [];

  for (const item of items) {
    const dbVariant = dbVariants.find((v) => v.id === item.variant_id);
    const product = dbVariant!.products;

    if (!product || Array.isArray(product) || !product.is_available) {
      return errorResponse(`Product is no longer available`, 400);
    }

    if (dbVariant!.stock_quantity < item.quantity) {
      return errorResponse(`Not enough stock for variant ${dbVariant!.color_name}`, 400);
    }

    // Use discount price if it exists, otherwise base price, plus any variant modifier
    const basePrice = product.discount_price ?? product.price;
    const unitPrice = basePrice + dbVariant!.price_modifier;

    subtotal += unitPrice * item.quantity;

    orderItemsData.push({
      product_id: product.id,
      variant_id: dbVariant!.id,
      product_name: product.name,
      product_image_url: dbVariant!.image_url || product.cover_image_url,
      color_name: dbVariant!.color_name,
      quantity: item.quantity,
      unit_price: unitPrice,
    });
  }

  // Very simplified tax/shipping logic
  const shipping_cost = subtotal > 150 ? 0 : 15; // Free shipping over $150
  const tax = subtotal * 0.08; // Example 8% tax
  const total = subtotal + shipping_cost + tax;

  // Generate unique order number (e.g., ORD-2026-XXXXXX)
  const orderNumber = `ORD-${new Date().getFullYear()}-${crypto.randomBytes(3).toString("hex").toUpperCase()}`;

  // 3. Create the Order
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      user_id: auth.user.id,
      order_number: orderNumber,
      status: "pending",
      subtotal,
      shipping_cost,
      tax,
      total,
      shipping_address,
    })
    .select("id")
    .single();

  if (orderError || !order) {
    console.error("[Checkout Error]", orderError);
    return errorResponse("Failed to create order", 500);
  }

  // 4. Create the Order Items
  const itemsToInsert = orderItemsData.map((oi) => ({
    ...oi,
    order_id: order.id,
  }));

  const { error: itemsError } = await supabase
    .from("order_items")
    .insert(itemsToInsert);

  if (itemsError) {
    console.error("[Checkout Items Error]", itemsError);
    // Ideally, we'd rollback the order here or use a database function
    return errorResponse("Failed to save order items", 500);
  }

  // Optionally: Update stock quantities in DB here or via DB trigger.

  return jsonResponse({ success: true, order_id: order.id, order_number: orderNumber }, 201);
});

export const GET = withUserRoute(async (request: NextRequest, context: { params: Promise<Record<string, string>> }, auth: UserAuth) => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const supabase = createClient<Database>(supabaseUrl, supabaseKey);

  const { data, error } = await supabase
    .from("orders")
    .select(`
      *,
      order_items (*)
    `)
    .eq("user_id", auth.user.id)
    .order("created_at", { ascending: false });

  if (error) return errorResponse("Failed to fetch orders", 500);

  return jsonResponse(data);
});

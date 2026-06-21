import { type NextRequest } from "next/server";
import { checkoutSchema } from "@/lib/validations/client";
import {
  jsonResponse,
  errorResponse,
  parseBody,
  parsePagination,
  withUserRoute,
  type UserAuth,
} from "@/lib/api-utils";
import type { Insert } from "@/types/database";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getStripe } from "@/lib/stripe/server";
import crypto from "crypto";

export const POST = withUserRoute(
  async (
    request: NextRequest,
    context: { params: Promise<Record<string, string>> },
    auth: UserAuth,
  ) => {
    const parsed = await parseBody(request, checkoutSchema);
    if (parsed.error) return parsed.error;

    const { items, shipping_address, shipping_method, payment_intent_id } =
      parsed.data;

    // ── Verify Stripe payment intent ─────────────────────────────────────────
    const stripe = getStripe();
    let pi;
    try {
      pi = await stripe.paymentIntents.retrieve(payment_intent_id);
    } catch {
      return errorResponse("Invalid payment intent", 400);
    }

    if (pi.status !== "succeeded") {
      return errorResponse(
        "Payment has not been completed. Please complete payment first.",
        402,
      );
    }

    if (pi.metadata?.user_id !== auth.user.id) {
      return errorResponse("Payment intent does not belong to this user", 403);
    }

    const supabase = createAdminClient();

    // Guard against re-using the same payment intent for two orders
    const { data: existingOrder } = await supabase
      .from("orders")
      .select("id")
      .eq("stripe_payment_intent_id", payment_intent_id)
      .maybeSingle();

    if (existingOrder) {
      return errorResponse(
        "This payment has already been used for an order",
        409,
      );
    }

    const variantIds = items.map((item) => item.variant_id);
    const { data: dbVariants, error: fetchError } = await supabase
      .from("product_variants")
      .select(
        `
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
      `,
      )
      .in("id", variantIds);

    // Deduplicate variant IDs to prevent double-counting
    const uniqueVariantIds = [...new Set(variantIds)];
    if (uniqueVariantIds.length !== variantIds.length) {
      return errorResponse("Duplicate items in cart are not allowed", 400);
    }

    if (fetchError || !dbVariants || dbVariants.length !== variantIds.length) {
      return errorResponse(
        "One or more items in your cart are invalid or no longer exist",
        400,
      );
    }

    let subtotal = 0;
    const orderItemsData: Omit<Insert<"order_items">, "order_id">[] = [];

    for (const item of items) {
      const dbVariant = dbVariants.find((v) => v.id === item.variant_id);
      const product = dbVariant!.products;

      if (!product || Array.isArray(product) || !product.is_available) {
        return errorResponse(`Product is no longer available`, 400);
      }

      if (dbVariant!.stock_quantity < item.quantity) {
        return errorResponse(
          `Not enough stock for variant ${dbVariant!.color_name}`,
          400,
        );
      }

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

    const isExpress = shipping_method === "express";
    const standardCost = subtotal > 150 ? 0 : 15;
    const shipping_cost = isExpress ? 30 : standardCost;
    const tax = subtotal * 0.08;
    const total = subtotal + shipping_cost + tax;

    const orderNumber = `ORD-${new Date().getFullYear()}-${crypto.randomBytes(3).toString("hex").toUpperCase()}`;

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        user_id: auth.user.id,
        order_number: orderNumber,
        status: "payment_verified",
        subtotal,
        shipping_cost,
        tax,
        total,
        shipping_address,
        stripe_payment_intent_id: payment_intent_id,
      })
      .select("id")
      .single();

    if (orderError || !order) {
      console.error("[Checkout Error]", orderError);
      return errorResponse("Failed to create order", 500);
    }

    const itemsToInsert = orderItemsData.map((oi) => ({
      ...oi,
      order_id: order.id,
    }));

    const { error: itemsError } = await supabase
      .from("order_items")
      .insert(itemsToInsert);

    if (itemsError) {
      console.error("[Checkout Items Error]", itemsError);
      // Compensating transaction: delete orphaned order
      await supabase.from("orders").delete().eq("id", order.id);
      return errorResponse("Failed to save order items", 500);
    }

    // ── Atomic stock decrement (race-condition safe) ─────────────────────────
    // .gte("stock_quantity", qty) makes the WHERE clause and the write atomic
    // at the Postgres row level — if another checkout decremented stock first,
    // this update matches 0 rows and maybeSingle() returns null.
    const stockErrors: string[] = [];
    for (const item of items) {
      const dbVariant = dbVariants.find((v) => v.id === item.variant_id)!;
      const { data: decremented } = await supabase
        .from("product_variants")
        .update({ stock_quantity: dbVariant.stock_quantity - item.quantity })
        .eq("id", item.variant_id)
        .gte("stock_quantity", item.quantity)
        .select("id")
        .maybeSingle();

      if (!decremented) {
        stockErrors.push(dbVariant.color_name ?? item.variant_id);
      }
    }

    if (stockErrors.length > 0) {
      // Compensating transaction: clean up order + items so nothing is orphaned
      await supabase.from("order_items").delete().eq("order_id", order.id);
      await supabase.from("orders").delete().eq("id", order.id);
      return errorResponse(
        `Items ran out of stock during checkout: ${stockErrors.join(", ")}. Please review your cart.`,
        409,
      );
    }

    const checkedVariantIds = items.map((i) => i.variant_id);
    await supabase
      .from("cart_items")
      .delete()
      .eq("user_id", auth.user.id)
      .in("variant_id", checkedVariantIds);

    return jsonResponse(
      { success: true, order_id: order.id, order_number: orderNumber },
      201,
    );
  },
);

export const GET = withUserRoute(
  async (
    request: NextRequest,
    context: { params: Promise<Record<string, string>> },
    auth: UserAuth,
  ) => {
    const supabase = await createClient();
    const pagination = parsePagination(request.nextUrl.searchParams, {
      limit: 20,
      sort: "created_at",
    });

    const { data, error, count } = await supabase
      .from("orders")
      .select(
        `
        *,
        order_items (*)
      `,
        { count: "exact" },
      )
      .eq("user_id", auth.user.id)
      .order("created_at", { ascending: false })
      .range(pagination.offset, pagination.offset + pagination.limit - 1);

    if (error) return errorResponse("Failed to fetch orders", 500);

    return jsonResponse({
      data,
      total: count ?? 0,
      page: pagination.page,
      limit: pagination.limit,
    });
  },
);

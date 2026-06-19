import { type NextRequest } from "next/server";
import {
  jsonResponse,
  errorResponse,
  parseBody,
  withUserRoute,
  type UserAuth,
} from "@/lib/api-utils";
import { createAdminClient } from "@/lib/supabase/admin";
import { getStripe } from "@/lib/stripe/server";
import { paymentIntentSchema } from "@/lib/validations/client";

export const POST = withUserRoute(
  async (
    request: NextRequest,
    context: { params: Promise<Record<string, string>> },
    auth: UserAuth,
  ) => {
    const parsed = await parseBody(request, paymentIntentSchema);
    if (parsed.error) return parsed.error;

    const { items, shipping_method } = parsed.data;

    const supabase = createAdminClient();

    const variantIds = items.map((item) => item.variant_id);
    const { data: dbVariants, error: fetchError } = await supabase
      .from("product_variants")
      .select(
        `
        id,
        stock_quantity,
        price_modifier,
        products (
          id,
          price,
          discount_price,
          is_available
        )
      `,
      )
      .in("id", variantIds);

    if (fetchError || !dbVariants || dbVariants.length !== variantIds.length) {
      return errorResponse(
        "One or more items in your cart are invalid or no longer exist",
        400,
      );
    }

    let subtotal = 0;
    for (const item of items) {
      const dbVariant = dbVariants.find((v) => v.id === item.variant_id);
      const product = dbVariant!.products;

      if (!product || Array.isArray(product) || !product.is_available) {
        return errorResponse("Product is no longer available", 400);
      }

      if (dbVariant!.stock_quantity < item.quantity) {
        return errorResponse(`Not enough stock for one of your items`, 400);
      }

      const basePrice = product.discount_price ?? product.price;
      const unitPrice = basePrice + dbVariant!.price_modifier;
      subtotal += unitPrice * item.quantity;
    }

    const isExpress = shipping_method === "express";
    const standardCost = subtotal > 150 ? 0 : 15;
    const shipping_cost = isExpress ? 30 : standardCost;
    const tax = subtotal * 0.08;
    const total = subtotal + shipping_cost + tax;
    const amountInCents = Math.round(total * 100);

    const stripe = getStripe();

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: "usd",
      metadata: {
        user_id: auth.user.id,
        item_count: String(items.length),
      },
      automatic_payment_methods: { enabled: true },
    });

    return jsonResponse({
      payment_intent_id: paymentIntent.id,
      client_secret: paymentIntent.client_secret,
      amount: amountInCents,
      currency: "usd",
      breakdown: {
        subtotal: Math.round(subtotal * 100) / 100,
        shipping_cost: Math.round(shipping_cost * 100) / 100,
        tax: Math.round(tax * 100) / 100,
        total: Math.round(total * 100) / 100,
      },
    });
  },
);

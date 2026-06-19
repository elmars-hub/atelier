import { type NextRequest } from "next/server";
import {
  jsonResponse,
  errorResponse,
  withUserRoute,
  type UserAuth,
} from "@/lib/api-utils";
import { createClient } from "@/lib/supabase/server";

export const POST = withUserRoute(
  async (
    request: NextRequest,
    context: { params: Promise<Record<string, string>> },
    auth: UserAuth,
  ) => {
    const { id } = await context.params;

    const supabase = await createClient();

    const { data: order, error: fetchError } = await supabase
      .from("orders")
      .select("id, status, user_id")
      .eq("id", id)
      .eq("user_id", auth.user.id)
      .single();

    if (fetchError || !order) {
      return errorResponse("Order not found", 404);
    }

    if (order.status === "delivered") {
      return errorResponse("Cannot cancel a delivered order", 400);
    }

    if (order.status === "cancelled") {
      return errorResponse("Order is already cancelled", 400);
    }

    if (order.status === "in_transit") {
      return errorResponse("Cannot cancel an order in transit", 400);
    }

    const { data: updated, error: updateError } = await supabase
      .from("orders")
      .update({ status: "cancelled" })
      .eq("id", id)
      .eq("user_id", auth.user.id)
      .select()
      .single();

    if (updateError) {
      return errorResponse("Failed to cancel order", 500);
    }

    const { data: orderItems } = await supabase
      .from("order_items")
      .select("variant_id, quantity")
      .eq("order_id", id);

    if (orderItems && orderItems.length > 0) {
      for (const item of orderItems) {
        if (!item.variant_id) continue;

        const { data: variant } = await supabase
          .from("product_variants")
          .select("stock_quantity")
          .eq("id", item.variant_id)
          .single();

        if (variant) {
          await supabase
            .from("product_variants")
            .update({
              stock_quantity: variant.stock_quantity + item.quantity,
            })
            .eq("id", item.variant_id);
        }
      }
    }

    return jsonResponse(updated);
  },
);

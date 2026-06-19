import { type NextRequest } from "next/server";
import {
  jsonResponse,
  errorResponse,
  withUserRoute,
  type UserAuth,
} from "@/lib/api-utils";
import { createClient } from "@/lib/supabase/server";

export const GET = withUserRoute(
  async (
    request: NextRequest,
    context: { params: Promise<Record<string, string>> },
    auth: UserAuth,
  ) => {
    const { id } = await context.params;

    const supabase = await createClient();

    const { data: order, error } = await supabase
      .from("orders")
      .select(
        `
        *,
        order_items (*),
        order_tracking_events (*)
      `,
      )
      .eq("id", id)
      .eq("user_id", auth.user.id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return errorResponse("Order not found", 404);
      }
      return errorResponse("Failed to fetch order", 500);
    }

    return jsonResponse(order);
  },
);

import { type NextRequest } from "next/server";
import {
  jsonResponse,
  parseBody,
  withUserRoute,
  type UserAuth,
} from "@/lib/api-utils";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const mergeCartSchema = z.object({
  items: z
    .array(
      z.object({
        variant_id: z.string().uuid(),
        product_id: z.string().uuid(),
        quantity: z.number().int().min(1).max(99),
      }),
    )
    .max(50),
});

export const POST = withUserRoute(
  async (
    request: NextRequest,
    context: { params: Promise<Record<string, string>> },
    auth: UserAuth,
  ) => {
    const parsed = await parseBody(request, mergeCartSchema);
    if (parsed.error) return parsed.error;

    const { items } = parsed.data;

    if (items.length === 0) {
      return jsonResponse({ merged: 0 });
    }

    const supabase = await createClient();

    const { data: existing } = await supabase
      .from("cart_items")
      .select("variant_id, quantity")
      .eq("user_id", auth.user.id);

    const existingMap = new Map(
      (existing ?? []).map((item) => [item.variant_id, item.quantity]),
    );

    const toInsert: {
      user_id: string;
      variant_id: string;
      product_id: string;
      quantity: number;
    }[] = [];

    const toUpdate: { variant_id: string; quantity: number }[] = [];

    for (const item of items) {
      const currentQty = existingMap.get(item.variant_id);
      if (currentQty) {
        toUpdate.push({
          variant_id: item.variant_id,
          quantity: currentQty + item.quantity,
        });
      } else {
        toInsert.push({
          user_id: auth.user.id,
          variant_id: item.variant_id,
          product_id: item.product_id,
          quantity: item.quantity,
        });
      }
    }

    let mergedCount = 0;

    if (toInsert.length > 0) {
      const { error } = await supabase.from("cart_items").insert(toInsert);
      if (!error) mergedCount += toInsert.length;
    }

    for (const item of toUpdate) {
      const { error } = await supabase
        .from("cart_items")
        .update({ quantity: item.quantity })
        .eq("user_id", auth.user.id)
        .eq("variant_id", item.variant_id);
      if (!error) mergedCount++;
    }

    return jsonResponse({ merged: mergedCount });
  },
);

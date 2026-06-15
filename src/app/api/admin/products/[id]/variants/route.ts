import {
  jsonResponse,
  parseBody,
  withAdminRoute,
} from "@/lib/api-utils";
import { getVariants, createVariant } from "@/lib/services/variants";
import { createVariantSchema } from "@/lib/validations/variants";

export const GET = withAdminRoute(async (request, context) => {
  const { id } = await context.params;

  const variants = await getVariants(id);
  return jsonResponse(variants);
});

export const POST = withAdminRoute(async (request, context) => {
  const { id } = await context.params;

  const parsed = await parseBody(request, createVariantSchema);
  if (parsed.error) return parsed.error;

  // Ensure the product_id from the URL matches the payload (or inject it)
  const variantInput = { ...parsed.data, product_id: id };

  const variant = await createVariant(variantInput);
  return jsonResponse(variant, 201);
});

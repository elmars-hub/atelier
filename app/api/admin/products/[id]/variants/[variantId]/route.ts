import {
  jsonResponse,
  errorResponse,
  parseBody,
  withAdminRoute,
} from "@/lib/api-utils";
import {
  updateVariant,
  deleteVariant,
} from "@/lib/services/variants";
import { updateVariantSchema } from "@/lib/validations/variants";

export const PATCH = withAdminRoute(async (request, context) => {
  const { variantId } = await context.params;

  const parsed = await parseBody(request, updateVariantSchema);
  if (parsed.error) return parsed.error;

  try {
    const updated = await updateVariant(variantId, parsed.data);
    return jsonResponse(updated);
  } catch {
    return errorResponse("Variant not found or failed to update", 404);
  }
});

export const DELETE = withAdminRoute(async (request, context) => {
  const { variantId } = await context.params;

  try {
    await deleteVariant(variantId);
    return new Response(null, { status: 204 });
  } catch {
    return errorResponse("Variant not found or failed to delete", 404);
  }
});

import {
  jsonResponse,
  errorResponse,
  parseBody,
  withAdminRoute,
} from "@/lib/api-utils";
import {
  updateSpecification,
  deleteSpecification,
} from "@/lib/services/specifications";
import { updateProductSpecificationSchema } from "@/lib/validations/products";

export const PATCH = withAdminRoute(async (request, context) => {
  const { specId } = await context.params;

  const parsed = await parseBody(request, updateProductSpecificationSchema);
  if (parsed.error) return parsed.error;

  try {
    const updated = await updateSpecification(specId, parsed.data);
    return jsonResponse(updated);
  } catch {
    return errorResponse("Specification not found or failed to update", 404);
  }
});

export const DELETE = withAdminRoute(async (request, context) => {
  const { specId } = await context.params;

  try {
    await deleteSpecification(specId);
    return new Response(null, { status: 204 });
  } catch {
    return errorResponse("Specification not found or failed to delete", 404);
  }
});

import {
  jsonResponse,
  errorResponse,
  parseBody,
  withAdminRoute,
} from "@/lib/api-utils";
import {
  getProductById,
  updateProduct,
  deleteProduct,
} from "@/lib/services/products";
import { updateProductSchema } from "@/lib/validations/products";

export const GET = withAdminRoute(async (request, context) => {
  const { id } = await context.params;

  try {
    const product = await getProductById(id);
    return jsonResponse(product);
  } catch {
    return errorResponse("Product not found", 404);
  }
});

export const PATCH = withAdminRoute(async (request, context) => {
  const { id } = await context.params;

  const parsed = await parseBody(request, updateProductSchema);
  if (parsed.error) return parsed.error;

  try {
    const updated = await updateProduct(id, parsed.data);
    return jsonResponse(updated);
  } catch {
    return errorResponse("Product not found or failed to update", 404);
  }
});

export const DELETE = withAdminRoute(async (request, context) => {
  const { id } = await context.params;

  try {
    await deleteProduct(id);
    return new Response(null, { status: 204 });
  } catch {
    return errorResponse("Product not found or failed to delete", 404);
  }
});

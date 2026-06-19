import {
  jsonResponse,
  errorResponse,
  parseBody,
  withAdminRoute,
} from "@/lib/api-utils";
import {
  getCategoryById,
  updateCategory,
  deleteCategory,
} from "@/lib/services/categories";
import { updateCategorySchema } from "@/lib/validations/categories";

export const GET = withAdminRoute(async (request, context) => {
  const { id } = await context.params;

  try {
    const category = await getCategoryById(id);
    return jsonResponse(category);
  } catch {
    return errorResponse("Category not found", 404);
  }
});

export const PATCH = withAdminRoute(async (request, context) => {
  const { id } = await context.params;

  const parsed = await parseBody(request, updateCategorySchema);
  if (parsed.error) return parsed.error;

  try {
    const updated = await updateCategory(id, parsed.data);
    return jsonResponse(updated);
  } catch {
    return errorResponse("Category not found or failed to update", 404);
  }
});

export const DELETE = withAdminRoute(async (request, context) => {
  const { id } = await context.params;

  try {
    await deleteCategory(id);
    return new Response(null, { status: 204 });
  } catch {
    return errorResponse("Category not found or failed to delete", 404);
  }
});

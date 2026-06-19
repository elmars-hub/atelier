import {
  jsonResponse,
  parseBody,
  parsePagination,
  withAdminRoute,
} from "@/lib/api-utils";
import {
  getCategories,
  createCategory,
} from "@/lib/services/categories";
import { createCategorySchema } from "@/lib/validations/categories";

export const GET = withAdminRoute(async (request) => {
  const searchParams = request.nextUrl.searchParams;
  const pagination = parsePagination(searchParams);

  const search = searchParams.get("search") || undefined;
  const isActiveParam = searchParams.get("is_active");
  const is_active = isActiveParam ? isActiveParam === "true" : undefined;

  const result = await getCategories(pagination, { search, is_active });
  return jsonResponse(result);
});

export const POST = withAdminRoute(async (request) => {
  const parsed = await parseBody(request, createCategorySchema);
  if (parsed.error) return parsed.error;

  const category = await createCategory(parsed.data);
  return jsonResponse(category, 201);
});

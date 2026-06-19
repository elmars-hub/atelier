import {
  jsonResponse,
  parseBody,
  parsePagination,
  withAdminRoute,
} from "@/lib/api-utils";
import { getProducts, createProduct } from "@/lib/services/products";
import { createProductSchema } from "@/lib/validations/products";

export const GET = withAdminRoute(async (request) => {
  const searchParams = request.nextUrl.searchParams;
  const pagination = parsePagination(searchParams);

  const search = searchParams.get("search") || undefined;
  const category_id = searchParams.get("category_id") || undefined;
  
  const isFeaturedParam = searchParams.get("is_featured");
  const is_featured = isFeaturedParam ? isFeaturedParam === "true" : undefined;
  
  const isAvailableParam = searchParams.get("is_available");
  const is_available = isAvailableParam ? isAvailableParam === "true" : undefined;

  const result = await getProducts(pagination, {
    search,
    category_id,
    is_featured,
    is_available,
  });

  return jsonResponse(result);
});

export const POST = withAdminRoute(async (request) => {
  const parsed = await parseBody(request, createProductSchema);
  if (parsed.error) return parsed.error;

  const product = await createProduct(parsed.data);
  return jsonResponse(product, 201);
});

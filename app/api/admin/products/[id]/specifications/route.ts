import {
  jsonResponse,
  parseBody,
  withAdminRoute,
} from "@/lib/api-utils";
import {
  getSpecifications,
  createSpecification,
} from "@/lib/services/specifications";
import { createProductSpecificationSchema } from "@/lib/validations/products";

export const GET = withAdminRoute(async (request, context) => {
  const { id } = await context.params;

  const specs = await getSpecifications(id);
  return jsonResponse(specs);
});

export const POST = withAdminRoute(async (request, context) => {
  const { id } = await context.params;

  const parsed = await parseBody(request, createProductSpecificationSchema);
  if (parsed.error) return parsed.error;

  const specInput = { ...parsed.data, product_id: id };

  const spec = await createSpecification(specInput);
  return jsonResponse(spec, 201);
});

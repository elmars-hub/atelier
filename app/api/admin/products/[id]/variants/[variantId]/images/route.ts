import {
  jsonResponse,
  parseBody,
  withAdminRoute,
} from "@/lib/api-utils";
import {
  getProductImages,
  createProductImage,
} from "@/lib/services/images";
import { createVariantImageSchema } from "@/lib/validations/variants";

export const GET = withAdminRoute(async (request, context) => {
  const { variantId } = await context.params;

  const images = await getProductImages(variantId);
  return jsonResponse(images);
});

export const POST = withAdminRoute(async (request, context) => {
  const { variantId } = await context.params;

  const parsed = await parseBody(request, createVariantImageSchema);
  if (parsed.error) return parsed.error;

  const image = await createProductImage({
    variant_id: variantId,
    image_url: parsed.data.image_url,
    display_order: parsed.data.display_order,
  });

  return jsonResponse(image, 201);
});

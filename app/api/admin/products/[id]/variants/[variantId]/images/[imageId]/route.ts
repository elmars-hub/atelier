import { errorResponse, withAdminRoute } from "@/lib/api-utils";
import { deleteProductImage } from "@/lib/services/images";

export const DELETE = withAdminRoute(async (request, context) => {
  const { imageId } = await context.params;

  try {
    await deleteProductImage(imageId);
    return new Response(null, { status: 204 });
  } catch {
    return errorResponse("Image not found or failed to delete", 404);
  }
});

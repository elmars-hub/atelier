import { withAdminRoute, jsonResponse, errorResponse } from "@/lib/api-utils";
import { uploadImage } from "@/lib/services/images";

export const POST = withAdminRoute(async (request) => {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const path = (formData.get("path") as string) || "misc";

    if (!file) {
      return errorResponse("File is required", 400);
    }

    if (!file.type.startsWith("image/")) {
      return errorResponse("File must be an image", 400);
    }

    const { url } = await uploadImage(file, path);

    return jsonResponse({ url }, 201);
  } catch (err) {
    console.error("[Image Upload Error]", err);
    return errorResponse("Failed to upload image", 500);
  }
});

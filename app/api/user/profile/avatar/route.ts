import { type NextRequest } from "next/server";
import {
  jsonResponse,
  errorResponse,
  withUserRoute,
  type UserAuth,
} from "@/lib/api-utils";
import { createClient } from "@/lib/supabase/server";

export const POST = withUserRoute(
  async (
    request: NextRequest,
    context: { params: Promise<Record<string, string>> },
    auth: UserAuth,
  ) => {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return errorResponse("File is required", 400);
    }

    const ALLOWED_MIME_TYPES: Record<string, string> = {
      "image/jpeg": "jpg",
      "image/png": "png",
      "image/webp": "webp",
      "image/gif": "gif",
    };

    const ext = ALLOWED_MIME_TYPES[file.type];
    if (!ext) {
      return errorResponse(
        "Invalid file type. Allowed: JPEG, PNG, WebP, GIF",
        400,
      );
    }

    if (file.size > 5 * 1024 * 1024) {
      return errorResponse("File too large (max 5MB)", 400);
    }

    const supabase = await createClient();

    // Deterministic path per user — upload upserts so old files are replaced
    // automatically rather than accumulating unbounded storage.
    const filePath = `${auth.user.id}/avatar.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: true,
      });

    if (uploadError) {
      return errorResponse("Failed to upload avatar", 500);
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("avatars").getPublicUrl(filePath);

    const { data: profile, error: updateError } = await supabase
      .from("profiles")
      .update({ avatar_url: publicUrl })
      .eq("id", auth.user.id)
      .select("avatar_url")
      .single();

    if (updateError) {
      return errorResponse("Failed to update profile avatar", 500);
    }

    return jsonResponse({ avatar_url: profile.avatar_url ?? publicUrl }, 201);
  },
);

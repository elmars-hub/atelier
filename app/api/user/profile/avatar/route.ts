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

    if (!file.type.startsWith("image/")) {
      return errorResponse("File must be an image", 400);
    }

    if (file.size > 5 * 1024 * 1024) {
      return errorResponse("File too large (max 5MB)", 400);
    }

    const supabase = await createClient();

    const ext = file.name.split(".").pop() ?? "jpg";
    const filePath = `${auth.user.id}/${Date.now()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
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

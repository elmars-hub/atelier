import { createAdminClient } from "@/lib/supabase/admin";

const BUCKET_NAME = "product-images";

/**
 * Upload an image to the product-images bucket.
 * Returns the public URL of the uploaded image.
 */
export async function uploadImage(
  file: File,
  path: string
): Promise<{ url: string }> {
  const supabase = createAdminClient();

  const filePath = `${path}/${Date.now()}-${file.name}`;

  const { error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (error) throw error;

  const {
    data: { publicUrl },
  } = supabase.storage.from(BUCKET_NAME).getPublicUrl(filePath);

  return { url: publicUrl };
}

/**
 * Delete an image from the product-images bucket.
 */
export async function deleteImage(filePath: string) {
  const supabase = createAdminClient();

  const { error } = await supabase.storage
    .from(BUCKET_NAME)
    .remove([filePath]);

  if (error) throw error;

  return { success: true };
}

/**
 * List all images in a given path within the bucket.
 */
export async function getImages(path: string) {
  const supabase = createAdminClient();

  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .list(path, { limit: 100, sortBy: { column: "created_at", order: "desc" } });

  if (error) throw error;

  return (data ?? []).map((file) => ({
    name: file.name,
    url: supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(`${path}/${file.name}`).data.publicUrl,
    created_at: file.created_at,
  }));
}

/**
 * Save an image reference to the product_images table.
 */
export async function createProductImage(input: {
  variant_id: string;
  image_url: string;
  display_order?: number;
}) {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("product_images")
    .insert(input)
    .select()
    .single();

  if (error) throw error;

  return data;
}

/**
 * Delete an image reference from the product_images table.
 */
export async function deleteProductImage(id: string) {
  const supabase = createAdminClient();

  const { error } = await supabase
    .from("product_images")
    .delete()
    .eq("id", id);

  if (error) throw error;

  return { success: true };
}

/**
 * Get all image references for a given variant.
 */
export async function getProductImages(variantId: string) {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("product_images")
    .select("*")
    .eq("variant_id", variantId)
    .order("display_order", { ascending: true });

  if (error) throw error;

  return data ?? [];
}

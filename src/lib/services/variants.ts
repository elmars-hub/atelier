import { createAdminClient } from "@/lib/supabase/admin";
import type { CreateVariantInput, UpdateVariantInput } from "@/lib/validations/variants";

const TABLE = "product_variants";

export async function getVariants(productId: string) {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from(TABLE)
    .select("*, product_images(*)")
    .eq("product_id", productId)
    .order("created_at", { ascending: true });

  if (error) throw error;

  return data ?? [];
}

export async function getVariantById(variantId: string) {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from(TABLE)
    .select("*, product_images(*)")
    .eq("id", variantId)
    .single();

  if (error) throw error;

  return data;
}

export async function createVariant(input: CreateVariantInput) {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from(TABLE)
    .insert(input)
    .select()
    .single();

  if (error) throw error;

  return data;
}

export async function updateVariant(id: string, input: UpdateVariantInput) {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from(TABLE)
    .update(input)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;

  return data;
}

export async function deleteVariant(id: string) {
  const supabase = createAdminClient();

  const { error } = await supabase.from(TABLE).delete().eq("id", id);

  if (error) throw error;

  return { success: true };
}

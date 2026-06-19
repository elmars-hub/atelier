import { createAdminClient } from "@/lib/supabase/admin";
import type { CreateProductSpecificationInput } from "@/lib/validations/products";

const TABLE = "product_specifications";

export async function getSpecifications(productId: string) {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .eq("product_id", productId)
    .order("display_order", { ascending: true });

  if (error) throw error;

  return data ?? [];
}

export async function createSpecification(
  input: CreateProductSpecificationInput,
) {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from(TABLE)
    .insert(input as never)
    .select()
    .single();

  if (error) throw error;

  return data;
}

export async function updateSpecification(
  id: string,
  input: Partial<CreateProductSpecificationInput>,
) {
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

export async function deleteSpecification(id: string) {
  const supabase = createAdminClient();

  const { error } = await supabase.from(TABLE).delete().eq("id", id);

  if (error) throw error;

  return { success: true };
}

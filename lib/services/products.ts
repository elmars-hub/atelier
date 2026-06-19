import { createAdminClient } from "@/lib/supabase/admin";
import type { PaginationParams } from "@/lib/api-utils";
import type { CreateProductInput, UpdateProductInput } from "@/lib/validations/products";

const TABLE = "products";

export async function getProducts(
  pagination: PaginationParams,
  filters?: {
    search?: string;
    category_id?: string;
    is_featured?: boolean;
    is_available?: boolean;
  }
) {
  const supabase = createAdminClient();

  let query = supabase
    .from(TABLE)
    .select("*, categories(id, name, slug)", { count: "exact" });

  if (filters?.search) {
    query = query.ilike("name", `%${filters.search}%`);
  }

  if (filters?.category_id) {
    query = query.eq("category_id", filters.category_id);
  }

  if (filters?.is_featured !== undefined) {
    query = query.eq("is_featured", filters.is_featured);
  }

  if (filters?.is_available !== undefined) {
    query = query.eq("is_available", filters.is_available);
  }

  const ascending = pagination.order === "asc";

  const { data, error, count } = await query
    .order(pagination.sort, { ascending })
    .range(pagination.offset, pagination.offset + pagination.limit - 1);

  if (error) throw error;

  return {
    data: data ?? [],
    total: count ?? 0,
    page: pagination.page,
    limit: pagination.limit,
  };
}

export async function getProductById(id: string) {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from(TABLE)
    .select(
      `
      *,
      categories(id, name, slug),
      product_variants(*),
      product_specifications(*)
    `
    )
    .eq("id", id)
    .single();

  if (error) throw error;

  return data;
}

export async function createProduct(input: CreateProductInput) {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from(TABLE)
    .insert(input)
    .select()
    .single();

  if (error) throw error;

  return data;
}

export async function updateProduct(id: string, input: UpdateProductInput) {
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

export async function deleteProduct(id: string) {
  const supabase = createAdminClient();

  const { error } = await supabase.from(TABLE).delete().eq("id", id);

  if (error) throw error;

  return { success: true };
}

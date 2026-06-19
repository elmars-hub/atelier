import { createAdminClient } from "@/lib/supabase/admin";
import type { PaginationParams } from "@/lib/api-utils";
import type { CreateCategoryInput, UpdateCategoryInput } from "@/lib/validations/categories";

const TABLE = "categories";

export async function getCategories(
  pagination: PaginationParams,
  filters?: { search?: string; is_active?: boolean }
) {
  const supabase = createAdminClient();

  let query = supabase
    .from(TABLE)
    .select("*", { count: "exact" });

  if (filters?.search) {
    query = query.ilike("name", `%${filters.search}%`);
  }

  if (filters?.is_active !== undefined) {
    query = query.eq("is_active", filters.is_active);
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

export async function getCategoryById(id: string) {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;

  return data;
}

export async function createCategory(input: CreateCategoryInput) {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from(TABLE)
    .insert(input)
    .select()
    .single();

  if (error) throw error;

  return data;
}

export async function updateCategory(id: string, input: UpdateCategoryInput) {
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

export async function deleteCategory(id: string) {
  const supabase = createAdminClient();

  const { error } = await supabase.from(TABLE).delete().eq("id", id);

  if (error) throw error;

  return { success: true };
}

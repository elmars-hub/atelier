import { createAdminClient } from "@/lib/supabase/admin";
import type { PaginationParams } from "@/lib/api-utils";
import type { OrderStatus } from "@/types/database";
import type {
  UpdateOrderStatusInput,
  CreateTrackingEventInput,
} from "@/lib/validations/orders";

const TABLE = "orders";

export async function getOrders(
  pagination: PaginationParams,
  filters?: { status?: string; search?: string }
) {
  const supabase = createAdminClient();

  let query = supabase
    .from(TABLE)
    .select("*", { count: "exact" });

  if (filters?.status) {
    query = query.eq("status", filters.status as OrderStatus);
  }

  if (filters?.search) {
    query = query.or(
      `order_number.ilike.%${filters.search}%,tracking_id.ilike.%${filters.search}%`
    );
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

export async function getOrderById(id: string) {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from(TABLE)
    .select(
      `
      *,
      order_items(*),
      order_tracking_events(*)
    `
    )
    .eq("id", id)
    .single();

  if (error) throw error;

  return data;
}

export async function updateOrderStatus(
  id: string,
  input: UpdateOrderStatusInput
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

export async function createTrackingEvent(input: CreateTrackingEventInput) {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("order_tracking_events")
    .insert({
      ...input,
      event_time: input.event_time || new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw error;

  return data;
}

"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import type {
  Order,
  OrderTrackingEvent,
  PaginatedResponse,
} from "@/types/database";

export function useOrders(params?: {
  page?: number;
  limit?: number;
  status?: string;
}) {
  const searchParams = new URLSearchParams();
  if (params?.page) searchParams.set("page", String(params.page));
  if (params?.limit) searchParams.set("limit", String(params.limit));
  if (params?.status) searchParams.set("status", params.status);
  return useQuery({
    queryKey: ["orders", params],
    queryFn: () =>
      apiFetch<PaginatedResponse<Order>>(
        `/api/admin/orders?${searchParams.toString()}`,
      ),
  });
}

export function useOrder(id: string) {
  return useQuery({
    queryKey: ["order", id],
    queryFn: () => apiFetch<Order>(`/api/admin/orders/${id}`),
    enabled: !!id,
  });
}

export function useUpdateOrderStatus(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { status: string }) =>
      apiFetch<Order>(`/api/admin/orders/${id}`, {
        method: "PATCH",
        body: data,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["order", id] });
    },
  });
}

export function useCreateTrackingEvent(orderId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { status: string; label: string; location?: string }) =>
      apiFetch<OrderTrackingEvent>(`/api/admin/orders/${orderId}/tracking`, {
        method: "POST",
        body: data,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["order", orderId] });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
}

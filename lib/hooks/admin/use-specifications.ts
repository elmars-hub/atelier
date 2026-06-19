"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import type { ProductSpecification } from "@/types/database";

export function useSpecifications(productId: string) {
  return useQuery({
    queryKey: ["specifications", productId],
    queryFn: () =>
      apiFetch<ProductSpecification[]>(
        `/api/admin/products/${productId}/specifications`,
      ),
    enabled: !!productId,
  });
}

export function useCreateSpecification(productId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      label: string;
      value: string;
      display_order?: number;
    }) =>
      apiFetch<ProductSpecification>(
        `/api/admin/products/${productId}/specifications`,
        { method: "POST", body: data },
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["specifications", productId],
      });
      queryClient.invalidateQueries({ queryKey: ["product", productId] });
    },
  });
}

export function useDeleteSpecification(productId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (specId: string) =>
      apiFetch(`/api/admin/products/${productId}/specifications/${specId}`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["specifications", productId],
      });
    },
  });
}

export function useUpdateSpecification(productId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { specId: string; body: Record<string, unknown> }) =>
      apiFetch<ProductSpecification>(
        `/api/admin/products/${productId}/specifications/${data.specId}`,
        { method: "PATCH", body: data.body },
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["specifications", productId],
      });
    },
  });
}

"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import type { ProductVariant, ProductImage } from "@/types/database";

export function useVariants(productId: string) {
  return useQuery({
    queryKey: ["variants", productId],
    queryFn: () =>
      apiFetch<(ProductVariant & { product_images: ProductImage[] })[]>(
        `/api/admin/products/${productId}/variants`,
      ),
    enabled: !!productId,
  });
}

export function useCreateVariant(productId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      apiFetch<ProductVariant>(`/api/admin/products/${productId}/variants`, {
        method: "POST",
        body: data,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["variants", productId] });
      queryClient.invalidateQueries({ queryKey: ["product", productId] });
    },
  });
}

export function useDeleteVariant(productId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (variantId: string) =>
      apiFetch(`/api/admin/products/${productId}/variants/${variantId}`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["variants", productId] });
      queryClient.invalidateQueries({ queryKey: ["product", productId] });
    },
  });
}

export function useUpdateVariant(productId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { variantId: string; body: Record<string, unknown> }) =>
      apiFetch<ProductVariant>(
        `/api/admin/products/${productId}/variants/${data.variantId}`,
        { method: "PATCH", body: data.body },
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["variants", productId] });
      queryClient.invalidateQueries({ queryKey: ["product", productId] });
    },
  });
}

export function useVariantImages(productId: string, variantId: string) {
  return useQuery({
    queryKey: ["variant-images", variantId],
    queryFn: () =>
      apiFetch<ProductImage[]>(
        `/api/admin/products/${productId}/variants/${variantId}/images`,
      ),
    enabled: !!variantId,
  });
}

export function useAddVariantImage(productId: string, variantId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { image_url: string; display_order?: number }) =>
      apiFetch<ProductImage>(
        `/api/admin/products/${productId}/variants/${variantId}/images`,
        { method: "POST", body: data },
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["variant-images", variantId],
      });
      queryClient.invalidateQueries({ queryKey: ["variants", productId] });
      queryClient.invalidateQueries({ queryKey: ["product", productId] });
    },
  });
}

export function useDeleteVariantImage(productId: string, variantId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (imageId: string) =>
      apiFetch(
        `/api/admin/products/${productId}/variants/${variantId}/images/${imageId}`,
        { method: "DELETE" },
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["variant-images", variantId],
      });
      queryClient.invalidateQueries({ queryKey: ["variants", productId] });
    },
  });
}

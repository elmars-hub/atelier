"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import type {
  Product,
  Category,
  ProductVariant,
  ProductImage,
  ProductSpecification,
  PaginatedResponse,
} from "@/types/database";

export function useProducts(params?: {
  page?: number;
  limit?: number;
  search?: string;
  category_id?: string;
}) {
  const searchParams = new URLSearchParams();
  if (params?.page) searchParams.set("page", String(params.page));
  if (params?.limit) searchParams.set("limit", String(params.limit));
  if (params?.search) searchParams.set("search", params.search);
  if (params?.category_id) searchParams.set("category_id", params.category_id);

  return useQuery({
    queryKey: ["products", params],
    queryFn: () =>
      apiFetch<PaginatedResponse<Product>>(
        `/api/admin/products?${searchParams.toString()}`,
      ),
  });
}

export type ProductWithRelations = Product & {
  categories: Category | null;
  product_variants: (ProductVariant & {
    product_images: ProductImage[];
  })[];
  product_specifications: ProductSpecification[];
};

export function useProduct(id: string) {
  return useQuery({
    queryKey: ["product", id],
    queryFn: () => apiFetch<ProductWithRelations>(`/api/admin/products/${id}`),
    enabled: !!id,
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      apiFetch<Product>("/api/admin/products", { method: "POST", body: data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

export function useUpdateProduct(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      apiFetch<Product>(`/api/admin/products/${id}`, {
        method: "PATCH",
        body: data,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["product", id] });
    },
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiFetch(`/api/admin/products/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

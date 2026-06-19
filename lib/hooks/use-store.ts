"use client";

import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import type {
  Product,
  Category,
  ProductVariant,
  ProductImage,
  ProductSpecification,
  Review,
} from "@/types/database";

type StoreProduct = Product & {
  product_variants: Pick<
    ProductVariant,
    | "id"
    | "color_name"
    | "color_hex"
    | "image_url"
    | "price_modifier"
    | "stock_quantity"
    | "is_default"
  >[];
  average_rating: number;
  review_count: number;
};

type StoreProductDetail = Product & {
  category: Pick<Category, "id" | "name" | "slug"> | null;
  variants: (ProductVariant & { product_images: ProductImage[] })[];
  specifications: ProductSpecification[];
  reviews: Review[];
  average_rating: number;
  review_count: number;
  related_products: Pick<
    Product,
    | "id"
    | "name"
    | "slug"
    | "price"
    | "discount_price"
    | "cover_image_url"
    | "is_available"
  >[];
};

type PaginatedResponse<T> = {
  data: T[];
  total: number;
  page: number;
  limit: number;
};

export function useStoreProducts(params?: {
  page?: number;
  limit?: number;
  category_id?: string;
  category?: string;
  search?: string;
  sort?: string;
  order?: "asc" | "desc";
}) {
  const searchParams = new URLSearchParams();
  if (params?.page) searchParams.set("page", String(params.page));
  if (params?.limit) searchParams.set("limit", String(params.limit));
  if (params?.category_id) searchParams.set("category_id", params.category_id);
  if (params?.category) searchParams.set("category", params.category);
  if (params?.search) searchParams.set("search", params.search);
  if (params?.sort) searchParams.set("sort", params.sort);
  if (params?.order) searchParams.set("order", params.order);

  const queryString = searchParams.toString();

  return useQuery({
    queryKey: ["store-products", params],
    queryFn: () =>
      apiFetch<PaginatedResponse<StoreProduct>>(
        `/api/store/products${queryString ? `?${queryString}` : ""}`,
      ),
  });
}

export function useStoreProduct(slug: string) {
  return useQuery({
    queryKey: ["store-product", slug],
    queryFn: () => apiFetch<StoreProductDetail>(`/api/store/products/${slug}`),
    enabled: !!slug,
  });
}

export function useStoreCategories() {
  return useQuery({
    queryKey: ["store-categories"],
    queryFn: () => apiFetch<Category[]>("/api/store/categories"),
  });
}

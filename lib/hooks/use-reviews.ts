"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import type { Review, Product } from "@/types/database";

type ReviewWithProduct = Review & {
  products: Pick<Product, "id" | "name" | "slug" | "cover_image_url">;
};

type PublicReview = {
  id: string;
  product_id: string;
  user_id: string;
  rating: number;
  comment: string | null;
  is_verified_purchase: boolean;
  created_at: string;
  reviewer_name: string | null;
  reviewer_avatar: string | null;
};

export function useUserReviews() {
  return useQuery({
    queryKey: ["user-reviews"],
    queryFn: () => apiFetch<ReviewWithProduct[]>("/api/user/reviews"),
    retry: false,
  });
}

export function useCreateReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      product_id: string;
      rating: number;
      comment?: string | null;
    }) => apiFetch<Review>("/api/user/reviews", { method: "POST", body: data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-reviews"] });
    },
  });
}

export function useUpdateReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      reviewId: string;
      rating?: number;
      comment?: string | null;
    }) =>
      apiFetch<Review>(`/api/user/reviews/${data.reviewId}`, {
        method: "PATCH",
        body: { rating: data.rating, comment: data.comment },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-reviews"] });
    },
  });
}

export function useDeleteReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (reviewId: string) =>
      apiFetch(`/api/user/reviews/${reviewId}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-reviews"] });
    },
  });
}

export function useProductReviews(slug: string, page = 1, limit = 20) {
  return useQuery({
    queryKey: ["product-reviews", slug, page, limit],
    queryFn: () =>
      apiFetch<{ data: PublicReview[]; total: number; page: number; limit: number }>(
        `/api/store/products/${slug}/reviews?page=${page}&limit=${limit}`,
      ),
    enabled: !!slug,
  });
}

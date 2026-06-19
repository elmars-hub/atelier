"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import type { Product, Wishlist } from "@/types/database";

type WishlistWithProduct = Wishlist & {
  products: Pick<
    Product,
    "name" | "slug" | "price" | "cover_image_url" | "is_available"
  >;
};

export function useWishlist() {
  return useQuery({
    queryKey: ["wishlist"],
    queryFn: () => apiFetch<WishlistWithProduct[]>("/api/user/wishlist"),
    retry: false,
  });
}

export function useAddToWishlist() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (productId: string) =>
      apiFetch<Wishlist>("/api/user/wishlist", {
        method: "POST",
        body: { product_id: productId },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wishlist"] });
    },
  });
}

export function useRemoveFromWishlist() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (productId: string) =>
      apiFetch(`/api/user/wishlist?product_id=${productId}`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wishlist"] });
    },
  });
}

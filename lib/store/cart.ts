"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { apiFetch } from "@/lib/api-client";

export type CartLineItem = {
  variant_id: string;
  product_id: string;
  product_name: string;
  product_slug: string;
  cover_image_url: string | null;
  color_name: string;
  color_hex: string | null;
  price: number;
  quantity: number;
};

type ServerCartItem = {
  id: string;
  variant_id: string;
  product_id: string;
  quantity: number;
  product_variants: {
    id: string;
    color_name: string;
    color_hex: string | null;
    image_url: string | null;
    price_modifier: number;
    stock_quantity: number;
    products: {
      id: string;
      name: string;
      slug: string;
      price: number;
      discount_price: number | null;
      cover_image_url: string | null;
      is_available: boolean;
    };
  };
};

type CartStore = {
  items: CartLineItem[];
  isAuthenticated: boolean;
  hydrated: boolean;

  setAuthenticated: (authed: boolean) => void;
  setHydrated: (hydrated: boolean) => void;
  syncFromServer: (serverItems: ServerCartItem[]) => void;
  addItem: (item: Omit<CartLineItem, "quantity">, quantity?: number) => void;
  removeItem: (variantId: string) => void;
  updateQuantity: (variantId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: () => number;
  subtotal: () => number;
};

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isAuthenticated: false,
      hydrated: false,

      setAuthenticated: (authed) => set({ isAuthenticated: authed }),
      setHydrated: (hydrated) => set({ hydrated }),

      syncFromServer: (serverItems) => {
        const items: CartLineItem[] = serverItems.map((item) => {
          const variant = item.product_variants;
          const product = variant.products;
          const basePrice = product.discount_price ?? product.price;
          return {
            variant_id: item.variant_id,
            product_id: item.product_id,
            product_name: product.name,
            product_slug: product.slug,
            cover_image_url: variant.image_url ?? product.cover_image_url,
            color_name: variant.color_name,
            color_hex: variant.color_hex,
            price: basePrice + variant.price_modifier,
            quantity: item.quantity,
          };
        });
        set({ items });
      },

      addItem: (item, quantity = 1) => {
        set((state) => {
          const existing = state.items.find(
            (i) => i.variant_id === item.variant_id,
          );
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.variant_id === item.variant_id
                  ? { ...i, quantity: i.quantity + quantity }
                  : i,
              ),
            };
          }
          return { items: [...state.items, { ...item, quantity }] };
        });

        if (get().isAuthenticated) {
          apiFetch("/api/user/cart", {
            method: "POST",
            body: {
              variant_id: item.variant_id,
              product_id: item.product_id,
              quantity,
            },
          }).catch(() => {});
        }
      },

      removeItem: (variantId) => {
        set((state) => ({
          items: state.items.filter((i) => i.variant_id !== variantId),
        }));

        if (get().isAuthenticated) {
          apiFetch(`/api/user/cart?variant_id=${variantId}`, {
            method: "DELETE",
          }).catch(() => {});
        }
      },

      updateQuantity: (variantId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(variantId);
          return;
        }
        set((state) => ({
          items: state.items.map((i) =>
            i.variant_id === variantId ? { ...i, quantity } : i,
          ),
        }));

        if (get().isAuthenticated) {
          apiFetch(`/api/user/cart?variant_id=${variantId}`, {
            method: "PATCH",
            body: { quantity },
          }).catch(() => {});
        }
      },

      clearCart: () => {
        set({ items: [] });

        if (get().isAuthenticated) {
          apiFetch("/api/user/cart", { method: "DELETE" }).catch(() => {});
        }
      },

      totalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),

      subtotal: () =>
        get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    }),
    {
      name: "atelier-cart",
      partialize: (state) => ({
        items: state.isAuthenticated ? [] : state.items,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    },
  ),
);

export async function mergeGuestCart() {
  const { items, isAuthenticated } = useCart.getState();

  if (items.length === 0 || isAuthenticated) return;

  try {
    await apiFetch("/api/user/cart/merge", {
      method: "POST",
      body: {
        items: items.map((i) => ({
          variant_id: i.variant_id,
          product_id: i.product_id,
          quantity: i.quantity,
        })),
      },
    });

    const serverItems = await apiFetch<ServerCartItem[]>("/api/user/cart");
    useCart.getState().syncFromServer(serverItems);
    useCart.getState().setAuthenticated(true);
  } catch {
    // merge failed — keep guest cart in localStorage
  }
}

export async function loadServerCart() {
  try {
    const serverItems = await apiFetch<ServerCartItem[]>("/api/user/cart");
    useCart.getState().syncFromServer(serverItems);
    useCart.getState().setAuthenticated(true);
  } catch {
    useCart.getState().setAuthenticated(false);
  }
}

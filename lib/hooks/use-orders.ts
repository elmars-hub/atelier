"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import type { Order, OrderItem, OrderTrackingEvent } from "@/types/database";
import { useCart } from "@/lib/store/cart";

type UserOrder = Order & {
  order_items: OrderItem[];
};

type UserOrderDetail = Order & {
  order_items: OrderItem[];
  order_tracking_events: OrderTrackingEvent[];
};

export function useUserOrders() {
  return useQuery({
    queryKey: ["user-orders"],
    queryFn: () => apiFetch<UserOrder[]>("/api/user/orders"),
    retry: false,
  });
}

export function useUserOrder(orderId: string) {
  return useQuery({
    queryKey: ["user-order", orderId],
    queryFn: () => apiFetch<UserOrderDetail>(`/api/user/orders/${orderId}`),
    enabled: !!orderId,
    retry: false,
  });
}

type CheckoutItem = {
  variant_id: string;
  quantity: number;
};

type CheckoutInput = {
  items: CheckoutItem[];
  shipping_address: {
    full_name: string;
    address_line_1: string;
    address_line_2?: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
    phone?: string;
  };
  shipping_method: "standard" | "express";
  payment_intent_id: string;
};

type PaymentIntentResponse = {
  payment_intent_id: string;
  client_secret: string;
  amount: number;
  currency: string;
  breakdown: {
    subtotal: number;
    shipping_cost: number;
    tax: number;
    total: number;
  };
};

export function useCreatePaymentIntent() {
  return useMutation({
    mutationFn: (data: Omit<CheckoutInput, "payment_intent_id">) =>
      apiFetch<PaymentIntentResponse>("/api/user/checkout/payment-intent", {
        method: "POST",
        body: data,
      }),
  });
}

export function useCheckout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CheckoutInput) =>
      apiFetch<{ success: boolean; order_id: string; order_number: string }>(
        "/api/user/orders",
        { method: "POST", body: data },
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-orders"] });
      queryClient.invalidateQueries({ queryKey: ["user-order"] });
      useCart.setState({ items: [] });
    },
  });
}

export function useCancelOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (orderId: string) =>
      apiFetch(`/api/user/orders/${orderId}/cancel`, { method: "POST" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-orders"] });
      queryClient.invalidateQueries({ queryKey: ["user-order"] });
    },
  });
}

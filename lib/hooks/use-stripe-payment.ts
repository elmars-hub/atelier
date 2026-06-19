"use client";

import { useMutation } from "@tanstack/react-query";
import {
  useStripe,
  useElements,
  PaymentElement,
} from "@stripe/react-stripe-js";
import { apiFetch } from "@/lib/api-client";
import { useCart } from "@/lib/store/cart";

type ConfirmPaymentInput = {
  paymentIntentId: string;
  checkoutData: {
    items: { variant_id: string; quantity: number }[];
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
};

export function useStripePayment() {
  const stripe = useStripe();
  const elements = useElements();

  return useMutation({
    mutationFn: async (data: ConfirmPaymentInput) => {
      if (!stripe || !elements) {
        throw new Error("Stripe not loaded");
      }

      const { error: confirmError } = await stripe.confirmPayment({
        elements,
        redirect: "if_required",
      });

      if (confirmError) {
        throw new Error(confirmError.message);
      }

      return apiFetch<{
        success: boolean;
        order_id: string;
        order_number: string;
      }>("/api/user/orders", { method: "POST", body: data.checkoutData });
    },
    onSuccess: () => {
      useCart.setState({ items: [] });
    },
  });
}

export { PaymentElement };

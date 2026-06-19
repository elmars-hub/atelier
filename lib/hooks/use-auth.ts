"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import type { AuthUser } from "@/types/database";
import { mergeGuestCart, loadServerCart, useCart } from "@/lib/store/cart";

type SignInInput = { email: string; password: string };
type SignUpInput = {
  email: string;
  password: string;
  confirm_password: string;
  full_name: string;
};

export function useSignIn() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: SignInInput) =>
      apiFetch<{ user: { id: string; email: string } }>(
        "/api/auth/client-login",
        { method: "POST", body: data },
      ),
    onSuccess: async () => {
      const user = await apiFetch<AuthUser>("/api/auth/me");
      queryClient.setQueryData(["me"], user);
      await mergeGuestCart();
    },
  });
}

export function useSignUp() {
  return useMutation({
    mutationFn: (data: SignUpInput) =>
      apiFetch<{
        user: { id: string; email: string };
        needs_email_confirmation: boolean;
      }>("/api/auth/register", { method: "POST", body: data }),
  });
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: (data: { email: string }) =>
      apiFetch<{ message: string }>("/api/auth/forgot-password", {
        method: "POST",
        body: data,
      }),
  });
}

export function useResetPassword() {
  return useMutation({
    mutationFn: (data: { password: string; confirm_password: string }) =>
      apiFetch<{ message: string }>("/api/auth/reset-password", {
        method: "POST",
        body: data,
      }),
  });
}

export function useSignOut() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => apiFetch("/api/auth/logout", { method: "POST" }),
    onSuccess: () => {
      queryClient.clear();
      useCart.getState().setAuthenticated(false);
      useCart.getState().clearCart();
    },
  });
}

export { loadServerCart };

"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import type { AuthUser } from "@/types/database";

export function useMe() {
  return useQuery({
    queryKey: ["me"],
    queryFn: () => apiFetch<AuthUser>("/api/auth/me"),
    retry: false,
  });
}

export function useLogin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { email: string; password: string }) =>
      apiFetch<{ user: { id: string; email: string; role: string } }>(
        "/api/auth/login",
        { method: "POST", body: data },
      ),
    onSuccess: (data) => {
      queryClient.setQueryData(["me"], {
        id: data.user.id,
        email: data.user.email,
        full_name: null,
        avatar_url: null,
        isAdmin: true,
        role: data.user.role,
      });
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => apiFetch("/api/auth/logout", { method: "POST" }),
    onSuccess: () => {
      queryClient.clear();
    },
  });
}

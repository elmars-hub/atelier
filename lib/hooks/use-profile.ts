"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch, apiUpload } from "@/lib/api-client";
import type { Profile } from "@/types/database";

export function useProfile() {
  return useQuery({
    queryKey: ["profile"],
    queryFn: () => apiFetch<Profile>("/api/user/profile"),
    retry: false,
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      full_name?: string;
      phone?: string | null;
      avatar_url?: string | null;
      date_of_birth?: string | null;
    }) =>
      apiFetch<Profile>("/api/user/profile", { method: "PATCH", body: data }),
    onSuccess: (data) => {
      queryClient.setQueryData(["profile"], data);
      queryClient.invalidateQueries({ queryKey: ["me"] });
    },
  });
}

export function useUploadAvatar() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { file: File }) => {
      const formData = new FormData();
      formData.append("file", data.file);
      return apiUpload<{ avatar_url: string }>(
        "/api/user/profile/avatar",
        formData,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      queryClient.invalidateQueries({ queryKey: ["me"] });
    },
  });
}

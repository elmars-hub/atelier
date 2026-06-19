"use client";

import { useMutation } from "@tanstack/react-query";
import { apiUpload } from "@/lib/api-client";

export function useUploadImage() {
  return useMutation({
    mutationFn: ({ file, path }: { file: File; path: string }) =>
      apiUpload<{ url: string }>("/api/admin/images", (() => {
        const fd = new FormData();
        fd.append("file", file);
        fd.append("path", path);
        return fd;
      })()),
  });
}

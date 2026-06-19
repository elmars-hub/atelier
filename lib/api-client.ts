"use client";

type FetchOptions = {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: unknown;
  headers?: Record<string, string>;
};

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public details?: Record<string, string[]>,
  ) {
    super(message);
  }
}

export async function apiFetch<T>(
  url: string,
  options: FetchOptions = {},
): Promise<T> {
  const res = await fetch(url, {
    method: options.method ?? "GET",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    throw new ApiError(
      data?.error ?? "Request failed",
      res.status,
      data?.details,
    );
  }

  return data as T;
}

export async function apiUpload<T>(
  url: string,
  formData: FormData,
): Promise<T> {
  const res = await fetch(url, {
    method: "POST",
    body: formData,
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    throw new ApiError(data?.error ?? "Upload failed", res.status);
  }

  return data as T;
}

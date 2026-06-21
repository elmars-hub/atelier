"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { useState } from "react";

export function Providers({ children }: React.PropsWithChildren) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000,
            gcTime: 10 * 60 * 1000,
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster
        position="top-right"
        closeButton
        toastOptions={{
          style: {
            fontFamily: "var(--font-sans)",
            background: "#ffffff",
            border: "1px solid rgba(43,43,43,0.1)",
            borderRadius: "14px",
            boxShadow: "0 4px 24px rgba(43,43,43,0.08)",
            color: "#2b2b2b",
            padding: "14px 16px",
          },
          classNames: {
            title: "text-sm font-semibold text-[#2b2b2b]",
            description: "text-xs text-[#8b8680] mt-0.5",
            success: "border-l-4 border-l-[#c49a6c]",
            error: "border-l-4 border-l-red-500",
            warning: "border-l-4 border-l-yellow-500",
            closeButton:
              "!bg-[#f7f5f1] !border-black/10 hover:!bg-[#8b8680]/10 !text-[#8b8680]",
          },
        }}
      />
    </QueryClientProvider>
  );
}

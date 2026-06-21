"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

export function WelcomeToast() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const auth = searchParams.get("auth");

  useEffect(() => {
    if (!auth) return;

    if (auth === "google_new") {
      toast.success("Welcome to Atelier!", {
        description: "Your account has been created with Google.",
      });
    } else if (auth === "google_return") {
      toast.success("Welcome back!", {
        description: "You've signed in with Google.",
      });
    } else if (auth === "confirmed") {
      toast.success("Email confirmed!", {
        description: "Your account is ready. Welcome to Atelier.",
      });
    }

    const params = new URLSearchParams(searchParams.toString());
    params.delete("auth");
    const newUrl = params.size > 0 ? `?${params.toString()}` : window.location.pathname;
    router.replace(newUrl, { scroll: false });
  }, [auth, router, searchParams]);

  return null;
}

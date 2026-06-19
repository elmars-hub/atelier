"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import Link from "next/link";
import { useForgotPassword } from "@/lib/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  forgotPasswordSchema,
  type ForgotPasswordInput,
} from "@/lib/validations/auth";

export default function ForgotPasswordPage() {
  const forgotPassword = useForgotPassword();
  const [sent, setSent] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = (data: ForgotPasswordInput) => {
    forgotPassword.mutate(data, {
      onSuccess: () => {
        setSent(true);
        toast.success("Reset link sent", {
          description: "Check your email for instructions.",
        });
      },
      onError: (err) => {
        const message = err instanceof Error ? err.message : "Request failed";
        setError("root", { message });
        toast.error("Failed to send reset link", { description: message });
      },
    });
  };

  if (sent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-atelier-bg px-4">
        <div className="w-full max-w-md text-center">
          <div className="bg-white rounded-xl border border-gray-200/60 p-8">
            <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-6 h-6 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h2 className="font-heading text-xl font-medium text-atelier-ink mb-2">
              Check your email
            </h2>
            <p className="text-sm text-atelier-stone mb-6">
              We&apos;ve sent a password reset link to your email. Click the link
              to set a new password.
            </p>
            <Link href="/signin">
              <Button variant="outline" className="w-full">
                Back to sign in
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-atelier-bg px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <Link
            href="/"
            className="font-heading text-2xl font-medium text-atelier-ink tracking-tight"
          >
            Atelier
          </Link>
          <p className="text-sm text-atelier-stone mt-2">
            Reset your password
          </p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200/60 p-8">
          {errors.root && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
              {errors.root.message}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-atelier-stone mb-1.5">
                Email
              </label>
              <input
                {...register("email")}
                type="email"
                className="w-full px-4 py-2.5 bg-atelier-bg border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-atelier-accent/30 focus:border-atelier-accent outline-none transition-all"
                placeholder="you@example.com"
              />
              {errors.email && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full bg-atelier-ink text-white hover:bg-atelier-ink/90"
              disabled={forgotPassword.isPending}
            >
              {forgotPassword.isPending
                ? "Sending..."
                : "Send Reset Link"}
            </Button>
          </form>

          <p className="text-center text-sm text-atelier-stone mt-6">
            Remember your password?{" "}
            <Link
              href="/signin"
              className="text-atelier-ink font-medium hover:underline"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import Link from "next/link";
import { useForgotPassword } from "@/lib/hooks/use-auth";
import { toast } from "sonner";
import {
  forgotPasswordSchema,
  type ForgotPasswordInput,
} from "@/lib/validations/auth";
import { FormInput } from "@/components/auth/FormInput";

export function ForgotPasswordForm() {
  const forgotPassword = useForgotPassword();
  const [sent, setSent] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    mode: "onBlur",
  });

  const onSubmit = (data: ForgotPasswordInput) => {
    forgotPassword.mutate(data, {
      onSuccess: () => {
        setSent(true);
        toast.success("Reset link sent — check your email.");
      },
      onError: (err) => {
        const msg = err instanceof Error ? err.message : "Request failed";
        setError("root", { message: msg });
        toast.error("Failed to send reset link", { description: msg });
      },
    });
  };

  if (sent) {
    return (
      <div className="text-center">
        <div className="w-16 h-16 rounded-full bg-atelier-accent/10 flex items-center justify-center mx-auto mb-6">
          <svg
            className="w-8 h-8 text-atelier-accent"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
        </div>
        <h2 className="font-heading text-3xl font-medium text-atelier-ink mb-3">
          Check your inbox
        </h2>
        <p className="text-sm text-atelier-stone leading-6 mb-8 max-w-xs mx-auto">
          We&apos;ve sent a password reset link to your email. Click it to set a
          new password.
        </p>
        <Link
          href="/signin"
          className="flex items-center justify-center w-full h-14 bg-atelier-ink text-white text-base font-medium rounded-2xl hover:bg-atelier-ink/90 transition-colors"
        >
          Back to Sign In
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="font-heading font-semibold text-5xl leading-[56px] text-black mb-2">
        Forgot Password
      </h1>
      <p className="font-sans text-base leading-7 text-atelier-stone mb-8">
        Enter your email address and we&apos;ll send you a reset link.
      </p>

      {errors.root && (
        <div
          className="mb-6 px-4 py-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600"
          role="alert"
        >
          {errors.root.message}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
        <FormInput
          label="Email Address"
          type="email"
          required
          placeholder="Enter Email Address"
          autoComplete="email"
          error={errors.email}
          {...register("email")}
        />

        <button
          type="submit"
          disabled={forgotPassword.isPending || isSubmitting}
          className="w-full h-14 bg-atelier-ink text-white text-base font-medium rounded-2xl hover:bg-atelier-ink/90 active:scale-[0.99] transition-all duration-150 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {forgotPassword.isPending ? "Sending…" : "Send Reset Link"}
        </button>
      </form>

      <p className="text-center text-base font-sans text-atelier-ink mt-6">
        Remember your password?{" "}
        <Link
          href="/signin"
          className="text-atelier-accent font-medium hover:underline"
        >
          Sign In
        </Link>
      </p>
    </div>
  );
}

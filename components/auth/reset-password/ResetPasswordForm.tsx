"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useResetPassword } from "@/lib/hooks/use-auth";
import { toast } from "sonner";
import {
  resetPasswordSchema,
  type ResetPasswordInput,
} from "@/lib/validations/auth";
import { PasswordInput } from "@/components/auth/PasswordInput";

export function ResetPasswordForm() {
  const router = useRouter();
  const resetPassword = useResetPassword();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    mode: "onBlur",
    reValidateMode: "onChange",
  });

  const onSubmit = (data: ResetPasswordInput) => {
    resetPassword.mutate(data, {
      onSuccess: () => {
        toast.success("Password updated successfully");
        router.push("/signin");
        router.refresh();
      },
      onError: (err) => {
        const msg = err instanceof Error ? err.message : "Reset failed";
        setError("root", { message: msg });
        toast.error("Failed to reset password", { description: msg });
      },
    });
  };

  return (
    <div>
      <h1 className="font-heading font-semibold text-5xl leading-[56px] text-black mb-2">
        Reset Password
      </h1>
      <p className="font-sans text-base leading-7 text-atelier-stone mb-8">
        Choose a strong new password for your account.
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
        <PasswordInput
          label="New Password"
          required
          placeholder="Enter New Password"
          autoComplete="new-password"
          error={errors.password}
          {...register("password")}
        />

        <PasswordInput
          label="Confirm Password"
          required
          placeholder="Confirm New Password"
          autoComplete="new-password"
          error={errors.confirm_password}
          {...register("confirm_password")}
        />

        <button
          type="submit"
          disabled={resetPassword.isPending || isSubmitting}
          className="w-full h-14 bg-atelier-ink text-white text-base font-medium rounded-2xl hover:bg-atelier-ink/90 active:scale-[0.99] transition-all duration-150 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {resetPassword.isPending ? "Updating…" : "Update Password"}
        </button>
      </form>

      <p className="text-center text-base font-sans text-atelier-ink mt-6">
        <Link
          href="/signin"
          className="text-atelier-accent font-medium hover:underline"
        >
          Back to Sign In
        </Link>
      </p>
    </div>
  );
}

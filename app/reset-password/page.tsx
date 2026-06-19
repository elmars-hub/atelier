"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useResetPassword } from "@/lib/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  resetPasswordSchema,
  type ResetPasswordInput,
} from "@/lib/validations/auth";

export default function ResetPasswordPage() {
  const router = useRouter();
  const resetPassword = useResetPassword();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = (data: ResetPasswordInput) => {
    resetPassword.mutate(data, {
      onSuccess: () => {
        toast.success("Password updated successfully");
        router.push("/signin");
        router.refresh();
      },
      onError: (err) => {
        const message = err instanceof Error ? err.message : "Reset failed";
        setError("root", { message });
        toast.error("Failed to reset password", { description: message });
      },
    });
  };

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
            Set a new password
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
                New Password
              </label>
              <input
                {...register("password")}
                type="password"
                className="w-full px-4 py-2.5 bg-atelier-bg border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-atelier-accent/30 focus:border-atelier-accent outline-none transition-all"
                placeholder="At least 8 characters"
              />
              {errors.password && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-atelier-stone mb-1.5">
                Confirm Password
              </label>
              <input
                {...register("confirm_password")}
                type="password"
                className="w-full px-4 py-2.5 bg-atelier-bg border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-atelier-accent/30 focus:border-atelier-accent outline-none transition-all"
                placeholder="••••••••"
              />
              {errors.confirm_password && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.confirm_password.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full bg-atelier-ink text-white hover:bg-atelier-ink/90"
              disabled={resetPassword.isPending}
            >
              {resetPassword.isPending ? "Updating..." : "Update Password"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}

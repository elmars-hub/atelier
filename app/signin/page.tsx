"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSignIn } from "@/lib/hooks/use-auth";
import { ApiError } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { loginSchema, type LoginInput } from "@/lib/validations/auth";

export default function SignInPage() {
  const router = useRouter();
  const signIn = useSignIn();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = (data: LoginInput) => {
    signIn.mutate(data, {
      onSuccess: () => {
        toast.success("Welcome back");
        router.push("/");
        router.refresh();
      },
      onError: (err) => {
        const message = err instanceof Error ? err.message : "Sign in failed";
        setError("root", { message });
        toast.error("Sign in failed", { description: message });
      },
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-atelier-bg px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <Link href="/" className="font-heading text-2xl font-medium text-atelier-ink tracking-tight">
            Atelier
          </Link>
          <p className="text-sm text-atelier-stone mt-2">
            Sign in to your account
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

            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-atelier-stone mb-1.5">
                Password
              </label>
              <input
                {...register("password")}
                type="password"
                className="w-full px-4 py-2.5 bg-atelier-bg border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-atelier-accent/30 focus:border-atelier-accent outline-none transition-all"
                placeholder="••••••••"
              />
              {errors.password && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            <div className="flex justify-end">
              <Link
                href="/forgot-password"
                className="text-xs text-atelier-stone hover:text-atelier-ink transition-colors"
              >
                Forgot password?
              </Link>
            </div>

            <Button
              type="submit"
              className="w-full bg-atelier-ink text-white hover:bg-atelier-ink/90"
              disabled={signIn.isPending}
            >
              {signIn.isPending ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <p className="text-center text-sm text-atelier-stone mt-6">
            Don&apos;t have an account?{" "}
            <Link
              href="/signup"
              className="text-atelier-ink font-medium hover:underline"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

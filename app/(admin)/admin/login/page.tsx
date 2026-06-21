"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { useLogin } from "@/lib/hooks/admin/use-auth";
import { ApiError } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/admin/util/loading";

const loginSchema = z.object({
  email: z.email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const login = useLogin();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = (data: LoginValues) => {
    login.mutate(data, {
      onSuccess: () => {
        router.push("/admin");
        router.refresh();
      },
      onError: (err) => {
        if (err instanceof ApiError) {
          setError("root", { message: err.message });
        }
      },
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-atelier-bg px-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <h1 className="font-heading text-3xl font-medium text-atelier-ink tracking-tight">
            Atelier
          </h1>
          <p className="mt-2 text-xs uppercase tracking-[0.2em] text-atelier-accent">
            Admin Panel
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200/60 px-8 py-10 shadow-sm">
          {errors.root && (
            <div className="mb-6 px-4 py-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
              {errors.root.message}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label
                htmlFor="email"
                className="block text-xs font-medium uppercase tracking-wider text-atelier-stone mb-2"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                {...register("email")}
                className="w-full px-4 py-2.5 bg-atelier-bg border border-gray-200 rounded-lg text-sm text-atelier-ink focus:ring-2 focus:ring-atelier-accent/30 focus:border-atelier-accent outline-none transition-all cursor-text"
                placeholder="admin@example.com"
              />
              {errors.email && (
                <p className="text-xs text-red-500 mt-1.5">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-xs font-medium uppercase tracking-wider text-atelier-stone mb-2"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                {...register("password")}
                className="w-full px-4 py-2.5 bg-atelier-bg border border-gray-200 rounded-lg text-sm text-atelier-ink focus:ring-2 focus:ring-atelier-accent/30 focus:border-atelier-accent outline-none transition-all cursor-text"
                placeholder="••••••••"
              />
              {errors.password && (
                <p className="text-xs text-red-500 mt-1.5">
                  {errors.password.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              disabled={login.isPending}
              className="w-full cursor-pointer bg-black text-white hover:bg-black/90"
              size="lg"
            >
              {login.isPending ? (
                <span className="flex items-center gap-2">
                  <LoadingSpinner className="w-4 h-4" />
                  Signing in
                </span>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>
        </div>

        <p className="text-center text-xs text-atelier-stone mt-8">
          Atelier Furniture &mdash; Management Console
        </p>
      </div>
    </div>
  );
}

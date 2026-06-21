"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSignIn } from "@/lib/hooks/use-auth";
import { toast } from "sonner";
import { signInFormSchema, type SignInFormInput } from "@/lib/validations/auth";
import { FormInput } from "@/components/auth/FormInput";
import { PasswordInput } from "@/components/auth/PasswordInput";
import { FormCheckbox } from "@/components/auth/FormCheckbox";
import { GoogleButton } from "@/components/auth/GoogleButton";

export function SignInForm() {
  const router = useRouter();
  const signIn = useSignIn();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<SignInFormInput>({
    resolver: zodResolver(signInFormSchema),
    mode: "onBlur",
    reValidateMode: "onChange",
    defaultValues: {
      remember_me: false,
    },
  });

  const onSubmit = (data: SignInFormInput) => {
    signIn.mutate(
      { email: data.email, password: data.password },
      {
        onSuccess: () => {
          toast.success("Welcome back");
          router.push("/");
          router.refresh();
        },
        onError: (err) => {
          const msg = err instanceof Error ? err.message : "Sign in failed";
          if (/invalid (login credentials|email|password)/i.test(msg)) {
            setError("root", { message: "Invalid email or password" });
          } else {
            setError("root", { message: msg });
          }
          toast.error("Sign in failed", { description: msg });
        },
      },
    );
  };

  return (
    <div>
      <h1 className="font-heading font-semibold text-5xl leading-[56px] text-black mb-2">
        Sign In
      </h1>
      <p className="font-sans text-base leading-7 text-atelier-stone mb-8">
        Fill in your details to access your account.
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

        <PasswordInput
          label="Password"
          required
          placeholder="Enter Password"
          autoComplete="current-password"
          error={errors.password}
          {...register("password")}
        />

        {/* Remember Me + Forgot Password */}
        <div className="flex items-center justify-between">
          <FormCheckbox {...register("remember_me")}>Remember Me</FormCheckbox>
          <Link
            href="/forgot-password"
            className="text-sm text-atelier-accent font-medium hover:underline"
          >
            Forgotten Password?
          </Link>
        </div>

        {/* CTA */}
        <button
          type="submit"
          disabled={signIn.isPending || isSubmitting}
          className="w-full h-14 bg-atelier-ink text-white text-base font-medium rounded-2xl hover:bg-atelier-ink/90 active:scale-[0.99] transition-all duration-150 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {signIn.isPending ? "Signing in…" : "Sign In"}
        </button>

        {/* Divider */}
        <div className="flex items-center gap-4">
          <div className="flex-1 h-px bg-[#D9D4CC]" />
          <span className="text-sm text-atelier-stone font-sans">
            or sign in with
          </span>
          <div className="flex-1 h-px bg-[#D9D4CC]" />
        </div>

        {/* Google OAuth */}
        <GoogleButton label="Sign In with Google" />
      </form>

      <p className="text-center text-base font-sans text-atelier-ink mt-6">
        Don&apos;t have an account?{" "}
        <Link
          href="/signup"
          className="text-atelier-accent font-medium hover:underline"
        >
          Sign Up
        </Link>
      </p>
    </div>
  );
}

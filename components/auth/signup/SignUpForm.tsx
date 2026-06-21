"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { useSignUp } from "@/lib/hooks/use-auth";
import { toast } from "sonner";
import { signUpFormSchema, type SignUpFormInput } from "@/lib/validations/auth";
import { FormInput } from "@/components/auth/FormInput";
import { PasswordInput } from "@/components/auth/PasswordInput";
import { FormCheckbox } from "@/components/auth/FormCheckbox";
import { GoogleButton } from "@/components/auth/GoogleButton";

export function SignUpForm() {
  const router = useRouter();
  const signUp = useSignUp();
  const [confirmed, setConfirmed] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<SignUpFormInput>({
    resolver: zodResolver(signUpFormSchema),
    mode: "onBlur",
    reValidateMode: "onChange",
    defaultValues: {
      agree_terms: false,
    },
  });

  const onSubmit = (data: SignUpFormInput) => {
    signUp.mutate(
      {
        full_name: `${data.first_name.trim()} ${data.last_name.trim()}`,
        email: data.email,
        password: data.password,
        confirm_password: data.password,
      },
      {
        onSuccess: (res) => {
          if (res.needs_email_confirmation) {
            setConfirmed(true);
            toast.success("Account created — check your email to verify.");
          } else {
            toast.success("Account created successfully");
            router.push("/signin");
            router.refresh();
          }
        },
        onError: (err) => {
          const msg = err instanceof Error ? err.message : "Sign up failed";
          if (/already (registered|exists|used)/i.test(msg)) {
            setError("email", {
              message: "An account with this email already exists",
            });
          } else {
            setError("root", { message: msg });
          }
          toast.error("Sign up failed", { description: msg });
        },
      },
    );
  };

  if (confirmed) {
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
        <p className="text-sm text-atelier-stone leading-6 mb-8 max-w-[340px] mx-auto">
          We&apos;ve sent a verification link to your email. Click it to
          activate your account before signing in.
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
        Sign Up
      </h1>
      <p className="font-sans text-base leading-7 text-atelier-stone mb-8">
        Fill your information below or Sign Up with your social account.
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
        {/* Row 1: First Name + Last Name */}
        <div className="grid grid-cols-2 gap-5">
          <FormInput
            label="First Name"
            required
            placeholder="Enter First Name"
            autoComplete="given-name"
            error={errors.first_name}
            {...register("first_name")}
          />
          <FormInput
            label="Last Name"
            required
            placeholder="Enter Last Name"
            autoComplete="family-name"
            error={errors.last_name}
            {...register("last_name")}
          />
        </div>

        {/* Row 2: Email + Password */}
        <div className="grid grid-cols-2 gap-5">
          <FormInput
            label="Email"
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
            autoComplete="new-password"
            error={errors.password}
            {...register("password")}
          />
        </div>

        {/* Terms & Conditions */}
        <FormCheckbox error={errors.agree_terms} {...register("agree_terms")}>
          Agree with{" "}
          <Link href="/terms" className="text-atelier-accent hover:underline">
            Terms &amp; Condition
          </Link>{" "}
          &amp;{" "}
          <Link href="/privacy" className="text-atelier-accent hover:underline">
            Privacy Policy
          </Link>
        </FormCheckbox>

        {/* Submit */}
        <button
          type="submit"
          disabled={signUp.isPending || isSubmitting}
          className="w-full h-14 bg-atelier-ink text-white text-base font-medium rounded-2xl hover:bg-atelier-ink/90 active:scale-[0.99] transition-all duration-150 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {signUp.isPending ? "Creating account…" : "Sign Up"}
        </button>

        {/* Divider */}
        <div className="flex items-center gap-4">
          <div className="flex-1 h-px bg-[#D9D4CC]" />
          <span className="text-sm text-atelier-stone font-sans">
            or sign up with
          </span>
          <div className="flex-1 h-px bg-[#D9D4CC]" />
        </div>

        {/* Google OAuth */}
        <GoogleButton label="Sign Up with Google" />
      </form>

      <p className="text-center text-base font-sans text-atelier-ink mt-6">
        Have an account?{" "}
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

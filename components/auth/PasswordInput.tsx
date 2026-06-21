"use client";

import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";
import type { FieldError } from "react-hook-form";

export type PasswordInputProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "type" | "id"
> & {
  label: string;
  name: string;
  required?: boolean;
  error?: FieldError | string;
};

export const PasswordInput = React.forwardRef<
  HTMLInputElement,
  PasswordInputProps
>(({ label, name, required = false, error, className, ...props }, ref) => {
  const [visible, setVisible] = useState(false);
  const errorMessage = typeof error === "string" ? error : error?.message;
  const inputId = `field-${name}`;
  const errorId = `${inputId}-error`;

  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={inputId}
        className="text-sm font-medium text-atelier-ink tracking-[-0.02em] leading-[22px]"
      >
        {label}
        {required && (
          <span className="text-atelier-accent ml-0.5" aria-hidden="true">
            *
          </span>
        )}
      </label>
      <div className="relative">
        <input
          ref={ref}
          id={inputId}
          name={name}
          type={visible ? "text" : "password"}
          aria-invalid={!!errorMessage}
          aria-describedby={errorMessage ? errorId : undefined}
          className={cn(
            "h-14 w-full px-4 pr-12 rounded-xl border border-[#D9D4CC] bg-white",
            "text-base text-atelier-ink placeholder:text-atelier-stone/60",
            "outline-none transition-all duration-150",
            "focus:border-atelier-ink focus:ring-2 focus:ring-atelier-ink/10",
            errorMessage &&
              "border-red-400 focus:border-red-500 focus:ring-red-200/40",
            className,
          )}
          {...props}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          tabIndex={-1}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-atelier-stone hover:text-atelier-ink transition-colors"
          aria-label={visible ? "Hide password" : "Show password"}
        >
          {visible ? (
            <Eye size={20} strokeWidth={1.5} />
          ) : (
            <EyeOff size={20} strokeWidth={1.5} />
          )}
        </button>
      </div>
      {errorMessage && (
        <p
          id={errorId}
          className="text-xs text-red-500 leading-4"
          role="alert"
        >
          {errorMessage}
        </p>
      )}
    </div>
  );
});

PasswordInput.displayName = "PasswordInput";

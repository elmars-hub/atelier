"use client";

import React from "react";
import { cn } from "@/lib/utils";
import type { FieldError } from "react-hook-form";

export type FormInputProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "id"
> & {
  label: string;
  name: string;
  required?: boolean;
  error?: FieldError | string;
};

export const FormInput = React.forwardRef<HTMLInputElement, FormInputProps>(
  ({ label, name, required = false, error, className, ...props }, ref) => {
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
        <input
          ref={ref}
          id={inputId}
          name={name}
          aria-invalid={!!errorMessage}
          aria-describedby={errorMessage ? errorId : undefined}
          className={cn(
            "h-14 w-full px-4 rounded-xl border border-[#D9D4CC] bg-white",
            "text-base text-atelier-ink placeholder:text-atelier-stone/60",
            "outline-none transition-all duration-150",
            "focus:border-atelier-ink focus:ring-2 focus:ring-atelier-ink/10",
            errorMessage &&
              "border-red-400 focus:border-red-500 focus:ring-red-200/40",
            className,
          )}
          {...props}
        />
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
  },
);

FormInput.displayName = "FormInput";

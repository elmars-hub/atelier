"use client";

import React from "react";
import { cn } from "@/lib/utils";
import type { FieldError } from "react-hook-form";

export type FormCheckboxProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "type" | "id"
> & {
  name: string;
  error?: FieldError | string;
  children: React.ReactNode;
};

export const FormCheckbox = React.forwardRef<
  HTMLInputElement,
  FormCheckboxProps
>(({ name, error, className, children, ...props }, ref) => {
  const errorMessage = typeof error === "string" ? error : error?.message;
  const inputId = `checkbox-${name}`;

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-3">
        <div className="relative shrink-0 flex items-center">
          <input
            ref={ref}
            type="checkbox"
            id={inputId}
            name={name}
            aria-invalid={!!errorMessage}
            className={cn(
              "peer appearance-none w-[22px] h-[22px] rounded-[4px] shrink-0",
              "border border-[#D9D4CC] bg-white cursor-pointer",
              "checked:bg-atelier-accent checked:border-atelier-accent",
              "focus:outline-none focus:ring-2 focus:ring-atelier-accent/30",
              "transition-all duration-150",
              className,
            )}
            {...props}
          />
          {/* Checkmark SVG */}
          <svg
            className="absolute left-[4px] top-[4px] w-[14px] h-[14px] text-white pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity duration-150"
            fill="none"
            viewBox="0 0 14 14"
            stroke="currentColor"
            strokeWidth={2.5}
            aria-hidden="true"
          >
            <polyline
              points="2,7 5.5,10.5 12,3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <label
          htmlFor={inputId}
          className="text-sm text-atelier-ink leading-[22px] tracking-[-0.02em] cursor-pointer select-none"
        >
          {children}
        </label>
      </div>
      {errorMessage && (
        <p className="text-xs text-red-500 ml-[34px] leading-4" role="alert">
          {errorMessage}
        </p>
      )}
    </div>
  );
});

FormCheckbox.displayName = "FormCheckbox";

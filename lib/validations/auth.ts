import { z } from "zod";

// ── UI form schemas (client-side only) ──────────────────────────────────────

const nameField = (label: string) =>
  z
    .string()
    .min(1, `${label} is required`)
    .max(50, `${label} is too long`)
    .regex(/^[a-zA-Z\s'\-]+$/, `${label} contains invalid characters`);

export const signUpFormSchema = z.object({
  first_name: nameField("First name"),
  last_name: nameField("Last name"),
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(72, "Password is too long"),
  agree_terms: z
    .boolean()
    .refine((v) => v === true, "You must agree to the terms & conditions"),
});

export type SignUpFormInput = z.infer<typeof signUpFormSchema>;

export const signInFormSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
  remember_me: z.boolean().optional(),
});

export type SignInFormInput = z.infer<typeof signInFormSchema>;

// ── API schemas (server-side) ────────────────────────────────────────────────

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirm_password: z
      .string()
      .min(8, "Password must be at least 8 characters"),
    full_name: z.string().min(2, "Full name is required").max(100),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: "Passwords do not match",
    path: ["confirm_password"],
  });

export type RegisterInput = z.infer<typeof registerSchema>;

export const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z
  .object({
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirm_password: z
      .string()
      .min(8, "Password must be at least 8 characters"),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: "Passwords do not match",
    path: ["confirm_password"],
  });

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

import { AuthLayout } from "@/components/auth/AuthLayout";
import { ForgotPasswordForm } from "@/components/auth/forgot-password/ForgotPasswordForm";

export default function ForgotPasswordPage() {
  return (
    <AuthLayout
      imageSrc="/images/forgotpassword.jpg"
      imageAlt="Atelier furniture interior"
      headline="Timeless Furniture Designed For Modern Living"
      tagline="We'll help you get back into your account quickly and securely."
    >
      <ForgotPasswordForm />
    </AuthLayout>
  );
}

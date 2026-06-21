import { AuthLayout } from "@/components/auth/AuthLayout";
import { ResetPasswordForm } from "@/components/auth/reset-password/ResetPasswordForm";

export default function ResetPasswordPage() {
  return (
    <AuthLayout
      imageSrc="/images/resetpassword.jpg"
      imageAlt="Atelier furniture interior"
      headline="Timeless Furniture Designed For Modern Living"
      tagline="Create a strong new password to keep your account secure."
    >
      <ResetPasswordForm />
    </AuthLayout>
  );
}

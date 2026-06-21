import { AuthLayout } from "@/components/auth/AuthLayout";
import { SignUpForm } from "@/components/auth/signup/SignUpForm";

export default function SignUpPage() {
  return (
    <AuthLayout
      imageSrc="/images/signup.jpg"
      imageAlt="Minimal floating shelf decor with warm ambient lighting"
      headline="Timeless Furniture Designed For Modern Living"
      tagline="Create an account to track orders, save favorites, and enjoy a personalized shopping experience."
    >
      <SignUpForm />
    </AuthLayout>
  );
}

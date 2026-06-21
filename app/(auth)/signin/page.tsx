import { AuthLayout } from "@/components/auth/AuthLayout";
import { SignInForm } from "@/components/auth/signin/SignInForm";

export default function SignInPage() {
  return (
    <AuthLayout
      imageSrc="/images/signin.jpg"
      imageAlt="Modern living room with warm ambient lighting"
      headline="Timeless Furniture Designed For Modern Living"
      tagline="Sign in to access your orders, wishlist, and personalized recommendations."
    >
      <SignInForm />
    </AuthLayout>
  );
}

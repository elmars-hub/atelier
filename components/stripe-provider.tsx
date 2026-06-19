"use client";

import { loadStripe, type Stripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { useEffect, useState } from "react";

let stripePromise: Promise<Stripe | null> | null = null;

function getStripePromise() {
  if (!stripePromise) {
    const key = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
    if (!key) {
      console.warn("NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is not set");
      return Promise.resolve(null);
    }
    stripePromise = loadStripe(key);
  }
  return stripePromise;
}

type StripeProviderProps = {
  clientSecret: string;
  children: React.ReactNode;
};

export function StripeProvider({ clientSecret, children }: StripeProviderProps) {
  const [stripe, setStripe] = useState<Stripe | null>(null);

  useEffect(() => {
    getStripePromise().then(setStripe);
  }, []);

  if (!stripe || !clientSecret) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-stone-300 border-t-stone-900" />
      </div>
    );
  }

  return (
    <Elements
      stripe={stripe}
      options={{
        clientSecret,
        appearance: {
          theme: "stripe",
          variables: {
            colorPrimary: "#1a1a1a",
            colorBackground: "#ffffff",
            colorText: "#1a1a1a",
            colorDanger: "#df1b41",
            fontFamily: "inherit",
            borderRadius: "8px",
          },
        },
      }}
    >
      {children}
    </Elements>
  );
}

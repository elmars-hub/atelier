import Image from "next/image";
import type { ReactNode } from "react";

type AuthLayoutProps = {
  imageSrc: string;
  imageAlt?: string;
  headline: string;
  tagline: string;
  children: ReactNode;
};

export function AuthLayout({
  imageSrc,
  imageAlt = "Atelier interior",
  headline,
  tagline,
  children,
}: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-atelier-bg flex items-center justify-center">
      <div className="w-full min-h-screen lg:min-h-0 lg:h-[796px] lg:max-w-[1440px] flex">
        <div className="hidden lg:block relative shrink-0 w-[685px] m-6 rounded-3xl overflow-hidden">
          <Image
            src={imageSrc}
            alt={imageAlt}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-black/10" />
          <div className="absolute inset-x-0 bottom-0 px-12 pb-10">
            <p className="font-sans font-medium text-sm text-white tracking-[0.02em] leading-[22px] mb-3">
              ATELIER FURNITURE
            </p>
            <h2 className="font-heading font-medium text-[56px] leading-[64px] tracking-[0.02em] text-white max-w-[500px] mb-6">
              {headline}
            </h2>
            <p className="font-sans font-medium text-base leading-6 tracking-[0.02em] text-white/90 max-w-[400px]">
              {tagline}
            </p>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center px-8 lg:px-16 py-10 lg:py-0">
          <div className="w-full max-w-[580px]">{children}</div>
        </div>
      </div>
    </div>
  );
}

import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <>
      <section className="relative w-full h-150 sm:h-190 md:h-229 overflow-hidden">
        {/* Desktop: original mirrored hero image */}
        <Image
          src="/images/homehero.jpg"
          alt="Modern minimalist living room"
          fill
          className="object-cover hidden md:block"
          priority
          // sizes="100vw"
        />
        {/* Mobile: dedicated mobile hero image */}
        <Image
          src="/images/homeHeroMobile.jpg"
          alt="Modern minimalist living room"
          fill
          className="object-cover md:hidden"
          priority
          sizes="100vw"
        />

        <div className="absolute inset-0 bg-linear-to-t from-black/4 via-transparent to-transparent pointer-events-none" />

        {/* Content area starts below the 88px fixed nav, so text is placed within the visible 828px hero area */}
        <div className="absolute top-22 right-0 bottom-0 left-0 flex items-end">
          <div className="max-w-[1440px] w-full mx-auto px-5 sm:px-10 lg:px-20 pb-16 sm:pb-24 md:pb-36">
            <p className="text-xs sm:text-sm font-medium uppercase tracking-[0.2em] text-atelier-accent mb-3 md:mb-6">
              New Arrivals 2026
            </p>

            <h1 className="font-heading text-3xl sm:text-4xl md:text-[64px] md:leading-[1.1] font-medium text-black max-w-[16rem] sm:max-w-md md:max-w-xl">
              Timeless Furniture Designed for Everyday Luxury
            </h1>

            <p className="mt-3 md:mt-6 text-sm sm:text-base text-atelier-stone max-w-xs sm:max-w-sm md:max-w-md leading-relaxed">
              Discover handcrafted furniture pieces that blend comfort,
              elegance, and functionality into every corner of your home.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 mt-6 md:mt-10">
              <Link
                href="/shop"
                className="inline-flex items-center justify-center h-12 px-8 bg-black text-white text-sm font-medium rounded-sm hover:bg-black/90 transition-colors"
              >
                Shop Collection
              </Link>
              <Link
                href="/collections"
                className="inline-flex items-center justify-center h-12 px-8 border border-black text-black text-sm font-medium rounded-sm hover:bg-black/5 transition-colors"
              >
                Explore Rooms
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

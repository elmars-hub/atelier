import Link from "next/link";

const footerColumns = [
  {
    heading: "Shop",
    links: [
      { label: "All Products", href: "/shop" },
      { label: "New Arrivals", href: "/shop?sort=newest" },
      { label: "Sofa", href: "/shop?category=sofa" },
      { label: "Chairs", href: "/shop?category=chairs" },
      { label: "Tables", href: "/shop?category=tables" },
      { label: "Lighting", href: "/shop?category=lighting" },
      { label: "Storage", href: "/shop?category=storage" },
    ],
  },
  {
    heading: "Collections",
    links: [
      { label: "New Arrivals", href: "/collections/new" },
      { label: "Bestsellers", href: "/collections/bestsellers" },
      { label: "Minimalist Collection", href: "/collections/minimalist" },
      { label: "Luxury Collection", href: "/collections/luxury" },
    ],
  },
  {
    heading: "Customer Service",
    links: [
      { label: "Contact Us", href: "/contact" },
      { label: "FAQs", href: "/faqs" },
      { label: "Shopping & Delivery", href: "/delivery" },
      { label: "Returns & Exchange", href: "/returns" },
      { label: "Track Order", href: "/track-order" },
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "About Us", href: "/about" },
      { label: "Our Story", href: "/about#story" },
      { label: "Sustainability", href: "/sustainability" },
      { label: "Careers", href: "/careers" },
      { label: "Blog", href: "/blog" },
    ],
  },
];

function InstagramIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" stroke="white" strokeWidth="1.5" />
      <circle cx="12" cy="12" r="4.5" stroke="white" strokeWidth="1.5" />
      <circle cx="17" cy="6.5" r="1" fill="white" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M18 2H15C13.6739 2 12.4021 2.52678 11.4645 3.46447C10.5268 4.40215 10 5.67392 10 7V10H7V14H10V22H14V14H17L18 10H14V7C14 6.73478 14.1054 6.48043 14.2929 6.29289C14.4804 6.10536 14.7348 6 15 6H18V2Z"
        stroke="white"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PinterestIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 2C6.477 2 2 6.477 2 12c0 4.236 2.636 7.855 6.356 9.312-.088-.791-.167-2.005.035-2.868.181-.78 1.172-4.97 1.172-4.97s-.299-.598-.299-1.482c0-1.388.806-2.428 1.808-2.428.853 0 1.267.64 1.267 1.408 0 .858-.546 2.14-.828 3.33-.236.995.499 1.806 1.476 1.806 1.771 0 3.135-1.866 3.135-4.56 0-2.385-1.714-4.052-4.161-4.052-2.834 0-4.498 2.126-4.498 4.323 0 .856.33 1.773.741 2.273a.3.3 0 0 1 .069.286c-.076.315-.244.995-.277 1.134-.044.183-.146.222-.337.134-1.249-.581-2.03-2.407-2.03-3.874 0-3.154 2.292-6.052 6.608-6.052 3.469 0 6.165 2.473 6.165 5.776 0 3.447-2.173 6.22-5.19 6.22-1.013 0-1.966-.527-2.292-1.148l-.623 2.378c-.226.869-.835 1.958-1.244 2.621.937.29 1.931.446 2.962.446 5.523 0 10-4.477 10-10S17.523 2 12 2z"
        stroke="white"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

function YoutubeIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M22.54 6.42C22.4212 5.94541 22.1793 5.51057 21.8387 5.15941C21.498 4.80824 21.0708 4.55318 20.6 4.42C18.88 4 12 4 12 4C12 4 5.12 4 3.4 4.46C2.92925 4.59318 2.50198 4.84824 2.16135 5.19941C1.82072 5.55057 1.57879 5.98541 1.46 6.46C1.14521 8.20556 0.991235 9.97631 1 11.75C0.988787 13.537 1.14277 15.3213 1.46 17.08C1.59096 17.5398 1.83831 17.9581 2.17814 18.2945C2.51798 18.6308 2.93882 18.8738 3.4 19C5.12 19.46 12 19.46 12 19.46C12 19.46 18.88 19.46 20.6 19C21.0708 18.8668 21.498 18.6118 21.8387 18.2606C22.1793 17.9094 22.4212 17.4746 22.54 17C22.8524 15.2676 23.0063 13.5103 23 11.75C23.0112 9.96295 22.8573 8.1787 22.54 6.42Z"
        stroke="white"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9.75 15.02L15.5 11.75L9.75 8.48V15.02Z"
        stroke="white"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const socialLinks = [
  { label: "Instagram", href: "#", Icon: InstagramIcon },
  { label: "Facebook", href: "#", Icon: FacebookIcon },
  { label: "Pinterest", href: "#", Icon: PinterestIcon },
  { label: "YouTube", href: "#", Icon: YoutubeIcon },
];

export function Footer() {
  return (
    <footer className="bg-[#6E6E6E]">
      <div className="max-w-[1440px] mx-auto px-5 sm:px-10 lg:px-20 pt-16 lg:pt-20 pb-8">
        {/* Main content */}
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-0">
          {/* Brand Column */}
          <div className="lg:w-[28%] flex flex-col">
            <span className="font-heading font-bold text-[48px] leading-[56px] tracking-[-0.02em] text-white">
              Atelier
            </span>
            <p className="font-sans font-normal text-[18px] leading-[26px] tracking-[-0.02em] text-white mt-4 max-w-[300px]">
              Timeless furniture crafted for modern living. Luxury, comfort, and quality in every detail.
            </p>
            <div className="flex items-center gap-4 mt-10">
              {socialLinks.map(({ label, href, Icon }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="hover:opacity-75 transition-opacity"
                >
                  <Icon />
                </a>
              ))}
            </div>
          </div>

          {/* Navigation Columns */}
          <div className="flex-1 grid grid-cols-2 lg:grid-cols-4 gap-8">
            {footerColumns.map((col) => (
              <div key={col.heading} className="flex flex-col gap-3">
                <span className="font-sans font-medium text-base leading-6 text-white">
                  {col.heading}
                </span>
                <ul className="flex flex-col gap-3">
                  {col.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="font-sans font-normal text-base leading-6 text-white/75 hover:text-white transition-colors"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Divider + Bottom Bar */}
        <div className="mt-16 lg:mt-20">
          <div className="border-t border-white/75 mb-6" />
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <p className="font-sans font-medium text-base leading-6 text-white">
              © 2026 Atelier Furniture. All rights reserved.
            </p>
            <div className="flex items-center gap-6 flex-wrap">
              <Link
                href="/privacy"
                className="font-sans font-medium text-base leading-6 text-white hover:text-white/75 transition-colors"
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms"
                className="font-sans font-medium text-base leading-6 text-white hover:text-white/75 transition-colors"
              >
                Terms of Service
              </Link>
              <Link
                href="/cookies"
                className="font-sans font-medium text-base leading-6 text-white hover:text-white/75 transition-colors"
              >
                Cookie Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

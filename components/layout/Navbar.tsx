"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, ShoppingCart, Headphones, User, Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Shop", href: "/shop" },
  { label: "Collections", href: "/collections" },
  { label: "New In", href: "/new-in" },
];

export function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <>
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
          scrolled || mobileOpen
            ? "bg-white/95 backdrop-blur-sm border-b border-black/[0.06] shadow-sm"
            : "bg-transparent",
        )}
      >
        <div className="max-w-[1440px] mx-auto px-5 sm:px-10 lg:px-20">
          <div className="flex items-center justify-between h-[88px]">
            <Link
              href="/"
              className="font-heading font-bold text-[32px] leading-10 tracking-[-0.02em] text-black shrink-0"
            >
              Atelier
            </Link>

            <nav className="hidden lg:flex items-center gap-10">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "font-sans text-base leading-6 transition-colors",
                    isActive(link.href)
                      ? "font-semibold text-atelier-accent"
                      : "font-normal text-black hover:text-atelier-accent",
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            <div className="hidden lg:flex items-center gap-5">
              <button
                aria-label="Search"
                className="text-black hover:text-atelier-accent transition-colors"
              >
                <Search size={24} strokeWidth={1.5} />
              </button>
              <Link
                href="/cart"
                aria-label="Cart"
                className="text-black hover:text-atelier-accent transition-colors"
              >
                <ShoppingCart size={24} strokeWidth={1.5} />
              </Link>
              <Link
                href="/contact"
                aria-label="Contact"
                className="text-black hover:text-atelier-accent transition-colors"
              >
                <Headphones size={24} strokeWidth={1.5} />
              </Link>
              <Link
                href="/account"
                aria-label="Account"
                className="text-black hover:text-atelier-accent transition-colors"
              >
                <User size={24} strokeWidth={1.5} />
              </Link>
            </div>

            {/* Mobile: cart + hamburger */}
            <div className="flex lg:hidden items-center gap-4">
              <Link href="/cart" aria-label="Cart" className="text-black">
                <ShoppingCart size={22} strokeWidth={1.5} />
              </Link>
              <button
                onClick={() => setMobileOpen((o) => !o)}
                aria-label={mobileOpen ? "Close menu" : "Open menu"}
                className="text-black"
              >
                {mobileOpen ? (
                  <X size={24} strokeWidth={1.5} />
                ) : (
                  <Menu size={24} strokeWidth={1.5} />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Drawer — always white regardless of scroll state */}
        {mobileOpen && (
          <div className="lg:hidden border-t border-black/[0.06] bg-white">
            <div className="max-w-[1440px] mx-auto px-5 sm:px-10 pt-4 pb-8 flex flex-col">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "font-sans text-base leading-6 py-4 border-b border-black/[0.06] last:border-b-0 transition-colors",
                    isActive(link.href)
                      ? "font-semibold text-atelier-accent"
                      : "font-normal text-black",
                  )}
                >
                  {link.label}
                </Link>
              ))}
              <div className="flex items-center gap-6 pt-6">
                <button
                  aria-label="Search"
                  className="text-black hover:text-atelier-accent transition-colors"
                >
                  <Search size={22} strokeWidth={1.5} />
                </button>
                <Link
                  href="/contact"
                  aria-label="Contact"
                  className="text-black hover:text-atelier-accent transition-colors"
                >
                  <Headphones size={22} strokeWidth={1.5} />
                </Link>
                <Link
                  href="/account"
                  aria-label="Account"
                  className="text-black hover:text-atelier-accent transition-colors"
                >
                  <User size={22} strokeWidth={1.5} />
                </Link>
              </div>
            </div>
          </div>
        )}
      </header>

      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/20 lg:hidden"
          style={{ top: 88 }}
          onClick={() => setMobileOpen(false)}
        />
      )}
    </>
  );
}

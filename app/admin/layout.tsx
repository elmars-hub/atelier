"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useMe, useLogout } from "@/lib/hooks/admin/use-auth";
import { Button } from "@/components/ui/button";
import { useConfirmDialog } from "@/components/confirm-dialog";
import { LoadingSpinner } from "@/components/admin/util/loading";
import { navItems } from "@/lib/admin-nav";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: user, isLoading, isError } = useMe();
  const logout = useLogout();
  const { confirm, dialog } = useConfirmDialog();

  const isLoginPage = pathname === "/admin/login";

  if (isLoginPage) {
    return <>{children}</>;
  }

  if (isLoading) {
    return (
      <div className="h-screen bg-atelier-bg flex overflow-hidden">
        <aside className="w-60 bg-white border-r border-gray-200/60 flex flex-col shrink-0">
          <div className="px-5 py-5 border-b border-gray-200/60 shrink-0">
            <h1 className="font-heading text-xl font-medium text-atelier-ink tracking-tight">
              Atelier
            </h1>
            <p className="text-[10px] uppercase tracking-[0.2em] text-atelier-accent mt-0.5">
              Admin Panel
            </p>
          </div>
          <nav className="flex-1 px-3 py-4 space-y-0.5">
            {navItems.map((item) => (
              <div
                key={item.href}
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-atelier-stone"
              >
                <svg
                  className="w-4 h-4 shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d={item.icon}
                  />
                </svg>
                {item.label}
              </div>
            ))}
          </nav>
        </aside>
        <main className="flex-1 flex items-center justify-center">
          <LoadingSpinner className="w-6 h-6" />
        </main>
      </div>
    );
  }

  if (isError || !user) {
    return (
      <div className="min-h-screen bg-atelier-bg flex items-center justify-center">
        <div className="text-center">
          <p className="text-atelier-stone mb-4 text-sm">
            Please log in to continue
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push("/admin/login")}
            className="cursor-pointer"
          >
            Go to login
          </Button>
        </div>
      </div>
    );
  }

  const handleLogout = () => {
    confirm({
      title: "Log out?",
      message: "You'll need to sign in again to access the admin panel.",
      confirmLabel: "Log Out",
      onConfirm: () => {
        logout.mutate(undefined, {
          onSuccess: () => {
            toast.success("Logged out successfully");
            router.push("/admin/login");
            router.refresh();
          },
        });
      },
    });
  };

  return (
    <div className="h-screen bg-atelier-bg flex overflow-hidden">
      {dialog}
      <aside className="w-60 bg-white border-r border-gray-200/60 flex flex-col shrink-0">
        <div className="px-5 py-5 border-b border-gray-200/60 shrink-0">
          <h1 className="font-heading text-xl font-medium text-atelier-ink tracking-tight">
            Atelier
          </h1>
          <p className="text-[10px] uppercase tracking-[0.2em] text-atelier-accent mt-0.5">
            Admin Panel
          </p>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => {
            const active =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer",
                  active
                    ? "bg-black text-white"
                    : "text-atelier-stone hover:bg-gray-100/60 hover:text-atelier-ink",
                )}
              >
                <svg
                  className="w-4 h-4 shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d={item.icon}
                  />
                </svg>
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="px-3 py-3 border-t border-gray-200/60 shrink-0">
          <div className="px-3 mb-2">
            <p className="text-xs text-atelier-stone truncate">{user.email}</p>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-atelier-accent/10 text-atelier-accent mt-1">
              {user.role}
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            disabled={logout.isPending}
            className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 cursor-pointer"
          >
            {logout.isPending ? "Logging out..." : "Log Out"}
          </Button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}

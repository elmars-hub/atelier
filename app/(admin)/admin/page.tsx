"use client";

import Link from "next/link";
import { useProducts } from "@/lib/hooks/admin/use-products";
import { useCategories } from "@/lib/hooks/admin/use-categories";
import { useOrders } from "@/lib/hooks/admin/use-orders";
import { Button } from "@/components/ui/button";
import { CardSkeleton } from "@/components/admin/util/loading";

const statusColors: Record<string, string> = {
  pending: "bg-yellow-50 text-yellow-700",
  confirmed: "bg-blue-50 text-blue-700",
  payment_verified: "bg-indigo-50 text-indigo-700",
  preparing: "bg-purple-50 text-purple-700",
  in_transit: "bg-cyan-50 text-cyan-700",
  delivered: "bg-green-50 text-green-700",
  cancelled: "bg-red-50 text-red-700",
};

export default function AdminDashboard() {
  const { data: productsData, isLoading: productsLoading } = useProducts({
    limit: 1,
  });
  const { data: categoriesData, isLoading: categoriesLoading } =
    useCategories();
  const { data: ordersData } = useOrders({ limit: 5 });

  const stats = [
    {
      label: "Products",
      value: productsData?.total ?? 0,
      href: "/admin/products",
      loading: productsLoading,
    },
    {
      label: "Categories",
      value: categoriesData?.total ?? 0,
      href: "/admin/categories",
      loading: categoriesLoading,
    },
    {
      label: "Orders",
      value: ordersData?.total ?? 0,
      href: "/admin/orders",
      loading: false,
    },
  ];

  return (
    <div className="p-8 max-w-5xl mx-auto w-full">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h2 className="font-heading text-2xl font-medium text-atelier-ink tracking-tight">
            Dashboard
          </h2>
          <p className="text-sm text-atelier-stone mt-1">
            Overview of your store
          </p>
        </div>
        <Link href="/admin/products/new">
          <Button
            size="lg"
            className="cursor-pointer bg-black text-white hover:bg-black/90"
          >
            + New Product
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="bg-white rounded-xl border border-gray-200/60 p-6 hover:border-atelier-accent/30 hover:shadow-sm transition-all cursor-pointer"
          >
            {stat.loading ? (
              <CardSkeleton />
            ) : (
              <>
                <p className="text-xs uppercase tracking-wider text-atelier-stone mb-2">
                  {stat.label}
                </p>
                <p className="text-3xl font-bold text-atelier-ink font-heading">
                  {stat.value}
                </p>
              </>
            )}
          </Link>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-200/60 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200/60">
          <h3 className="font-semibold text-atelier-ink">Recent Orders</h3>
        </div>
        <div className="divide-y divide-gray-100">
          {ordersData?.data?.length ? (
            ordersData.data.map((order) => (
              <Link
                key={order.id}
                href={`/admin/orders/${order.id}`}
                className="flex items-center justify-between px-6 py-4 hover:bg-gray-50/50 cursor-pointer transition-colors"
              >
                <div>
                  <p className="font-medium text-atelier-ink text-sm">
                    {order.order_number}
                  </p>
                  <p className="text-xs text-atelier-stone mt-0.5">
                    ${order.total.toFixed(2)}
                  </p>
                </div>
                <span
                  className={`text-[10px] font-medium px-2.5 py-1 rounded-full uppercase tracking-wider ${
                    statusColors[order.status] ?? "bg-gray-100 text-gray-700"
                  }`}
                >
                  {order.status}
                </span>
              </Link>
            ))
          ) : (
            <p className="px-6 py-12 text-center text-sm text-atelier-stone">
              No orders yet
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

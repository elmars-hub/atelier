"use client";

import Link from "next/link";
import { useState } from "react";
import { useOrders } from "@/lib/hooks/admin/use-orders";
import { Button } from "@/components/ui/button";
import { TableRowSkeleton } from "@/components/admin/util/loading";
import { EmptyState } from "@/components/admin/util/empty-state";
import { Pagination } from "@/components/admin/util/pagination";

const statusColors: Record<string, string> = {
  pending: "bg-yellow-50 text-yellow-700",
  confirmed: "bg-blue-50 text-blue-700",
  payment_verified: "bg-indigo-50 text-indigo-700",
  preparing: "bg-purple-50 text-purple-700",
  in_transit: "bg-cyan-50 text-cyan-700",
  delivered: "bg-green-50 text-green-700",
  cancelled: "bg-red-50 text-red-700",
};

export default function OrdersPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useOrders({ page, limit: 20 });

  return (
    <div className="p-8 max-w-6xl mx-auto w-full">
      <h2 className="font-heading text-2xl font-medium text-atelier-ink tracking-tight mb-6">
        Orders
      </h2>

      <div className="bg-white rounded-xl border border-gray-200/60 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200/60 bg-gray-50/30">
              <th className="text-left px-6 py-3 text-[10px] font-medium uppercase tracking-wider text-atelier-stone">
                Order #
              </th>
              <th className="text-left px-6 py-3 text-[10px] font-medium uppercase tracking-wider text-atelier-stone">
                Total
              </th>
              <th className="text-left px-6 py-3 text-[10px] font-medium uppercase tracking-wider text-atelier-stone">
                Status
              </th>
              <th className="text-left px-6 py-3 text-[10px] font-medium uppercase tracking-wider text-atelier-stone">
                Date
              </th>
              <th className="text-right px-6 py-3 text-[10px] font-medium uppercase tracking-wider text-atelier-stone">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading ? (
              <TableRowSkeleton columns={5} />
            ) : data?.data?.length ? (
              data.data.map((order) => (
                <tr
                  key={order.id}
                  className="hover:bg-gray-50/40 transition-colors"
                >
                  <td className="px-6 py-4">
                    <p className="font-medium text-atelier-ink text-sm">
                      {order.order_number}
                    </p>
                  </td>
                  <td className="px-6 py-4 text-sm text-atelier-ink">
                    ${order.total.toFixed(2)}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider ${statusColors[order.status] ?? "bg-gray-100 text-atelier-stone"}`}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-atelier-stone">
                    {new Date(order.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link href={`/admin/orders/${order.id}`}>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="cursor-pointer"
                      >
                        View
                      </Button>
                    </Link>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-6 py-4">
                  <EmptyState
                    title="No orders yet"
                    description="Orders will appear here once customers start purchasing."
                  />
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {data && (
        <Pagination
          page={data.page}
          total={data.total}
          limit={data.limit}
          onPageChange={setPage}
        />
      )}
    </div>
  );
}

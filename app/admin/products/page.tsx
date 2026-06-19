"use client";

import Link from "next/link";
import { useState } from "react";
import { useProducts, useDeleteProduct } from "@/lib/hooks/admin/use-products";
import { Button } from "@/components/ui/button";
import { useConfirmDialog } from "@/components/confirm-dialog";
import { ImagePlaceholder } from "@/components/admin/image/placeholder";
import { TableRowSkeleton } from "@/components/admin/util/loading";
import { EmptyState } from "@/components/admin/util/empty-state";
import { Pagination } from "@/components/admin/util/pagination";
import { toast } from "sonner";

export default function ProductsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const { data, isLoading } = useProducts({ page, limit: 12, search });
  const deleteProduct = useDeleteProduct();
  const { confirm, dialog } = useConfirmDialog();

  const handleDelete = (id: string, name: string) => {
    confirm({
      title: "Delete product?",
      message: `Are you sure you want to delete "${name}"? This will also remove all its variants and images. This action cannot be undone.`,
      confirmLabel: "Delete",
      onConfirm: () => {
        deleteProduct.mutate(id, {
          onSuccess: () => toast.success("Product deleted successfully"),
          onError: (err) =>
            toast.error("Failed to delete product", {
              description: err.message,
            }),
        });
      },
    });
  };

  return (
    <div className="p-8 max-w-6xl mx-auto w-full">
      {dialog}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-heading text-2xl font-medium text-atelier-ink tracking-tight">
            Products
          </h2>
          <p className="text-sm text-atelier-stone mt-1">
            {data?.total ?? 0} total products
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

      <div className="mb-4">
        <input
          type="text"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          placeholder="Search products..."
          className="w-full max-w-md px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-atelier-accent/30 focus:border-atelier-accent outline-none transition-all cursor-text"
        />
      </div>

      <div className="bg-white rounded-xl border border-gray-200/60 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200/60 bg-gray-50/30">
              <th className="text-left px-6 py-3 text-[10px] font-medium uppercase tracking-wider text-atelier-stone">
                Product
              </th>
              <th className="text-left px-6 py-3 text-[10px] font-medium uppercase tracking-wider text-atelier-stone">
                Price
              </th>
              <th className="text-left px-6 py-3 text-[10px] font-medium uppercase tracking-wider text-atelier-stone">
                Status
              </th>
              <th className="text-right px-6 py-3 text-[10px] font-medium uppercase tracking-wider text-atelier-stone">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading ? (
              <TableRowSkeleton columns={4} />
            ) : data?.data?.length ? (
              data.data.map((product) => (
                <tr
                  key={product.id}
                  className="hover:bg-gray-50/40 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {product.cover_image_url ? (
                        <img
                          src={product.cover_image_url}
                          alt={product.name}
                          className="w-10 h-10 rounded-lg object-cover"
                        />
                      ) : (
                        <ImagePlaceholder size="sm" />
                      )}
                      <div>
                        <p className="font-medium text-atelier-ink text-sm">
                          {product.name}
                        </p>
                        <p className="text-xs text-atelier-stone">
                          {product.slug}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-medium text-atelier-ink text-sm">
                      ${product.price.toFixed(2)}
                    </span>
                    {product.discount_price && (
                      <span className="text-xs text-green-600 ml-2">
                        ${product.discount_price.toFixed(2)}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-1">
                      {product.is_available ? (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-50 text-green-700 uppercase tracking-wider">
                          Available
                        </span>
                      ) : (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-atelier-stone uppercase tracking-wider">
                          Hidden
                        </span>
                      )}
                      {product.is_featured && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-atelier-accent/10 text-atelier-accent uppercase tracking-wider">
                          Featured
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link href={`/admin/products/${product.id}`}>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="cursor-pointer"
                      >
                        Edit
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(product.id, product.name)}
                      disabled={deleteProduct.isPending}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 cursor-pointer"
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="px-6 py-4">
                  <EmptyState
                    title="No products found"
                    description="Create your first product to get started."
                    action={
                      <Link href="/admin/products/new">
                        <Button size="sm" className="cursor-pointer">
                          + New Product
                        </Button>
                      </Link>
                    }
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

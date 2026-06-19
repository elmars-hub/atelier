"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useConfirmDialog } from "@/components/confirm-dialog";
import { useDeleteVariant } from "@/lib/hooks/admin/use-variants";
import { VariantEditModal } from "@/components/admin/product/variant-edit-modal";
import { toast } from "sonner";
import type { ProductVariant, ProductImage } from "@/types/database";

type VariantWithImages = ProductVariant & { product_images: ProductImage[] };

type VariantListProps = {
  productId: string;
  variants: VariantWithImages[] | undefined;
};

export function VariantList({ productId, variants }: VariantListProps) {
  const deleteVariant = useDeleteVariant(productId);
  const { confirm, dialog } = useConfirmDialog();
  const [editingVariant, setEditingVariant] =
    useState<VariantWithImages | null>(null);

  if (!variants?.length) {
    return (
      <p className="text-sm text-gray-500 py-2">
        No variants yet. Add one below.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {dialog}
      {editingVariant && (
        <VariantEditModal
          variant={editingVariant}
          productId={productId}
          onClose={() => setEditingVariant(null)}
        />
      )}
      {variants.map((variant) => (
        <div
          key={variant.id}
          className="flex items-center gap-4 p-3 rounded-lg border border-gray-200"
        >
          {variant.image_url ? (
            <img
              src={variant.image_url}
              alt={variant.color_name}
              className="w-12 h-12 rounded-lg object-cover border border-gray-200"
            />
          ) : (
            <div
              className="w-12 h-12 rounded-lg border border-gray-300 flex items-center justify-center"
              style={{ backgroundColor: variant.color_hex }}
            >
              <span className="text-xs text-white/70">No img</span>
            </div>
          )}
          <div className="flex-1">
            <p className="font-medium text-gray-900">
              {variant.color_name}
              {variant.is_default && (
                <span className="text-xs text-gray-500 ml-2">(default)</span>
              )}
            </p>
            <p className="text-xs text-gray-500">
              {variant.stock_quantity} in stock
              {variant.price_modifier > 0 && ` · +$${variant.price_modifier}`}
              {variant.sku && ` · SKU: ${variant.sku}`}
              {variant.material && ` · ${variant.material}`}
            </p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setEditingVariant(variant)}
          >
            Edit
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              confirm({
                title: "Delete variant?",
                message: `Delete the "${variant.color_name}" variant? This will also remove its photos. This cannot be undone.`,
                confirmLabel: "Delete",
                onConfirm: () => {
                  deleteVariant.mutate(variant.id, {
                    onSuccess: () => toast.success("Variant deleted"),
                    onError: (err) =>
                      toast.error("Failed to delete variant", {
                        description: err.message,
                      }),
                  });
                },
              });
            }}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            Delete
          </Button>
        </div>
      ))}
    </div>
  );
}

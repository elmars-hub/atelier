"use client";

import { useVariants } from "@/lib/hooks/admin/use-variants";
import { useConfirmDialog } from "@/components/confirm-dialog";
import { VariantList } from "@/components/admin/product/variant-list";
import { VariantCreateForm } from "@/components/admin/product/variant-create-form";

export function ProductVariantsSection({ productId }: { productId: string }) {
  const { data: variants } = useVariants(productId);
  const { dialog } = useConfirmDialog();

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
      {dialog}
      <h3 className="font-semibold text-gray-900">Color Variants</h3>

      <VariantList productId={productId} variants={variants} />

      <VariantCreateForm productId={productId} />
    </div>
  );
}

"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  useSpecifications,
  useCreateSpecification,
  useDeleteSpecification,
} from "@/lib/hooks/admin/use-specifications";
import { ApiError } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { useConfirmDialog } from "@/components/confirm-dialog";
import { SpecEditModal } from "@/components/admin/product/spec-edit-modal";
import { toast } from "sonner";
import {
  specFormSchema,
  type SpecFormValues,
} from "@/lib/validations/products";
import type { ProductSpecification } from "@/types/database";

export function ProductSpecsSection({ productId }: { productId: string }) {
  const { data: specs } = useSpecifications(productId);
  const createSpec = useCreateSpecification(productId);
  const deleteSpec = useDeleteSpecification(productId);
  const { confirm, dialog } = useConfirmDialog();
  const [editingSpec, setEditingSpec] = useState<ProductSpecification | null>(
    null,
  );

  const specForm = useForm<SpecFormValues>({
    resolver: zodResolver(specFormSchema) as never,
    defaultValues: { label: "", value: "" },
  });

  const onSpecSubmit = (data: SpecFormValues) => {
    createSpec.mutate(data, {
      onSuccess: () => {
        toast.success("Specification added");
        specForm.reset();
      },
      onError: (err) => {
        const message = err instanceof Error ? err.message : "Unknown error";
        toast.error("Failed to add specification", { description: message });
        if (err instanceof ApiError && err.details) {
          for (const [field, messages] of Object.entries(err.details)) {
            if (field in data) {
              specForm.setError(field as keyof SpecFormValues, {
                message: messages[0],
              });
            }
          }
        }
      },
    });
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
      {dialog}
      {editingSpec && (
        <SpecEditModal
          spec={editingSpec}
          productId={productId}
          onClose={() => setEditingSpec(null)}
        />
      )}
      <h3 className="font-semibold text-gray-900">Specifications</h3>

      <div className="space-y-2">
        {specs?.length ? (
          specs.map((spec) => (
            <div
              key={spec.id}
              className="flex items-center justify-between p-3 rounded-lg border border-gray-200"
            >
              <div>
                <p className="font-medium text-gray-900 text-sm">
                  {spec.label}
                </p>
                <p className="text-sm text-gray-500">{spec.value}</p>
              </div>
              <div className="flex gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setEditingSpec(spec)}
                >
                  Edit
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    confirm({
                      title: "Delete specification?",
                      message: `Delete "${spec.label}: ${spec.value}"? This cannot be undone.`,
                      confirmLabel: "Delete",
                      onConfirm: () => {
                        deleteSpec.mutate(spec.id, {
                          onSuccess: () =>
                            toast.success("Specification deleted"),
                          onError: (err) =>
                            toast.error("Failed to delete", {
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
            </div>
          ))
        ) : (
          <p className="text-sm text-gray-500 py-2">No specifications yet.</p>
        )}
      </div>

      <form
        onSubmit={specForm.handleSubmit(onSpecSubmit)}
        className="border-t border-gray-200 pt-4 space-y-3"
      >
        {specForm.formState.errors.root && (
          <p className="text-xs text-red-500">
            {specForm.formState.errors.root.message}
          </p>
        )}
        <div className="flex gap-3">
          <div className="flex-1">
            <input
              {...specForm.register("label")}
              placeholder="Label (e.g. Dimensions)"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-black outline-none"
            />
            {specForm.formState.errors.label && (
              <p className="text-xs text-red-500 mt-1">
                {specForm.formState.errors.label.message}
              </p>
            )}
          </div>
          <div className="flex-1">
            <input
              {...specForm.register("value")}
              placeholder="Value (e.g. 80cm x 60cm)"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-black outline-none"
            />
            {specForm.formState.errors.value && (
              <p className="text-xs text-red-500 mt-1">
                {specForm.formState.errors.value.message}
              </p>
            )}
          </div>
          <Button
            type="submit"
            size="sm"
            disabled={createSpec.isPending}
            className="cursor-pointer bg-black text-white hover:bg-black/90"
          >
            {createSpec.isPending ? "Adding..." : "+ Add"}
          </Button>
        </div>
      </form>
    </div>
  );
}

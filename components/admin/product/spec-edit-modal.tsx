"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useUpdateSpecification } from "@/lib/hooks/admin/use-specifications";
import { ApiError } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  specFormSchema,
  type SpecFormValues,
} from "@/lib/validations/products";
import type { ProductSpecification } from "@/types/database";

type SpecEditModalProps = {
  spec: ProductSpecification;
  productId: string;
  onClose: () => void;
};

export function SpecEditModal({ spec, productId, onClose }: SpecEditModalProps) {
  const updateSpec = useUpdateSpecification(productId);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<SpecFormValues>({
    resolver: zodResolver(specFormSchema) as never,
    defaultValues: {
      label: spec.label,
      value: spec.value,
    },
  });

  const onSubmit = (data: SpecFormValues) => {
    updateSpec.mutate(
      { specId: spec.id, body: data },
      {
        onSuccess: () => {
          toast.success("Specification updated");
          onClose();
        },
        onError: (err) => {
          const message = err instanceof Error ? err.message : "Unknown error";
          setError("root", { message });
          toast.error("Failed to update specification", { description: message });
          if (err instanceof ApiError && err.details) {
            for (const [field, messages] of Object.entries(err.details)) {
              if (field in data) {
                setError(field as keyof SpecFormValues, {
                  message: messages[0],
                });
              }
            }
          }
        },
      },
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-xl shadow-xl border border-gray-200 w-full max-w-md p-6 mx-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Edit Specification
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl leading-none"
          >
            ×
          </button>
        </div>

        {errors.root && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
            {errors.root.message}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Label <span className="text-red-500">*</span>
            </label>
            <input
              {...register("label")}
              placeholder="e.g. Dimensions"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-atelier-accent/30 focus:border-atelier-accent outline-none"
            />
            {errors.label && (
              <p className="text-xs text-red-500 mt-1">
                {errors.label.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Value <span className="text-red-500">*</span>
            </label>
            <input
              {...register("value")}
              placeholder="e.g. 80cm x 60cm x 45cm"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-atelier-accent/30 focus:border-atelier-accent outline-none"
            />
            {errors.value && (
              <p className="text-xs text-red-500 mt-1">
                {errors.value.message}
              </p>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={updateSpec.isPending}
              className="bg-black text-white hover:bg-black/90"
            >
              {updateSpec.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

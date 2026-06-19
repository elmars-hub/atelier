"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useUpdateVariant } from "@/lib/hooks/admin/use-variants";
import { useUploadImage } from "@/lib/hooks/admin/use-images";
import { ApiError } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  variantFormSchema,
  type VariantFormValues,
} from "@/lib/validations/products";
import type { ProductVariant, ProductImage } from "@/types/database";

type VariantEditModalProps = {
  variant: ProductVariant & { product_images?: ProductImage[] };
  productId: string;
  onClose: () => void;
};

export function VariantEditModal({
  variant,
  productId,
  onClose,
}: VariantEditModalProps) {
  const updateVariant = useUpdateVariant(productId);
  const uploadImage = useUploadImage();
  const [imagePreview, setImagePreview] = useState<string | null>(
    variant.image_url ?? null,
  );
  const [imageUploading, setImageUploading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    setError,
    formState: { errors },
  } = useForm<VariantFormValues>({
    resolver: zodResolver(variantFormSchema) as never,
    defaultValues: {
      color_name: variant.color_name,
      color_hex: variant.color_hex,
      image_url: variant.image_url ?? "",
      material: variant.material ?? "",
      finish: variant.finish ?? "",
      stock_quantity: variant.stock_quantity,
      price_modifier: variant.price_modifier,
      sku: variant.sku ?? "",
      is_default: variant.is_default,
    },
  });

  useEffect(() => {
    reset({
      color_name: variant.color_name,
      color_hex: variant.color_hex,
      image_url: variant.image_url ?? "",
      material: variant.material ?? "",
      finish: variant.finish ?? "",
      stock_quantity: variant.stock_quantity,
      price_modifier: variant.price_modifier,
      sku: variant.sku ?? "",
      is_default: variant.is_default,
    });
  }, [variant, reset]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File too large", { description: "Maximum size is 5MB" });
      return;
    }

    setImageUploading(true);
    try {
      const { url } = await uploadImage.mutateAsync({
        file,
        path: `variants/${productId}`,
      });
      setValue("image_url", url);
      setImagePreview(url);
      toast.success("Image uploaded");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      toast.error("Failed to upload image", { description: message });
    } finally {
      setImageUploading(false);
    }
  };

  const onSubmit = (data: VariantFormValues) => {
    const payload: Record<string, unknown> = {
      color_name: data.color_name,
      color_hex: data.color_hex,
      image_url: data.image_url || null,
      material: data.material || null,
      finish: data.finish || null,
      sku: data.sku || null,
      is_default: data.is_default,
      stock_quantity:
        typeof data.stock_quantity === "number" ? data.stock_quantity : 0,
      price_modifier:
        typeof data.price_modifier === "number" ? data.price_modifier : 0,
    };

    updateVariant.mutate(
      { variantId: variant.id, body: payload },
      {
        onSuccess: () => {
          toast.success("Variant updated successfully");
          onClose();
        },
        onError: (err) => {
          const message = err instanceof Error ? err.message : "Unknown error";
          setError("root", { message });
          toast.error("Failed to update variant", { description: message });
          if (err instanceof ApiError && err.details) {
            for (const [field, messages] of Object.entries(err.details)) {
              if (field in data) {
                setError(field as keyof VariantFormValues, {
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
      <div className="relative bg-white rounded-xl shadow-xl border border-gray-200 w-full max-w-lg p-6 mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Edit Variant</h3>
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
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Color Name <span className="text-red-500">*</span>
              </label>
              <input
                {...register("color_name")}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-atelier-accent/30 focus:border-atelier-accent outline-none"
              />
              {errors.color_name && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.color_name.message}
                </p>
              )}
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Color Swatch <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  {...register("color_hex")}
                  className="w-12 h-9 border border-gray-300 rounded-lg cursor-pointer"
                />
                <span className="text-xs text-gray-500">
                  {variant.color_hex}
                </span>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Variant Image
            </label>
            <div className="flex items-start gap-4">
              <div className="shrink-0">
                {imagePreview ? (
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="Variant"
                      className="w-24 h-24 rounded-lg object-cover border border-gray-200"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setImagePreview(null);
                        setValue("image_url", "");
                      }}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center shadow"
                    >
                      ×
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 transition-colors">
                    <svg
                      className="w-6 h-6 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    <span className="text-xs text-gray-500 mt-1">Upload</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={imageUploading}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
              <p className="text-xs text-gray-500 pt-2">
                {imageUploading
                  ? "Uploading..."
                  : "Main image for this color variant. Click × to remove, or upload a new one."}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Stock Quantity
              </label>
              <input
                type="number"
                min="0"
                {...register("stock_quantity", { valueAsNumber: true })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-atelier-accent/30 focus:border-atelier-accent outline-none"
              />
              {errors.stock_quantity && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.stock_quantity.message}
                </p>
              )}
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Price Modifier ($)
              </label>
              <input
                type="number"
                step="0.01"
                {...register("price_modifier", { valueAsNumber: true })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-atelier-accent/30 focus:border-atelier-accent outline-none"
              />
              {errors.price_modifier && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.price_modifier.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Material
              </label>
              <input
                {...register("material")}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-atelier-accent/30 focus:border-atelier-accent outline-none"
                placeholder="e.g. Oak Wood"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                SKU
              </label>
              <input
                {...register("sku")}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-atelier-accent/30 focus:border-atelier-accent outline-none"
                placeholder="e.g. CHR-WAL-001"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Finish
            </label>
            <input
              {...register("finish")}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-atelier-accent/30 focus:border-atelier-accent outline-none"
              placeholder="e.g. Matte"
            />
          </div>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              {...register("is_default")}
              className="w-4 h-4"
            />
            <span className="text-sm text-gray-700">
              Show as default color on product page
            </span>
          </label>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={updateVariant.isPending}
              className="bg-black text-white hover:bg-black/90"
            >
              {updateVariant.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

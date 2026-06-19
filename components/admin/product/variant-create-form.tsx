"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCreateVariant } from "@/lib/hooks/admin/use-variants";
import { useUploadImage } from "@/lib/hooks/admin/use-images";
import { ApiError } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  variantFormSchema,
  type VariantFormValues,
} from "@/lib/validations/products";

export function VariantCreateForm({ productId }: { productId: string }) {
  const createVariant = useCreateVariant(productId);
  const uploadImage = useUploadImage();

  const [variantImagePreview, setVariantImagePreview] = useState<string | null>(
    null,
  );
  const [variantImageFile, setVariantImageFile] = useState<File | null>(null);
  const [variantUploading, setVariantUploading] = useState(false);

  const variantForm = useForm<VariantFormValues>({
    resolver: zodResolver(variantFormSchema) as never,
    defaultValues: {
      color_name: "",
      color_hex: "#000000",
      image_url: "",
      stock_quantity: 0,
      price_modifier: 0,
      is_default: false,
    },
  });

  const handleImagePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setVariantImageFile(file);
    setVariantImagePreview(URL.createObjectURL(file));
  };

  const onSubmit = async (data: VariantFormValues) => {
    let uploadedImageUrl: string | null = null;

    if (variantImageFile) {
      if (variantImageFile.size > 5 * 1024 * 1024) {
        variantForm.setError("root", { message: "Image too large (max 5MB)" });
        toast.error("Image too large", { description: "Maximum size is 5MB" });
        return;
      }

      setVariantUploading(true);
      try {
        const { url } = await uploadImage.mutateAsync({
          file: variantImageFile,
          path: `variants/${productId}`,
        });
        uploadedImageUrl = url;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        variantForm.setError("root", { message });
        toast.error("Failed to upload variant image", { description: message });
        setVariantUploading(false);
        return;
      }
      setVariantUploading(false);
    }

    createVariant.mutate(
      {
        ...data,
        image_url: uploadedImageUrl,
        material: data.material || null,
        finish: data.finish || null,
        sku: data.sku || null,
        stock_quantity:
          typeof data.stock_quantity === "number" ? data.stock_quantity : 0,
        price_modifier:
          typeof data.price_modifier === "number" ? data.price_modifier : 0,
      },
      {
        onSuccess: () => {
          toast.success("Variant added successfully");
          variantForm.reset();
          setVariantImageFile(null);
          setVariantImagePreview(null);
        },
        onError: (err) => {
          const message = err instanceof Error ? err.message : "Unknown error";
          variantForm.setError("root", { message });
          toast.error("Failed to add variant", { description: message });
          if (err instanceof ApiError && err.details) {
            for (const [field, messages] of Object.entries(err.details)) {
              if (field in data) {
                variantForm.setError(field as keyof VariantFormValues, {
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
    <form
      onSubmit={variantForm.handleSubmit(onSubmit)}
      className="border-t border-gray-200 pt-4 space-y-4"
    >
      <h4 className="text-sm font-medium text-gray-700">
        Add New Color Variant
      </h4>

      {variantForm.formState.errors.root && (
        <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
          {variantForm.formState.errors.root.message}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-gray-600 mb-1">
            Color Name <span className="text-red-500">*</span>
          </label>
          <input
            {...variantForm.register("color_name")}
            placeholder="e.g. Walnut Brown"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-black outline-none"
          />
          {variantForm.formState.errors.color_name && (
            <p className="text-xs text-red-500 mt-1">
              {variantForm.formState.errors.color_name.message}
            </p>
          )}
        </div>
        <div>
          <label className="block text-xs text-gray-600 mb-1">
            Color Swatch <span className="text-red-500">*</span>
          </label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              {...variantForm.register("color_hex")}
              className="w-12 h-9 border border-gray-300 rounded-lg cursor-pointer"
            />
            <span className="text-xs text-gray-500">
              Pick the color that matches this variant
            </span>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-xs text-gray-600 mb-1">
          Variant Image
        </label>
        <div className="flex items-start gap-4">
          <div className="shrink-0">
            {variantImagePreview ? (
              <div className="relative">
                <img
                  src={variantImagePreview}
                  alt="Preview"
                  className="w-24 h-24 rounded-lg object-cover border border-gray-200"
                />
                <button
                  type="button"
                  onClick={() => {
                    setVariantImageFile(null);
                    setVariantImagePreview(null);
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
                  onChange={handleImagePick}
                  className="hidden"
                />
              </label>
            )}
          </div>
          <p className="text-xs text-gray-500 pt-2">
            Upload a photo of this color variant. This will be the main image
            shown to customers. You can add more photos after creating the
            variant.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-gray-600 mb-1">
            How many in stock?
          </label>
          <input
            type="number"
            min="0"
            {...variantForm.register("stock_quantity", {
              valueAsNumber: true,
            })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-black outline-none"
            placeholder="0"
          />
          {variantForm.formState.errors.stock_quantity && (
            <p className="text-xs text-red-500 mt-1">
              {variantForm.formState.errors.stock_quantity.message}
            </p>
          )}
          <p className="text-xs text-gray-400 mt-1">
            How many of this color do you have available?
          </p>
        </div>
        <div>
          <label className="block text-xs text-gray-600 mb-1">
            Extra cost (optional)
          </label>
          <input
            type="number"
            step="0.01"
            {...variantForm.register("price_modifier", {
              valueAsNumber: true,
            })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-black outline-none"
            placeholder="0.00"
          />
          {variantForm.formState.errors.price_modifier && (
            <p className="text-xs text-red-500 mt-1">
              {variantForm.formState.errors.price_modifier.message}
            </p>
          )}
          <p className="text-xs text-gray-400 mt-1">
            Add extra to the base price for this color (e.g. 50 = +$50)
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-gray-600 mb-1">
            Material (optional)
          </label>
          <input
            {...variantForm.register("material")}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-black outline-none"
            placeholder="e.g. Oak Wood"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-600 mb-1">
            SKU (optional)
          </label>
          <input
            {...variantForm.register("sku")}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-black outline-none"
            placeholder="e.g. CHR-WAL-001"
          />
          <p className="text-xs text-gray-400 mt-1">
            Internal product code for tracking
          </p>
        </div>
      </div>

      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          {...variantForm.register("is_default")}
          className="w-4 h-4"
        />
        <span className="text-sm">
          Show this color as the default on the product page
        </span>
      </label>

      <Button
        type="submit"
        size="sm"
        disabled={createVariant.isPending || variantUploading}
      >
        {variantUploading
          ? "Uploading image..."
          : createVariant.isPending
            ? "Adding..."
            : "+ Add Variant"}
      </Button>
    </form>
  );
}

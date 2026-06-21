"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useCreateProduct } from "@/lib/hooks/admin/use-products";
import { useCategories } from "@/lib/hooks/admin/use-categories";
import { useUploadImage } from "@/lib/hooks/admin/use-images";
import { ApiError } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  createProductSchema,
  slugify,
  type CreateProductInput,
} from "@/lib/validations/products";

type ProductValues = CreateProductInput;

export default function NewProductPage() {
  const router = useRouter();
  const createProduct = useCreateProduct();
  const uploadImage = useUploadImage();
  const { data: categoriesData } = useCategories({ search: "" });
  const [coverUploading, setCoverUploading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    setError,
    formState: { errors },
  } = useForm<ProductValues>({
    resolver: zodResolver(createProductSchema) as never,
    defaultValues: {
      is_available: true,
      is_featured: false,
      category_id: null,
      cover_image_url: "",
    },
  });

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCoverUploading(true);
    try {
      const { url } = await uploadImage.mutateAsync({
        file,
        path: "covers",
      });
      setValue("cover_image_url", url);
    } catch (err) {
      if (err instanceof ApiError) {
        setError("cover_image_url", { message: err.message });
      }
    } finally {
      setCoverUploading(false);
    }
  };

  const onSubmit = (data: ProductValues) => {
    const payload = {
      ...data,
      cover_image_url: data.cover_image_url || null,
      category_id: data.category_id || null,
      discount_price:
        typeof data.discount_price === "number" ? data.discount_price : null,
      description: data.description || null,
      cta_description: data.cta_description || null,
      care_guide: data.care_guide || null,
      brand: data.brand || null,
    };

    createProduct.mutate(payload, {
      onSuccess: (product) => {
        router.push(`/admin/products/${product.id}`);
      },
      onError: (err) => {
        const message = err instanceof Error ? err.message : "Unknown error";
        setError("root", { message });
        toast.error("Failed to create product", { description: message });
        if (err instanceof ApiError && err.details) {
          for (const [field, messages] of Object.entries(err.details)) {
            if (field in data) {
              setError(field as keyof ProductValues, { message: messages[0] });
            }
          }
        }
      },
    });
  };

  return (
    <div className="p-8 max-w-4xl mx-auto w-full">
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/admin/products")}
          className="cursor-pointer"
        >
          ← Back
        </Button>
        <h2 className="font-heading text-2xl font-medium text-atelier-ink tracking-tight">
          New Product
        </h2>
      </div>

      {errors.root && (
        <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
          {errors.root.message}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="bg-white rounded-xl border border-gray-200/60 p-6 space-y-4">
          <h3 className="font-semibold text-atelier-ink">Basic Information</h3>

          <div>
            <label className="block text-xs font-medium uppercase tracking-wider text-atelier-stone mb-1.5">
              Name
            </label>
            <input
              {...register("name")}
              onChange={(e) => {
                setValue("name", e.target.value);
                setValue("slug", slugify(e.target.value));
              }}
              className="w-full px-4 py-2 bg-atelier-bg border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-atelier-accent/30 focus:border-atelier-accent outline-none transition-all cursor-text"
              placeholder="Modern Lounge Chair"
            />
            {errors.name && (
              <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium uppercase tracking-wider text-atelier-stone mb-1.5">
              Slug
            </label>
            <input
              {...register("slug")}
              className="w-full px-4 py-2 bg-atelier-bg border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-atelier-accent/30 focus:border-atelier-accent outline-none font-mono cursor-text"
              placeholder="modern-lounge-chair"
            />
            {errors.slug && (
              <p className="text-xs text-red-500 mt-1">{errors.slug.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium uppercase tracking-wider text-atelier-stone mb-1.5">
              Category
            </label>
            <select
              {...register("category_id")}
              className="w-full px-4 py-2 bg-atelier-bg border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-atelier-accent/30 focus:border-atelier-accent outline-none cursor-pointer"
            >
              <option value="">No category</option>
              {categoriesData?.data?.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium uppercase tracking-wider text-atelier-stone mb-1.5">
              Description
            </label>
            <textarea
              {...register("description")}
              rows={4}
              className="w-full px-4 py-2 bg-atelier-bg border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-atelier-accent/30 focus:border-atelier-accent outline-none transition-all cursor-text"
              placeholder="Product description..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-atelier-stone mb-1.5">
                Brand
              </label>
              <input
                {...register("brand")}
                className="w-full px-4 py-2 bg-atelier-bg border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-atelier-accent/30 focus:border-atelier-accent outline-none transition-all cursor-text"
                placeholder="Atelier"
              />
            </div>
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-atelier-stone mb-1.5">
                CTA Description
              </label>
              <input
                {...register("cta_description")}
                className="w-full px-4 py-2 bg-atelier-bg border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-atelier-accent/30 focus:border-atelier-accent outline-none transition-all cursor-text"
                placeholder="Short call-to-action"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium uppercase tracking-wider text-atelier-stone mb-1.5">
              Care Guide
            </label>
            <textarea
              {...register("care_guide")}
              rows={2}
              className="w-full px-4 py-2 bg-atelier-bg border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-atelier-accent/30 focus:border-atelier-accent outline-none transition-all cursor-text"
              placeholder="Care instructions..."
            />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200/60 p-6 space-y-4">
          <h3 className="font-semibold text-atelier-ink">Pricing</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-atelier-stone mb-1.5">
                Price ($)
              </label>
              <input
                type="number"
                step="0.01"
                {...register("price", { valueAsNumber: true })}
                className="w-full px-4 py-2 bg-atelier-bg border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-atelier-accent/30 focus:border-atelier-accent outline-none transition-all cursor-text"
                placeholder="99.99"
              />
              {errors.price && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.price.message}
                </p>
              )}
            </div>
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-atelier-stone mb-1.5">
                Discount Price ($)
              </label>
              <input
                type="number"
                step="0.01"
                {...register("discount_price", { valueAsNumber: true })}
                className="w-full px-4 py-2 bg-atelier-bg border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-atelier-accent/30 focus:border-atelier-accent outline-none transition-all cursor-text"
                placeholder="79.99"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200/60 p-6 space-y-4">
          <h3 className="font-semibold text-atelier-ink">Cover Image</h3>
          <div className="flex items-start gap-4">
            {watch("cover_image_url") ? (
              <div className="relative shrink-0">
                <img
                  src={watch("cover_image_url") ?? undefined}
                  alt="Cover preview"
                  className="w-28 h-28 rounded-lg object-cover border border-gray-200"
                />
                <button
                  type="button"
                  onClick={() => setValue("cover_image_url", "")}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center shadow"
                >
                  ×
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-28 h-28 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 transition-colors shrink-0">
                <svg
                  className="w-6 h-6 text-atelier-stone"
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
                <span className="text-xs text-atelier-stone mt-1">Upload</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleCoverUpload}
                  disabled={coverUploading}
                  className="hidden"
                />
              </label>
            )}
            <p className="text-xs text-atelier-stone pt-2">
              This is the main image shown on product cards and listings. Upload
              a high-quality photo that represents the product.
            </p>
          </div>
          {coverUploading && (
            <p className="text-xs text-atelier-stone mt-2">Uploading...</p>
          )}
        </div>

        <div className="bg-white rounded-xl border border-gray-200/60 p-6 space-y-3">
          <h3 className="font-semibold text-atelier-ink">Visibility</h3>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              {...register("is_available")}
              className="w-4 h-4 cursor-pointer"
            />
            <span className="text-sm text-atelier-ink">
              Available for purchase
            </span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              {...register("is_featured")}
              className="w-4 h-4 cursor-pointer"
            />
            <span className="text-sm text-atelier-ink">Featured product</span>
          </label>
        </div>

        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/admin/products")}
            className="cursor-pointer"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={createProduct.isPending}
            size="lg"
            className="cursor-pointer bg-black text-white hover:bg-black/90"
          >
            {createProduct.isPending ? "Creating..." : "Create Product"}
          </Button>
        </div>
      </form>
    </div>
  );
}

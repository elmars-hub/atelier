"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { useProduct, useUpdateProduct } from "@/lib/hooks/admin/use-products";
import { useCategories } from "@/lib/hooks/admin/use-categories";
import { useUploadImage } from "@/lib/hooks/admin/use-images";
import { ApiError } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { PageLoader } from "@/components/admin/util/loading";
import { ProductVariantsSection } from "@/components/admin/product/variants-section";
import { ProductSpecsSection } from "@/components/admin/product/specs-section";
import { toast } from "sonner";
import {
  editProductFormSchema,
  type EditProductFormValues,
} from "@/lib/validations/products";

type EditProductValues = EditProductFormValues;

export default function ProductDetailPage() {
  const params = useParams<{ id: string }>();
  const productId = params.id;
  const router = useRouter();
  const { data: product, isLoading } = useProduct(productId);
  const { data: categoriesData } = useCategories({ search: "" });
  const updateProduct = useUpdateProduct(productId);
  const uploadImage = useUploadImage();

  const {
    register,
    handleSubmit,
    setValue,
    setError,
    formState: { errors },
  } = useForm<EditProductValues>({
    resolver: zodResolver(editProductFormSchema) as never,
  });

  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [coverUploading, setCoverUploading] = useState(false);

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File too large", { description: "Maximum size is 5MB" });
      return;
    }

    setCoverUploading(true);
    try {
      const { url } = await uploadImage.mutateAsync({ file, path: "covers" });
      setValue("cover_image_url", url);
      setCoverPreview(url);
      toast.success("Cover image uploaded");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      toast.error("Failed to upload cover image", { description: message });
    } finally {
      setCoverUploading(false);
    }
  };

  const onProductSubmit = (data: EditProductValues) => {
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
    updateProduct.mutate(payload, {
      onSuccess: () => toast.success("Product updated successfully"),
      onError: (err) => {
        const message = err instanceof Error ? err.message : "Unknown error";
        setError("root", { message });
        toast.error("Failed to update product", { description: message });
        if (err instanceof ApiError && err.details) {
          for (const [field, messages] of Object.entries(err.details)) {
            if (field in data) {
              setError(field as keyof EditProductValues, {
                message: messages[0],
              });
            }
          }
        }
      },
    });
  };

  if (isLoading) {
    return (
      <div className="p-8">
        <PageLoader label="Loading product..." />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-500">Product not found</p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push("/admin/products")}
        >
          ← Back to products
        </Button>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto w-full space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/admin/products")}
          className="cursor-pointer"
        >
          ← Back
        </Button>
        <h2 className="font-heading text-2xl font-medium text-atelier-ink tracking-tight">
          {product.name}
        </h2>
      </div>

      <form
        onSubmit={handleSubmit(onProductSubmit)}
        className="bg-white rounded-xl border border-gray-200/60 p-6 space-y-4"
      >
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-atelier-ink">Product Details</h3>
          <Button
            type="submit"
            size="sm"
            disabled={updateProduct.isPending}
            className="cursor-pointer bg-black text-white hover:bg-black/90"
          >
            {updateProduct.isPending ? "Saving..." : "Save Changes"}
          </Button>
        </div>

        {errors.root && (
          <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
            {errors.root.message}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium uppercase tracking-wider text-atelier-stone mb-1.5">
              Name
            </label>
            <input
              defaultValue={product.name}
              {...register("name")}
              className="w-full px-4 py-2 bg-atelier-bg border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-atelier-accent/30 focus:border-atelier-accent outline-none transition-all cursor-text"
            />
          </div>
          <div>
            <label className="block text-xs font-medium uppercase tracking-wider text-atelier-stone mb-1.5">
              Slug
            </label>
            <input
              defaultValue={product.slug}
              {...register("slug")}
              className="w-full px-4 py-2 bg-atelier-bg border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-atelier-accent/30 focus:border-atelier-accent outline-none font-mono cursor-text"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium uppercase tracking-wider text-atelier-stone mb-1.5">
            Category
          </label>
          <select
            defaultValue={product.category_id ?? ""}
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
            defaultValue={product.description ?? ""}
            {...register("description")}
            rows={3}
            className="w-full px-4 py-2 bg-atelier-bg border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-atelier-accent/30 focus:border-atelier-accent outline-none transition-all cursor-text"
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium uppercase tracking-wider text-atelier-stone mb-1.5">
              Price ($)
            </label>
            <input
              type="number"
              step="0.01"
              defaultValue={product.price}
              {...register("price", { valueAsNumber: true })}
              className="w-full px-4 py-2 bg-atelier-bg border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-atelier-accent/30 focus:border-atelier-accent outline-none transition-all cursor-text"
            />
            {errors.price && (
              <p className="text-xs text-red-500 mt-1">
                {errors.price.message}
              </p>
            )}
          </div>
          <div>
            <label className="block text-xs font-medium uppercase tracking-wider text-atelier-stone mb-1.5">
              Discount ($)
            </label>
            <input
              type="number"
              step="0.01"
              defaultValue={product.discount_price ?? ""}
              {...register("discount_price", { valueAsNumber: true })}
              className="w-full px-4 py-2 bg-atelier-bg border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-atelier-accent/30 focus:border-atelier-accent outline-none transition-all cursor-text"
            />
            {errors.discount_price && (
              <p className="text-xs text-red-500 mt-1">
                {errors.discount_price.message}
              </p>
            )}
          </div>
          <div>
            <label className="block text-xs font-medium uppercase tracking-wider text-atelier-stone mb-1.5">
              Brand
            </label>
            <input
              defaultValue={product.brand ?? ""}
              {...register("brand")}
              className="w-full px-4 py-2 bg-atelier-bg border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-atelier-accent/30 focus:border-atelier-accent outline-none transition-all cursor-text"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium uppercase tracking-wider text-atelier-stone mb-1.5">
            CTA Description
          </label>
          <input
            defaultValue={product.cta_description ?? ""}
            {...register("cta_description")}
            className="w-full px-4 py-2 bg-atelier-bg border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-atelier-accent/30 focus:border-atelier-accent outline-none transition-all cursor-text"
            placeholder="Short call-to-action text shown on the storefront"
          />
        </div>

        <div>
          <label className="block text-xs font-medium uppercase tracking-wider text-atelier-stone mb-1.5">
            Care Guide
          </label>
          <textarea
            defaultValue={product.care_guide ?? ""}
            {...register("care_guide")}
            rows={2}
            className="w-full px-4 py-2 bg-atelier-bg border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-atelier-accent/30 focus:border-atelier-accent outline-none transition-all cursor-text"
            placeholder="Care instructions for this product..."
          />
        </div>

        {/* Cover Image */}
        <div>
          <label className="block text-xs font-medium uppercase tracking-wider text-atelier-stone mb-1.5">
            Cover Image
          </label>
          <div className="flex items-start gap-4">
            {product.cover_image_url || coverPreview ? (
              <div className="relative shrink-0">
                <img
                  src={coverPreview ?? product.cover_image_url ?? undefined}
                  alt="Cover"
                  className="w-28 h-28 rounded-lg object-cover border border-gray-200"
                />
                <button
                  type="button"
                  onClick={() => {
                    setCoverPreview(null);
                    setValue("cover_image_url", "");
                  }}
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

        <div className="flex gap-6">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              defaultChecked={product.is_available}
              {...register("is_available")}
              className="w-4 h-4"
            />
            <span className="text-sm text-atelier-ink">Available</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              defaultChecked={product.is_featured}
              {...register("is_featured")}
              className="w-4 h-4"
            />
            <span className="text-sm text-atelier-ink">Featured</span>
          </label>
        </div>
      </form>

      <ProductVariantsSection productId={productId} />
      <ProductSpecsSection productId={productId} />
    </div>
  );
}

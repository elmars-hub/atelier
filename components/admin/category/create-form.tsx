"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCreateCategory } from "@/lib/hooks/admin/use-categories";
import { useUploadImage } from "@/lib/hooks/admin/use-images";
import {
  createCategorySchema,
  type CreateCategoryInput,
} from "@/lib/validations/categories";
import { Button } from "@/components/ui/button";
import { ImageUpload } from "@/components/admin/image/upload";
import { toast } from "sonner";
import { useState } from "react";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function CategoryCreateForm() {
  const createCategory = useCreateCategory();
  const uploadImage = useUploadImage();

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<CreateCategoryInput>({
    resolver: zodResolver(createCategorySchema) as never,
    defaultValues: { is_active: true, display_order: 0, cover_image_url: null },
  });

  const handleImagePick = (file: File) => {
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleImageRemove = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const onSubmit = async (data: CreateCategoryInput) => {
    let uploadedUrl: string | null = null;

    if (imageFile) {
      setUploading(true);
      try {
        const { url } = await uploadImage.mutateAsync({
          file: imageFile,
          path: "categories",
        });
        uploadedUrl = url;
      } catch (err) {
        toast.error("Failed to upload image", {
          description: err instanceof Error ? err.message : "Unknown error",
        });
        setUploading(false);
        return;
      }
      setUploading(false);
    }

    createCategory.mutate(
      {
        ...data,
        cover_image_url: uploadedUrl,
        description: data.description || null,
      },
      {
        onSuccess: () => {
          toast.success("Category created successfully");
          reset();
          handleImageRemove();
        },
        onError: (err) => {
          toast.error("Failed to create category", {
            description: err.message,
          });
        },
      },
    );
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200/60 p-6 space-y-4">
      <h3 className="font-semibold text-atelier-ink">Add Category</h3>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
        <div>
          <label
            htmlFor="cat-name"
            className="block text-xs font-medium uppercase tracking-wider text-atelier-stone mb-1.5"
          >
            Category Name <span className="text-red-500">*</span>
          </label>
          <input
            id="cat-name"
            {...register("name")}
            onChange={(e) => {
              setValue("name", e.target.value);
              setValue("slug", slugify(e.target.value));
            }}
            className="w-full px-4 py-2 bg-atelier-bg border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-atelier-accent/30 focus:border-atelier-accent outline-none transition-all cursor-text"
            placeholder="e.g. Dining Tables"
          />
          {errors.name && (
            <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="cat-slug"
            className="block text-xs font-medium uppercase tracking-wider text-atelier-stone mb-1.5"
          >
            Slug
          </label>
          <input
            id="cat-slug"
            {...register("slug")}
            className="w-full px-4 py-2 bg-atelier-bg border border-gray-200 rounded-lg focus:ring-2 focus:ring-atelier-accent/30 focus:border-atelier-accent outline-none font-mono text-sm cursor-text"
            placeholder="dining-tables"
          />
          <p className="text-xs text-atelier-stone mt-1">
            Auto-generated from name — used in URLs
          </p>
        </div>

        <div>
          <label
            htmlFor="cat-desc"
            className="block text-xs font-medium uppercase tracking-wider text-atelier-stone mb-1.5"
          >
            Description
          </label>
          <textarea
            id="cat-desc"
            {...register("description")}
            rows={2}
            className="w-full px-4 py-2 bg-atelier-bg border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-atelier-accent/30 focus:border-atelier-accent outline-none transition-all cursor-text"
            placeholder="What kind of products are in this category?"
          />
        </div>

        <ImageUpload
          preview={imagePreview}
          onPick={handleImagePick}
          onRemove={handleImageRemove}
          label="Category Image"
          description="A representative photo for this category. Shown on the storefront category page."
        />

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label
              htmlFor="cat-order"
              className="block text-xs font-medium uppercase tracking-wider text-atelier-stone mb-1.5"
            >
              Display Order
            </label>
            <input
              id="cat-order"
              type="number"
              {...register("display_order", { valueAsNumber: true })}
              className="w-full px-4 py-2 bg-atelier-bg border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-atelier-accent/30 focus:border-atelier-accent outline-none transition-all cursor-text"
            />
            <p className="text-xs text-atelier-stone mt-1">
              Lower numbers appear first
            </p>
          </div>
          <div className="flex items-end pb-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                {...register("is_active")}
                className="w-4 h-4 cursor-pointer"
              />
              <span className="text-sm text-atelier-ink">
                Visible on storefront
              </span>
            </label>
          </div>
        </div>

        <Button
          type="submit"
          size="sm"
          disabled={createCategory.isPending || uploading}
          className="cursor-pointer bg-black text-white hover:bg-black/90"
        >
          {uploading
            ? "Uploading image..."
            : createCategory.isPending
              ? "Creating..."
              : "+ Add Category"}
        </Button>
      </form>
    </div>
  );
}

"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useUpdateCategory } from "@/lib/hooks/admin/use-categories";
import { useUploadImage } from "@/lib/hooks/admin/use-images";
import {
  createCategorySchema,
  type UpdateCategoryInput,
} from "@/lib/validations/categories";
import { Button } from "@/components/ui/button";
import { ImageUpload } from "@/components/admin/image/upload";
import { ApiError } from "@/lib/api-client";
import { toast } from "sonner";
import { useState } from "react";
import type { Category } from "@/types/database";

type CategoryEditModalProps = {
  category: Category;
  onClose: () => void;
};

export function CategoryEditModal({
  category,
  onClose,
}: CategoryEditModalProps) {
  const updateCategory = useUpdateCategory();
  const uploadImage = useUploadImage();

  const [imagePreview, setImagePreview] = useState<string | null>(
    category.cover_image_url ?? null,
  );
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    setError,
    formState: { errors },
  } = useForm<UpdateCategoryInput>({
    resolver: zodResolver(createCategorySchema.partial()) as never,
    defaultValues: {
      name: category.name,
      slug: category.slug,
      description: category.description ?? "",
      cover_image_url: category.cover_image_url,
      display_order: category.display_order ?? 0,
      is_active: category.is_active,
    },
  });

  const handleImagePick = (file: File) => {
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const onSubmit = async (data: UpdateCategoryInput) => {
    let uploadedUrl: string | null | undefined = undefined;

    if (imageFile) {
      setUploading(true);
      try {
        const { url } = await uploadImage.mutateAsync({
          file: imageFile,
          path: "categories",
        });
        uploadedUrl = url;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        toast.error("Failed to upload image", { description: message });
        setUploading(false);
        return;
      }
      setUploading(false);
    }

    updateCategory.mutate(
      {
        id: category.id,
        data: {
          ...data,
          cover_image_url:
            uploadedUrl !== undefined
              ? uploadedUrl
              : (data.cover_image_url ?? null),
          description: data.description || null,
        },
      },
      {
        onSuccess: () => {
          toast.success("Category updated successfully");
          onClose();
        },
        onError: (err) => {
          const message = err instanceof Error ? err.message : "Unknown error";
          toast.error("Failed to update category", { description: message });
          if (err instanceof ApiError && err.details) {
            for (const [field, messages] of Object.entries(err.details)) {
              setError(field as keyof UpdateCategoryInput, {
                message: messages[0],
              });
            }
          }
        },
      },
    );
  };

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl border border-gray-200/60 p-6 w-full max-w-md space-y-4 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-atelier-ink">Edit Category</h3>
          <button
            onClick={onClose}
            className="text-atelier-stone hover:text-atelier-ink text-lg cursor-pointer"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          {errors.root && (
            <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
              {errors.root.message}
            </div>
          )}

          <div>
            <label className="block text-xs font-medium uppercase tracking-wider text-atelier-stone mb-1.5">
              Category Name
            </label>
            <input
              {...register("name")}
              className="w-full px-4 py-2 bg-atelier-bg border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-atelier-accent/30 focus:border-atelier-accent outline-none transition-all cursor-text"
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
            />
            {errors.slug && (
              <p className="text-xs text-red-500 mt-1">{errors.slug.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium uppercase tracking-wider text-atelier-stone mb-1.5">
              Description
            </label>
            <textarea
              {...register("description")}
              rows={2}
              className="w-full px-4 py-2 bg-atelier-bg border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-atelier-accent/30 focus:border-atelier-accent outline-none transition-all cursor-text"
            />
          </div>

          <ImageUpload
            preview={imagePreview}
            onPick={handleImagePick}
            onRemove={() => {
              setImageFile(null);
              setImagePreview(null);
              setValue("cover_image_url", null);
            }}
            label="Category Image"
            description="A representative photo for this category."
          />

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-atelier-stone mb-1.5">
                Display Order
              </label>
              <input
                type="number"
                {...register("display_order", { valueAsNumber: true })}
                className="w-full px-4 py-2 bg-atelier-bg border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-atelier-accent/30 focus:border-atelier-accent outline-none transition-all cursor-text"
              />
            </div>
            <div className="flex items-end pb-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  {...register("is_active")}
                  className="w-4 h-4 cursor-pointer"
                />
                <span className="text-sm text-atelier-ink">Visible</span>
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              className="cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={updateCategory.isPending || uploading}
              className="cursor-pointer bg-black text-white hover:bg-black/90"
            >
              {uploading
                ? "Uploading..."
                : updateCategory.isPending
                  ? "Saving..."
                  : "Save Changes"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

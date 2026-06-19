"use client";

import { useDeleteCategory } from "@/lib/hooks/admin/use-categories";
import { Button } from "@/components/ui/button";
import { useConfirmDialog } from "@/components/confirm-dialog";
import { ImagePlaceholder } from "@/components/admin/image/placeholder";
import { ListSkeleton } from "@/components/admin/util/loading";
import { EmptyState } from "@/components/admin/util/empty-state";
import { toast } from "sonner";
import type { Category } from "@/types/database";

type CategoryListProps = {
  categories: Category[] | undefined;
  isLoading: boolean;
  onEdit: (cat: Category) => void;
};

export function CategoryList({
  categories,
  isLoading,
  onEdit,
}: CategoryListProps) {
  const deleteCategory = useDeleteCategory();
  const { confirm, dialog } = useConfirmDialog();

  const handleDelete = (id: string, name: string) => {
    confirm({
      title: "Delete category?",
      message: `Are you sure you want to delete "${name}"? Products in this category will remain but won't have a category. This cannot be undone.`,
      confirmLabel: "Delete",
      onConfirm: () => {
        deleteCategory.mutate(id, {
          onSuccess: () => toast.success("Category deleted"),
          onError: (err) =>
            toast.error("Failed to delete", { description: err.message }),
        });
      },
    });
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200/60 p-6">
      {dialog}
      <h3 className="font-semibold text-atelier-ink mb-4">
        Existing Categories
      </h3>
      {isLoading ? (
        <ListSkeleton />
      ) : categories?.length ? (
        <div className="space-y-2">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="flex items-center gap-3 p-3 rounded-lg border border-gray-200/60 hover:border-gray-300 transition-colors"
            >
              {cat.cover_image_url ? (
                <img
                  src={cat.cover_image_url}
                  alt={cat.name}
                  className="w-12 h-12 rounded-lg object-cover"
                />
              ) : (
                <ImagePlaceholder size="md" />
              )}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-atelier-ink text-sm truncate">
                  {cat.name}
                </p>
                <p className="text-xs text-atelier-stone">{cat.slug}</p>
              </div>
              <div className="flex items-center gap-2">
                {cat.is_active ? (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-50 text-green-700 uppercase tracking-wider">
                    Active
                  </span>
                ) : (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-atelier-stone uppercase tracking-wider">
                    Hidden
                  </span>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEdit(cat)}
                  className="cursor-pointer text-atelier-stone hover:text-atelier-ink hover:bg-gray-100"
                >
                  Edit
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(cat.id, cat.name)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 cursor-pointer"
                >
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No categories yet"
          description="Create your first category to organize products."
        />
      )}
    </div>
  );
}

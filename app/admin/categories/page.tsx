"use client";

import { useCategories } from "@/lib/hooks/admin/use-categories";
import { useConfirmDialog } from "@/components/confirm-dialog";
import { CategoryCreateForm } from "@/components/admin/category/create-form";
import { CategoryList } from "@/components/admin/category/list";
import { CategoryEditModal } from "@/components/admin/category/edit-modal";
import { useState } from "react";
import type { Category } from "@/types/database";

export default function CategoriesPage() {
  const { data, isLoading } = useCategories();
  const { dialog } = useConfirmDialog();
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  return (
    <div className="p-8 max-w-5xl mx-auto w-full">
      {dialog}
      <h2 className="font-heading text-2xl font-medium text-atelier-ink tracking-tight mb-6">
        Categories
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <CategoryCreateForm />
        <CategoryList
          categories={data?.data}
          isLoading={isLoading}
          onEdit={setEditingCategory}
        />
      </div>

      {editingCategory && (
        <CategoryEditModal
          category={editingCategory}
          onClose={() => setEditingCategory(null)}
        />
      )}
    </div>
  );
}

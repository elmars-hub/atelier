import { z } from "zod";

export const createProductSchema = z.object({
  category_id: z.string().uuid().nullable().optional(),
  name: z.string().min(1, "Name is required").max(200),
  slug: z
    .string()
    .min(1, "Slug is required")
    .max(200)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase with hyphens"),
  description: z.string().max(2000).nullable().optional(),
  cta_description: z.string().max(500).nullable().optional(),
  care_guide: z.string().max(2000).nullable().optional(),
  cover_image_url: z.string().url().nullable().optional(),
  brand: z.string().max(100).nullable().optional(),
  price: z.number().positive("Price must be positive"),
  discount_price: z.number().positive().nullable().optional(),
  is_featured: z.boolean().optional(),
  is_available: z.boolean().optional(),
});

export const updateProductSchema = createProductSchema.partial();

export const createProductSpecificationSchema = z.object({
  product_id: z.string().uuid(),
  label: z.string().min(1, "Label is required").max(100),
  value: z.string().min(1, "Value is required").max(500),
  display_order: z.number().int().min(0).optional(),
});

export const updateProductSpecificationSchema = createProductSpecificationSchema
  .omit({ product_id: true })
  .partial();

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type CreateProductSpecificationInput = z.infer<
  typeof createProductSpecificationSchema
>;
export type UpdateProductSpecificationInput = z.infer<
  typeof updateProductSpecificationSchema
>;

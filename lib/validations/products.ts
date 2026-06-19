import { z } from "zod";

const nanToUndefined = z.preprocess(
  (v) => (typeof v === "number" && Number.isNaN(v) ? undefined : v),
  z.number().optional(),
);
const nanToUndefinedInt = z.preprocess(
  (v) => (typeof v === "number" && Number.isNaN(v) ? undefined : v),
  z.number().int().min(0).optional(),
);
const nanToUndefinedPositive = z.preprocess(
  (v) => (typeof v === "number" && Number.isNaN(v) ? undefined : v),
  z.number().positive().optional(),
);

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
  price: z.preprocess(
    (v) => (typeof v === "number" && Number.isNaN(v) ? undefined : v),
    z.number().positive("Price must be a positive number"),
  ),
  discount_price: nanToUndefinedPositive,
  is_featured: z.boolean().optional(),
  is_available: z.boolean().optional(),
});

export const updateProductSchema = createProductSchema.partial();

export const createProductSpecificationSchema = z.object({
  product_id: z.string().uuid().optional(),
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

// Form schemas (used in admin UI)
export const editProductFormSchema = z.object({
  name: z.string().min(1).max(200),
  slug: z
    .string()
    .min(1)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  category_id: z.string().uuid().nullable().optional(),
  description: z.string().max(2000).optional(),
  cta_description: z.string().max(500).optional(),
  care_guide: z.string().max(2000).optional(),
  brand: z.string().max(100).optional(),
  price: nanToUndefinedPositive,
  discount_price: nanToUndefinedPositive,
  cover_image_url: z.string().url().optional().or(z.literal("")),
  is_featured: z.boolean().optional(),
  is_available: z.boolean().optional(),
});

export const variantFormSchema = z.object({
  color_name: z.string().min(1, "Color name required"),
  color_hex: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Valid hex color required"),
  image_url: z.string().url().nullable().optional().or(z.literal("")),
  material: z.string().optional(),
  finish: z.string().optional(),
  stock_quantity: nanToUndefinedInt,
  price_modifier: nanToUndefined,
  sku: z.string().optional(),
  is_default: z.boolean().optional(),
});

export const specFormSchema = z.object({
  label: z.string().min(1, "Label required"),
  value: z.string().min(1, "Value required"),
});

export type EditProductFormValues = z.infer<typeof editProductFormSchema>;
export type VariantFormValues = z.infer<typeof variantFormSchema>;
export type SpecFormValues = z.infer<typeof specFormSchema>;

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

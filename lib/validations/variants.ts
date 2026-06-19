import { z } from "zod";

const optionalNumber = z.preprocess(
  (v) => (typeof v === "number" && Number.isNaN(v) ? undefined : v),
  z.number().optional(),
);

const optionalInt = z.preprocess(
  (v) => (typeof v === "number" && Number.isNaN(v) ? undefined : v),
  z.number().int().min(0, "Must be 0 or greater").optional(),
);

export const createVariantSchema = z.object({
  product_id: z.string().uuid().optional(),
  color_name: z.string().min(1, "Color name is required").max(50),
  color_hex: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/, "Must be a valid hex color (e.g. #FF5733)"),
  image_url: z.string().url("Must be a valid URL").nullable().optional(),
  is_default: z.boolean().optional(),
  material: z.string().max(100).nullable().optional(),
  finish: z.string().max(100).nullable().optional(),
  stock_quantity: optionalInt,
  price_modifier: optionalNumber,
  sku: z.string().max(50).nullable().optional(),
});

export const updateVariantSchema = createVariantSchema
  .omit({ product_id: true })
  .partial();

export type CreateVariantInput = z.infer<typeof createVariantSchema>;
export type UpdateVariantInput = z.infer<typeof updateVariantSchema>;

export const createVariantImageSchema = z.object({
  image_url: z.string().url("Must be a valid URL"),
  display_order: z.number().int().min(0).optional(),
});

export const updateVariantImageSchema = createVariantImageSchema.partial();

export type CreateVariantImageInput = z.infer<typeof createVariantImageSchema>;
export type UpdateVariantImageInput = z.infer<typeof updateVariantImageSchema>;

import { z } from "zod";

export const wishlistSchema = z.object({
  product_id: z.string().uuid("Invalid product ID"),
});

export const orderItemSchema = z.object({
  variant_id: z.string().uuid(),
  quantity: z.number().int().positive(),
});

export const checkoutSchema = z.object({
  items: z.array(orderItemSchema).min(1, "Cart cannot be empty"),
  shipping_address: z.object({
    full_name: z.string().min(2),
    address_line_1: z.string().min(5),
    address_line_2: z.string().optional(),
    city: z.string().min(2),
    state: z.string().min(2),
    postal_code: z.string().min(2),
    country: z.string().min(2),
    phone: z.string().optional(),
  }),
});

export type WishlistInput = z.infer<typeof wishlistSchema>;
export type CheckoutInput = z.infer<typeof checkoutSchema>;

export const createReviewSchema = z.object({
  product_id: z.string().uuid("Invalid product ID"),
  rating: z
    .number()
    .int()
    .min(1, "Rating must be at least 1")
    .max(5, "Rating must be at most 5"),
  comment: z.string().max(2000).nullable().optional(),
});

export const updateReviewSchema = createReviewSchema
  .omit({ product_id: true })
  .partial();

export type CreateReviewInput = z.infer<typeof createReviewSchema>;
export type UpdateReviewInput = z.infer<typeof updateReviewSchema>;

export const updateProfileSchema = z.object({
  full_name: z.string().min(2).max(100).optional(),
  phone: z.string().max(30).nullable().optional(),
  avatar_url: z.string().url().nullable().optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

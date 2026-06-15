import { z } from "zod";

const ORDER_STATUSES = [
  "pending",
  "confirmed",
  "payment_verified",
  "preparing",
  "in_transit",
  "delivered",
  "cancelled",
] as const;

export const updateOrderStatusSchema = z.object({
  status: z.enum(ORDER_STATUSES),
  courier: z.string().max(100).nullable().optional(),
  tracking_id: z.string().max(200).nullable().optional(),
  current_location: z.string().max(200).nullable().optional(),
  destination: z.string().max(200).nullable().optional(),
  estimated_delivery: z.string().nullable().optional(),
});

export const createTrackingEventSchema = z.object({
  order_id: z.string().uuid(),
  status: z.string().min(1, "Status is required").max(50),
  label: z.string().min(1, "Label is required").max(200),
  location: z.string().max(200).nullable().optional(),
  event_time: z.string().optional(),
});

export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;
export type CreateTrackingEventInput = z.infer<
  typeof createTrackingEventSchema
>;

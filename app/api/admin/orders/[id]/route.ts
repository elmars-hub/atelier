import {
  jsonResponse,
  errorResponse,
  parseBody,
  withAdminRoute,
} from "@/lib/api-utils";
import {
  getOrderById,
  updateOrderStatus,
} from "@/lib/services/orders";
import { updateOrderStatusSchema } from "@/lib/validations/orders";

export const GET = withAdminRoute(async (request, context) => {
  const { id } = await context.params;

  try {
    const order = await getOrderById(id);
    return jsonResponse(order);
  } catch {
    return errorResponse("Order not found", 404);
  }
});

export const PATCH = withAdminRoute(async (request, context) => {
  const { id } = await context.params;

  const parsed = await parseBody(request, updateOrderStatusSchema);
  if (parsed.error) return parsed.error;

  try {
    const updated = await updateOrderStatus(id, parsed.data);
    return jsonResponse(updated);
  } catch {
    return errorResponse("Order not found or failed to update", 404);
  }
});

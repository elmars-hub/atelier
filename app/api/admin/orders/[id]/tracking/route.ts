import {
  jsonResponse,
  parseBody,
  withAdminRoute,
} from "@/lib/api-utils";
import { createTrackingEvent } from "@/lib/services/orders";
import { createTrackingEventSchema } from "@/lib/validations/orders";

export const POST = withAdminRoute(async (request, context) => {
  const { id } = await context.params;

  const parsed = await parseBody(request, createTrackingEventSchema);
  if (parsed.error) return parsed.error;

  const trackingInput = { ...parsed.data, order_id: id };

  const event = await createTrackingEvent(trackingInput);
  return jsonResponse(event, 201);
});
